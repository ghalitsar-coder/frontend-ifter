import type {
  DisciplineCategory,
  DisciplineFilterState,
  DisciplineIncident,
  DisciplineWatchStudent,
} from '@/types/discipline';

/**
 * Standard rule catalog and point weights according to school handbook.
 */
export const mockDisciplineRules: {
  key: DisciplineCategory;
  title: string;
  subtitle: string;
  points: number;
  badgeClass: string;
}[] = [
  {
    key: 'keterlambatan',
    title: 'Terlambat Masuk',
    subtitle: 'Apel / Jam Pelajaran',
    points: 2,
    badgeClass: 'bg-surface-card text-pine-deep border border-border-subtle',
  },
  {
    key: 'seragam',
    title: 'Atribut Seragam',
    subtitle: 'Tidak Lengkap/Sesuai',
    points: 3,
    badgeClass: 'bg-surface-card text-pine-deep border border-border-subtle',
  },
  {
    key: 'tatatertib',
    title: 'Tata Tertib Kelas',
    subtitle: 'Gadget / Gaduh',
    points: 5,
    badgeClass: 'bg-amber-surface text-amber-dark border border-amber-gold/40',
  },
  {
    key: 'barang_terlarang',
    title: 'Barang Terlarang',
    subtitle: 'Rokok / Vape / Sajam',
    points: 25,
    badgeClass: 'bg-error-container text-red-700 border border-red-200',
  },
  {
    key: 'bullying',
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
    nis: '00829103',
    className: 'Kelas IX A',
    points: 42,
    statusLabel: 'Menunggu Sanksi SP1',
    riskLevel: 'tinggi',
    actionType: 'parent_call',
  },
  {
    id: 'w-2',
    name: 'Fajar Maulana',
    nis: '00829311',
    className: 'Kelas VIII A',
    points: 32,
    statusLabel: 'Ambang Panggilan 1',
    riskLevel: 'waspada',
    actionType: 'schedule_bk',
  },
  {
    id: 'w-3',
    name: 'Aldo Firmansyah',
    nis: '00829440',
    className: 'Kelas VIII B',
    points: 30,
    statusLabel: 'Baru Capai Ambang',
    riskLevel: 'tinjau',
    actionType: 'review_history',
  },
];

/**
 * Initial incidents list matching Stitch prototype.
 */
export const mockDisciplineIncidents: DisciplineIncident[] = [
  {
    id: 'inc-1',
    date: '05 Okt 2026',
    time: '07:25 WIB',
    studentName: 'Rizky Pratama',
    studentNis: '00829103',
    studentClass: 'IX A',
    studentInitials: 'RP',
    studentAvatarBg: 'bg-red-100 text-red-700 border border-red-200',
    categoryKey: 'bullying',
    categoryLabel: 'Perkelahian (+25)',
    points: 25,
    description: 'Terlibat perkelahian di area kantin belakang sekolah saat pergantian jam istirahat ke-2.',
    location: 'Kantin Belakang Gazebo',
    recorderName: 'Drs. Agus Subagyo, M.Pd.',
    recorderRole: 'Guru Piket',
    studentTotalPoints: 42,
    studentPointStatus: 'SP1 Waspada',
    status: 'tindak',
  },
  {
    id: 'inc-2',
    date: '05 Okt 2026',
    time: '09:40 WIB',
    studentName: 'Fajar Maulana',
    studentNis: '00829311',
    studentClass: 'VIII A',
    studentInitials: 'FM',
    studentAvatarBg: 'bg-amber-surface text-amber-dark border border-amber-gold/40',
    categoryKey: 'tatatertib',
    categoryLabel: 'Gadget Saat KBM (+5)',
    points: 5,
    description: 'Bermain game online di smartphone saat guru sedang menerangkan materi Matematika.',
    location: 'Ruang Kelas VIII A',
    recorderName: 'Sarah Rahma, S.Pd.',
    recorderRole: 'Wali Kelas',
    studentTotalPoints: 32,
    studentPointStatus: 'Panggilan Ortu',
    status: 'baru',
  },
  {
    id: 'inc-3',
    date: '05 Okt 2026',
    time: '06:55 WIB',
    studentName: 'Dimas Saputra',
    studentNis: '00829103',
    studentClass: 'VIII A',
    studentInitials: 'DS',
    studentAvatarBg: 'bg-pine-light text-pine-deep',
    categoryKey: 'keterlambatan',
    categoryLabel: 'Keterlambatan (+2)',
    points: 2,
    description: 'Terlambat 20 menit saat apel pagi gerbang utama dikarenakan ban motor bocor.',
    location: 'Gerbang Depan SMPN 1 Sleman',
    recorderName: 'Drs. Agus Subagyo, M.Pd.',
    recorderRole: 'Guru Piket',
    studentTotalPoints: 12,
    studentPointStatus: 'Aman',
    status: 'selesai',
  },
  {
    id: 'inc-4',
    date: '04 Okt 2026',
    time: '07:10 WIB',
    studentName: 'Aldo Firmansyah',
    studentNis: '00829440',
    studentClass: 'VIII B',
    studentInitials: 'AF',
    studentAvatarBg: 'bg-yellow-100 text-yellow-900 border border-yellow-200',
    categoryKey: 'seragam',
    categoryLabel: 'Atribut Seragam (+3)',
    points: 3,
    description: 'Tidak memakai dasi dan ikat pinggang standar SMPN 1 Sleman saat upacara bendera.',
    location: 'Lapangan Upacara',
    recorderName: 'Bambang Irawan, S.Pd.',
    recorderRole: 'Kesiswaan',
    studentTotalPoints: 30,
    studentPointStatus: 'Batas Ortu',
    status: 'tinjau',
  },
  {
    id: 'inc-5',
    date: '03 Okt 2026',
    time: '11:15 WIB',
    studentName: 'Nabila Aulia',
    studentNis: '00829801',
    studentClass: 'VII C',
    studentInitials: 'NA',
    studentAvatarBg: 'bg-pastel-mint text-pine-deep',
    categoryKey: 'keterlambatan',
    categoryLabel: 'Terlambat Masuk (+2)',
    points: 2,
    description: 'Terlambat masuk kelas setelah jam istirahat pertama selama 15 menit.',
    location: 'Lorong Lantai 2 Gedung B',
    recorderName: 'Sri Wahyuni, S.Pd.',
    recorderRole: 'Guru Mapel',
    studentTotalPoints: 4,
    studentPointStatus: 'Aman',
    status: 'selesai',
  },
  {
    id: 'inc-6',
    date: '02 Okt 2026',
    time: '08:30 WIB',
    studentName: 'Bagus Pamungkas',
    studentNis: '00829562',
    studentClass: 'VIII A',
    studentInitials: 'BP',
    studentAvatarBg: 'bg-surface-container-high text-text-primary',
    categoryKey: 'tatatertib',
    categoryLabel: 'Tata Tertib (+5)',
    points: 5,
    description: 'Meninggalkan jam pelajaran tanpa izin surat dari guru piket atau UKS.',
    location: 'Area Parkir Sepeda',
    recorderName: 'Sarah Rahma, S.Pd.',
    recorderRole: 'Wali Kelas',
    studentTotalPoints: 10,
    studentPointStatus: 'Aman',
    status: 'selesai',
  },
];

/**
 * Filter incident list based on search query, class, category, status, and quick tab.
 * @param incidents List of incidents to filter.
 * @param filter Active filter state.
 * @returns Filtered incidents array.
 */
export function filterDisciplineIncidents(
  incidents: DisciplineIncident[],
  filter: DisciplineFilterState,
): DisciplineIncident[] {
  return incidents.filter((item) => {
    // Quick Tab filter
    if (filter.quickTab === 'need_action' && item.status === 'selesai') {
      return false;
    }
    if (filter.quickTab === 'resolved' && item.status !== 'selesai') {
      return false;
    }
    if (filter.quickTab === 'high_points' && item.studentTotalPoints < 30) {
      return false;
    }

    // Class dropdown
    if (filter.selectedClass && item.studentClass !== filter.selectedClass) {
      return false;
    }

    // Category dropdown
    if (filter.selectedCategory && item.categoryKey !== filter.selectedCategory) {
      return false;
    }

    // Status dropdown
    if (filter.selectedStatus && item.status !== filter.selectedStatus) {
      return false;
    }

    // Search input
    if (filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      const matchName = item.studentName.toLowerCase().includes(q);
      const matchNis = item.studentNis.includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchLocation = item.location.toLowerCase().includes(q);
      if (!matchName && !matchNis && !matchDesc && !matchLocation) {
        return false;
      }
    }

    return true;
  });
}
