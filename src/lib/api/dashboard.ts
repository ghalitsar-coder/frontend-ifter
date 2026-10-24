import { queryOptions, useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/client';
import type { DashboardData, DashboardTrendPoint, DataList, DutyAssignment } from '@/lib/api/dto';

// ---------------------------------------------------------------------------
// Query keys — module-scoped, following the shared `queryKeys` convention
// (the foundation factory itself is off-limits to module agents).
// ---------------------------------------------------------------------------
export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: (params: DashboardParams) => ['dashboard', 'overview', params] as const,
  duty: (params: { date: string }) => ['dashboard', 'duty-assignments', params] as const,
};

// ---------------------------------------------------------------------------
// Param types
// ---------------------------------------------------------------------------
export type DashboardParams = {
  /** ISO 'YYYY-MM-DD' school date; omitted → backend uses today in school tz. */
  date?: string;
  /** Optional class scope (server additionally scopes by the caller's role). */
  class_id?: string;
};

// ---------------------------------------------------------------------------
// Date helpers (defined first — the query factories below use them)
// ---------------------------------------------------------------------------
/**
 * Parses 'YYYY-MM-DD' as LOCAL midnight (a bare date string would otherwise
 * shift a day in negative-offset timezones).
 * @param iso - Date-only ISO string.
 * @returns Local Date at midnight, or null when unparseable.
 */
const parseDateOnly = (iso: string): Date | null => {
  const parsed = new Date(`${iso}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * ISO weekday number of a date ('2026-10-05' → 1), matching the backend
 * `duty_assignments.weekday` convention 1=Senin .. 7=Minggu.
 * @param iso - Date-only ISO string.
 * @returns Weekday 1-7, or 0 when the input is unparseable.
 */
export const isoWeekday = (iso: string): number => {
  const parsed = parseDateOnly(iso);
  if (parsed === null) {
    return 0;
  }
  const dow = parsed.getDay();
  return dow === 0 ? 7 : dow;
};

/**
 * Today's date in the viewer's local timezone as 'YYYY-MM-DD' — the default
 * value for the dashboard date filter.
 * @returns Local date-only ISO string.
 */
export const localTodayIso = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${String(now.getFullYear())}-${month}-${day}`;
};

/**
 * Long Indonesian date for the header chip: '2026-10-05' → 'Senin, 05 Oktober 2026'.
 * @param iso - Date-only ISO string.
 * @returns Capitalized formatted date, or the raw input when unparseable.
 */
export const formatSchoolDate = (iso: string): string => {
  const parsed = parseDateOnly(iso);
  if (parsed === null) {
    return iso;
  }
  const text = parsed.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
};

/**
 * Short Indonesian weekday label for chart axes: '2026-10-05' → 'Sen'.
 * @param iso - Date-only ISO string.
 * @returns Localized short weekday, or the raw input when unparseable.
 */
export const formatWeekdayShort = (iso: string): string => {
  const parsed = parseDateOnly(iso);
  if (parsed === null) {
    return iso;
  }
  return parsed.toLocaleDateString('id-ID', { weekday: 'short' });
};

/**
 * Clock badge '06.24 WIB' from a full ISO timestamp, rendered in the viewer's
 * timezone (school times arrive as RFC3339 with the school offset).
 * @param iso - Timestamp string, or omitted for an unrecorded check-in.
 * @returns 'HH.mm WIB', or an em dash when missing/unparseable.
 */
export const formatClockWib = (iso?: string): string => {
  if (iso === undefined) {
    return '—';
  }
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }
  const hh = String(parsed.getHours()).padStart(2, '0');
  const mm = String(parsed.getMinutes()).padStart(2, '0');
  return `${hh}.${mm} WIB`;
};

/**
 * Audit-log timestamp '05 Okt 06.24' for the recent-activity feed.
 * @param iso - Full ISO timestamp string.
 * @returns Localized day/month + clock, or the raw input when unparseable.
 */
export const formatAuditStamp = (iso: string): string => {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return iso;
  }
  return parsed.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * One-to-two-letter initials for the feed avatar circles
 * ('Drs. Agus Subagyo' → 'DA').
 * @param name - Person's full name.
 * @returns Uppercase initials (max 2 chars), or '?' for empty input.
 */
export const initialsOf = (name: string): string => {
  const words = name
    .trim()
    .split(/\s+/u)
    .filter((word) => /^[A-Za-z]/u.test(word));
  if (words.length === 0) {
    return '?';
  }
  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
export const dashboardOptions = (params: DashboardParams = {}) =>
  queryOptions({
    queryKey: dashboardKeys.overview(params),
    queryFn: async () => await apiGet<DashboardData>('/dashboard', { ...params }),
  });

/**
 * GET /dashboard → aggregated overview (attendance, discipline, 7-day trend,
 * late/unrecorded lists, and — for admins — system counts + recent audit log).
 * @param params - `date` ('YYYY-MM-DD') and optional `class_id` filters.
 * @returns React Query result with the raw `DashboardData` DTO.
 */
export const useDashboard = (params: DashboardParams = {}) => useQuery(dashboardOptions(params));

export const dutyAssignmentsOptions = (date: string, enabled: boolean) =>
  queryOptions({
    queryKey: dashboardKeys.duty({ date }),
    queryFn: async () => {
      const result = await apiGet<DataList<DutyAssignment>>('/duty-assignments', {
        date,
        weekday: isoWeekday(date),
      });
      return result.data;
    },
    // GET /duty-assignments is admin-only on the backend — never fire it for other roles.
    enabled: enabled && date !== '',
  });

/**
 * GET /duty-assignments?date&weekday → gate-duty roster active on `date`.
 * @param date - ISO 'YYYY-MM-DD' selected date.
 * @param enabled - Pass `true` only for admins (endpoint is admin-gated).
 * @returns React Query result with `DutyAssignment[]`.
 */
export const useDutyAssignments = (date: string, enabled: boolean) =>
  useQuery(dutyAssignmentsOptions(date, enabled));

// ---------------------------------------------------------------------------
// KPI mappers
// ---------------------------------------------------------------------------
export type AttendanceKpi = {
  /** Percentage (1 decimal) of active students on time on the selected date. */
  percent: number;
  /** Percentage-point change of the on-time rate vs. the previous trend day. */
  delta: number | null;
};

const pointRate = (point: DashboardTrendPoint | undefined): number | null => {
  if (point === undefined || point.recorded <= 0) {
    return null;
  }
  return (point.present / point.recorded) * 100;
};

/**
 * Percentage-point difference between the last two trend points' attendance
 * rates (present ÷ recorded). `null` when fewer than two usable points.
 * @param trend - Dashboard 7-day trend array.
 * @returns Rounded delta (1 decimal) or null.
 */
export const trendDelta = (trend: DashboardTrendPoint[]): number | null => {
  const current = pointRate(trend.at(-1));
  const previous = pointRate(trend.at(-2));
  if (current === null || previous === null) {
    return null;
  }
  return Math.round((current - previous) * 10) / 10;
};

/**
 * Maps the dashboard `attendance` block + `trend` into the "Kehadiran Siswa"
 * KPI card: `percent` = present ÷ total_students; `delta` = trend-based
 * present ÷ recorded change over the last two trend points (null when the
 * trend is too short or has no recorded students).
 * @param data - Raw GET /dashboard payload.
 * @returns KPI view model for the overview card.
 */
export const attendanceKpi = (data: DashboardData): AttendanceKpi => ({
  percent:
    data.attendance.total_students > 0
      ? Math.round((data.attendance.present / data.attendance.total_students) * 1000) / 10
      : 0,
  delta: trendDelta(data.trend),
});

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  teacher: 'Guru',
  duty_teacher: 'Guru Piket',
  principal: 'Kepala Sekolah',
};

/**
 * Maps the backend `role` scope string from GET /dashboard to an Indonesian
 * display label; unknown/omitted roles fall back to 'Operator'.
 * @param role - Raw role string from the API (or undefined while loading).
 * @returns Human-readable role label.
 */
export const roleLabel = (role?: string): string =>
  role === undefined ? 'Operator' : (ROLE_LABELS[role] ?? 'Operator');
