/**
 * Identity of the signed-in teacher shown on the presence portal.
 */
export type TeacherProfile = {
  name: string;
  nip: string;
  role: string;
  school: string;
  academicYear: string;
  week: string;
  serverTime: string;
  serverDate: string;
};

/**
 * Today's gate attendance state for the teacher.
 */
export type TeacherAttendance = {
  isCheckedIn: boolean;
  status: 'tepat_waktu' | 'terlambat' | 'belum';
  checkInTime: string;
  lateLimit: string;
  checkoutWindow: string;
  distanceMeters: number;
  gateName: string;
  biometricMatch: number;
};

/**
 * Monthly teacher presence performance metrics.
 */
export type TeacherPerformance = {
  month: string;
  rate: number;
  presentDays: number;
  workingDays: number;
  permitDays: number;
  targetHours: number;
  achievedHours: number;
};

/**
 * Additional duty assigned to the teacher for the day.
 */
export type TeacherDuty = {
  title: string;
};

/**
 * Delivery mode of a single teaching session.
 */
export type TeachingSessionStatus = 'selesai' | 'berlangsung' | 'mendatang' | 'sore';

/**
 * One scheduled teaching session with classroom attendance context.
 */
export type TeachingSession = {
  id: string;
  slot: string;
  time: string;
  room: string;
  className: string;
  subject: string;
  topic: string;
  status: TeachingSessionStatus;
  studentCount: number;
  presentCount?: number;
  sickCount?: number;
  attendanceRate?: string;
  pendingCount?: number;
  remaining?: string;
  moduleNote?: string;
};

/**
 * Journal class option for the daily teaching log.
 */
export type JournalOption = {
  id: string;
  label: string;
  state: TeachingSessionStatus;
};

/**
 * One row of the weekly teacher attendance history.
 */
export type TeacherHistoryRow = {
  id: string;
  day: string;
  date: string;
  isToday?: boolean;
  checkIn: string;
  checkOut: string;
  method: string;
  hours: string;
  status: 'tepat_waktu' | 'dinas_luar';
};

/**
 * Schedule filter selection above the teaching session cards.
 */
export type TeacherScheduleFilter = 'all' | 'ongoing' | 'done' | 'upcoming';
