import type { PresensiStatus, PresensiStudent } from '@/types/presensi';

/**
 * Response wrapper the backend sends for every endpoint.
 */
export type Envelope<T> = {
  data?: T;
  error?: { code: string; message: string; request_id?: string };
  meta?: { request_id?: string };
};

/**
 * Class of the active academic year, from GET /v1/classes.
 */
export type ClassRecord = {
  id: number;
  nama_kelas: string;
  tingkat: number;
  wali_kelas: string | null;
};

/**
 * Attendance session, from POST /v1/attendance-sessions.
 */
export type Session = {
  id: number;
  class_id: number;
  class_subject_id: number | null;
  recorded_by: number;
  tanggal: string;
  is_locked: boolean;
  created_at: string;
};

/**
 * One roster row of a session; `status` and `keterangan` are null until recorded.
 */
export type SessionAttendance = {
  student_id: number;
  nis: string | null;
  nama: string;
  status: Exclude<PresensiStatus, 'none'> | null;
  keterangan: string | null;
};

/**
 * Session with its active roster, from GET /v1/attendance-sessions/:id.
 */
export type SessionDetail = {
  session: Session;
  attendances: SessionAttendance[];
};

/**
 * Body of POST /v1/attendance-sessions.
 */
export type CreateSessionInput = {
  class_id: number;
  class_subject_id?: number | null;
  tanggal: string;
};

/**
 * One row of the PUT /v1/attendance-sessions/:id/attendances body.
 */
export type AttendanceInput = {
  student_id: number;
  status: Exclude<PresensiStatus, 'none'>;
  keterangan: string | null;
};

/**
 * Signed-in staff account as the browser sees it.
 */
export type AuthSession = {
  user_id: number;
  username: string;
  nama: string;
  roles: string[];
};

/**
 * Payload of POST /v1/auth/login; the token stays server-side in the cookie.
 */
export type LoginResult = AuthSession & {
  token: string;
  expires_at: string;
};

/**
 * Payload of POST /v1/auth/register, sent through the Next registration route.
 */
export type RegisterSchoolInput = {
  adminName: string;
  email: string;
  level: string;
  name: string;
  npsn: string;
  password: string;
  phone: string;
};

/**
 * Backend failure that carries the machine-readable code instead of a prose message,
 * so the screen can translate `code` and react to `status`.
 */
export class PresensiApiError extends Error {
  /** Backend error code, for example `invalid_credentials`, `locked` or `unauthorized`. */
  readonly code: string;
  /** HTTP status of the failed call; 401 means the session cookie is gone. */
  readonly status: number;

  /**
   * Build a translatable backend failure.
   *
   * @param details - Code, message and status of the failed call.
   */
  constructor(details: { code: string; message: string; status: number }) {
    super(details.message);
    this.name = 'PresensiApiError';
    this.code = details.code;
    this.status = details.status;
  }
}

/**
 * Call the Go backend through the /api/backend passthrough.
 *
 * @param path - Backend path without the host, for example `v1/classes`.
 * @param init - Request options carrying the JSON body.
 * @returns The parsed envelope, whose `data` can be absent.
 * @throws {PresensiApiError} When the backend reports an error.
 */
async function requestEnvelope<T>(path: string, init?: RequestInit): Promise<Envelope<T>> {
  const response = await fetch(`/api/backend/${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json' },
  });
  const envelope: Envelope<T> = await response.json();

  if (envelope.error !== undefined) {
    throw new PresensiApiError({
      code: envelope.error.code,
      message: envelope.error.message,
      status: response.status,
    });
  }

  if (!response.ok) {
    throw new PresensiApiError({
      code: 'internal_error',
      message: `backend request ${path} failed`,
      status: response.status,
    });
  }

  return envelope;
}

/**
 * Take the payload of an envelope that must carry one.
 *
 * @param envelope - Parsed backend envelope.
 * @returns The backend payload.
 * @throws {PresensiApiError} When the payload is missing.
 */
function requireData<T>(envelope: Envelope<T>): T {
  if (envelope.data === undefined) {
    throw new PresensiApiError({
      code: 'empty_response',
      message: 'backend response carries no data',
      status: 500,
    });
  }

  return envelope.data;
}

/**
 * List the classes of the active academic year.
 *
 * @returns Every active class, ordered by tingkat then nama_kelas.
 * @throws {PresensiApiError} When the backend call fails.
 */
export async function getClasses(): Promise<ClassRecord[]> {
  const envelope = await requestEnvelope<ClassRecord[]>('v1/classes');

  // Go drops the `data` key for an empty list, which means no classes.
  return envelope.data ?? [];
}

/**
 * Open an attendance session for one class and date.
 *
 * @param input - Class, optional class subject and tanggal as YYYY-MM-DD.
 * @returns The created session.
 * @throws {PresensiApiError} When the backend call fails.
 */
export async function createSession(input: CreateSessionInput): Promise<Session> {
  const envelope = await requestEnvelope<Session>('v1/attendance-sessions', {
    body: JSON.stringify(input),
    method: 'POST',
  });

  return requireData(envelope);
}

/**
 * Load a session with the active roster of its class and the saved statuses.
 *
 * @param sessionId - Backend session id.
 * @returns Session detail.
 * @throws {PresensiApiError} When the backend call fails.
 */
export async function getSession(sessionId: number): Promise<SessionDetail> {
  const envelope = await requestEnvelope<SessionDetail>(`v1/attendance-sessions/${sessionId}`);

  return requireData(envelope);
}

/**
 * Save the statuses of a session and get the refreshed roster back.
 *
 * @param sessionId - Backend session id.
 * @param attendances - One row per student the teacher marked.
 * @returns Session detail with the saved statuses.
 * @throws {PresensiApiError} When the backend call fails.
 */
export async function recordAttendances(
  sessionId: number,
  attendances: AttendanceInput[],
): Promise<SessionDetail> {
  const envelope = await requestEnvelope<SessionDetail>(
    `v1/attendance-sessions/${sessionId}/attendances`,
    { body: JSON.stringify({ attendances }), method: 'PUT' },
  );

  return requireData(envelope);
}

/**
 * Query key of the sign-in check, shared by the gate, the sign-out button and every 401 bounce.
 */
export const AUTH_QUERY_KEY = ['presensi', 'auth'] as const;

/**
 * Ask the Next session route whether this browser carries the backend cookie. No backend round trip.
 *
 * @returns True when a session cookie exists.
 */
export async function getAuthStatus(): Promise<boolean> {
  const response = await fetch('/api/auth/session');
  const payload: { authenticated: boolean } = await response.json();

  return payload.authenticated;
}

/**
 * Sign in through the Next session route, which stores the JWT in the httpOnly cookie.
 *
 * @param credentials - Username and password as typed by the teacher.
 * @returns The signed-in staff account.
 * @throws {PresensiApiError} When the backend refuses the credentials or is unreachable.
 */
export async function signIn(credentials: {
  password: string;
  username: string;
}): Promise<AuthSession> {
  const response = await fetch('/api/auth/session', {
    body: JSON.stringify(credentials),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
  const payload: AuthSession & { code?: string; message?: string } = await response.json();

  if (!response.ok) {
    throw new PresensiApiError({
      code: payload.code ?? 'internal_error',
      message: payload.message ?? 'login failed',
      status: response.status,
    });
  }

  return payload;
}

/**
 * Register a school and its first admin through the Next registration route, which stores the
 * returned JWT in the httpOnly cookie.
 *
 * @param input - School profile, admin account and password from the wizard.
 * @returns The signed-in admin.
 * @throws {PresensiApiError} When the backend rejects the registration or is unreachable.
 */
export async function registerSchool(input: RegisterSchoolInput): Promise<AuthSession> {
  const response = await fetch('/api/auth/register', {
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);

  if (response === null) {
    throw new PresensiApiError({
      code: 'unreachable',
      message: 'backend is not reachable',
      status: 502,
    });
  }

  const payload: (AuthSession & { code?: string; message?: string }) | null = await response
    .json()
    .catch(() => null);

  if (payload === null) {
    throw new PresensiApiError({
      code: 'internal_error',
      message: 'registration failed',
      status: response.status,
    });
  }

  if (!response.ok) {
    throw new PresensiApiError({
      code: payload.code ?? 'internal_error',
      message: payload.message ?? 'registration failed',
      status: response.status,
    });
  }

  return payload;
}

/**
 * Forget the backend session cookie.
 */
export async function signOut(): Promise<void> {
  await fetch('/api/auth/session', { method: 'DELETE' });
}

/**
 * The rows the backend accepts: every student carrying a status, with the note that belongs to it.
 * Unmarked rows are left out because the backend rejects an empty list.
 *
 * @param students - Current roster rows.
 * @returns One attendance input per marked student.
 */
export function toAttendanceInputs(students: PresensiStudent[]): AttendanceInput[] {
  const inputs: AttendanceInput[] = [];

  for (const student of students) {
    if (student.status !== 'none') {
      inputs.push({
        keterangan: student.note ?? null,
        status: student.status,
        student_id: Number(student.id),
      });
    }
  }

  return inputs;
}

/**
 * First letters of the two first words of a name, the avatar label of the Stitch roster row.
 *
 * @param name - Full student name from the backend.
 * @returns One or two upper-case letters.
 */
function toInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/u)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * Convert one backend roster row into the row the Attendly screen renders. The backend sends
 * `nis` where the screen shows `nisn`, `keterangan` becomes the row note, a null status means the
 * student is not recorded yet, and `student_id` becomes the row id so a save sends it back
 * unchanged. `hasDocument` has no backend source and stays unset.
 *
 * @param attendance - Row of `SessionDetail.attendances`.
 * @returns Roster row in the same order as the backend sent it.
 */
export function toPresensiStudent(attendance: SessionAttendance): PresensiStudent {
  return {
    id: String(attendance.student_id),
    initials: toInitials(attendance.nama),
    name: attendance.nama,
    nisn: attendance.nis ?? '',
    note: attendance.keterangan ?? undefined,
    status: attendance.status ?? 'none',
  };
}
