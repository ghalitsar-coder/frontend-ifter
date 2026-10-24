import { describe, expect, it } from 'vitest';
import type { DashboardData, DashboardTrendPoint } from '@/lib/api/dto';
import {
  attendanceKpi,
  dashboardKeys,
  formatAuditStamp,
  formatClockWib,
  formatSchoolDate,
  formatWeekdayShort,
  initialsOf,
  isoWeekday,
  localTodayIso,
  roleLabel,
  trendDelta,
} from './dashboard';

const dashboardFixture = (overrides?: Partial<DashboardData>): DashboardData => ({
  date: '2026-10-05',
  role: 'admin',
  attendance: {
    total_students: 748,
    recorded: 700,
    unrecorded: 48,
    present: 660,
    late: 40,
    sick: 3,
    excused: 2,
    absent: 10,
  },
  discipline: { records_today: 3, records_month: 20, points_month: 120, new_records: 2 },
  active_students: 748,
  active_teachers: 46,
  trend: [],
  late_students: [],
  unrecorded_students: [],
  ...overrides,
});

const trendPoint = (date: string, present: number, recorded: number): DashboardTrendPoint => ({
  date,
  present,
  recorded,
  late: 0,
  sick: 0,
  excused: 0,
  absent: 0,
});

describe('dashboard mappers', () => {
  it('computes the on-time KPI percentage with one decimal', () => {
    const kpi = attendanceKpi(dashboardFixture());
    expect(kpi.percent).toBe(88.2);
    expect(kpi.delta).toBeNull();
  });

  it('returns 0 percent when there are no students', () => {
    const data = dashboardFixture();
    data.attendance.total_students = 0;
    expect(attendanceKpi(data).percent).toBe(0);
  });

  it('computes the trend delta between the last two days', () => {
    const trend = [trendPoint('2026-10-04', 50, 100), trendPoint('2026-10-05', 66, 100)];
    expect(trendDelta(trend)).toBe(16);
  });

  it('returns null delta for short or empty trends', () => {
    expect(trendDelta([])).toBeNull();
    expect(trendDelta([trendPoint('2026-10-05', 10, 10)])).toBeNull();
    expect(trendDelta([trendPoint('2026-10-04', 0, 0), trendPoint('2026-10-05', 5, 0)])).toBeNull();
  });
});

describe('dashboard formatting helpers', () => {
  it('maps ISO weekday numbers like the backend duty table (1=Senin..7=Minggu)', () => {
    expect(isoWeekday('2026-10-05')).toBe(1);
    expect(isoWeekday('2026-10-11')).toBe(7);
    expect(isoWeekday('not-a-date')).toBe(0);
  });

  it('produces a local date-only default for the date filter', () => {
    expect(localTodayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
  });

  it('formats long and short Indonesian dates', () => {
    expect(formatSchoolDate('2026-10-05')).toBe('Senin, 05 Oktober 2026');
    expect(formatWeekdayShort('2026-10-05')).toBe('Sen');
    expect(formatSchoolDate('garbage')).toBe('garbage');
  });

  it('formats check-in clocks and audit stamps defensively', () => {
    expect(formatClockWib()).toBe('—');
    expect(formatClockWib('garbage')).toBe('—');
    expect(formatClockWib('2026-10-05T10:24:00Z')).toMatch(/^\d{2}\.\d{2} WIB$/u);
    expect(formatAuditStamp('garbage')).toBe('garbage');
    expect(formatAuditStamp('2026-10-05T10:24:00Z')).toContain('05 Okt');
  });

  it('builds avatar initials from names', () => {
    expect(initialsOf('Drs. Agus Subagyo, M.Pd.')).toBe('DA');
    expect(initialsOf('Ratna')).toBe('R');
    expect(initialsOf('  ')).toBe('?');
  });

  it('maps backend role scope strings to Indonesian labels', () => {
    expect(roleLabel('duty_teacher')).toBe('Guru Piket');
    expect(roleLabel('principal')).toBe('Kepala Sekolah');
    expect(roleLabel()).toBe('Operator');
    expect(roleLabel('mystery')).toBe('Operator');
  });
});

describe('dashboard query keys', () => {
  it('scopes the overview key by date and class filters', () => {
    expect(dashboardKeys.overview({ date: '2026-10-05' })).toStrictEqual([
      'dashboard',
      'overview',
      { date: '2026-10-05' },
    ]);
    expect(dashboardKeys.duty({ date: '2026-10-05' })).toStrictEqual([
      'dashboard',
      'duty-assignments',
      { date: '2026-10-05' },
    ]);
  });
});
