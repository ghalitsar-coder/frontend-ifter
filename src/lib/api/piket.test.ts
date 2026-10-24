import { describe, expect, it } from 'vitest';
import type { DutyAssignment } from '@/lib/api/dto';
import {
  groupDutyAssignmentsByWeekday,
  isDutyActiveOn,
  isoWeekdayFromDate,
  onDutyTeacherNames,
  toCreateDutyPayload,
  todayIsoDate,
} from './piket';

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
