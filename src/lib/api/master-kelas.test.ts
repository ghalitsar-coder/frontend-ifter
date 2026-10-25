import { afterEach, describe, expect, it, vi } from 'vitest';
import { setAccessToken } from '@/lib/api/client';
import type { Class } from '@/lib/api/dto';
import {
  assignClassHomeroom,
  buildClassQuery,
  buildCreateClassPayload,
  buildHomeroomPayload,
  buildUpdateClassPayload,
  createClass,
  fetchClasses,
  gradeLabel,
  mapClassToRow,
  statusLabel,
  studentStatusLabel,
  updateClass,
  updateClassStatus,
} from '@/lib/api/master-kelas';

const baseClass: Class = {
  id: 'cls-1',
  academic_year_id: 'ay-1',
  academic_year_name: '2026/2027',
  name: '8A',
  grade_level: 8,
  major: 'IPA',
  status: 'active',
  homeroom_teacher_id: 'tch-1',
  homeroom_teacher_name: 'Bu Sari',
  created_at: '2026-07-01T00:00:00Z',
  updated_at: '2026-07-01T00:00:00Z',
};

const jsonResponse = (status: number, body: unknown) =>
  Response.json(body, {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const fetchMock = vi.fn<typeof globalThis.fetch>();

/**
 * Parses the JSON body the API client put in the captured request init.
 * @param init - Request init captured by the fetch mock.
 * @returns Parsed JSON payload.
 */
const parseBody = (init: RequestInit | undefined): unknown => {
  const body = init?.body;
  if (typeof body !== 'string') {
    throw new TypeError('expected a JSON string body');
  }
  return JSON.parse(body);
};

const installFetch = () => {
  vi.stubGlobal('fetch', fetchMock);
};

describe('class labels and mapping', () => {
  it('maps backend status and grade to Indonesian labels', () => {
    expect(gradeLabel(7)).toBe('Tingkat 7');
    expect(statusLabel('active')).toBe('Aktif');
    expect(statusLabel('archived')).toBe('Diarsipkan');
    expect(statusLabel('weird')).toBe('weird');
  });

  it('maps roster student statuses to Indonesian labels', () => {
    expect(studentStatusLabel('active')).toBe('Aktif');
    expect(studentStatusLabel('transferred')).toBe('Mutasi');
    expect(studentStatusLabel('graduated')).toBe('Alumni');
    expect(studentStatusLabel('inactive')).toBe('Nonaktif');
    expect(studentStatusLabel('weird')).toBe('weird');
  });

  it('maps a class record onto a table row with homeroom fallback', () => {
    expect(mapClassToRow(baseClass)).toStrictEqual({
      id: 'cls-1',
      name: '8A',
      gradeLabel: 'Tingkat 8',
      academicYearName: '2026/2027',
      major: 'IPA',
      homeroomTeacherName: 'Bu Sari',
      hasHomeroom: true,
      status: 'active',
      statusLabel: 'Aktif',
      isActive: true,
    });

    expect(
      mapClassToRow({
        ...baseClass,
        status: 'archived',
        major: undefined,
        homeroom_teacher_name: undefined,
      }),
    ).toMatchObject({
      major: '',
      homeroomTeacherName: 'Belum ditugaskan',
      hasHomeroom: false,
      statusLabel: 'Diarsipkan',
      isActive: false,
    });
  });
});

describe('query and payload builders', () => {
  it('sends only backend-supported list filters', () => {
    expect(buildClassQuery()).toStrictEqual({ limit: 100 });
    expect(
      buildClassQuery({ academic_year_id: 'ay-1', grade_level: 8, status: 'archived' }),
    ).toStrictEqual({ limit: 100, academic_year_id: 'ay-1', status: 'archived' });
  });

  it('trims drafts and omits an empty major', () => {
    expect(
      buildCreateClassPayload({
        name: ' 7A ',
        gradeLevel: 7,
        academicYearId: ' ay-1 ',
        major: '  ',
      }),
    ).toStrictEqual({ academic_year_id: 'ay-1', name: '7A', grade_level: 7 });

    expect(
      buildUpdateClassPayload({
        name: '9B',
        gradeLevel: 9,
        academicYearId: 'ay-1',
        major: ' IPS ',
      }),
    ).toStrictEqual({ name: '9B', grade_level: 9, major: 'IPS' });
  });

  it('rejects missing names, years, and out-of-range grades', () => {
    expect(() =>
      buildCreateClassPayload({ name: ' ', gradeLevel: 7, academicYearId: 'ay-1' }),
    ).toThrow('Nama kelas wajib diisi.');
    expect(() =>
      buildCreateClassPayload({ name: '7A', gradeLevel: 7, academicYearId: '' }),
    ).toThrow('Tahun ajaran wajib dipilih.');
    expect(() =>
      buildUpdateClassPayload({ name: '7A', gradeLevel: 13, academicYearId: 'ay-1' }),
    ).toThrow('Tingkat kelas harus 7-12.');
  });

  it('omits an empty homeroom start date', () => {
    expect(buildHomeroomPayload(' tch-1 ', '')).toStrictEqual({ teacher_id: 'tch-1' });
    expect(buildHomeroomPayload('tch-1', '2026-07-15')).toStrictEqual({
      teacher_id: 'tch-1',
      start_date: '2026-07-15',
    });
    expect(() => buildHomeroomPayload('')).toThrow('Wali kelas wajib dipilih.');
  });
});

describe('request payloads', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    setAccessToken(null);
  });

  it('GET /classes filters by grade client-side', async () => {
    installFetch();
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        data: [baseClass, { ...baseClass, id: 'cls-2', name: '7B', grade_level: 7 }],
        total: 2,
        limit: 100,
        offset: 0,
      }),
    );

    const result = await fetchClasses({ academic_year_id: 'ay-1', grade_level: 8 });

    expect(result.data.map((row) => row.id)).toStrictEqual(['cls-1']);
    expect(result.total).toBe(1);
    const [url] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(
      expect.stringContaining('/api/v1/classes?limit=100&academic_year_id=ay-1'),
    );
    expect(url).not.toStrictEqual(expect.stringContaining('grade_level'));
  });

  it('POST /classes sends the create payload', async () => {
    installFetch();
    fetchMock.mockResolvedValueOnce(jsonResponse(201, { class: baseClass }));

    await expect(
      createClass({ academic_year_id: 'ay-1', name: '7A', grade_level: 7 }),
    ).resolves.toStrictEqual(baseClass);

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/classes'));
    expect(init?.method).toBe('POST');
    expect(parseBody(init)).toStrictEqual({
      academic_year_id: 'ay-1',
      name: '7A',
      grade_level: 7,
    });
  });

  it('PUT /classes/:id sends the update payload', async () => {
    installFetch();
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { class: baseClass }));

    await updateClass('cls-1', { name: '8A', grade_level: 8, major: 'IPA' });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/classes/cls-1'));
    expect(init?.method).toBe('PUT');
    expect(parseBody(init)).toStrictEqual({
      name: '8A',
      grade_level: 8,
      major: 'IPA',
    });
  });

  it('PATCH /classes/:id/status sends the target status', async () => {
    installFetch();
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { class: { ...baseClass, status: 'archived' } }),
    );

    await updateClassStatus('cls-1', 'archived');

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/classes/cls-1/status'));
    expect(init?.method).toBe('PATCH');
    expect(parseBody(init)).toStrictEqual({ status: 'archived' });
  });

  it('PUT /classes/:id/homeroom sends teacher and start date', async () => {
    installFetch();
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        homeroom: {
          id: 'hr-1',
          teacher_id: 'tch-1',
          teacher_name: 'Bu Sari',
          class_id: 'cls-1',
          start_date: '2026-07-15',
          created_at: '2026-07-15T00:00:00Z',
        },
      }),
    );

    await expect(
      assignClassHomeroom('cls-1', { teacher_id: 'tch-1', start_date: '2026-07-15' }),
    ).resolves.toMatchObject({ teacher_id: 'tch-1', class_id: 'cls-1' });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/classes/cls-1/homeroom'));
    expect(init?.method).toBe('PUT');
    expect(parseBody(init)).toStrictEqual({
      teacher_id: 'tch-1',
      start_date: '2026-07-15',
    });
  });
});
