import * as z from 'zod';
import { clearBackendToken, readBackendToken, setBackendToken } from '@/libs/BackendSession';
import { Env } from '@/libs/Env';
import type { Envelope, LoginResult } from '@/services/presensiApi';

const credentialsSchema = z.object({
  password: z.string().min(1),
  username: z.string().min(1),
});

/**
 * Report whether this browser carries a backend session cookie.
 *
 * @returns `{ authenticated }`, decided by cookie presence alone.
 */
export async function GET(): Promise<Response> {
  return Response.json({ authenticated: (await readBackendToken()) !== undefined });
}

/**
 * Sign in through POST /v1/auth/login and keep the JWT server-side in the httpOnly cookie.
 *
 * @param request - Login form carrying username and password.
 * @returns The signed-in user, or the backend `{ code, message }` with the backend status.
 */
export async function POST(request: Request): Promise<Response> {
  const credentials = credentialsSchema.safeParse(await request.json().catch(() => null));

  if (!credentials.success) {
    return Response.json(
      { code: 'invalid_credentials', message: 'username and password are required' },
      { status: 401 },
    );
  }

  const response = await fetch(`${Env.API_BASE_URL}/v1/auth/login`, {
    body: JSON.stringify(credentials.data),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  }).catch(() => null);

  if (response === null) {
    return Response.json(
      { code: 'unreachable', message: 'backend is not reachable' },
      { status: 502 },
    );
  }

  const envelope: Envelope<LoginResult> = await response.json();

  if (!response.ok) {
    return Response.json(
      envelope.error ?? { code: 'internal_error', message: 'backend login failed' },
      { status: response.status },
    );
  }

  if (envelope.data === undefined) {
    return Response.json(
      { code: 'internal_error', message: 'backend login response carries no token' },
      { status: 502 },
    );
  }

  const user = envelope.data;
  await setBackendToken(user.token);

  return Response.json({
    nama: user.nama,
    roles: user.roles,
    user_id: user.user_id,
    username: user.username,
  });
}

/**
 * Sign out by clearing the backend session cookie.
 *
 * @returns `{ authenticated: false }`.
 */
export async function DELETE(): Promise<Response> {
  await clearBackendToken();

  return Response.json({ authenticated: false });
}
