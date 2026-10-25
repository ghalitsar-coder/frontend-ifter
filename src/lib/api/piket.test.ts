import { describe, expect, it } from 'vitest';
import type { DutyAssignment } from '@/lib/api/dto';
import {
  activeSubstitutionsForAssignment,
  buildUniformNote,
  groupDutyAssignmentsByWeekday,
  isDutyActiveOn,
  isoWeekdayFromDate,
  onDutyTeacherNames,
  substitutableAssignmentsOn,
  toCreateDutyPayload,
  toCreateRotationPayload,
  toCreateUniformPayload,
  todayIsoDate,
} from './piket';
import type { DutyRotation } from './piket';

const assignment = (overrides: Partial<DutyAssignment>): DutyAssignment => ({
  id: 'duty-1',
  teacher_id: 'teacher-1',
  teacher_name: 'Sarah Rahma, S.Pd.',
  weekday: 1,
  start_date: '2026-11-02',
  created_at: '2026-11-01T00:00:00Z',
  ...overrides,
});

describe('isoWeekdayFromDate — backend ISODOW 1 = Senin ... 7 = Ahad', () => {
  it('maps Monday to 1 and Sunday to 7', () => {
    expect(isoWeekdayFromDate('2026-11-02')).toBe(1);
    expect(isoWeekdayFromDate('2026-11-08')).toBe(7);
    expect(isoWeekdayFromDate('2026-11-06')).toBe(5);
  });

  it('returns 0 for unparseable dates', () => {
    expect(isoWeekdayFromDate('not-a-date')).toBe(0);
  });
});

describe(todayIsoDate, () => {
  it('returns a YYYY-MM-DD string', () => {
    expect(todayIsoDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
  });
});

describe(isDutyActiveOn, () => {
  it('matches only when weekday, start_date and end_date all cover the date', () => {
    const open = assignment({ weekday: 1, start_date: '2026-11-02' });
    expect(isDutyActiveOn(open, '2026-11-02')).toBeTruthy();
    expect(isDutyActiveOn(open, '2026-11-09')).toBeTruthy();
    expect(isDutyActiveOn(open, '2026-11-03')).toBeFalsy(); // wrong weekday
    expect(isDutyActiveOn(open, '2026-10-26')).toBeFalsy(); // before start_date
  });

  it('respects end_date boundaries', () => {
    const closed = assignment({ weekday: 1, start_date: '2026-11-02', end_date: '2026-11-09' });
    expect(isDutyActiveOn(closed, '2026-11-09')).toBeTruthy();
    expect(isDutyActiveOn(closed, '2026-11-16')).toBeFalsy();
  });
});

describe(onDutyTeacherNames, () => {
  it('returns names of teachers on duty for the given date only', () => {
    const roster = [
      assignment({ id: 'a', teacher_name: 'Guru Senin', weekday: 1 }),
      assignment({ id: 'b', teacher_name: 'Guru lain', weekday: 3 }),
      assignment({
        id: 'c',
        teacher_name: 'Guru selesai tugas',
        weekday: 1,
        end_date: '2026-11-01',
      }),
    ];
    expect(onDutyTeacherNames(roster, '2026-11-02')).toStrictEqual(['Guru Senin']);
  });
});

describe(groupDutyAssignmentsByWeekday, () => {
  it('groups by weekday 1..7, drops empty days and sorts by start_date', () => {
    const groups = groupDutyAssignmentsByWeekday([
      assignment({ id: 'late', weekday: 5, start_date: '2026-11-16' }),
      assignment({ id: 'early', weekday: 5, start_date: '2026-11-02' }),
      assignment({ id: 'senin', weekday: 1 }),
    ]);
    expect(groups.map((group) => group.weekday)).toStrictEqual([1, 5]);
    expect(groups[0]?.label).toBe('Senin');
    expect(groups[1]?.assignments.map((item) => item.id)).toStrictEqual(['early', 'late']);
  });
});

describe(toCreateDutyPayload, () => {
  it('omits empty end_date so the backend keeps the assignment open', () => {
    expect(
      toCreateDutyPayload({
        teacher_id: 't1',
        weekday: 2,
        start_date: '2026-11-03',
        end_date: '',
      }),
    ).toStrictEqual({ teacher_id: 't1', weekday: 2, start_date: '2026-11-03' });
  });

  it('keeps a provided end_date', () => {
    expect(
      toCreateDutyPayload({
        teacher_id: 't1',
        weekday: 2,
        start_date: '2026-11-03',
        end_date: '2026-12-01',
      }),
    ).toStrictEqual({
      teacher_id: 't1',
      weekday: 2,
      start_date: '2026-11-03',
      end_date: '2026-12-01',
    });
  });
});

const rotation = (overrides: Partial<DutyRotation>): DutyRotation => ({
  id: 'rot-1',
  duty_assignment_id: 'duty-1',
  rotation_date: '2026-11-02',
  weekday: 1,
  original_teacher_id: 'teacher-1',
  original_teacher_name: 'Sarah Rahma, S.Pd.',
  substitute_teacher_id: 'teacher-2',
  substitute_teacher_name: 'Budi Utomo, S.Pd.',
  status: 'substituted',
  reason: 'Sakit',
  created_at: '2026-11-01T00:00:00Z',
  ...overrides,
});

describe(toCreateRotationPayload, () => {
  it('trims every field of the POST /duty-rotations body', () => {
    expect(
      toCreateRotationPayload({
        duty_assignment_id: ' duty-1 ',
        substitute_teacher_id: ' teacher-2 ',
        date: ' 2026-11-02 ',
        reason: '  Mengantar anak sekolah  ',
      }),
    ).toStrictEqual({
      duty_assignment_id: 'duty-1',
      substitute_teacher_id: 'teacher-2',
      date: '2026-11-02',
      reason: 'Mengantar anak sekolah',
    });
  });
});

describe(activeSubstitutionsForAssignment, () => {
  it('matches assignment id + rotation date and hides cancelled rows', () => {
    const rotations = [
      rotation({ id: 'r1' }),
      rotation({ id: 'r2', status: 'cancelled' }),
      rotation({ id: 'r3', rotation_date: '2026-11-09' }),
      rotation({ id: 'r4', duty_assignment_id: 'duty-other' }),
    ];
    expect(
      activeSubstitutionsForAssignment(rotations, 'duty-1', '2026-11-02').map((r) => r.id),
    ).toStrictEqual(['r1']);
  });
});

describe(substitutableAssignmentsOn, () => {
  it('only offers roster rows active on the date that are not yet substituted', () => {
    const roster = [
      assignment({ id: 'duty-1', weekday: 1, start_date: '2026-11-02' }),
      assignment({ id: 'duty-2', weekday: 3, start_date: '2026-11-02' }),
      assignment({ id: 'duty-3', weekday: 1, start_date: '2026-10-01' }),
    ];
    const rotations = [rotation({ duty_assignment_id: 'duty-3' })];
    expect(
      substitutableAssignmentsOn(roster, rotations, '2026-11-02').map((a) => a.id),
    ).toStrictEqual(['duty-1']);
  });
});

describe(toCreateUniformPayload, () => {
  it('omits blank optional fields', () => {
    expect(
      toCreateUniformPayload({
        for_date: ' 2026-11-02 ',
        teacher_id: ' t1 ',
        scope: 'teacher',
        target_student_id: '',
        note: '   ',
      }),
    ).toStrictEqual({ for_date: '2026-11-02', teacher_id: 't1', scope: 'teacher' });
  });

  it('drops target_student_id for teacher-scope notes even when filled', () => {
    expect(
      toCreateUniformPayload({
        for_date: '2026-11-02',
        teacher_id: 't1',
        scope: 'teacher',
        target_student_id: 's1',
        note: 'Laporan guru',
      }),
    ).toStrictEqual({
      for_date: '2026-11-02',
      teacher_id: 't1',
      scope: 'teacher',
      note: 'Laporan guru',
    });
  });

  it('keeps target_student_id for student-scope notes', () => {
    expect(
      toCreateUniformPayload({
        for_date: '2026-11-02',
        teacher_id: 't1',
        scope: 'student',
        target_student_id: ' s1 ',
        note: 'Dasi tertinggal',
      }),
    ).toStrictEqual({
      for_date: '2026-11-02',
      teacher_id: 't1',
      scope: 'student',
      target_student_id: 's1',
      note: 'Dasi tertinggal',
    });
  });
});

describe(buildUniformNote, () => {
  it('combines catalog labels and the free note', () => {
    expect(
      buildUniformNote(['Dasi tidak dipakai', 'Sepatu bukan hitam'], 'Dasi tertinggal di rumah'),
    ).toBe(
      'Pelanggaran seragam: Dasi tidak dipakai, Sepatu bukan hitam. Catatan: Dasi tertinggal di rumah',
    );
  });

  it('handles catalog-only and note-only input', () => {
    expect(buildUniformNote(['Tanpa sepatu'], '  ')).toBe('Pelanggaran seragam: Tanpa sepatu');
    expect(buildUniformNote([], ' Catatann ')).toBe('Catatann');
  });

  it('truncates to 500 characters (backend maxNoteRunes)', () => {
    const note = buildUniformNote(['A'.repeat(300)], 'B'.repeat(300));
    // oxlint-disable-next-line typescript/no-misused-spread -- code-point count mirrors the 500-rune backend cap
    expect([...note].length).toBeLessThanOrEqual(500);
  });
});
