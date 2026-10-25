import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, apiPost } from '@/lib/api/client';
import type {
  DisciplineRecord,
  DisciplineRecordDetail,
  DisciplineReport,
  Paginated,
  StudentDisciplineProfile,
} from '@/lib/api/dto';
import type { DisciplineFilterState, DisciplineWatchStudent } from '@/types/discipline';

// ---------------------------------------------------------------------------
// Module-local query keys — extend the foundation `queryKeys` convention.
// Root `['discipline']` also covers the shared `['discipline','categories']`
// key from `queryKeys.disciplineCategories`, so one invalidation refreshes all.
// ---------------------------------------------------------------------------
export const kedisiplinanQueryKeys = {
  root: ['discipline'] as const,
  records: (query: DisciplineRecordsQuery) => ['discipline', 'records', query] as const,
  record: (id: string) => ['discipline', 'records', id, 'detail'] as const,
  studentProfile: (id: string) => ['discipline', 'students', id] as const,
  report: (query: DisciplineReportQuery) => ['discipline', 'report', query] as const,
};

// ---------------------------------------------------------------------------
// Query params
// ---------------------------------------------------------------------------
export type DisciplineRecordsQuery = {
  from?: string;
  to?: string;
  student_id?: string;
  class_id?: string;
  category_id?: string;
  recorded_by?: string;
  status?: string;
  limit?: number;
  offset?: number;
};

export type DisciplineReportQuery = {
  from?: string;
  to?: string;
  class_id?: string;
  category_id?: string;
  status?: string;
};

/** POST /discipline/records body (all fields required by the backend). */
export type CreateDisciplineRecordInput = {
  student_id: string;
  category_id: string;
  /** RFC3339 or 'YYYY-MM-DDTHH:mm' — bare times are read in the school timezone. */
  occurred_at: string;
  description: string;
};

/** POST /discipline/records/:id/followups body (status must be a backend status). */
export type CreateFollowupInput = {
  status: string;
  notes?: string;
};

/** PATCH /discipline/records/:id/points body (admin only; reason mandatory). */
export type UpdatePointsInput = {
  points: number;
  reason: string;
};

/**
 * Modal form payload. Replaces the shared NewIncidentFormData shape (which was
 * mock-keyed) with backend ids; location/action are folded into `description`
 * by the manager because the record schema has no separate columns.
 */
export type NewIncidentFormData = {
  studentId: string;
  categoryId: string;
  dateTime: string;
  location: string;
  description: string;
  immediateAction: string;
};

// ---------------------------------------------------------------------------
// Hooks — one per wired endpoint
// ---------------------------------------------------------------------------
const disciplineRecordsOptions = (query: DisciplineRecordsQuery) =>
  queryOptions({
    queryKey: kedisiplinanQueryKeys.records(query),
    queryFn: async () =>
      await apiGet<Paginated<DisciplineRecord>>('/discipline/records', { ...query }),
  });

/**
 * GET /discipline/records → paginated violation records with server-side filters.
 * @param query - Filters + limit/offset.
 * @returns React Query result with `Paginated<DisciplineRecord>`.
 */
export const useDisciplineRecords = (query: DisciplineRecordsQuery) =>
  useQuery(disciplineRecordsOptions(query));

const disciplineRecordDetailOptions = (id: string) =>
  queryOptions({
    queryKey: kedisiplinanQueryKeys.record(id),
    queryFn: async () =>
      await apiGet<DisciplineRecordDetail>(`/discipline/records/${encodeURIComponent(id)}`),
    enabled: id !== '',
  });

/**
 * GET /discipline/records/:id → single record plus its followup history.
 * @param id - Record id ('' disables the query).
 * @returns React Query result with `DisciplineRecordDetail`.
 */
export const useDisciplineRecordDetail = (id: string) =>
  useQuery(disciplineRecordDetailOptions(id));

/**
 * GET /discipline/students/:id → per-student discipline summary (total points,
 * per-category breakdown, full record list). Exported for `useQueries` fan-out.
 * @param id - Student id ('' disables the query).
 * @returns React Query options object.
 */
export const studentDisciplineProfileOptions = (id: string) =>
  queryOptions({
    queryKey: kedisiplinanQueryKeys.studentProfile(id),
    queryFn: async () =>
      await apiGet<StudentDisciplineProfile>(`/discipline/students/${encodeURIComponent(id)}`),
    enabled: id !== '',
  });

/**
 * GET /discipline/students/:id → per-student summary for sidebar/detail views.
 * @param id - Student id ('' disables the query).
 * @returns React Query result with `StudentDisciplineProfile`.
 */
export const useStudentDisciplineProfile = (id: string) =>
  useQuery(studentDisciplineProfileOptions(id));

const disciplineReportOptions = (query: DisciplineReportQuery) =>
  queryOptions({
    queryKey: kedisiplinanQueryKeys.report(query),
    queryFn: async () => await apiGet<DisciplineReport>('/reports/discipline', { ...query }),
  });

/**
 * GET /reports/discipline → aggregate report (totals, by_category, by_status).
 * @param query - Period + optional filters.
 * @returns React Query result with `DisciplineReport`.
 */
export const useDisciplineReport = (query: DisciplineReportQuery) =>
  useQuery(disciplineReportOptions(query));

/**
 * POST /discipline/records → record a new violation; refreshes every discipline query.
 * @returns Mutation taking `CreateDisciplineRecordInput`.
 */
export const useCreateDisciplineRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDisciplineRecordInput) =>
      await apiPost<DisciplineRecordDetail>('/discipline/records', input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: kedisiplinanQueryKeys.root });
    },
  });
};

/**
 * POST /discipline/records/:id/followups → move a record to a new status.
 * @param recordId - Record being updated.
 * @returns Mutation taking `CreateFollowupInput`.
 */
export const useAddDisciplineFollowup = (recordId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateFollowupInput) =>
      await apiPost<DisciplineRecordDetail>(
        `/discipline/records/${encodeURIComponent(recordId)}/followups`,
        input,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: kedisiplinanQueryKeys.root });
    },
  });
};

/**
 * PATCH /discipline/records/:id/points → admin correction of a record's points
 * (reason is required and logged). Returns the full updated detail and
 * refreshes every discipline query on success.
 * @param recordId - Record whose points are corrected.
 * @returns Mutation taking `UpdatePointsInput`.
 */
export const useUpdateDisciplinePoints = (recordId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdatePointsInput) =>
      await apiPatch<DisciplineRecordDetail>(
        `/discipline/records/${encodeURIComponent(recordId)}/points`,
        input,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: kedisiplinanQueryKeys.root });
    },
  });
};

// ---------------------------------------------------------------------------
// Status mapping (backend: new/under_review/in_followup/completed/cancelled —
// UI keeps the existing Indonesian badge values)
// ---------------------------------------------------------------------------
/** Extended IncidentStatus from '@/types/discipline' with the backend 'cancelled' state. */
export type IncidentDisplayStatus = 'baru' | 'tinjau' | 'tindak' | 'selesai' | 'dibatalkan';

const BACKEND_TO_DISPLAY: Record<string, IncidentDisplayStatus> = {
  new: 'baru',
  under_review: 'tinjau',
  in_followup: 'tindak',
  completed: 'selesai',
  cancelled: 'dibatalkan',
};

const DISPLAY_TO_BACKEND: Record<string, string> = {
  baru: 'new',
  tinjau: 'under_review',
  tindak: 'in_followup',
  selesai: 'completed',
  dibatalkan: 'cancelled',
};

/**
 * Map a backend record status to the UI badge status (unknown → 'baru').
 * @param status - Backend status string.
 * @returns Display status.
 */
export const recordStatusToDisplay = (status: string): IncidentDisplayStatus =>
  BACKEND_TO_DISPLAY[status] ?? 'baru';

/**
 * Map a UI status filter value to the API `status` param ('' → undefined).
 * @param status - Selected filter value.
 * @returns Backend status or undefined.
 */
export const displayStatusToRecordParam = (status: string): string | undefined =>
  DISPLAY_TO_BACKEND[status];

// ---------------------------------------------------------------------------
// Date helpers (all school-local dates are WIB / Asia-Jakarta)
// ---------------------------------------------------------------------------
const WIB_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const WIB_DATE_LABEL = new Intl.DateTimeFormat('id-ID', {
  timeZone: 'Asia/Jakarta',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const WIB_TIME_LABEL = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Jakarta',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/**
 * Today's school-local date as 'YYYY-MM-DD'.
 * @param now - Reference instant (defaults to current time; pass a Date in tests).
 * @returns ISO date string in Asia/Jakarta.
 */
export const todayInJakarta = (now: Date = new Date()): string => WIB_FORMATTER.format(now);

/**
 * Shift an ISO date string by N days (UTC arithmetic, string in/out).
 *
 * @param iso - 'YYYY-MM-DD' date string.
 * @param days - Day offset (may be negative).
 * @returns Shifted 'YYYY-MM-DD' date string.
 */
const addDaysIso = (iso: string, days: number): string => {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
};

/**
 * Convert the UI period selector to a from/to date range (inclusive, WIB).
 * 'bulan' = current calendar month to date, '7hari' = last 7 days,
 * 'semester' = active academic-year start (fallback: current calendar year start).
 * @param period - One of 'bulan' | '7hari' | 'semester'.
 * @param reference - Today as 'YYYY-MM-DD' in school-local time.
 * @param academicYearStart - Active academic year start_date, if known.
 * @returns `{ from, to }` ISO date strings.
 */
export const periodRange = (
  period: string,
  reference: string,
  academicYearStart?: string,
): { from: string; to: string } => {
  if (period === '7hari') {
    return { from: addDaysIso(reference, -6), to: reference };
  }
  if (period === 'semester') {
    return { from: academicYearStart ?? `${reference.slice(0, 4)}-01-01`, to: reference };
  }

  return { from: `${reference.slice(0, 7)}-01`, to: reference };
};

/**
 * Format an RFC3339 timestamp as the table's Indonesian date label, e.g. '05 Okt 2026'.
 * @param iso - Timestamp string.
 * @returns Localized day/month/year label ('—' when unparseable).
 */
export const formatIncidentDate = (iso: string): string => {
  const date = new Date(iso);

  return Number.isNaN(date.getTime()) ? '—' : WIB_DATE_LABEL.format(date);
};

/**
 * Format an RFC3339 timestamp as the table's time label, e.g. '07:25 WIB'.
 * @param iso - Timestamp string.
 * @returns Localized HH:mm label plus the WIB suffix.
 */
export const formatIncidentTime = (iso: string): string => {
  const date = new Date(iso);

  return Number.isNaN(date.getTime()) ? '—' : `${WIB_TIME_LABEL.format(date)} WIB`;
};

// ---------------------------------------------------------------------------
// DTO ↔ UI row mappers
// ---------------------------------------------------------------------------
/**
 * Table row shape: mirrors DisciplineIncident from '@/types/discipline' but
 * carries backend ids (class/category/student) and the extended 'dibatalkan'
 * status. Shared type file is untouched by design.
 */
export type DisciplineIncidentRow = {
  id: string;
  date: string;
  time: string;
  studentId: string;
  studentName: string;
  studentNis: string;
  studentClass: string;
  studentInitials: string;
  studentAvatarBg: string;
  categoryId: string;
  categoryLabel: string;
  points: number;
  description: string;
  location: string;
  recorderName: string;
  recorderRole: string;
  studentTotalPoints: number;
  studentPointStatus: string;
  status: IncidentDisplayStatus;
};

/**
 * The backend stores a single `description` field; the UI additionally captures
 * location and immediate action, so they are appended with visible markers.
 * Empty values are left out entirely.
 * @param description - Chronology text (required).
 * @param location - Incident place, optional.
 * @param action - Immediate teacher action, optional.
 * @returns Composed description sent to POST /discipline/records.
 */
export const composeIncidentDescription = (
  description: string,
  location: string,
  action: string,
): string => {
  const parts = [description.trim()];
  const loc = location.trim();
  const act = action.trim();

  if (loc !== '') {
    parts.push(`Lokasi: ${loc}`);
  }
  if (act !== '') {
    parts.push(`Tindakan: ${act}`);
  }

  return parts.join(' — ');
};

/**
 * Reverse of composeIncidentDescription for display. Records created outside
 * this UI (no markers) fall back to the school-wide default place.
 * @param description - Stored description text.
 * @returns Location fragment or the 'Lingkungan Sekolah' default.
 */
export const incidentLocationFromDescription = (description: string): string => {
  const raw = /\bLokasi:\s*(.+?)(?:\s+—\s*Tindakan:|\s*$)/u.exec(description)?.[1]?.trim();

  return raw === undefined || raw === '' ? 'Lingkungan Sekolah' : raw;
};

/**
 * Build avatar initials from a student name.
 *
 * @param name - Student full name.
 * @returns Up to two uppercase word-initial letters, 'ST' for empty names.
 */
export const initialsOf = (name: string): string =>
  name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'ST';

/**
 * Map a backend DisciplineRecord to the UI row shape. Avatar background and
 * point-status label are decoration owned by the manager (styling helpers).
 * @param record - Backend record.
 * @param studentTotalPoints - Cumulative points from GET /discipline/students/:id (0 while loading).
 * @returns Row for the incident table.
 */
export const toIncidentRow = (
  record: DisciplineRecord,
  studentTotalPoints: number,
): DisciplineIncidentRow => ({
  id: record.id,
  date: formatIncidentDate(record.occurred_at),
  time: formatIncidentTime(record.occurred_at),
  studentId: record.student_id,
  studentName: record.student_name,
  studentNis: record.student_number,
  studentClass: record.class_name,
  studentInitials: initialsOf(record.student_name),
  studentAvatarBg: '',
  categoryId: record.category_id,
  categoryLabel: `${record.category_name} (+${record.points})`,
  points: record.points,
  description: record.description,
  location: incidentLocationFromDescription(record.description),
  recorderName: record.recorded_by_name,
  // shortcut: no per-recorder role field on the backend record, keep static label
  recorderRole: 'Guru Pencatat',
  studentTotalPoints,
  studentPointStatus: '',
  status: recordStatusToDisplay(record.status),
});

// ---------------------------------------------------------------------------
// Client-side refinement (backend has no free-text search on records and no
// tab semantics, so those stay in the browser over the fetched page)
// ---------------------------------------------------------------------------
/**
 * Apply the search box and quick tabs to server-filtered rows. Class, category
 * and status dropdowns are already enforced server-side via query params.
 * @param rows - Mapped incident rows of the current page.
 * @param filter - Current filter bar state.
 * @returns Rows to render.
 */
export const filterIncidentRows = (
  rows: DisciplineIncidentRow[],
  filter: DisciplineFilterState,
): DisciplineIncidentRow[] =>
  rows.filter((row) => {
    if (
      filter.quickTab === 'need_action' &&
      (row.status === 'selesai' || row.status === 'dibatalkan')
    ) {
      return false;
    }
    if (filter.quickTab === 'resolved' && row.status !== 'selesai') {
      return false;
    }
    if (filter.quickTab === 'high_points' && row.studentTotalPoints < 30) {
      return false;
    }

    const q = filter.search.trim().toLowerCase();
    if (q === '') {
      return true;
    }

    return (
      row.studentName.toLowerCase().includes(q) ||
      row.studentNis.includes(q) ||
      row.description.toLowerCase().includes(q) ||
      row.location.toLowerCase().includes(q)
    );
  });

// ---------------------------------------------------------------------------
// Sidebar watchlist — derived from the fetched page (no dedicated backend
// endpoint exists for a "high risk students" list)
// ---------------------------------------------------------------------------
const watchRisk = (points: number): DisciplineWatchStudent['riskLevel'] => {
  if (points >= 50) {
    return 'tinggi';
  }
  if (points >= 35) {
    return 'waspada';
  }
  return 'tinjau';
};

const watchAction = (points: number): DisciplineWatchStudent['actionType'] => {
  if (points >= 50) {
    return 'parent_call';
  }
  if (points >= 35) {
    return 'schedule_bk';
  }
  return 'review_history';
};

/**
 * Build the guidance watchlist from the current page rows: unique students
 * with >= 30 cumulative points, highest first.
 * @param rows - Mapped incident rows.
 * @returns Watchlist entries for the sidebar.
 */
export const toWatchlist = (rows: DisciplineIncidentRow[]): DisciplineWatchStudent[] => {
  const byStudent = new Map<string, DisciplineWatchStudent>();

  for (const row of rows) {
    if (row.studentTotalPoints < 30) {
      continue;
    }
    if (byStudent.has(row.studentId)) {
      continue;
    }
    byStudent.set(row.studentId, {
      id: row.studentId,
      name: row.studentName,
      nis: row.studentNis,
      className: `Kelas ${row.studentClass}`,
      points: row.studentTotalPoints,
      statusLabel: row.studentPointStatus,
      riskLevel: watchRisk(row.studentTotalPoints),
      actionType: watchAction(row.studentTotalPoints),
    });
  }

  return [...byStudent.values()].toSorted((a, b) => b.points - a.points);
};

// ---------------------------------------------------------------------------
// Report → KPI cards
// ---------------------------------------------------------------------------
/**
 * Map GET /reports/discipline aggregates to the four KPI cards.
 * needAction counts every status except completed/cancelled.
 * @param report - Backend report payload.
 * @returns Card numbers.
 */
export const reportMetrics = (
  report: DisciplineReport,
): {
  totalIncidents: number;
  accumulatedPoints: number;
  needActionCount: number;
  resolvedCount: number;
} => {
  let resolved = 0;
  let closed = 0;
  for (const row of report.by_status) {
    if (row.status === 'completed') {
      resolved += row.count;
    }
    if (row.status === 'completed' || row.status === 'cancelled') {
      closed += row.count;
    }
  }

  return {
    totalIncidents: report.total_records,
    accumulatedPoints: report.total_points,
    needActionCount: Math.max(0, report.total_records - closed),
    resolvedCount: resolved,
  };
};

// ---------------------------------------------------------------------------
// Pagination helper
// ---------------------------------------------------------------------------
/**
 * Window of page numbers around the current page (max 5 slots, no empty window).
 * @param page - 1-based current page.
 * @param totalPages - Total pages given limit/total.
 * @returns Ascending page numbers to render as buttons.
 */
export const pageWindow = (page: number, totalPages: number): number[] => {
  if (totalPages <= 0) {
    return [1];
  }
  const size = Math.min(5, totalPages);
  let start = Math.max(1, Math.min(page - 2, totalPages - size + 1));
  start = Math.max(1, start);

  return Array.from({ length: size }, (_, index) => start + index);
};
