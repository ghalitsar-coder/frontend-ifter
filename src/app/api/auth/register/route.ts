import * as z from 'zod';
import { setBackendToken } from '@/libs/BackendSession';
import { Env } from '@/libs/Env';
import type { Envelope, LoginResult } from '@/services/presensiApi';

const registrationSchema = z.object({
  adminName: z.string().trim().min(1).max(100),
  email: z.email().max(254),
  level: z.string().trim().min(1).max(20),
  name: z.string().trim().min(1).max(120),
  npsn: z
    .string()
    .trim()
    .regex(/^\d{8}$/u),
  password: z.string().min(8).max(72),
  phone: z.string().trim().min(9),
});

/**
 * Register a school through POST /v1/auth/register, then keep the returned JWT in the httpOnly
 * cookie so the wizard can continue straight into the app.
 *
 * @param request - Wizard draft: school profile, admin account and password.
 * @returns The signed-in admin, or the backend `{ code, message }` with the backend status.
 */
export async function POST(request: Request): Promise<Response> {
  const parsed = registrationSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return Response.json(
      { code: 'invalid_registration', message: 'registration data is invalid' },
      { status: 422 },
    );
  }

  const form = parsed.data;
  const response = await fetch(`${Env.API_BASE_URL}/v1/auth/register`, {
    body: JSON.stringify({
      admin_name: form.adminName,
      email: form.email,
      jenjang: form.level,
      npsn: form.npsn,
      password: form.password,
      phone: form.phone,
      school_name: form.name,
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);

  if (response === null) {
    return Response.json(
      { code: 'unreachable', message: 'backend is not reachable' },
      { status: 502 },
    );
  }

  const envelope: Envelope<LoginResult> | null = await response.json().catch(() => null);

  if (envelope === null) {
    return Response.json(
      { code: 'internal_error', message: 'backend registration response is not JSON' },
      { status: 502 },
    );
  }

  if (!response.ok) {
    return Response.json(
      envelope.error ?? { code: 'internal_error', message: 'backend registration failed' },
      { status: response.status },
    );
  }

  if (envelope.data === undefined) {
    return Response.json(
      { code: 'internal_error', message: 'backend registration response carries no token' },
      { status: 502 },
    );
  }

  const admin = envelope.data;
  await setBackendToken(admin.token);

  return Response.json({
    nama: admin.nama,
    roles: admin.roles,
    user_id: admin.user_id,
    username: admin.username,
  });
}
