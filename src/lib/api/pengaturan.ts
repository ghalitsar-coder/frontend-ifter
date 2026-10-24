import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { defaultSystemSettings } from '@/data/mockSettings';
import { apiGet, apiPut } from '@/lib/api/client';
import type { AttendanceSchedule, AttendanceSettings } from '@/lib/api/dto';
import type { PresencePolicy } from '@/types/settings';

// ---------------------------------------------------------------------------
// Query keys (module-local, extends the foundation `queryKeys` convention)
// ---------------------------------------------------------------------------
export const pengaturanQueryKeys = {
  attendanceSettings: ['attendance', 'settings'] as const,
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
