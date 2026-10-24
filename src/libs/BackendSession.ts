import { cookies } from 'next/headers';
import { Env } from '@/libs/Env';

/**
 * Name of the httpOnly cookie holding the backend JWT; the browser never reads it.
 */
export const BACKEND_SESSION_COOKIE = 'ifter_token';

// Matches APP_AUTH_ACCESS_TOKEN_TTL on the backend.
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 12;

/**
 * Read the backend JWT of the current request.
 *
 * @returns The token, or undefined when nobody is signed in.
 */
export async function readBackendToken(): Promise<string | undefined> {
  const cookieStore = await cookies();

  return cookieStore.get(BACKEND_SESSION_COOKIE)?.value;
}

/**
 * Store the backend JWT for the whole app.
 *
 * @param token - JWT issued by POST /v1/auth/login.
 */
export async function setBackendToken(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set({
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE_SECONDS,
    name: BACKEND_SESSION_COOKIE,
    path: '/',
    sameSite: 'lax',
    secure: Env.NODE_ENV === 'production',
    value: token,
  });
}

/**
 * Forget the backend JWT of the current request.
 */
export async function clearBackendToken(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(BACKEND_SESSION_COOKIE);
}
