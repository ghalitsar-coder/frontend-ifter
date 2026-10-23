import type {
  DispensationCoverage,
  DispensationDocument,
  DispensationEvent,
  DispensationStudent,
  DispensationSubcategory,
  MedicalCertificateStudent,
} from '@/types/dispensation';

/**
 * Student delegated to the official competition.
 */
export const mockDispensationStudent: DispensationStudent = {
  name: 'Dimas Saputra',
  attendanceNumber: '03',
  nisn: '00829103',
  className: 'Kelas VIII A',
  school: 'SMP Negeri 1 Sleman',
  curriculum: 'Kurikulum Merdeka',
  homeroom: 'Ibu Sarah Wijaya',
  coach: 'Drs. Agus Subagyo, M.Pd.',
  coachPhone: '0812-3341-9980',
  requestId: '#DSP-202610-019',
  status: 'Siap Disahkan',
};

/**
 * Competition details copied into the official letter.
 */
export const mockDispensationEvent: DispensationEvent = {
  competition: 'Olimpiade Sains Nasional (OSN) Tingkat Kabupaten / Kota 2026',
  organizer: 'Balai Pengembangan Talenta Indonesia (BPI) & Kemendikbudristek',
  location: 'Gedung Balai Penjaminan Mutu Pendidikan (BPMP) DIY, Kalasan, Sleman',
  startIso: '2026-10-07',
  endIso: '2026-10-09',
  startLabel: 'Rabu, 07 Okt 2026',
  endLabel: 'Jumat, 09 Okt 2026',
  letterNumber: '421.3 / ST-OSN / X / 2026',
  letterPlaceDate: 'Sleman, 06 Oktober 2026',
  headmaster: 'Dra. Hj. Nurul Hidayati, M.Pd.',
  headmasterNip: 'NIP. 19680512 199303 2 004',
  taskLine: 'Delegasi OSN Matematika Sleman',
  periodLabel: '07 - 09 Oktober 2026',
  digitalId: 'SLM-OSN-26-99214',
  recordedAt: '06/10/2026 08:45 WIB',
};

/**
 * Official letter already uploaded and verified by the school.
 */
export const mockDispensationDocument: DispensationDocument = {
  fileName: 'Surat_Tugas_OSN_Sleman_DimasSaputra_CapBasah.pdf',
  fileSize: '1.8 MB',
  uploadedBy: 'Pembina OSIS',
  verificationNote: 'PDF Resmi Digital',
};

/**
 * Sick student used by the medical certificate modal variant.
 */
export const mockMedicalCertificateStudent: MedicalCertificateStudent = {
  name: 'Alya Putri',
  attendanceNumber: '02',
  nisn: '00829102',
  className: 'Kelas VIII A',
  guardian: 'Hendra Putri',
  guardianPhone: '0812-7890-4421',
  dateLabel: 'Senin, 5 Okt 2026',
  sessionLabel: 'Sesi Jam ke 1-2',
  documentNumber: '#DOC-202610-042',
  diagnosis:
    'Demam tifoid ringan. Surat dokter diterbitkan RS Kasih Ibu dr. Hartono, Sp.A dengan anjuran istirahat total selama 2 hari.',
  document: {
    fileName: 'Surat_Dokter_RS_Kasih_Ibu_Alya.pdf',
    fileSize: '1.2 MB',
    uploadedBy: 'Wali Murid',
    verificationNote: 'Surat dokter resmi',
  },
};

/**
 * Activity sub-categories offered under the dispensation segment.
 */ export const mockDispensationSubcategories: DispensationSubcategory[] = [
  { id: 'osn', label: 'Olimpiade Sains (OSN)' },
  { id: 'fls2n', label: 'Festival Seni FLS2N' },
  { id: 'o2sn', label: 'O2SN Olahraga' },
  { id: 'pramuka', label: 'Delegasi Pramuka / OSIS' },
];

/**
 * Count calendar days inside an inclusive date range.
 *
 * @param startIso - First day in ISO format.
 * @param endIso - Last day in ISO format.
 * @returns Number of inclusive days, or zero for invalid ranges.
 */
export function countInclusiveDays(startIso: string, endIso: string) {
  const start = Date.parse(`${startIso}T00:00:00Z`);
  const end = Date.parse(`${endIso}T00:00:00Z`);

  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return 0;
  }

  return Math.round((end - start) / 86_400_000) + 1;
}

/**
 * Resolve the affected class sessions for a coverage level.
 *
 * @param coverage - Full or partial dispensation.
 * @returns Session range label.
 */
export function getCoverageSessions(coverage: DispensationCoverage) {
  return coverage === 'full' ? '1-8' : '5-8';
}

/**
 * Resolve the daily lesson hours for a coverage level.
 *
 * @param coverage - Full or partial dispensation.
 * @returns Lesson hours covered per day.
 */
export function getCoverageHours(coverage: DispensationCoverage) {
  return coverage === 'full' ? 8 : 4;
}

/**
 * Total lesson hours covered by the request.
 *
 * @param days - Inclusive dispensation days.
 * @param coverage - Full or partial dispensation.
 * @returns Covered lesson hours.
 */
export function getCoveredLessonHours(days: number, coverage: DispensationCoverage) {
  return days * getCoverageHours(coverage);
}
