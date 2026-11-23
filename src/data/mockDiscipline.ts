import type {
  DisciplineCategory,
  DisciplineFilterState,
  DisciplineIncident,
  DisciplineWatchStudent,
} from '@/types/discipline';

/**
 * Standard rule catalog and point weights according to SD Islam Bakti Asih handbook.
 */
export const mockDisciplineRules: {
  key: DisciplineCategory;
  code: string;
  title: string;
  subtitle: string;
  points: number;
  badgeClass: string;
}[] = [
  {
    key: 'perilaku',
    code: 'PRL-01',
    title: 'Terlambat Masuk',
    subtitle: 'Apel / Jam Pelajaran',
    points: 2,
    badgeClass: 'bg-surface-card text-pine-deep border border-border-subtle',
  },
  {
    key: 'atribut',
    code: 'ATR-01',
    title: 'Atribut Seragam',
    subtitle: 'Topi / Dasi / Sepatu',
    points: 3,
    badgeClass: 'bg-surface-card text-pine-deep border border-border-subtle',
  },
  {
    key: 'kerapihan',
    code: 'KRP-01',
    title: 'Kerapihan Siswa',
    subtitle: 'Rambut / Kuku',
    points: 3,
    badgeClass: 'bg-amber-surface text-amber-dark border border-amber-gold/40',
  },
  {
    key: 'perilaku',
    code: 'PRL-04',
    title: 'Barang Terlarang',
    subtitle: 'Gadget / Mainan',
    points: 15,
    badgeClass: 'bg-error-container text-red-700 border border-red-200',
  },
  {
    key: 'perilaku',
    code: 'PRL-05',
    title: 'Etika & Bullying',
    subtitle: 'Perkelahian / Agresi',
    points: 50,
    badgeClass: 'bg-red-700 text-white',
  },
];

/**
 * High-priority watchlist students needing parental intervention.
 */
export const mockDisciplineWatchlist: DisciplineWatchStudent[] = [
  {
    id: 'w-1',
    name: 'Rizky Pratama',
    nis: '1015',
    className: 'Kelas 5A',
    points: 50,
    statusLabel: 'SP1 (Surat Peringatan 1)',
    riskLevel: 'tinggi',
    actionType: 'parent_call',
  },
  {
    id: 'w-2',
    name: 'Fajar Maulana',
    nis: '1007',
    className: 'Kelas 3A',
    points: 20,
    statusLabel: 'Pembinaan Wali Kelas',
    riskLevel: 'waspada',
    actionType: 'schedule_bk',
  },
  {
    id: 'w-3',
    name: 'Aldo Firmansyah',
    nis: '1011',
    className: 'Kelas 4A',
    points: 6,
    statusLabel: 'Pemantauan Ringan',
    riskLevel: 'tinjau',
    actionType: 'review_history',
  },
];

/**
 * Fallback SD Islam Bakti Asih incidents when backend is offline.
 */
export const mockDisciplineIncidents: DisciplineIncident[] = [
  {
    id: 'inc-1',
    violationCode: 'PRL-05',
    violationName: 'Perkelahian / bullying',
    backendCategory: 'perilaku',
    date: '2026-11-20',
    time: '09:30 WIB',
    studentName: 'Rizky Pratama',
    studentNis: '1015',
    studentClass: '5A',
    studentInitials: 'RP',
    studentAvatarBg: 'bg-red-100 text-red-700 border border-red-200',
    categoryKey: 'perilaku',
    categoryLabel: 'PRL-05 • Perkelahian / bullying (+50)',
    points: 50,
    description: 'Mendorong teman saat istirahat di halaman SD Islam Bakti Asih.',
    location: 'Halaman Sekolah',
    immediateAction: 'Pemanggilan Orang Tua & SP1',
    recorderName: 'Ibu Rina, S.Pd.',
    recorderRole: 'Kesiswaan & BK',
    studentTotalPoints: 50,
    studentPointStatus: 'SP1',
    status: 'tindak',
  },
  {
    id: 'inc-2',
    violationCode: 'PRL-04',
    violationName: 'Membawa barang terlarang/gadget',
    backendCategory: 'perilaku',
    date: '2026-11-21',
    time: '08:40 WIB',
    studentName: 'Fajar Maulana',
    studentNis: '1007',
    studentClass: '3A',
    studentInitials: 'FM',
    studentAvatarBg: 'bg-amber-surface text-amber-dark border border-amber-gold/40',
    categoryKey: 'perilaku',
    categoryLabel: 'PRL-04 • Membawa barang terlarang/gadget (+15)',
    points: 15,
    description: 'Membawa jam tangan pintar berkamera saat pelajaran berlangsung.',
    location: 'Ruang Kelas 3A',
    immediateAction: 'Disita sementara oleh wali kelas',
    recorderName: 'Ibu Sari',
    recorderRole: 'Wali Kelas',
    studentTotalPoints: 20,
    studentPointStatus: 'Pembinaan',
    status: 'baru',
  },
  {
    id: 'inc-3',
    violationCode: 'ATR-01',
    violationName: 'Seragam tidak lengkap',
    backendCategory: 'atribut',
    date: '2026-11-22',
    time: '07:10 WIB',
    studentName: 'Aldo Firmansyah',
    studentNis: '1011',
    studentClass: '4A',
    studentInitials: 'AF',
    studentAvatarBg: 'bg-pine-light text-pine-deep',
    categoryKey: 'atribut',
    categoryLabel: 'ATR-01 • Seragam tidak lengkap (+3)',
    points: 3,
    description: 'Tidak mengenakan topi dan dasi seragam saat upacara hari Senin.',
    location: 'Lapangan Upacara SD Islam Bakti Asih',
    immediateAction: 'Sudah dicatat pada apel pagi',
    recorderName: 'Ibu Rina, S.Pd.',
    recorderRole: 'Kesiswaan',
    studentTotalPoints: 6,
    studentPointStatus: 'Aman',
    status: 'tinjau',
  },
  {
    id: 'inc-4',
    violationCode: 'PRL-01',
    violationName: 'Terlambat masuk sekolah',
    backendCategory: 'perilaku',
    date: '2026-11-23',
    time: '07:20 WIB',
    studentName: 'Budi Santoso',
    studentNis: '0002',
    studentClass: '1A',
    studentInitials: 'BS',
    studentAvatarBg: 'bg-pastel-mint text-pine-deep',
    categoryKey: 'perilaku',
    categoryLabel: 'PRL-01 • Terlambat masuk sekolah (+2)',
    points: 2,
    description: 'Terlambat datang 10 menit saat jam masuk kelas 1A.',
    location: 'Gerbang Depan SD Islam Bakti Asih',
    immediateAction: 'selesai',
    recorderName: 'Ibu Sari',
    recorderRole: 'Guru Kelas 1A',
    studentTotalPoints: 2,
    studentPointStatus: 'Aman',
    status: 'selesai',
  },
];

/**
 * Filter incident list based on search query, class, category, status, and quick tab.
 *
 * @param incidents - List of incidents to filter.
 * @param filter - Active filter state.
 * @returns Filtered incidents array.
 */
export function filterDisciplineIncidents(
  incidents: DisciplineIncident[],
  filter: DisciplineFilterState,
): DisciplineIncident[] {
  return incidents.filter((item) => {
    if (filter.quickTab === 'need_action' && item.status === 'selesai') {
      return false;
    }
    if (filter.quickTab === 'resolved' && item.status !== 'selesai') {
      return false;
    }
    if (filter.quickTab === 'high_points' && item.studentTotalPoints < 30) {
      return false;
    }

    if (filter.selectedClass && item.studentClass !== filter.selectedClass) {
      return false;
    }

    if (
      filter.selectedCategory &&
      item.categoryKey !== filter.selectedCategory &&
      item.backendCategory !== filter.selectedCategory
    ) {
      return false;
    }

    if (filter.selectedStatus && item.status !== filter.selectedStatus) {
      return false;
    }

    if (filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      const matchName = item.studentName.toLowerCase().includes(q);
      const matchNis = item.studentNis.includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCode = item.violationCode.toLowerCase().includes(q);
      const matchViolation = item.violationName.toLowerCase().includes(q);
      if (!matchName && !matchNis && !matchDesc && !matchCode && !matchViolation) {
        return false;
      }
    }

    return true;
  });
}
