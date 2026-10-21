/**
 * Teacher employment status.
 */
export type EmploymentStatus = 'PNS' | 'PPPK' | 'Guru Honorer' | 'GTY';

/**
 * System access level for teachers.
 */
export type AccessLevel = 'teacher' | 'homeroom' | 'admin';

/**
 * Picket gate assignment details.
 */
export type PicketAssignment = {
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  postName: string;
  postLocation: string;
  checkInTime?: string;
  isCheckedIn: boolean;
};

/**
 * Full teacher & academic staff (PTK) profile.
 */
export type TeacherProfile = {
  id: string;
  nip: string;
  nuptk?: string;
  nik?: string;
  name: string;
  gender: 'L' | 'P';
  email: string;
  phone: string;
  employmentStatus: EmploymentStatus;
  subject: string;
  teachingHoursPerWeek: number;
  roles: string[];
  homeroomClass?: {
    className: string;
    studentCount: number;
  };
  picketDuty?: PicketAssignment;
  accessLevel: AccessLevel;
  status: 'active' | 'leave' | 'inactive';
  rfidUid?: string;
  avatarUrl?: string;
};

/**
 * Role filter options for toolbar tabs.
 */
export type RoleFilter = 'all' | 'homeroom' | 'picket' | 'admin';

/**
 * Picket post operational summary.
 */
export type PicketPostSummary = {
  id: string;
  postNumber: string;
  name: string;
  location: string;
  officerName: string;
  officerInitial: string;
  dutyRole: string;
  checkInTime: string;
  isCheckedIn: boolean;
};

/**
 * Imported Excel row validation result.
 */
export type ExcelValidationRow = {
  rowNumber: number;
  name: string;
  nip: string;
  subject: string;
  status: EmploymentStatus;
  homeroom: string;
  isValid: boolean;
  errorReason?: string;
};
