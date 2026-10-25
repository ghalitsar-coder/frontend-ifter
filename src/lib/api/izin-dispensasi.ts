/**
 * Module API layer for `izin-dispensasi` (dispensation / permit management).
 *
 * Wired endpoints (relative to /api/v1; backend source of truth:
 * internal/transport/http/register_dispensations.go + dispensations.go):
 *   GET  /dispensations?status=&type=&student_id=&class_id=&from=&to=&limit=&offset=
 *   POST /dispensations                      — multipart create (file part "document")
 *   POST /dispensations/:id/verify           — decision { status, note } (backend is POST, not PATCH)
 *   GET  /dispensations/:id/document         — private document download
 *
 * The shared dto.ts has no dispensation types yet (shortcut: shared files are
 * frozen for this wave, so the snake_case wire types live next to their hooks).
 */
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, apiGet, apiPost, apiUpload, downloadFile } from '@/lib/api/client';
import type { Paginated, UserRole } from '@/lib/api/dto';

// ---------------------------------------------------------------------------
// Wire types (docs/API_ADDENDUM.md §6.2)
// ---------------------------------------------------------------------------
export type DispensationType = 'sick' | 'late' | 'permit' | 'other';
export type DispensationStatus = 'pending' | 'approved' | 'rejected';
export type DispensationDecision = Extract<DispensationStatus, 'approved' | 'rejected'>;

/** One `dispensations` row as returned by the list/detail endpoints. */
export type DispensationDto = {
  id: string;
  student_id: string;
  student_name: string;
  class_id: string;
  class_name: string;
  type: DispensationType;
  reason: string;
  start_date: string;
  end_date: string | null;
  status: DispensationStatus;
  document_available: boolean;
  submitted_by: string;
  verified_by: string | null;
  verified_at: string | null;
  note: string | null;
  created_at: string;
};

/** Single-resource envelope `{ "dispensation": { ... } }`. */
export type DispensationEnvelope = { dispensation: DispensationDto };

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------
export const dispensationKeys = {
  all: ['izin-dispensasi'] as const,
  list: (query?: DispensationQuery) => ['izin-dispensasi', 'list', query ?? {}] as const,
};

// ---------------------------------------------------------------------------
// Labels (hard-coded Indonesian domain content, like the rest of the module)
// ---------------------------------------------------------------------------
export const dispensationTypeLabels: Record<DispensationType, string> = {
  sick: 'Sakit',
  late: 'Terlambat',
  permit: 'Izin',
  other: 'Lainnya',
};

export const dispensationStatusLabels: Record<DispensationStatus, string> = {
  pending: 'Menunggu Verifikasi',
  approved: 'Disetujui',
  rejected: 'Ditolak',
};

const isDispensationType = (value: string): value is DispensationType =>
  Object.hasOwn(dispensationTypeLabels, value);

const isDispensationStatus = (value: string): value is DispensationStatus =>
  Object.hasOwn(dispensationStatusLabels, value);

/**
 * Indonesian label for a backend dispensation type; unknown codes shown verbatim.
 * @param type - Raw `type` field.
 * @returns Display label.
 */
export function typeLabel(type: string): string {
  return isDispensationType(type) ? dispensationTypeLabels[type] : type;
}

/**
 * Indonesian label for a backend dispensation status; unknown codes shown verbatim.
 * @param status - Raw `status` field.
 * @returns Display label.
 */
export function statusLabel(status: string): string {
  return isDispensationStatus(status) ? dispensationStatusLabels[status] : status;
}

// ---------------------------------------------------------------------------
// Date helpers (timezone-stable, parsed from the ISO text)
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
 * Format an ISO date/datetime as `7 Okt 2026`.
 * @param iso - ISO-8601 date or datetime string.
 * @returns Indonesian short-date label (`''` when unparsable).
 */
export function formatDayId(iso: string): string {
  const parts = /^(\d{4})-(\d{2})-(\d{2})/u.exec(iso);

  if (parts === null) {
    return '';
  }

  const monthIndex = Number(parts[2]) - 1;
  return `${Number(parts[3])} ${monthNamesId[monthIndex] ?? parts[2]} ${parts[1]}`;
}

/**
 * Period label for a dispensation: single day when `end_date` matches or is null.
 * @param startDate - `YYYY-MM-DD`.
 * @param endDate - nullable `YYYY-MM-DD`.
 * @returns Indonesian period label.
 */
export function periodLabel(startDate: string, endDate: string | null): string {
  const start = formatDayId(startDate);

  if (endDate === null || endDate === startDate) {
    return start;
  }

  return `${start} – ${formatDayId(endDate)}`;
}

// ---------------------------------------------------------------------------
// List filters → server query
// ---------------------------------------------------------------------------
export type DispensationQuery = {
  status?: DispensationStatus;
  type?: DispensationType;
  student_id?: string;
  class_id?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

/** Toolbar filters for the dispensation queue ('' / 'all' mean "no filter"). */
export type DispensationFilters = {
  status: DispensationStatus | 'all';
  type: DispensationType | 'all';
  from: string;
  to: string;
};

/** Rows per queue page (backend caps `limit` at 100). */
export const DISPENSATION_PAGE_SIZE = 10;

/**
 * Build the GET /dispensations query from toolbar filters + 1-based page.
 * @param filters - Active toolbar filters.
 * @param page - 1-based page number.
 * @returns Server query; empty/'all' filters are omitted.
 */
export function dispensationQueryFor(
  filters: DispensationFilters,
  page: number,
): DispensationQuery {
  const safePage = Math.max(1, page);

  return {
    status: filters.status === 'all' ? undefined : filters.status,
    type: filters.type === 'all' ? undefined : filters.type,
    from: filters.from || undefined,
    to: filters.to || undefined,
    limit: DISPENSATION_PAGE_SIZE,
    offset: (safePage - 1) * DISPENSATION_PAGE_SIZE,
  };
}

// ---------------------------------------------------------------------------
// Queue row view-model
// ---------------------------------------------------------------------------

/** One row of the dispensation queue table. */
export type DispensationRow = {
  id: string;
  studentName: string;
  className: string;
  typeLabel: string;
  statusLabel: string;
  status: DispensationStatus;
  period: string;
  reason: string;
  note: string;
  documentAvailable: boolean;
};

/**
 * Map a backend dispensation into a queue-table row.
 * @param item - Raw `DispensationDto`.
 * @returns Row view-model (note falls back to an em dash).
 */
export function toDispensationRow(item: DispensationDto): DispensationRow {
  return {
    id: item.id,
    studentName: item.student_name,
    className: item.class_name,
    typeLabel: typeLabel(item.type),
    statusLabel: statusLabel(item.status),
    status: item.status,
    period: periodLabel(item.start_date, item.end_date),
    reason: item.reason,
    note: item.note ?? '—',
    documentAvailable: item.document_available,
  };
}

// ---------------------------------------------------------------------------
// Roles allowed to verify (AttendanceOps: admin + teacher + duty_teacher)
// ---------------------------------------------------------------------------
export const dispensationVerifyRoles: UserRole[] = ['admin', 'teacher', 'duty_teacher'];

/**
 * Whether any of the signed-in roles may verify dispensations.
 * `principal` and `student` are read-only here; `staff_tu` only lists
 * (not in the frozen `UserRole` union yet, so it can never match).
 * @param roles - Roles from `useAuth()`.
 * @returns True when the verify action should be shown.
 */
export function canVerifyDispensation(roles: UserRole[]): boolean {
  return roles.some((role) => dispensationVerifyRoles.includes(role));
}

// ---------------------------------------------------------------------------
// Query options + hook
// ---------------------------------------------------------------------------
export const dispensationsOptions = (query: DispensationQuery) =>
  queryOptions({
    queryKey: dispensationKeys.list(query),
    queryFn: async () => await apiGet<Paginated<DispensationDto>>('/dispensations', { ...query }),
  });

/**
 * GET /dispensations — paginated dispensation queue with server filters.
 * @param query - status/type/from/to filters + limit/offset.
 * @returns React Query result with `{ data, total, limit, offset }`.
 */
export const useDispensations = (query: DispensationQuery) => useQuery(dispensationsOptions(query));

// ---------------------------------------------------------------------------
// Mutation: POST /dispensations (multipart create)
// ---------------------------------------------------------------------------

/** Staff-side create payload; `document` is the optional evidence file. */
export type CreateDispensationInput = {
  studentId: string;
  type: DispensationType;
  reason: string;
  startDate: string;
  endDate?: string;
  document?: File | null;
};

/**
 * Build the multipart body for POST /dispensations. Backend form fields are
 * snake_case and the file part is named `document` (register_dispensations.go).
 * @param input - Create payload.
 * @returns FormData ready for `apiUpload`.
 */
export function buildCreateDispensationFormData(input: CreateDispensationInput): FormData {
  const formData = new FormData();
  formData.set('student_id', input.studentId);
  formData.set('type', input.type);
  formData.set('reason', input.reason);
  formData.set('start_date', input.startDate);

  if (input.endDate !== undefined && input.endDate !== '') {
    formData.set('end_date', input.endDate);
  }

  if (input.document !== undefined && input.document !== null) {
    formData.set('document', input.document);
  }

  return formData;
}

/**
 * Mutation creating a dispensation on behalf of a student (multipart upload).
 * Invalidates the dispensation caches on success.
 * @returns React Query mutation for `POST /dispensations`.
 */
export function useCreateDispensation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDispensationInput) =>
      await apiUpload<DispensationEnvelope>(
        '/dispensations',
        buildCreateDispensationFormData(input),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dispensationKeys.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Mutation: POST /dispensations/:id/verify
// ---------------------------------------------------------------------------

/** Verify/decision payload (status is `approved` or `rejected`; note optional). */
export type VerifyDispensationInput = {
  id: string;
  status: DispensationDecision;
  note?: string;
};

/**
 * JSON body for the verify call — blank notes are omitted upstream.
 * @param input - Verify payload.
 * @returns `{ status, note? }` request body.
 */
export function buildVerifyDispensationBody(input: VerifyDispensationInput): {
  status: DispensationDecision;
  note?: string;
} {
  const note = input.note?.trim() ?? '';
  return note === '' ? { status: input.status } : { status: input.status, note };
}

/**
 * Mutation approving/rejecting one dispensation (audited server-side).
 * Invalidates the dispensation caches on success.
 * @returns React Query mutation for `POST /dispensations/:id/verify`.
 */
export function useVerifyDispensation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: VerifyDispensationInput) =>
      await apiPost<DispensationEnvelope>(
        `/dispensations/${input.id}/verify`,
        buildVerifyDispensationBody(input),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dispensationKeys.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Document download: GET /dispensations/:id/document
// ---------------------------------------------------------------------------

/**
 * Download the private dispensation document (PDF/image attachment).
 * @param id - Dispensation id.
 * @returns Blob + filename from Content-Disposition.
 */
export async function downloadDispensationDocument(
  id: string,
): Promise<{ blob: Blob; filename: string | null }> {
  return await downloadFile(`/dispensations/${id}/document`);
}

/**
 * Extract a user-facing message from a thrown value (ApiError envelope aware).
 * @param error - Caught value from a mutation or query.
 * @param fallback - Default Indonesian message when not an ApiError.
 * @returns Displayable message.
 */
export const dispensationErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof ApiError ? error.message : fallback;
