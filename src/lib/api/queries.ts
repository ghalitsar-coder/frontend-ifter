import { queryOptions, useQuery } from '@tanstack/react-query';
import { getMe } from '@/lib/api/auth';
import { apiGet } from '@/lib/api/client';
import type {
  AcademicYear,
  Class,
  DataList,
  DisciplineCategory,
  Paginated,
  Student,
  Teacher,
  Term,
} from '@/lib/api/dto';

// ---------------------------------------------------------------------------
// Query key factory — invalidate predictably from mutations, e.g.
//   queryClient.invalidateQueries({ queryKey: queryKeys.classes() })
// ---------------------------------------------------------------------------
export const queryKeys = {
  authMe: ['auth', 'me'] as const,
  academicYears: ['academic-years'] as const,
  terms: (academicYearId: string) => ['academic-years', academicYearId, 'terms'] as const,
  classes: (filters?: ClassListParams) => ['classes', filters ?? {}] as const,
  teachers: (query?: TeacherListParams) => ['teachers', query ?? {}] as const,
  students: (query?: StudentListParams) => ['students', query ?? {}] as const,
  student: (id: string) => ['students', id] as const,
  disciplineCategories: (query?: DisciplineCategoriesParams) =>
    ['discipline', 'categories', query ?? {}] as const,
};

// ---------------------------------------------------------------------------
// Param types
// ---------------------------------------------------------------------------
export type ClassListParams = {
  academic_year_id?: string;
  status?: string;
};

export type TeacherListParams = {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
};

export type StudentListParams = {
  search?: string;
  class_id?: string;
  status?: string;
  sort?: string;
  limit?: number;
  offset?: number;
};

export type DisciplineCategoriesParams = {
  include_inactive?: boolean;
};

// ---------------------------------------------------------------------------
// Options (also usable standalone: useQuery(academicYearsOptions()))
// ---------------------------------------------------------------------------
export const academicYearsOptions = () =>
  queryOptions({
    queryKey: queryKeys.academicYears,
    queryFn: async () => {
      const result = await apiGet<DataList<AcademicYear>>('/academic-years');
      return result.data;
    },
  });

export const termsOptions = (academicYearId: string) =>
  queryOptions({
    queryKey: queryKeys.terms(academicYearId),
    queryFn: async () => {
      const result = await apiGet<DataList<Term>>(`/academic-years/${academicYearId}/terms`);
      return result.data;
    },
    enabled: academicYearId !== '',
  });

export const classListOptions = (params?: ClassListParams) =>
  queryOptions({
    queryKey: queryKeys.classes(params),
    queryFn: async () => {
      const result = await apiGet<Paginated<Class>>('/classes', { ...params });
      return result.data;
    },
  });

export const teacherOptionsList = (params?: TeacherListParams) =>
  queryOptions({
    queryKey: queryKeys.teachers(params),
    queryFn: async () => {
      const result = await apiGet<Paginated<Teacher>>('/teachers', { ...params });
      return result.data;
    },
  });

export const studentSearchOptions = (params?: StudentListParams) =>
  queryOptions({
    queryKey: queryKeys.students(params),
    queryFn: async () => {
      const result = await apiGet<Paginated<Student>>('/students', { ...params });
      return result.data;
    },
  });

export const disciplineCategoriesOptions = (params?: DisciplineCategoriesParams) =>
  queryOptions({
    queryKey: queryKeys.disciplineCategories(params),
    queryFn: async () => {
      const result = await apiGet<DataList<DisciplineCategory>>('/discipline/categories', {
        ...params,
      });
      return result.data;
    },
  });

export const currentUserRolesOptions = () =>
  queryOptions({
    queryKey: queryKeys.authMe,
    queryFn: async () => {
      const user = await getMe();
      return user.roles;
    },
  });

// ---------------------------------------------------------------------------
// Thin hooks
// ---------------------------------------------------------------------------
/**
 * GET /academic-years → academic year list.
 * @returns React Query result with `AcademicYear[]`.
 */
export const useAcademicYears = () => useQuery(academicYearsOptions());

/**
 * GET /academic-years/:id/terms → terms of one academic year.
 * @param academicYearId - Selected academic year id (hook stays disabled when empty).
 * @returns React Query result with `Term[]`.
 */
export const useTerms = (academicYearId: string) => useQuery(termsOptions(academicYearId));

/**
 * GET /classes → class list (filter by academic year / status).
 * @param params - Optional `academic_year_id` / `status` filters.
 * @returns React Query result with `Class[]`.
 */
export const useClassList = (params?: ClassListParams) => useQuery(classListOptions(params));

/**
 * GET /teachers → teacher directory (search boxes, duty pickers).
 * @param params - Optional `search`, `status`, `limit`, `offset`.
 * @returns React Query result with `Teacher[]`.
 */
export const useTeacherOptions = (params?: TeacherListParams) =>
  useQuery(teacherOptionsList(params));

/**
 * GET /students → student list with search/class filters and sort.
 * @param params - Optional `search`, `class_id`, `status`, `sort`, `limit`, `offset`.
 * @returns React Query result with `Student[]`.
 */
export const useStudentSearch = (params?: StudentListParams) =>
  useQuery(studentSearchOptions(params));

/**
 * GET /discipline/categories → rule/violation category catalog.
 * @param params - Optional `include_inactive` flag.
 * @returns React Query result with `DisciplineCategory[]`.
 */
export const useDisciplineCategories = (params?: DisciplineCategoriesParams) =>
  useQuery(disciplineCategoriesOptions(params));

/**
 * GET /auth/me → current user's roles only (for role-gated UI).
 * @returns React Query result with `UserRole[]`.
 */
export const useCurrentUserRoles = () => useQuery(currentUserRolesOptions());
