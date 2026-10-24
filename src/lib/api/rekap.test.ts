import { describe, expect, it } from 'vitest';
import type {
  AttendanceSummaryItem,
  AttendanceSummaryResponse,
  HistoryRecord,
  Student,
} from '@/lib/api/dto';
import type { StudentMatrixRow } from '@/types/rekap';
import {
  buildCalendarDays,
  buildMatrixRows,
  buildSummaryMetrics,
  computeRaporStatus,
  currentPeriodLabel,
  filterMatrixRows,
  indexHistoryByStudent,
  parsePeriod,
  periodRange,
  recentPeriodLabels,
  resolveClassId,
  shiftPeriodLabel,
  toDayStatus,
} from './rekap';
import type { AttendanceReportResult, AttendanceReportRow } from './rekap';

const summaryItem = (overrides?: Partial<AttendanceSummaryItem>): AttendanceSummaryItem => ({
  student_id: 'st-1',
  student_number: '0087412948',
  student_name: 'Rizky Pratama',
  class_id: 'cl-1',
  class_name: 'VIII A',
  total_days: 22,
  present: 18,
  late: 3,
  sick: 1,
  excused: 0,
  absent: 0,
  attendance_percentage: 95.45,
  ...overrides,
});

const summaryResponse = (items: AttendanceSummaryItem[]): AttendanceSummaryResponse => ({
  from: '2026-10-01',
  to: '2026-10-31',
  data: items,
  totals: {
    students: items.length,
    total_days: 22 * items.length,
    present: 600,
    late: 40,
    sick: 14,
    excused: 9,
    absent: 3,
    attendance_percentage: 90.909,
  },
});

const historyRecord = (overrides: Partial<HistoryRecord>): HistoryRecord => ({
  id: `rec-${Math.random().toString(36).slice(2, 8)}`,
  date: '2026-10-05',
  status: 'late',
  source: 'manual',
  student_id: 'st-1',
  student_number: '0087412948',
  student_name: 'Rizky Pratama',
  class_id: 'cl-1',
  class_name: 'VIII A',
  academic_year_id: 'ay-1',
  academic_year_name: '2026/2027',
  closed: false,
  created_at: '2026-10-05T04:00:00Z',
  updated_at: '2026-10-05T04:00:00Z',
  ...overrides,
});

const student = (overrides: Partial<Student>): Student => ({
  id: 'st-1',
  student_number: '0087412948',
  full_name: 'Rizky Pratama',
  admission_year: 2026,
  status: 'active',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

const matrixRow = (overrides?: Partial<StudentMatrixRow>): StudentMatrixRow => ({
  id: 'st-1',
  nis: '0087412948',
  name: 'Rizky Pratama',
  initials: 'RP',
  gender: 'L',
  className: 'VIII A',
  phoneGuardian: '',
  attendanceByDay: {},
  totalHadir: 18,
  totalTerlambat: 3,
  totalSakit: 1,
  totalIzin: 0,
  totalAlpa: 0,
  percentage: 95.5,
  raporStatus: 'safe',
  ...overrides,
});

const reportRow = (overrides?: Partial<AttendanceReportRow>): AttendanceReportRow => ({
  period_start: '2026-10-01',
  period_end: '2026-10-31',
  class_id: 'cl-1',
  class_name: 'VIII A',
  total_days: 704,
  present: 600,
  late: 40,
  sick: 14,
  excused: 9,
  absent: 3,
  attendance_percentage: 96.8,
  ...overrides,
});

const reportResult = (rows: AttendanceReportRow[]): AttendanceReportResult => ({
  from: '2026-08-01',
  to: '2026-10-31',
  group_by: 'month',
  data: rows,
  totals: {
    total_days: 0,
    present: 0,
    late: 0,
    sick: 0,
    excused: 0,
    absent: 0,
    attendance_percentage: 0,
  },
});

describe(parsePeriod, () => {
  it('Parses Indonesian month label into year and month', () => {
    expect(parsePeriod('Oktober 2026')).toStrictEqual({ year: 2026, month: 10 });
    expect(parsePeriod('Januari 2027')).toStrictEqual({ year: 2027, month: 1 });
  });

  it('Falls back to reference date for invalid label', () => {
    expect(parsePeriod('NotAMonth xyz', new Date(2026, 4, 17))).toStrictEqual({
      year: 2026,
      month: 5,
    });
  });
});

describe(periodRange, () => {
  it('Returns first and last ISO days of the month', () => {
    expect(periodRange('Oktober 2026')).toStrictEqual({ from: '2026-10-01', to: '2026-10-31' });
    expect(periodRange('Februari 2026')).toStrictEqual({ from: '2026-02-01', to: '2026-02-28' });
    expect(periodRange('September 2026')).toStrictEqual({ from: '2026-09-01', to: '2026-09-30' });
  });
});

describe(shiftPeriodLabel, () => {
  it('Shifts across year boundary', () => {
    expect(shiftPeriodLabel('Januari 2026', -2)).toBe('November 2025');
    expect(shiftPeriodLabel('Oktober 2026', -2)).toBe('Agustus 2026');
  });
});

describe(recentPeriodLabels, () => {
  it('Generates descending month labels', () => {
    expect(recentPeriodLabels(3, new Date(2026, 9, 15))).toStrictEqual([
      'Oktober 2026',
      'September 2026',
      'Agustus 2026',
    ]);
  });
});

describe(currentPeriodLabel, () => {
  it('Labels the reference month', () => {
    expect(currentPeriodLabel(new Date(2026, 9, 15))).toBe('Oktober 2026');
  });
});

describe(buildCalendarDays, () => {
  it('Builds October 2026 columns with correct weekends', () => {
    const days = buildCalendarDays(2026, 10);
    expect(days).toHaveLength(31);
    expect(days[0]).toStrictEqual({ dayNumber: 1, dayNameShort: 'Km', isWeekend: false });
    expect(days[3]).toMatchObject({ dayNumber: 4, dayNameShort: 'Mg', isWeekend: true });
    expect(days.filter((d) => !d.isWeekend)).toHaveLength(22);
  });
});

describe(toDayStatus, () => {
  it('Maps backend statuses to badge letters', () => {
    expect(toDayStatus('present')).toBe('H');
    expect(toDayStatus('late')).toBe('T');
    expect(toDayStatus('sick')).toBe('S');
    expect(toDayStatus('excused')).toBe('I');
    expect(toDayStatus('absent')).toBe('A');
  });
});

describe(computeRaporStatus, () => {
  it('Applies inherited mock thresholds', () => {
    expect(computeRaporStatus(96, 0, 1, 1)).toBe('safe');
    expect(computeRaporStatus(90, 0, 2, 2)).toBe('warning');
    expect(computeRaporStatus(96, 1, 0, 0)).toBe('warning');
    expect(computeRaporStatus(84, 0, 0, 0)).toBe('critical');
    expect(computeRaporStatus(96, 2, 0, 0)).toBe('critical');
  });
});

describe(indexHistoryByStudent, () => {
  it('Indexes weekday records by student and day', () => {
    const index = indexHistoryByStudent(
      [
        historyRecord({ date: '2026-10-05', status: 'late' }),
        historyRecord({ date: '2026-09-08', status: 'present' }),
        historyRecord({ date: '2026-10-04', status: 'absent' }),
      ],
      2026,
      10,
    );
    expect(index['st-1']).toStrictEqual({ 5: 'T' });
  });

  it('Skips weekend auto-close records', () => {
    const index = indexHistoryByStudent(
      [historyRecord({ date: '2026-10-17', status: 'absent', student_id: 'st-9' })],
      2026,
      10,
    );
    expect(index['st-9']).toBeUndefined();
  });
});

describe(buildMatrixRows, () => {
  it('Merges summary aggregates, history cells and student masterdata', () => {
    const rows = buildMatrixRows({
      summary: summaryResponse([summaryItem()]),
      history: [
        historyRecord({ date: '2026-10-05', status: 'late' }),
        historyRecord({ date: '2026-10-08', status: 'sick' }),
      ],
      students: [student({ gender: 'L', guardian_phone: '+62 812-4491-0021' })],
      days: buildCalendarDays(2026, 10),
      className: 'Kelas VIII A',
      year: 2026,
      month: 10,
    });

    expect(rows).toHaveLength(1);
    const [row] = rows;
    expect(row).toMatchObject({
      id: 'st-1',
      nis: '0087412948',
      name: 'Rizky Pratama',
      initials: 'RP',
      gender: 'L',
      phoneGuardian: '+62 812-4491-0021',
      totalHadir: 18,
      totalTerlambat: 3,
      percentage: 95.5,
      raporStatus: 'safe',
    });
    expect(row?.attendanceByDay[5]).toBe('T');
    expect(row?.attendanceByDay[8]).toBe('S');
  });

  it('Marks weekends and leaves unrecorded weekdays blank', () => {
    const [row] = buildMatrixRows({
      summary: summaryResponse([summaryItem()]),
      history: [],
      students: [],
      days: buildCalendarDays(2026, 10),
      className: 'VIII A',
      year: 2026,
      month: 10,
    });
    expect(row?.attendanceByDay[4]).toBe('L');
    expect(row?.attendanceByDay[12]).toBeUndefined();
  });

  it('Defaults gender and phone when masterdata is missing', () => {
    const [row] = buildMatrixRows({
      summary: summaryResponse([summaryItem({ student_name: 'Aisyah Putri Rahmadhani' })]),
      days: buildCalendarDays(2026, 10),
      className: 'VIII A',
      year: 2026,
      month: 10,
    });
    expect(row?.gender).toBe('L');
    expect(row?.phoneGuardian).toBe('');
    expect(row?.initials).toBe('AP');
  });
});

describe(filterMatrixRows, () => {
  it('Matches name, nis and rapor status', () => {
    const rows = [
      matrixRow(),
      matrixRow({ id: 'st-2', nis: '0086391024', name: 'Dimas Saputra', raporStatus: 'critical' }),
    ];
    expect(filterMatrixRows(rows, 'dimas', 'all')).toHaveLength(1);
    expect(filterMatrixRows(rows, '00874', 'all')).toHaveLength(1);
    expect(filterMatrixRows(rows, '', 'critical')).toHaveLength(1);
    expect(filterMatrixRows(rows, '', 'all')).toHaveLength(2);
  });
});

describe(buildSummaryMetrics, () => {
  it('Computes delta from two monthly report buckets', () => {
    const metrics = buildSummaryMetrics({
      summary: summaryResponse([]),
      effectiveDays: 22,
      report: reportResult([
        reportRow({
          attendance_percentage: 92.2,
          period_start: '2026-09-01',
          period_end: '2026-09-30',
        }),
        reportRow({ attendance_percentage: 96.8 }),
      ]),
    });
    expect(metrics.classAveragePercentage).toBe(90.9);
    expect(metrics.classAverageDelta).toBe(4.6);
    expect(metrics.totalStudents).toBe(0);
    expect(metrics.totalSakit).toBe(14);
    expect(metrics.effectiveDays).toBe(22);
  });

  it('Returns zeros while queries are loading', () => {
    const metrics = buildSummaryMetrics({ effectiveDays: 22 });
    expect(metrics.classAveragePercentage).toBe(0);
    expect(metrics.classAverageDelta).toBe(0);
  });
});

describe(resolveClassId, () => {
  it('Prefers explicit selection then first class', () => {
    const classes = [
      {
        id: 'cl-1',
        academic_year_id: 'ay-1',
        academic_year_name: '2026/2027',
        name: 'VIII A',
        grade_level: 8,
        status: 'active',
        created_at: '',
        updated_at: '',
      },
    ];
    expect(resolveClassId('', classes)).toBe('cl-1');
    expect(resolveClassId('cl-9', classes)).toBe('cl-9');
    expect(resolveClassId('', [])).toBe('');
  });
});
