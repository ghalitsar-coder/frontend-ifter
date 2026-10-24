import { describe, expect, it } from 'vitest';
import type { DisciplineRecord, DisciplineReport } from '@/lib/api/dto';
import {
  composeIncidentDescription,
  displayStatusToRecordParam,
  filterIncidentRows,
  incidentLocationFromDescription,
  initialsOf,
  pageWindow,
  periodRange,
  recordStatusToDisplay,
  reportMetrics,
  toIncidentRow,
  toWatchlist,
} from '@/lib/api/kedisiplinan';
import type { DisciplineFilterState } from '@/types/discipline';

const baseFilter: DisciplineFilterState = {
  search: '',
  selectedClass: '',
  selectedCategory: '',
  selectedStatus: '',
  selectedPeriod: 'bulan',
  quickTab: 'all',
};

const record: DisciplineRecord = {
  id: 'r-1',
  student_id: 's-1',
  student_number: '00829103',
  student_name: 'Rizky Pratama',
  class_id: 'c-1',
  class_name: 'IX A',
  category_id: 'cat-1',
  category_name: 'Perkelahian',
  occurred_at: '2026-10-05T00:25:00Z', // 07:25 WIB
  occurred_date: '2026-10-05',
  description: 'Berkelahi di kantin — Lokasi: Kantin Belakang',
  points: 50,
  status: 'in_followup',
  recorded_by_user_id: 'u-1',
  recorded_by_name: 'Drs. Agus Subagyo',
  created_at: '2026-10-05T00:30:00Z',
  updated_at: '2026-10-05T00:30:00Z',
};

describe('incident status mapping', () => {
  it('maps backend statuses to UI badges', () => {
    expect(recordStatusToDisplay('new')).toBe('baru');
    expect(recordStatusToDisplay('under_review')).toBe('tinjau');
    expect(recordStatusToDisplay('in_followup')).toBe('tindak');
    expect(recordStatusToDisplay('completed')).toBe('selesai');
    expect(recordStatusToDisplay('cancelled')).toBe('dibatalkan');
  });

  it('defaults unknown statuses to baru', () => {
    expect(recordStatusToDisplay('bogus')).toBe('baru');
  });

  it('maps UI filter values to the API status param', () => {
    expect(displayStatusToRecordParam('tindak')).toBe('in_followup');
    expect(displayStatusToRecordParam('dibatalkan')).toBe('cancelled');
    expect(displayStatusToRecordParam('')).toBeUndefined();
  });

  it('round-trips every UI status through the API value', () => {
    const uiStatuses = ['baru', 'tinjau', 'tindak', 'selesai', 'dibatalkan'];
    const back = uiStatuses.map((ui) =>
      recordStatusToDisplay(displayStatusToRecordParam(ui) ?? ''),
    );

    expect(back).toStrictEqual(uiStatuses);
  });
});

describe('period range windows', () => {
  it('covers the current month and the last 7 days', () => {
    expect(periodRange('bulan', '2026-10-05')).toStrictEqual({
      from: '2026-10-01',
      to: '2026-10-05',
    });
    expect(periodRange('7hari', '2026-10-05')).toStrictEqual({
      from: '2026-09-29',
      to: '2026-10-05',
    });
  });

  it('anchors the semester window on the academic year start', () => {
    expect(periodRange('semester', '2026-10-05', '2026-07-15')).toStrictEqual({
      from: '2026-07-15',
      to: '2026-10-05',
    });
  });

  it('falls back to the calendar year start when no academic year is loaded', () => {
    expect(periodRange('semester', '2026-10-05')).toStrictEqual({
      from: '2026-01-01',
      to: '2026-10-05',
    });
  });

  it('crosses month boundaries for the weekly window', () => {
    expect(periodRange('7hari', '2026-10-02')).toStrictEqual({
      from: '2026-09-26',
      to: '2026-10-02',
    });
  });
});

describe('description markers', () => {
  it('round-trips location and action markers', () => {
    const composed = composeIncidentDescription(
      'Terlambat 20 menit saat apel pagi.',
      'Gerbang Depan',
      'Pembinaan lisan',
    );

    expect(composed).toBe(
      'Terlambat 20 menit saat apel pagi. — Lokasi: Gerbang Depan — Tindakan: Pembinaan lisan',
    );
    expect(incidentLocationFromDescription(composed)).toBe('Gerbang Depan');
  });

  it('skips empty optional parts', () => {
    expect(composeIncidentDescription('Catatan saja.', '  ', '')).toBe('Catatan saja.');
  });

  it('defaults the location for plain descriptions', () => {
    expect(incidentLocationFromDescription('Catatan saja.')).toBe('Lingkungan Sekolah');
  });
});

describe('incident row mapping', () => {
  it('maps dates and student identity fields with WIB labels', () => {
    const row = toIncidentRow(record, 42);

    expect(row.date).toBe('05 Okt 2026');
    expect(row.time).toBe('07:25 WIB');
    expect(row.studentId).toBe('s-1');
    expect(row.studentNis).toBe('00829103');
  });

  it('maps category, status, location and totals', () => {
    const row = toIncidentRow(record, 42);

    expect(row.categoryLabel).toBe('Perkelahian (+50)');
    expect(row.location).toBe('Kantin Belakang');
    expect(row.status).toBe('tindak');
    expect(row.studentTotalPoints).toBe(42);
    expect(row.studentInitials).toBe('RP');
  });
});

describe('avatar initials', () => {
  it('takes at most two word initials', () => {
    expect(initialsOf('Nabila Aulia')).toBe('NA');
    expect(initialsOf('bagus')).toBe('B');
    expect(initialsOf('')).toBe('ST');
  });
});

describe('client-side row filtering', () => {
  const rows = [
    toIncidentRow(record, 42),
    toIncidentRow({ ...record, id: 'r-2', status: 'completed', student_name: 'Dimas Saputra' }, 8),
  ];

  it('filters by quick tabs', () => {
    expect(filterIncidentRows(rows, { ...baseFilter, quickTab: 'resolved' })).toStrictEqual([
      rows[1],
    ]);
    expect(filterIncidentRows(rows, { ...baseFilter, quickTab: 'need_action' })).toStrictEqual([
      rows[0],
    ]);
  });

  it('keeps high-point students on the high_points tab', () => {
    expect(filterIncidentRows(rows, { ...baseFilter, quickTab: 'high_points' })).toStrictEqual([
      rows[0],
    ]);
  });

  it('searches name, nis and description', () => {
    expect(filterIncidentRows(rows, { ...baseFilter, search: 'dimas' })).toHaveLength(1);
    expect(filterIncidentRows(rows, { ...baseFilter, search: '00829103' })).toHaveLength(2);
    expect(filterIncidentRows(rows, { ...baseFilter, search: 'zzz' })).toHaveLength(0);
  });
});

describe('guidance watchlist derivation', () => {
  const rows = [
    toIncidentRow(record, 42),
    toIncidentRow({ ...record, id: 'r-9', student_name: 'Rizky Pratama' }, 42),
    toIncidentRow(
      {
        ...record,
        id: 'r-3',
        student_id: 's-3',
        student_name: 'Aldo Firmansyah',
        student_number: '440',
      },
      55,
    ),
    toIncidentRow(
      { ...record, id: 'r-4', student_id: 's-4', student_name: 'Kecil B', student_number: '7' },
      12,
    ),
  ];

  it('keeps unique students at or above 30 points sorted desc', () => {
    const names = toWatchlist(rows).map((student) => student.name);

    expect(names).toStrictEqual(['Aldo Firmansyah', 'Rizky Pratama']);
  });

  it('assigns risk tiers and actions from the point total', () => {
    const list = toWatchlist(rows);

    expect(list[0]?.riskLevel).toBe('tinggi');
    expect(list[0]?.actionType).toBe('parent_call');
    expect(list[1]?.riskLevel).toBe('waspada');
    expect(list[1]?.actionType).toBe('schedule_bk');
  });

  it('formats the class label for the sidebar card', () => {
    expect(toWatchlist(rows)[1]?.className).toBe('Kelas IX A');
  });
});

describe('KPI report metrics', () => {
  const report = {
    total_records: 42,
    cancelled_records: 2,
    total_points: 186,
    by_category: [],
    by_status: [
      { status: 'new', count: 5 },
      { status: 'under_review', count: 2 },
      { status: 'in_followup', count: 1 },
      { status: 'completed', count: 32 },
      { status: 'cancelled', count: 2 },
    ],
    data: [],
  } as DisciplineReport;

  it('derives totals and the open/resolved split from by_status', () => {
    expect(reportMetrics(report)).toStrictEqual({
      totalIncidents: 42,
      accumulatedPoints: 186,
      needActionCount: 8,
      resolvedCount: 32,
    });
  });
});

describe('pagination window', () => {
  it('never returns an empty window', () => {
    expect(pageWindow(1, 0)).toStrictEqual([1]);
    expect(pageWindow(1, 3)).toStrictEqual([1, 2, 3]);
  });

  it('caps at 5 pages and clamps near both ends', () => {
    expect(pageWindow(1, 10)).toStrictEqual([1, 2, 3, 4, 5]);
    expect(pageWindow(5, 10)).toStrictEqual([3, 4, 5, 6, 7]);
    expect(pageWindow(10, 10)).toStrictEqual([6, 7, 8, 9, 10]);
  });
});
