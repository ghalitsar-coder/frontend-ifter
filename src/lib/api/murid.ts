/**
 * Module API layer for `murid` — the student self-service portal (`/my/*`).
 *
 * Wired endpoints (relative to /api/v1, groups.My = role `student` only;
 * every response is resolved server-side from `students.user_id`, a client
 * never sends a student id):
 *   GET  /my/profile                       — { "profile": {...} } the linked student row
 *   GET  /my/attendance-summary?from=&to=  — own aggregate, same shape as GET /attendance/summary
 *   GET  /my/discipline?from=&to=&limit=&offset= — own discipline records
 *   GET  /my/dispensations?status=&limit=&offset= — own dispensation requests
 *   POST /my/dispensations                 — create own request (JSON or multipart with "document")
 *
 * Exact shapes: internal/transport/http/{student_accounts,dispensations}.go
 * + internal/studentaccounts/types.go + internal/dispensations/types.go.
 * from/to are MANDATORY on the date-ranged reads (helpers.go parseDateRange).
 */
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiUpload } from '@/lib/api/client';
import type { AttendanceSummaryResponse, Paginated } from '@/lib/api/dto';

// ---------------------------------------------------------------------------
// Query keys — module-scoped, following the ['<module>', ...] convention.
// ---------------------------------------------------------------------------
export const muridKeys = {
  all: ['murid'] as const,
  profile: ['murid', 'profile'] as const,
  attendanceSummary: (range: DateRangeParams) => ['murid', 'attendance-summary', range] as const,
  discipline: (query: MyDisciplineParams) => ['murid', 'discipline', query] as const,
  dispensations: (query: MyDispensationsParams) => ['murid', 'dispensations', query] as const,
};

// ---------------------------------------------------------------------------
// DTOs (local: dto.ts is shared/frozen and carries no /my/* types yet)
// ---------------------------------------------------------------------------
/** GET /my/profile payload. */
export type MyProfile = {
  student_id: string;
  student_number: string;
  full_name: string;
  class_id: string | null;
  class_name: string | null;
};

type ProfileEnvelope = {
  profile: MyProfile;
};

/** `from`/`to` are YYYY-MM-DD and required by the backend date-range parser. */
export type DateRangeParams = {
  from: string;
  to: string;
};

/** One GET /my/discipline row. */
export type MyDisciplineItem = {
  id: string;
  occurred_at: string;
  category_name: string;
  description: string;
  points: number;
  status: string;
};

export type MyDisciplineParams = DateRangeParams & {
  limit?: number;
  offset?: number;
};

/** One dispensation row (identical item shape to GET /dispensations). */
export type DispensationItem = {
  id: string;
  student_id: string;
  student_name: string;
  class_id: string;
  class_name: string;
  type: string;
  reason: string;
  start_date: string;
  end_date: string | null;
  status: string;
  document_available: boolean;
  submitted_by: string;
  verified_by: string | null;
  verified_at: string | null;
  note: string | null;
  created_at: string;
};

export type MyDispensationsParams = {
  status?: string;
  limit?: number;
  offset?: number;
};

type DispensationEnvelope = {
  dispensation: DispensationItem;
};

/** POST /my/dispensations input; `document` switches the call to multipart. */
export type CreateMyDispensationInput = {
  type: string;
  reason: string;
  start_date: string;
  end_date?: string;
  document?: File | null;
};

// ---------------------------------------------------------------------------
// Mappers & small helpers (pure, unit-tested)
// ---------------------------------------------------------------------------
const pad2 = (value: number): string => value.toString().padStart(2, '0');

/**
 * `days`-wide inclusive YYYY-MM-DD range ending at `today` (GET /my/* reads
 * require explicit from/to; the portal opens with the last 30 days).
 * @param days - Range width in days (>= 1).
 * @param today - Reference date (injectable for tests).
 * @returns `{ from, to }` ISO date strings.
 */
export const lastNDaysRange = (days: number, today = new Date()): DateRangeParams => {
  const to = today;
  const from = new Date(today);
  from.setDate(from.getDate() - (Math.max(days, 1) - 1));
  const iso = (d: Date): string =>
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  return { from: iso(from), to: iso(to) };
};

const ATTENDANCE_LABELS_ID: Record<string, string> = {
  present: 'Hadir',
  late: 'Terlambat',
  sick: 'Sakit',
  excused: 'Izin',
  absent: 'Alpa',
};

/**
 * Indonesian label for a backend attendance status.
 * @param status - present/late/sick/excused/absent (falls through for unknown codes).
 * @returns Display label.
 */
export const attendanceStatusLabel = (status: string): string =>
  ATTENDANCE_LABELS_ID[status] ?? status;

const DISPENSATION_TYPE_LABELS_ID: Record<string, string> = {
  sick: 'Sakit',
  late: 'Terlambat',
  permit: 'Izin',
  other: 'Lainnya',
};

/**
 * Indonesian label for a dispensation type (sick|late|permit|other).
 * @param type - Backend type code.
 * @returns Display label.
 */
export const dispensationTypeLabel = (type: string): string =>
  DISPENSATION_TYPE_LABELS_ID[type] ?? type;

const DISPENSATION_STATUS_LABELS_ID: Record<string, string> = {
  pending: 'Menunggu Verifikasi',
  approved: 'Disetujui',
  rejected: 'Ditolak',
};

/**
 * Indonesian label for a dispensation status (pending|approved|rejected).
 * @param status - Backend status code.
 * @returns Display label.
 */
export const dispensationStatusLabel = (status: string): string =>
  DISPENSATION_STATUS_LABELS_ID[status] ?? status;

/**
 * Display text for a dispensation date span (`end_date` is optional).
 * @param item - Dispensation row.
 * @returns `'YYYY-MM-DD'` or `'YYYY-MM-DD s/d YYYY-MM-DD'`.
 */
export const dispensationDateLabel = (item: DispensationItem): string =>
  item.end_date === null || item.end_date === '' || item.end_date === item.start_date
    ? item.start_date
    : `${item.start_date} s/d ${item.end_date}`;

/**
 * JSON body for POST /my/dispensations (empty end_date omitted entirely).
 * @param input - Portal form input.
 * @returns snake_case request body.
 */
export const toCreateMyDispensationJson = (
  input: CreateMyDispensationInput,
): Record<string, string> => {
  const body: Record<string, string> = {
    type: input.type,
    reason: input.reason,
    start_date: input.start_date,
  };
  if (input.end_date !== undefined && input.end_date !== '') {
    body.end_date = input.end_date;
  }
  return body;
};

/**
 * Optional form fields arrive as `undefined` (absent) or `null` (cleared).
 * @param value - The `document` slot of the create input.
 * @returns Whether a real File was attached.
 */
const hasDocument = (value: CreateMyDispensationInput['document']): value is File =>
  value !== undefined && value !== null;

/**
 * Multipart form for POST /my/dispensations with a supporting document
 * (backend file part name is `document`, per dispensations.go bindCreate).
 * @param input - Portal form input including the file.
 * @returns FormData payload for apiUpload.
 */
export const toCreateMyDispensationForm = (input: CreateMyDispensationInput): FormData => {
  const form = new FormData();
  form.set('type', input.type);
  form.set('reason', input.reason);
  form.set('start_date', input.start_date);
  if (input.end_date !== undefined && input.end_date !== '') {
    form.set('end_date', input.end_date);
  }
  if (hasDocument(input.document)) {
    form.set('document', input.document);
  }
  return form;
};

// ---------------------------------------------------------------------------
// Query options
// ---------------------------------------------------------------------------
export const myProfileOptions = () =>
  queryOptions({
    queryKey: muridKeys.profile,
    queryFn: async () => {
      const result = await apiGet<ProfileEnvelope>('/my/profile');
      return result.profile;
    },
  });

export const myAttendanceSummaryOptions = (range: DateRangeParams) =>
  queryOptions({
    queryKey: muridKeys.attendanceSummary(range),
    queryFn: async () =>
      await apiGet<AttendanceSummaryResponse>('/my/attendance-summary', {
        ...range,
      }),
    enabled: range.from !== '' && range.to !== '',
  });

export const myDisciplineOptions = (params: MyDisciplineParams) =>
  queryOptions({
    queryKey: muridKeys.discipline(params),
    queryFn: async () => {
      const result = await apiGet<Paginated<MyDisciplineItem>>('/my/discipline', { ...params });
      return result;
    },
    enabled: params.from !== '' && params.to !== '',
  });

export const myDispensationsOptions = (params: MyDispensationsParams) =>
  queryOptions({
    queryKey: muridKeys.dispensations(params),
    queryFn: async () => {
      const result = await apiGet<Paginated<DispensationItem>>('/my/dispensations', {
        ...params,
      });
      return result;
    },
  });

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
/**
 * GET /my/profile → the student row linked to this login (403 until an admin
 * provisions the account link).
 * @returns React Query result with `MyProfile`.
 */
export const useMyProfile = () => useQuery(myProfileOptions());

/**
 * GET /my/attendance-summary → own per-status totals for the date range.
 * @param range - Required `from`/`to` ISO dates (use `lastNDaysRange(30)`).
 * @returns React Query result with the summary response.
 */
export const useMyAttendanceSummary = (range: DateRangeParams) =>
  useQuery(myAttendanceSummaryOptions(range));

/**
 * GET /my/discipline → own discipline records for the date range.
 * @param params - `from`, `to` plus optional `limit`/`offset`.
 * @returns React Query result with the paginated list.
 */
export const useMyDiscipline = (params: MyDisciplineParams) =>
  useQuery(myDisciplineOptions(params));

/**
 * GET /my/dispensations → own dispensation requests, newest first on the server.
 * @param params - Optional `status`, `limit`, `offset`.
 * @returns React Query result with the paginated list.
 */
export const useMyDispensations = (params: MyDispensationsParams = {}) =>
  useQuery(myDispensationsOptions(params));

/**
 * POST /my/dispensations — create an own request. Multipart when a document
 * file is present, plain JSON otherwise; invalidates the own list.
 * @returns React Query mutation resolving to the created `DispensationItem`.
 */
export const useCreateMyDispensation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateMyDispensationInput): Promise<DispensationItem> => {
      const result = hasDocument(input.document)
        ? await apiUpload<DispensationEnvelope>(
            '/my/dispensations',
            toCreateMyDispensationForm(input),
          )
        : await apiPost<DispensationEnvelope>(
            '/my/dispensations',
            toCreateMyDispensationJson(input),
          );
      return result.dispensation;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: muridKeys.all });
    },
  });
};
