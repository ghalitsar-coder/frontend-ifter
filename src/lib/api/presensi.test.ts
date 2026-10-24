import { describe, expect, it } from 'vitest';
import type { Class, RosterStudent } from '@/lib/api/dto';
import type { DraftOverlay } from '@/lib/api/presensi';
import {
  applyDrafts,
  backendStatusByStudent,
  collectDrafts,
  mapRosterStudent,
  pickDefaultClass,
  toBackendStatus,
  toBulkInput,
  toUiStatus,
  todayIso,
} from '@/lib/api/presensi';

const studentRow = (overrides?: Partial<RosterStudent>): RosterStudent => ({
  student_id: 's-1',
  student_number: '20260001',
  full_name: 'Rizky Pratama',
  enrollment_id: 'e-1',
  ...overrides,
});

const recordedRow = (): RosterStudent =>
  studentRow({
    record: {
      id: 'r-1',
      student_id: 's-1',
      enrollment_id: 'e-1',
      date: '2026-08-24',
      status: 'late',
      check_in_at: '2026-08-24T00:40:00Z',
      notes: 'Kartu tertinggal',
      source: 'manual',
      recorded_by_user_id: 'u-1',
      updated_by_user_id: 'u-1',
      created_at: '2026-08-24T00:40:00Z',
      updated_at: '2026-08-24T00:40:00Z',
    },
  });

describe('status mapper', () => {
  it('maps every backend status to the UI enum (late collapses into hadir)', () => {
    const mapped = (['present', 'late', 'sick', 'excused', 'absent'] as const).map(toUiStatus);
    expect(mapped).toStrictEqual(['hadir', 'hadir', 'sakit', 'izin', 'alpa']);
  });

  it('maps UI status back and preserves late', () => {
    const mapped = [
      toBackendStatus('hadir'),
      toBackendStatus('hadir', 'late'),
      toBackendStatus('hadir', 'present'),
      toBackendStatus('sakit'),
      toBackendStatus('izin'),
      toBackendStatus('alpa'),
    ];
    expect(mapped).toStrictEqual(['present', 'late', 'present', 'sick', 'excused', 'absent']);
  });
});

describe('roster row mapper', () => {
  it('maps a recorded row', () => {
    const row = mapRosterStudent(recordedRow(), 4);
    expect(row.id).toBe('s-1');
    expect(row.status).toBe('hadir');
    expect(row.notes).toBe('Kartu tertinggal');
    expect(row.source).toBe('manual');
    expect(row.documentName).toBeUndefined();
  });

  it('derives display identity fields', () => {
    const row = mapRosterStudent(studentRow(), 4);
    expect([row.name, row.nisn, row.absentNumber, row.initials]).toStrictEqual([
      'Rizky Pratama',
      '20260001',
      5,
      'RP',
    ]);
  });

  it('formats recorded timestamps', () => {
    const row = mapRosterStudent(recordedRow(), 0);
    expect(row.timestamp).toMatch(/^\d{2}:\d{2} WIB$/u);
  });

  it('shows unrecorded rows as alpa with placeholder timestamp', () => {
    const row = mapRosterStudent(studentRow(), 0);
    expect([row.status, row.timestamp, row.notes]).toStrictEqual(['alpa', 'Belum Terdeteksi', '']);
  });
});

describe('draft overlays', () => {
  const base = [
    mapRosterStudent(studentRow(), 0),
    mapRosterStudent(studentRow({ student_id: 's-2', full_name: 'Alya Putri' }), 1),
  ];

  it('applyDrafts overlays only edited rows', () => {
    const drafts: Record<string, DraftOverlay> = {
      's-1': { status: 'sakit', notes: 'Surat dokter', timestamp: 'Baru saja', source: 'Manual' },
    };
    const view = applyDrafts(base, drafts);
    expect([view[0]?.status, view[0]?.notes, view[1]?.status]).toStrictEqual([
      'sakit',
      'Surat dokter',
      'alpa',
    ]);
  });

  it('collectDrafts returns only touched students with original statuses', () => {
    const originals = { 's-1': 'late' as const };
    const drafts: Record<string, DraftOverlay> = {
      's-2': { status: 'hadir', notes: '', timestamp: 'Baru saja', source: 'Manual' },
    };
    const dirty = collectDrafts(drafts, originals);
    expect(dirty).toStrictEqual([
      { studentId: 's-2', status: 'hadir', notes: '', originalStatus: undefined },
    ]);
  });

  it('backendStatusByStudent only includes recorded rows', () => {
    const statuses = backendStatusByStudent([recordedRow(), studentRow({ student_id: 's-2' })]);
    expect(statuses).toStrictEqual({ 's-1': 'late' });
  });
});

describe('bulk payload builder', () => {
  it('omits blank notes and preserves late→hadir as late', () => {
    const input = toBulkInput({ class_id: 'c-1', date: '2026-08-24' }, [
      { studentId: 's-1', status: 'hadir', notes: '  ', originalStatus: 'late' },
      { studentId: 's-2', status: 'izin', notes: ' Lomba FLS2N ' },
    ]);
    expect(input.records).toStrictEqual([
      { student_id: 's-1', status: 'late' },
      { student_id: 's-2', status: 'excused', notes: 'Lomba FLS2N' },
    ]);
    expect([input.class_id, input.date]).toStrictEqual(['c-1', '2026-08-24']);
  });
});

describe('class default picker', () => {
  it('prefers an active class', () => {
    const classes: Class[] = [
      {
        id: 'c-1',
        name: 'A',
        status: 'archived',
        academic_year_id: 'y',
        academic_year_name: 'Y',
        grade_level: 8,
        created_at: '',
        updated_at: '',
      },
      {
        id: 'c-2',
        name: 'B',
        status: 'active',
        academic_year_id: 'y',
        academic_year_name: 'Y',
        grade_level: 8,
        created_at: '',
        updated_at: '',
      },
    ];
    expect(pickDefaultClass(classes)?.id).toBe('c-2');
    expect(pickDefaultClass([])).toBeUndefined();
  });

  it('todayIso returns YYYY-MM-DD', () => {
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
  });
});
