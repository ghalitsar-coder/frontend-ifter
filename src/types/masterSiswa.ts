/**
 * Academic grade levels.
 */
export type GradeLevel = 'VII' | 'VIII' | 'IX';

/**
 * Student status categories.
 */
type StudentStatus = 'active' | 'mutation' | 'alumni';

/**
 * Filter grade options.
 */
export type GradeFilter = 'all' | GradeLevel;

/**
 * Filter status options.
 */
export type StatusFilter = 'all' | StudentStatus;

/**
 * Daily recent attendance log item.
 */
type StudentRecentLog = {
  id: string;
  date: string;
  status: 'hadir' | 'sakit' | 'izin' | 'alpa';
  time: string;
  method: string;
  note?: string;
};

/**
 * Guardian or parent contact details.
 */
type StudentGuardian = {
  name: string;
  relation: string;
  phone: string;
  address: string;
};

/**
 * Comprehensive student master data profile.
 */
export type StudentProfile = {
  id: string;
  nis: string;
  nisn: string;
  nik?: string;
  name: string;
  callingName?: string;
  gender: 'L' | 'P';
  pob: string;
  dob: string;
  religion: string;
  grade: GradeLevel;
  className: string;
  absentNumber: number;
  homeroomTeacher: string;
  semesterAttendanceRate: number;
  attendanceCategory: 'Hadir Prima' | 'Normal' | 'Cukup' | 'Perlu Perhatian';
  totalLateCount?: number;
  disciplinePoints: number;
  disciplineStage?: string;
  status: StudentStatus;
  avatarUrl?: string;
  rfidUid?: string;
  guardian: StudentGuardian;
  homeroomNotes?: string;
  recentLogs?: StudentRecentLog[];
};

/**
 * Rombongan Belajar (class group) target option.
 */
export type RombelOption = {
  id: string;
  name: string;
  grade: GradeLevel;
  homeroomTeacher: string;
  currentCount: number;
  capacity: number;
};
