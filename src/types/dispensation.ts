/**
 * Attendance category selected for an absence statement.
 */
export type DispensationCategory = 'dispensasi' | 'sakit';

/**
 * Session coverage granted by a competition dispensation.
 */
export type DispensationCoverage = 'full' | 'partial';

/**
 * Student delegated to an official school activity.
 */
export type DispensationStudent = {
  name: string;
  attendanceNumber: string;
  nisn: string;
  className: string;
  school: string;
  curriculum: string;
  homeroom: string;
  coach: string;
  coachPhone: string;
  requestId: string;
  status: string;
};

/**
 * Official event covered by the dispensation letter.
 */
export type DispensationEvent = {
  competition: string;
  organizer: string;
  location: string;
  startIso: string;
  endIso: string;
  startLabel: string;
  endLabel: string;
  letterNumber: string;
  letterPlaceDate: string;
  headmaster: string;
  headmasterNip: string;
  taskLine: string;
  periodLabel: string;
  digitalId: string;
  recordedAt: string;
};

/**
 * Uploaded letter of assignment or medical certificate.
 */
export type DispensationDocument = {
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  verificationNote: string;
};

/**
 * Sub-category pills shown under the category selector.
 */
export type DispensationSubcategory = {
  id: 'osn' | 'fls2n' | 'o2sn' | 'pramuka';
  label: string;
};

/**
 * Student and evidence shown in the medical certificate modal.
 */
export type MedicalCertificateStudent = {
  name: string;
  attendanceNumber: string;
  nisn: string;
  className: string;
  guardian: string;
  guardianPhone: string;
  dateLabel: string;
  sessionLabel: string;
  documentNumber: string;
  diagnosis: string;
  document: DispensationDocument;
};
