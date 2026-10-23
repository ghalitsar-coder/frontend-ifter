/**
 * Types and interfaces for Monthly Attendance Matrix & Report module.
 */

export type DayAttendanceStatus = 'H' | 'T' | 'S' | 'I' | 'A' | 'L';

export type StudentMatrixRow = {
  id: string;
  nis: string;
  name: string;
  initials: string;
  gender: 'L' | 'P';
  className: string;
  phoneGuardian: string;
  attendanceByDay: Record<number, DayAttendanceStatus>;
  totalHadir: number;
  totalTerlambat: number;
  totalSakit: number;
  totalIzin: number;
  totalAlpa: number;
  percentage: number;
  raporStatus: 'safe' | 'warning' | 'critical';
};

export type RekapSummaryMetrics = {
  effectiveDays: number;
  classAveragePercentage: number;
  classAverageDelta: number;
  totalSakit: number;
  totalIzin: number;
  totalAlpa: number;
  totalTerlambat: number;
  totalStudents: number;
};

export type CalendarDayInfo = {
  dayNumber: number;
  dayNameShort: string;
  isWeekend: boolean;
  isHoliday?: boolean;
};

export type BroadcastTargetType = 'all' | 'critical' | 'custom';

export type WhatsAppBroadcastPayload = {
  targetType: BroadcastTargetType;
  selectedStudentIds: string[];
  customNote?: string;
  sendCopyHomeroomTeacher: boolean;
};
