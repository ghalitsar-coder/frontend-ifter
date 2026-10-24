import type {
  CalendarDayInfo,
  DayAttendanceStatus,
  RekapSummaryMetrics,
  StudentMatrixRow,
} from '@/types/rekap';

/**
 * Calendar days setup for October 2026 (31 days).
 * 1 (Thu), 2 (Fri), 3 (Sat - OFF), 4 (Sun - OFF), etc.
 */
const DAY_NAMES = ['Mg', 'Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sa'];

export function generateOctober2026Days(): CalendarDayInfo[] {
  const days: CalendarDayInfo[] = [];
  for (let i = 1; i <= 31; i += 1) {
    // 2026-10-01 was Thursday (day index 4)
    const date = new Date(2026, 9, i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    days.push({
      dayNumber: i,
      dayNameShort: DAY_NAMES[dayOfWeek] ?? '',
      isWeekend,
    });
  }
  return days;
}

export const OCTOBER_2026_DAYS = generateOctober2026Days();
export const OCTOBER_EFFECTIVE_DAYS = OCTOBER_2026_DAYS.filter((d) => !d.isWeekend).length; // 22 days

export function calculateAggregates(
  attendanceByDay: Record<number, DayAttendanceStatus>,
  effectiveDays = 22,
) {
  let hadir = 0;
  let terlambat = 0;
  let sakit = 0;
  let izin = 0;
  let alpa = 0;

  for (const status of Object.values(attendanceByDay)) {
    if (status === 'H') {
      hadir += 1;
    } else if (status === 'T') {
      terlambat += 1;
    } else if (status === 'S') {
      sakit += 1;
    } else if (status === 'I') {
      izin += 1;
    } else if (status === 'A') {
      alpa += 1;
    }
  }

  // Hadir + Terlambat counts towards physical presence
  const presenceCount = hadir + terlambat;
  const percentage =
    effectiveDays > 0 ? Math.round((presenceCount / effectiveDays) * 1000) / 10 : 0;

  let raporStatus: 'safe' | 'warning' | 'critical' = 'safe';
  if (alpa >= 2 || percentage < 85) {
    raporStatus = 'critical';
  } else if (alpa >= 1 || percentage < 92 || sakit + izin >= 4) {
    raporStatus = 'warning';
  }

  return {
    totalHadir: hadir,
    totalTerlambat: terlambat,
    totalSakit: sakit,
    totalIzin: izin,
    totalAlpa: alpa,
    percentage,
    raporStatus,
  };
}

function buildStudentRow(data: {
  id: string;
  nis: string;
  name: string;
  initials: string;
  gender: 'L' | 'P';
  phoneGuardian: string;
  overrides?: Partial<Record<number, DayAttendanceStatus>>;
}): StudentMatrixRow {
  const attendanceByDay: Record<number, DayAttendanceStatus> = {};

  for (const day of OCTOBER_2026_DAYS) {
    attendanceByDay[day.dayNumber] = day.isWeekend ? 'L' : (data.overrides?.[day.dayNumber] ?? 'H');
  }

  const aggregates = calculateAggregates(attendanceByDay, OCTOBER_EFFECTIVE_DAYS);

  return {
    id: data.id,
    nis: data.nis,
    name: data.name,
    initials: data.initials,
    gender: data.gender,
    className: 'Kelas VIII A',
    phoneGuardian: data.phoneGuardian,
    attendanceByDay,
    ...aggregates,
  };
}

export const MOCK_STUDENT_MATRIX_ROWS: StudentMatrixRow[] = [
  buildStudentRow({
    id: 'std-1',
    nis: '0087412948',
    name: 'Rizky Pratama',
    initials: 'RP',
    gender: 'L',
    phoneGuardian: '+62 812-4491-0021',
    overrides: { 5: 'T', 8: 'S', 13: 'T', 23: 'T' },
  }),
  buildStudentRow({
    id: 'std-2',
    nis: '0086391024',
    name: 'Dimas Saputra',
    initials: 'DS',
    gender: 'L',
    phoneGuardian: '+62 811-2309-8821',
    overrides: { 7: 'S', 8: 'S', 14: 'I', 21: 'A' },
  }),
  buildStudentRow({
    id: 'std-3',
    nis: '0085129841',
    name: 'Fajar Maulana',
    initials: 'FM',
    gender: 'L',
    phoneGuardian: '+62 856-7819-3312',
    overrides: { 6: 'A', 9: 'T', 19: 'A', 22: 'S' },
  }),
  buildStudentRow({
    id: 'std-4',
    nis: '0089201942',
    name: 'Aisyah Putri Rahmadhani',
    initials: 'AP',
    gender: 'P',
    phoneGuardian: '+62 813-8821-4501',
    overrides: { 15: 'I' },
  }),
  buildStudentRow({
    id: 'std-5',
    nis: '0083948192',
    name: 'Bima Satria Wicaksana',
    initials: 'BS',
    gender: 'L',
    phoneGuardian: '+62 878-1920-3341',
    overrides: { 12: 'T' },
  }),
  buildStudentRow({
    id: 'std-6',
    nis: '0084019283',
    name: 'Cantika Dewi Lestari',
    initials: 'CD',
    gender: 'P',
    phoneGuardian: '+62 812-9901-2244',
  }),
  buildStudentRow({
    id: 'std-7',
    nis: '0085918273',
    name: 'Daffa Raihan Al-Farizi',
    initials: 'DR',
    gender: 'L',
    phoneGuardian: '+62 857-1192-8877',
    overrides: { 2: 'T', 20: 'S' },
  }),
  buildStudentRow({
    id: 'std-8',
    nis: '0086910294',
    name: 'Eka Nur Halizah',
    initials: 'EN',
    gender: 'P',
    phoneGuardian: '+62 813-9090-1122',
    overrides: { 16: 'I' },
  }),
  buildStudentRow({
    id: 'std-9',
    nis: '0087019284',
    name: 'Farhan Dwi Ramadhan',
    initials: 'FD',
    gender: 'L',
    phoneGuardian: '+62 821-4455-6677',
  }),
  buildStudentRow({
    id: 'std-10',
    nis: '0088192847',
    name: 'Gita Permata Sari',
    initials: 'GP',
    gender: 'P',
    phoneGuardian: '+62 812-7788-9900',
    overrides: { 26: 'T' },
  }),
  buildStudentRow({
    id: 'std-11',
    nis: '0089203948',
    name: 'Hafiz Maulana Syarif',
    initials: 'HM',
    gender: 'L',
    phoneGuardian: '+62 858-1234-5678',
    overrides: { 5: 'S', 6: 'S' },
  }),
  buildStudentRow({
    id: 'std-12',
    nis: '0081029384',
    name: 'Indah Kusuma Wardani',
    initials: 'IK',
    gender: 'P',
    phoneGuardian: '+62 813-2345-6789',
  }),
  buildStudentRow({
    id: 'std-13',
    nis: '0082109384',
    name: 'Jovan Ardiansyah',
    initials: 'JA',
    gender: 'L',
    phoneGuardian: '+62 877-3456-7890',
    overrides: { 27: 'T' },
  }),
  buildStudentRow({
    id: 'std-14',
    nis: '0083210948',
    name: 'Kirana Larasati',
    initials: 'KL',
    gender: 'P',
    phoneGuardian: '+62 812-4567-8901',
    overrides: { 8: 'I', 9: 'I' },
  }),
  buildStudentRow({
    id: 'std-15',
    nis: '0084321095',
    name: 'Lutfi Hakim',
    initials: 'LH',
    gender: 'L',
    phoneGuardian: '+62 856-5678-9012',
  }),
  buildStudentRow({
    id: 'std-16',
    nis: '0085432106',
    name: 'Mega Utami Putri',
    initials: 'MU',
    gender: 'P',
    phoneGuardian: '+62 813-6789-0123',
    overrides: { 29: 'S' },
  }),
];

export const MOCK_REKAP_SUMMARY: RekapSummaryMetrics = {
  effectiveDays: 22,
  classAveragePercentage: 96.8,
  classAverageDelta: 1.2,
  totalSakit: 14,
  totalIzin: 9,
  totalAlpa: 3,
  totalTerlambat: 11,
  totalStudents: 32,
};

/**
 * Filter student matrix rows by search query and rapor status.
 * @param rows - All matrix rows.
 * @param search - Free-text search over name and NIS.
 * @param filterStatus - Rapor status bucket, or 'all'.
 * @returns Rows matching both filters.
 */
export function filterMatrixRows(
  rows: StudentMatrixRow[],
  search: string,
  filterStatus: 'all' | 'safe' | 'warning' | 'critical',
): StudentMatrixRow[] {
  const query = search.trim().toLowerCase();

  return rows.filter((row) => {
    const matchesSearch =
      query === '' || row.name.toLowerCase().includes(query) || row.nis.includes(query);

    const matchesStatus = filterStatus === 'all' || row.raporStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });
}

/**
 * Generate a CSV format string for exporting the attendance matrix.
 * @param rows - Matrix rows to serialize.
 * @param days - Calendar days that become CSV columns.
 * @returns CSV document text.
 */
export function generateCsvExport(rows: StudentMatrixRow[], days: CalendarDayInfo[]): string {
  const header = [
    'No',
    'NIS',
    'Nama Lengkap',
    'L/P',
    ...days.map((d) => `Tgl ${d.dayNumber}`),
    'Hadir (H)',
    'Terlambat (T)',
    'Sakit (S)',
    'Izin (I)',
    'Alpa (A)',
    '% Kehadiran',
    'Status Rapor',
  ].join(',');

  const lines = rows.map((row, index) => {
    const dayCells = days.map((d) => row.attendanceByDay[d.dayNumber] ?? '-');
    return [
      index + 1,
      `"${row.nis}"`,
      `"${row.name}"`,
      row.gender,
      ...dayCells,
      row.totalHadir,
      row.totalTerlambat,
      row.totalSakit,
      row.totalIzin,
      row.totalAlpa,
      `"${row.percentage}%"`,
      row.raporStatus,
    ].join(',');
  });

  return [header, ...lines].join('\n');
}
