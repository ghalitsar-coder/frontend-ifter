/**
 * Envelope wrapper matching the backend HTTP response.
 */
type Envelope<T> = {
  data?: T;
  error?: { code: string; message: string; request_id?: string };
  meta?: { request_id?: string };
};

export type ViolationTypeRecord = {
  id: number;
  school_id: number;
  kode: string;
  nama: string;
  kategori: 'atribut' | 'kerapihan' | 'perilaku' | 'lainnya' | string;
  poin_default: number;
  is_active: boolean;
  created_at: string;
};

export type UpsertViolationTypePayload = {
  kode: string;
  nama: string;
  kategori: 'atribut' | 'kerapihan' | 'perilaku' | 'lainnya';
  poin_default: number;
  is_active?: boolean;
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
  violations?: StudentViolationRecord[];
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

export type SchoolStudentRecord = {
  id: number;
  nis: string | null;
  nama: string;
  jenis_kelamin: string;
  no_hp_ortu: string | null;
  class_id: number;
  nama_kelas: string;
  tingkat: number;
};

export type WatchlistStudentRecord = {
  student_id: number;
  nis: string | null;
  student_name: string;
  no_hp_ortu: string | null;
  class_id: number | null;
  nama_kelas: string | null;
  total_points: number;
  total_incidents: number;
  last_violation_date: string;
  status_sp: string;
};

export type CounselingStatus = 'scheduled' | 'ongoing' | 'completed';

export type CounselingRecord = {
  id: number;
  school_id: number;
  student_id: number;
  counselor_id: number | null;
  tanggal: string;
  topik: string;
  catatan: string | null;
  tindak_lanjut: string | null;
  status: CounselingStatus;
  created_at: string;
  nis: string | null;
  student_name: string;
  nama_kelas: string | null;
  counselor_name: string | null;
};

export type CreateCounselingPayload = {
  student_id: number;
  tanggal: string;
  topik: string;
  catatan?: string;
  tindak_lanjut?: string;
  status?: CounselingStatus;
};

export type UpdateCounselingPayload = {
  tanggal: string;
  topik: string;
  catatan?: string;
  tindak_lanjut?: string;
  status: CounselingStatus;
};

export type ParentSummonsStatus = 'draft' | 'sent' | 'completed';

export type ParentSummonsRecord = {
  id: number;
  school_id: number;
  student_id: number;
  created_by: number | null;
  nomor_surat: string;
  tanggal_surat: string;
  jadwal_pertemuan: string;
  ruangan: string;
  alasan: string;
  nama_ortu: string | null;
  no_hp_ortu: string | null;
  status: ParentSummonsStatus;
  sent_at: string | null;
  completed_at: string | null;
  catatan_hasil: string | null;
  created_at: string;
  nis: string | null;
  student_name: string;
  nama_kelas: string | null;
  created_by_name: string | null;
  total_points: number;
};

export type CreateParentSummonsPayload = {
  student_id: number;
  nomor_surat: string;
  tanggal_surat: string;
  jadwal_pertemuan: string;
  ruangan: string;
  alasan: string;
  nama_ortu?: string;
  no_hp_ortu?: string;
  status?: ParentSummonsStatus;
};

export type UpdateParentSummonsPayload = {
  nomor_surat: string;
  tanggal_surat: string;
  jadwal_pertemuan: string;
  ruangan: string;
  alasan: string;
  nama_ortu?: string;
  no_hp_ortu?: string;
  catatan_hasil?: string;
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

export type UpdateViolationPayload = {
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

export type UpdateInspectionPayload = {
  tanggal: string;
  jumlah_diperiksa: number;
  catatan?: string;
  violations?: CreateInspectionViolationItem[];
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
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(`/api/backend/${path}`, {
    ...init,
    headers,
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

export async function fetchViolationTypes(includeInactive = false): Promise<ViolationTypeRecord[]> {
  const path = includeInactive ? 'v1/discipline/types?include_inactive=true' : 'v1/discipline/types';
  const envelope = await requestEnvelope<ViolationTypeRecord[]>(path);
  return requireData(envelope);
}

export async function createViolationType(
  payload: UpsertViolationTypePayload,
): Promise<ViolationTypeRecord> {
  const envelope = await requestEnvelope<ViolationTypeRecord>('v1/discipline/types', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return requireData(envelope);
}

export async function updateViolationType(
  id: number,
  payload: UpsertViolationTypePayload,
): Promise<ViolationTypeRecord> {
  const envelope = await requestEnvelope<ViolationTypeRecord>(`v1/discipline/types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return requireData(envelope);
}

export async function deleteViolationType(id: number): Promise<void> {
  await requestEnvelope<{ deleted: boolean }>(`v1/discipline/types/${id}`, {
    method: 'DELETE',
  });
}

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

export async function postRecordViolation(
  payload: RecordViolationPayload,
): Promise<StudentViolationRecord> {
  const envelope = await requestEnvelope<StudentViolationRecord>('v1/discipline/records', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return requireData(envelope);
}

export async function updateViolationRecord(
  id: number,
  payload: UpdateViolationPayload,
): Promise<StudentViolationRecord> {
  const envelope = await requestEnvelope<StudentViolationRecord>(`v1/discipline/records/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return requireData(envelope);
}

export async function updateViolationFollowup(
  id: number,
  tindakLanjut: string,
): Promise<StudentViolationRecord> {
  const envelope = await requestEnvelope<StudentViolationRecord>(
    `v1/discipline/records/${id}/followup`,
    {
      method: 'PATCH',
      body: JSON.stringify({ tindak_lanjut: tindakLanjut }),
    },
  );
  return requireData(envelope);
}

export async function deleteViolationRecord(id: number): Promise<void> {
  await requestEnvelope<{ deleted: boolean }>(`v1/discipline/records/${id}`, {
    method: 'DELETE',
  });
}

export async function postCreateInspection(
  payload: CreateInspectionPayload,
): Promise<DisciplineInspectionRecord> {
  const envelope = await requestEnvelope<DisciplineInspectionRecord>('v1/discipline/inspections', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return requireData(envelope);
}

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

export async function updateInspection(
  id: number,
  payload: UpdateInspectionPayload,
): Promise<DisciplineInspectionRecord> {
  const envelope = await requestEnvelope<DisciplineInspectionRecord>(
    `v1/discipline/inspections/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
  return requireData(envelope);
}

export async function deleteInspection(id: number): Promise<void> {
  await requestEnvelope<{ deleted: boolean }>(`v1/discipline/inspections/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchClassStudents(classId: number): Promise<ClassStudentRecord[]> {
  const envelope = await requestEnvelope<ClassStudentRecord[]>(
    `v1/discipline/classes/${classId}/students`,
  );
  return requireData(envelope);
}

export async function fetchSchoolStudents(classId?: number): Promise<SchoolStudentRecord[]> {
  const path = classId ? `v1/discipline/students?class_id=${classId}` : 'v1/discipline/students';
  const envelope = await requestEnvelope<SchoolStudentRecord[]>(path);
  return requireData(envelope);
}

export async function fetchWatchlist(minPoints = 1): Promise<WatchlistStudentRecord[]> {
  const envelope = await requestEnvelope<WatchlistStudentRecord[]>(
    `v1/discipline/watchlist?min_points=${minPoints}`,
  );
  return requireData(envelope);
}

export async function fetchStudentSummary(studentId: number): Promise<StudentSummaryRecord> {
  const envelope = await requestEnvelope<StudentSummaryRecord>(
    `v1/discipline/students/${studentId}/summary`,
  );
  return requireData(envelope);
}

export async function fetchCounselingRecords(filter?: {
  studentId?: number;
  status?: CounselingStatus;
}): Promise<CounselingRecord[]> {
  const params = new URLSearchParams();
  if (filter?.studentId) {
    params.set('student_id', String(filter.studentId));
  }
  if (filter?.status) {
    params.set('status', filter.status);
  }
  const q = params.toString();
  const envelope = await requestEnvelope<CounselingRecord[]>(
    q ? `v1/discipline/counseling?${q}` : 'v1/discipline/counseling',
  );
  return requireData(envelope);
}

export async function createCounselingRecord(
  payload: CreateCounselingPayload,
): Promise<CounselingRecord> {
  const envelope = await requestEnvelope<CounselingRecord>('v1/discipline/counseling', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return requireData(envelope);
}

export async function updateCounselingRecord(
  id: number,
  payload: UpdateCounselingPayload,
): Promise<CounselingRecord> {
  const envelope = await requestEnvelope<CounselingRecord>(`v1/discipline/counseling/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return requireData(envelope);
}

export async function deleteCounselingRecord(id: number): Promise<void> {
  await requestEnvelope<{ deleted: boolean }>(`v1/discipline/counseling/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchParentSummons(filter?: {
  studentId?: number;
  status?: ParentSummonsStatus;
}): Promise<ParentSummonsRecord[]> {
  const params = new URLSearchParams();
  if (filter?.studentId) {
    params.set('student_id', String(filter.studentId));
  }
  if (filter?.status) {
    params.set('status', filter.status);
  }
  const q = params.toString();
  const envelope = await requestEnvelope<ParentSummonsRecord[]>(
    q ? `v1/discipline/summons?${q}` : 'v1/discipline/summons',
  );
  return requireData(envelope);
}

export async function createParentSummons(
  payload: CreateParentSummonsPayload,
): Promise<ParentSummonsRecord> {
  const envelope = await requestEnvelope<ParentSummonsRecord>('v1/discipline/summons', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return requireData(envelope);
}

export async function updateParentSummons(
  id: number,
  payload: UpdateParentSummonsPayload,
): Promise<ParentSummonsRecord> {
  const envelope = await requestEnvelope<ParentSummonsRecord>(`v1/discipline/summons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return requireData(envelope);
}

export async function updateParentSummonsStatus(
  id: number,
  status: ParentSummonsStatus,
  catatanHasil?: string,
): Promise<ParentSummonsRecord> {
  const envelope = await requestEnvelope<ParentSummonsRecord>(
    `v1/discipline/summons/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status, catatan_hasil: catatanHasil }),
    },
  );
  return requireData(envelope);
}

export async function deleteParentSummons(id: number): Promise<void> {
  await requestEnvelope<{ deleted: boolean }>(`v1/discipline/summons/${id}`, {
    method: 'DELETE',
  });
}
