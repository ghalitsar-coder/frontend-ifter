import type { DisciplineCategory, IncidentStatus } from '@/types/discipline';

/**
 * Envelope wrapper matching the backend HTTP response.
 */
export type Envelope<T> = {
  data?: T;
  error?: { code: string; message: string; request_id?: string };
  meta?: { request_id?: string };
};

export type ViolationTypeRecord = {
  id: number;
  school_id: number;
  kode: string;
  nama: string;
  kategori: string;
  poin_default: number;
  is_active: boolean;
  created_at: string;
};

export type StudentViolationRecord = {
  id: number;
  school_id: number;
  inspection_id: number | null;
  student_id: number;
  violation_type_id: number;
  poin: number;
  keterangan: string | null;
  tindak_lanjut: string | null;
  tanggal: string;
  created_at: string;
  nis: string | null;
  student_name: string;
  nama_kelas: string | null;
  violation_code: string;
  violation_name: string;
  violation_category: string;
};

export type DisciplineInspectionRecord = {
  id: number;
  school_id: number;
  class_id: number;
  inspector_id: number;
  tanggal: string;
  jumlah_diperiksa: number;
  catatan: string | null;
  created_at: string;
  nama_kelas: string;
  inspector_name: string;
};

export type StudentSummaryRecord = {
  student_id: number;
  total_points: number;
  total_incidents: number;
  status_sp: string;
};

export type ClassStudentRecord = {
  id: number;
  nis: string | null;
  nama: string;
  jenis_kelamin: string;
  nama_kelas: string;
};

export type RecordViolationPayload = {
  inspection_id?: number | null;
  student_id: number;
  violation_type_id: number;
  poin?: number;
  keterangan?: string;
  tindak_lanjut?: string;
  tanggal: string;
};

export type CreateInspectionViolationItem = {
  student_id: number;
  violation_type_id: number;
  poin?: number;
  keterangan?: string;
};

export type CreateInspectionPayload = {
  class_id: number;
  tanggal: string;
  jumlah_diperiksa: number;
  catatan?: string;
  violations: CreateInspectionViolationItem[];
};

export class DisciplineApiError extends Error {
  readonly code: string;

  readonly status: number;

  constructor(details: { code: string; message: string; status: number }) {
    super(details.message);
    this.name = 'DisciplineApiError';
    this.code = details.code;
    this.status = details.status;
  }
}

async function requestEnvelope<T>(path: string, init?: RequestInit): Promise<Envelope<T>> {
  const response = await fetch(`/api/backend/${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  const envelope: Envelope<T> = await response.json();

  if (envelope.error !== undefined) {
    throw new DisciplineApiError({
      code: envelope.error.code,
      message: envelope.error.message,
      status: response.status,
    });
  }

  if (!response.ok) {
    throw new DisciplineApiError({
      code: 'internal_error',
      message: `backend request ${path} failed`,
      status: response.status,
    });
  }

  return envelope;
}

function requireData<T>(envelope: Envelope<T>): T {
  if (envelope.data === undefined) {
    throw new DisciplineApiError({
      code: 'empty_response',
      message: 'backend response did not carry a data payload',
      status: 500,
    });
  }
  return envelope.data;
}

/**
 * Fetch all active violation types (catalog) from backend.
 */
export async function fetchViolationTypes(): Promise<ViolationTypeRecord[]> {
  const envelope = await requestEnvelope<ViolationTypeRecord[]>('v1/discipline/types');
  return requireData(envelope);
}

/**
 * Fetch recorded student violations with optional filters.
 */
export async function fetchStudentViolations(filter?: {
  classId?: number;
  studentId?: number;
  category?: string;
}): Promise<StudentViolationRecord[]> {
  const searchParams = new URLSearchParams();
  if (filter?.classId) {
    searchParams.set('class_id', String(filter.classId));
  }
  if (filter?.studentId) {
    searchParams.set('student_id', String(filter.studentId));
  }
  if (filter?.category) {
    searchParams.set('kategori', filter.category);
  }

  const query = searchParams.toString();
  const path = query ? `v1/discipline/records?${query}` : 'v1/discipline/records';
  const envelope = await requestEnvelope<StudentViolationRecord[]>(path);
  return requireData(envelope);
}

/**
 * Record a single student disciplinary incident.
 */
export async function postRecordViolation(payload: RecordViolationPayload): Promise<StudentViolationRecord> {
  const envelope = await requestEnvelope<StudentViolationRecord>('v1/discipline/records', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return requireData(envelope);
}

/**
 * Update follow-up resolution notes for a violation.
 */
export async function updateViolationFollowup(
  id: number,
  tindakLanjut: string,
): Promise<StudentViolationRecord> {
  const envelope = await requestEnvelope<StudentViolationRecord>(`v1/discipline/records/${id}/followup`, {
    method: 'PATCH',
    body: JSON.stringify({ tindak_lanjut: tindakLanjut }),
  });
  return requireData(envelope);
}

/**
 * Create batch class daily inspection with violations checklist.
 */
export async function postCreateInspection(payload: CreateInspectionPayload): Promise<DisciplineInspectionRecord> {
  const envelope = await requestEnvelope<DisciplineInspectionRecord>('v1/discipline/inspections', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return requireData(envelope);
}

/**
 * Fetch list of class daily inspections.
 */
export async function fetchInspections(filter?: {
  classId?: number;
  tanggal?: string;
}): Promise<DisciplineInspectionRecord[]> {
  const searchParams = new URLSearchParams();
  if (filter?.classId) {
    searchParams.set('class_id', String(filter.classId));
  }
  if (filter?.tanggal) {
    searchParams.set('tanggal', filter.tanggal);
  }

  const query = searchParams.toString();
  const path = query ? `v1/discipline/inspections?${query}` : 'v1/discipline/inspections';
  const envelope = await requestEnvelope<DisciplineInspectionRecord[]>(path);
  return requireData(envelope);
}

/**
 * Fetch students enrolled in a class for the checklist inspection modal.
 */
export async function fetchClassStudents(classId: number): Promise<ClassStudentRecord[]> {
  const envelope = await requestEnvelope<ClassStudentRecord[]>(`v1/discipline/classes/${classId}/students`);
  return requireData(envelope);
}

/**
 * Fetch cumulative points and sanction status for a student.
 */
export async function fetchStudentSummary(studentId: number): Promise<StudentSummaryRecord> {
  const envelope = await requestEnvelope<StudentSummaryRecord>(`v1/discipline/students/${studentId}/summary`);
  return requireData(envelope);
}
