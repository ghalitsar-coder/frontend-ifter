import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { defaultSystemSettings } from '@/data/mockSettings';
import { apiGet, apiPut } from '@/lib/api/client';
import type { AttendanceSchedule, AttendanceSettings } from '@/lib/api/dto';
import type { GeofencePolicy, PresencePolicy } from '@/types/settings';

// ---------------------------------------------------------------------------
// Query keys (module-local, extends the foundation `queryKeys` convention)
// ---------------------------------------------------------------------------
export const pengaturanQueryKeys = {
  attendanceSettings: ['attendance', 'settings'] as const,
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
 * Backend stores one schedule row per weekday plus an auto-close time; the
 * presence panel edits a single global gate window. Mapping uses the first
 * schedule row: gateOpen=start_time, onTimeUntil=start_time+late_tolerance,
 * gateClose=attendance_auto_close_time. lateToleranceMinutes and dismissal
 * times have no backend fields → kept from the factory defaults.
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
  };
};

/**
 * Inverse of `settingsToPresencePolicy`: writes the edited gate window back to
 * every weekday schedule row (or creates Monday–Friday rows when none exist),
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
  const schedules: AttendanceSchedule[] =
    current.schedules.length > 0
      ? current.schedules.map((schedule) => ({
          ...schedule,
          start_time: policy.gateOpen,
          late_tolerance_minutes: tolerance,
        }))
      : WORKDAY_WEEKDAYS.map((weekday) => ({
          weekday,
          start_time: policy.gateOpen,
          late_tolerance_minutes: tolerance,
        }));

  return {
    ...current,
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
