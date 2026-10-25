import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { defaultSystemSettings } from '@/data/mockSettings';
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api/client';
import type {
  AcademicYear,
  AttendanceHoliday,
  AttendanceSchedule,
  AttendanceSettings,
  Term,
} from '@/lib/api/dto';
import { academicYearsOptions, queryKeys, termsOptions } from '@/lib/api/queries';
import type { GeofencePolicy, PresencePolicy } from '@/types/settings';

// ---------------------------------------------------------------------------
// Query keys (module-local, extends the foundation `queryKeys` convention)
// ---------------------------------------------------------------------------
export const pengaturanQueryKeys = {
  attendanceSettings: ['attendance', 'settings'] as const,
  holidays: ['attendance', 'holidays'] as const,
  academicYear: (id: string) => ['academic-years', id] as const,
  sanctionRules: ['sanction-rules'] as const,
  geofence: ['geofence'] as const,
};

// ---------------------------------------------------------------------------
// Wave-2 DTOs (sanction rules + school geofence). Defined here because
// src/lib/api/dto.ts is a frozen shared file. Shapes mirror
// internal/sanctionrules/types.go (`Rule`) and internal/teacherpresence
// (`GeofenceConfig`) in the backend repo.
// ---------------------------------------------------------------------------

/** One row of GET /sanction-rules → { "data": [...] }. */
export type SanctionRuleDto = {
  id: string;
  name: string;
  min_points: number;
  max_points: number | null;
  action: string;
  level: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/** Envelope returned by GET/PUT /sanction-rules. */
export type SanctionRuleListDto = { data: SanctionRuleDto[] };

/** One rule inside the PUT /sanction-rules replace-all body `{ rules: [...] }`. */
export type SanctionRuleInputDto = {
  name: string;
  min_points: number;
  max_points?: number | null;
  action: string;
  level?: string;
  description?: string;
  is_active?: boolean;
};

/** Body/response of GET/PUT /geofence (full replace, admin write). */
export type GeofenceDto = {
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_enabled: boolean;
};

/** Editable UI row for the sanction-rule table (draft state before PUT). */
export type SanctionRuleDraft = {
  key: string;
  id?: string;
  name: string;
  min_points: number;
  max_points: number | null;
  action: string;
  level: string;
  description: string;
  is_active: boolean;
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
export const attendanceSettingsOptions = () =>
  queryOptions({
    queryKey: pengaturanQueryKeys.attendanceSettings,
    queryFn: async () => await apiGet<AttendanceSettings>('/attendance/settings'),
  });

/**
 * GET /attendance/settings → school attendance configuration document.
 * @returns React Query result with `AttendanceSettings`.
 */
export const useAttendanceSettings = () => useQuery(attendanceSettingsOptions());

/**
 * PUT /attendance/settings → replace the configuration document, then refetch.
 * @returns Mutation accepting a full `AttendanceSettings` payload.
 */
export const useUpdateAttendanceSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AttendanceSettings) =>
      await apiPut<AttendanceSettings>('/attendance/settings', input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: pengaturanQueryKeys.attendanceSettings });
    },
  });
};

// ---------------------------------------------------------------------------
// Sanction rules hooks — GET/PUT /sanction-rules (backend: internal/sanctionrules)
// ---------------------------------------------------------------------------
export const sanctionRulesOptions = () =>
  queryOptions({
    queryKey: pengaturanQueryKeys.sanctionRules,
    queryFn: async () => {
      const result = await apiGet<SanctionRuleListDto>('/sanction-rules');
      return result.data;
    },
  });

/**
 * GET /sanction-rules → sanction tier list (admin + discipline readers).
 * @returns React Query result with `SanctionRuleDto[]`.
 */
export const useSanctionRules = () => useQuery(sanctionRulesOptions());

/**
 * PUT /sanction-rules → replace the whole rule set in one transaction
 * (admin only; overlapping active ranges are rejected with 409).
 * @returns Mutation accepting the full `SanctionRuleInputDto[]` rule list.
 */
export const useReplaceSanctionRules = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rules: SanctionRuleInputDto[]) =>
      await apiPut<SanctionRuleListDto>('/sanction-rules', { rules }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: pengaturanQueryKeys.sanctionRules });
    },
  });
};

// ---------------------------------------------------------------------------
// Geofence hooks — GET/PUT /geofence (backend: internal/teacherpresence).
// The attendance settings payload has NO school-location fields, so the
// panels read/write this dedicated config surface instead.
// ---------------------------------------------------------------------------
export const geofenceOptions = () =>
  queryOptions({
    queryKey: pengaturanQueryKeys.geofence,
    queryFn: async () => await apiGet<GeofenceDto>('/geofence'),
  });

/**
 * GET /geofence → school center coordinates, radius and enabled flag.
 * @returns React Query result with `GeofenceDto`.
 */
export const useGeofence = () => useQuery(geofenceOptions());

/**
 * PUT /geofence → full-replace of the school location config (admin only).
 * @returns Mutation accepting a complete `GeofenceDto` body.
 */
export const useUpdateGeofence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: GeofenceDto) => await apiPut<GeofenceDto>('/geofence', input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: pengaturanQueryKeys.geofence });
    },
  });
};

// ---------------------------------------------------------------------------
// School holidays — GET /attendance/holidays (all staff),
// POST/DELETE (admin). Backend: internal/attendance.
// ---------------------------------------------------------------------------
export type HolidayInput = {
  holiday_date: string;
  name: string;
};

export const MAX_HOLIDAY_NAME_LENGTH = 150;
export const MAX_ACADEMIC_YEAR_NAME_LENGTH = 30;
export const MAX_TERM_NAME_LENGTH = 30;
/** Backend accepts term numbers 1-4 (internal/masterdata terms.go). */
export const TERM_NUMBER_RANGE = { min: 1, max: 4 } as const;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;

/**
 * Whether a value is a plain ISO day (`YYYY-MM-DD`).
 * @param value - Candidate date string.
 * @returns True for a syntactically valid ISO day.
 */
export const isIsoDay = (value: string): boolean => ISO_DATE_PATTERN.test(value);

const monthAbbreviationsId = [
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
] as const;

/**
 * Format an ISO day as `31 Des 2026` for the settings lists.
 * @param iso - ISO day (`YYYY-MM-DD`).
 * @returns Indonesian short-date label (`''` when unparsable).
 */
export const formatIsoDayId = (iso: string): string => {
  const parts = /^(\d{4})-(\d{2})-(\d{2})/u.exec(iso);
  if (parts === null) {
    return '';
  }
  const month = monthAbbreviationsId[Number(parts[2]) - 1];
  return `${Number(parts[3])} ${month ?? parts[2]} ${parts[1]}`;
};

/**
 * Validate a holiday create payload against the backend rules
 * (ISO date + name up to 150 chars).
 * @param input - Form values.
 * @returns Indonesian error message, or null when valid.
 */
export const holidayInputError = (input: HolidayInput): string | null => {
  if (!isIsoDay(input.holiday_date)) {
    return 'Tanggal libur wajib diisi.';
  }
  const name = input.name.trim();
  if (name === '') {
    return 'Nama hari libur wajib diisi.';
  }
  if (name.length > MAX_HOLIDAY_NAME_LENGTH) {
    return `Nama hari libur maksimal ${MAX_HOLIDAY_NAME_LENGTH} karakter.`;
  }
  return null;
};

/**
 * Sort holidays by date ascending without mutating the server response.
 * @param holidays - Rows from GET /attendance/holidays.
 * @returns New array ordered by `holiday_date`.
 */
export const sortHolidays = (holidays: AttendanceHoliday[]): AttendanceHoliday[] =>
  holidays.toSorted((left, right) => left.holiday_date.localeCompare(right.holiday_date));

export const holidaysOptions = () =>
  queryOptions({
    queryKey: pengaturanQueryKeys.holidays,
    queryFn: async () => {
      const result = await apiGet<{ data: AttendanceHoliday[] }>('/attendance/holidays');
      return sortHolidays(result.data);
    },
  });

/**
 * GET /attendance/holidays → school holiday calendar (every signed-in staff role).
 * @returns React Query result with sorted `AttendanceHoliday[]`.
 */
export const useHolidays = () => useQuery(holidaysOptions());

/**
 * POST /attendance/holidays → add one holiday (admin only; duplicate date = 409).
 * @returns Mutation over `HolidayInput`.
 */
export const useCreateHoliday = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: HolidayInput) =>
      await apiPost<AttendanceHoliday>('/attendance/holidays', input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: pengaturanQueryKeys.holidays });
      await queryClient.invalidateQueries({ queryKey: pengaturanQueryKeys.attendanceSettings });
    },
  });
};

/**
 * DELETE /attendance/holidays/:date → remove one holiday by its ISO date
 * (admin only; 204 on success).
 * @returns Mutation over the holiday date.
 */
export const useDeleteHoliday = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (holidayDate: string) =>
      await apiDelete<null>(`/attendance/holidays/${encodeURIComponent(holidayDate)}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: pengaturanQueryKeys.holidays });
      await queryClient.invalidateQueries({ queryKey: pengaturanQueryKeys.attendanceSettings });
    },
  });
};

// ---------------------------------------------------------------------------
// Academic years & terms — MasterData group (admin + staff_tu).
// Reads reuse the foundation options in queries.ts; the write hooks live here
// because the settings page owns the UI.
// ---------------------------------------------------------------------------
export type AcademicYearInput = {
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

export type TermInput = {
  term_number: number;
  name: string;
  start_date: string;
  end_date: string;
};

/**
 * Validate an academic-year create/update payload (name ≤30, strict start<end).
 * @param input - Form values.
 * @returns Indonesian error message, or null when valid.
 */
export const academicYearInputError = (input: AcademicYearInput): string | null => {
  const name = input.name.trim();
  if (name === '') {
    return 'Nama tahun ajaran wajib diisi.';
  }
  if (name.length > MAX_ACADEMIC_YEAR_NAME_LENGTH) {
    return `Nama tahun ajaran maksimal ${MAX_ACADEMIC_YEAR_NAME_LENGTH} karakter.`;
  }
  if (!isIsoDay(input.start_date) || !isIsoDay(input.end_date)) {
    return 'Tanggal mulai dan selesai tahun ajaran wajib diisi.';
  }
  if (input.end_date <= input.start_date) {
    return 'Tanggal selesai harus setelah tanggal mulai.';
  }
  return null;
};

/**
 * Validate a term create/update payload and, when a parent year is given,
 * that the term window stays inside that year (backend rejects both cases).
 * @param input - Form values.
 * @param year - Parent academic year (optional).
 * @returns Indonesian error message, or null when valid.
 */
export const termInputError = (input: TermInput, year?: AcademicYear): string | null => {
  const name = input.name.trim();
  if (name === '') {
    return 'Nama semester wajib diisi.';
  }
  if (name.length > MAX_TERM_NAME_LENGTH) {
    return `Nama semester maksimal ${MAX_TERM_NAME_LENGTH} karakter.`;
  }
  if (
    !Number.isInteger(input.term_number) ||
    input.term_number < TERM_NUMBER_RANGE.min ||
    input.term_number > TERM_NUMBER_RANGE.max
  ) {
    return 'Nomor semester harus antara 1 dan 4.';
  }
  if (!isIsoDay(input.start_date) || !isIsoDay(input.end_date)) {
    return 'Tanggal mulai dan selesai semester wajib diisi.';
  }
  if (input.end_date <= input.start_date) {
    return 'Tanggal selesai harus setelah tanggal mulai.';
  }
  if (
    year !== undefined &&
    (input.start_date < year.start_date || input.end_date > year.end_date)
  ) {
    return 'Rentang semester harus berada di dalam rentang tahun ajaran.';
  }
  return null;
};

export const academicYearDetailOptions = (id: string) =>
  queryOptions({
    queryKey: pengaturanQueryKeys.academicYear(id),
    queryFn: async () => {
      const result = await apiGet<{ academic_year: AcademicYear }>(`/academic-years/${id}`);
      return result.academic_year;
    },
    enabled: id !== '',
  });

/**
 * GET /academic-years → every academic year (admin + staff_tu).
 * @returns React Query result with `AcademicYear[]`.
 */
export const useAcademicYears = () => useQuery(academicYearsOptions());

/**
 * GET /academic-years/:id → one academic year, used by the editor to load the
 * freshest row before a PUT.
 * @param id - Academic year id (hook stays disabled when empty).
 * @returns React Query result with `AcademicYear`.
 */
export const useAcademicYear = (id: string) => useQuery(academicYearDetailOptions(id));

/**
 * GET /academic-years/:id/terms → terms of one academic year.
 * @param academicYearId - Parent academic year id.
 * @returns React Query result with `Term[]`.
 */
export const useTerms = (academicYearId: string) => useQuery(termsOptions(academicYearId));

/**
 * POST /academic-years → create one academic year (admin + staff_tu; an active
 * year deactivates the previous one server-side).
 * @returns Mutation over `AcademicYearInput`.
 */
export const useCreateAcademicYear = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AcademicYearInput) =>
      await apiPost<{ academic_year: AcademicYear }>('/academic-years', input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.academicYears });
    },
  });
};

/**
 * PUT /academic-years/:id → replace one academic year (also the activation
 * path: `is_active: true` deactivates every other year).
 * @returns Mutation over `{ id } & AcademicYearInput`.
 */
export const useUpdateAcademicYear = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: { id: string } & AcademicYearInput) => {
      const { id, ...input } = variables;
      return await apiPut<{ academic_year: AcademicYear }>(`/academic-years/${id}`, input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['academic-years'] });
    },
  });
};

/**
 * POST /academic-years/:id/terms → add one term to a year.
 * @param academicYearId - Parent academic year id.
 * @returns Mutation over `TermInput`.
 */
export const useCreateTerm = (academicYearId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TermInput) =>
      await apiPost<{ term: Term }>(`/academic-years/${academicYearId}/terms`, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.terms(academicYearId) });
    },
  });
};

/**
 * PUT /terms/:id → update one term (dates/name/number; full payload required).
 * @param academicYearId - Parent id, used to refresh the term list.
 * @returns Mutation over `{ id } & TermInput`.
 */
export const useUpdateTerm = (academicYearId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: { id: string } & TermInput) => {
      const { id, ...input } = variables;
      return await apiPut<{ term: Term }>(`/terms/${id}`, input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.terms(academicYearId) });
    },
  });
};

// ---------------------------------------------------------------------------
// Time helpers
// ---------------------------------------------------------------------------
const WORKDAY_WEEKDAYS = [1, 2, 3, 4, 5];

/**
 * Convert 'HH:mm' to minutes since midnight.
 * @param value - Raw time string.
 * @returns Minutes since midnight (0 for unparseable input).
 */
const toMinutes = (value: string): number => {
  const [, hours = '0', minutes = '0'] = /^(\d{1,2}):(\d{2})/u.exec(value) ?? [];

  return Number(hours) * 60 + Number(minutes);
};

/**
 * Convert minutes since midnight to 'HH:mm'.
 * @param minutes - Minutes since midnight.
 * @returns Zero-padded 'HH:mm' string (wraps over 24h).
 */
const toHHMM = (minutes: number): string => {
  const wrapped = ((minutes % 1440) + 1440) % 1440;
  const hh = Math.floor(wrapped / 60);
  const mm = wrapped % 60;

  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
};

// ---------------------------------------------------------------------------
// DTO ↔ UI mappers
// ---------------------------------------------------------------------------
/**
 * ISO weekdays present in the schedule rows, sorted ascending.
 * @param schedules - Server schedule rows.
 * @returns Unique weekday numbers (1 = Monday … 7 = Sunday).
 */
export const operationalDaysFromSchedules = (schedules: { weekday: number }[]): number[] =>
  [...new Set(schedules.map((schedule) => schedule.weekday))].toSorted((a, b) => a - b);

/**
 * Toggle one operational weekday, keeping at least one day selected.
 * @param days - Current operational weekdays.
 * @param weekday - Weekday to toggle (1 = Monday … 7 = Sunday).
 * @returns New sorted weekday list (unchanged when removing the last day).
 */
export const toggleOperationalDay = (days: number[], weekday: number): number[] => {
  const active = new Set(days);

  if (active.has(weekday)) {
    if (active.size === 1) {
      return [...days].toSorted((a, b) => a - b);
    }
    active.delete(weekday);
  } else {
    active.add(weekday);
  }

  return [...active].toSorted((a, b) => a - b);
};

/**
 * Backend stores one schedule row per weekday plus an auto-close time; the
 * presence panel edits a single global gate window plus which weekdays are
 * operational. Mapping uses the first schedule row: gateOpen=start_time,
 * onTimeUntil=start_time+late_tolerance, gateClose=attendance_auto_close_time.
 * lateToleranceMinutes and dismissal times have no backend fields → kept from
 * the factory defaults.
 * @param settings - Server configuration document.
 * @returns Presence policy for the panel.
 */
export const settingsToPresencePolicy = (settings: AttendanceSettings): PresencePolicy => {
  const [schedule] = settings.schedules;
  const startTime = schedule?.start_time ?? defaultSystemSettings.presence.gateOpen;
  const tolerance = schedule?.late_tolerance_minutes ?? 0;

  return {
    gateOpen: startTime,
    onTimeUntil: toHHMM(toMinutes(startTime) + tolerance),
    lateToleranceMinutes: defaultSystemSettings.presence.lateToleranceMinutes, // shortcut: no backend field, keep mock
    gateClose: settings.attendance_auto_close_time || defaultSystemSettings.presence.gateClose,
    dismissalWeekday: defaultSystemSettings.presence.dismissalWeekday, // shortcut: no backend field, keep mock
    dismissalFriday: defaultSystemSettings.presence.dismissalFriday, // shortcut: no backend field, keep mock
    operationalDays:
      settings.schedules.length > 0
        ? operationalDaysFromSchedules(settings.schedules)
        : [...WORKDAY_WEEKDAYS],
    schoolName: settings.school_name,
    timezone: settings.timezone,
  };
};

/**
 * Inverse of `settingsToPresencePolicy`: writes the edited gate window to one
 * schedule row per operational weekday (Monday–Friday when none are selected),
 * sets attendance_auto_close_time, and preserves school_name, timezone and
 * holidays untouched.
 * @param current - Server configuration document to clone.
 * @param policy - Edited presence policy.
 * @returns Full payload for PUT /attendance/settings.
 */
export const presencePolicyToSettings = (
  current: AttendanceSettings,
  policy: PresencePolicy,
): AttendanceSettings => {
  const tolerance = Math.max(0, toMinutes(policy.onTimeUntil) - toMinutes(policy.gateOpen));
  const operationalDays =
    policy.operationalDays.length > 0
      ? operationalDaysFromSchedules(policy.operationalDays.map((weekday) => ({ weekday })))
      : WORKDAY_WEEKDAYS;
  const schedules: AttendanceSchedule[] = operationalDays.map((weekday) => ({
    weekday,
    start_time: policy.gateOpen,
    late_tolerance_minutes: tolerance,
  }));

  return {
    ...current,
    school_name: policy.schoolName ?? current.school_name,
    timezone: policy.timezone ?? current.timezone,
    attendance_auto_close_time: policy.gateClose,
    schedules,
  };
};

/**
 * Mapper: backend sanction rule → editable table draft.
 * `level`/`description` arrive nullable and are edited as plain strings
 * ('' = none). `description` is not shown in the table but round-trips so a
 * replace-all never wipes notes written from other surfaces.
 *
 * @param rules - Rows returned by GET /sanction-rules.
 * @returns Draft rows for the sanctions table.
 */
export const sanctionRulesToDrafts = (rules: SanctionRuleDto[]): SanctionRuleDraft[] =>
  rules.map((rule) => ({
    key: rule.id,
    id: rule.id,
    name: rule.name,
    min_points: rule.min_points,
    max_points: rule.max_points,
    action: rule.action,
    level: rule.level ?? '',
    description: rule.description ?? '',
    is_active: rule.is_active,
  }));

/**
 * Mapper: draft rows → PUT /sanction-rules replace-all payload.
 * `max_points: null` keeps the range open-ended upward; empty `level`/
 * `description` strings are omitted so the backend stores NULL.
 *
 * @param drafts - Current table rows.
 * @returns Rules array for the collection PUT.
 */
export const sanctionDraftsToRules = (drafts: SanctionRuleDraft[]): SanctionRuleInputDto[] =>
  drafts.map((draft) => ({
    name: draft.name,
    min_points: draft.min_points,
    max_points: draft.max_points,
    action: draft.action,
    level: draft.level === '' ? undefined : draft.level,
    description: draft.description === '' ? undefined : draft.description,
    is_active: draft.is_active,
  }));

/**
 * Mapper: GET /geofence config → panel policy. The anti-spoofing flags
 * (`detectFakeGps`, `requireSelfieLiveness`) have no backend fields, so
 * they are preserved from the given fallback policy.
 *
 * @param config - Server geofence configuration.
 * @param fallback - Local policy supplying the mock-only flags.
 * @returns Geofence policy for the panel.
 */
export const geofenceToPolicy = (
  config: GeofenceDto,
  fallback: GeofencePolicy,
): GeofencePolicy => ({
  radiusMeters: config.radius_meters,
  centerLat: config.latitude,
  centerLng: config.longitude,
  detectFakeGps: fallback.detectFakeGps, // shortcut: no backend field, keep mock
  requireSelfieLiveness: fallback.requireSelfieLiveness, // shortcut: no backend field, keep mock
});

/**
 * Mapper: edited geofence policy (+ enabled flag, which `GeofencePolicy`
 * does not carry) → PUT /geofence full-replace body. Radius is rounded to
 * whole meters per the backend `radius_meters` int32 field.
 *
 * @param policy - Policy values from the panel editor.
 * @param isEnabled - Current `is_enabled` server flag (or local toggle).
 * @returns Complete geofence body (backend rejects partial payloads).
 */
export const geofencePolicyToPayload = (
  policy: GeofencePolicy,
  isEnabled: boolean,
): GeofenceDto => ({
  latitude: policy.centerLat,
  longitude: policy.centerLng,
  radius_meters: Math.round(policy.radiusMeters),
  is_enabled: isEnabled,
});
