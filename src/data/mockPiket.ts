import type {
  ActiveCompensation,
  GateShiftInfo,
  PiketMetrics,
  UniformInfractionItem,
} from '@/types/piket';

export const INITIAL_GATE_SHIFT: GateShiftInfo = {
  shiftName: 'Shift Pagi Aktif (06:30 - 07:30 WIB)',
  timeRange: '06:30 - 07:30 WIB',
  gateName: 'Gerbang Utama Barat',
  onDutyTeachers: ['Drs. Agus Subagyo', 'Sarah Rahma, S.Pd.'],
  isGateOpen: true,
};

export const INITIAL_PIKET_METRICS: PiketMetrics = {
  totalPresent: 682,
  totalEnrolled: 748,
  onTimeCount: 668,
  lateCount: 14,
  uniformHoldCount: 5,
  activeReadersCount: 4,
  readerLatencySec: 0.2,
};

export const UNIFORM_INFRACTIONS_CATALOG: UniformInfractionItem[] = [
  {
    id: 'inf-dasi',
    label: 'Tidak memakai dasi resmi sekolah',
    points: 3,
    defaultChecked: true,
  },
  {
    id: 'inf-sabuk',
    label: 'Sabuk bukan standar sekolah',
    points: 2,
    defaultChecked: true,
  },
  {
    id: 'inf-kaos-kaki',
    label: 'Kaos kaki bukan putih / pendek semata kaki',
    points: 2,
    defaultChecked: false,
  },
  {
    id: 'inf-rambut',
    label: 'Rambut putra melampaui kerah baju',
    points: 3,
    defaultChecked: false,
  },
  {
    id: 'inf-sepatu',
    label: 'Sepatu bermotif warna-warni (non-hitam)',
    points: 3,
    defaultChecked: false,
  },
];

export const INITIAL_ACTIVE_COMPENSATIONS: ActiveCompensation[] = [
  {
    id: 'comp-1',
    studentName: 'Bagas Haryono',
    initials: 'BH',
    className: 'Kelas VIII C',
    area: 'Taman Depan Lab Sains',
    areaIcon: 'park',
    remainingMinutes: 8,
    isCompleted: false,
  },
  {
    id: 'comp-2',
    studentName: 'Surya Wijaya',
    initials: 'SW',
    className: 'Kelas VII A',
    area: 'Menata Rak Buku Perpustakaan',
    areaIcon: 'local_library',
    remainingMinutes: 12,
    isCompleted: false,
  },
  {
    id: 'comp-3',
    studentName: 'M. Azka',
    initials: 'MA',
    className: 'Kelas IX D',
    area: 'Sanitasi Lobi Administrasi',
    areaIcon: 'cleaning_services',
    remainingMinutes: 5,
    isCompleted: false,
  },
  {
    id: 'comp-4',
    studentName: 'Kirana Nabil',
    initials: 'KN',
    className: 'Kelas VIII E',
    area: 'Literasi Khusus Pos Piket (Rangkuman)',
    areaIcon: 'menu_book',
    remainingMinutes: 0,
    isCompleted: true,
  },
];

/**
 * Calculates sum of points from selected infraction items.
 * @param selectedIds - Set or array of infraction item IDs.
 * @param catalog - Catalog of infraction items.
 * @returns Total points.
 */
export function calculateInfractionPoints(
  selectedIds: string[],
  catalog: UniformInfractionItem[],
): number {
  return catalog
    .filter((item) => selectedIds.includes(item.id))
    .reduce((sum, current) => sum + current.points, 0);
}
