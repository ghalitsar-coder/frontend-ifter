import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ApiError,
  apiGet,
  apiPost,
  downloadFile,
  setAccessToken,
  setLogoutHandler,
} from './client';

const jsonResponse = (status: number, body: unknown, headers?: Record<string, string>) =>
  new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

const fetchMock = vi.fn<typeof globalThis.fetch>();

const installFetch = () => {
  vi.stubGlobal('fetch', fetchMock);
};

describe('api client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    setAccessToken(null);
    setLogoutHandler(null);
  });

  it('attaches the bearer token and parses the JSON body', async () => {
    installFetch();
    setAccessToken('tok-123');
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: [{ id: '1' }] }));

    const result = await apiGet<{ data: unknown[] }>('/classes', { status: 'active' });

    expect(result).toStrictEqual({ data: [{ id: '1' }] });
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/classes?status=active'));
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer tok-123' });
    expect(init?.credentials).toBe('include');
  });

  it('throws ApiError parsed from the error envelope', async () => {
    installFetch();
    setAccessToken('tok');
    fetchMock.mockResolvedValueOnce(
      jsonResponse(400, { code: 'invalid_request', message: 'bad input', request_id: 'r1' }),
    );

    await expect(apiPost('/auth/login', { login: 'a', password: 'b' })).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      code: 'invalid_request',
      message: 'bad input',
    });
  });

  it('returns null for 204 responses', async () => {
    installFetch();
    setAccessToken('tok');
    fetchMock.mockResolvedValueOnce(jsonResponse(204, null));

    await expect(apiPost<null>('/auth/logout')).resolves.toBeNull();
  });

  it('refreshes once on 401 then retries the original request', async () => {
    installFetch();
    setAccessToken('expired');
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { code: 'unauthorized', message: 'gone' }))
      .mockResolvedValueOnce(jsonResponse(200, { access_token: 'fresh' }))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await expect(apiGet('/auth/me')).resolves.toMatchObject({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1]?.[0]).toStrictEqual(expect.stringContaining('/auth/refresh'));
    expect(fetchMock.mock.calls[2]?.[1]?.headers).toMatchObject({
      Authorization: 'Bearer fresh',
    });
  });

  it('triggers the logout callback when refresh fails', async () => {
    installFetch();
    setAccessToken('expired');
    const onLogout = vi.fn<() => void>();
    setLogoutHandler(onLogout);
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { code: 'unauthorized', message: 'gone' }))
      .mockResolvedValueOnce(jsonResponse(401, { code: 'invalid_refresh', message: 'nope' }));

    await expect(apiGet('/auth/me')).rejects.toBeInstanceOf(ApiError);
    expect(onLogout).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('reads filename from Content-Disposition in downloadFile', async () => {
    installFetch();
    setAccessToken('tok');
    fetchMock.mockResolvedValueOnce(
      new Response(new Blob(['xlsx']), {
        status: 200,
        headers: { 'Content-Disposition': 'attachment; filename="students.xlsx"' },
      }),
    );

    const { blob, filename } = await downloadFile('/exports/students');
    expect(filename).toBe('students.xlsx');
    await expect(blob.text()).resolves.toBe('xlsx');
  });
});
