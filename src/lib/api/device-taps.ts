import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/client';
import type { QueryParams } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/dto';
import type { GateFilterOptions, RfidTapLog, TapStatus } from '@/types/piket';

/** One RFID tap reported by a gate device via POST /device-taps. */
export type DeviceTap = {
  id: string;
  device_id: string;
  device_name: string;
  device_identifier: string;
  student_id: string | null;
  student_number: string | null;
  student_name: string | null;
  card_uid: string;
  occurred_at: string;
  created_at: string;
};

/** GET /device-taps filters. */
export type DeviceTapFilter = {
  deviceId?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

/** School-time rules used to classify a tap. */
export type TapPolicy = {
  timezone: string;
  onTimeUntil: string;
};

export const deviceTapKeys = {
  root: ['piket'] as const,
  list: (filter?: DeviceTapFilter) => ['piket', 'device-taps', filter ?? {}] as const,
};

const REFETCH_INTERVAL_MS = 10_000;

/**
 * Builds the GET /device-taps query string.
 * @param filter - Device, date and paging filters.
 * @returns Query params containing only the active filters.
 */
export const buildDeviceTapQuery = (filter?: DeviceTapFilter): QueryParams => ({
  ...(filter?.deviceId === undefined ? {} : { device_id: filter.deviceId }),
  ...(filter?.from === undefined ? {} : { from: filter.from }),
  ...(filter?.to === undefined ? {} : { to: filter.to }),
  ...(filter?.limit === undefined ? {} : { limit: filter.limit }),
  ...(filter?.offset === undefined ? {} : { offset: filter.offset }),
});

const zoneParts = (timestamp: string, timeZone: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', { ...options, timeZone }).formatToParts(new Date(timestamp));

const pad2 = (value: number): string => String(value).padStart(2, '0');

/**
 * Whether a name is usable as an Intl timezone (backend settings are not validated).
 * @param timeZone - Candidate IANA timezone name.
 * @returns True when `Intl.DateTimeFormat` accepts it.
 */
export const isValidTimeZone = (timeZone: string): boolean => {
  try {
    const probe = new Intl.DateTimeFormat('en-US', { timeZone });
    probe.format(new Date(0));
    return true;
  } catch {
    return false;
  }
};

/**
 * Calendar date (`YYYY-MM-DD`) of an instant in the school timezone.
 * @param timestamp - ISO instant from the backend.
 * @param timeZone - IANA timezone, e.g. `Asia/Jakarta`.
 * @returns Local date string.
 */
export const localDateInZone = (timestamp: string, timeZone: string): string => {
  const parts = zoneParts(timestamp, timeZone, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const valueOf = (type: 'year' | 'month' | 'day') =>
    parts.find((part) => part.type === type)?.value ?? '';
  return `${valueOf('year')}-${valueOf('month')}-${valueOf('day')}`;
};

/**
 * Minutes since local midnight of an instant in the school timezone.
 * @param timestamp - ISO instant from the backend.
 * @param timeZone - IANA timezone, e.g. `Asia/Jakarta`.
 * @returns 0..1439.
 */
export const localMinutesInZone = (timestamp: string, timeZone: string): number => {
  const parts = zoneParts(timestamp, timeZone, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');
  return (hour % 24) * 60 + minute;
};

/**
 * Formatted local clock time (`HH:mm`) of an instant in the school timezone.
 * @param timestamp - ISO instant from the backend.
 * @param timeZone - IANA timezone, e.g. `Asia/Jakarta`.
 * @returns Clock time string.
 */
export const localClockInZone = (timestamp: string, timeZone: string): string => {
  const minutes = localMinutesInZone(timestamp, timeZone);
  return `${pad2(Math.floor(minutes / 60))}:${pad2(minutes % 60)}`;
};

const policyMinutes = (onTimeUntil: string): number => {
  const [hour = '0', minute = '0'] = onTimeUntil.split(':');
  const minutes = Number(hour) * 60 + Number(minute);
  // Malformed cutoff must not flag every tap as late; treat it as no cutoff.
  return Number.isFinite(minutes) ? minutes : 1440;
};

/**
 * Classifies a tap against the school gate policy.
 * @param tap - Device tap record.
 * @param policy - School timezone and on-time cutoff.
 * @returns `unknown_card` when no student is linked, else `on_time`/`late`.
 */
export const deriveTapStatus = (tap: DeviceTap, policy: TapPolicy): TapStatus => {
  if (tap.student_id === null) {
    return 'unknown_card';
  }
  const minutes = localMinutesInZone(tap.occurred_at, policy.timezone);
  return minutes <= policyMinutes(policy.onTimeUntil) ? 'on_time' : 'late';
};

/**
 * Converts a device tap into the piket stream row shape.
 * @param tap - Device tap record.
 * @param policy - School timezone and on-time cutoff.
 * @returns Stream log with derived status, delay and penalty.
 */
export const mapTapToRfidLog = (tap: DeviceTap, policy: TapPolicy): RfidTapLog => {
  const status = deriveTapStatus(tap, policy);
  const minutes = localMinutesInZone(tap.occurred_at, policy.timezone);
  const delayMinutes = status === 'late' ? minutes - policyMinutes(policy.onTimeUntil) : 0;
  // shortcut: backend has no penalty table yet; 1 point per started 5 minutes late.
  const pointPenalty = status === 'late' ? Math.ceil(delayMinutes / 5) : 0;

  return {
    id: tap.id,
    nis: tap.student_number ?? '',
    studentName: tap.student_name ?? 'Kartu tidak dikenal',
    className: '',
    photoUrl: undefined,
    tapTime: localClockInZone(tap.occurred_at, policy.timezone),
    status,
    readerId: tap.device_id,
    readerName: tap.device_name,
    delayMinutes,
    pointPenalty,
    isUniformComplete: true,
    origin: 'device',
    cardUid: tap.card_uid,
  };
};

/**
 * Drops repeat taps of the same student (or same unknown card).
 * @param taps - Taps ordered newest first.
 * @returns Deduplicated taps, newest kept.
 */
export const dedupeTaps = (taps: DeviceTap[]): DeviceTap[] => {
  const seen = new Set<string>();
  const kept: DeviceTap[] = [];
  for (const item of taps) {
    const key = item.student_id ?? `card:${item.card_uid}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    kept.push(item);
  }
  return kept;
};

/**
 * Applies stream search/reader/status filters to mapped logs.
 * @param logs - Stream rows newest first.
 * @param filter - Stream filter options.
 * @returns Matching rows, order preserved.
 */
export const filterTapLogs = (logs: RfidTapLog[], filter: GateFilterOptions): RfidTapLog[] => {
  const keyword = filter.searchKeyword.trim().toLowerCase();
  return logs.filter((item) => {
    if (filter.readerFilter !== 'all' && item.readerId !== filter.readerFilter) {
      return false;
    }
    if (filter.statusFilter !== 'all' && item.status !== filter.statusFilter) {
      return false;
    }
    if (
      keyword !== '' &&
      !item.studentName.toLowerCase().includes(keyword) &&
      !item.nis.toLowerCase().includes(keyword) &&
      !item.className.toLowerCase().includes(keyword) &&
      !(item.cardUid ?? '').toLowerCase().includes(keyword)
    ) {
      return false;
    }
    return true;
  });
};

/**
 * GET /device-taps.
 * @param filter - Device, date and paging filters.
 * @returns Taps ordered newest first.
 */
export const fetchDeviceTaps = async (filter?: DeviceTapFilter): Promise<DeviceTap[]> => {
  const result = await apiGet<Paginated<DeviceTap>>('/device-taps', buildDeviceTapQuery(filter));
  return result.data;
};

/**
 * Poll cadence that pauses while the query is in error state.
 * @param query - Anything exposing the query status.
 * @returns Interval in ms, or false to stop polling.
 */
export const tapPollInterval = (query: { state: { status: string } }): number | false =>
  query.state.status === 'error' ? false : REFETCH_INTERVAL_MS;

export const deviceTapsOptions = (filter?: DeviceTapFilter) =>
  queryOptions({
    queryKey: deviceTapKeys.list(filter),
    queryFn: async () => await fetchDeviceTaps(filter),
    // Stop the 10 s poll while errored (e.g. 403 after a role change) so the
    // browser does not hammer the endpoint; recovers on the next success.
    refetchInterval: tapPollInterval,
    placeholderData: keepPreviousData,
  });

/**
 * GET /device-taps → polled tap stream.
 * @param filter - Device, date and paging filters.
 * @param enabled - Skip polling when the role may not read taps.
 * @returns React Query result with `DeviceTap[]`.
 */
export const useDeviceTaps = (filter?: DeviceTapFilter, enabled = true) =>
  useQuery({ ...deviceTapsOptions(filter), enabled });
