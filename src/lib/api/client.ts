import { Env } from '@/libs/Env';

/** Backend error envelope: `{ code, message, request_id? }`. */
type ErrorEnvelope = {
  code?: string;
  message?: string;
  request_id?: string;
};

/**
 * Error thrown by every API helper when the backend responds with a
 * non-2xx status. Carries the parsed error envelope fields.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;

  constructor(status: number, code: string, message: string, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

/** Simple query-string map; `undefined`/`null` values are skipped. */
export type QueryParams = Record<string, string | number | boolean | null | undefined>;

const API_PREFIX = '/api/v1';

const buildUrl = (path: string, query?: QueryParams): string => {
  const base = `${Env.NEXT_PUBLIC_API_URL.replace(/\/+$/u, '')}${API_PREFIX}`;
  const url = new URL(`${base}${path}`);

  if (query !== undefined) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
};

// ---------------------------------------------------------------------------
// Access token store — in-memory ONLY. Never localStorage/sessionStorage:
// the refresh token lives in an HttpOnly cookie managed by the backend.
// ---------------------------------------------------------------------------
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = (): string | null => accessToken;

/** Authorization header map for manual `fetch` calls (empty when signed out).
 * @returns Headers object containing the Bearer token, or `{}` when signed out.
 */
export const authHeaders = (): Record<string, string> =>
  accessToken === null ? {} : { Authorization: `Bearer ${accessToken}` };

// ---------------------------------------------------------------------------
// Logout callback (wired by AuthProvider)
// ---------------------------------------------------------------------------
let logoutHandler: (() => void) | null = null;

export const setLogoutHandler = (handler: (() => void) | null) => {
  logoutHandler = handler;
};

const triggerLogout = () => {
  accessToken = null;
  logoutHandler?.();
};

// ---------------------------------------------------------------------------
// Refresh flow — single-flight so parallel 401s share one refresh call.
// ---------------------------------------------------------------------------
let refreshPromise: Promise<boolean> | null = null;

const performRefresh = async (): Promise<boolean> => {
  try {
    const response = await fetch(buildUrl('/auth/refresh'), {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) {
      return false;
    }
    const body: unknown = await response.json();
    if (
      typeof body !== 'object' ||
      body === null ||
      !('access_token' in body) ||
      typeof body.access_token !== 'string'
    ) {
      return false;
    }
    accessToken = body.access_token;
    return true;
  } catch {
    return false;
  }
};

/**
 * POST /auth/refresh (cookie-only, no body). On success stores the new access
 * token and returns true; on failure returns false and triggers logout.
 * Single-flight: parallel 401 responses share one refresh request.
 * @returns Whether a usable access token was obtained.
 */
export const refreshAccessToken = async (): Promise<boolean> => {
  refreshPromise ??= performRefresh();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

const NO_RETRY_PATHS = new Set(['/auth/login', '/auth/refresh']);

// ---------------------------------------------------------------------------
// Core request helper
// ---------------------------------------------------------------------------
type InternalRequest = {
  method: string;
  query?: QueryParams;
  body?: unknown;
  formData?: FormData;
};

const toApiError = (response: Response, body: unknown): ApiError => {
  const envelope = (body ?? {}) as ErrorEnvelope;
  return new ApiError(
    response.status,
    envelope.code ?? 'unknown_error',
    envelope.message ?? response.statusText ?? 'Request failed',
    envelope.request_id,
  );
};

const parseJson = async (response: Response): Promise<unknown> => {
  if (response.status === 204) {
    return null;
  }
  const text = await response.text();
  if (text === '') {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
};

/**
 * Sends a fetch with auth + one transparent 401-refresh-retry. Returns raw Response.
 * @param path - API path relative to /api/v1.
 * @param init - Method/query/body description of the call.
 * @param retried - Internal flag preventing an endless retry loop.
 * @returns The raw fetch Response (may be an error status).
 */
const send = async (path: string, init: InternalRequest, retried = false): Promise<Response> => {
  const headers: Record<string, string> = { ...authHeaders() };
  if (init.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(buildUrl(path, init.query), {
    method: init.method,
    credentials: 'include',
    headers,
    ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
    ...(init.formData === undefined ? {} : { body: init.formData }),
  });

  if (response.status === 401 && !retried && !NO_RETRY_PATHS.has(path)) {
    if (await refreshAccessToken()) {
      return await send(path, init, true);
    }
    triggerLogout();
  }

  return response;
};

/**
 * JSON request returning the parsed body, or `null` for 204. Throws `ApiError`
 * on any non-2xx response (after one refresh retry on 401).
 * @param path - API path relative to /api/v1.
 * @param init - Method/query/body description of the call.
 * @returns The parsed JSON body typed as T (`null` for 204 responses).
 */
const requestJson = async <T>(path: string, init: InternalRequest): Promise<T> => {
  const response = await send(path, init);
  const body = await parseJson(response);

  if (!response.ok) {
    throw toApiError(response, body);
  }

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- endpoint contract guarantees the JSON shape; T is the caller-provided DTO type
  return body as T;
};

// ---------------------------------------------------------------------------
// Public helpers — all paths are relative to /api/v1 and start with '/'.
// ---------------------------------------------------------------------------
export const apiGet = async <T>(path: string, query?: QueryParams): Promise<T> =>
  await requestJson<T>(path, { method: 'GET', query });

export const apiPost = async <T>(path: string, body?: unknown, query?: QueryParams): Promise<T> =>
  await requestJson<T>(path, { method: 'POST', body, query });

export const apiPut = async <T>(path: string, body?: unknown): Promise<T> =>
  await requestJson<T>(path, { method: 'PUT', body });

export const apiPatch = async <T>(path: string, body?: unknown): Promise<T> =>
  await requestJson<T>(path, { method: 'PATCH', body });

export const apiDelete = async <T>(path: string, query?: QueryParams): Promise<T> =>
  await requestJson<T>(path, { method: 'DELETE', query });

/**
 * Multipart upload (backend field name is always `file`, plus e.g. `mode`).
 * @param path - API path relative to /api/v1.
 * @param formData - Multipart payload.
 * @param query - Optional query parameters (e.g. `{ mode: 'upsert' }`).
 * @returns The parsed JSON body typed as T.
 */
export const apiUpload = async <T>(
  path: string,
  formData: FormData,
  query?: QueryParams,
): Promise<T> => await requestJson<T>(path, { method: 'POST', formData, query });

const parseContentDispositionFilename = (header: string | null): string | null => {
  if (header === null) {
    return null;
  }
  const utf8Match = /filename\*=UTF-8''([^;]+)/iu.exec(header);
  if (utf8Match?.[1] !== undefined) {
    return decodeURIComponent(utf8Match[1]);
  }
  const plainMatch = /filename="?([^";]+)"?/iu.exec(header);
  return plainMatch?.[1] ?? null;
};

/**
 * Downloads an XLSX (or any binary) endpoint with the same auth/refresh logic.
 * Returns the Blob plus the filename read from Content-Disposition.
 * @param path - API path relative to /api/v1.
 * @param query - Optional query parameters.
 * @returns Object with the response `blob` and the attachment `filename` (null when absent).
 */
export const downloadFile = async (
  path: string,
  query?: QueryParams,
): Promise<{ blob: Blob; filename: string | null }> => {
  const response = await send(path, { method: 'GET', query });

  if (!response.ok) {
    throw toApiError(response, await parseJson(response));
  }

  return {
    blob: await response.blob(),
    filename: parseContentDispositionFilename(response.headers.get('Content-Disposition')),
  };
};
