import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, apiPost, apiPut } from '@/lib/api/client';
import type { QueryParams } from '@/lib/api/client';
import type { Class, DataList, HomeroomAssignment, Paginated, Student } from '@/lib/api/dto';

// ---------------------------------------------------------------------------
// Types (mirror internal/masterdata/types.go)
// ---------------------------------------------------------------------------
export type MasterKelasStatus = 'active' | 'archived';

/** GET /classes filters. `grade_level` is applied client-side (no server param). */
export type MasterKelasFilter = {
  academic_year_id?: string;
  grade_level?: number;
  status?: MasterKelasStatus;
};

/** Form draft shared by the create and edit modals. */
export type ClassDraft = {
  name: string;
  gradeLevel: number;
  academicYearId: string;
  major?: string;
};

/** POST /classes body. */
export type CreateClassPayload = {
  academic_year_id: string;
  name: string;
  grade_level: number;
  major?: string;
};

/** PUT /classes/:id body (academic year is immutable after creation). */
export type UpdateClassPayload = {
  name: string;
  grade_level: number;
  major?: string;
};

/** PUT /classes/:id/homeroom body; empty start_date lets the backend use the year start. */
export type HomeroomPayload = {
  teacher_id: string;
  start_date?: string;
};

/** GET /classes/:id/students row (Student + enrollment window). */
export type KelasStudent = Student & {
  enrollment_start: string;
  enrollment_end?: string;
};

/** Table-ready class row. */
export type ClassRow = {
  id: string;
  name: string;
  gradeLabel: string;
  academicYearName: string;
  major: string;
  homeroomTeacherName: string;
  hasHomeroom: boolean;
  status: string;
  statusLabel: string;
  isActive: boolean;
};

// ---------------------------------------------------------------------------
// Query keys — module-scoped; the shared queryKeys factory stays untouched.
// ---------------------------------------------------------------------------
export const masterKelasKeys = {
  root: ['master-kelas'] as const,
  list: (filter?: MasterKelasFilter) => ['master-kelas', 'classes', filter ?? {}] as const,
  students: (classId: string) => ['master-kelas', 'classes', classId, 'students'] as const,
};

// ---------------------------------------------------------------------------
// Mappers and payload builders
// ---------------------------------------------------------------------------
const GRADE_MIN = 7;
const GRADE_MAX = 12;

/**
 * Human label for a grade level.
 * @param gradeLevel - Backend `grade_level` (7-12 in the UI).
 * @returns Indonesian grade label.
 */
export const gradeLabel = (gradeLevel: number): string => `Tingkat ${gradeLevel}`;

/**
 * Human label for a class status.
 * @param status - Backend status (`active` / `archived`).
 * @returns Indonesian status label; unknown values pass through.
 */
export const statusLabel = (status: string): string => {
  if (status === 'active') {
    return 'Aktif';
  }
  if (status === 'archived') {
    return 'Diarsipkan';
  }
  return status;
};

/**
 * Human label for a student status shown in the class roster.
 * @param status - Backend student status (`active`/`transferred`/`graduated`/`inactive`).
 * @returns Indonesian status label; unknown values pass through.
 */
export const studentStatusLabel = (status: string): string => {
  if (status === 'active') {
    return 'Aktif';
  }
  if (status === 'transferred') {
    return 'Mutasi';
  }
  if (status === 'graduated') {
    return 'Alumni';
  }
  if (status === 'inactive') {
    return 'Nonaktif';
  }
  return status;
};

/**
 * Maps GET /classes rows onto table rows with Indonesian labels.
 * @param row - Backend class record.
 * @returns Table-ready class row.
 */
export const mapClassToRow = (row: Class): ClassRow => {
  const teacherName = row.homeroom_teacher_name?.trim() ?? '';
  return {
    id: row.id,
    name: row.name,
    gradeLabel: gradeLabel(row.grade_level),
    academicYearName: row.academic_year_name,
    major: row.major?.trim() ?? '',
    homeroomTeacherName: teacherName === '' ? 'Belum ditugaskan' : teacherName,
    hasHomeroom: teacherName !== '',
    status: row.status,
    statusLabel: statusLabel(row.status),
    isActive: row.status === 'active',
  };
};

/**
 * Keeps only rows of one grade (backend GET /classes has no grade filter).
 * @param rows - Class rows from the API.
 * @param gradeLevel - Grade to keep.
 * @returns Filtered rows.
 */
export const filterClassesByGrade = (rows: Class[], gradeLevel: number): Class[] =>
  rows.filter((row) => row.grade_level === gradeLevel);

/**
 * Builds the GET /classes query string (server supports year + status only).
 * @param filter - UI filter state.
 * @returns Query params including the page limit.
 */
export const buildClassQuery = (filter?: MasterKelasFilter): QueryParams => ({
  limit: 100,
  ...(filter?.academic_year_id === undefined || filter.academic_year_id === ''
    ? {}
    : { academic_year_id: filter.academic_year_id }),
  ...(filter?.status === undefined ? {} : { status: filter.status }),
});

const normalizeGrade = (gradeLevel: number): number => {
  if (!Number.isInteger(gradeLevel) || gradeLevel < GRADE_MIN || gradeLevel > GRADE_MAX) {
    throw new Error(`Tingkat kelas harus ${GRADE_MIN}-${GRADE_MAX}.`);
  }
  return gradeLevel;
};

const normalizeName = (name: string): string => {
  const trimmed = name.trim();
  if (trimmed === '') {
    throw new Error('Nama kelas wajib diisi.');
  }
  return trimmed;
};

const optionalMajor = (major?: string): { major?: string } => {
  const trimmed = major?.trim() ?? '';
  return trimmed === '' ? {} : { major: trimmed };
};

/**
 * Builds the POST /classes body from the form draft.
 * @param draft - Create form values.
 * @returns Validated create payload.
 */
export const buildCreateClassPayload = (draft: ClassDraft): CreateClassPayload => {
  const academicYearId = draft.academicYearId.trim();
  if (academicYearId === '') {
    throw new Error('Tahun ajaran wajib dipilih.');
  }
  return {
    academic_year_id: academicYearId,
    name: normalizeName(draft.name),
    grade_level: normalizeGrade(draft.gradeLevel),
    ...optionalMajor(draft.major),
  };
};

/**
 * Builds the PUT /classes/:id body from the form draft.
 * @param draft - Edit form values.
 * @returns Validated update payload.
 */
export const buildUpdateClassPayload = (draft: ClassDraft): UpdateClassPayload => ({
  name: normalizeName(draft.name),
  grade_level: normalizeGrade(draft.gradeLevel),
  ...optionalMajor(draft.major),
});

/**
 * Builds the PUT /classes/:id/homeroom body.
 * @param teacherId - Selected active teacher id.
 * @param startDate - Optional ISO start date (empty = academic year start).
 * @returns Validated homeroom payload.
 */
export const buildHomeroomPayload = (teacherId: string, startDate?: string): HomeroomPayload => {
  const trimmedTeacher = teacherId.trim();
  if (trimmedTeacher === '') {
    throw new Error('Wali kelas wajib dipilih.');
  }
  const trimmedDate = startDate?.trim() ?? '';
  return {
    teacher_id: trimmedTeacher,
    ...(trimmedDate === '' ? {} : { start_date: trimmedDate }),
  };
};

// ---------------------------------------------------------------------------
// Request functions (also unit-tested without React)
// ---------------------------------------------------------------------------
/**
 * GET /classes with client-side grade filtering.
 * @param filter - UI filter state.
 * @returns Paginated class records.
 */
export const fetchClasses = async (filter?: MasterKelasFilter): Promise<Paginated<Class>> => {
  const result = await apiGet<Paginated<Class>>('/classes', buildClassQuery(filter));
  if (filter?.grade_level === undefined) {
    return result;
  }
  const data = filterClassesByGrade(result.data, filter.grade_level);
  return { ...result, data, total: data.length };
};

/**
 * GET /classes/:id/students.
 * @param classId - Class id.
 * @returns Student rows enrolled in the class.
 */
export const fetchClassStudents = async (classId: string): Promise<KelasStudent[]> => {
  const result = await apiGet<DataList<KelasStudent>>(`/classes/${classId}/students`);
  return result.data;
};

/**
 * POST /classes.
 * @param payload - Create payload.
 * @returns Created class record.
 */
export const createClass = async (payload: CreateClassPayload): Promise<Class> => {
  const result = await apiPost<{ class: Class }>('/classes', payload);
  return result.class;
};

/**
 * PUT /classes/:id.
 * @param classId - Class id.
 * @param payload - Update payload.
 * @returns Updated class record.
 */
export const updateClass = async (classId: string, payload: UpdateClassPayload): Promise<Class> => {
  const result = await apiPut<{ class: Class }>(`/classes/${classId}`, payload);
  return result.class;
};

/**
 * PATCH /classes/:id/status.
 * @param classId - Class id.
 * @param status - Target status.
 * @returns Updated class record.
 */
export const updateClassStatus = async (
  classId: string,
  status: MasterKelasStatus,
): Promise<Class> => {
  const result = await apiPatch<{ class: Class }>(`/classes/${classId}/status`, { status });
  return result.class;
};

/**
 * PUT /classes/:id/homeroom.
 * @param classId - Class id.
 * @param payload - Homeroom payload.
 * @returns New homeroom assignment.
 */
export const assignClassHomeroom = async (
  classId: string,
  payload: HomeroomPayload,
): Promise<HomeroomAssignment> => {
  const result = await apiPut<{ homeroom: HomeroomAssignment }>(
    `/classes/${classId}/homeroom`,
    payload,
  );
  return result.homeroom;
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
export const masterKelasListOptions = (filter?: MasterKelasFilter) =>
  queryOptions({
    queryKey: masterKelasKeys.list(filter),
    queryFn: async () => await fetchClasses(filter),
  });

export const classStudentsOptions = (classId: string) =>
  queryOptions({
    queryKey: masterKelasKeys.students(classId),
    queryFn: async () => await fetchClassStudents(classId),
    enabled: classId !== '',
  });

/**
 * GET /classes → class list for the toolbar filters.
 * @param filter - Academic year / grade / status filters.
 * @returns React Query result with `Paginated<Class>`.
 */
export const useMasterKelasList = (filter?: MasterKelasFilter) =>
  useQuery(masterKelasListOptions(filter));

/**
 * GET /classes/:id/students → roster of one class.
 * @param classId - Class id (query stays disabled while empty).
 * @returns React Query result with `KelasStudent[]`.
 */
export const useMasterKelasStudents = (classId: string) => useQuery(classStudentsOptions(classId));

// ---------------------------------------------------------------------------
// Mutations (all invalidate the module root so lists/rosters refresh)
// ---------------------------------------------------------------------------
export type UpdateClassVariables = UpdateClassPayload & { classId: string };

export type AssignHomeroomVariables = HomeroomPayload & { classId: string };

export type UpdateClassStatusVariables = { classId: string; status: MasterKelasStatus };

/**
 * POST /classes.
 * @returns Mutation over `CreateClassPayload`.
 */
export const useCreateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateClassPayload) => await createClass(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: masterKelasKeys.root });
    },
  });
};

/**
 * PUT /classes/:id.
 * @returns Mutation over `UpdateClassVariables`.
 */
export const useUpdateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ classId, ...payload }: UpdateClassVariables) =>
      await updateClass(classId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: masterKelasKeys.root });
    },
  });
};

/**
 * PATCH /classes/:id/status (archive / reactivate).
 * @returns Mutation over `UpdateClassStatusVariables`.
 */
export const useUpdateClassStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ classId, status }: UpdateClassStatusVariables) =>
      await updateClassStatus(classId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: masterKelasKeys.root });
    },
  });
};

/**
 * PUT /classes/:id/homeroom (assign or replace the homeroom teacher).
 * @returns Mutation over `AssignHomeroomVariables`.
 */
export const useAssignHomeroom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ classId, ...payload }: AssignHomeroomVariables) =>
      await assignClassHomeroom(classId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: masterKelasKeys.root });
    },
  });
};
