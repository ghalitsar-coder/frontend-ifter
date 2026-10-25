import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
  apiUpload,
  downloadFile,
  ApiError,
} from '@/lib/api/client';
import type {
  ApiUser,
  Class,
  CredentialIssue,
  CreateUserResponse,
  DataList,
  DutyAssignment,
  HomeroomAssignment,
  ImportConfirmResponse,
  ImportErrorRow,
  ImportJob,
  ImportMode,
  ImportPreviewRow,
  ImportUploadResponse,
  Paginated,
  Teacher,
  UserRole,
} from '@/lib/api/dto';
import { queryKeys } from '@/lib/api/queries';
import type { TeacherProfile } from '@/types/masterGuru';

// ---------------------------------------------------------------------------
// Query keys — module-scoped convention `['master-guru', ...]` (never edit
// the shared queryKeys factory).
// ---------------------------------------------------------------------------
export const masterGuruKeys = {
  root: ['master-guru'] as const,
  teachers: (query?: MasterGuruTeacherQuery) => ['master-guru', 'teachers', query ?? {}] as const,
  dutyAssignments: ['master-guru', 'duty-assignments'] as const,
  userAccounts: (userIds: string[]) => ['master-guru', 'user-accounts', userIds] as const,
  employmentTypes: ['master-guru', 'employment-types'] as const,
};

// ---------------------------------------------------------------------------
// Param / view types
// ---------------------------------------------------------------------------
export type MasterGuruTeacherQuery = {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
};

/**
 * Employment type master record (API_ADDENDUM §6.5, GET /employment-types).
 * Local module type — the shared dto.ts is intentionally not extended here.
 */
export type EmploymentType = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * Backend `Teacher` as extended by the employment-type package: GET/POST/PUT
 * /teachers additionally expose `employment_type_id` and
 * `employment_type_name` (both null until migration 000013 data exists).
 */
export type TeacherWithEmployment = Teacher & {
  employment_type_id?: string;
  employment_type_name?: string;
};

/** Linked login account for a teacher record (GET /users/:id). */
export type TeacherAccount = {
  id: string;
  username: string;
  roles: UserRole[];
};

/** Preview row as the import modal renders it. */
export type TeacherImportRowView = {
  rowNumber: number;
  nip: string;
  name: string;
  detail: string;
  actionLabel: string;
  validationStatus: 'valid' | 'warning' | 'error';
  statusLabel: string;
  note: string;
};

/** Everything the Add-teacher modal submits (UI draft, not a backend DTO). */
export type NewTeacherDraft = {
  fullName: string;
  employeeNumber: string;
  email: string;
  phone: string;
  accessLevel: 'teacher' | 'homeroom' | 'admin';
  createAccount: boolean;
  homeroomClassId?: string;
  dutyWeekday?: number;
  /** Selected GET /employment-types id; omitted leaves the backend NULL (= unknown). */
  employmentTypeId?: string;
};

/** Everything the Edit-teacher modal submits (PUT /teachers/:id fields only). */
export type EditTeacherDraft = {
  teacherId: string;
  userId?: string;
  fullName: string;
  employeeNumber: string;
  email: string;
  phone: string;
  employmentTypeId?: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
/** ISO weekday numbering used by /duty-assignments and /attendance/settings. */
export const WEEKDAY_NAMES = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
] as const;

const todayIsoDate = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${String(now.getFullYear())}-${month}-${day}`;
};

const usernameFromEmail = (email: string): string => {
  const prefix = email.split('@')[0] ?? email;
  return prefix.replaceAll(/[^a-zA-Z0-9._-]/gu, '').slice(0, 40) || 'guru';
};

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------
const buildRoleLabels = (vars: {
  isAdmin: boolean;
  hasHomeroom: boolean;
  hasDuty: boolean;
  hasAccount: boolean;
}): string[] => {
  const roles: string[] = [];
  if (vars.isAdmin) {
    roles.push('Administrator');
  }
  if (vars.hasHomeroom) {
    roles.push('Wali Kelas');
  }
  if (vars.hasDuty) {
    roles.push('Guru Piket');
  }
  if (vars.hasAccount && roles.length === 0) {
    roles.push('Guru Pengampu');
  }
  if (roles.length === 0) {
    // shortcut: backend Teacher has no roles column, keep generic label
    roles.push('Belum Ada Penugasan');
  }
  return roles;
};

/**
 * Maps the lean backend `Teacher` DTO onto the rich UI `TeacherProfile`.
 * The Go API only models id, employee_number (NIP), full_name, email, phone
 * and active/inactive status, so the extra UI columns are filled from the
 * joined class/duty/account data or kept at safe placeholder defaults.
 * @param teacher - GET/POST /teachers record.
 * @param classes - Active classes (used to find the homeroom assignment).
 * @param duties - Duty assignments (picket day per teacher).
 * @param accounts - Linked login accounts keyed by teacher.user_id.
 * @returns Profile shaped for MasterGuruTable/Header.
 */
export function mapTeacherToProfile(
  teacher: TeacherWithEmployment,
  classes: Class[],
  duties: DutyAssignment[],
  accounts: Record<string, TeacherAccount>,
): TeacherProfile {
  const homeroom = classes.find((cls) => cls.homeroom_teacher_id === teacher.id);
  const duty = duties.find((assignment) => assignment.teacher_id === teacher.id);
  const account = teacher.user_id === undefined ? undefined : accounts[teacher.user_id];
  const isAdmin = account?.roles.includes('admin') ?? false;

  let dutyDay: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' = 'Senin';
  if (duty !== undefined && duty.weekday >= 1 && duty.weekday <= 6) {
    const dutyName = WEEKDAY_NAMES[duty.weekday - 1];
    // The duty dropdown has no Sunday (Minggu) option; fall back to Senin.
    if (dutyName !== undefined && dutyName !== 'Minggu') {
      dutyDay = dutyName;
    }
  }

  let accessLevel: TeacherProfile['accessLevel'] = 'teacher';
  if (homeroom !== undefined) {
    accessLevel = 'homeroom';
  }
  if (isAdmin) {
    accessLevel = 'admin';
  }

  const roles = buildRoleLabels({
    isAdmin,
    hasHomeroom: homeroom !== undefined,
    hasDuty: duty !== undefined,
    hasAccount: account !== undefined,
  });

  return {
    id: teacher.id,
    userId: teacher.user_id,
    nip: teacher.employee_number ?? '-',
    nuptk: undefined, // shortcut: no backend field, keep unset
    nik: undefined, // shortcut: no backend field, keep unset
    name: teacher.full_name,
    gender: 'L', // shortcut: no backend gender field on Teacher
    email: teacher.email ?? '',
    phone: teacher.phone ?? '',
    employmentStatus: 'PNS', // shortcut: no legacy PNS/PPPK column on Teacher
    employmentTypeId: teacher.employment_type_id,
    employmentTypeName: teacher.employment_type_name,
    subject: '', // shortcut: no backend subject field on Teacher
    teachingHoursPerWeek: 0, // shortcut: no backend teaching-hours field
    roles,
    homeroomClass:
      homeroom === undefined
        ? undefined
        : {
            className: homeroom.name,
            studentCount: 0, // shortcut: class roster size not exposed by /classes
          },
    picketDuty:
      duty === undefined
        ? undefined
        : {
            day: dutyDay,
            // shortcut: duty-assignments have no post/location model
            postName: 'Pos Gerbang Pagi',
            postLocation: 'Gerbang Utama',
            isCheckedIn: false, // shortcut: no duty check-in endpoint
          },
    accessLevel,
    status: teacher.status === 'active' ? 'active' : 'inactive',
    rfidUid: undefined, // shortcut: no backend RFID field on Teacher
  };
}

/**
 * Maps the teacher page plus joined masterdata into UI profiles.
 * @param teachers - GET /teachers page data.
 * @param classes - GET /classes data.
 * @param duties - GET /duty-assignments data.
 * @param accounts - Linked accounts by user id.
 * @returns TeacherProfile list for the table/header.
 */
export function buildTeacherProfiles(
  teachers: TeacherWithEmployment[],
  classes: Class[],
  duties: DutyAssignment[],
  accounts: Record<string, TeacherAccount>,
): TeacherProfile[] {
  return teachers.map((teacher) => mapTeacherToProfile(teacher, classes, duties, accounts));
}

/**
 * Human label for a server preview action (`create` / `update` / `unchanged`).
 * @param action - ImportPreviewRow.action value.
 * @returns Indonesian column value for the modal preview table.
 */
const actionLabelFor = (action: string): string => {
  if (action === 'update') {
    return 'Perbarui';
  }
  if (action === 'unchanged') {
    return 'Tetap';
  }
  return 'Baru';
};

/**
 * Combines the backend import preview + row errors into the rows the modal
 * table displays. Rows referenced by an error are flagged; `unchanged` upsert
 * rows get a warning tint because syncing them changes nothing.
 * @param preview - ImportUploadResponse.preview.
 * @param errors - ImportUploadResponse.errors.
 * @returns View rows for MasterGuruImportModal.
 */
export function mapImportPreview(
  preview: ImportPreviewRow[],
  errors: ImportErrorRow[],
): TeacherImportRowView[] {
  const errorsByRow = new Map<number, ImportErrorRow[]>();
  for (const error of errors) {
    const list = errorsByRow.get(error.row_number) ?? [];
    list.push(error);
    errorsByRow.set(error.row_number, list);
  }

  return preview.map((row) => {
    const rowErrors = errorsByRow.get(row.row_number) ?? [];
    const actionLabel = actionLabelFor(row.action);
    if (rowErrors.length > 0) {
      return {
        rowNumber: row.row_number,
        nip: row.key,
        name: row.name,
        detail: row.class_name ?? '-',
        actionLabel,
        validationStatus: 'error' as const,
        statusLabel: rowErrors[0]?.code === 'duplicate' ? 'Duplikat' : 'Error',
        note: rowErrors.map((error) => error.message).join(' • '),
      };
    }
    return {
      rowNumber: row.row_number,
      nip: row.key,
      name: row.name,
      detail: row.class_name ?? '-',
      actionLabel,
      validationStatus: row.action === 'unchanged' ? ('warning' as const) : ('valid' as const),
      statusLabel: row.action === 'update' ? 'Akan diperbarui' : 'Valid',
      note:
        (row.changed_fields ?? []).length > 0
          ? `Perubahan: ${(row.changed_fields ?? []).join(', ')}`
          : 'Baris siap disinkronkan ke basis data.',
    };
  });
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
export const masterGuruTeachersOptions = (params?: MasterGuruTeacherQuery) =>
  queryOptions({
    queryKey: masterGuruKeys.teachers(params),
    queryFn: async () =>
      await apiGet<Paginated<TeacherWithEmployment>>('/teachers', {
        limit: 100,
        ...params,
      }),
  });

export const useMasterGuruTeachers = (params?: MasterGuruTeacherQuery) =>
  useQuery(masterGuruTeachersOptions(params));

/**
 * GET /employment-types — the employment-type master (API_ADDENDUM §6.5).
 * Seeded codes: `permanent` (Tetap), `honorary` (Honorer), `staff_tu` (Staf TU).
 * @returns Active list of employment types for the create/edit dropdown and
 * the table filter (the backend has no server-side employment filter on
 * GET /teachers, so filtering happens client-side on `employment_type_id`).
 */
export const employmentTypesOptions = () =>
  queryOptions({
    queryKey: masterGuruKeys.employmentTypes,
    queryFn: async () => {
      const result = await apiGet<DataList<EmploymentType>>('/employment-types');
      return result.data;
    },
  });

export const useEmploymentTypes = () => useQuery(employmentTypesOptions());

export const dutyAssignmentsOptions = () =>
  queryOptions({
    queryKey: masterGuruKeys.dutyAssignments,
    queryFn: async () => {
      const result = await apiGet<DataList<DutyAssignment>>('/duty-assignments');
      return result.data;
    },
  });

export const useDutyAssignments = () => useQuery(dutyAssignmentsOptions());

export const teacherAccountsOptions = (userIds: string[]) =>
  queryOptions({
    queryKey: masterGuruKeys.userAccounts(userIds),
    queryFn: async () => {
      const entries = await Promise.all(
        userIds.map(async (userId) => {
          const response = await apiGet<{ user: ApiUser & { status: string } }>(`/users/${userId}`);
          return [
            response.user.id,
            { id: response.user.id, username: response.user.username, roles: response.user.roles },
          ] as const;
        }),
      );
      return Object.fromEntries(entries);
    },
    enabled: userIds.length > 0,
  });

export const useTeacherAccounts = (userIds: string[]) => useQuery(teacherAccountsOptions(userIds));

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
export type CreateTeacherResult = {
  teacher: Teacher;
  accountCreated: boolean;
  homeroomAssigned: boolean;
  dutyAssigned: boolean;
};

/**
 * Registers a teacher: optional login account (POST /users), the teacher
 * record (POST /teachers), then optional homeroom (PUT /classes/:id/homeroom)
 * and picket duty (POST /duty-assignments). Account failures are tolerated so
 * a teacher can still be saved without an account.
 * @param draft - UI form draft from the Add Teacher modal.
 * @returns Result flags describing which backend steps succeeded.
 */
export const createTeacherProfile = async (
  draft: NewTeacherDraft,
): Promise<CreateTeacherResult> => {
  let userId: string | undefined;
  let accountCreated = false;
  if (draft.createAccount) {
    try {
      const roles: UserRole[] = draft.accessLevel === 'admin' ? ['admin'] : ['teacher'];
      const { user } = await apiPost<CreateUserResponse>('/users', {
        username: usernameFromEmail(draft.email),
        email: draft.email,
        full_name: draft.fullName,
        roles,
      });
      const { id } = user;
      userId = id;
      accountCreated = true;
    } catch {
      accountCreated = false;
    }
  }

  const { teacher } = await apiPost<{ teacher: TeacherWithEmployment }>('/teachers', {
    full_name: draft.fullName,
    employee_number: draft.employeeNumber,
    email: draft.email,
    phone: draft.phone,
    status: 'active',
    ...(userId === undefined ? {} : { user_id: userId }),
    ...(draft.employmentTypeId === undefined || draft.employmentTypeId === ''
      ? {}
      : { employment_type_id: draft.employmentTypeId }),
  });

  let homeroomAssigned = false;
  if (draft.homeroomClassId !== undefined && draft.homeroomClassId !== '') {
    await apiPut<{ homeroom: HomeroomAssignment }>(`/classes/${draft.homeroomClassId}/homeroom`, {
      teacher_id: teacher.id,
      start_date: todayIsoDate(),
    });
    homeroomAssigned = true;
  }

  let dutyAssigned = false;
  if (draft.dutyWeekday !== undefined) {
    await apiPost<DutyAssignment>('/duty-assignments', {
      teacher_id: teacher.id,
      weekday: draft.dutyWeekday,
      start_date: todayIsoDate(),
    });
    dutyAssigned = true;
  }

  return { teacher, accountCreated, homeroomAssigned, dutyAssigned };
};

/**
 * POST /teachers + optional /users, /classes/:id/homeroom, /duty-assignments.
 * Invalidates the teacher directory, classes and duty caches on success.
 * @returns Mutation over NewTeacherDraft.
 */
export const useCreateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (draft: NewTeacherDraft) => await createTeacherProfile(draft),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: masterGuruKeys.root });
      void queryClient.invalidateQueries({ queryKey: queryKeys.teachers() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.classes() });
    },
  });
};

/**
 * PUT /teachers/:id — updates the teacher master record (name, NIP, contacts
 * and the optional `employment_type_id`). The backend overwrites the row from
 * the payload, so every field is submitted; omitted `employment_type_id`
 * clears it back to NULL (= unknown in the dashboard breakdown).
 * @param draft - UI draft from the Edit Teacher modal.
 * @returns The updated teacher record.
 */
export const updateTeacherProfile = async (
  draft: EditTeacherDraft,
): Promise<TeacherWithEmployment> => {
  const { teacher } = await apiPut<{ teacher: TeacherWithEmployment }>(
    `/teachers/${draft.teacherId}`,
    {
      full_name: draft.fullName,
      employee_number: draft.employeeNumber,
      email: draft.email,
      phone: draft.phone,
      ...(draft.userId === undefined ? {} : { user_id: draft.userId }),
      ...(draft.employmentTypeId === undefined || draft.employmentTypeId === ''
        ? {}
        : { employment_type_id: draft.employmentTypeId }),
    },
  );
  return teacher;
};

/**
 * PUT /teachers/:id as a mutation; invalidates the teacher caches.
 * @returns Mutation over EditTeacherDraft.
 */
export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (draft: EditTeacherDraft) => await updateTeacherProfile(draft),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: masterGuruKeys.teachers() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.teachers() });
    },
  });
};

/**
 * PATCH /teachers/:id/status — toggles active/inactive.
 * @returns Mutation with {id, status} variables.
 */
export const useUpdateTeacherStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; status: 'active' | 'inactive' }) =>
      await apiPatch<{ teacher: TeacherWithEmployment }>(`/teachers/${vars.id}/status`, {
        status: vars.status,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: masterGuruKeys.teachers() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.teachers() });
    },
  });
};

/**
 * POST /imports/:entity (multipart `file` + `mode` form field). Returns the
 * 201 upload response carrying job, preview and row errors.
 * @param entity - 'teachers' or 'students'.
 * @param file - The .xlsx file picked by the user.
 * @param mode - create_only | upsert.
 * @returns ImportUploadResponse.
 */
export const uploadImportFile = async (
  entity: 'teachers' | 'students',
  file: File,
  mode: ImportMode,
): Promise<ImportUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('mode', mode);
  return await apiUpload<ImportUploadResponse>(`/imports/${entity}`, formData);
};

/**
 * POST /imports/:id/confirm — syncs the validated rows into the database.
 * @param jobId - Pending import job id from upload.
 * @returns The confirmed ImportJob (`{import}` wrapper unwrapped).
 */
export const confirmImportJob = async (jobId: string): Promise<ImportJob> => {
  const result = await apiPost<ImportConfirmResponse>(`/imports/${jobId}/confirm`);
  return result.import;
};

/**
 * POST /imports/:id/confirm as a mutation; invalidates teacher caches.
 * @returns Mutation over the job id.
 */
export const useConfirmImport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => await confirmImportJob(jobId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: masterGuruKeys.root });
      void queryClient.invalidateQueries({ queryKey: queryKeys.teachers() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.classes() });
    },
  });
};

// ---------------------------------------------------------------------------
// Downloads
// ---------------------------------------------------------------------------
/**
 * Triggers a browser save dialog for a fetched blob.
 * @param blob - Response body.
 * @param filename - Suggested file name.
 */
export const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

/**
 * GET /import-templates/:entity — official XLSX import template
 * (`teachers` or `students`).
 * @param entity - Which master data template to fetch.
 * @returns Blob + backend filename.
 */
export const downloadImportTemplate = async (entity: 'teachers' | 'students') =>
  await downloadFile(`/import-templates/${entity}`);

/**
 * GET /exports/teachers — current teacher master data as XLSX.
 * @returns Blob + backend filename.
 */
export const downloadTeacherExport = async () => await downloadFile('/exports/teachers');

// ---------------------------------------------------------------------------
// Misc helpers used by the toolbar/manager
// ---------------------------------------------------------------------------
/**
 * Extracts a user-facing message from any thrown value (ApiError envelope
 * aware, same convention as the rest of the app).
 * @param error - Caught value from a mutation or query.
 * @param fallback - Default Indonesian message when not an ApiError.
 * @returns Displayable message.
 */
export const apiErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof ApiError ? error.message : fallback;

/**
 * POST /users/:id/credential-reset — mint a fresh one-time password reset
 * token for an existing login account (admin only; 200 {credential}). The
 * token only exists in this response; it invalidates previous unused tokens.
 * @returns Mutation over the credential envelope.
 */
export function useResetUserCredential() {
  return useMutation({
    mutationFn: async (userId: string) =>
      await apiPost<{ credential: CredentialIssue }>(`/users/${userId}/credential-reset`),
  });
}
