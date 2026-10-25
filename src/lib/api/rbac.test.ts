import { describe, expect, it } from 'vitest';
import {
  can,
  isStudentOnly,
  ROLE_ADMIN,
  ROLE_DUTY_TEACHER,
  ROLE_PRINCIPAL,
  ROLE_STAFF_TU,
  ROLE_STUDENT,
  ROLE_TEACHER,
} from './rbac';

describe('can — admin role', () => {
  it('grants every staff capability', () => {
    expect(can([ROLE_ADMIN], 'admin')).toBeTruthy();
    expect(can([ROLE_ADMIN], 'master_data')).toBeTruthy();
    expect(can([ROLE_ADMIN], 'attendance_ops')).toBeTruthy();
    expect(can([ROLE_ADMIN], 'discipline_ops')).toBeTruthy();
    expect(can([ROLE_ADMIN], 'imports')).toBeTruthy();
  });

  it('grants the read, dashboard, settings and authenticated capabilities', () => {
    expect(can([ROLE_ADMIN], 'attendance_read')).toBeTruthy();
    expect(can([ROLE_ADMIN], 'reports_read')).toBeTruthy();
    expect(can([ROLE_ADMIN], 'dispensations_read')).toBeTruthy();
    expect(can([ROLE_ADMIN], 'settings')).toBeTruthy();
    expect(can([ROLE_ADMIN], 'authenticated')).toBeTruthy();
  });

  it('excludes the student-only my group (docs/API_ADDENDUM.md §2)', () => {
    expect(can([ROLE_ADMIN], 'my')).toBeFalsy();
    expect(can([ROLE_ADMIN], 'dashboard')).toBeTruthy();
  });
});

describe('can — staff_tu role', () => {
  it('reaches master data, imports, reports and dispensation reads', () => {
    expect(can([ROLE_STAFF_TU], 'master_data')).toBeTruthy();
    expect(can([ROLE_STAFF_TU], 'imports')).toBeTruthy();
    expect(can([ROLE_STAFF_TU], 'reports_read')).toBeTruthy();
    expect(can([ROLE_STAFF_TU], 'dispensations_read')).toBeTruthy();
  });

  it('keeps the pengaturan menu (master-data part of the page only)', () => {
    expect(can([ROLE_STAFF_TU], 'settings')).toBeTruthy();
    expect(can([ROLE_TEACHER], 'settings')).toBeFalsy();
    expect(can([ROLE_PRINCIPAL], 'settings')).toBeFalsy();
  });

  it('grants no ops, admin or dashboard-menu surface', () => {
    expect(can([ROLE_STAFF_TU], 'admin')).toBeFalsy();
    expect(can([ROLE_STAFF_TU], 'attendance_ops')).toBeFalsy();
    expect(can([ROLE_STAFF_TU], 'discipline_ops')).toBeFalsy();
    // Menu spec: no dashboard item for TU even though GET /dashboard is reachable.
    expect(can([ROLE_STAFF_TU], 'dashboard')).toBeFalsy();
    expect(can([ROLE_STAFF_TU], 'my')).toBeFalsy();
  });
});

describe('can — teacher role', () => {
  it('holds the full ops surface plus dashboard and dispensation reads', () => {
    expect(can([ROLE_TEACHER], 'attendance_ops')).toBeTruthy();
    expect(can([ROLE_TEACHER], 'discipline_ops')).toBeTruthy();
    expect(can([ROLE_TEACHER], 'dispensations_read')).toBeTruthy();
    expect(can([ROLE_TEACHER], 'dashboard')).toBeTruthy();
  });

  it('has no admin, master data or imports surface', () => {
    expect(can([ROLE_TEACHER], 'admin')).toBeFalsy();
    expect(can([ROLE_TEACHER], 'master_data')).toBeFalsy();
    expect(can([ROLE_TEACHER], 'imports')).toBeFalsy();
  });
});

describe('can — duty_teacher role', () => {
  it('mirrors teacher (school-wide scope is enforced server-side)', () => {
    expect(can([ROLE_DUTY_TEACHER], 'attendance_ops')).toBeTruthy();
    expect(can([ROLE_DUTY_TEACHER], 'discipline_ops')).toBeTruthy();
    expect(can([ROLE_DUTY_TEACHER], 'dispensations_read')).toBeTruthy();
    expect(can([ROLE_DUTY_TEACHER], 'imports')).toBeFalsy();
    expect(can([ROLE_DUTY_TEACHER], 'my')).toBeFalsy();
  });
});

describe('can — principal role', () => {
  it('reaches the read groups plus dashboard and reports', () => {
    expect(can([ROLE_PRINCIPAL], 'dashboard')).toBeTruthy();
    expect(can([ROLE_PRINCIPAL], 'reports_read')).toBeTruthy();
    expect(can([ROLE_PRINCIPAL], 'dispensations_read')).toBeTruthy();
    expect(can([ROLE_PRINCIPAL], 'attendance_read')).toBeTruthy();
    expect(can([ROLE_PRINCIPAL], 'discipline_read')).toBeTruthy();
  });

  it('is excluded from every write surface', () => {
    expect(can([ROLE_PRINCIPAL], 'attendance_ops')).toBeFalsy();
    expect(can([ROLE_PRINCIPAL], 'discipline_ops')).toBeFalsy();
    expect(can([ROLE_PRINCIPAL], 'imports')).toBeFalsy();
    expect(can([ROLE_PRINCIPAL], 'my')).toBeFalsy();
  });
});

describe('can — student role', () => {
  it('only reaches the /my portal and authenticated', () => {
    expect(can([ROLE_STUDENT], 'my')).toBeTruthy();
    expect(can([ROLE_STUDENT], 'authenticated')).toBeTruthy();
    expect(can([ROLE_STUDENT], 'dashboard')).toBeFalsy();
    expect(can([ROLE_STUDENT], 'attendance_ops')).toBeFalsy();
    expect(can([ROLE_STUDENT], 'reports_read')).toBeFalsy();
  });

  it('grants nothing for empty or unknown role lists', () => {
    expect(can([], 'authenticated')).toBeFalsy();
    expect(can(['headmaster'], 'dashboard')).toBeFalsy();
  });

  it('combines capabilities for multi-role accounts', () => {
    expect(can([ROLE_STUDENT, ROLE_TEACHER], 'attendance_ops')).toBeTruthy();
    expect(can([ROLE_STUDENT, ROLE_TEACHER], 'my')).toBeTruthy();
  });
});

describe(isStudentOnly, () => {
  it('is true exactly for non-empty student-only role lists', () => {
    expect(isStudentOnly([ROLE_STUDENT])).toBeTruthy();
  });

  it('is false for empty lists and mixed staff+student accounts', () => {
    expect(isStudentOnly([])).toBeFalsy();
    expect(isStudentOnly([ROLE_STUDENT, ROLE_TEACHER])).toBeFalsy();
    expect(isStudentOnly([ROLE_ADMIN])).toBeFalsy();
  });
});
