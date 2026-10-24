/**
 * Shared DTO types mirroring the Go backend JSON (snake_case fields).
 * Source of truth: internal/transport/http/{auth,masterdata,attendance,discipline,imports,reporting}.go
 * plus the domain `types.go` files under internal/ in the backend repo.
 */

// ---------------------------------------------------------------------------
// Auth & users
// ---------------------------------------------------------------------------
export type UserRole = 'admin' | 'teacher' | 'duty_teacher' | 'principal';

export type ApiUser = {
  id: string;
  username: string;
  email?: string;
  full_name: string;
  roles: UserRole[];
};

/** POST /auth/login, POST /auth/refresh response. */
export type AuthSession = {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  user: ApiUser;
};

/** GET /auth/me response. */
export type MeResponse = {
  user: ApiUser;
};

export type UserSummary = {
  id: string;
  username: string;
  email?: string;
  full_name: string;
  status: string;
  last_login_at?: string;
  created_at: string;
};

export type ApiRole = {
  id: string;
  name: string;
  description?: string;
};

export type CredentialIssue = {
  token: string;
  purpose: string;
  expires_at: string;
};

/** POST /users response (201). */
export type CreateUserResponse = {
  user: UserSummary;
  credential: CredentialIssue;
};

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
/** Standard paginated list envelope `{ data, total, limit, offset }`. */
export type Paginated<T> = {
  data: T[];
  total: number;
  limit: number;
  offset: number;
};

/** Some list endpoints return only `{ data }` (e.g. /academic-years, /terms). */
export type DataList<T> = {
  data: T[];
};

// ---------------------------------------------------------------------------
// Masterdata
// ---------------------------------------------------------------------------
export type AcademicYear = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Term = {
  id: string;
  academic_year_id: string;
  term_number: number;
  name: string;
  start_date: string;
  end_date: string;
};

export type Class = {
  id: string;
  academic_year_id: string;
  academic_year_name: string;
  name: string;
  grade_level: number;
  major?: string;
  status: string;
  homeroom_teacher_id?: string;
  homeroom_teacher_name?: string;
  created_at: string;
  updated_at: string;
};

export type HomeroomAssignment = {
  id: string;
  teacher_id: string;
  teacher_name: string;
  class_id: string;
  start_date: string;
  end_date?: string;
  created_at: string;
};

export type Teacher = {
  id: string;
  user_id?: string;
  employee_number?: string;
  full_name: string;
  email?: string;
  phone?: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ClassRef = {
  id: string;
  name: string;
};

export type Student = {
  id: string;
  student_number: string;
  national_student_number?: string;
  full_name: string;
  gender?: string;
  birth_date?: string;
  admission_year: number;
  status: string;
  guardian_name?: string;
  guardian_phone?: string;
  current_class?: ClassRef;
  created_at: string;
  updated_at: string;
};

export type Enrollment = {
  id: string;
  class_id: string;
  class_name: string;
  academic_year_id: string;
  academic_year_name: string;
  start_date: string;
  end_date?: string;
};

/** GET /students/:id response adds enrollments[]. */
export type StudentDetail = Student & {
  enrollments: Enrollment[];
};

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------
export type AttendanceStatus = 'present' | 'late' | 'sick' | 'excused' | 'absent';

export type AttendanceClassRef = {
  id: string;
  name: string;
  academic_year_id: string;
  academic_year_name: string;
};

export type AttendanceRecord = {
  id: string;
  student_id: string;
  enrollment_id: string;
  date: string;
  status: AttendanceStatus;
  check_in_at?: string;
  notes?: string;
  source: string;
  recorded_by_user_id: string;
  updated_by_user_id: string;
  created_at: string;
  updated_at: string;
  student_number?: string;
  student_name?: string;
  class_id?: string;
  class_name?: string;
};

export type AttendanceClosure = {
  id: string;
  class_id: string;
  date: string;
  close_type: string;
  closed_by_user_id: string;
  closed_by_name: string;
  closed_at: string;
  absent_filled: number;
};

export type RosterSummary = {
  total: number;
  recorded: number;
  unrecorded: number;
  present: number;
  late: number;
  sick: number;
  excused: number;
  absent: number;
};

export type RosterStudent = {
  student_id: string;
  student_number: string;
  full_name: string;
  enrollment_id: string;
  record?: AttendanceRecord;
};

/** GET /attendance/roster and POST /attendance/bulk response. */
export type Roster = {
  class: AttendanceClassRef;
  date: string;
  effective: boolean;
  closure?: AttendanceClosure;
  summary: RosterSummary;
  students: RosterStudent[];
};

export type BulkAttendanceInput = {
  class_id: string;
  date: string;
  records: {
    student_id: string;
    status: AttendanceStatus;
    check_in_at?: string;
    notes?: string;
  }[];
};

export type CloseAttendanceInput = {
  class_id: string;
  date?: string;
};

export type CloseResult = {
  closure: AttendanceClosure;
  summary: RosterSummary;
};

export type HistoryRecord = {
  id: string;
  date: string;
  status: AttendanceStatus;
  check_in_at?: string;
  notes?: string;
  source: string;
  student_id: string;
  student_number: string;
  student_name: string;
  class_id: string;
  class_name: string;
  academic_year_id: string;
  academic_year_name: string;
  closed: boolean;
  created_at: string;
  updated_at: string;
};

export type AttendanceSummaryItem = {
  student_id: string;
  student_number: string;
  student_name: string;
  class_id: string;
  class_name: string;
  total_days: number;
  present: number;
  late: number;
  sick: number;
  excused: number;
  absent: number;
  attendance_percentage: number;
};

export type AttendanceSummaryTotals = {
  students: number;
  total_days: number;
  present: number;
  late: number;
  sick: number;
  excused: number;
  absent: number;
  attendance_percentage: number;
};

export type AttendanceSummaryResponse = {
  from: string;
  to: string;
  data: AttendanceSummaryItem[];
  totals: AttendanceSummaryTotals;
};

export type AttendanceCorrection = {
  id: string;
  attendance_record_id: string;
  old_status: string;
  new_status: string;
  old_check_in_at?: string;
  new_check_in_at?: string;
  old_notes?: string;
  new_notes?: string;
  reason: string;
  corrected_by_user_id: string;
  corrected_at: string;
};

export type AttendanceRecordDetail = AttendanceRecord & {
  corrections: AttendanceCorrection[];
};

export type AttendanceSchedule = {
  weekday: number;
  start_time: string;
  late_tolerance_minutes: number;
};

export type AttendanceHoliday = {
  holiday_date: string;
  name: string;
  created_at: string;
};

export type AttendanceSettings = {
  school_name: string;
  timezone: string;
  attendance_auto_close_time: string;
  updated_at: string;
  schedules: AttendanceSchedule[];
  holidays: AttendanceHoliday[];
};

export type DutyAssignment = {
  id: string;
  teacher_id: string;
  teacher_name: string;
  weekday: number;
  start_date: string;
  end_date?: string;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Discipline
// ---------------------------------------------------------------------------
export type DisciplineCategory = {
  id: string;
  code?: string;
  name: string;
  description?: string;
  default_points?: number;
  auto_on_attendance_status?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type DisciplineRecord = {
  id: string;
  student_id: string;
  student_number: string;
  student_name: string;
  class_id: string;
  class_name: string;
  category_id: string;
  category_name: string;
  occurred_at: string;
  occurred_date: string;
  description: string;
  points: number;
  status: string;
  attendance_record_id?: string;
  recorded_by_user_id: string;
  recorded_by_name: string;
  created_at: string;
  updated_at: string;
};

export type DisciplineFollowup = {
  id: string;
  discipline_record_id: string;
  status: string;
  notes?: string;
  updated_by_user_id: string;
  updated_by_name: string;
  created_at: string;
};

export type DisciplineRecordDetail = DisciplineRecord & {
  followups: DisciplineFollowup[];
};

export type DisciplineCategorySummary = {
  category_id: string;
  category_name: string;
  count: number;
  points: number;
};

/** GET /discipline/students/:id response. */
export type StudentDisciplineProfile = {
  student_id: string;
  student_number: string;
  student_name: string;
  total_points: number;
  total_records: number;
  categories: DisciplineCategorySummary[];
  records: DisciplineRecord[];
};

/** GET /reports/discipline response. */
export type DisciplineReport = {
  from?: string;
  to?: string;
  total_records: number;
  cancelled_records: number;
  total_points: number;
  by_category: DisciplineCategorySummary[];
  by_status: { status: string; count: number }[];
  data: DisciplineRecord[];
};

// ---------------------------------------------------------------------------
// Imports & exports
// ---------------------------------------------------------------------------
export type ImportEntityType = 'students' | 'teachers';
export type ImportMode = 'create_only' | 'upsert';

export type ImportJob = {
  id: string;
  entity_type: ImportEntityType;
  import_mode: ImportMode;
  original_filename: string;
  status: string;
  total_rows: number;
  valid_rows: number;
  duplicate_rows: number;
  invalid_rows: number;
  success_rows: number;
  created_at: string;
  validated_at?: string;
  confirmed_at?: string;
  completed_at?: string;
};

export type ImportPreviewRow = {
  row_number: number;
  action: string;
  key: string;
  name: string;
  class_name?: string;
  changed_fields?: string[];
};

export type ImportErrorRow = {
  row_number: number;
  column?: string;
  code: string;
  message: string;
};

/** POST /imports/:entity response (201). */
export type ImportUploadResponse = {
  job: ImportJob;
  preview: ImportPreviewRow[];
  errors: ImportErrorRow[];
};

/** GET /imports/:id response (bare, no wrapper). */
export type ImportDetailResponse = {
  job: ImportJob;
  preview?: ImportPreviewRow[];
  errors: ImportErrorRow[];
};

/** POST /imports/:id/confirm response. */
export type ImportConfirmResponse = {
  import: ImportJob;
};

// ---------------------------------------------------------------------------
// Dashboard & audit
// ---------------------------------------------------------------------------
export type DashboardAttendance = {
  total_students: number;
  recorded: number;
  unrecorded: number;
  present: number;
  late: number;
  sick: number;
  excused: number;
  absent: number;
};

export type DashboardDiscipline = {
  records_today: number;
  records_month: number;
  points_month: number;
  new_records: number;
};

export type DashboardTrendPoint = {
  date: string;
  recorded: number;
  present: number;
  late: number;
  sick: number;
  excused: number;
  absent: number;
};

export type DashboardLateStudent = {
  student_id: string;
  student_number: string;
  student_name: string;
  class_id: string;
  class_name: string;
  check_in_at?: string;
};

export type DashboardUnrecordedStudent = {
  student_id: string;
  student_number: string;
  student_name: string;
  class_id: string;
  class_name: string;
};

export type AuditLog = {
  id: string;
  actor_user_id?: string;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  request_id?: string;
  before_data?: unknown;
  after_data?: unknown;
  reason?: string;
  created_at: string;
};

/** GET /dashboard response. */
export type DashboardData = {
  date: string;
  role: string;
  attendance: DashboardAttendance;
  discipline: DashboardDiscipline;
  active_students?: number;
  active_teachers?: number;
  trend: DashboardTrendPoint[];
  late_students: DashboardLateStudent[];
  unrecorded_students: DashboardUnrecordedStudent[];
  recent_activity?: AuditLog[];
};

/** GET /audit-logs response. */
export type AuditLogPage = Paginated<AuditLog>;
