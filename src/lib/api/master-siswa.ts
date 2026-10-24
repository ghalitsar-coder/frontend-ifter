import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  queryOptions,
} from '@tanstack/react-query';
import { apiGet, apiPatch, apiPost, apiPut, apiUpload, downloadFile } from '@/lib/api/client';
import type {
  AcademicYear,
  AttendanceSummaryItem,
  AttendanceSummaryResponse,
  Class,
  HistoryRecord,
  ImportConfirmResponse,
  ImportErrorRow,
  ImportMode,
  ImportPreviewRow,
  ImportJob,
  Paginated,
  Student,
  StudentDetail,
  StudentDisciplineProfile,
} from '@/lib/api/dto';
import { queryKeys } from '@/lib/api/queries';
import type { GradeLevel, RombelOption, StudentProfile } from '@/types/masterSiswa';

// Re-exported alias keeps this module self-contained for the components.
export type StudentRowMetrics = {
  summary?: AttendanceSummaryItem;
  discipline?: StudentDisciplineProfile;
};

/** Params accepted by GET /students (search, single class, backend status, sort name|nis, pagination). */
export type MasterSiswaListParams = {
  search?: string;
  class_id?: string;
  status?: string;
  sort?: 'name' | 'nis';
  limit?: number;
  offset?: number;
};

/** Payload for POST /students and PUT /students/:id (validatedStudentInput on the Go side). */
export type StudentInputPayload = {
  student_number: string;
  national_student_number?: string;
  full_name: string;
  gender?: string;
  birth_date?: string;
  admission_year: number;
  guardian_name?: string;
  guardian_phone?: string;
  class_id?: string;
  class_start_date?: string;
};

/** Date window (ISO yyyy-mm-dd) used for attendance summary + history queries. */
export type DateRange = {
  from: string;
  to: string;
};

// ---------------------------------------------------------------------------
// Status mapping — UI vocabulary (active/mutation/alumni) vs backend
// (active/transferred/graduated/inactive).
// ---------------------------------------------------------------------------

/**
 * Maps a UI status filter value to its backend equivalent.
 * @param status - UI filter token (all | active | mutation | alumni).
 * @returns Backend status string, or undefined when the filter is 'all'.
 */
export function uiStatusToBackend(status: string): string | undefined {
  if (status === 'all') {
    return undefined;
  }
  if (status === 'mutation') {
    return 'transferred';
  }
  if (status === 'alumni') {
    return 'graduated';
  }
  return status;
}

/**
 * Maps a backend student status to the UI StudentStatus vocabulary.
 * @param status - Backend status (active | graduated | transferred | inactive).
 * @returns UI status token (active | mutation | alumni).
 */
export function backendStatusToUi(status: string): StudentProfile['status'] {
  if (status === 'transferred') {
    return 'mutation';
  }
  if (status === 'graduated' || status === 'inactive') {
    return 'alumni';
  }
  return 'active';
}

// ---------------------------------------------------------------------------
// Small pure helpers (documented mappers)
// ---------------------------------------------------------------------------
const ROMBEL_CAPACITY = 32; // shortcut: no capacity field on backend Class, keep mock

const GRADE_BY_LEVEL: Record<number, GradeLevel> = { 7: 'VII', 8: 'VIII', 9: 'IX' };

/**
 * Derives the UI grade token from a Class row (grade_level) or a class name prefix.
 * @param classRow - Optional backend Class row.
 * @param className - Optional class name fallback (e.g. 'VIII B').
 * @returns GradeLevel used by the UI selects.
 */
export function gradeFromClass(classRow?: Class, className?: string): GradeLevel {
  if (classRow !== undefined) {
    return GRADE_BY_LEVEL[classRow.grade_level] ?? 'VII';
  }
  const token = (className ?? '').trim().split(' ')[0]?.toUpperCase();
  if (token === 'VII' || token === 'VIII' || token === 'IX') {
    return token;
  }
  return 'VII';
}

/**
 * Maps a Class row to the RombelOption shape the master-siswa modals consume.
 * @param classRow - Backend class (rombel) row.
 * @param currentCount - Live roster size from GET /classes/:id/students.
 * @returns RombelOption for the toolbar / mutation / add modals.
 */
export function mapClassToRombel(classRow: Class, currentCount: number): RombelOption {
  return {
    id: classRow.id,
    name: classRow.name,
    grade: gradeFromClass(classRow),
    homeroomTeacher: classRow.homeroom_teacher_name ?? '-',
    currentCount,
    capacity: ROMBEL_CAPACITY,
  };
}

/**
 * Attendance category label from a percentage (thresholds match the seeded UI bands).
 * @param rate - Attendance percentage (0-100).
 * @returns Indonesian category label used by the table.
 */
export function attendanceCategoryFor(rate: number): StudentProfile['attendanceCategory'] {
  if (rate >= 98) {
    return 'Hadir Prima';
  }
  if (rate >= 95) {
    return 'Normal';
  }
  if (rate >= 90) {
    return 'Cukup';
  }
  return 'Perlu Perhatian';
}

/**
 * Discipline stage label from accumulated points (mirrors the seeded mock buckets).
 * @param points - Total discipline points on record.
 * @returns Stage label ('SP1' | 'Ambang') or undefined when below both thresholds.
 */
export function disciplineStageFor(points: number): string | undefined {
  if (points >= 50) {
    return 'SP1';
  }
  if (points > 20) {
    return 'Ambang';
  }
  return undefined;
}

/**
 * Resolves class-level UI fields (grade, homeroom teacher) for one student.
 * @param student - Backend student row.
 * @param classIndex - Optional map of class id to Class.
 * @returns Grade token and homeroom teacher label for the UI profile.
 */
function classFieldsFor(
  student: Student,
  classIndex?: Record<string, Class>,
): { grade: GradeLevel; homeroom: string } {
  const { current_class: currentClass } = student;
  const classRow = currentClass === undefined ? undefined : classIndex?.[currentClass.id];
  return {
    grade: gradeFromClass(classRow, currentClass?.name),
    homeroom: classRow?.homeroom_teacher_name ?? '-',
  };
}

/**
 * Maps an API Student (plus optional per-student metrics and the class index for
 * the homeroom join) into the UI StudentProfile shape. Unsupported UI fields are
 * filled with neutral defaults; see shortcut comments.
 * @param student - Backend student row.
 * @param opts - Optional class index (id → Class) and per-row attendance/discipline metrics.
 * @returns StudentProfile consumed by the table / modals.
 */
export function mapStudentToProfile(
  student: Student,
  opts: {
    classIndex?: Record<string, Class>;
    metrics?: StudentRowMetrics;
  } = {},
): StudentProfile {
  const { grade, homeroom } = classFieldsFor(student, opts.classIndex);
  const rate = Math.round(opts.metrics?.summary?.attendance_percentage ?? 0);
  const points = opts.metrics?.discipline?.total_points ?? 0;

  return {
    id: student.id,
    nis: student.student_number,
    nisn: student.national_student_number ?? '',
    name: student.full_name,
    gender: student.gender === 'P' ? 'P' : 'L',
    pob: '', // shortcut: no birth_place field on backend Student
    dob: student.birth_date ?? '',
    religion: '', // shortcut: no religion field on backend Student
    grade,
    className: student.current_class?.name ?? '-',
    absentNumber: 0, // shortcut: no per-class attendance-number field on backend
    homeroomTeacher: homeroom,
    semesterAttendanceRate: rate,
    attendanceCategory: attendanceCategoryFor(rate),
    totalLateCount: opts.metrics?.summary?.late,
    disciplinePoints: points,
    disciplineStage: disciplineStageFor(points),
    status: backendStatusToUi(student.status),
    guardian: {
      name: student.guardian_name ?? '-',
      relation: '', // shortcut: no guardian relation field on backend Student
      phone: student.guardian_phone ?? '',
      address: '', // shortcut: no guardian address field on backend Student
    },
    homeroomNotes: '', // shortcut: no notes field on backend Student
  };
}

/**
 * Converts a UI StudentProfile (as built by the add/edit modal) into the API student payload.
 * @param profile - Profile without id (fresh form state).
 * @param classId - Optional target class id (only sent on create / explicit class moves).
 * @returns StudentInputPayload ready for POST/PUT /students.
 */
export function profileToStudentInput(
  profile: Omit<StudentProfile, 'id'>,
  classId?: string,
): StudentInputPayload {
  const payload: StudentInputPayload = {
    student_number: profile.nis,
    national_student_number: profile.nisn === '' ? undefined : profile.nisn,
    full_name: profile.name,
    gender: profile.gender,
    birth_date: profile.dob === '' ? undefined : profile.dob,
    admission_year: new Date().getFullYear(),
    guardian_name: profile.guardian.name === '-' ? undefined : profile.guardian.name,
    guardian_phone: profile.guardian.phone === '' ? undefined : profile.guardian.phone,
  };
  if (classId !== undefined && classId !== '') {
    payload.class_id = classId;
  }
  return payload;
}

const ATTENDANCE_TO_LOG_STATUS: Record<string, 'hadir' | 'sakit' | 'izin' | 'alpa'> = {
  present: 'hadir',
  late: 'hadir',
  sick: 'sakit',
  excused: 'izin',
  absent: 'alpa',
};

function formatDateId(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTimeId(iso?: string): string {
  if (iso === undefined) {
    return '--:-- WIB';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '--:-- WIB';
  }
  return `${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })} WIB`;
}

/**
 * Maps attendance history rows into the recent-log timeline shape of StudentProfile.
 * @param records - HistoryRecord rows from GET /attendance/history.
 * @returns Timeline entries for the quick-detail modal.
 */
export function mapHistoryToLogs(
  records: HistoryRecord[],
): NonNullable<StudentProfile['recentLogs']> {
  return records.map((record) => ({
    id: record.id,
    date: formatDateId(record.date),
    status: ATTENDANCE_TO_LOG_STATUS[record.status] ?? 'hadir',
    time: formatTimeId(record.check_in_at),
    method: record.closed ? `${record.class_name} (ditutup)` : record.class_name,
    note: record.status === 'late' ? 'Terlambat' : (record.notes ?? ''),
  }));
}

/**
 * Builds the attendance query window from the selected academic year (start → today).
 * @param year - Selected AcademicYear (may be undefined while loading).
 * @returns DateRange with ISO from/to strings.
 */
export function rangeFromAcademicYear(year?: AcademicYear): DateRange {
  const today = new Date().toISOString().slice(0, 10);
  const from = year?.start_date?.slice(0, 10) ?? '';
  return { from, to: today };
}

/**
 * Triggers a browser save dialog for a downloaded blob.
 * @param blob - File payload from downloadFile().
 * @param filename - Server-suggested filename (falls back to 'unduh.xlsx').
 */
export function triggerBlobDownload(blob: Blob, filename: string | null): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename ?? 'unduh.xlsx';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Query keys (module-scoped, follow the ['<module>', ...] convention)
// ---------------------------------------------------------------------------
const masterSiswaKeys = {
  all: ['master-siswa'] as const,
  students: (params: MasterSiswaListParams) => ['master-siswa', 'students', params] as const,
  attendanceSummary: (range: DateRange) => ['master-siswa', 'attendance-summary', range] as const,
  disciplineStudent: (id: string) => ['master-siswa', 'discipline-student', id] as const,
  history: (id: string, range: DateRange, limit: number) =>
    ['master-siswa', 'history', id, range, limit] as const,
  classCounts: (id: string) => ['master-siswa', 'class-counts', id] as const,
};

function invalidateAfterWrite(queryClient: ReturnType<typeof useQueryClient>): void {
  void queryClient.invalidateQueries({ queryKey: masterSiswaKeys.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.students() });
  void queryClient.invalidateQueries({ queryKey: ['students'] });
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * GET /students with server-side search/class/status/sort + limit/offset pagination.
 * @param params - Current list filters (search, class_id, status, sort, limit, offset).
 * @returns Query state over Paginated<Student>.
 */
export function useMasterStudentList(params: MasterSiswaListParams) {
  return useQuery({
    queryKey: masterSiswaKeys.students(params),
    queryFn: async () => await apiGet<Paginated<Student>>('/students', { ...params }),
  });
}

/**
 * Query options for GET /students/:id (detail incl. enrollments[]).
 * @param id - Student id ('' disables the query).
 * @returns queryOptions resolving to StudentDetail.
 */
export function studentDetailOptions(id: string) {
  return queryOptions({
    queryKey: queryKeys.student(id),
    queryFn: async () => {
      const result = await apiGet<{ student: StudentDetail }>(`/students/${id}`);
      return result.student;
    },
    enabled: id !== '',
  });
}

/**
 * GET /students/:id hook.
 * @param id - Student id ('' disables the query).
 * @returns Query state over StudentDetail.
 */
export function useStudentDetail(id: string) {
  return useQuery(studentDetailOptions(id));
}

/**
 * Query options for GET /attendance/summary over a date window (all students).
 * @param range - from/to ISO window ('' from disables the query).
 * @returns queryOptions resolving to AttendanceSummaryResponse.
 */
export function attendanceSummaryOptions(range: DateRange) {
  return queryOptions({
    queryKey: masterSiswaKeys.attendanceSummary(range),
    queryFn: async () =>
      await apiGet<AttendanceSummaryResponse>('/attendance/summary', { ...range }),
    enabled: range.from !== '',
  });
}

/**
 * GET /attendance/summary hook (index rows by student_id at the call site).
 * @param range - from/to ISO window.
 * @returns Query state over AttendanceSummaryResponse.
 */
export function useAttendanceSummary(range: DateRange) {
  return useQuery(attendanceSummaryOptions(range));
}

/**
 * GET /discipline/students/:id for every id in the list (one query per student,
 * the backend has no bulk per-student discipline endpoint).
 * @param ids - Student ids currently visible.
 * @returns Map of student id to its discipline profile.
 */
export function useStudentDisciplineMap(ids: string[]): Record<string, StudentDisciplineProfile> {
  const resolvedIds = ids.filter((id) => id !== '');
  const results = useQueries({
    queries: resolvedIds.map((id) => ({
      queryKey: masterSiswaKeys.disciplineStudent(id),
      queryFn: async () => await apiGet<StudentDisciplineProfile>(`/discipline/students/${id}`),
    })),
  });

  const entries: [string, StudentDisciplineProfile][] = [];
  for (const [index, id] of resolvedIds.entries()) {
    const data = results[index]?.data;
    if (data !== undefined) {
      entries.push([id, data]);
    }
  }
  return Object.fromEntries(entries);
}

/**
 * GET /classes/:id/students?limit=1 per class to read the live roster `total`
 * (the Class DTO itself carries no student count).
 * @param classIds - Class ids of the selected academic year.
 * @returns Map of class id to current student count.
 */
export function useClassCounts(classIds: string[]): Record<string, number> {
  const resolvedIds = classIds.filter((id) => id !== '');
  const results = useQueries({
    queries: resolvedIds.map((id) => ({
      queryKey: masterSiswaKeys.classCounts(id),
      queryFn: async () => {
        const page = await apiGet<Paginated<Student>>(`/classes/${id}/students`, { limit: 1 });
        return page.total;
      },
    })),
  });

  const entries: [string, number][] = [];
  for (const [index, id] of resolvedIds.entries()) {
    const total = results[index]?.data;
    if (total !== undefined) {
      entries.push([id, total]);
    }
  }
  return Object.fromEntries(entries);
}

/**
 * GET /attendance/history for one student within a range (recent logs timeline).
 * @param id - Student id ('' disables the query).
 * @param range - from/to ISO window.
 * @param limit - Max rows to fetch.
 * @returns Query state over the HistoryRecord rows.
 */
export function useStudentHistory(id: string, range: DateRange, limit: number) {
  return useQuery({
    queryKey: masterSiswaKeys.history(id, range, limit),
    queryFn: async () => {
      const page = await apiGet<Paginated<HistoryRecord>>('/attendance/history', {
        student_id: id,
        ...range,
        limit,
      });
      return page.data;
    },
    enabled: id !== '' && range.from !== '',
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * POST /students — create one student (201 {student}).
 * @returns Mutation over the created Student.
 */
export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: StudentInputPayload) => {
      const result = await apiPost<{ student: Student }>('/students', payload);
      return result.student;
    },
    onSuccess: () => {
      invalidateAfterWrite(queryClient);
    },
  });
}

/**
 * PUT /students/:id — update identity fields of one student (200 {student}).
 * @returns Mutation over the updated Student.
 */
export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; payload: StudentInputPayload }) => {
      const result = await apiPut<{ student: Student }>(`/students/${vars.id}`, vars.payload);
      return result.student;
    },
    onSuccess: () => {
      invalidateAfterWrite(queryClient);
    },
  });
}

/**
 * Edit-mode save: PUT /students/:id for identity fields plus (when the picked
 * class differs) PUT /students/:id/class — the update endpoint itself accepts no
 * class_id (verified against the Go studentUpdateRequest).
 * @returns Mutation over the final Student after optional class move.
 */
export function useSaveStudentEdit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; payload: StudentInputPayload; classId?: string }) => {
      const identity = await apiPut<{ student: Student }>(`/students/${vars.id}`, vars.payload);
      if (vars.classId === undefined || vars.classId === '') {
        return identity.student;
      }
      const moved = await apiPut<{ student: Student }>(`/students/${vars.id}/class`, {
        class_id: vars.classId,
      });
      return moved.student;
    },
    onSuccess: () => {
      invalidateAfterWrite(queryClient);
    },
  });
}

/**
 * PATCH /students/:id/status applied to every selected id (bulk archive/reactivate).
 * @returns Mutation over the updated Students.
 */
export function useBulkStudentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { ids: string[]; status: string }) =>
      await Promise.all(
        vars.ids.map(async (id) => {
          const result = await apiPatch<{ student: Student }>(`/students/${id}/status`, {
            status: vars.status,
          });
          return result.student;
        }),
      ),
    onSuccess: () => {
      invalidateAfterWrite(queryClient);
    },
  });
}

/**
 * PUT /students/:id/class applied to every selected id (bulk class mutation / rombel move).
 * @returns Mutation over the updated Students.
 */
export function useBulkAssignClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { ids: string[]; class_id: string; start_date?: string }) =>
      await Promise.all(
        vars.ids.map(async (id) => {
          const result = await apiPut<{ student: Student }>(`/students/${id}/class`, {
            class_id: vars.class_id,
            start_date: vars.start_date,
          });
          return result.student;
        }),
      ),
    onSuccess: () => {
      invalidateAfterWrite(queryClient);
    },
  });
}

// ---------------------------------------------------------------------------
// Import / export
// ---------------------------------------------------------------------------
type ImportUploadResult = {
  job: ImportJob;
  preview: ImportPreviewRow[];
  errors: ImportErrorRow[];
};

/**
 * POST /imports/students — multipart upload (field `file`, form field `mode`).
 * @returns Mutation over {job, preview, errors}.
 */
export function useImportStudents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { file: File; mode: ImportMode }): Promise<ImportUploadResult> => {
      const formData = new FormData();
      formData.append('file', vars.file);
      formData.append('mode', vars.mode);
      const result = await apiUpload<ImportUploadResult>('/imports/students', formData);
      void queryClient.invalidateQueries({ queryKey: masterSiswaKeys.all });
      return result;
    },
  });
}

/**
 * POST /imports/:id/confirm — applies a validated import job.
 * @returns Mutation over the confirmed ImportJob.
 */
export function useConfirmImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await apiPost<ImportConfirmResponse>(`/imports/${id}/confirm`);
      return result.import;
    },
    onSuccess: () => {
      invalidateAfterWrite(queryClient);
    },
  });
}

/** GET /import-templates/students — downloads the official XLSX template. */
export async function downloadStudentTemplate(): Promise<void> {
  const file = await downloadFile('/import-templates/students');
  triggerBlobDownload(file.blob, file.filename);
}

/**
 * GET /exports/students — downloads the student directory as XLSX (supports list filters).
 * @param params - Current list filters (search, class_id, status are forwarded).
 */
export async function downloadStudentsExport(params: MasterSiswaListParams): Promise<void> {
  const file = await downloadFile('/exports/students', {
    search: params.search,
    class_id: params.class_id,
    status: params.status,
  });
  triggerBlobDownload(file.blob, file.filename);
}
