import { afterEach, describe, expect, it, vi } from 'vitest';
import { setAccessToken } from '@/lib/api/client';
import type {
  Class,
  DutyAssignment,
  ImportErrorRow,
  ImportPreviewRow,
  Teacher,
} from '@/lib/api/dto';
import {
  buildTeacherProfiles,
  createTeacherProfile,
  mapImportPreview,
  mapTeacherToProfile,
  updateTeacherProfile,
} from './master-guru';

const baseTeacher: Teacher = {
  id: 't-1',
  employee_number: '1978041220050110 03',
  full_name: 'Drs. Agus Subagyo, M.Pd.',
  email: 'agus@sekolah.sch.id',
  phone: '+62 812-3456',
  status: 'active',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const homeroomClass: Class = {
  id: 'c-1',
  academic_year_id: 'ay-1',
  academic_year_name: '2026/2027',
  name: 'Kelas VIII A',
  grade_level: 8,
  status: 'active',
  homeroom_teacher_id: 't-1',
  homeroom_teacher_name: 'Drs. Agus Subagyo, M.Pd.',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const mondayDuty: DutyAssignment = {
  id: 'd-1',
  teacher_id: 't-1',
  teacher_name: 'Drs. Agus Subagyo, M.Pd.',
  weekday: 1,
  start_date: '2026-07-01',
  created_at: '2026-01-01T00:00:00Z',
};

const jsonResponse = (status: number, body: unknown) =>
  Response.json(body, {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('teacher profile mapping', () => {
  it('joins homeroom class, duty day, and admin role into the UI profile', () => {
    const profile = mapTeacherToProfile(
      { ...baseTeacher, user_id: 'u-1' },
      [homeroomClass],
      [mondayDuty],
      { 'u-1': { id: 'u-1', username: 'agus', roles: ['admin', 'teacher'] } },
    );

    expect(profile).toMatchObject({
      name: 'Drs. Agus Subagyo, M.Pd.',
      nip: '1978041220050110 03',
      homeroomClass: { className: 'Kelas VIII A' },
      picketDuty: { day: 'Senin' },
      accessLevel: 'admin',
      status: 'active',
    });
    expect(profile.roles).toStrictEqual(['Administrator', 'Wali Kelas', 'Guru Piket']);
  });

  it('falls back to plain teacher defaults when nothing is joined', () => {
    const profile = mapTeacherToProfile(
      { ...baseTeacher, id: 't-2', full_name: 'Bpk. Joko', status: 'inactive' },
      [],
      [],
      {},
    );

    expect(profile).toMatchObject({
      accessLevel: 'teacher',
      status: 'inactive',
      roles: ['Belum Ada Penugasan'],
      homeroomClass: undefined,
      picketDuty: undefined,
    });
  });

  it('builds profiles for every teacher in the page', () => {
    const profiles = buildTeacherProfiles([baseTeacher, { ...baseTeacher, id: 't-2' }], [], [], {});
    expect(profiles.map((profile) => profile.id)).toStrictEqual(['t-1', 't-2']);
  });

  it('carries employment_type_id/name from the teacher payload into the profile', () => {
    const profile = mapTeacherToProfile(
      {
        ...baseTeacher,
        employment_type_id: 'et-2',
        employment_type_name: 'Honorer',
      },
      [],
      [],
      {},
    );

    expect(profile.employmentTypeId).toBe('et-2');
    expect(profile.employmentTypeName).toBe('Honorer');
  });

  it('leaves employment fields undefined when the teacher has no type (NULL = unknown)', () => {
    const profile = mapTeacherToProfile(baseTeacher, [], [], {});
    expect(profile.employmentTypeId).toBeUndefined();
    expect(profile.employmentTypeName).toBeUndefined();
  });
});

describe('import preview mapping', () => {
  const preview: ImportPreviewRow[] = [
    { row_number: 1, action: 'create', key: '19780412', name: 'Agus' },
    { row_number: 2, action: 'update', key: '19850918', name: 'Sarah', changed_fields: ['phone'] },
    { row_number: 3, action: 'unchanged', key: '19820315', name: 'Hendra' },
    { row_number: 4, action: 'create', key: '', name: 'Bambang' },
  ];
  const errors: ImportErrorRow[] = [
    { row_number: 4, code: 'duplicate', message: 'NIP sudah terdaftar' },
  ];

  it('flags rows referenced by server errors and keeps the rest valid', () => {
    const rows = mapImportPreview(preview, errors);

    expect(rows.map((row) => row.validationStatus)).toStrictEqual([
      'valid',
      'valid',
      'warning',
      'error',
    ]);
    expect(rows.map((row) => row.actionLabel)).toStrictEqual(['Baru', 'Perbarui', 'Tetap', 'Baru']);
    expect(rows[1]?.note).toContain('phone');
    expect(rows[3]?.statusLabel).toBe('Duplikat');
    expect(rows[3]?.note).toBe('NIP sudah terdaftar');
  });

  it('tolerates the new employment_type column in backend changed_fields', () => {
    const rows = mapImportPreview(
      [
        {
          row_number: 1,
          action: 'update',
          key: '19780412',
          name: 'Agus',
          changed_fields: ['employment_type'],
        },
      ],
      [],
    );

    expect(rows[0]?.validationStatus).toBe('valid');
    expect(rows[0]?.note).toBe('Perubahan: employment_type');
  });
});

describe('create teacher orchestration', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    setAccessToken(null);
  });

  it('creates account, teacher, homeroom, and duty in order', async () => {
    const fetchMock = vi.fn<typeof globalThis.fetch>();
    vi.stubGlobal('fetch', fetchMock);
    setAccessToken('tok');

    fetchMock
      .mockResolvedValueOnce(jsonResponse(201, { user: { id: 'u-9' }, credential: { token: 'x' } }))
      .mockResolvedValueOnce(jsonResponse(201, { teacher: { ...baseTeacher, id: 't-9' } }))
      .mockResolvedValueOnce(jsonResponse(200, { homeroom: { id: 'h-1' } }))
      .mockResolvedValueOnce(jsonResponse(201, { ...mondayDuty, id: 'd-9' }));

    const result = await createTeacherProfile({
      fullName: 'Agus',
      employeeNumber: '19780412',
      email: 'agus@sekolah.sch.id',
      phone: '+62812',
      accessLevel: 'homeroom',
      createAccount: true,
      homeroomClassId: 'c-1',
      dutyWeekday: 1,
    });

    expect(result).toMatchObject({
      accountCreated: true,
      homeroomAssigned: true,
      dutyAssigned: true,
      teacher: { id: 't-9' },
    });

    const urls = fetchMock.mock.calls.map(([call]) => call);
    expect(urls).toStrictEqual([
      expect.stringContaining('/api/v1/users'),
      expect.stringContaining('/api/v1/teachers'),
      expect.stringContaining('/api/v1/classes/c-1/homeroom'),
      expect.stringContaining('/api/v1/duty-assignments'),
    ]);

    const teacherBody = fetchMock.mock.calls[1]?.[1]?.body;
    if (typeof teacherBody !== 'string') {
      throw new TypeError('expected the teacher PUT body to be a JSON string');
    }
    expect(JSON.parse(teacherBody)).toMatchObject({ user_id: 'u-9', status: 'active' });
  });

  it('still saves the teacher when account creation fails', async () => {
    const fetchMock = vi.fn<typeof globalThis.fetch>();
    vi.stubGlobal('fetch', fetchMock);
    setAccessToken('tok');

    fetchMock
      .mockResolvedValueOnce(jsonResponse(403, { code: 'forbidden', message: 'admin only' }))
      .mockResolvedValueOnce(jsonResponse(201, { teacher: { ...baseTeacher, id: 't-9' } }));

    const result = await createTeacherProfile({
      fullName: 'Agus',
      employeeNumber: '19780412',
      email: 'agus@sekolah.sch.id',
      phone: '+62812',
      accessLevel: 'teacher',
      createAccount: true,
    });

    expect(result).toMatchObject({ accountCreated: false, teacher: { id: 't-9' } });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('submits employment_type_id on create when a kepegawaian type is picked', async () => {
    const fetchMock = vi.fn<typeof globalThis.fetch>();
    vi.stubGlobal('fetch', fetchMock);
    setAccessToken('tok');

    fetchMock.mockResolvedValueOnce(
      jsonResponse(201, {
        teacher: { ...baseTeacher, id: 't-9', employment_type_id: 'et-2' },
      }),
    );

    await createTeacherProfile({
      fullName: 'Joko',
      employeeNumber: '19900101',
      email: 'joko@sekolah.sch.id',
      phone: '+62812',
      accessLevel: 'teacher',
      createAccount: false,
      employmentTypeId: 'et-2',
    });

    const teacherBody = fetchMock.mock.calls[0]?.[1]?.body;
    if (typeof teacherBody !== 'string') {
      throw new TypeError('expected the teacher POST body to be a JSON string');
    }
    expect(JSON.parse(teacherBody)).toMatchObject({ employment_type_id: 'et-2' });
  });

  it('omits employment_type_id from the create body when left unset', async () => {
    const fetchMock = vi.fn<typeof globalThis.fetch>();
    vi.stubGlobal('fetch', fetchMock);
    setAccessToken('tok');

    fetchMock.mockResolvedValueOnce(jsonResponse(201, { teacher: { ...baseTeacher, id: 't-9' } }));

    await createTeacherProfile({
      fullName: 'Joko',
      employeeNumber: '19900101',
      email: 'joko@sekolah.sch.id',
      phone: '+62812',
      accessLevel: 'teacher',
      createAccount: false,
    });

    const teacherBody = fetchMock.mock.calls[0]?.[1]?.body;
    if (typeof teacherBody !== 'string') {
      throw new TypeError('expected the teacher POST body to be a JSON string');
    }
    expect(JSON.parse(teacherBody)).not.toHaveProperty('employment_type_id');
  });
});

describe('edit teacher (PUT /teachers/:id)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    setAccessToken(null);
  });

  it('sends the full update payload including employment_type_id', async () => {
    const fetchMock = vi.fn<typeof globalThis.fetch>();
    vi.stubGlobal('fetch', fetchMock);
    setAccessToken('tok');

    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        teacher: { ...baseTeacher, employment_type_id: 'et-1', employment_type_name: 'Tetap' },
      }),
    );

    const teacher = await updateTeacherProfile({
      teacherId: 't-1',
      userId: 'u-1',
      fullName: 'Drs. Agus Subagyo, M.Pd.',
      employeeNumber: '19780412',
      email: 'agus@sekolah.sch.id',
      phone: '+62812',
      employmentTypeId: 'et-1',
    });

    expect(teacher.employment_type_name).toBe('Tetap');
    const [request, init] = fetchMock.mock.calls[0] ?? [];
    if (typeof request !== 'string') {
      throw new TypeError('expected the teacher PUT URL to be a string');
    }
    expect(request).toContain('/api/v1/teachers/t-1');
    expect(init?.method).toBe('PUT');
    const teacherBody = init?.body;
    if (typeof teacherBody !== 'string') {
      throw new TypeError('expected the teacher PUT body to be a JSON string');
    }
    expect(JSON.parse(teacherBody)).toMatchObject({
      full_name: 'Drs. Agus Subagyo, M.Pd.',
      user_id: 'u-1',
      employment_type_id: 'et-1',
    });
  });
});
