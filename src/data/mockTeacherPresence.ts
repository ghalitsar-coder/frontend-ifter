import type {
  JournalOption,
  TeacherAttendance,
  TeacherDuty,
  TeacherHistoryRow,
  TeacherPerformance,
  TeacherProfile,
  TeacherScheduleFilter,
  TeachingSession,
} from '@/types/teacherPresence';

/**
 * Signed-in teacher profile rendered in the greeting and header chips.
 */
export const mockTeacherProfile: TeacherProfile = {
  name: 'Ibu Sarah Rahma, S.Pd.',
  nip: '19880415 201201 2 004',
  role: 'Guru Ahli Pertama (Bahasa Indonesia & Wali Kelas VIII A)',
  school: 'SMP Negeri 1 Merdeka',
  academicYear: 'TP 2026/2027',
  week: 'Pekan Ke-7',
  serverTime: '09:53:50',
  serverDate: 'Senin, 5 Oktober 2026',
};

/**
 * Today's gate attendance record of the teacher.
 */
export const mockTeacherAttendance: TeacherAttendance = {
  isCheckedIn: true,
  status: 'tepat_waktu',
  checkInTime: '06:48',
  lateLimit: '07:15',
  checkoutWindow: '15:30',
  distanceMeters: 12,
  gateName: 'Kampus A',
  biometricMatch: 99.8,
};

/**
 * Monthly presence performance summary.
 */
export const mockTeacherPerformance: TeacherPerformance = {
  month: 'Oktober 2026',
  rate: 98.4,
  presentDays: 21,
  workingDays: 22,
  permitDays: 0,
  targetHours: 24,
  achievedHours: 24,
};

/**
 * Additional duty assigned for today.
 */
export const mockTeacherDuty: TeacherDuty = {
  title: 'Pembina Upacara Hari Kesaktian Pancasila & Piket Pintu Gerbang',
};

/**
 * Today's teaching schedule with classroom attendance progress.
 */
export const mockTeachingSessions: TeachingSession[] = [
  {
    id: 'sesi-1',
    slot: 'Jam 1-2',
    time: '07:30 - 09:00',
    room: 'Ruang 204 · Lantai 2',
    className: 'Kelas VIII A',
    subject: 'Bahasa Indonesia',
    topic: 'Materi: Analisis Kaidah Kebahasaan Teks Eksplanasi Fenomena Alam.',
    status: 'selesai',
    studentCount: 32,
    presentCount: 31,
    sickCount: 1,
    attendanceRate: '96.8%',
  },
  {
    id: 'sesi-2',
    slot: 'Jam 3-4',
    time: '09:15 - 10:45',
    room: 'Ruang 205 · Lab Bahasa',
    className: 'Kelas VIII B',
    subject: 'Bahasa Indonesia',
    topic: 'Materi: Menulis Teks Ulasan Cerpen Remaja dengan Pilihan Diksi Efektif.',
    status: 'berlangsung',
    studentCount: 34,
    pendingCount: 34,
    remaining: '53m',
  },
  {
    id: 'sesi-3',
    slot: 'Jam 5-6',
    time: '11:00 - 12:30',
    room: 'Ruang 301 · Gd B Lt 3',
    className: 'Kelas IX C',
    subject: 'Literasi & Bahasa',
    topic: 'Materi: Bedah Karya Puisi Kontemporer & Pementasan Monolog Singkat.',
    status: 'mendatang',
    studentCount: 32,
    moduleNote: 'Modul Ajar Bab 4 Terlampir',
  },
  {
    id: 'sesi-4',
    slot: 'Jam 7-8',
    time: '13:15 - 14:45',
    room: 'Ruang Multimedia & Podcast',
    className: 'Kelas VIII D',
    subject: 'Ekstrakurikuler',
    topic: 'Agenda: Pelatihan Teknik Wawancara Narasumber & Majalah Dinding.',
    status: 'sore',
    studentCount: 28,
  },
];

/**
 * Class choices available in the teaching journal form.
 */
export const mockJournalOptions: JournalOption[] = [
  { id: 'viii-a', label: 'Bahasa Indonesia - VIII A', state: 'selesai' },
  { id: 'viii-b', label: 'Bahasa Indonesia - VIII B', state: 'berlangsung' },
  { id: 'ix-c', label: 'Literasi & Bahasa - IX C', state: 'mendatang' },
  { id: 'viii-d', label: 'Ekstrakurikuler Jurnalistik - VIII D', state: 'sore' },
];

/**
 * Weekly teacher attendance log shown below the journal.
 */
export const mockTeacherHistory: TeacherHistoryRow[] = [
  {
    id: 'history-1',
    day: 'Senin',
    date: '5 Okt 2026',
    isToday: true,
    checkIn: '06:48',
    checkOut: '---:---',
    method: 'GPS + Wajah (Kampus A)',
    hours: '8 JP',
    status: 'tepat_waktu',
  },
  {
    id: 'history-2',
    day: 'Jumat',
    date: '2 Okt 2026',
    checkIn: '06:50',
    checkOut: '14:30',
    method: 'GPS + Wajah (Kampus A)',
    hours: '4 JP',
    status: 'tepat_waktu',
  },
  {
    id: 'history-3',
    day: 'Kamis',
    date: '1 Okt 2026',
    checkIn: '07:05',
    checkOut: '15:45',
    method: 'Dinas Luar (MGMP Kab. Sleman)',
    hours: '6 JP',
    status: 'dinas_luar',
  },
  {
    id: 'history-4',
    day: 'Rabu',
    date: '30 Sep 2026',
    checkIn: '06:42',
    checkOut: '15:35',
    method: 'GPS + Wajah (Kampus A)',
    hours: '6 JP',
    status: 'tepat_waktu',
  },
  {
    id: 'history-5',
    day: 'Selasa',
    date: '29 Sep 2026',
    checkIn: '06:55',
    checkOut: '15:30',
    method: 'GPS + Wajah (Kampus A)',
    hours: '6 JP',
    status: 'tepat_waktu',
  },
];

/**
 * Filter the teaching schedule by the selected pill.
 *
 * @param sessions - Full schedule of the day.
 * @param filter - Selected schedule filter.
 * @returns Sessions matching the filter.
 */
export function filterTeachingSessions(sessions: TeachingSession[], filter: TeacherScheduleFilter) {
  if (filter === 'all') {
    return sessions;
  }

  if (filter === 'upcoming') {
    return sessions.filter(
      (session) => session.status === 'mendatang' || session.status === 'sore',
    );
  }

  const statusByFilter = {
    ongoing: 'berlangsung',
    done: 'selesai',
  } as const;

  return sessions.filter((session) => session.status === statusByFilter[filter]);
}

/**
 * Count sessions per schedule filter for the pill labels.
 *
 * @param sessions - Full schedule of the day.
 * @returns Session counts keyed by filter.
 */
export function countTeachingSessions(sessions: TeachingSession[]) {
  return {
    all: sessions.length,
    ongoing: sessions.filter((session) => session.status === 'berlangsung').length,
    done: sessions.filter((session) => session.status === 'selesai').length,
    upcoming: sessions.filter(
      (session) => session.status === 'mendatang' || session.status === 'sore',
    ).length,
  };
}
