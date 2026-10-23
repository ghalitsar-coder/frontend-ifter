import type {
  ActiveCompensation,
  GateFilterOptions,
  GateShiftInfo,
  PiketMetrics,
  RfidTapLog,
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

export const INITIAL_RFID_TAP_LOGS: RfidTapLog[] = [
  {
    id: 'tap-1',
    nis: '232408102',
    studentName: 'Rizky Pratama',
    className: 'Kelas VIII A',
    photoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuChqnUEmKbQ8DXYEi6IV8gvd5dScXcv1MKg1Jm7HPU-lYtqtf2rMe0awHo7ly6KjjUSIOqbdhNDJh5DuEX_f2OL-FSUafiCv9beytJqyjeKzYS3C8nua4fbIN8IbaFgDolBGXHBvUkKFsPh1EE1tdq9ho2wVo6iySiwnRVy_O0z5Fbr6tNxyZqnVEclwu_4aIfj8GfxbD3oQ_O3iqTo7t00nrQA2fmh56DwJUKsK8s1YrKqjVbZMuOV7g',
    tapTime: '07:06:14 WIB',
    status: 'late',
    readerId: 'reader-1',
    readerName: 'Gerbang Reader 1',
    delayMinutes: 6,
    pointPenalty: 2,
    compensationTask: '10 mnt piket taman',
    isUniformComplete: true,
  },
  {
    id: 'tap-2',
    nis: '232408044',
    studentName: 'Dimas Saputra',
    className: 'Kelas VIII A',
    photoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCP3Q5KAlHaSR5M3SMcQ4R8XXq2zWJhN-fDRd7Um-dC2umSfw9SzenHV1GKouoSFCLgePjbd5MWaZ-tRWn0Wpnq8NivfLvlKhKi8aKQT__mKLtDEhxV4IytxKdvQcv33sYP_Jzm7KL8wrjDm9csbv13TSAfrpXKtYib9ekRPFOv6PHRaCJhXpl0A5i2LxM77bb40Au_jJGZPQDlFakGTawjg7eB_276PJeF569Rid57tFuCEhxJT4tSmw',
    tapTime: '06:58:32 WIB',
    status: 'on_time',
    readerId: 'reader-2',
    readerName: 'Gerbang Reader 2',
    delayMinutes: 0,
    pointPenalty: 0,
    isUniformComplete: true,
  },
  {
    id: 'tap-3',
    nis: '242507019',
    studentName: 'Aldo Firmansyah',
    className: 'Kelas VII C',
    photoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDELO176h6y9PYcNN18UHDSJPpyZBUvPlZvXf0aLrQoRtz2c0qK60adSQ0iuV169fH3-NShlyOrW2RZASsHrESNszvLpEAejGuqazw49ugJkZ2xnD-y08E7ArvHowCI5fnW58uHpEKqtU7S454Kh-4fQH3C7U7i1cICHKWHngr0nBPXXr7SY2rQJIOztzCOX7yKsdX8W_9YVlRDUaMGnLng6XanohihvLTZauW_OccWRSDO2iM3rmU2YQ',
    tapTime: '07:04:11 WIB',
    status: 'late',
    readerId: 'reader-1',
    readerName: 'Gerbang Reader 1',
    delayMinutes: 4,
    pointPenalty: 2,
    compensationTask: 'Proses Tiket Piket',
    isUniformComplete: false,
  },
  {
    id: 'tap-4',
    nis: '232408077',
    studentName: 'Fajar Maulana',
    className: 'Kelas VIII A',
    photoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBLUViR1L6H0tE4HJfXmkE9cQXlG5aYAemlOiQOSk_89aEF6miTjiAntx3FbPm6rW6QhGnl6N4MNH_uET0tx7bUTdHQP4c47b8RLpfIm9jVseOzJ3OOzt3BPgkpEA8UDDqMY0JCpbOHnM3TpeI_h-7BcCJ7cMHdT_3J0mobPlI13VyX7-NiPMWGJDcRYA1W3gcENBW4bFSUj63rLT_JcaNoJ97H-yNFeZ1Xto6rxHBKAr-7WmIJGUhcjQ',
    tapTime: '06:55:09 WIB',
    status: 'on_time',
    readerId: 'reader-1',
    readerName: 'Gerbang Reader 1',
    delayMinutes: 0,
    pointPenalty: 0,
    isUniformComplete: true,
  },
  {
    id: 'tap-5',
    nis: '232408012',
    studentName: 'Anisa Safitri',
    className: 'Kelas VIII B',
    photoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBO0Xrp_4p-ctFbTHjjz8NdACTkO-CRE_pikwcaHR3HQtX4VCCfDwd_QE7OutmflDa9m2Z4sPFZZyBDvUNsvTeGMx6YKTrgVMtvXvxAuDMFSpgw6sGxNSRIGqnaYLbriK93FSN7kmD8CvWuFTlb520SVs8TeQp1Z8J-CU2MoN73rFif6NfW-gpkVVmbALvAj4gSVo4GWUwl_ywLrRqXV7bcHE4bkVIrh6nfPCu92tCRkPMy3VPScA2N5Q',
    tapTime: '06:52:48 WIB',
    status: 'on_time',
    readerId: 'reader-3',
    readerName: 'Gerbang Reader 3',
    delayMinutes: 0,
    pointPenalty: 0,
    isUniformComplete: true,
  },
  {
    id: 'tap-6',
    nis: '222309115',
    studentName: 'Alya Putri',
    className: 'Kelas IX B',
    photoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCaYQg-c649wzP-sV5tzgrE8GH9oAkiWw77deJkfSS-mCNITHiMEMPn-jNjfxeVPKk81h7MJp8CgCfSX3ADeAZ3hZwOjKnsujMAqmg22gyx_LO9EsuXj1Oj9DQD0UsKMSdiBF6htc6kBZS4tCeCb7cXTKmqbDg1WwTdX6ujATDACFQYVPn6b7BKx8tbEyj9jXjeHMXVn0fENkFi2bTU3L0663rooUFNh0lhhxGF2QXk4uAW0Nhkynwtkg',
    tapTime: '06:48:10 WIB',
    status: 'on_time',
    readerId: 'reader-1',
    readerName: 'Gerbang Reader 1',
    delayMinutes: 0,
    pointPenalty: 0,
    isUniformComplete: true,
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
 * Filter tap logs based on search keyword and status filter.
 * @param logs - Array of tap logs.
 * @param options - Filter options.
 * @returns Filtered tap logs array.
 */
export function filterTapLogs(logs: RfidTapLog[], options: GateFilterOptions): RfidTapLog[] {
  return logs.filter((item) => {
    const matchSearch =
      options.searchKeyword.trim() === '' ||
      item.studentName.toLowerCase().includes(options.searchKeyword.toLowerCase()) ||
      item.nis.includes(options.searchKeyword) ||
      item.className.toLowerCase().includes(options.searchKeyword.toLowerCase());

    const matchClass =
      options.classFilter === 'all' ||
      item.className.toLowerCase().includes(options.classFilter.toLowerCase());

    const matchStatus = options.statusFilter === 'all' || item.status === options.statusFilter;

    return matchSearch && matchClass && matchStatus;
  });
}

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
