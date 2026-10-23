/**
 * Attendance code recorded for a student session.
 */
export type AttendanceStatus = 'alpa' | 'izin' | 'sakit' | 'hadir' | 'dispensasi';

/**
 * Verification state of an attendance correction request.
 */
export type CorrectionVerification = 'validated' | 'pending';

/**
 * Change filter options above the audit table.
 */
export type CorrectionChangeFilter =
  | 'all'
  | 'alpa_sakit'
  | 'alpa_izin'
  | 'izin_hadir'
  | 'dispensasi';

/**
 * Student identity attached to an audit entry.
 */
export type CorrectionStudent = {
  name: string;
  nis: string;
  className: string;
};

/**
 * Staff member who submitted or verified the correction.
 */
export type CorrectionOfficer = {
  name: string;
  role: string;
};

/**
 * Supporting document uploaded with the correction request.
 */
export type CorrectionAttachment = {
  fileName: string;
  fileSize: string;
};

/**
 * One immutable entry in the attendance correction audit log.
 */
export type CorrectionLog = {
  id: string;
  loggedDate: string;
  loggedTime: string;
  student: CorrectionStudent;
  sessionDate: string;
  sessionLabel: string;
  fromStatus: AttendanceStatus;
  toStatus: AttendanceStatus;
  toNote: string;
  reason: string;
  attachment?: CorrectionAttachment;
  confirmationNote?: string;
  officer: CorrectionOfficer;
  verification: CorrectionVerification;
};

/**
 * Monthly recap counters shown in the hero statistics row.
 */
export type CorrectionStats = {
  month: string;
  totalRequests: number;
  previousMonthTotal: number;
  deltaPercent: number;
  approved: number;
  approvedPercent: number;
  pending: number;
  pendingDeadline: string;
  accuracy: number;
};

/**
 * Filter criteria applied to the audit log table.
 */
export type CorrectionFilterState = {
  search: string;
  change: CorrectionChangeFilter;
  className: string;
};

/**
 * Attendance codes selectable in the correction request matrix.
 */
export type CorrectionStatusOption = {
  id: AttendanceStatus;
  note: string;
};
