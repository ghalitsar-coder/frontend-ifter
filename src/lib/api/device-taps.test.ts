import { afterEach, describe, expect, it, vi } from 'vitest';
import { setAccessToken } from '@/lib/api/client';
import {
  buildDeviceTapQuery,
  dedupeTaps,
  deriveTapStatus,
  deviceTapsOptions,
  fetchDeviceTaps,
  filterTapLogs,
  isValidTimeZone,
  localDateInZone,
  localMinutesInZone,
  mapTapToRfidLog,
  tapPollInterval,
} from '@/lib/api/device-taps';
import type { DeviceTap, TapPolicy } from '@/lib/api/device-taps';

const policy: TapPolicy = { timezone: 'Asia/Jakarta', onTimeUntil: '07:00' };

// Baseline tap occurs at 07:05 WIB on 2026-10-26.
const tap = (overrides?: Partial<DeviceTap>): DeviceTap => ({
  id: 'tap-1',
  device_id: 'dev-1',
  device_name: 'Reader Gerbang Utama',
  device_identifier: 'RFID-GATE-01',
  student_id: 'stu-1',
  student_number: '2024001',
  student_name: 'Andi Pratama',
  card_uid: 'A1B2C3',
  occurred_at: '2026-10-26T00:05:00Z',
  created_at: '2026-10-26T00:05:01Z',
  ...overrides,
});

const filterFixtureLogs = [
  mapTapToRfidLog(tap(), policy),
  mapTapToRfidLog(
    tap({ id: 'tap-2', occurred_at: '2026-10-26T00:00:00Z', student_name: 'Citra Dewi' }),
    policy,
  ),
  mapTapToRfidLog(
    tap({
      id: 'tap-3',
      device_id: 'dev-2',
      device_name: 'Reader Gerbang Belakang',
      student_id: null,
      student_number: null,
      student_name: null,
    }),
    policy,
  ),
];

const jsonResponse = (status: number, body: unknown) =>
  Response.json(body, {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const fetchMock = vi.fn<typeof globalThis.fetch>();

describe('query builder', () => {
  it('emits only the provided filters', () => {
    expect(buildDeviceTapQuery()).toStrictEqual({});
    expect(buildDeviceTapQuery({ from: '2026-10-26', to: '2026-10-26', limit: 200 })).toStrictEqual(
      { from: '2026-10-26', to: '2026-10-26', limit: 200 },
    );
    expect(buildDeviceTapQuery({ deviceId: 'dev-1' })).toStrictEqual({ device_id: 'dev-1' });
  });
});

describe('school-timezone conversion', () => {
  it('converts an instant to the calendar date in the school zone', () => {
    expect(localDateInZone('2026-10-25T18:30:00Z', 'Asia/Jakarta')).toBe('2026-10-26');
    expect(localDateInZone('2026-10-26T00:00:00Z', 'Asia/Jakarta')).toBe('2026-10-26');
  });

  it('converts an instant to minutes since local midnight', () => {
    expect(localMinutesInZone('2026-10-25T23:59:00Z', 'Asia/Jakarta')).toBe(6 * 60 + 59);
    expect(localMinutesInZone('2026-10-26T00:00:00Z', 'Asia/Jakarta')).toBe(7 * 60);
  });

  it('rolls midnight to 0 minutes, not 24 hours', () => {
    expect(localMinutesInZone('2026-10-25T17:00:00Z', 'Asia/Jakarta')).toBe(0);
  });

  it('validates timezone names before Intl uses them', () => {
    expect(isValidTimeZone('Asia/Jakarta')).toBeTruthy();
    expect(isValidTimeZone('Bukan/Zona')).toBeFalsy();
    expect(isValidTimeZone('')).toBeFalsy();
  });
});

describe('tap status derivation', () => {
  it('marks a tap exactly at the threshold as on time', () => {
    const atThreshold = tap({ occurred_at: '2026-10-26T00:00:00Z' });
    expect(deriveTapStatus(atThreshold, policy)).toBe('on_time');
  });

  it('marks a tap one minute past the threshold as late', () => {
    expect(deriveTapStatus(tap(), policy)).toBe('late');
  });

  it('marks taps without a linked student as unknown cards', () => {
    const anonymous = tap({ student_id: null, student_number: null, student_name: null });
    expect(deriveTapStatus(anonymous, policy)).toBe('unknown_card');
  });

  it('treats a malformed cutoff as no cutoff instead of all-late', () => {
    expect(deriveTapStatus(tap(), { timezone: 'Asia/Jakarta', onTimeUntil: 'ab:cd' })).toBe(
      'on_time',
    );
  });
});

describe('tap to RfidTapLog mapping', () => {
  it('maps identity, reader, time and delay fields', () => {
    const log = mapTapToRfidLog(tap(), policy);
    expect(log).toMatchObject({
      id: 'tap-1',
      nis: '2024001',
      studentName: 'Andi Pratama',
      readerId: 'dev-1',
      readerName: 'Reader Gerbang Utama',
      tapTime: '07:05',
      status: 'late',
      delayMinutes: 5,
      origin: 'device',
      cardUid: 'A1B2C3',
    });
  });

  it('charges one point per started five minutes of delay', () => {
    expect(mapTapToRfidLog(tap(), policy).pointPenalty).toBe(1);
    expect(mapTapToRfidLog(tap({ occurred_at: '2026-10-26T00:11:00Z' }), policy).pointPenalty).toBe(
      3,
    );
  });

  it('gives on-time taps no delay and no penalty', () => {
    const onTime = tap({ occurred_at: '2026-10-25T23:55:00Z' });
    const log = mapTapToRfidLog(onTime, policy);
    expect(log.status).toBe('on_time');
    expect(log.delayMinutes).toBe(0);
    expect(log.pointPenalty).toBe(0);
  });

  it('labels cards without a student as unknown', () => {
    const anonymous = tap({ student_id: null, student_number: null, student_name: null });
    const log = mapTapToRfidLog(anonymous, policy);
    expect(log.status).toBe('unknown_card');
    expect(log.studentName).toBe('Kartu tidak dikenal');
    expect(log.nis).toBe('');
  });
});

describe('dedupe and filtering', () => {
  it('keeps the newest tap per student and per unknown card', () => {
    const newest = tap();
    const repeat = tap({ id: 'tap-2', occurred_at: '2026-10-26T00:02:00Z' });
    const otherStudent = tap({ id: 'tap-3', student_id: 'stu-2', student_name: 'Budi' });
    const unknownA = tap({
      id: 'tap-4',
      student_id: null,
      student_number: null,
      student_name: null,
      card_uid: 'ZZZ1',
    });
    const unknownB = tap({
      id: 'tap-5',
      student_id: null,
      student_number: null,
      student_name: null,
      card_uid: 'ZZZ1',
    });

    expect(dedupeTaps([newest, repeat, otherStudent, unknownA, unknownB])).toStrictEqual([
      newest,
      otherStudent,
      unknownA,
    ]);
  });

  it('filters mapped logs by reader and status', () => {
    const logs = filterFixtureLogs;
    const base = { searchKeyword: '', readerFilter: 'all', statusFilter: 'all' } as const;

    expect(filterTapLogs(logs, base)).toHaveLength(3);
    expect(filterTapLogs(logs, { ...base, readerFilter: 'dev-2' })).toHaveLength(1);
    expect(filterTapLogs(logs, { ...base, statusFilter: 'on_time' })).toHaveLength(1);
    expect(filterTapLogs(logs, { ...base, statusFilter: 'unknown_card' })).toHaveLength(1);
  });

  it('filters mapped logs by student search text', () => {
    const logs = filterFixtureLogs;
    const base = { searchKeyword: '', readerFilter: 'all', statusFilter: 'all' } as const;

    expect(filterTapLogs(logs, { ...base, searchKeyword: 'andi' })).toHaveLength(1);
    expect(filterTapLogs(logs, { ...base, searchKeyword: 'citra' })).toHaveLength(1);
    expect(filterTapLogs(logs, { ...base, searchKeyword: 'zzz' })).toHaveLength(0);
  });

  it('matches search keyword against class name on manual rows', () => {
    const manual = {
      ...mapTapToRfidLog(tap(), policy),
      className: 'VIII A',
      origin: 'manual' as const,
    };
    expect(
      filterTapLogs([manual], {
        searchKeyword: 'viii a',
        readerFilter: 'all',
        statusFilter: 'all',
      }),
    ).toHaveLength(1);
  });
});

describe('list options and request', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    setAccessToken(null);
  });

  it('polls the tap stream every ten seconds', () => {
    const options = deviceTapsOptions({ from: '2026-10-26', to: '2026-10-26', limit: 200 });
    expect(options.queryKey).toStrictEqual([
      'piket',
      'device-taps',
      { from: '2026-10-26', to: '2026-10-26', limit: 200 },
    ]);
    expect(options.refetchInterval).toBe(tapPollInterval);
  });

  it('pauses polling while the tap query is in error', () => {
    expect(tapPollInterval({ state: { status: 'success' } })).toBe(10_000);
    expect(tapPollInterval({ state: { status: 'refreshing' } })).toBe(10_000);
    expect(tapPollInterval({ state: { status: 'error' } })).toBeFalsy();
  });

  it('GET /device-taps forwards filters and unwraps the page', async () => {
    vi.stubGlobal('fetch', fetchMock);
    const page = { data: [tap()], total: 1, limit: 200, offset: 0 };
    fetchMock.mockResolvedValueOnce(jsonResponse(200, page));

    await expect(
      fetchDeviceTaps({ from: '2026-10-26', to: '2026-10-26', limit: 200 }),
    ).resolves.toStrictEqual([tap()]);

    const [url] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(
      expect.stringContaining('/api/v1/device-taps?from=2026-10-26&to=2026-10-26&limit=200'),
    );
  });

  it('surfaces a forbidden role as an ApiError', async () => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValueOnce(jsonResponse(403, { code: 'forbidden', message: 'no access' }));

    await expect(fetchDeviceTaps()).rejects.toMatchObject({ name: 'ApiError', status: 403 });
  });
});
