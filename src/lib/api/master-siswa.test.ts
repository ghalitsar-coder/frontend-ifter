import { describe, expect, it } from 'vitest';
import type { Class, HistoryRecord, Student } from '@/lib/api/dto';
import {
  attendanceCategoryFor,
  backendStatusToUi,
  buildProvisionAccountBody,
  buildStudentNoteBody,
  disciplineStageFor,
  formatStudentNoteDate,
  gradeFromClass,
  isValidStudentNote,
  mapClassToRombel,
  mapHistoryToLogs,
  mapStudentToProfile,
  normalizeStudentNote,
  profileToStudentInput,
  studentNoteLength,
  studentNotesOptions,
  uiStatusToBackend,
} from '@/lib/api/master-siswa';

const baseStudent: Student = {
  id: 'uuid-1',
  student_number: '00829103',
  national_student_number: '0092831201',
  full_name: 'Dimas Saputra',
  gender: 'L',
  birth_date: '2011-04-12',
  admission_year: 2024,
  status: 'active',
  guardian_name: 'Bambang Saputra',
  guardian_phone: '081234567890',
  current_class: { id: 'class-1', name: 'VIII A' },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const baseClass: Class = {
  id: 'class-1',
  academic_year_id: 'ay-1',
  academic_year_name: '2024/2025',
  name: 'VIII A',
  grade_level: 8,
  status: 'active',
  homeroom_teacher_id: 't-1',
  homeroom_teacher_name: 'Drs. Agus Subagyo',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const summaryMetrics = {
  student_id: 'uuid-1',
  student_number: '00829103',
  student_name: 'Dimas Saputra',
  class_id: 'class-1',
  class_name: 'VIII A',
  total_days: 50,
  present: 45,
  late: 3,
  sick: 1,
  excused: 1,
  absent: 0,
  attendance_percentage: 96.4,
};

const disciplineMetrics = {
  student_id: 'uuid-1',
  student_number: '00829103',
  student_name: 'Dimas Saputra',
  total_points: 54,
  total_records: 2,
  categories: [],
  records: [],
};

function makeHistoryRecord(id: string, status: HistoryRecord['status']): HistoryRecord {
  return {
    id,
    date: '2025-10-06',
    status,
    source: 'manual',
    student_id: 'uuid-1',
    student_number: '00829103',
    student_name: 'Dimas Saputra',
    class_id: 'class-1',
    class_name: 'VIII A',
    academic_year_id: 'ay-1',
    academic_year_name: '2024/2025',
    closed: false,
    created_at: '2025-10-06T00:00:00Z',
    updated_at: '2025-10-06T00:00:00Z',
  };
}

describe('filter status → backend vocabulary', () => {
  it('maps every ui status onto the backend equivalent', () => {
    expect(uiStatusToBackend('all')).toBeUndefined();
    expect(uiStatusToBackend('active')).toBe('active');
    expect(uiStatusToBackend('mutation')).toBe('transferred');
    expect(uiStatusToBackend('alumni')).toBe('graduated');
  });
});

describe('backend status → ui vocabulary', () => {
  it('collapses graduated and inactive into alumni', () => {
    expect(backendStatusToUi('active')).toBe('active');
    expect(backendStatusToUi('transferred')).toBe('mutation');
    expect(backendStatusToUi('graduated')).toBe('alumni');
    expect(backendStatusToUi('inactive')).toBe('alumni');
  });
});

describe('grade token derivation from a class', () => {
  it('prefers grade_level then falls back to class name prefix', () => {
    expect(gradeFromClass(baseClass)).toBe('VIII');
    expect(gradeFromClass(undefined, 'IX B')).toBe('IX');
    expect(gradeFromClass(undefined, 'X C')).toBe('VII');
  });
});

describe('class row → rombel picker option', () => {
  it('maps a Class into the picker shape with live count', () => {
    expect(mapClassToRombel(baseClass, 27)).toStrictEqual({
      id: 'class-1',
      name: 'VIII A',
      grade: 'VIII',
      homeroomTeacher: 'Drs. Agus Subagyo',
      currentCount: 27,
      capacity: 32,
    });
  });
});

describe('attendance percentage buckets', () => {
  it('buckets rates into the four seeded labels', () => {
    expect(attendanceCategoryFor(99)).toBe('Hadir Prima');
    expect(attendanceCategoryFor(96)).toBe('Normal');
    expect(attendanceCategoryFor(92)).toBe('Cukup');
    expect(attendanceCategoryFor(60)).toBe('Perlu Perhatian');
  });
});

describe('discipline stage point bands', () => {
  it('labels zero, ambang and sp1 bands', () => {
    expect(disciplineStageFor(0)).toBeUndefined();
    expect(disciplineStageFor(10)).toBeUndefined();
    expect(disciplineStageFor(34)).toBe('Ambang');
    expect(disciplineStageFor(54)).toBe('SP1');
  });
});

describe('student → ui profile join', () => {
  it('joins class homeroom and metrics into the profile shape', () => {
    const profile = mapStudentToProfile(baseStudent, {
      classIndex: { 'class-1': baseClass },
      metrics: { summary: summaryMetrics, discipline: disciplineMetrics },
    });

    expect({
      id: profile.id,
      nis: profile.nis,
      nisn: profile.nisn,
      className: profile.className,
      grade: profile.grade,
      homeroomTeacher: profile.homeroomTeacher,
    }).toStrictEqual({
      id: 'uuid-1',
      nis: '00829103',
      nisn: '0092831201',
      className: 'VIII A',
      grade: 'VIII',
      homeroomTeacher: 'Drs. Agus Subagyo',
    });
  });

  it('derives attendance and discipline aggregates from metrics', () => {
    const profile = mapStudentToProfile(baseStudent, {
      classIndex: { 'class-1': baseClass },
      metrics: { summary: summaryMetrics, discipline: disciplineMetrics },
    });

    expect({
      semesterAttendanceRate: profile.semesterAttendanceRate,
      attendanceCategory: profile.attendanceCategory,
      totalLateCount: profile.totalLateCount,
      disciplinePoints: profile.disciplinePoints,
      disciplineStage: profile.disciplineStage,
      guardianPhone: profile.guardian.phone,
    }).toStrictEqual({
      semesterAttendanceRate: 96,
      attendanceCategory: 'Normal',
      totalLateCount: 3,
      disciplinePoints: 54,
      disciplineStage: 'SP1',
      guardianPhone: '081234567890',
    });
  });

  it('tolerates students without class or metrics', () => {
    const profile = mapStudentToProfile({
      ...baseStudent,
      current_class: undefined,
      status: 'graduated',
    });
    expect({
      className: profile.className,
      status: profile.status,
      semesterAttendanceRate: profile.semesterAttendanceRate,
      disciplinePoints: profile.disciplinePoints,
    }).toStrictEqual({
      className: '-',
      status: 'alumni',
      semesterAttendanceRate: 0,
      disciplinePoints: 0,
    });
  });
});

describe('ui profile → backend student payload', () => {
  it('produces the payload and attaches the resolved class id', () => {
    const profile = mapStudentToProfile(baseStudent);
    const payload = profileToStudentInput(profile, 'class-1');
    expect(payload.student_number).toBe('00829103');
    expect(payload.full_name).toBe('Dimas Saputra');
    expect(payload.gender).toBe('L');
    expect(payload.birth_date).toBe('2011-04-12');
    expect(payload.class_id).toBe('class-1');
  });

  it('uses the current year as admission fallback', () => {
    const profile = mapStudentToProfile(baseStudent);
    expect(profileToStudentInput(profile).admission_year).toBeGreaterThanOrEqual(1990);
  });

  it('omits empty optional fields', () => {
    const profile = mapStudentToProfile({
      ...baseStudent,
      national_student_number: undefined,
      birth_date: undefined,
    });
    const payload = profileToStudentInput(profile);
    expect(payload.national_student_number).toBeUndefined();
    expect(payload.birth_date).toBeUndefined();
    expect(payload.class_id).toBeUndefined();
  });
});

describe('attendance history → timeline logs', () => {
  it('maps a late record onto the hadir vocabulary with note', () => {
    const logs = mapHistoryToLogs([makeHistoryRecord('rec-1', 'late')]);
    expect(logs).toHaveLength(1);
    expect({
      status: logs[0]?.status,
      note: logs[0]?.note,
      dateHasYear: logs[0]?.date.includes('2025'),
    }).toStrictEqual({
      status: 'hadir',
      note: 'Terlambat',
      dateHasYear: true,
    });
  });

  it('maps sick, excused and absent to sakit, izin and alpa', () => {
    const logs = mapHistoryToLogs([
      makeHistoryRecord('a', 'sick'),
      makeHistoryRecord('b', 'excused'),
      makeHistoryRecord('c', 'absent'),
    ]);
    expect(logs.map((log) => log.status)).toStrictEqual(['sakit', 'izin', 'alpa']);
  });
});

describe('student account provision body', () => {
  it('omits blank fields so the backend applies its NIS fallback', () => {
    expect(buildProvisionAccountBody({ username: '  ', email: '' })).toStrictEqual({});
    expect(buildProvisionAccountBody({})).toStrictEqual({});
  });

  it('trims and keeps only non-blank fields', () => {
    expect(buildProvisionAccountBody({ username: ' ani01 ', email: ' ' })).toStrictEqual({
      username: 'ani01',
    });
    expect(
      buildProvisionAccountBody({ username: 'sac002.invited', email: 'budi@example.com' }),
    ).toStrictEqual({ username: 'sac002.invited', email: 'budi@example.com' });
  });
});

describe('administrative note draft', () => {
  it('trims surrounding whitespace', () => {
    expect(normalizeStudentNote('  perlu konfirmasi wali  ')).toBe('perlu konfirmasi wali');
    expect(buildStudentNoteBody('  perlu konfirmasi wali  ')).toStrictEqual({
      note: 'perlu konfirmasi wali',
    });
  });

  it('counts unicode code points like the backend rune cap', () => {
    expect(studentNoteLength('  📝 arsip  ')).toBe(7);
    expect(studentNoteLength('   ')).toBe(0);
  });

  it('accepts one to 2000 characters and rejects blank or overlong drafts', () => {
    expect(isValidStudentNote('a')).toBeTruthy();
    expect(isValidStudentNote('a'.repeat(2000))).toBeTruthy();
    expect(isValidStudentNote('a'.repeat(2001))).toBeFalsy();
    expect(isValidStudentNote('')).toBeFalsy();
    expect(isValidStudentNote('   ')).toBeFalsy();
  });

  it('treats an emoji as a single character at the cap', () => {
    expect(isValidStudentNote('📝'.repeat(2000))).toBeTruthy();
    expect(isValidStudentNote('📝'.repeat(2001))).toBeFalsy();
  });
});

describe('administrative note timestamp', () => {
  it('returns an em dash for unparsable input', () => {
    expect(formatStudentNoteDate('')).toBe('—');
    expect(formatStudentNoteDate('not-a-date')).toBe('—');
  });

  it('formats an RFC3339 timestamp with the year', () => {
    const label = formatStudentNoteDate('2026-10-01T08:15:00Z');
    expect(label).not.toBe('—');
    expect(label).toContain('2026');
  });
});

describe('student notes query options', () => {
  it('keys notes by student and disables the empty id', () => {
    expect(studentNotesOptions('student-1').queryKey).toStrictEqual([
      'students',
      'notes',
      'student-1',
    ]);
    expect(studentNotesOptions('').enabled).toBeFalsy();
  });
});
