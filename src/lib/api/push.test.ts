import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, setAccessToken } from '@/lib/api/client';
import {
  createPushSubscription,
  deletePushSubscription,
  fetchPushConfig,
  fetchPushSubscriptions,
  isPushDisabled,
  sendPushTest,
} from '@/lib/api/push';
import type { PushSubscriptionRecord } from '@/lib/api/push';

const baseSubscription: PushSubscriptionRecord = {
  id: 'sub-1',
  endpoint: 'https://push.example.test/sub-1',
  user_agent: 'Mozilla/5.0',
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

describe('push requests', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    setAccessToken(null);
  });

  it('GET /push/config returns the server capability', async () => {
    installFetch();
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { enabled: true, public_key: 'BPublicKey' }));

    await expect(fetchPushConfig()).resolves.toStrictEqual({
      enabled: true,
      public_key: 'BPublicKey',
    });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/push/config'));
    expect(init?.method).toBe('GET');
  });

  it('GET /push/subscriptions unwraps the data envelope', async () => {
    installFetch();
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: [baseSubscription] }));

    await expect(fetchPushSubscriptions()).resolves.toStrictEqual([baseSubscription]);

    const [url] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/push/subscriptions'));
  });

  it('POST /push/subscriptions sends the subscription keys', async () => {
    installFetch();
    fetchMock.mockResolvedValueOnce(jsonResponse(201, { subscription: baseSubscription }));

    await expect(
      createPushSubscription({
        endpoint: 'https://push.example.test/sub-1',
        p256dh: 'p256dh-key',
        auth: 'auth-key',
        user_agent: 'Mozilla/5.0',
      }),
    ).resolves.toStrictEqual(baseSubscription);

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/push/subscriptions'));
    expect(init?.method).toBe('POST');
    expect(parseBody(init)).toStrictEqual({
      endpoint: 'https://push.example.test/sub-1',
      p256dh: 'p256dh-key',
      auth: 'auth-key',
      user_agent: 'Mozilla/5.0',
    });
  });

  it('DELETE /push/subscriptions/:id removes one subscription', async () => {
    installFetch();
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(deletePushSubscription('sub-1')).resolves.toBeUndefined();

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/push/subscriptions/sub-1'));
    expect(init?.method).toBe('DELETE');
  });

  it('POST /admin/push/test sends the test payload', async () => {
    installFetch();
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { sent: 2, failed: 1 }));

    await expect(sendPushTest({ title: 'Uji', body: 'Halo' })).resolves.toStrictEqual({
      sent: 2,
      failed: 1,
    });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/admin/push/test'));
    expect(init?.method).toBe('POST');
    expect(parseBody(init)).toStrictEqual({ title: 'Uji', body: 'Halo' });
  });
});

describe('push disabled detection', () => {
  it('matches only the push_disabled ApiError', () => {
    expect(isPushDisabled(new ApiError(503, 'push_disabled', 'Push dimatikan.'))).toBeTruthy();
    expect(isPushDisabled(new ApiError(500, 'internal', 'Gagal.'))).toBeFalsy();
    expect(isPushDisabled(new Error('push_disabled'))).toBeFalsy();
  });
});
