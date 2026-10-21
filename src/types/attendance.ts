/**
 * Valid attendance status categories.
 */
export type AttendanceStatus = 'hadir' | 'sakit' | 'izin' | 'alpa';

/**
 * Filter categories for student roster.
 */
export type AttendanceFilter = 'all' | AttendanceStatus;

/**
 * Single student attendance record item.
 */
export type StudentAttendanceRecord = {
  id: string;
  name: string;
  nisn: string;
  absentNumber: number;
  initials: string;
  avatarBg: string;
  status: AttendanceStatus;
  timestamp: string;
  source: string;
  notes: string;
  documentName?: string;
  documentTitle?: string;
  documentClinic?: string;
  documentDoctor?: string;
  documentDate?: string;
};

/**
 * Document preview payload for modal inspection.
 */
export type DocumentPreviewData = {
  title: string;
  documentName: string;
  studentName: string;
  clinic?: string;
  doctor?: string;
  date?: string;
};
