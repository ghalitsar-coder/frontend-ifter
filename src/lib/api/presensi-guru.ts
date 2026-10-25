import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockTeacherAttendance } from '@/data/mockTeacherPresence';
import { apiGet, apiPost } from '@/lib/api/client';
import type { TeacherAttendance, TeacherHistoryRow } from '@/types/teacherPresence';

// ---------------------------------------------------------------------------
// Backend DTOs — exact snake_case shapes from internal/teacherpresence/types.go
// (GET /teacher-presence/today, GET /teacher-presence/history,
// POST /teacher-presence/check-in, POST /teacher-presence/check-out,
// GET /geofence). Declared here because the shared `src/lib/api/dto.ts` is
// frozen for this wave.
// ---------------------------------------------------------------------------

/** GET /teacher-presence/today response (`TodayResult`). Null = belum check-in. */
export type TeacherPresenceTodayDto = {
  teacher_id: string;
  presence_date: string;
  check_in_at: string | null;
  check_out_at: string | null;
  within_geofence: boolean | null;
  distance_meters: number | null;
};

/** POST /teacher-presence/check-in response (`CheckInResult`). */
export type TeacherCheckInResultDto = {
  id: string;
  teacher_id: string;
  presence_date: string;
  check_in_at: string;
  within_geofence: boolean;
  distance_meters: number;
  message: string;
};

/** POST /teacher-presence/check-out response (`CheckOutResult`). */
export type TeacherCheckOutResultDto = {
  id: string;
  teacher_id: string;
  presence_date: string;
  check_in_at: string;
  check_out_at: string;
  duration_minutes: number;
  check_out_within_geofence: boolean;
  check_out_distance_meters: number;
  message: string;
};

/** One row of GET /teacher-presence/history (`HistoryEntry`). */
export type TeacherPresenceHistoryEntryDto = {
  id: string;
  teacher_id: string;
  presence_date: string;
  check_in_at: string;
  check_out_at: string | null;
  duration_minutes: number;
  within_geofence: boolean;
  distance_meters: number;
};

/** Paginated envelope of GET /teacher-presence/history (`HistoryResult`). */
export type TeacherPresenceHistoryDto = {
  data: TeacherPresenceHistoryEntryDto[];
  total: number;
  limit: number;
  offset: number;
};

/** GET /geofence response (`GeofenceConfig`) — school radius lives here. */
export type GeofenceConfigDto = {
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_enabled: boolean;
};

/** Client GPS fix sent with check-in/check-out. */
export type DevicePosition = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

// ---------------------------------------------------------------------------
// Pure helpers / mappers
// ---------------------------------------------------------------------------

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTH_NAMES = [
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
];

/**
 * 'HH:MM' label for an RFC3339 timestamp in the browser timezone.
 * @param iso - RFC3339 timestamp; nullish/invalid input yields null.
 * @returns Zero-padded 24h time string.
 */
export const timeLabelId = (iso: string | null | undefined): string | null => {
  if (iso === null || iso === undefined || iso === '') {
    return null;
  }
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  const hours = parsed.getHours().toString().padStart(2, '0');
  const minutes = parsed.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Local calendar date as 'YYYY-MM-DD'.
 * @param date - Date to format (defaults to now).
 * @returns ISO date string in the browser timezone.
 */
export const isoDate = (date: Date = new Date()): string => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

/**
 * 'YYYY-MM-DD' N days before a reference ISO date (pure string arithmetic via Date).
 * @param fromIso - Reference 'YYYY-MM-DD'.
 * @param days - Days to subtract.
 * @returns Shifted 'YYYY-MM-DD'.
 */
export const isoDateMinusDays = (fromIso: string, days: number): string => {
  const base = new Date(`${fromIso}T00:00:00`);
  base.setDate(base.getDate() - days);
  return isoDate(base);
};

/**
 * Indonesian short date for a presence_date, e.g. '5 Okt 2026'.
 * @param dateIso - 'YYYY-MM-DD'.
 * @returns Human day-month-year label.
 */
export const formatShortDateId = (dateIso: string): string => {
  const parts = /^(\d{4})-(\d{2})-(\d{2})/u.exec(dateIso);
  if (parts === null) {
    return dateIso;
  }
  const day = Number(parts[3]);
  const monthIndex = Number(parts[2]) - 1;
  return `${day} ${MONTH_NAMES[monthIndex] ?? parts[2]} ${parts[1]}`;
};

/**
 * Indonesian weekday name for a 'YYYY-MM-DD' date.
 * @param dateIso - Presence date.
 * @returns Day name (Senin..Minggu).
 */
export const dayNameId = (dateIso: string): string => {
  const parsed = new Date(`${dateIso}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return dateIso;
  }
  return DAY_NAMES[parsed.getDay()] ?? dateIso;
};

/**
 * Duration in 'JP' (jam pelajaran, 40 minutes each, rounded down).
 * @param minutes - Server-computed duration_minutes (float).
 * @returns Label like '8 JP'; '0 JP' for missing durations.
 */
export const durationToJp = (minutes: number): string =>
  `${Math.floor(Math.max(0, minutes) / 40)} JP`;

/**
 * Map GET /teacher-presence/today into the UI `TeacherAttendance` shape.
 * Doc comment: backend exposes no biometric/gate-name/late-window data, so
 * those keep the mock defaults (shortcut: fields missing in backend wave2).
 * @param today - Today payload, or null while loading / never checked in.
 * @param lateLimit - 'HH:MM' on-time cutoff (mock default '07:15').
 * @param checkoutWindow - 'HH:MM' display-only checkout window.
 * @returns UI attendance state for header/card/receipt.
 */
export const mapTodayToAttendance = (
  today: TeacherPresenceTodayDto | null,
  lateLimit: string = mockTeacherAttendance.lateLimit,
  checkoutWindow: string = mockTeacherAttendance.checkoutWindow,
): TeacherAttendance => {
  const checkInLabel = timeLabelId(today?.check_in_at);
  const isCheckedIn = (today?.check_in_at ?? null) !== null;
  let status: TeacherAttendance['status'] = 'belum';
  if (isCheckedIn) {
    status = checkInLabel !== null && checkInLabel > lateLimit ? 'terlambat' : 'tepat_waktu';
  }
  return {
    isCheckedIn,
    isCheckedOut: (today?.check_out_at ?? null) !== null,
    status,
    checkInTime: checkInLabel ?? mockTeacherAttendance.checkInTime,
    lateLimit,
    checkoutWindow,
    distanceMeters:
      today?.distance_meters === null || today?.distance_meters === undefined
        ? mockTeacherAttendance.distanceMeters
        : Math.round(today.distance_meters),
    gateName: mockTeacherAttendance.gateName,
    biometricMatch: mockTeacherAttendance.biometricMatch,
  };
};

/**
 * Map one history row into the UI `TeacherHistoryRow` shape.
 * @param entry - History entry from GET /teacher-presence/history.
 * @param todayIso - 'YYYY-MM-DD' reference to flag the 'Hari ini' row.
 * @returns UI row for the weekly table.
 */
export const mapHistoryRow = (
  entry: TeacherPresenceHistoryEntryDto,
  todayIso: string,
): TeacherHistoryRow => ({
  id: entry.id,
  day: dayNameId(entry.presence_date),
  date: formatShortDateId(entry.presence_date),
  isToday: entry.presence_date === todayIso,
  checkIn: timeLabelId(entry.check_in_at) ?? '---:--',
  checkOut: timeLabelId(entry.check_out_at) ?? '---:---',
  method: entry.within_geofence
    ? `GPS + Wajah (${mockTeacherAttendance.gateName})`
    : 'Dinas Luar (di luar radius)',
  hours: durationToJp(entry.duration_minutes),
  status: entry.within_geofence ? 'tepat_waktu' : 'dinas_luar',
});

/**
 * Build the check-in/check-out JSON body from a GPS fix (server computes the
 * geofence verdict — the client never sends one).
 * @param position - Raw device coordinates + accuracy.
 * @returns snake_case request payload.
 */
export const toCheckPayload = (
  position: DevicePosition,
): { latitude: number; longitude: number; accuracy: number } => ({
  latitude: position.latitude,
  longitude: position.longitude,
  accuracy: position.accuracy,
});

/**
 * Friendly Indonesian message for a GeolocationPositionError code.
 * @param code - 1 = permission denied, 2 = unavailable, 3 = timeout.
 * @returns Toast text.
 */
export const geolocationErrorMessage = (code: number): string => {
  switch (code) {
    case 1: {
      return 'Izin lokasi ditolak. Aktifkan akses lokasi di browser lalu coba lagi.';
    }
    case 2: {
      return 'Sinyal lokasi tidak tersedia. Pastikan GPS aktif dan coba lagi.';
    }
    default: {
      return 'Waktu pengukuran lokasi habis. Coba lakukan check-in lagi.';
    }
  }
};

// Callback-only Web API: the executor settles the promise directly, so an
// async wrapper would add nothing and there is no promise factory to use.
/* oxlint-disable typescript/promise-function-async promise/avoid-new -- Promise constructor is the canonical callback-to-promise bridge */
const readPositionOnce = (geolocation: Geolocation): Promise<DevicePosition> =>
  new Promise((resolve, reject) => {
    geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy ?? 0,
        });
      },
      (error) => {
        reject(new Error(geolocationErrorMessage(error.code)));
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 },
    );
  });
/* oxlint-enable typescript/promise-function-async promise/avoid-new */

/**
 * One-shot `navigator.geolocation.getCurrentPosition` promise.
 * @returns Resolved device position with accuracy.
 * @throws {Error} When the browser lacks geolocation, permission is denied,
 *   the signal is unavailable, or the fix times out.
 */
export const getCurrentDevicePosition = async (): Promise<DevicePosition> => {
  const geolocation = globalThis.navigator?.geolocation;
  if (geolocation === undefined) {
    throw new Error('Perangkat ini tidak mendukung pengukuran lokasi (GPS).');
  }
  return await readPositionOnce(geolocation);
};

/**
 * Server check-in result → Indonesian toast text with distance + verdict.
 * @param result - POST /teacher-presence/check-in payload.
 * @param radiusMeters - School geofence radius from GET /geofence.
 * @returns Toast message.
 */
export const checkInToast = (result: TeacherCheckInResultDto, radiusMeters: number): string =>
  result.within_geofence
    ? `Check-in ${timeLabelId(result.check_in_at) ?? '-'} berhasil — ${Math.round(result.distance_meters)} m dari sekolah (radius ${radiusMeters} m).`
    : `Check-in tercatat di luar radius: ${Math.round(result.distance_meters)} m (radius ${radiusMeters} m).`;

/**
 * Server check-out result → Indonesian toast text with duration + verdict.
 * @param result - POST /teacher-presence/check-out payload.
 * @param radiusMeters - School geofence radius from GET /geofence.
 * @returns Toast message.
 */
export const checkOutToast = (result: TeacherCheckOutResultDto, radiusMeters: number): string =>
  result.check_out_within_geofence
    ? `Check-out ${timeLabelId(result.check_out_at) ?? '-'} berhasil — durasi ${Math.round(result.duration_minutes)} menit, ${Math.round(result.check_out_distance_meters)} m (radius ${radiusMeters} m).`
    : `Check-out ${timeLabelId(result.check_out_at) ?? '-'} tercatat di luar radius: ${Math.round(result.check_out_distance_meters)} m (radius ${radiusMeters} m).`;

/**
 * Verdict for the 'verified location' tile when the teacher taps it without a
 * new check-in: compares the stored check-in distance to the radius.
 * @param today - Today payload (or null).
 * @param radiusMeters - School radius from GET /geofence.
 * @returns Feedback describing the outcome for the manager to render.
 */
export const verifyLocationFeedback = (
  today: TeacherPresenceTodayDto | null,
  radiusMeters: number,
): { kind: 'inside' | 'outside' | 'idle'; message: string } => {
  if (today?.distance_meters === null || today?.distance_meters === undefined) {
    return {
      kind: 'idle',
      message: 'Lakukan check-in untuk memverifikasi lokasi Anda terhadap radius sekolah.',
    };
  }
  const distance = Math.round(today.distance_meters);
  return today.within_geofence === true
    ? {
        kind: 'inside',
        message: `Lokasi terverifikasi — ${distance} m dari sekolah (radius ${radiusMeters} m).`,
      }
    : {
        kind: 'outside',
        message: `Posisi check-in Anda ${distance} m dari sekolah — di luar radius ${radiusMeters} m.`,
      };
};

// ---------------------------------------------------------------------------
// Query keys + options + hooks
// ---------------------------------------------------------------------------
export const presensiGuruKeys = {
  all: ['teacher-presence'] as const,
  today: () => ['teacher-presence', 'today'] as const,
  history: (query: TeacherPresenceHistoryParams) => ['teacher-presence', 'history', query] as const,
  geofence: () => ['teacher-presence', 'geofence'] as const,
};

export type TeacherPresenceHistoryParams = {
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

export const teacherPresenceTodayOptions = () =>
  queryOptions({
    queryKey: presensiGuruKeys.today(),
    queryFn: async () => await apiGet<TeacherPresenceTodayDto>('/teacher-presence/today'),
  });

/**
 * GET /teacher-presence/today → own presence record for the school day.
 * @returns React Query result with `TeacherPresenceTodayDto`.
 */
export const useTeacherPresenceToday = () => useQuery(teacherPresenceTodayOptions());

export const teacherPresenceHistoryOptions = (params: TeacherPresenceHistoryParams) =>
  queryOptions({
    queryKey: presensiGuruKeys.history(params),
    queryFn: async () =>
      await apiGet<TeacherPresenceHistoryDto>('/teacher-presence/history', { ...params }),
  });

/**
 * GET /teacher-presence/history → own presence history with date filters.
 * @param params - Optional `from`, `to` (YYYY-MM-DD), `limit` (1..100), `offset`.
 * @returns React Query result with the paginated history envelope.
 */
export const useTeacherPresenceHistory = (params: TeacherPresenceHistoryParams) =>
  useQuery(teacherPresenceHistoryOptions(params));

export const geofenceOptions = () =>
  queryOptions({
    queryKey: presensiGuruKeys.geofence(),
    queryFn: async () => await apiGet<GeofenceConfigDto>('/geofence'),
  });

/**
 * GET /geofence → school coordinates + radius (readable by AttendanceRead roles).
 * @returns React Query result with `GeofenceConfigDto`.
 */
export const useTeacherGeofence = () => useQuery(geofenceOptions());

/**
 * POST /teacher-presence/check-in → record own arrival from a GPS fix.
 * Server computes distance + geofence verdict; refreshes today/history caches.
 * @returns Mutation over `DevicePosition`.
 */
export const useTeacherCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (position: DevicePosition): Promise<TeacherCheckInResultDto> =>
      await apiPost<TeacherCheckInResultDto>(
        '/teacher-presence/check-in',
        toCheckPayload(position),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: presensiGuruKeys.all });
    },
  });
};

/**
 * POST /teacher-presence/check-out → record own departure from a GPS fix.
 * @returns Mutation over `DevicePosition`.
 */
export const useTeacherCheckOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (position: DevicePosition): Promise<TeacherCheckOutResultDto> =>
      await apiPost<TeacherCheckOutResultDto>(
        '/teacher-presence/check-out',
        toCheckPayload(position),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: presensiGuruKeys.all });
    },
  });
};
