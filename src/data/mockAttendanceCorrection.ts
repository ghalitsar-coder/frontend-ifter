import type {
  CorrectionFilterState,
  CorrectionLog,
  CorrectionStats,
  CorrectionStatusOption,
} from '@/types/attendanceCorrection';

/**
 * Monthly correction recap counters displayed above the audit table.
 */
export const mockCorrectionStats: CorrectionStats = {
  month: 'Okt 2026',
  totalRequests: 18,
  previousMonthTotal: 24,
  deltaPercent: -24,
  approved: 16,
  approvedPercent: 88.8,
  pending: 2,
  pendingDeadline: '16:00',
  accuracy: 99.4,
};

/**
 * Attendance codes available in the request status matrix.
 */
export const mockInitialStatusOptions: CorrectionStatusOption[] = [
  { id: 'alpa', note: 'Tanpa Keterangan' },
  { id: 'izin', note: 'Izin Resmi' },
  { id: 'sakit', note: 'Dengan SKD' },
  { id: 'hadir', note: 'Hadir KBM' },
];

/**
 * Corrected attendance codes available in the request status matrix.
 */
export const mockNewStatusOptions: CorrectionStatusOption[] = [
  { id: 'sakit', note: 'Dengan SKD' },
  { id: 'izin', note: 'Resmi Wali' },
  { id: 'dispensasi', note: 'Kegiatan' },
  { id: 'hadir', note: 'Koreksi Piket' },
];

/**
 * Immutable attendance correction audit entries.
 */
export const mockCorrectionLogs: CorrectionLog[] = [
  {
    id: '#LOG-8821',
    loggedDate: '24 Okt 2026',
    loggedTime: '09:15',
    student: { name: 'Dimas Saputra', nis: '00829103', className: 'VIII A' },
    sessionDate: '23 Okt 2026',
    sessionLabel: 'KBM Pagi (Sesi 1-4)',
    fromStatus: 'alpa',
    toStatus: 'sakit',
    toNote: 'Dengan SKD',
    reason:
      'Surat keterangan dokter dari RSUD Cibinong diserahkan menyusul oleh wali murid pukul 08:30 WIB.',
    attachment: { fileName: 'SKD-RSUD-8812.pdf', fileSize: '1.4 MB' },
    officer: { name: 'Sarah Rahma, S.Pd.', role: 'Wali Kelas VIII A' },
    verification: 'validated',
  },
  {
    id: '#LOG-8820',
    loggedDate: '24 Okt 2026',
    loggedTime: '08:40',
    student: { name: 'Nadia Azzahra', nis: '00829144', className: 'VIII B' },
    sessionDate: '24 Okt 2026',
    sessionLabel: 'KBM Penuh',
    fromStatus: 'alpa',
    toStatus: 'izin',
    toNote: 'Resmi Wali',
    reason:
      'Pemberitahuan acara keluarga duka cita di Tasikmalaya diserahkan via formulir daring kesiswaan.',
    attachment: { fileName: 'Surat_Izin_Duka_Nadia.jpg', fileSize: '840 KB' },
    officer: { name: 'Drs. Bambang Sudiro', role: 'Wali Kelas VIII B' },
    verification: 'pending',
  },
  {
    id: '#LOG-8819',
    loggedDate: '23 Okt 2026',
    loggedTime: '14:10',
    student: { name: 'Rian Aditya Pratama', nis: '00762190', className: 'IX A' },
    sessionDate: '23 Okt 2026',
    sessionLabel: 'Sesi Siang (Sesi 5-8)',
    fromStatus: 'alpa',
    toStatus: 'dispensasi',
    toNote: 'Kegiatan',
    reason: 'Delegasi mewakili sekolah dalam Final O2SN Bulutangkis Tingkat Kota di GOR Pajajaran.',
    attachment: { fileName: 'Surat_Tugas_Dispora_O2SN.pdf', fileSize: '2.1 MB' },
    officer: { name: 'Hendra Kusuma, M.Pd.', role: 'Pembina OSIS & Olahraga' },
    verification: 'validated',
  },
  {
    id: '#LOG-8818',
    loggedDate: '22 Okt 2026',
    loggedTime: '11:25',
    student: { name: 'Aisyah Maharani', nis: '00781923', className: 'IX C' },
    sessionDate: '22 Okt 2026',
    sessionLabel: 'KBM Pagi',
    fromStatus: 'izin',
    toStatus: 'hadir',
    toNote: 'Koreksi Piket',
    reason:
      'Salah entri guru piket (tertukar NIS dengan siswa lain yang berhalangan hadir). Siswa hadir penuh di kelas.',
    confirmationNote: 'Dikonfirmasi oleh Guru Mapel Matematika',
    officer: { name: 'Siti Fatimah, S.Pd.', role: 'Guru Piket Harian' },
    verification: 'validated',
  },
  {
    id: '#LOG-8817',
    loggedDate: '21 Okt 2026',
    loggedTime: '15:45',
    student: { name: 'Fajar Ananda', nis: '00910284', className: 'VII D' },
    sessionDate: '20 Okt 2026',
    sessionLabel: 'KBM Penuh',
    fromStatus: 'alpa',
    toStatus: 'sakit',
    toNote: 'Dengan SKD',
    reason: 'Pemeriksaan laboratorium demam berdarah dari Klinik Kimia Farma, istirahat 3 hari.',
    attachment: { fileName: 'Hasil_Lab_Klinik_KF_Fajar.pdf', fileSize: '910 KB' },
    officer: { name: 'Rahmat Hidayat, S.Pd.', role: 'Wali Kelas VII D' },
    verification: 'validated',
  },
  {
    id: '#LOG-8816',
    loggedDate: '21 Okt 2026',
    loggedTime: '10:20',
    student: { name: 'Bintang Wicaksono', nis: '00829112', className: 'VIII A' },
    sessionDate: '21 Okt 2026',
    sessionLabel: 'KBM Pagi',
    fromStatus: 'alpa',
    toStatus: 'izin',
    toNote: 'Resmi Wali',
    reason: 'Izin menghadiri akad nikah keluarga inti di Bandung, surat izin orang tua terlampir.',
    attachment: { fileName: 'Izin_Bintang_Wicaksono.pdf', fileSize: '620 KB' },
    officer: { name: 'Sarah Rahma, S.Pd.', role: 'Wali Kelas VIII A' },
    verification: 'validated',
  },
  {
    id: '#LOG-8815',
    loggedDate: '20 Okt 2026',
    loggedTime: '16:05',
    student: { name: 'Kirana Putri Larasati', nis: '00829150', className: 'VIII B' },
    sessionDate: '20 Okt 2026',
    sessionLabel: 'KBM Penuh',
    fromStatus: 'izin',
    toStatus: 'hadir',
    toNote: 'Koreksi Piket',
    reason:
      'Siswa tercatat izin namun hadir dan mengikuti seluruh KBM; verifikasi melalui daftar hadir kelas.',
    confirmationNote: 'Dikonfirmasi oleh Wali Kelas VIII B',
    officer: { name: 'Drs. Bambang Sudiro', role: 'Wali Kelas VIII B' },
    verification: 'validated',
  },
  {
    id: '#LOG-8814',
    loggedDate: '20 Okt 2026',
    loggedTime: '09:12',
    student: { name: 'Muhammad Rizky Pratama', nis: '00762184', className: 'IX A' },
    sessionDate: '19 Okt 2026',
    sessionLabel: 'Sesi Siang (Sesi 5-8)',
    fromStatus: 'alpa',
    toStatus: 'sakit',
    toNote: 'Dengan SKD',
    reason: 'Surat keterangan rawat jalan dari Klinik Sehat Sentosa, istirahat 2 hari.',
    attachment: { fileName: 'SKD_Klinik_Rizky.pdf', fileSize: '1.1 MB' },
    officer: { name: 'Hendra Kusuma, M.Pd.', role: 'Pembina OSIS & Olahraga' },
    verification: 'validated',
  },
  {
    id: '#LOG-8813',
    loggedDate: '19 Okt 2026',
    loggedTime: '14:33',
    student: { name: 'Zahra Nur Aini', nis: '00781940', className: 'IX C' },
    sessionDate: '18 Okt 2026',
    sessionLabel: 'KBM Pagi',
    fromStatus: 'alpa',
    toStatus: 'dispensasi',
    toNote: 'Kegiatan',
    reason: 'Mewakili sekolah pada Lomba Cerdas Cermat Tingkat Kabupaten.',
    attachment: { fileName: 'Surat_Tugas_LCC_Zahra.pdf', fileSize: '780 KB' },
    officer: { name: 'Siti Fatimah, S.Pd.', role: 'Guru Piket Harian' },
    verification: 'validated',
  },
  {
    id: '#LOG-8812',
    loggedDate: '19 Okt 2026',
    loggedTime: '08:05',
    student: { name: 'Bagas Setiawan', nis: '00910291', className: 'VII D' },
    sessionDate: '18 Okt 2026',
    sessionLabel: 'KBM Penuh',
    fromStatus: 'alpa',
    toStatus: 'izin',
    toNote: 'Resmi Wali',
    reason:
      'Keperluan keluarga mendadak di luar kota, pemberitahuan orang tua melalui telepon dan surat menyusul.',
    attachment: { fileName: 'Surat_Izin_Bagas.jpg', fileSize: '540 KB' },
    officer: { name: 'Rahmat Hidayat, S.Pd.', role: 'Wali Kelas VII D' },
    verification: 'validated',
  },
  {
    id: '#LOG-8811',
    loggedDate: '18 Okt 2026',
    loggedTime: '13:47',
    student: { name: 'Ayu Lestari', nis: '00829133', className: 'VIII A' },
    sessionDate: '18 Okt 2026',
    sessionLabel: 'Sesi Siang (Sesi 5-8)',
    fromStatus: 'alpa',
    toStatus: 'hadir',
    toNote: 'Koreksi Piket',
    reason: 'Siswa hadir tetapi belum dipindai pada sesi siang; daftar hadir manual terlampir.',
    confirmationNote: 'Dikonfirmasi oleh Guru Mapel Bahasa Indonesia',
    officer: { name: 'Sarah Rahma, S.Pd.', role: 'Wali Kelas VIII A' },
    verification: 'validated',
  },
  {
    id: '#LOG-8810',
    loggedDate: '18 Okt 2026',
    loggedTime: '09:20',
    student: { name: 'Danu Prasetyo', nis: '00829161', className: 'VIII B' },
    sessionDate: '17 Okt 2026',
    sessionLabel: 'KBM Penuh',
    fromStatus: 'alpa',
    toStatus: 'sakit',
    toNote: 'Dengan SKD',
    reason: 'Demam tinggi, surat dokter dari Puskesmas Cibinong menyarankan istirahat 3 hari.',
    attachment: { fileName: 'SKD_Puskesmas_Danu.pdf', fileSize: '950 KB' },
    officer: { name: 'Drs. Bambang Sudiro', role: 'Wali Kelas VIII B' },
    verification: 'pending',
  },
  {
    id: '#LOG-8809',
    loggedDate: '17 Okt 2026',
    loggedTime: '15:10',
    student: { name: 'Nabila Syafira', nis: '00762177', className: 'IX A' },
    sessionDate: '17 Okt 2026',
    sessionLabel: 'Sesi Siang (Sesi 5-8)',
    fromStatus: 'alpa',
    toStatus: 'dispensasi',
    toNote: 'Kegiatan',
    reason: 'Delegasi sekolah pada Festival Literasi Digital tingkat kota.',
    attachment: { fileName: 'Surat_Tugas_Festival_Nabila.pdf', fileSize: '1.3 MB' },
    officer: { name: 'Hendra Kusuma, M.Pd.', role: 'Pembina OSIS & Olahraga' },
    verification: 'validated',
  },
  {
    id: '#LOG-8808',
    loggedDate: '17 Okt 2026',
    loggedTime: '10:44',
    student: { name: 'Yoga Pratama', nis: '00781956', className: 'IX C' },
    sessionDate: '16 Okt 2026',
    sessionLabel: 'KBM Pagi',
    fromStatus: 'alpa',
    toStatus: 'izin',
    toNote: 'Resmi Wali',
    reason: 'Izin mengikuti pemakaman keluarga di Sukabumi, surat izin orang tua terlampir.',
    attachment: { fileName: 'Surat_Izin_Yoga.pdf', fileSize: '700 KB' },
    officer: { name: 'Siti Fatimah, S.Pd.', role: 'Guru Piket Harian' },
    verification: 'validated',
  },
  {
    id: '#LOG-8807',
    loggedDate: '16 Okt 2026',
    loggedTime: '14:02',
    student: { name: 'Salsabila Rahmadani', nis: '00910305', className: 'VII D' },
    sessionDate: '16 Okt 2026',
    sessionLabel: 'KBM Penuh',
    fromStatus: 'izin',
    toStatus: 'hadir',
    toNote: 'Koreksi Piket',
    reason:
      'Salah entri status oleh guru piket; siswa hadir penuh dan tercatat pada daftar hadir kelas.',
    confirmationNote: 'Dikonfirmasi oleh Wali Kelas VII D',
    officer: { name: 'Rahmat Hidayat, S.Pd.', role: 'Wali Kelas VII D' },
    verification: 'validated',
  },
  {
    id: '#LOG-8806',
    loggedDate: '16 Okt 2026',
    loggedTime: '09:35',
    student: { name: 'Farhan Maulana', nis: '00829120', className: 'VIII A' },
    sessionDate: '15 Okt 2026',
    sessionLabel: 'KBM Pagi',
    fromStatus: 'alpa',
    toStatus: 'sakit',
    toNote: 'Dengan SKD',
    reason: 'Surat keterangan dokter gigi dari RSUD Cibinong, izin 1 hari.',
    attachment: { fileName: 'SKD_RSUD_Farhan.pdf', fileSize: '890 KB' },
    officer: { name: 'Sarah Rahma, S.Pd.', role: 'Wali Kelas VIII A' },
    verification: 'validated',
  },
  {
    id: '#LOG-8805',
    loggedDate: '15 Okt 2026',
    loggedTime: '16:20',
    student: { name: 'Intan Permatasari', nis: '00829170', className: 'VIII B' },
    sessionDate: '15 Okt 2026',
    sessionLabel: 'KBM Penuh',
    fromStatus: 'alpa',
    toStatus: 'izin',
    toNote: 'Resmi Wali',
    reason: 'Pemberitahuan izin keluarga melalui formulir daring kesiswaan; surat fisik menyusul.',
    attachment: { fileName: 'Formulir_Izin_Intan.pdf', fileSize: '460 KB' },
    officer: { name: 'Drs. Bambang Sudiro', role: 'Wali Kelas VIII B' },
    verification: 'validated',
  },
  {
    id: '#LOG-8804',
    loggedDate: '15 Okt 2026',
    loggedTime: '08:50',
    student: { name: 'Reza Fadillah', nis: '00781963', className: 'IX C' },
    sessionDate: '14 Okt 2026',
    sessionLabel: 'Sesi Siang (Sesi 5-8)',
    fromStatus: 'alpa',
    toStatus: 'hadir',
    toNote: 'Koreksi Piket',
    reason:
      'Siswa mengikuti kegiatan ekstrakurikuler resmi lalu masuk kelas pada sesi siang; daftar hadir terlampir.',
    confirmationNote: 'Dikonfirmasi oleh Pembina Ekstrakurikuler',
    officer: { name: 'Hendra Kusuma, M.Pd.', role: 'Pembina OSIS & Olahraga' },
    verification: 'validated',
  },
];

/**
 * Student and class options shown in the request modal.
 */
export const mockCorrectionStudents = [
  { name: 'Dimas Saputra', className: 'VIII A', nis: '00829103' },
  { name: 'Nadia Azzahra', className: 'VIII B', nis: '00829144' },
  { name: 'Rian Aditya Pratama', className: 'IX A', nis: '00762190' },
  { name: 'Aisyah Maharani', className: 'IX C', nis: '00781923' },
  { name: 'Fajar Ananda', className: 'VII D', nis: '00910284' },
  { name: 'Bintang Wicaksono', className: 'VIII A', nis: '00829112' },
];

/**
 * Class options available in the audit toolbar.
 */
export const mockCorrectionClasses = ['VIII A', 'VIII B', 'IX A', 'IX C', 'VII D'];

/**
 * Check whether a log matches the active change filter.
 *
 * @param log - Audit entry to test.
 * @param filter - Selected change filter.
 * @returns True when the entry belongs to the selected change group.
 */
export function matchesChangeFilter(log: CorrectionLog, filter: CorrectionFilterState['change']) {
  if (filter === 'all') {
    return true;
  }

  if (filter === 'dispensasi') {
    return log.toStatus === 'dispensasi';
  }

  if (filter === 'izin_hadir') {
    return log.fromStatus === 'izin' && log.toStatus === 'hadir';
  }

  if (filter === 'alpa_sakit') {
    return log.fromStatus === 'alpa' && log.toStatus === 'sakit';
  }

  return log.fromStatus === 'alpa' && log.toStatus === 'izin';
}

/**
 * Filter audit entries by search term, change type, and class.
 *
 * @param logs - Full audit log.
 * @param filters - Active toolbar filters.
 * @returns Filtered audit entries.
 */
export function filterCorrectionLogs(logs: CorrectionLog[], filters: CorrectionFilterState) {
  const query = filters.search.trim().toLowerCase();

  return logs.filter((log) => {
    const matchesSearch =
      query.length === 0 ||
      log.student.name.toLowerCase().includes(query) ||
      log.student.nis.includes(query);
    const matchesClass = filters.className === 'all' || log.student.className === filters.className;

    return matchesSearch && matchesClass && matchesChangeFilter(log, filters.change);
  });
}

/**
 * Slice audit entries for the current page.
 *
 * @param logs - Filtered audit entries.
 * @param page - Current 1-based page number.
 * @param pageSize - Number of entries per page.
 * @returns Page slice and pagination bounds.
 */
export function paginateCorrectionLogs(logs: CorrectionLog[], page: number, pageSize = 5) {
  const totalPages = Math.max(1, Math.ceil(logs.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const items = logs.slice(startIndex, startIndex + pageSize);

  return {
    items,
    page: safePage,
    totalPages,
    start: logs.length === 0 ? 0 : startIndex + 1,
    end: startIndex + items.length,
    total: logs.length,
  };
}
