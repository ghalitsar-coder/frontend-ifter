import type {
  ClassRecapSummary,
  RecapVerification,
  StaffRecap,
  StudentRecap,
} from '@/types/recap';
import type { Envelope } from '@/services/presensiApi';
import { PresensiApiError } from '@/services/presensiApi';

/**
 * Call the Go backend through the /api/backend passthrough.
 *
 * @param path - Backend path without the host, for example `v1/recaps/students`.
 * @param init - Fetch init options (method, body, etc.).
 * @returns Parsed envelope, whose `data` can be absent on empty lists.
 * @throws {PresensiApiError} When the backend reports an error.
 */
async function recapRequest<T>(path: string, init?: RequestInit): Promise<Envelope<T>> {
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
      message: `recap request ${path} failed`,
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
 * Generate (or refresh) student attendance recaps for a given month and year.
 * Calls POST /v1/recaps/students.
 *
 * @param bulan - Month number (1–12).
 * @param tahun - 4-digit year.
 * @returns Array of StudentRecap rows created or updated.
 * @throws {PresensiApiError} When the backend call fails.
 */
export async function generateStudentRecaps(bulan: number, tahun: number): Promise<StudentRecap[]> {
  const envelope = await recapRequest<StudentRecap[]>('v1/recaps/students', {
    body: JSON.stringify({ bulan, tahun }),
    method: 'POST',
  });

  return envelope.data ?? [];
}

/**
 * Fetch the existing student recaps for a given period.
 * Calls GET /v1/recaps/students?bulan=&tahun=.
 *
 * @param bulan - Month number (1–12).
 * @param tahun - 4-digit year.
 * @returns Array of StudentRecap rows; empty array when none exist yet.
 * @throws {PresensiApiError} When the backend call fails.
 */
export async function listStudentRecaps(bulan: number, tahun: number): Promise<StudentRecap[]> {
  const envelope = await recapRequest<StudentRecap[]>(
    `v1/recaps/students?bulan=${bulan}&tahun=${tahun}`,
  );

  return envelope.data ?? [];
}

/**
 * Lock (verify) one student recap row.
 * Calls POST /v1/recaps/students/:id/verify.
 *
 * @param id - ID of the StudentRecap to lock.
 * @returns The updated verification payload.
 * @throws {PresensiApiError} When the backend call fails.
 */
export async function verifyStudentRecap(id: number): Promise<RecapVerification> {
  const envelope = await recapRequest<RecapVerification>(`v1/recaps/students/${id}/verify`, {
    method: 'POST',
  });

  return requireData(envelope);
}

/**
 * Generate (or refresh) staff attendance recaps for a given month and year.
 * Calls POST /v1/recaps/staff.
 *
 * @param bulan - Month number (1–12).
 * @param tahun - 4-digit year.
 * @returns Array of StaffRecap rows created or updated.
 * @throws {PresensiApiError} When the backend call fails.
 */
export async function generateStaffRecaps(bulan: number, tahun: number): Promise<StaffRecap[]> {
  const envelope = await recapRequest<StaffRecap[]>('v1/recaps/staff', {
    body: JSON.stringify({ bulan, tahun }),
    method: 'POST',
  });

  return envelope.data ?? [];
}

/**
 * Fetch the existing staff recaps for a given period.
 * Calls GET /v1/recaps/staff?bulan=&tahun=.
 *
 * @param bulan - Month number (1–12).
 * @param tahun - 4-digit year.
 * @returns Array of StaffRecap rows; empty array when none exist yet.
 * @throws {PresensiApiError} When the backend call fails.
 */
export async function listStaffRecaps(bulan: number, tahun: number): Promise<StaffRecap[]> {
  const envelope = await recapRequest<StaffRecap[]>(
    `v1/recaps/staff?bulan=${bulan}&tahun=${tahun}`,
  );

  return envelope.data ?? [];
}

/**
 * Lock (verify) one staff recap row.
 * Calls POST /v1/recaps/staff/:id/verify.
 *
 * @param id - ID of the StaffRecap to lock.
 * @returns The updated verification payload.
 * @throws {PresensiApiError} When the backend call fails.
 */
export async function verifyStaffRecap(id: number): Promise<RecapVerification> {
  const envelope = await recapRequest<RecapVerification>(`v1/recaps/staff/${id}/verify`, {
    method: 'POST',
  });

  return requireData(envelope);
}

/**
 * Aggregate an array of StudentRecap rows into per-class summaries.
 * The backend sends per-student data; the "Per kelas" tab groups them on the frontend.
 * The class rate is calculated from summed status counts, so students with more recorded sessions
 * contribute proportionally instead of receiving the same weight as students with fewer sessions.
 *
 * @param students - Full list of student recap rows for the period.
 * @returns One ClassRecapSummary per unique class_id, sorted by class_name.
 */
export function toClassSummaries(students: StudentRecap[]): ClassRecapSummary[] {
  const map = new Map<number, ClassRecapSummary>();

  for (const s of students) {
    const existing = map.get(s.class_id);

    if (existing === undefined) {
      map.set(s.class_id, {
        class_id: s.class_id,
        class_name: s.class_name,
        student_count: 1,
        total_hadir: s.total_hadir,
        total_sakit: s.total_sakit,
        total_izin: s.total_izin,
        total_alpa: s.total_alpa,
        persentase_hadir: s.persentase_hadir,
      });
    } else {
      existing.student_count += 1;
      existing.total_hadir += s.total_hadir;
      existing.total_sakit += s.total_sakit;
      existing.total_izin += s.total_izin;
      existing.total_alpa += s.total_alpa;
      // Running average: accumulate then divide at the end
    }
  }

  for (const summary of map.values()) {
    const recordedSessions =
      summary.total_hadir + summary.total_sakit + summary.total_izin + summary.total_alpa;
    summary.persentase_hadir =
      recordedSessions === 0 ? 0 : Math.round((summary.total_hadir / recordedSessions) * 100);
  }

  return Array.from(map.values()).sort((a, b) => a.class_name.localeCompare(b.class_name));
}
