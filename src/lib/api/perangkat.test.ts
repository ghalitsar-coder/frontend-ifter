import { afterEach, describe, expect, it, vi } from 'vitest';
import { setAccessToken } from '@/lib/api/client';
import {
  buildDevicePayload,
  buildDeviceQuery,
  createDevice,
  deviceStatusLabel,
  deviceTypeLabel,
  fetchDevices,
  lastSeenLabel,
  updateDevice,
  updateDeviceStatus,
} from '@/lib/api/perangkat';
import type { Device } from '@/lib/api/perangkat';

const baseDevice: Device = {
  id: 'dev-1',
  name: 'Reader Gerbang Utama',
  identifier: 'RFID-GATE-01',
  device_type: 'rfid_reader',
  location: 'Gerbang depan',
  notes: null,
  status: 'active',
  last_seen_at: null,
  created_at: '2026-10-25T00:00:00Z',
  updated_at: '2026-10-25T00:00:00Z',
};

const jsonResponse = (status: number, body: unknown) =>
  Response.json(body, {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const fetchMock = vi.fn<typeof globalThis.fetch>();

/**
 * Parses the JSON body the API client put in the captured request init.
 * @param init - Request init captured by the fetch mock.
 * @returns Parsed JSON payload.
 */
const parseBody = (init: RequestInit | undefined): unknown => {
  const body = init?.body;
  if (typeof body !== 'string') {
    throw new TypeError('expected a JSON string body');
  }
  return JSON.parse(body);
};

const installFetch = () => {
  vi.stubGlobal('fetch', fetchMock);
};

describe('device labels', () => {
  it('maps device types to Indonesian labels', () => {
    expect(deviceTypeLabel('rfid_reader')).toBe('Pembaca RFID');
    expect(deviceTypeLabel('gate')).toBe('Gerbang');
    expect(deviceTypeLabel('tablet')).toBe('Tablet');
    expect(deviceTypeLabel('other')).toBe('Lainnya');
    expect(deviceTypeLabel('weird')).toBe('weird');
  });

  it('maps device statuses to Indonesian labels', () => {
    expect(deviceStatusLabel('active')).toBe('Aktif');
    expect(deviceStatusLabel('inactive')).toBe('Nonaktif');
    expect(deviceStatusLabel('weird')).toBe('weird');
  });

  it('shows the never-seen fallback for missing last_seen_at', () => {
    expect(lastSeenLabel(null)).toBe('Belum pernah');
    expect(lastSeenLabel('')).toBe('Belum pernah');
    expect(lastSeenLabel('2026-10-25T03:15:00Z')).not.toBe('Belum pernah');
  });
});

describe('query and payload builders', () => {
  it('sends only the backend-supported list filters', () => {
    expect(buildDeviceQuery()).toStrictEqual({});
    expect(buildDeviceQuery({ status: 'active', type: 'gate' })).toStrictEqual({
      status: 'active',
      type: 'gate',
    });
  });

  it('trims drafts and omits empty optional fields', () => {
    expect(
      buildDevicePayload({
        name: ' Reader Gerbang ',
        identifier: ' RFID-GATE-01 ',
        deviceType: 'rfid_reader',
        location: '  ',
        notes: '',
      }),
    ).toStrictEqual({
      name: 'Reader Gerbang',
      identifier: 'RFID-GATE-01',
      device_type: 'rfid_reader',
    });

    expect(
      buildDevicePayload({
        name: 'Tablet Resepsionis',
        identifier: 'TAB-01',
        deviceType: 'tablet',
        location: 'Lobi',
        notes: 'Di meja resepsionis',
      }),
    ).toStrictEqual({
      name: 'Tablet Resepsionis',
      identifier: 'TAB-01',
      device_type: 'tablet',
      location: 'Lobi',
      notes: 'Di meja resepsionis',
    });
  });

  it('rejects missing name and identifier', () => {
    expect(() =>
      buildDevicePayload({
        name: ' ',
        identifier: 'RFID-01',
        deviceType: 'rfid_reader',
      }),
    ).toThrow('Nama perangkat wajib diisi.');
    expect(() =>
      buildDevicePayload({
        name: 'Reader',
        identifier: ' ',
        deviceType: 'rfid_reader',
      }),
    ).toThrow('Identifier perangkat wajib diisi.');
  });
});

describe('device requests', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    setAccessToken(null);
  });

  it('GET /devices forwards status and type filters', async () => {
    installFetch();
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: [baseDevice] }));

    await expect(fetchDevices({ status: 'active', type: 'rfid_reader' })).resolves.toStrictEqual([
      baseDevice,
    ]);

    const [url] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(
      expect.stringContaining('/api/v1/devices?status=active&type=rfid_reader'),
    );
  });

  it('POST /devices sends the create payload', async () => {
    installFetch();
    fetchMock.mockResolvedValueOnce(jsonResponse(201, { device: baseDevice }));

    await expect(
      createDevice({
        name: 'Reader Gerbang Utama',
        identifier: 'RFID-GATE-01',
        device_type: 'rfid_reader',
        location: 'Gerbang depan',
      }),
    ).resolves.toStrictEqual(baseDevice);

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/devices'));
    expect(init?.method).toBe('POST');
    expect(parseBody(init)).toStrictEqual({
      name: 'Reader Gerbang Utama',
      identifier: 'RFID-GATE-01',
      device_type: 'rfid_reader',
      location: 'Gerbang depan',
    });
  });

  it('PUT /devices/:id sends the update payload', async () => {
    installFetch();
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { device: baseDevice }));

    await updateDevice('dev-1', {
      name: 'Reader Gerbang Utama',
      identifier: 'RFID-GATE-01',
      device_type: 'gate',
    });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/devices/dev-1'));
    expect(init?.method).toBe('PUT');
    expect(parseBody(init)).toStrictEqual({
      name: 'Reader Gerbang Utama',
      identifier: 'RFID-GATE-01',
      device_type: 'gate',
    });
  });

  it('PATCH /devices/:id/status sends the target status', async () => {
    installFetch();
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { device: { ...baseDevice, status: 'inactive' } }),
    );

    await expect(updateDeviceStatus('dev-1', 'inactive')).resolves.toMatchObject({
      status: 'inactive',
    });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/devices/dev-1/status'));
    expect(init?.method).toBe('PATCH');
    expect(parseBody(init)).toStrictEqual({ status: 'inactive' });
  });

  it('surfaces duplicate identifiers as a conflict ApiError', async () => {
    installFetch();
    fetchMock.mockResolvedValueOnce(
      jsonResponse(409, { code: 'conflict', message: 'identifier already exists' }),
    );

    await expect(
      createDevice({ name: 'Reader', identifier: 'RFID-01', device_type: 'rfid_reader' }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 409, code: 'conflict' });
  });
});
