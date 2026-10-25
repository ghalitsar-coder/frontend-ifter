import { describe, expect, it } from 'vitest';
import type { AttendanceCorrection, HistoryRecord } from '@/lib/api/dto';
import {
  changeFilterToStatus,
  correctionTargetOptions,
  filterRowsBySearch,
  formatDateId,
  formatTimeId,
  historyQueryFor,
  isoDayToday,
  pageMeta,
  shortHash,
  sourceLabel,
  statusNote,
  toBackendStatus,
  toCorrectionRow,
  toTrailEntry,
  toUiStatus,
  unwrapRecordDetail,
} from '@/lib/api/koreksi-absensi';
import type { CorrectionHistoryFilters } from '@/lib/api/koreksi-absensi';

const baseRecord: HistoryRecord = {
  id: 'rec-9f2a7c',
  date: '2026-10-23',
  status: 'sick',
  check_in_at: '2026-10-23T07:12:00+07:00',
  notes: 'Surat keterangan dokter',
  source: 'bulk',
  student_id: 'stu-1',
  student_number: '00829103',
  student_name: 'Dimas Saputra',
  class_id: 'cls-1',
  class_name: 'VIII A',
  academic_year_id: 'ay-1',
  academic_year_name: '2026/2027',
  closed: true,
  created_at: '2026-10-23T07:00:00+07:00',
  updated_at: '2026-10-24T09:15:00+07:00',
};

const baseCorrection: AttendanceCorrection = {
  id: 'cor-1',
  attendance_record_id: 'rec-9f2a7c',
  old_status: 'absent',
  new_status: 'sick',
  reason: 'SKD menyusul dari RSUD',
  corrected_by_user_id: 'user-abc123',
  corrected_at: '2026-10-24T09:15:00+07:00',
};

describe('status mapping', () => {
  it('maps backend statuses to UI codes', () => {
    expect({
      present: toUiStatus('present'),
      late: toUiStatus('late'),
      sick: toUiStatus('sick'),
      excused: toUiStatus('excused'),
      absent: toUiStatus('absent'),
      unknown: toUiStatus('unknown'),
    }).toStrictEqual({
      present: 'hadir',
      late: 'hadir',
      sick: 'sakit',
      excused: 'izin',
      absent: 'alpa',
      unknown: 'alpa',
    });
  });

  it('maps UI codes back to supported backend statuses', () => {
    expect({
      hadir: toBackendStatus('hadir'),
      sakit: toBackendStatus('sakit'),
      izin: toBackendStatus('izin'),
      alpa: toBackendStatus('alpa'),
      // dispensasi has no backend status — falls back to the closest one
      dispensasi: toBackendStatus('dispensasi'),
    }).toStrictEqual({
      hadir: 'present',
      sakit: 'sick',
      izin: 'excused',
      alpa: 'absent',
      dispensasi: 'excused',
    });
  });

  it('maps toolbar change filters to a history status param', () => {
    expect(changeFilterToStatus).toStrictEqual({
      all: undefined,
      alpa_sakit: 'sick',
      alpa_izin: 'excused',
      izin_hadir: 'present',
      // shortcut: no `dispensasi` status in the backend, `excused` is the nearest filter
      dispensasi: 'excused',
    });
  });

  it('exposes correction target options with unique backend values', () => {
    const values = correctionTargetOptions.map((option) => option.value);

    expect(values).toHaveLength(5);
    expect(new Set(values).size).toBe(5);
    expect(values).toStrictEqual(
      expect.arrayContaining(['present', 'late', 'sick', 'excused', 'absent']),
    );
  });
});

describe('labels and dates', () => {
  it('labels statuses and sources in Indonesian', () => {
    expect({
      late: statusNote('late'),
      present: statusNote('present'),
      weird: statusNote('weird'),
      bulk: sourceLabel('bulk'),
      other: sourceLabel('other'),
    }).toStrictEqual({
      late: 'Terlambat',
      present: 'Hadir',
      weird: 'weird',
      bulk: 'Entri Massal Guru',
      other: 'other',
    });
  });

  it('formats ISO dates without timezone drift', () => {
    expect(formatDateId('2026-10-24')).toBe('24 Okt 2026');
    expect(formatDateId('2026-10-24T09:15:00+07:00')).toBe('24 Okt 2026');
    expect(formatDateId('nope')).toBe('');
  });

  it('formats ISO times', () => {
    expect(formatTimeId('2026-10-24T09:15:00+07:00')).toBe('09.15');
    expect(formatTimeId('2026-10-24')).toBe('');
  });

  it('produces ISO day strings', () => {
    expect(isoDayToday()).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
  });
});

describe('row mapper (GET /attendance/history)', () => {
  it('maps a history record into an audit-table row', () => {
    const row = toCorrectionRow(baseRecord);

    expect({
      id: row.id,
      recordId: row.recordId,
      studentId: row.studentId,
      student: row.student,
      loggedDate: row.loggedDate,
      loggedTime: row.loggedTime,
      sessionDate: row.sessionDate,
      sessionIso: row.sessionIso,
      sessionLabel: row.sessionLabel,
      status: row.status,
      reason: row.reason,
      sourceLabel: row.sourceLabel,
    }).toStrictEqual({
      id: 'LOG-9F2A7C',
      recordId: 'rec-9f2a7c',
      studentId: 'stu-1',
      student: { name: 'Dimas Saputra', nis: '00829103', className: 'VIII A' },
      loggedDate: '24 Okt 2026',
      loggedTime: '09.15',
      sessionDate: '23 Okt 2026',
      sessionIso: '2026-10-23',
      sessionLabel: 'Absen 07.12',
      status: 'sakit',
      reason: 'Surat keterangan dokter',
      sourceLabel: 'Entri Massal Guru',
    });
    expect(row.closed).toBeTruthy();
    expect(row.isLate).toBeFalsy();
  });

  it('falls back to lock/record labels and a dash note', () => {
    const closed = toCorrectionRow({ ...baseRecord, check_in_at: undefined, notes: undefined });
    const open = toCorrectionRow({
      ...baseRecord,
      closed: false,
      check_in_at: undefined,
      notes: undefined,
    });

    expect(closed.sessionLabel).toBe('Ditutup');
    expect(open.sessionLabel).toBe('Tercatat');
    expect(open.reason).toBe('—');
  });

  it('flags late records', () => {
    expect(toCorrectionRow({ ...baseRecord, status: 'late' }).isLate).toBeTruthy();
  });
});

describe('trail mapper (record corrections)', () => {
  const evidenceHash = '9b74f9b9ff50a5bdd7d45d1e1b1c4a72e2d0c9e5f6a7b8c9d0e1f2a3b4c5d6e7';

  it('maps a backend correction into a ledger trail entry', () => {
    const entry = toTrailEntry(baseCorrection);

    expect({
      fromStatus: entry.fromStatus,
      toStatus: entry.toStatus,
      toNote: entry.toNote,
      reason: entry.reason,
      loggedDate: entry.loggedDate,
      loggedTime: entry.loggedTime,
      officerName: entry.officerName,
      evidenceHash: entry.evidenceHash,
    }).toStrictEqual({
      fromStatus: 'alpa',
      toStatus: 'sakit',
      toNote: 'Sakit',
      reason: 'SKD menyusul dari RSUD',
      loggedDate: '24 Okt 2026',
      loggedTime: '09.15',
      officerName: 'Operator c123',
      // pre-migration rows omit evidence_hash on the wire → null in the view-model
      evidenceHash: null,
    });
  });

  it('carries the server-computed evidence_hash through untouched', () => {
    expect(toTrailEntry({ ...baseCorrection, evidence_hash: evidenceHash }).evidenceHash).toBe(
      evidenceHash,
    );
    expect(toTrailEntry({ ...baseCorrection, evidence_hash: null }).evidenceHash).toBeNull();
  });

  it('notes late targets', () => {
    expect(toTrailEntry({ ...baseCorrection, new_status: 'late' }).toNote).toBe('Hadir Terlambat');
  });
});

describe(shortHash, () => {
  it('truncates long hashes keeping head and tail', () => {
    expect(shortHash('9b74f9b9ff50a5bdd7d45d1e1b1c4a72')).toBe('9b74f9b9…1b1c4a72');
  });

  it('leaves short strings untouched', () => {
    expect(shortHash('abc123')).toBe('abc123');
    expect(shortHash('1234567890123456')).toBe('1234567890123456');
  });
});

describe('record detail unwrap', () => {
  it('accepts the flat record body', () => {
    const detail = unwrapRecordDetail(
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- raw wire shape: UI history record lacks audit-only backend fields
      { ...baseRecord, corrections: [baseCorrection] } as unknown as Parameters<
        typeof unwrapRecordDetail
      >[0],
    );

    expect(detail.corrections).toHaveLength(1);
  });

  it('accepts a {record} wrapper and defaults missing corrections', () => {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- raw wire shape: wrapper-only body, no flat fields
    const wrapped = unwrapRecordDetail({
      record: { ...baseRecord },
    } as unknown as Parameters<typeof unwrapRecordDetail>[0]);

    expect(wrapped.corrections).toStrictEqual([]);
    expect(wrapped.id).toBe('rec-9f2a7c');
  });
});

describe('toolbar filters → server query', () => {
  const filters: CorrectionHistoryFilters = {
    search: 'dimas',
    change: 'alpa_sakit',
    classId: 'cls-1',
    from: '2026-10-01',
    to: '2026-10-24',
  };

  it('builds a server query from toolbar filters and page', () => {
    expect(historyQueryFor(filters, 3)).toStrictEqual({
      from: '2026-10-01',
      to: '2026-10-24',
      class_id: 'cls-1',
      status: 'sick',
      limit: 5,
      offset: 10,
    });
  });

  it('omits all/empty filters', () => {
    const query = historyQueryFor(
      { ...filters, change: 'all', classId: 'all', from: '', to: '' },
      0,
    );

    expect(query.class_id).toBeUndefined();
    expect(query.status).toBeUndefined();
    expect(query.from).toBeUndefined();
    expect(query.offset).toBe(0);
  });
});

describe('pagination meta', () => {
  it('computes bounds from the server total', () => {
    expect(pageMeta(18, 2, 5)).toStrictEqual({
      page: 2,
      totalPages: 4,
      start: 6,
      end: 10,
      total: 18,
    });
  });

  it('clamps empty and overflowing pages', () => {
    expect(pageMeta(0, 1, 0)).toStrictEqual({ page: 1, totalPages: 1, start: 0, end: 0, total: 0 });
    expect(pageMeta(3, 9, 3).page).toBe(1);
  });
});

describe('client-side row search', () => {
  it('filters the loaded page by name or NIS', () => {
    const rows = [
      toCorrectionRow(baseRecord),
      toCorrectionRow({
        ...baseRecord,
        id: 'rec-2',
        student_name: 'Nadia Azzahra',
        student_number: '00829144',
      }),
    ];

    expect(filterRowsBySearch(rows, '')).toHaveLength(2);
    expect(filterRowsBySearch(rows, 'DIMAS')).toHaveLength(1);
    expect(filterRowsBySearch(rows, '00829103')).toHaveLength(1);
    expect(filterRowsBySearch(rows, 'zzz')).toHaveLength(0);
  });
});
