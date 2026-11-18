export type RecapStatus = 'draft' | 'dikunci';

export type StudentRecap = {
  id: number;
  student_id: number;
  student_name: string;
  class_id: number;
  class_name: string;
  bulan: number;
  tahun: number;
  total_hadir: number;
  total_sakit: number;
  total_izin: number;
  total_alpa: number;
  persentase_hadir: number;
  status_kunci: RecapStatus;
  verified_by: number | null;
  created_at: string;
};

export type StaffRecap = {
  id: number;
  staff_id: number;
  nama_pegawai: string;
  nip: string | null;
  bulan: number;
  tahun: number;
  total_hari_kerja: number;
  total_hadir: number;
  total_terlambat: number;
  total_izin: number;
  total_sakit: number;
  total_alpa: number;
  persentase_hadir: number;
  status_kunci: RecapStatus;
  verified_by: number | null;
  created_at: string;
};

export type RecapVerification = {
  id: number;
  status_kunci: RecapStatus;
  verified_by: number | null;
};

export type ClassRecapSummary = {
  class_id: number;
  class_name: string;
  student_count: number;
  total_hadir: number;
  total_sakit: number;
  total_izin: number;
  total_alpa: number;
  persentase_hadir: number;
};
