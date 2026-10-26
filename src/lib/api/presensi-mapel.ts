/**
 * API layer for per-subject attendance (F8): subject catalog, teaching
 * assignments, lesson sessions with per-student records, and the recap report.
 *
 * Backend contract (isonade `internal/transport/http/register_subject_attendance.go`),
 * all paths relative to /api/v1:
 *   GET  /subjects?search&is_active            · GET /subjects/:id
 *   POST /subjects                             · PUT /subjects/:id        (master data)
 *   GET  /teaching-assignments?teacher_id&subject_id&class_id&is_active
 *   POST /teaching-assignments                 · PUT /teaching-assignments/:id
 *   GET  /attendance-sessions?from&to&class_id&subject_id&teacher_id&status&limit&offset
 *   GET  /attendance-sessions/:id[/roster|/records]
 *   POST /attendance-sessions                  · PUT /:id/records · POST /:id/close
 *   GET  /reports/subject-attendance?from&to&class_id&subject_id&teacher_id
 * `from`/`to` are mandatory on the session list and the report, both bounds
 * counted, capped at 366 days. JP numbers run 1..20 with end >= start. A plain
 * teacher is scoped server-side to their own assignments.
 */
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, apiGet, apiPost, apiPut } from '@/lib/api/client';
import type { QueryParams } from '@/lib/api/client';
import type { DateRangeParams } from '@/lib/api/murid';

// ---------------------------------------------------------------------------
// DTOs (local: dto.ts is shared/frozen and carries no subject-attendance types)
// ---------------------------------------------------------------------------
/** One row of the subject catalog. */
export type Subject = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/** Catalog filter of GET /subjects. */
export type SubjectFilter = {
  search?: string;
  is_active?: boolean;
};

/** Editable subject fields coming from the settings form. */
export type SubjectDraft = {
  code: string;
  name: string;
  description?: string;
  is_active?: boolean;
};

/** PUT/POST /subjects body. */
export type SubjectPayload = {
  code: string;
  name: string;
  description: string;
  is_active: boolean;
};

/** One teacher × subject × class assignment. */
export type TeachingAssignment = {
  id: string;
  teacher_id: string;
  teacher_name: string;
  subject_id: string;
  subject_code: string;
  subject_name: string;
  class_id: string;
  class_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/** Assignment filter of GET /teaching-assignments. */
export type AssignmentFilter = {
  teacher_id?: string;
  subject_id?: string;
  class_id?: string;
  is_active?: boolean;
};

/** Editable assignment fields coming from the settings form. */
export type AssignmentDraft = {
  teacher_id: string;
  subject_id: string;
  class_id: string;
  is_active?: boolean;
};

/** POST/PUT /teaching-assignments body. */
export type AssignmentPayload = AssignmentDraft;

/** One lesson meeting, with the assignment context denormalized. */
export type AttendanceSession = {
  id: string;
  teaching_assignment_id: string;
  session_date: string;
  period_start: number;
  period_end: number;
  topic: string | null;
  notes: string | null;
  status: string;
  teacher_id: string;
  teacher_name: string;
  subject_id: string;
  subject_code: string;
  subject_name: string;
  class_id: string;
  class_name: string;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Filter of GET /attendance-sessions; `from`/`to` are required by the backend. */
export type SessionFilter = Partial<DateRangeParams> & {
  class_id?: string;
  subject_id?: string;
  teacher_id?: string;
  status?: string;
};

/** Editable session fields coming from the create form. */
export type SessionDraft = {
  teaching_assignment_id: string;
  session_date: string;
  period_start: number;
  period_end: number;
  topic?: string;
  notes?: string;
};

/** POST /attendance-sessions body. */
export type SessionPayload = {
  teaching_assignment_id: string;
  session_date: string;
  period_start: number;
  period_end: number;
  topic: string;
  notes: string;
};

/** Page parameters accepted by the session list. */
export type PageParams = {
  limit?: number;
  offset?: number;
};

/** One enrolled student plus the record written for them, if any. */
export type SessionRosterEntry = {
  student_id: string;
  student_number: string;
  full_name: string;
  enrollment_id: string;
  status: string | null;
  note: string | null;
};

/** One saved record of a session. */
export type SessionRecord = SessionRosterEntry & {
  id: string;
  session_id: string;
  updated_at: string;
};

/** Editable roster row carried by the session detail form. */
export type RecordDraft = {
  student_id: string;
  status: string;
  note: string;
};

/** PUT /attendance-sessions/:id/records body. */
export type RecordsPayload = {
  records: RecordDraft[];
};

/** Filter of GET /reports/subject-attendance. */
export type ReportFilter = DateRangeParams & {
  class_id?: string;
  subject_id?: string;
  teacher_id?: string;
};

/** Recap row of one teaching assignment inside the range. */
export type SubjectAttendanceRow = {
  teaching_assignment_id: string;
  class_id: string;
  class_name: string;
  subject_id: string;
  subject_code: string;
  subject_name: string;
  teacher_id: string;
  teacher_name: string;
  sessions: number;
  records: number;
  present: number;
  late: number;
  sick: number;
  excused: number;
  absent: number;
  attendance_percentage: number;
};

/** Recap totals, same counters without the assignment identity. */
export type SubjectAttendanceTotals = Omit<
  SubjectAttendanceRow,
  | 'teaching_assignment_id'
  | 'class_id'
  | 'class_name'
  | 'subject_id'
  | 'subject_code'
  | 'subject_name'
  | 'teacher_id'
  | 'teacher_name'
>;

/** GET /reports/subject-attendance payload. */
export type SubjectAttendanceReport = {
  from: string;
  to: string;
  data: SubjectAttendanceRow[];
  totals: SubjectAttendanceTotals;
};

/** Page of sessions returned by GET /attendance-sessions. */
export type SessionPage = {
  data: AttendanceSession[];
  total: number;
  limit: number;
  offset: number;
};

/** Which write a 409 or 403 came from, so the UI can name the conflict. */
export type WriteContext = 'subject' | 'assignment' | 'session' | 'records' | 'close';

const MAX_RANGE_DAYS = 366;
const MAX_JP = 20;
const MAX_TOPIC_CHARS = 200;
const MAX_NOTES_CHARS = 2000;
const MAX_RECORD_NOTE_CHARS = 500;
const MAX_RECORDS = 200;
const MAX_CODE_CHARS = 30;
const MAX_NAME_CHARS = 150;

const RECORD_STATUSES = ['present', 'late', 'sick', 'excused', 'absent'] as const;

/** Status a roster row can be marked with. */
export type RecordStatus = (typeof RECORD_STATUSES)[number];

/** Selectable statuses of one roster row. */
export const recordStatusOptions: readonly RecordStatus[] = RECORD_STATUSES;

const RECORD_STATUS_VALUES: ReadonlySet<string> = new Set<string>(RECORD_STATUSES);

const SESSION_STATUS_LABELS: Record<string, string> = {
  closed: 'Ditutup',
  open: 'Berlangsung',
};

/**
 * Query keys. The list keys are prefixes of the filter keys so a write can
 * invalidate every cached page of one endpoint at once.
 */
export const mapelKeys = {
  root: ['presensi-mapel'] as const,
  subjectList: ['presensi-mapel', 'subjects'] as const,
  subjects: (filter: SubjectFilter) => [...mapelKeys.subjectList, filter] as const,
  assignmentList: ['presensi-mapel', 'assignments'] as const,
  assignments: (filter: AssignmentFilter) => [...mapelKeys.assignmentList, filter] as const,
  sessionList: ['presensi-mapel', 'sessions'] as const,
  sessions: (filter: SessionFilter, page: PageParams) =>
    [...mapelKeys.sessionList, filter, page] as const,
  session: (sessionId: string) => ['presensi-mapel', 'session', sessionId] as const,
  roster: (sessionId: string) => ['presensi-mapel', 'roster', sessionId] as const,
  reportList: ['presensi-mapel', 'report'] as const,
  report: (filter: ReportFilter) => [...mapelKeys.reportList, filter] as const,
};

// ---------------------------------------------------------------------------
// Pure helpers (unit-tested)
// ---------------------------------------------------------------------------
const pad2 = (value: number): string => String(value).padStart(2, '0');

/**
 * Calendar range from the first of `today`'s month through `today`, the window
 * both the session list and the recap open on.
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
export const validateRange = (range: Partial<DateRangeParams>): string | null => {
  const from = range.from ?? '';
  const to = range.to ?? '';
  if (from.trim() === '' || to.trim() === '') {
    return 'Tanggal mulai dan akhir wajib diisi.';
  }
  if (!DATE_PATTERN.test(from) || !DATE_PATTERN.test(to)) {
    return 'Format tanggal harus YYYY-MM-DD.';
  }
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) {
    return 'Tanggal tidak dikenali.';
  }
  if (end < start) {
    return 'Tanggal akhir tidak boleh sebelum tanggal mulai.';
  }
  // The backend counts both bounds, so 366 days is a 365-day delta.
  if ((end - start) / DAY_MS + 1 > MAX_RANGE_DAYS) {
    return 'Rentang tanggal maksimal 366 hari.';
  }
  return null;
};

const isSet = (value: string | undefined): boolean => value !== undefined && value.trim() !== '';

/**
 * Builds the session-list query, dropping unset filters so the backend sees
 * only what the operator actually picked.
 * @param filter - Range plus optional class/subject/teacher/status filters.
 * @param page - Optional `limit`/`offset`.
 * @returns Query params containing only the set values.
 */
export const buildSessionListQuery = (filter: SessionFilter, page?: PageParams): QueryParams => ({
  ...(isSet(filter.from) ? { from: filter.from?.trim() } : {}),
  ...(isSet(filter.to) ? { to: filter.to?.trim() } : {}),
  ...(isSet(filter.class_id) ? { class_id: filter.class_id?.trim() } : {}),
  ...(isSet(filter.subject_id) ? { subject_id: filter.subject_id?.trim() } : {}),
  ...(isSet(filter.teacher_id) ? { teacher_id: filter.teacher_id?.trim() } : {}),
  ...(isSet(filter.status) ? { status: filter.status?.trim() } : {}),
  ...(page?.limit === undefined ? {} : { limit: page.limit }),
  ...(page?.offset === undefined ? {} : { offset: page.offset }),
});

/**
 * Builds the recap-report query from the required range and set filters.
 * @param filter - `from`/`to` plus optional class/subject/teacher filters.
 * @returns Query params containing only the set values.
 */
export const buildReportQuery = (filter: ReportFilter): QueryParams => ({
  from: filter.from,
  to: filter.to,
  ...(isSet(filter.class_id) ? { class_id: filter.class_id?.trim() } : {}),
  ...(isSet(filter.subject_id) ? { subject_id: filter.subject_id?.trim() } : {}),
  ...(isSet(filter.teacher_id) ? { teacher_id: filter.teacher_id?.trim() } : {}),
});

/**
 * Builds the subject catalog body from the settings form.
 * @param draft - Editable subject fields.
 * @returns Trimmed payload with the active flag defaulted to true.
 * @throws {Error} When the code or name is blank or longer than the backend cap.
 */
export const buildSubjectPayload = (draft: SubjectDraft): SubjectPayload => {
  const code = draft.code.trim();
  const name = draft.name.trim();
  if (code === '') {
    throw new Error('Kode mapel wajib diisi.');
  }
  if (code.length > MAX_CODE_CHARS) {
    throw new Error(`Kode mapel maksimal ${MAX_CODE_CHARS} karakter.`);
  }
  if (name === '') {
    throw new Error('Nama mapel wajib diisi.');
  }
  if (name.length > MAX_NAME_CHARS) {
    throw new Error(`Nama mapel maksimal ${MAX_NAME_CHARS} karakter.`);
  }
  return {
    code,
    name,
    description: (draft.description ?? '').trim(),
    is_active: draft.is_active ?? true,
  };
};

/**
 * Builds the teaching-assignment body from the settings form.
 * @param draft - Chosen teacher, subject and class.
 * @returns Trimmed payload, carrying the active flag only when supplied.
 * @throws {Error} When any of the three references is missing.
 */
export const buildAssignmentPayload = (draft: AssignmentDraft): AssignmentPayload => {
  const teacherId = draft.teacher_id.trim();
  const subjectId = draft.subject_id.trim();
  const classId = draft.class_id.trim();
  if (teacherId === '' || subjectId === '' || classId === '') {
    throw new Error('Guru, mapel, dan kelas wajib dipilih.');
  }
  return {
    teacher_id: teacherId,
    subject_id: subjectId,
    class_id: classId,
    ...(draft.is_active === undefined ? {} : { is_active: draft.is_active }),
  };
};

/**
 * Builds the session-create body from the session form.
 * @param draft - Assignment, date, JP window, topic and notes.
 * @returns Trimmed payload with blank topic/notes sent as empty strings.
 * @throws {Error} When the date, JP window or text caps fail the backend rules.
 */
export const buildSessionPayload = (draft: SessionDraft): SessionPayload => {
  const assignmentId = draft.teaching_assignment_id.trim();
  if (assignmentId === '') {
    throw new Error('Penugasan mengajar wajib dipilih.');
  }
  if (!DATE_PATTERN.test(draft.session_date)) {
    throw new Error('Tanggal sesi harus YYYY-MM-DD.');
  }
  const { period_start: start, period_end: end } = draft;
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 1 ||
    end < 1 ||
    start > MAX_JP ||
    end > MAX_JP
  ) {
    throw new Error(`Nomor JP harus antara 1 dan ${MAX_JP}.`);
  }
  if (end < start) {
    throw new Error('JP akhir tidak boleh lebih kecil dari JP awal.');
  }
  const topic = (draft.topic ?? '').trim();
  const notes = (draft.notes ?? '').trim();
  if (topic.length > MAX_TOPIC_CHARS) {
    throw new Error(`Topik maksimal ${MAX_TOPIC_CHARS} karakter.`);
  }
  if (notes.length > MAX_NOTES_CHARS) {
    throw new Error(`Catatan maksimal ${MAX_NOTES_CHARS} karakter.`);
  }
  return {
    teaching_assignment_id: assignmentId,
    session_date: draft.session_date,
    period_start: start,
    period_end: end,
    topic,
    notes,
  };
};

/**
 * Builds the roster save body, skipping rows the operator left unmarked.
 * @param rows - Editable roster rows of the open session.
 * @returns Payload with one record per marked student.
 * @throws {Error} When a status is unknown, a note is too long, or the batch is too big.
 */
export const buildRecordsPayload = (rows: readonly RecordDraft[]): RecordsPayload => {
  const records: RecordDraft[] = [];
  for (const row of rows) {
    const status = row.status.trim();
    if (status === '') {
      continue;
    }
    if (!RECORD_STATUS_VALUES.has(status)) {
      throw new Error('Status absensi tidak dikenali.');
    }
    const note = row.note.trim();
    if (note.length > MAX_RECORD_NOTE_CHARS) {
      throw new Error(`Catatan siswa maksimal ${MAX_RECORD_NOTE_CHARS} karakter.`);
    }
    records.push({ student_id: row.student_id, status, note });
  }
  if (records.length > MAX_RECORDS) {
    throw new Error(`Maksimal ${MAX_RECORDS} siswa per penyimpanan.`);
  }
  return { records };
};

/**
 * Indonesian label of a session status.
 * @param status - `open` or `closed` (unknown codes fall through).
 * @returns Display label.
 */
export const sessionStatusLabel = (status: string): string =>
  SESSION_STATUS_LABELS[status] ?? status;

/**
 * Formats the recap percentage the way Indonesian readers expect.
 * @param value - `attendance_percentage` from the report.
 * @returns Two-decimal label with a comma separator.
 */
export const percentageLabel = (value: number): string => `${value.toFixed(2).replace('.', ',')}%`;

/**
 * Maps a failed subject-attendance write onto a message that names the conflict.
 * @param error - Thrown error, ideally an `ApiError`.
 * @param context - Which form the failure came from.
 * @returns Indonesian message safe to show inline.
 */
// Backend 4xx messages are Indonesian domain text; 5xx text can leak internals.
const GENERIC_ERROR_MESSAGE = 'Terjadi kesalahan. Coba lagi beberapa saat.';

export const mapSessionError = (error: unknown, context: WriteContext): string => {
  if (!(error instanceof ApiError)) {
    return GENERIC_ERROR_MESSAGE;
  }
  if (error.status === 409) {
    if (context === 'subject') {
      return 'Kode mapel sudah dipakai mapel lain.';
    }
    if (context === 'assignment') {
      return 'Penugasan guru, mapel, dan kelas ini sudah ada.';
    }
    if (context === 'session') {
      return 'Sesi untuk JP awal itu sudah ada pada tanggal tersebut.';
    }
    return 'Sesi sudah ditutup dan tidak bisa diubah.';
  }
  if (error.status === 403) {
    return 'Akun Anda tidak punya akses ke data ini.';
  }
  if (error.status === 404) {
    return 'Data tidak ditemukan.';
  }
  if (error.status === 400) {
    return 'Data belum benar, periksa lagi isinya.';
  }
  if (error.status >= 500) {
    return GENERIC_ERROR_MESSAGE;
  }
  return error.message;
};

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------
type SubjectList = { data: Subject[] };
type AssignmentList = { data: TeachingAssignment[] };
type RosterList = { data: SessionRosterEntry[] };
type RecordList = { data: SessionRecord[] };

/**
 * GET /subjects → catalog rows for the filter.
 * @param filter - Optional search and active flag.
 * @returns Subject rows.
 */
export const fetchSubjects = async (filter: SubjectFilter): Promise<Subject[]> => {
  const query: QueryParams = {
    ...(isSet(filter.search) ? { search: filter.search?.trim() } : {}),
    ...(filter.is_active === undefined ? {} : { is_active: filter.is_active }),
  };
  const result = await apiGet<SubjectList>('/subjects', query);
  return result.data;
};

/**
 * GET /teaching-assignments → assignment rows for the filter.
 * @param filter - Optional teacher, subject, class and active flag.
 * @returns Assignment rows.
 */
export const fetchAssignments = async (filter: AssignmentFilter): Promise<TeachingAssignment[]> => {
  const query: QueryParams = {
    ...(isSet(filter.teacher_id) ? { teacher_id: filter.teacher_id?.trim() } : {}),
    ...(isSet(filter.subject_id) ? { subject_id: filter.subject_id?.trim() } : {}),
    ...(isSet(filter.class_id) ? { class_id: filter.class_id?.trim() } : {}),
    ...(filter.is_active === undefined ? {} : { is_active: filter.is_active }),
  };
  const result = await apiGet<AssignmentList>('/teaching-assignments', query);
  return result.data;
};

/**
 * GET /attendance-sessions → one page of sessions inside the range.
 * @param filter - Range plus optional filters.
 * @param page - Optional `limit`/`offset`.
 * @returns Session page.
 */
export const fetchSessions = async (
  filter: SessionFilter,
  page?: PageParams,
): Promise<SessionPage> =>
  await apiGet<SessionPage>('/attendance-sessions', buildSessionListQuery(filter, page));

/**
 * GET /attendance-sessions/:id → one session.
 * @param sessionId - Session id.
 * @returns Session row.
 */
export const fetchSession = async (sessionId: string): Promise<AttendanceSession> => {
  const result = await apiGet<{ session: AttendanceSession }>(
    `/attendance-sessions/${encodeURIComponent(sessionId)}`,
  );
  return result.session;
};

/**
 * GET /attendance-sessions/:id/roster → enrolled students with their record, if saved.
 * @param sessionId - Session id.
 * @returns Roster rows.
 */
export const fetchSessionRoster = async (sessionId: string): Promise<SessionRosterEntry[]> => {
  const result = await apiGet<RosterList>(
    `/attendance-sessions/${encodeURIComponent(sessionId)}/roster`,
  );
  return result.data;
};

/**
 * GET /reports/subject-attendance → recap rows and totals for the range.
 * @param filter - Required range plus optional filters.
 * @returns Report payload.
 */
export const fetchSubjectReport = async (filter: ReportFilter): Promise<SubjectAttendanceReport> =>
  await apiGet<SubjectAttendanceReport>('/reports/subject-attendance', buildReportQuery(filter));

export const subjectsOptions = (filter: SubjectFilter) =>
  queryOptions({
    queryKey: mapelKeys.subjects(filter),
    queryFn: async () => await fetchSubjects(filter),
  });

export const useSubjects = (filter: SubjectFilter) => useQuery(subjectsOptions(filter));

export const assignmentsOptions = (filter: AssignmentFilter) =>
  queryOptions({
    queryKey: mapelKeys.assignments(filter),
    queryFn: async () => await fetchAssignments(filter),
  });

export const useAssignments = (filter: AssignmentFilter) => useQuery(assignmentsOptions(filter));

export const sessionsOptions = (filter: SessionFilter, page: PageParams, enabled: boolean) =>
  queryOptions({
    queryKey: mapelKeys.sessions(filter, page),
    queryFn: async () => await fetchSessions(filter, page),
    enabled: enabled && validateRange(filter) === null,
    placeholderData: (previous: SessionPage | undefined) => previous,
  });

/**
 * GET /attendance-sessions list query, disabled while the range is incomplete.
 * @param filter - Range plus optional filters.
 * @param page - Optional paging.
 * @param enabled - Gate for role-restricted panels.
 * @returns React Query result.
 */
export const useSessions = (filter: SessionFilter, page: PageParams, enabled = true) =>
  useQuery(sessionsOptions(filter, page, enabled));

export const sessionOptions = (sessionId: string) =>
  queryOptions({
    queryKey: mapelKeys.session(sessionId),
    queryFn: async () => await fetchSession(sessionId),
    enabled: sessionId !== '',
  });

export const useSession = (sessionId: string) => useQuery(sessionOptions(sessionId));

export const rosterOptions = (sessionId: string) =>
  queryOptions({
    queryKey: mapelKeys.roster(sessionId),
    queryFn: async () => await fetchSessionRoster(sessionId),
    enabled: sessionId !== '',
  });

export const useSessionRoster = (sessionId: string) => useQuery(rosterOptions(sessionId));

export const reportOptions = (filter: ReportFilter, enabled: boolean) =>
  queryOptions({
    queryKey: mapelKeys.report(filter),
    queryFn: async () => await fetchSubjectReport(filter),
    enabled: enabled && validateRange(filter) === null,
  });

/**
 * GET /reports/subject-attendance query, disabled while the range is incomplete.
 * @param filter - Required range plus optional filters.
 * @param enabled - Gate for role-restricted panels.
 * @returns React Query result.
 */
export const useSubjectReport = (filter: ReportFilter, enabled = true) =>
  useQuery(reportOptions(filter, enabled));

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------
/** Create-or-update variables for the subject catalog. */
export type SaveSubjectVariables = SubjectDraft & { subjectId?: string };

/** Create-or-update variables for a teaching assignment. */
export type SaveAssignmentVariables = AssignmentDraft & { assignmentId?: string };

/** Roster save variables of one session. */
export type SaveRecordsVariables = { sessionId: string; rows: RecordDraft[] };

/**
 * POST or PUT /subjects.
 * @param variables - Draft fields plus the id when editing.
 * @returns Saved subject.
 */
export const saveSubject = async (variables: SaveSubjectVariables): Promise<Subject> => {
  const payload = buildSubjectPayload(variables);
  if (variables.subjectId === undefined) {
    const created = await apiPost<{ subject: Subject }>('/subjects', payload);
    return created.subject;
  }
  const updated = await apiPut<{ subject: Subject }>(
    `/subjects/${encodeURIComponent(variables.subjectId)}`,
    payload,
  );
  return updated.subject;
};

/**
 * POST or PUT /teaching-assignments.
 * @param variables - Draft references plus the id when editing.
 * @returns Saved assignment.
 */
export const saveAssignment = async (
  variables: SaveAssignmentVariables,
): Promise<TeachingAssignment> => {
  const payload = buildAssignmentPayload(variables);
  if (variables.assignmentId === undefined) {
    const created = await apiPost<{ assignment: TeachingAssignment }>(
      '/teaching-assignments',
      payload,
    );
    return created.assignment;
  }
  const updated = await apiPut<{ assignment: TeachingAssignment }>(
    `/teaching-assignments/${encodeURIComponent(variables.assignmentId)}`,
    payload,
  );
  return updated.assignment;
};

/**
 * POST /attendance-sessions.
 * @param draft - Session form values.
 * @returns Created session.
 */
export const createSession = async (draft: SessionDraft): Promise<AttendanceSession> => {
  const created = await apiPost<{ session: AttendanceSession }>(
    '/attendance-sessions',
    buildSessionPayload(draft),
  );
  return created.session;
};

/**
 * PUT /attendance-sessions/:id/records.
 * @param sessionId - Session id.
 * @param rows - Editable roster rows.
 * @returns Saved records.
 */
export const saveSessionRecords = async (
  sessionId: string,
  rows: readonly RecordDraft[],
): Promise<SessionRecord[]> => {
  const result = await apiPut<RecordList>(
    `/attendance-sessions/${encodeURIComponent(sessionId)}/records`,
    buildRecordsPayload(rows),
  );
  return result.data;
};

/**
 * POST /attendance-sessions/:id/close.
 * @param sessionId - Session id.
 * @returns Closed session.
 */
export const closeSession = async (sessionId: string): Promise<AttendanceSession> => {
  const result = await apiPost<{ session: AttendanceSession }>(
    `/attendance-sessions/${encodeURIComponent(sessionId)}/close`,
  );
  return result.session;
};

/**
 * POST/PUT /subjects mutation; invalidates the catalog and everything that
 * denormalizes the subject name.
 * @returns Mutation over `SaveSubjectVariables`.
 */
export const useSaveSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: SaveSubjectVariables) => await saveSubject(variables),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mapelKeys.root });
    },
  });
};

/**
 * POST/PUT /teaching-assignments mutation.
 * @returns Mutation over `SaveAssignmentVariables`.
 */
export const useSaveAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: SaveAssignmentVariables) => await saveAssignment(variables),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mapelKeys.assignmentList });
      void queryClient.invalidateQueries({ queryKey: mapelKeys.sessionList });
      // The recap denormalizes subject, class and teacher names onto every row.
      void queryClient.invalidateQueries({ queryKey: mapelKeys.reportList });
    },
  });
};

/**
 * POST /attendance-sessions mutation.
 * @returns Mutation over `SessionDraft`.
 */
export const useCreateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (draft: SessionDraft) => await createSession(draft),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mapelKeys.sessionList });
      void queryClient.invalidateQueries({ queryKey: mapelKeys.reportList });
    },
  });
};

/**
 * PUT /attendance-sessions/:id/records mutation.
 * @returns Mutation over `SaveRecordsVariables`.
 */
export const useSaveSessionRecords = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, rows }: SaveRecordsVariables) =>
      await saveSessionRecords(sessionId, rows),
    onSuccess: (_result, { sessionId }) => {
      void queryClient.invalidateQueries({ queryKey: mapelKeys.roster(sessionId) });
      void queryClient.invalidateQueries({ queryKey: mapelKeys.session(sessionId) });
      void queryClient.invalidateQueries({ queryKey: mapelKeys.reportList });
    },
  });
};

/**
 * POST /attendance-sessions/:id/close mutation.
 * @returns Mutation over the session id.
 */
export const useCloseSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => await closeSession(sessionId),
    onSuccess: (_session, sessionId) => {
      void queryClient.invalidateQueries({ queryKey: mapelKeys.session(sessionId) });
      void queryClient.invalidateQueries({ queryKey: mapelKeys.roster(sessionId) });
      void queryClient.invalidateQueries({ queryKey: mapelKeys.sessionList });
      void queryClient.invalidateQueries({ queryKey: mapelKeys.reportList });
    },
  });
};
