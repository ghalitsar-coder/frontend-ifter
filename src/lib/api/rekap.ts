import { queryOptions, useQuery } from '@tanstack/react-query';
import { apiGet, downloadFile } from '@/lib/api/client';
import type {
  AcademicYear,
  AttendanceStatus,
  AttendanceSummaryResponse,
  Class,
  HistoryRecord,
  Paginated,
  Student,
} from '@/lib/api/dto';
import type {
  CalendarDayInfo,
  DayAttendanceStatus,
  RekapSummaryMetrics,
  StudentMatrixRow,
} from '@/types/rekap';

// ---------------------------------------------------------------------------
// Module query keys (foundation `queryKeys` is shared — module-scoped keys
// live here following the ['<module>', ...] convention).
// ---------------------------------------------------------------------------
export const rekapKeys = {
  all: ['rekap'] as const,
  summary: (query: RekapPeriodParams) => ['rekap', 'summary', query] as const,
  report: (query: RekapReportParams) => ['rekap', 'report', query] as const,
  history: (query: RekapPeriodParams) => ['rekap', 'history', query] as const,
};

// ---------------------------------------------------------------------------
// Params & DTOs
// ---------------------------------------------------------------------------
export type RekapPeriodParams = {
  class_id: string;
  /** ISO date, first day of the selected month. */
  from: string;
  /** ISO date, last day of the selected month. */
  to: string;
};

export type RekapReportParams = RekapPeriodParams & {
  group_by: 'day' | 'week' | 'month';
};

/** GET /reports/attendance row (aggregated per period bucket × class). */
export type AttendanceReportRow = {
  period_start: string;
  period_end: string;
  class_id: string;
  class_name: string;
  total_days: number;
  present: number;
  late: number;
  sick: number;
  excused: number;
  absent: number;
  attendance_percentage: number;
};

/** GET /reports/attendance response. */
export type AttendanceReportResult = {
  from: string;
  to: string;
  group_by: string;
  data: AttendanceReportRow[];
  totals: {
    total_days: number;
    present: number;
    late: number;
    sick: number;
    excused: number;
    absent: number;
    attendance_percentage: number;
  };
};

/** Class dropdown entry derived from the masterdata `Class` DTO. */
export type RekapClassOption = {
  id: string;
  name: string;
  homeroomName?: string;
};

// ---------------------------------------------------------------------------
// Period helpers (Indonesian month labels ↔ ISO date ranges)
// ---------------------------------------------------------------------------
const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const DAY_NAMES_SHORT = ['Mg', 'Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sa'];

const pad2 = (value: number): string => value.toString().padStart(2, '0');

/**
 * Parse an Indonesian period label ('Oktober 2026') into a year/month pair.
 * Falls back to the current month for unrecognized labels.
 * @param label - Period label shown in the dropdown.
 * @param today - Reference date for the fallback (injectable for tests).
 * @returns `{ year, month }` with 1-based month.
 */
export const parsePeriod = (label: string, today = new Date()): { year: number; month: number } => {
  const [monthName, yearText] = label.trim().split(/\s+/u);
  const month = MONTHS_ID.indexOf(monthName ?? '') + 1;
  const year = Number(yearText);
  if (month === 0 || !Number.isInteger(year) || year < 2000) {
    return { year: today.getFullYear(), month: today.getMonth() + 1 };
  }
  return { year, month };
};

/**
 * ISO first/last day of the month named by a period label.
 * @param label - Period label ('Oktober 2026').
 * @returns `{ from, to }` ISO date strings.
 */
export const periodRange = (label: string): { from: string; to: string } => {
  const { year, month } = parsePeriod(label);
  const lastDay = new Date(year, month, 0).getDate();
  return {
    from: `${year}-${pad2(month)}-01`,
    to: `${year}-${pad2(month)}-${pad2(lastDay)}`,
  };
};

/**
 * Shift a period label by whole months (e.g. -2 for the comparison window).
 * @param label - Period label ('Oktober 2026').
 * @param delta - Month offset, may be negative.
 * @returns Shifted period label in the same format.
 */
export const shiftPeriodLabel = (label: string, delta: number): string => {
  const { year, month } = parsePeriod(label);
  const shifted = new Date(year, month - 1 + delta, 1);
  return `${MONTHS_ID[shifted.getMonth()] ?? ''} ${shifted.getFullYear()}`;
};

/**
 * The `count` most recent month labels, newest first (drives the period filter).
 * @param count - Number of months to generate.
 * @param today - Reference date (injectable for tests).
 * @returns Array of Indonesian period labels.
 */
export const recentPeriodLabels = (count: number, today = new Date()): string[] => {
  const labels: string[] = [];
  for (let back = 0; back < count; back += 1) {
    const d = new Date(today.getFullYear(), today.getMonth() - back, 1);
    labels.push(`${MONTHS_ID[d.getMonth()] ?? ''} ${d.getFullYear()}`);
  }
  return labels;
};

/**
 * Period label for the current month (default selection of the period filter).
 * @param today - Reference date (injectable for tests).
 * @returns Indonesian period label, e.g. 'Oktober 2026'.
 */
export const currentPeriodLabel = (today = new Date()): string =>
  recentPeriodLabels(1, today)[0] ?? `${MONTHS_ID[today.getMonth()] ?? ''} ${today.getFullYear()}`;

/**
 * Build the calendar columns for one month (day number, short day name, weekend flag).
 * @param year - Full year.
 * @param month - 1-based month.
 * @returns One entry per calendar day of the month.
 */
export const buildCalendarDays = (year: number, month: number): CalendarDayInfo[] => {
  const lastDay = new Date(year, month, 0).getDate();
  const days: CalendarDayInfo[] = [];
  for (let day = 1; day <= lastDay; day += 1) {
    const weekday = new Date(year, month - 1, day).getDay();
    days.push({
      dayNumber: day,
      dayNameShort: DAY_NAMES_SHORT[weekday] ?? '',
      isWeekend: weekday === 0 || weekday === 6,
    });
  }
  return days;
};

// ---------------------------------------------------------------------------
// Status / aggregate mappers
// ---------------------------------------------------------------------------
const DAY_STATUS_BY_BACKEND: Record<AttendanceStatus, DayAttendanceStatus> = {
  present: 'H',
  late: 'T',
  sick: 'S',
  excused: 'I',
  absent: 'A',
};

/**
 * Map a backend attendance status to the matrix badge letter.
 * @param status - present/late/sick/excused/absent.
 * @returns UI badge letter (H/T/S/I/A).
 */
export const toDayStatus = (status: AttendanceStatus): DayAttendanceStatus =>
  DAY_STATUS_BY_BACKEND[status];

/**
 * Rapor risk bucket for a student's period attendance.
 * Doc comment: thresholds carried over 1:1 from the legacy mock matrix logic
 * (critical: 2+ alpa or <85%; warning: any alpa, <92%, or 4+ sakit+izin).
 * @param percentage - Attendance percentage (0-100).
 * @param alpa - Absent-day count.
 * @param sakit - Sick-day count.
 * @param izin - Excused-day count.
 * @returns 'safe' | 'warning' | 'critical'.
 */
export const computeRaporStatus = (
  percentage: number,
  alpa: number,
  sakit: number,
  izin: number,
): StudentMatrixRow['raporStatus'] => {
  if (alpa >= 2 || percentage < 85) {
    return 'critical';
  }
  if (alpa >= 1 || percentage < 92 || sakit + izin >= 4) {
    return 'warning';
  }
  return 'safe';
};

const round1 = (value: number): number => Math.round(value * 10) / 10;

const initialsOf = (fullName: string): string =>
  fullName
    .split(/\s+/u)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

/**
 * Index per-day attendance history by student id → day-of-month → badge letter.
 * Doc comment: records outside the selected month are skipped; weekend cells are
 * never overlaid so holiday auto-close 'absent' rows do not paint the grid.
 * @param records - History records from GET /attendance/history.
 * @param year - Period year.
 * @param month - 1-based period month.
 * @returns Nested lookup map for the matrix day cells.
 */
export const indexHistoryByStudent = (
  records: HistoryRecord[],
  year: number,
  month: number,
): Record<string, Record<number, DayAttendanceStatus>> => {
  const prefix = `${year}-${pad2(month)}`;
  const byStudent: Record<string, Record<number, DayAttendanceStatus>> = {};
  for (const record of records) {
    if (record.date.slice(0, 7) !== prefix) {
      continue;
    }
    const day = Number(record.date.slice(8, 10));
    const weekday = new Date(year, month - 1, day).getDay();
    if (weekday === 0 || weekday === 6) {
      continue;
    }
    const dayCells = (byStudent[record.student_id] ??= {});
    dayCells[day] = toDayStatus(record.status);
  }
  return byStudent;
};

/** Inputs for `buildMatrixRows`, shaped as the (possibly still loading) query results. */
export type MatrixRowsInput = {
  summary?: AttendanceSummaryResponse;
  history?: HistoryRecord[];
  students?: Student[];
  days: CalendarDayInfo[];
  className: string;
  year: number;
  month: number;
};

/**
 * Build the matrix rows from the three real API payloads.
 * Doc comment: GET /attendance/summary supplies the aggregate columns
 * (present/late/sick/excused/absent + percentage) while GET /attendance/history
 * supplies the per-day grid cells; gender and guardian phone (needed by the
 * WhatsApp modal) are joined from GET /students by student id. Undefined inputs
 * are treated as empty so the grid keeps its layout while queries are loading.
 * @param options - Query results plus period/calendar context.
 * @returns One `StudentMatrixRow` per summary item.
 */
export const buildMatrixRows = (options: MatrixRowsInput): StudentMatrixRow[] => {
  const historyByStudent = indexHistoryByStudent(
    options.history ?? [],
    options.year,
    options.month,
  );
  const students = options.students ?? [];
  const phoneById = new Map(students.map((s) => [s.id, s]));

  return (options.summary?.data ?? []).map((item) => {
    const weekendCells: Record<number, DayAttendanceStatus> = {};
    for (const day of options.days) {
      if (day.isWeekend) {
        weekendCells[day.dayNumber] = 'L';
      }
    }
    const attendanceByDay = { ...weekendCells, ...historyByStudent[item.student_id] };

    const percentage = round1(item.attendance_percentage);
    const student = phoneById.get(item.student_id);

    return {
      id: item.student_id,
      nis: item.student_number,
      name: item.student_name,
      initials: initialsOf(item.student_name),
      gender: student?.gender === 'P' ? 'P' : 'L',
      className: options.className,
      phoneGuardian: student?.guardian_phone ?? '',
      attendanceByDay,
      totalHadir: item.present,
      totalTerlambat: item.late,
      totalSakit: item.sick,
      totalIzin: item.excused,
      totalAlpa: item.absent,
      percentage,
      raporStatus: computeRaporStatus(percentage, item.absent, item.sick, item.excused),
    };
  });
};

/**
 * Filter matrix rows by name/NIS search and rapor status (client-side).
 * @param rows - All matrix rows of the selected class.
 * @param search - Free-text query.
 * @param filterStatus - Rapor status filter.
 * @returns Rows matching both filters.
 */
export const filterMatrixRows = (
  rows: StudentMatrixRow[],
  search: string,
  filterStatus: 'all' | 'safe' | 'warning' | 'critical',
): StudentMatrixRow[] => {
  const query = search.trim().toLowerCase();
  return rows.filter((row) => {
    const matchesSearch =
      query === '' || row.name.toLowerCase().includes(query) || row.nis.includes(query);
    const matchesStatus = filterStatus === 'all' || row.raporStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });
};

/** Inputs for `buildSummaryMetrics`, shaped as the (possibly still loading) query results. */
export type SummaryMetricsInput = {
  summary?: AttendanceSummaryResponse;
  effectiveDays: number;
  report?: AttendanceReportResult;
};

/**
 * Build the six bento tiles from summary totals + monthly report rows.
 * Doc comment: `classAverageDelta` compares the two most recent monthly buckets
 * returned by GET /reports/attendance (group_by=month over a 3-month window);
 * it is 0 when fewer than two buckets exist. Zeros are returned while queries
 * are still loading so the tiles keep their layout.
 * @param options - Summary and report query results plus effective-day count.
 * @returns Metrics consumed by `RekapSummaryBento`.
 */
export const buildSummaryMetrics = (options: SummaryMetricsInput): RekapSummaryMetrics => {
  const totals = options.summary?.totals;
  const sorted = (options.report?.data ?? []).toSorted((a, b) =>
    a.period_start.localeCompare(b.period_start),
  );
  const latest = sorted.at(-1);
  const previous = sorted.at(-2);
  const delta =
    latest !== undefined && previous !== undefined
      ? round1(latest.attendance_percentage - previous.attendance_percentage)
      : 0;

  return {
    effectiveDays: options.effectiveDays,
    classAveragePercentage: totals === undefined ? 0 : round1(totals.attendance_percentage),
    classAverageDelta: delta,
    totalSakit: totals?.sick ?? 0,
    totalIzin: totals?.excused ?? 0,
    totalAlpa: totals?.absent ?? 0,
    totalTerlambat: totals?.late ?? 0,
    totalStudents: totals?.students ?? 0,
  };
};

/**
 * Active academic year, falling back to the first listed year.
 * @param years - Years from `useAcademicYears`.
 * @returns Selected `AcademicYear` or undefined while loading.
 */
export const pickActiveAcademicYear = (
  years: AcademicYear[] | undefined,
): AcademicYear | undefined => {
  if (years === undefined || years.length === 0) {
    return undefined;
  }
  return years.find((year) => year.is_active) ?? years[0];
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
export const rekapSummaryOptions = (params: RekapPeriodParams) =>
  queryOptions({
    queryKey: rekapKeys.summary(params),
    queryFn: async () =>
      await apiGet<AttendanceSummaryResponse>('/attendance/summary', { ...params }),
    enabled: params.class_id !== '' && params.from !== '',
  });

/**
 * GET /attendance/summary → per-student attendance percentages for a period.
 * @param params - `class_id`, `from`, `to`.
 * @returns React Query result with the summary response.
 */
export const useRekapSummary = (params: RekapPeriodParams) => useQuery(rekapSummaryOptions(params));

const HISTORY_PAGE_LIMIT = 100;
const HISTORY_MAX_ROWS = 5000;

export const rekapHistoryOptions = (params: RekapPeriodParams) =>
  queryOptions({
    queryKey: rekapKeys.history(params),
    queryFn: async () => {
      const firstPage = await apiGet<Paginated<HistoryRecord>>('/attendance/history', {
        ...params,
        limit: HISTORY_PAGE_LIMIT,
        offset: 0,
      });
      const pageCount = Math.min(
        Math.ceil(Math.max(firstPage.total - firstPage.data.length, 0) / HISTORY_PAGE_LIMIT),
        Math.ceil(HISTORY_MAX_ROWS / HISTORY_PAGE_LIMIT) - 1,
      );
      const restPages = await Promise.all(
        Array.from(
          { length: pageCount },
          async (_, index) =>
            await apiGet<Paginated<HistoryRecord>>('/attendance/history', {
              ...params,
              limit: HISTORY_PAGE_LIMIT,
              offset: (index + 1) * HISTORY_PAGE_LIMIT,
            }),
        ),
      );
      return [firstPage, ...restPages].flatMap((page) => page.data);
    },
    enabled: params.class_id !== '' && params.from !== '',
  });

/**
 * GET /attendance/history (paginated, collected up to 5000 rows) → per-day
 * attendance records feeding the matrix grid cells.
 * @param params - `class_id`, `from`, `to`.
 * @returns React Query result with all history records of the period.
 */
export const useRekapHistory = (params: RekapPeriodParams) => useQuery(rekapHistoryOptions(params));

export const rekapReportOptions = (params: RekapReportParams) =>
  queryOptions({
    queryKey: rekapKeys.report(params),
    queryFn: async () => await apiGet<AttendanceReportResult>('/reports/attendance', { ...params }),
    enabled: params.class_id !== '' && params.from !== '',
  });

/**
 * GET /reports/attendance → grouped attendance report (used for the
 * month-over-month class average delta tile).
 * @param params - `class_id`, `from`, `to`, `group_by`.
 * @returns React Query result with the report payload.
 */
export const useRekapReport = (params: RekapReportParams) => useQuery(rekapReportOptions(params));

// ---------------------------------------------------------------------------
// XLSX exports
// ---------------------------------------------------------------------------
/**
 * GET /exports/attendance → per-student recap workbook for the period.
 * @param params - `class_id`, `from`, `to`.
 * @returns Blob + server filename.
 */
export const downloadRekapAttendance = async (
  params: RekapPeriodParams,
): Promise<{ blob: Blob; filename: string | null }> =>
  await downloadFile('/exports/attendance', { ...params });

/**
 * GET /exports/attendance-report → grouped report workbook for the period.
 * @param params - `class_id`, `from`, `to`, `group_by`.
 * @returns Blob + server filename.
 */
export const downloadRekapAttendanceReport = async (
  params: RekapReportParams,
): Promise<{ blob: Blob; filename: string | null }> =>
  await downloadFile('/exports/attendance-report', { ...params });

/**
 * Save a downloaded blob via a transient anchor click, then revoke its URL.
 * @param blob - File contents.
 * @param filename - Download name fallback when the server sends none.
 */
export const saveBlobToDisk = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/**
 * Selected class id, defaulting to the first loaded class.
 * @param selectedId - Explicit user selection ('' before any selection).
 * @param classes - Classes from `useClassList`.
 * @returns Class id to query.
 */
export const resolveClassId = (selectedId: string, classes: Class[]): string => {
  if (selectedId !== '') {
    return selectedId;
  }
  return classes[0]?.id ?? '';
};
