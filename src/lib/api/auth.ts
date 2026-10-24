import { apiGet, apiPost, refreshAccessToken, setAccessToken } from '@/lib/api/client';
import type { ApiUser, AuthSession, MeResponse } from '@/lib/api/dto';

const USER_STORAGE_KEY = 'ifter_user';

const isBrowser = () => typeof window !== 'undefined';

/**
 * The logged-in user snapshot is kept in sessionStorage (non-secret display
 * data only). The access token is in-memory only (see client.ts); the refresh
 * token is an HttpOnly cookie managed by the backend.
 * @param user - The user returned by the backend session endpoints.
 */
const writeStoredUser = (user: ApiUser) => {
  if (isBrowser()) {
    window.sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
};

const clearStoredUser = () => {
  if (isBrowser()) {
    window.sessionStorage.removeItem(USER_STORAGE_KEY);
  }
};

/**
 * Reads the last known user snapshot (null when signed out / SSR).
 * @returns The stored user, or null when unavailable.
 */
export const readStoredUser = (): ApiUser | null => {
  if (!isBrowser()) {
    return null;
  }
  const raw = window.sessionStorage.getItem(USER_STORAGE_KEY);
  if (raw === null) {
    return null;
  }
  try {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- sessionStorage is only written by this app from ApiUser payloads
    return JSON.parse(raw) as ApiUser;
  } catch {
    return null;
  }
};

/**
 * POST /auth/login. Stores the access token in memory and the user snapshot.
 * @param username - Login accepted by the backend (username or email).
 * @param password - Plain-text password.
 * @returns The authenticated user.
 */
export const login = async (username: string, password: string): Promise<ApiUser> => {
  const session = await apiPost<AuthSession>('/auth/login', {
    login: username,
    password,
  });
  setAccessToken(session.access_token);
  writeStoredUser(session.user);
  return session.user;
};

/**
 * GET /auth/me. Refreshes the stored user snapshot.
 * @returns The current user.
 */
export const getMe = async (): Promise<ApiUser> => {
  const result = await apiGet<MeResponse>('/auth/me');
  writeStoredUser(result.user);
  return result.user;
};

/**
 * Session restore on app load: try cookie-based /auth/refresh first, then
 * /auth/me. Returns the user on success, null when no session exists.
 * @returns The restored user, or null when signed out.
 */
export const restoreSession = async (): Promise<ApiUser | null> => {
  if (!(await refreshAccessToken())) {
    return null;
  }
  try {
    return await getMe();
  } catch {
    setAccessToken(null);
    return null;
  }
};

/**
 * POST /auth/logout (best effort), then clears local token + user.
 * @returns Resolves once the local session is dropped.
 */
export const logout = async (): Promise<void> => {
  try {
    await apiPost<null>('/auth/logout');
  } catch {
    // Even if the server call fails we must drop the local session.
  } finally {
    setAccessToken(null);
    clearStoredUser();
  }
};
