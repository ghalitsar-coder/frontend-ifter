/**
 * Module API layer for `koreksi-absensi` (attendance correction audit).
 *
 * Wired endpoints (relative to /api/v1):
 *   GET  /attendance/history                     — correction audit list (filters + pagination)
 *   GET  /attendance/records/:id                 — single record + corrections trail
 *   POST /attendance/records/:id/corrections     — submit a correction (reason mandatory);
 *                                                  each returned correction carries the
 *                                                  server-computed `evidence_hash`
 *   GET  /exports/attendance                     — XLSX audit export
 *
 * Also exposes the small DTO→UI mapper helpers used by the koreksi-absensi
 * components; backend JSON stays snake_case here and is reshaped at the edge.
 */
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiUpload, downloadFile } from '@/lib/api/client';
import type {
  AttendanceCorrection,
  AttendanceRecordDetail,
  AttendanceStatus as BackendAttendanceStatus,
  HistoryRecord,
  Paginated,
} from '@/lib/api/dto';
import type {
  AttendanceStatus as UiAttendanceStatus,
  CorrectionChangeFilter,
} from '@/types/attendanceCorrection';

// ---------------------------------------------------------------------------
// Query keys — module-scoped, following the shared ['<module>', ...] convention.
// ---------------------------------------------------------------------------
export const correctionKeys = {
  all: ['koreksi-absensi'] as const,
  history: (query?: HistoryQuery) => ['koreksi-absensi', 'history', query ?? {}] as const,
  record: (recordId: string) => ['koreksi-absensi', 'record', recordId] as const,
  evidence: (recordId: string) => ['koreksi-absensi', 'evidence', recordId] as const,
};

// ---------------------------------------------------------------------------
// Status mapping (backend five codes → the five UI attendance codes)
// ---------------------------------------------------------------------------
const uiStatusByBackend: Record<BackendAttendanceStatus, UiAttendanceStatus> = {
  present: 'hadir',
  late: 'hadir',
  sick: 'sakit',
  excused: 'izin',
  absent: 'alpa',
};

/**
 * Map a backend attendance status to the UI attendance code.
 * `late` collapses to `hadir`; the lateness itself is surfaced via `isLate`/notes.
 * @param status - Backend status string (`present|late|sick|excused|absent`).
 * @returns UI attendance code used by the status pills.
 */
const isBackendStatus = (status: string): status is BackendAttendanceStatus =>
  Object.hasOwn(uiStatusByBackend, status);

export function toUiStatus(status: string): UiAttendanceStatus {
  return isBackendStatus(status) ? uiStatusByBackend[status] : 'alpa';
}

/**
 * Map a UI attendance code to the backend status written into a correction.
 * @param status - UI attendance code.
 * @returns Backend attendance status. `dispensasi` has no backend equivalent
 * (shortcut: closest supported code is `excused`).
 */
export function toBackendStatus(status: UiAttendanceStatus): BackendAttendanceStatus {
  // shortcut: no dedicated `dispensasi` status in the backend, keep the UI option mapped to `excused`
  if (status === 'dispensasi') {
    return 'excused';
  }
  if (status === 'hadir') {
    return 'present';
  }
  if (status === 'alpa') {
    return 'absent';
  }
  if (status === 'sakit') {
    return 'sick';
  }
  if (status === 'izin') {
    return 'excused';
  }
  return 'absent';
}

export const changeFilterToStatus: Record<
  CorrectionChangeFilter,
  BackendAttendanceStatus | undefined
> = {
  all: undefined,
  alpa_sakit: 'sick',
  alpa_izin: 'excused',
  izin_hadir: 'present',
  // shortcut: no `dispensasi` status in the backend; `excused` is the nearest supported filter
  dispensasi: 'excused',
};

/** Target status options offered in the correction request matrix (backend codes, Indonesian labels). */
export type CorrectionTargetOption = {
  value: BackendAttendanceStatus;
  label: string;
  note: string;
};

export const correctionTargetOptions: CorrectionTargetOption[] = [
  { value: 'present', label: 'Hadir', note: 'Koreksi Piket' },
  { value: 'late', label: 'Terlambat', note: 'Hadir Terlambat' },
  { value: 'sick', label: 'Sakit', note: 'Dengan SKD' },
  { value: 'excused', label: 'Izin', note: 'Resmi Wali' },
  { value: 'absent', label: 'Alpa', note: 'Tanpa Keterangan' },
];

// ---------------------------------------------------------------------------
// Date helpers (timezone-stable: parsed from the ISO text, not Date objects)
// ---------------------------------------------------------------------------
const monthNamesId = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

/**
 * Format an ISO date/datetime as `24 Okt 2026` for the audit table.
 * @param iso - ISO-8601 date or datetime string.
 * @returns Indonesian short-date label (`''` when unparsable).
 */
export function formatDateId(iso: string): string {
  const parts = /^(\d{4})-(\d{2})-(\d{2})/u.exec(iso);

  if (parts === null) {
    return '';
  }

  const monthIndex = Number(parts[2]) - 1;
  return `${Number(parts[3])} ${monthNamesId[monthIndex] ?? parts[2]} ${parts[1]}`;
}

/**
 * Format the time component of an ISO datetime as `09.15`.
 * @param iso - ISO-8601 datetime string.
 * @returns `HH.MM` label (`''` when there is no time component).
 */
export function formatTimeId(iso: string): string {
  const match = /T(\d{2}):(\d{2})/u.exec(iso);
  return match === null ? '' : `${match[1]}.${match[2]}`;
}

/**
 * Current local date as `YYYY-MM-DD` (for <input type="date"> defaults).
 * @returns ISO day string.
 */
export function isoDayToday(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Default audit period: first day of the current month → today.
 * @returns `{ from, to }` ISO day strings.
 */
export function defaultHistoryRange(): { from: string; to: string } {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return { from: `${today.getFullYear()}-${month}-01`, to: isoDayToday() };
}

// ---------------------------------------------------------------------------
// Audit table row (history list)
// ---------------------------------------------------------------------------

/** One row of the correction audit table, mapped from GET /attendance/history. */
export type CorrectionRow = {
  id: string;
  recordId: string;
  studentId: string;
  loggedDate: string;
  loggedTime: string;
  student: { name: string; nis: string; className: string };
  sessionDate: string;
  sessionIso: string;
  sessionLabel: string;
  status: UiAttendanceStatus;
  isLate: boolean;
  reason: string;
  sourceLabel: string;
  closed: boolean;
};

const sourceLabels: Record<string, string> = {
  bulk: 'Entri Massal Guru',
  manual: 'Entri Manual Guru',
  auto_close: 'Penutupan Otomatis',
  import: 'Impor Data',
};

/**
 * Human label for the record source; unknown codes are shown verbatim.
 * @param source - Raw `source` field from the backend record.
 * @returns Indonesian source label.
 */
export function sourceLabel(source: string): string {
  return sourceLabels[source] ?? source;
}

/**
 * Session label for the audit row: check-in time when present, else lock state.
 * @param record - Raw history record.
 * @returns Indonesian session label.
 */
function sessionLabelFor(record: HistoryRecord): string {
  if (record.check_in_at !== undefined) {
    return `Absen ${formatTimeId(record.check_in_at)}`;
  }
  return record.closed ? 'Ditutup' : 'Tercatat';
}

/**
 * Map one GET /attendance/history record to an audit-table row.
 * The list endpoint carries no before/after pair, so the row shows the CURRENT
 * status; the correction trail is fetched per record from /attendance/records/:id.
 * @param record - Raw history record.
 * @returns Table row view-model.
 */
export function toCorrectionRow(record: HistoryRecord): CorrectionRow {
  const shortId =
    record.id.length > 6 ? record.id.slice(-6).toUpperCase() : record.id.toUpperCase();

  return {
    id: `LOG-${shortId}`,
    recordId: record.id,
    studentId: record.student_id,
    loggedDate: formatDateId(record.updated_at),
    loggedTime: formatTimeId(record.updated_at),
    student: {
      name: record.student_name,
      nis: record.student_number,
      className: record.class_name,
    },
    sessionDate: formatDateId(record.date),
    sessionIso: record.date,
    sessionLabel: sessionLabelFor(record),
    status: toUiStatus(record.status),
    isLate: record.status === 'late',
    reason: record.notes ?? '—',
    sourceLabel: sourceLabel(record.source),
    closed: record.closed,
  };
}

/**
 * Filter loaded rows by student name / NIS.
 * shortcut: GET /attendance/history has no text-search parameter, so the
 * toolbar search filters the currently loaded page client-side.
 * @param rows - Loaded audit rows.
 * @param query - Raw search text.
 * @returns Rows matching the query (all rows when the query is blank).
 */
export function filterRowsBySearch(rows: CorrectionRow[], query: string): CorrectionRow[] {
  const needle = query.trim().toLowerCase();

  if (needle === '') {
    return rows;
  }

  return rows.filter(
    (row) => row.student.name.toLowerCase().includes(needle) || row.student.nis.includes(needle),
  );
}

// ---------------------------------------------------------------------------
// Correction trail (record detail)
// ---------------------------------------------------------------------------

/**
 * Backend correction as it arrives on the wire since wave 2 (migration 000014):
 * the shared `AttendanceCorrection` DTO plus the server-computed canonical
 * sha256 `evidence_hash`. The backend OMITS the key for rows created before
 * the migration (Go `*string` with `omitempty`), so it is optional here.
 */
export type WireCorrection = AttendanceCorrection & {
  evidence_hash?: string | null;
};

/** Record detail with the wave-2 correction shape (evidence_hash included). */
export type CorrectionRecordDetail = Omit<AttendanceRecordDetail, 'corrections'> & {
  corrections: WireCorrection[];
};

/** One correction entry shown in the ledger modal. */
export type CorrectionTrailEntry = {
  id: string;
  fromStatus: UiAttendanceStatus;
  toStatus: UiAttendanceStatus;
  toNote: string;
  reason: string;
  loggedDate: string;
  loggedTime: string;
  officerName: string;
  /** Server-computed sha256 over the correction payload; null for pre-migration rows. */
  evidenceHash: string | null;
};

/**
 * Short Indonesian note for a backend status (used under the status pills).
 * @param status - Backend attendance status.
 * @returns Note label.
 */
export function statusNote(status: string): string {
  const option = correctionTargetOptions.find((target) => target.value === status);
  return option === undefined ? status : option.label;
}

/**
 * Map a backend AttendanceCorrection to a ledger trail entry.
 * The API only exposes `corrected_by_user_id` (no display name), so the
 * officer line shows the short user id. The `evidence_hash` is computed
 * server-side (correction-evidence package); this mapper only carries it
 * through — the UI never hashes anything itself.
 * @param correction - Raw correction from GET /attendance/records/:id.
 * @returns Trail view-model.
 */
export function toTrailEntry(correction: WireCorrection): CorrectionTrailEntry {
  return {
    id: correction.id,
    fromStatus: toUiStatus(correction.old_status),
    toStatus: toUiStatus(correction.new_status),
    toNote:
      correction.new_status === 'late' ? 'Hadir Terlambat' : statusNote(correction.new_status),
    reason: correction.reason,
    loggedDate: formatDateId(correction.corrected_at),
    loggedTime: formatTimeId(correction.corrected_at),
    officerName: `Operator ${correction.corrected_by_user_id.length > 4 ? correction.corrected_by_user_id.slice(-4) : correction.corrected_by_user_id}`,
    evidenceHash: correction.evidence_hash ?? null,
  };
}

/**
 * Short display form of a sha256 evidence hash: first 8 and last 8 hex chars.
 * @param hash - Full hash string from the backend.
 * @returns Truncated label (`hash` unchanged when 16 chars or shorter).
 */
export function shortHash(hash: string): string {
  return hash.length > 16 ? `${hash.slice(0, 8)}…${hash.slice(-8)}` : hash;
}

/**
 * Tolerant unwrap for GET /attendance/records/:id — accepts both the flat
 * record object and a `{ record: ... }` wrapper, and defaults `corrections`.
 * @param body - Raw parsed response body.
 * @returns Normalized record detail.
 */
export function unwrapRecordDetail(
  body: CorrectionRecordDetail & { record?: CorrectionRecordDetail },
): CorrectionRecordDetail {
  const detail = body.record ?? body;
  return { ...detail, corrections: detail.corrections ?? [] };
}

// ---------------------------------------------------------------------------
// Query options + hooks
// ---------------------------------------------------------------------------
export type HistoryQuery = {
  from?: string;
  to?: string;
  student_id?: string;
  class_id?: string;
  status?: string;
  limit?: number;
  offset?: number;
};

/** Rows per audit-table page (matches the legacy mock pagination). */
export const HISTORY_PAGE_SIZE = 5;

export const attendanceHistoryOptions = (query: HistoryQuery) =>
  queryOptions({
    queryKey: correctionKeys.history(query),
    queryFn: async () =>
      await apiGet<Paginated<HistoryRecord>>('/attendance/history', { ...query }),
  });

/**
 * GET /attendance/history — paginated attendance records feeding the correction audit list.
 * @param query - from/to/student/class/status filters + limit/offset.
 * @returns React Query result with `{ data, total, limit, offset }`.
 */
export const useAttendanceHistory = (query: HistoryQuery) =>
  useQuery(attendanceHistoryOptions(query));

export const attendanceRecordOptions = (recordId: string) =>
  queryOptions({
    queryKey: correctionKeys.record(recordId),
    enabled: recordId !== '',
    queryFn: async () => {
      const body = await apiGet<CorrectionRecordDetail & { record?: CorrectionRecordDetail }>(
        `/attendance/records/${recordId}`,
      );
      return unwrapRecordDetail(body);
    },
  });

/**
 * GET /attendance/records/:id — record detail incl. the corrections trail
 * (each correction carries the server-computed `evidence_hash`).
 * @param recordId - Attendance record id (hook stays disabled when empty).
 * @returns React Query result with `CorrectionRecordDetail`.
 */
export const useAttendanceRecord = (recordId: string) =>
  useQuery(attendanceRecordOptions(recordId));

// ---------------------------------------------------------------------------
// Toolbar filter → server query
// ---------------------------------------------------------------------------

/** Active toolbar filters for the audit list. */
export type CorrectionHistoryFilters = {
  search: string;
  change: CorrectionChangeFilter;
  classId: string;
  from: string;
  to: string;
};

/**
 * Build the GET /attendance/history query from toolbar filters + page number.
 * @param filters - Active toolbar filters.
 * @param page - 1-based page number.
 * @returns Server query with status/class/date filters and limit/offset.
 */
export function historyQueryFor(filters: CorrectionHistoryFilters, page: number): HistoryQuery {
  const safePage = Math.max(1, page);

  return {
    from: filters.from || undefined,
    to: filters.to || undefined,
    class_id: filters.classId === 'all' ? undefined : filters.classId,
    status: changeFilterToStatus[filters.change],
    limit: HISTORY_PAGE_SIZE,
    offset: (safePage - 1) * HISTORY_PAGE_SIZE,
  };
}

/** Pagination meta shared by the audit table footer. */
export type PaginationMeta = {
  page: number;
  totalPages: number;
  start: number;
  end: number;
  total: number;
};

/**
 * Compute pagination meta from the server `total` (client search may hide rows).
 * @param total - Server total for the current filter set.
 * @param page - Requested 1-based page.
 * @param shownCount - Rows actually rendered after the client-side search filter.
 * @returns Pagination meta for the table footer.
 */
export function pageMeta(total: number, page: number, shownCount: number): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / HISTORY_PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * HISTORY_PAGE_SIZE;

  return {
    page: safePage,
    totalPages,
    start: total === 0 ? 0 : startIndex + 1,
    end: startIndex + shownCount,
    total,
  };
}

// ---------------------------------------------------------------------------
// Mutation: POST /attendance/records/:id/corrections
// ---------------------------------------------------------------------------

/** Payload for the correction submit mutation. */
export type CorrectionInput = {
  recordId: string;
  status?: BackendAttendanceStatus;
  notes?: string;
  /** Mandatory — the backend rejects the request without a reason. */
  reason: string;
};

export type CorrectionSubmitVariables = CorrectionInput & { studentLabel: string };

/**
 * Mutation submitting an attendance correction (reason mandatory upstream).
 * The backend answers with the full record detail, every correction carrying
 * the server-computed `evidence_hash`; the fresh detail is seeded into the
 * record cache so the ledger modal shows the new hash immediately.
 * Invalidates the audit list, every cached record detail, and any other
 * module's `['attendance', ...]` caches on success.
 * @returns React Query mutation for `POST /attendance/records/:id/corrections`.
 */
export function useSubmitCorrection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: CorrectionSubmitVariables) => {
      const { recordId, studentLabel: _studentLabel, ...input } = variables;
      const body = await apiPost<CorrectionRecordDetail & { record?: CorrectionRecordDetail }>(
        `/attendance/records/${recordId}/corrections`,
        {
          status: input.status,
          notes: input.notes,
          reason: input.reason,
        },
      );
      return unwrapRecordDetail(body);
    },
    onSuccess: (detail, variables) => {
      queryClient.setQueryData(correctionKeys.record(variables.recordId), detail);
      void queryClient.invalidateQueries({ queryKey: correctionKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Correction evidence (API_ADDENDUM §6.6)
//   POST   /attendance/records/:id/corrections/evidence   (multipart)
//   GET    /attendance/records/:id/corrections/evidence
//   GET    /attendance/corrections/evidence/:id/download
//   DELETE /attendance/corrections/evidence/:id
// ---------------------------------------------------------------------------

/** Backend default cap (IFTER_IMPORTS_MAX_FILE_SIZE); the server stays authoritative. */
export const MAX_EVIDENCE_FILE_BYTES = 5 * 1024 * 1024;

/** `accept` for the file picker — the backend validates extension + content type. */
export const EVIDENCE_ACCEPT = '.pdf,.jpg,.jpeg,.png';

/** One evidence attachment as returned by the backend (never the stored key). */
export type CorrectionEvidence = {
  id: string;
  attendance_record_id: string;
  correction_id: string | null;
  file_name: string;
  content_type: string;
  size_bytes: number;
  note: string | null;
  uploaded_by: string;
  created_at: string;
};

export type EvidenceUploadInput = {
  recordId: string;
  file: File;
  note?: string;
  /** Optional pin to a specific correction; empty links the newest one. */
  correctionId?: string;
};

const evidenceNamePattern = /\.(pdf|jpe?g|png)$/iu;

/**
 * Human-readable file size for the evidence list.
 * @param bytes - `size_bytes` from the backend.
 * @returns e.g. `420 KB` / `1.4 MB`.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Client-side guard mirroring the backend evidence rules.
 * @param file - File picked by the user.
 * @returns Indonesian error message, or null when the file is acceptable.
 */
export function evidenceFileError(file: File): string | null {
  if (file.size === 0) {
    return 'Berkas kosong — pilih berkas lain.';
  }
  if (file.size > MAX_EVIDENCE_FILE_BYTES) {
    return `Ukuran berkas maksimal ${formatFileSize(MAX_EVIDENCE_FILE_BYTES)}.`;
  }
  if (!evidenceNamePattern.test(file.name)) {
    return 'Format berkas harus PDF, JPG, JPEG, atau PNG.';
  }
  return null;
}

/**
 * Build the multipart body for POST …/corrections/evidence.
 * @param input - File plus optional note / correction id.
 * @returns FormData with the `file` part and non-empty text fields.
 */
export function buildEvidenceFormData(input: Omit<EvidenceUploadInput, 'recordId'>): FormData {
  const formData = new FormData();
  formData.append('file', input.file);
  if (input.note !== undefined && input.note.trim() !== '') {
    formData.append('note', input.note.trim());
  }
  if (input.correctionId !== undefined && input.correctionId !== '') {
    formData.append('correction_id', input.correctionId);
  }
  return formData;
}

/**
 * Upload one evidence file for an attendance record.
 * @param input - Record id, file and optional metadata.
 * @returns The stored evidence item.
 */
export async function uploadCorrectionEvidence(
  input: EvidenceUploadInput,
): Promise<CorrectionEvidence> {
  const { evidence } = await apiUpload<{ evidence: CorrectionEvidence }>(
    `/attendance/records/${input.recordId}/corrections/evidence`,
    buildEvidenceFormData(input),
  );
  return evidence;
}

/**
 * GET /attendance/records/:id/corrections/evidence.
 * @param recordId - Attendance record id (hook stays disabled when empty).
 * @returns React Query result with the evidence list.
 */
export const correctionEvidenceOptions = (recordId: string) =>
  queryOptions({
    queryKey: correctionKeys.evidence(recordId),
    enabled: recordId !== '',
    queryFn: async () => {
      const result = await apiGet<{ data: CorrectionEvidence[] }>(
        `/attendance/records/${recordId}/corrections/evidence`,
      );
      return result.data;
    },
  });

export const useCorrectionEvidence = (recordId: string) =>
  useQuery(correctionEvidenceOptions(recordId));

/**
 * Mutation for POST …/corrections/evidence; refreshes the record's evidence list.
 * @returns React Query mutation over EvidenceUploadInput.
 */
export function useUploadCorrectionEvidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: EvidenceUploadInput) => await uploadCorrectionEvidence(input),
    onSuccess: (_evidence, input) => {
      void queryClient.invalidateQueries({ queryKey: correctionKeys.evidence(input.recordId) });
    },
  });
}

/**
 * Download a private evidence file (admin/teacher scope enforced server-side).
 * @param evidenceId - Evidence id from the list.
 * @returns Blob + filename from Content-Disposition.
 */
export async function downloadCorrectionEvidence(evidenceId: string) {
  return await downloadFile(`/attendance/corrections/evidence/${evidenceId}/download`);
}

/**
 * Trigger the browser save dialog for a downloaded evidence blob.
 * @param blob - Response body returned by the download endpoint.
 * @param filename - Suggested file name.
 */
export function saveDownloadedBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Mutation for DELETE /attendance/corrections/evidence/:id.
 * @returns React Query mutation over {evidenceId, recordId}.
 */
export function useDeleteCorrectionEvidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: { evidenceId: string; recordId: string }) =>
      await apiDelete<null>(`/attendance/corrections/evidence/${variables.evidenceId}`),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: correctionKeys.evidence(variables.recordId) });
    },
  });
}

/**
 * Locate the attendance record for one student on one date (used by the
 * request modal, since POST corrections targets a record id).
 * @param studentId - Selected student id.
 * @param date - ISO day (`YYYY-MM-DD`).
 * @returns React Query result with at most one matching history record.
 */
export const recordLookupOptions = (studentId: string, date: string) =>
  queryOptions({
    queryKey: correctionKeys.history({
      student_id: studentId,
      from: date,
      to: date,
      limit: 1,
      offset: 0,
    }),
    enabled: studentId !== '' && date !== '',
    queryFn: async () => {
      const page = await apiGet<Paginated<HistoryRecord>>('/attendance/history', {
        student_id: studentId,
        from: date,
        to: date,
        limit: 1,
        offset: 0,
      });
      return page.data[0] ?? null;
    },
  });

/**
 * GET /attendance/history scoped to one student+date (record lookup for the request form).
 * @param studentId - Selected student id.
 * @param date - ISO day.
 * @returns React Query result with the matching record or null.
 */
export const useRecordLookup = (studentId: string, date: string) =>
  useQuery(recordLookupOptions(studentId, date));

/**
 * XLSX export of the attendance audit for the active period.
 * @param filters - Active toolbar filters (only from/to are supported by the export endpoint).
 * @returns Blob + filename from Content-Disposition.
 */
export async function exportAttendanceAudit(filters: CorrectionHistoryFilters) {
  return await downloadFile('/exports/attendance', {
    from: filters.from || undefined,
    to: filters.to || undefined,
  });
}
