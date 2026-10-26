/**
 * API layer for the parent portal (F7) and the admin "Akun Orang Tua" surface.
 *
 * Backend contract (isonade `internal/transport/http/{parent,auth}.go`,
 * `register_parent.go`), all paths relative to /api/v1:
 *   GET  /parent/children                                  — linked children of the login
 *   GET  /parent/children/:id/attendance[?from&to&limit&offset]
 *   GET  /parent/children/:id/attendance-summary?from&to   — staff summary shape
 *   GET  /parent/children/:id/discipline?from&to&limit&offset
 *   GET  /parent/children/:id/discipline-summary?from&to
 *   GET  /parent/children/:id/dispensations?limit&offset
 *   GET  /users?status&limit&offset                        — admin, rows carry no roles
 *   GET  /users/:id                                        — admin, adds roles[]
 *   GET  /users/:id/children  ·  PUT /users/:id/children   — admin link management
 *   POST /users  ·  POST /users/:id/credential-reset       — admin account + one-time token
 * `from`/`to` are mandatory on the date-ranged reads and the backend caps the
 * span at 366 days.
 */
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, apiGet, apiPost, apiPut } from '@/lib/api/client';
import type { QueryParams } from '@/lib/api/client';
import type {
  AttendanceSummaryResponse,
  CredentialIssue,
  CreateUserResponse,
  DisciplineCategorySummary,
  Paginated,
  UserSummary,
} from '@/lib/api/dto';
import type { DateRangeParams } from '@/lib/api/murid';
import { ROLE_PARENT } from '@/lib/api/rbac';

// ---------------------------------------------------------------------------
// DTOs (local: dto.ts is shared/frozen and carries no parent types yet)
// ---------------------------------------------------------------------------
/** One row of GET /parent/children and GET /users/:id/children. */
export type ParentChild = {
  student_id: string;
  student_number: string;
  full_name: string;
  status: string;
  class_id: string | null;
  class_name: string | null;
  relationship: string | null;
  linked_at: string;
};

/** One editable row of the admin child-linking form. */
export type ParentChildDraft = {
  student_id: string;
  relationship: string;
};

/** One GET /parent/children/:id/attendance row. */
export type ParentAttendanceRow = {
  date: string;
  status: string;
  check_in_time: string | null;
  class_id: string;
  class_name: string;
};

/** One GET /parent/children/:id/discipline row. */
export type ParentDisciplineRow = {
  id: string;
  occurred_at: string;
  category_name: string;
  description: string;
  points: number;
  status: string;
};

/** One GET /parent/children/:id/dispensations row. */
export type ParentDispensationRow = {
  id: string;
  type: string;
  reason: string;
  start_date: string;
  end_date: string | null;
  status: string;
  note: string | null;
  created_at: string;
};

/** Sanction tier covering the accumulated points. */
export type ParentDisciplineLevel = {
  level: string | null;
  action: string;
};

/** GET /parent/children/:id/discipline-summary body. */
export type ParentDisciplineSummary = {
  student_id: string;
  student_number: string;
  student_name: string;
  total_points: number;
  total_records: number;
  categories: DisciplineCategorySummary[];
  current_level: ParentDisciplineLevel | null;
};

/** GET /users/:id row: the list summary plus the role codes. */
export type UserAccount = UserSummary & { roles: string[] };

/** Admin create-account form draft. */
export type ParentAccountDraft = {
  username: string;
  email: string;
  full_name: string;
};

/** POST /users body for a parent account. */
export type CreateParentPayload = {
  username: string;
  full_name: string;
  roles: string[];
  email?: string;
};

/** PUT /users/:id/children body. */
export type ChildrenPayload = {
  children: { student_id: string; relationship: string | null }[];
};

/** Optional paging on the parent reads. */
export type PageParams = {
  limit?: number;
  offset?: number;
};

/** GET /users filters. */
export type UserListParams = {
  status?: string;
  limit?: number;
  offset?: number;
};

type ParentChildList = {
  data: ParentChild[];
};

const MAX_RANGE_DAYS = 366;
const MAX_CHILDREN = 20;

/** Page size used by the portal lists. */
export const PARENT_PAGE_SIZE = 50;

export const parentKeys = {
  all: ['parent'] as const,
  children: ['parent', 'children'] as const,
  attendance: (childId: string, range: DateRangeParams, page: PageParams) =>
    ['parent', 'attendance', childId, range, page] as const,
  attendanceSummary: (childId: string, range: DateRangeParams) =>
    ['parent', 'attendance-summary', childId, range] as const,
  discipline: (childId: string, range: DateRangeParams, page: PageParams) =>
    ['parent', 'discipline', childId, range, page] as const,
  disciplineSummary: (childId: string, range: DateRangeParams) =>
    ['parent', 'discipline-summary', childId, range] as const,
  dispensations: (childId: string, page: PageParams) =>
    ['parent', 'dispensations', childId, page] as const,
  users: (params: UserListParams) => ['parent', 'users', params] as const,
  userRoles: (userIds: readonly string[]) => ['parent', 'user-roles', ...userIds] as const,
  userAccount: (userId: string) => ['parent', 'user-account', userId] as const,
  userChildren: (userId: string) => ['parent', 'user-children', userId] as const,
};

// ---------------------------------------------------------------------------
// Pure helpers (unit-tested)
// ---------------------------------------------------------------------------
const pad2 = (value: number): string => String(value).padStart(2, '0');

/**
 * Calendar range from the first of `today`'s month through `today` — the
 * parent portal opens on the current month.
 * @param today - Reference date (injectable for tests).
 * @returns `{ from, to }` ISO date strings.
 */
export const defaultMonthRange = (today = new Date()): DateRangeParams => {
  const year = today.getFullYear();
  const month = pad2(today.getMonth() + 1);
  return { from: `${year}-${month}-01`, to: `${year}-${month}-${pad2(today.getDate())}` };
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;
const DAY_MS = 86_400_000;

/**
 * Checks a date range against the backend rules before calling it.
 * @param range - `from`/`to` ISO dates picked in the UI.
 * @returns Indonesian problem text, or null when the range is acceptable.
 */
export const validateDateRange = (range: DateRangeParams): string | null => {
  if (range.from.trim() === '' || range.to.trim() === '') {
    return 'Tanggal mulai dan akhir wajib diisi.';
  }
  const start = Date.parse(`${range.from}T00:00:00Z`);
  const end = Date.parse(`${range.to}T00:00:00Z`);
  if (!DATE_PATTERN.test(range.from) || !DATE_PATTERN.test(range.to)) {
    return 'Format tanggal harus YYYY-MM-DD.';
  }
  if (Number.isNaN(start) || Number.isNaN(end)) {
    return 'Tanggal tidak dikenali.';
  }
  if (end < start) {
    return 'Tanggal akhir tidak boleh sebelum tanggal mulai.';
  }
  // The backend counts both bounds, so a 366-day range spans 365 days of delta.
  if ((end - start) / DAY_MS + 1 > MAX_RANGE_DAYS) {
    return 'Rentang tanggal maksimal 366 hari.';
  }
  return null;
};

/**
 * Builds the query string of a date-ranged read.
 * @param range - Required `from`/`to`.
 * @param page - Optional `limit`/`offset`.
 * @returns Query params containing only the set values.
 */
export const buildRangeQuery = (range: DateRangeParams, page?: PageParams): QueryParams => ({
  from: range.from,
  to: range.to,
  ...(page?.limit === undefined ? {} : { limit: page.limit }),
  ...(page?.offset === undefined ? {} : { offset: page.offset }),
});

/**
 * Builds the query string of GET /users.
 * @param params - Status filter and paging.
 * @returns Query params containing only the set values.
 */
const buildUserQuery = (params: UserListParams): QueryParams => ({
  ...(params.status === undefined || params.status === '' ? {} : { status: params.status }),
  ...(params.limit === undefined ? {} : { limit: params.limit }),
  ...(params.offset === undefined ? {} : { offset: params.offset }),
});

const RELATIONSHIP_LABELS_ID: Record<string, string> = {
  father: 'Ayah',
  mother: 'Ibu',
  guardian: 'Wali',
};

/** Relationship codes accepted by PUT /users/:id/children. */
export const relationshipOptions = [
  { value: 'father', label: 'Ayah' },
  { value: 'mother', label: 'Ibu' },
  { value: 'guardian', label: 'Wali' },
] as const;

/**
 * Indonesian label for a parent relationship code.
 * @param value - Backend value, nullable when the admin left it unset.
 * @returns Display label; unknown codes pass through, empty shows a dash.
 */
export const relationshipLabel = (value?: string | null): string => {
  if (value === undefined || value === null || value.trim() === '') {
    return '—';
  }
  return RELATIONSHIP_LABELS_ID[value] ?? value;
};

const STATUS_LABELS_ID: Record<string, string> = {
  active: 'Aktif',
  pending: 'Menunggu Aktivasi',
  inactive: 'Nonaktif',
  locked: 'Terkunci',
  system: 'Sistem',
};

const DISCIPLINE_STATUS_LABELS_ID: Record<string, string> = {
  new: 'Baru',
  under_review: 'Perlu Tinjauan',
  in_followup: 'Dalam Tindak Lanjut',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

const USER_ROLE_LABELS_ID: Record<string, string> = {
  admin: 'Admin',
  staff_tu: 'Staf TU',
  teacher: 'Guru',
  duty_teacher: 'Guru Piket',
  principal: 'Kepala Sekolah',
  student: 'Siswa',
  parent: 'Orang Tua',
};

/**
 * Indonesian label for a role code in the admin account table.
 * @param role - Role code from GET /users/:id.
 * @returns Display label; unknown codes pass through.
 */
export const userRoleLabel = (role: string): string => USER_ROLE_LABELS_ID[role] ?? role;

/**
 * Indonesian label for a user or student status code.
 * @param status - Backend status.
 * @returns Display label; unknown codes pass through.
 */
export const statusLabel = (status: string): string => STATUS_LABELS_ID[status] ?? status;

/**
 * Indonesian label for a discipline record status.
 * @param status - Backend status (new|under_review|in_followup|completed|cancelled).
 * @returns Display label; unknown codes pass through.
 */
export const disciplineStatusLabel = (status: string): string =>
  DISCIPLINE_STATUS_LABELS_ID[status] ?? status;

/**
 * Clock time of a check-in instant, in the browser zone.
 * @param value - RFC3339 timestamp or null when the student never checked in.
 * @returns `HH:mm`, `—` when absent, or the raw text when unparsable.
 */
export const formatCheckInTime = (value?: string | null): string => {
  if (value === undefined || value === null || value.trim() === '') {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
};

/**
 * Builds the PUT /users/:id/children body from the admin form rows.
 * @param rows - Editable child rows (blank rows are ignored).
 * @returns Replace-all payload with unique, trimmed student ids.
 * @throws {Error} When more than twenty children are linked.
 */
export const buildChildrenPayload = (rows: ParentChildDraft[]): ChildrenPayload => {
  const seen = new Set<string>();
  const children: ChildrenPayload['children'] = [];

  for (const row of rows) {
    const studentId = row.student_id.trim();
    if (studentId === '' || seen.has(studentId)) {
      continue;
    }
    seen.add(studentId);
    const relationship = row.relationship.trim();
    children.push({
      student_id: studentId,
      relationship: relationship === '' ? null : relationship,
    });
  }

  if (children.length > MAX_CHILDREN) {
    throw new Error('Maksimal 20 anak per akun.');
  }

  return { children };
};

/**
 * Builds the POST /users body for a parent account.
 * @param draft - Admin create form values.
 * @returns Payload with the `parent` role and no empty email key.
 * @throws {Error} When username or full name is blank.
 */
export const buildCreateParentPayload = (draft: ParentAccountDraft): CreateParentPayload => {
  const username = draft.username.trim();
  const fullName = draft.full_name.trim();
  if (username === '') {
    throw new Error('Username wajib diisi.');
  }
  if (fullName === '') {
    throw new Error('Nama lengkap wajib diisi.');
  }
  const email = draft.email.trim();
  return {
    username,
    full_name: fullName,
    roles: [ROLE_PARENT],
    ...(email === '' ? {} : { email }),
  };
};

/**
 * Indonesian message for a failed child-link save.
 * @param error - Error thrown by the mutation.
 * @returns Specific text for 409/404, else the backend message.
 */
export const childLinkErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError && error.status === 409) {
    return 'Tetapkan peran orang tua pada akun ini sebelum menautkan anak.';
  }
  if (error instanceof ApiError && error.status === 404) {
    return 'Salah satu siswa yang ditautkan tidak ditemukan.';
  }
  if (error instanceof ApiError) {
    return error.message;
  }
  return error instanceof Error ? error.message : 'Gagal menyimpan tautan anak.';
};

/**
 * Indonesian message for a failed parent-portal read.
 * @param error - Error thrown by the query.
 * @param fallback - Message used for non-API failures.
 * @returns Specific text for 404/403, else the backend message.
 */
export const portalErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError && error.status === 404) {
    return 'Data anak belum tertaut ke akun ini.';
  }
  if (error instanceof ApiError && error.status === 403) {
    return 'Akun ini belum dapat membuka data tersebut.';
  }
  if (error instanceof ApiError) {
    return error.message;
  }
  return fallback;
};

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------
const childPath = (childId: string, suffix: string): string =>
  `/parent/children/${encodeURIComponent(childId)}${suffix}`;

/**
 * GET /parent/children — children linked to the signed-in parent.
 * @returns Linked children, empty when the admin has not linked any yet.
 */
export const fetchParentChildren = async (): Promise<ParentChild[]> => {
  const result = await apiGet<ParentChildList>('/parent/children');
  return result.data;
};

/**
 * GET /parent/children/:id/attendance — daily attendance in the range.
 * @param childId - Linked student id.
 * @param range - Required `from`/`to`.
 * @param page - Optional paging.
 * @returns Paginated daily rows.
 */
export const fetchParentAttendance = async (
  childId: string,
  range: DateRangeParams,
  page: PageParams = {},
): Promise<Paginated<ParentAttendanceRow>> =>
  await apiGet<Paginated<ParentAttendanceRow>>(childPath(childId, '/attendance'), {
    ...buildRangeQuery(range, page),
  });

/**
 * GET /parent/children/:id/attendance-summary — per-status totals, same shape
 * as the staff summary report.
 * @param childId - Linked student id.
 * @param range - Required `from`/`to`.
 * @returns Summary with `data` and `totals`.
 */
export const fetchParentAttendanceSummary = async (
  childId: string,
  range: DateRangeParams,
): Promise<AttendanceSummaryResponse> =>
  await apiGet<AttendanceSummaryResponse>(
    childPath(childId, '/attendance-summary'),
    buildRangeQuery(range),
  );

/**
 * GET /parent/children/:id/discipline — discipline records in the range.
 * @param childId - Linked student id.
 * @param range - Required `from`/`to`.
 * @param page - Optional paging.
 * @returns Paginated records.
 */
export const fetchParentDiscipline = async (
  childId: string,
  range: DateRangeParams,
  page: PageParams = {},
): Promise<Paginated<ParentDisciplineRow>> =>
  await apiGet<Paginated<ParentDisciplineRow>>(childPath(childId, '/discipline'), {
    ...buildRangeQuery(range, page),
  });

/**
 * GET /parent/children/:id/discipline-summary — points aggregate and sanction tier.
 * @param childId - Linked student id.
 * @param range - Required `from`/`to`.
 * @returns Aggregate with categories.
 */
export const fetchParentDisciplineSummary = async (
  childId: string,
  range: DateRangeParams,
): Promise<ParentDisciplineSummary> =>
  await apiGet<ParentDisciplineSummary>(
    childPath(childId, '/discipline-summary'),
    buildRangeQuery(range),
  );

/**
 * GET /parent/children/:id/dispensations — dispensation requests (no date range).
 * @param childId - Linked student id.
 * @param page - Optional paging.
 * @returns Paginated requests, newest first on the server.
 */
export const fetchParentDispensations = async (
  childId: string,
  page: PageParams = {},
): Promise<Paginated<ParentDispensationRow>> =>
  await apiGet<Paginated<ParentDispensationRow>>(childPath(childId, '/dispensations'), {
    ...(page.limit === undefined ? {} : { limit: page.limit }),
    ...(page.offset === undefined ? {} : { offset: page.offset }),
  });

/**
 * GET /users — account list for the admin parent-account page. The backend
 * list rows carry no `roles`, so callers resolve roles per row.
 * @param params - Status filter and paging.
 * @returns Paginated user summaries.
 */
export const fetchUserList = async (params: UserListParams): Promise<Paginated<UserSummary>> =>
  await apiGet<Paginated<UserSummary>>('/users', buildUserQuery(params));

/**
 * GET /users/:id — one account including its role codes.
 * @param userId - User id.
 * @returns Account row with roles.
 */
export const fetchUserAccount = async (userId: string): Promise<UserAccount> => {
  const result = await apiGet<{ user: UserAccount }>(`/users/${encodeURIComponent(userId)}`);
  return result.user;
};

/**
 * Resolves the role codes of every account on one list page.
 * shortcut: GET /users returns no `roles`, so each row costs one GET /users/:id
 * call (bounded by the page size). Upgrade when the list gains a roles field.
 * @param userIds - Ids shown on the current page.
 * @returns Map of user id to role codes.
 */
export const userRoles = async (userIds: readonly string[]): Promise<Record<string, string[]>> => {
  const entries = await Promise.all(
    userIds.map(async (userId) => {
      const account = await fetchUserAccount(userId);
      return [account.id, account.roles] as const;
    }),
  );
  return Object.fromEntries(entries);
};

/**
 * GET /users/:id/children — children linked to an account (admin).
 * @param userId - User id.
 * @returns Linked children.
 */
export const fetchUserChildren = async (userId: string): Promise<ParentChild[]> => {
  const result = await apiGet<ParentChildList>(`/users/${encodeURIComponent(userId)}/children`);
  return result.data;
};

/**
 * POST /users with the parent role.
 * @param draft - Admin create form values.
 * @returns Created account and its one-time invite credential.
 */
export const createParentAccount = async (draft: ParentAccountDraft): Promise<CreateUserResponse> =>
  await apiPost<CreateUserResponse>('/users', buildCreateParentPayload(draft));

/**
 * POST /users/:id/credential-reset — issue a fresh one-time token.
 * @param userId - User id.
 * @returns Credential token with purpose and expiry.
 */
export const resetUserCredential = async (userId: string): Promise<CredentialIssue> => {
  const result = await apiPost<{ credential: CredentialIssue }>(
    `/users/${encodeURIComponent(userId)}/credential-reset`,
  );
  return result.credential;
};

/**
 * PUT /users/:id/children — replace the whole link list of an account.
 * @param userId - User id.
 * @param rows - Editable child rows from the admin form.
 * @returns Resulting linked children.
 */
export const replaceUserChildren = async (
  userId: string,
  rows: ParentChildDraft[],
): Promise<ParentChild[]> => {
  const result = await apiPut<ParentChildList>(
    `/users/${encodeURIComponent(userId)}/children`,
    buildChildrenPayload(rows),
  );
  return result.data;
};

// ---------------------------------------------------------------------------
// Query options
// ---------------------------------------------------------------------------
const rangeIsValid = (range: DateRangeParams): boolean => validateDateRange(range) === null;

export const parentChildrenOptions = () =>
  queryOptions({
    queryKey: parentKeys.children,
    queryFn: async () => await fetchParentChildren(),
  });

export const parentAttendanceOptions = (
  childId: string,
  range: DateRangeParams,
  page: PageParams = {},
) =>
  queryOptions({
    queryKey: parentKeys.attendance(childId, range, page),
    queryFn: async () => await fetchParentAttendance(childId, range, page),
    enabled: childId.trim() !== '' && rangeIsValid(range),
  });

export const parentAttendanceSummaryOptions = (childId: string, range: DateRangeParams) =>
  queryOptions({
    queryKey: parentKeys.attendanceSummary(childId, range),
    queryFn: async () => await fetchParentAttendanceSummary(childId, range),
    enabled: childId.trim() !== '' && rangeIsValid(range),
  });

export const parentDisciplineOptions = (
  childId: string,
  range: DateRangeParams,
  page: PageParams = {},
) =>
  queryOptions({
    queryKey: parentKeys.discipline(childId, range, page),
    queryFn: async () => await fetchParentDiscipline(childId, range, page),
    enabled: childId.trim() !== '' && rangeIsValid(range),
  });

export const parentDisciplineSummaryOptions = (childId: string, range: DateRangeParams) =>
  queryOptions({
    queryKey: parentKeys.disciplineSummary(childId, range),
    queryFn: async () => await fetchParentDisciplineSummary(childId, range),
    enabled: childId.trim() !== '' && rangeIsValid(range),
  });

export const parentDispensationsOptions = (childId: string, page: PageParams = {}) =>
  queryOptions({
    queryKey: parentKeys.dispensations(childId, page),
    queryFn: async () => await fetchParentDispensations(childId, page),
    enabled: childId.trim() !== '',
  });

export const userListOptions = (params: UserListParams) =>
  queryOptions({
    queryKey: parentKeys.users(params),
    queryFn: async () => await fetchUserList(params),
  });

export const userRolesOptions = (userIds: readonly string[]) =>
  queryOptions({
    queryKey: parentKeys.userRoles(userIds),
    queryFn: async () => await userRoles(userIds),
    enabled: userIds.length > 0,
  });

export const userAccountOptions = (userId: string) =>
  queryOptions({
    queryKey: parentKeys.userAccount(userId),
    queryFn: async () => await fetchUserAccount(userId),
    enabled: userId.trim() !== '',
  });

export const userChildrenOptions = (userId: string) =>
  queryOptions({
    queryKey: parentKeys.userChildren(userId),
    queryFn: async () => await fetchUserChildren(userId),
    enabled: userId.trim() !== '',
  });

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
/**
 * GET /parent/children → linked children of the signed-in parent.
 * @returns React Query result with `ParentChild[]`.
 */
export const useParentChildren = () => useQuery(parentChildrenOptions());

/**
 * GET /parent/children/:id/attendance → daily rows for the selected child.
 * @param childId - Linked student id.
 * @param range - Validated `from`/`to`.
 * @param page - Optional paging.
 * @returns React Query result with the paginated list.
 */
export const useParentAttendance = (childId: string, range: DateRangeParams, page?: PageParams) =>
  useQuery(parentAttendanceOptions(childId, range, page));

/**
 * GET /parent/children/:id/attendance-summary → per-status totals.
 * @param childId - Linked student id.
 * @param range - Validated `from`/`to`.
 * @returns React Query result with the summary.
 */
export const useParentAttendanceSummary = (childId: string, range: DateRangeParams) =>
  useQuery(parentAttendanceSummaryOptions(childId, range));

/**
 * GET /parent/children/:id/discipline → discipline records for the range.
 * @param childId - Linked student id.
 * @param range - Validated `from`/`to`.
 * @param page - Optional paging.
 * @returns React Query result with the paginated list.
 */
export const useParentDiscipline = (childId: string, range: DateRangeParams, page?: PageParams) =>
  useQuery(parentDisciplineOptions(childId, range, page));

/**
 * GET /parent/children/:id/discipline-summary → points aggregate.
 * @param childId - Linked student id.
 * @param range - Validated `from`/`to`.
 * @returns React Query result with the aggregate.
 */
export const useParentDisciplineSummary = (childId: string, range: DateRangeParams) =>
  useQuery(parentDisciplineSummaryOptions(childId, range));

/**
 * GET /parent/children/:id/dispensations → dispensation requests.
 * @param childId - Linked student id.
 * @param page - Optional paging.
 * @returns React Query result with the paginated list.
 */
export const useParentDispensations = (childId: string, page?: PageParams) =>
  useQuery(parentDispensationsOptions(childId, page));

/**
 * GET /users → account list for the admin parent-account page.
 * @param params - Status filter and paging.
 * @param enabled - Skip the request until the role may read users.
 * @returns React Query result with the paginated summaries.
 */
export const useUserList = (params: UserListParams, enabled = true) =>
  useQuery({ ...userListOptions(params), enabled });

/**
 * Resolves the role codes of the accounts on the current admin page.
 * @param userIds - Ids shown on screen.
 * @returns React Query result with the id → roles map.
 */
export const useUserRoles = (userIds: readonly string[]) => useQuery(userRolesOptions(userIds));

/**
 * GET /users/:id → one account with its roles.
 * @param userId - User id.
 * @returns React Query result with the account.
 */
export const useUserAccount = (userId: string) => useQuery(userAccountOptions(userId));

/**
 * GET /users/:id/children → children linked to one account.
 * @param userId - User id.
 * @param enabled - Skip the request while the edit modal is closed.
 * @returns React Query result with `ParentChild[]`.
 */
export const useUserChildren = (userId: string, enabled = true) =>
  useQuery({ ...userChildrenOptions(userId), enabled });

/**
 * POST /users with the parent role; invalidates the account list.
 * @returns Mutation over `ParentAccountDraft` with the one-time credential.
 */
export const useCreateParentAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (draft: ParentAccountDraft) => await createParentAccount(draft),
    // The invite token is a one-time secret: leave the mutation cache as soon
    // as the modal unmounts instead of surviving the default 5-minute gcTime.
    gcTime: 0,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: parentKeys.all });
    },
  });
};

/**
 * POST /users/:id/credential-reset → fresh one-time token for an account.
 * @returns Mutation over the user id.
 */
export const useResetParentCredential = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => await resetUserCredential(userId),
    gcTime: 0,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: parentKeys.users({}) });
    },
  });
};

/**
 * PUT /users/:id/children → replace-all child links of an account.
 * @returns Mutation over `{ userId, rows }`.
 */
export const useReplaceParentChildren = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, rows }: { userId: string; rows: ParentChildDraft[] }) =>
      await replaceUserChildren(userId, rows),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: parentKeys.all });
    },
  });
};
