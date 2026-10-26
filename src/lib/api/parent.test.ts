import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, setAccessToken } from '@/lib/api/client';
import {
  buildChildrenPayload,
  buildCreateParentPayload,
  buildRangeQuery,
  childLinkErrorMessage,
  createParentAccount,
  defaultMonthRange,
  disciplineStatusLabel,
  fetchParentAttendance,
  fetchParentChildren,
  fetchParentDisciplineSummary,
  fetchUserList,
  formatCheckInTime,
  parentAttendanceOptions,
  portalErrorMessage,
  relationshipLabel,
  replaceUserChildren,
  resetUserCredential,
  statusLabel,
  userRoleLabel,
  userRoles,
  validateDateRange,
} from '@/lib/api/parent';

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

describe('monthly default range', () => {
  it('spans the first of the month through today', () => {
    expect(defaultMonthRange(new Date(2026, 9, 26))).toStrictEqual({
      from: '2026-10-01',
      to: '2026-10-26',
    });
  });

  it('collapses to a single day on the first of a month', () => {
    expect(defaultMonthRange(new Date(2026, 0, 1))).toStrictEqual({
      from: '2026-01-01',
      to: '2026-01-01',
    });
  });

  it('stays inside the injected month', () => {
    expect(defaultMonthRange(new Date(2026, 11, 31)).from).toBe('2026-12-01');
  });
});

describe('date range validation', () => {
  it('accepts a range the backend allows', () => {
    expect(validateDateRange({ from: '2026-10-01', to: '2026-10-26' })).toBeNull();
    expect(validateDateRange({ from: '2026-10-26', to: '2026-10-26' })).toBeNull();
  });

  it('rejects a missing endpoint', () => {
    expect(validateDateRange({ from: '2026-10-01', to: '' })).toBe(
      'Tanggal mulai dan akhir wajib diisi.',
    );
  });

  it('rejects a malformed date', () => {
    expect(validateDateRange({ from: '2026-10-1', to: '2026-10-26' })).toBe(
      'Format tanggal harus YYYY-MM-DD.',
    );
  });

  it('rejects an end before the start', () => {
    expect(validateDateRange({ from: '2026-10-26', to: '2026-10-01' })).toBe(
      'Tanggal akhir tidak boleh sebelum tanggal mulai.',
    );
  });

  it('rejects a range longer than the backend cap', () => {
    expect(validateDateRange({ from: '2025-01-01', to: '2026-10-26' })).toBe(
      'Rentang tanggal maksimal 366 hari.',
    );
  });

  it('counts both bounds against the 366-day cap', () => {
    expect(validateDateRange({ from: '2025-10-01', to: '2026-10-01' })).toBeNull();
    expect(validateDateRange({ from: '2025-10-01', to: '2026-10-02' })).toBe(
      'Rentang tanggal maksimal 366 hari.',
    );
  });
});

describe('range query builder', () => {
  it('sends from and to without paging keys when absent', () => {
    expect(buildRangeQuery({ from: '2026-10-01', to: '2026-10-26' })).toStrictEqual({
      from: '2026-10-01',
      to: '2026-10-26',
    });
  });

  it('adds limit and offset when paging', () => {
    expect(
      buildRangeQuery({ from: '2026-10-01', to: '2026-10-26' }, { limit: 50, offset: 50 }),
    ).toStrictEqual({ from: '2026-10-01', to: '2026-10-26', limit: 50, offset: 50 });
  });
});

describe('labels', () => {
  it('maps relationship codes to Indonesian', () => {
    expect(relationshipLabel('father')).toBe('Ayah');
    expect(relationshipLabel('mother')).toBe('Ibu');
    expect(relationshipLabel('guardian')).toBe('Wali');
  });

  it('falls back for unknown and empty relationships', () => {
    expect(relationshipLabel('uncle')).toBe('uncle');
    expect(relationshipLabel(null)).toBe('—');
    expect(relationshipLabel('')).toBe('—');
  });

  it('maps account statuses to Indonesian', () => {
    expect(statusLabel('active')).toBe('Aktif');
    expect(statusLabel('pending')).toBe('Menunggu Aktivasi');
    expect(statusLabel('inactive')).toBe('Nonaktif');
  });

  it('maps locked and system statuses and passes unknown codes through', () => {
    expect(statusLabel('locked')).toBe('Terkunci');
    expect(statusLabel('system')).toBe('Sistem');
    expect(statusLabel('archived')).toBe('archived');
  });

  it('formats a check-in instant as a clock time', () => {
    expect(formatCheckInTime('2026-10-26T00:12:00Z')).toMatch(/^\d{2}:\d{2}$/u);
  });

  it('shows a dash when the student never checked in', () => {
    expect(formatCheckInTime(null)).toBe('—');
    expect(formatCheckInTime('')).toBe('—');
  });

  it('maps role codes to Indonesian for the account table', () => {
    expect(userRoleLabel('parent')).toBe('Orang Tua');
    expect(userRoleLabel('staff_tu')).toBe('Staf TU');
    expect(userRoleLabel('student')).toBe('Siswa');
  });

  it('passes an unknown role code through', () => {
    expect(userRoleLabel('auditor')).toBe('auditor');
  });

  it('maps discipline record statuses to Indonesian', () => {
    expect(disciplineStatusLabel('new')).toBe('Baru');
    expect(disciplineStatusLabel('in_followup')).toBe('Dalam Tindak Lanjut');
    expect(disciplineStatusLabel('draft')).toBe('draft');
  });
});

describe('children payload builder', () => {
  it('trims ids, drops blank rows and blanks the relationship', () => {
    expect(
      buildChildrenPayload([
        { student_id: '  s-1  ', relationship: '  ' },
        { student_id: '   ', relationship: 'father' },
      ]),
    ).toStrictEqual({ children: [{ student_id: 's-1', relationship: null }] });
  });

  it('keeps a known relationship code', () => {
    expect(buildChildrenPayload([{ student_id: 's-1', relationship: 'mother' }])).toStrictEqual({
      children: [{ student_id: 's-1', relationship: 'mother' }],
    });
  });

  it('deduplicates a repeated student id keeping the first row', () => {
    expect(
      buildChildrenPayload([
        { student_id: 's-1', relationship: 'father' },
        { student_id: ' s-1 ', relationship: 'mother' },
      ]),
    ).toStrictEqual({ children: [{ student_id: 's-1', relationship: 'father' }] });
  });

  it('caps the link list at the backend limit of twenty children', () => {
    const rows = Array.from({ length: 21 }, (_, index) => ({
      student_id: `s-${index}`,
      relationship: '',
    }));
    expect(() => buildChildrenPayload(rows)).toThrow('Maksimal 20 anak per akun.');
  });

  it('returns an empty list that clears every link', () => {
    expect(buildChildrenPayload([])).toStrictEqual({ children: [] });
  });
});

describe('parent account payload builder', () => {
  it('always assigns the parent role and drops a blank email', () => {
    const payload = buildCreateParentPayload({
      username: ' ortu.sari ',
      email: '   ',
      full_name: ' Sari ',
    });
    expect(payload).toStrictEqual({
      username: 'ortu.sari',
      full_name: 'Sari',
      roles: ['parent'],
    });
  });

  it('keeps a trimmed email', () => {
    expect(
      buildCreateParentPayload({ username: 'ortu', email: ' a@example.id ', full_name: 'Sari' })
        .email,
    ).toBe('a@example.id');
  });

  it('rejects a blank username or full name', () => {
    expect(() => buildCreateParentPayload({ username: '', email: '', full_name: 'Sari' })).toThrow(
      'Username wajib diisi.',
    );
    expect(() => buildCreateParentPayload({ username: 'ortu', email: '', full_name: ' ' })).toThrow(
      'Nama lengkap wajib diisi.',
    );
  });
});

describe('parent requests', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    setAccessToken(null);
  });

  it('GET /parent/children unwraps the linked children', async () => {
    installFetch();
    const child = {
      student_id: 's-1',
      student_number: '1234',
      full_name: 'Andi',
      status: 'active',
      class_id: null,
      class_name: null,
      relationship: 'father',
      linked_at: '2026-10-01T00:00:00Z',
    };
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: [child] }));

    await expect(fetchParentChildren()).resolves.toStrictEqual([child]);

    const [url] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/parent/children'));
  });

  it('GET /parent/children/:id/attendance encodes the id and sends the range', async () => {
    installFetch();
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { data: [], total: 0, limit: 10, offset: 0 }),
    );

    await fetchParentAttendance('id/1', { from: '2026-10-01', to: '2026-10-26' }, { limit: 10 });

    const [url] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/parent/children/id%2F1/attendance'));
    expect(url).toStrictEqual(expect.stringContaining('from=2026-10-01'));
    expect(url).toStrictEqual(expect.stringContaining('to=2026-10-26'));
    expect(url).toStrictEqual(expect.stringContaining('limit=10'));
  });

  it('GET /parent/children/:id/discipline-summary returns the aggregate', async () => {
    installFetch();
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        student_id: 's-1',
        student_number: '1234',
        student_name: 'Andi',
        total_points: 8,
        total_records: 2,
        categories: [],
        current_level: null,
      }),
    );

    await expect(
      fetchParentDisciplineSummary('s-1', { from: '2026-10-01', to: '2026-10-26' }),
    ).resolves.toMatchObject({ total_points: 8, total_records: 2 });
  });

  it('surfaces an unlinked child as a not-found ApiError', async () => {
    installFetch();
    fetchMock.mockResolvedValueOnce(
      jsonResponse(404, {
        code: 'not_found',
        message: 'child is not linked to this login account',
      }),
    );

    await expect(
      fetchParentAttendance('s-unknown', { from: '2026-10-01', to: '2026-10-02' }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 404, code: 'not_found' });
  });

  it('GET /users forwards status and paging', async () => {
    installFetch();
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        data: [{ id: 'u-1', status: 'pending' }],
        total: 1,
        limit: 20,
        offset: 0,
      }),
    );

    const result = await fetchUserList({ status: 'pending', limit: 20, offset: 0 });
    expect(result.total).toBe(1);

    const [url] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(
      expect.stringContaining('/api/v1/users?status=pending&limit=20&offset=0'),
    );
  });

  it('POST /users creates the parent account with the invite credential', async () => {
    installFetch();
    fetchMock.mockResolvedValueOnce(
      jsonResponse(201, {
        user: {
          id: 'u-1',
          full_name: 'Sari',
          status: 'pending',
          created_at: '2026-10-26T00:00:00Z',
        },
        credential: { token: 'inv_abc', purpose: 'invite', expires_at: '2026-11-02T00:00:00Z' },
      }),
    );

    await expect(
      createParentAccount({ username: 'ortu.sari', email: '', full_name: 'Sari' }),
    ).resolves.toMatchObject({ credential: { token: 'inv_abc' } });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/users'));
    expect(init?.method).toBe('POST');
    expect(parseBody(init)).toStrictEqual({
      username: 'ortu.sari',
      full_name: 'Sari',
      roles: ['parent'],
    });
  });

  it('POST /users/:id/credential-reset returns a one-time credential', async () => {
    installFetch();
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { credential: { token: 'res_xyz', purpose: 'reset', expires_at: '' } }),
    );

    await expect(resetUserCredential('u/1')).resolves.toMatchObject({ token: 'res_xyz' });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/users/u%2F1/credential-reset'));
    expect(init?.method).toBe('POST');
  });

  it('PUT /users/:id/children replaces the whole link list', async () => {
    installFetch();
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: [] }));

    await replaceUserChildren('u-1', [{ student_id: 's-1', relationship: 'guardian' }]);

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/users/u-1/children'));
    expect(init?.method).toBe('PUT');
    expect(parseBody(init)).toStrictEqual({
      children: [{ student_id: 's-1', relationship: 'guardian' }],
    });
  });

  it('resolves the roles of every listed account through GET /users/:id', async () => {
    installFetch();
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        user: { id: 'u-1', full_name: 'Sari', status: 'active', roles: ['parent'] },
      }),
    );
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        user: { id: 'u-2', full_name: 'Joko', status: 'active', roles: ['parent', 'teacher'] },
      }),
    );

    await expect(userRoles(['u-1', 'u-2'])).resolves.toStrictEqual({
      'u-1': ['parent'],
      'u-2': ['parent', 'teacher'],
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('skips the lookup when there is no account on screen', async () => {
    installFetch();

    await expect(userRoles([])).resolves.toStrictEqual({});
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('attendance query options', () => {
  it('stays disabled until a child is selected', () => {
    const options = parentAttendanceOptions('', { from: '2026-10-01', to: '2026-10-26' });
    expect(options.queryKey).toStrictEqual([
      'parent',
      'attendance',
      '',
      { from: '2026-10-01', to: '2026-10-26' },
      {},
    ]);
    expect(options.enabled).toBeFalsy();
  });

  it('enables the query for a linked child', () => {
    expect(
      parentAttendanceOptions('s-1', { from: '2026-10-01', to: '2026-10-26' }, { limit: 50 })
        .enabled,
    ).toBeTruthy();
  });
});

describe('error message mapping', () => {
  it('explains why linking children was rejected', () => {
    expect(
      childLinkErrorMessage(new ApiError(409, 'conflict', 'assign the parent role first')),
    ).toBe('Tetapkan peran orang tua pada akun ini sebelum menautkan anak.');
    expect(childLinkErrorMessage(new ApiError(404, 'not_found', 'nope'))).toBe(
      'Salah satu siswa yang ditautkan tidak ditemukan.',
    );
  });

  it('falls back to the backend message for other failures', () => {
    expect(childLinkErrorMessage(new ApiError(500, 'internal', 'Gagal menyimpan.'))).toBe(
      'Gagal menyimpan.',
    );
    expect(childLinkErrorMessage(new Error('jaringan'))).toBe('jaringan');
  });

  it('explains a child the account may not read', () => {
    expect(portalErrorMessage(new ApiError(404, 'not_found', 'gone'), 'cadangan')).toBe(
      'Data anak belum tertaut ke akun ini.',
    );
    expect(portalErrorMessage(new ApiError(403, 'forbidden', 'no'), 'cadangan')).toBe(
      'Akun ini belum dapat membuka data tersebut.',
    );
  });

  it('keeps other portal errors readable', () => {
    expect(portalErrorMessage(new ApiError(500, 'internal', 'Sisa kuota.'), 'cadangan')).toBe(
      'Sisa kuota.',
    );
    expect(portalErrorMessage(new Error('boom'), 'cadangan')).toBe('cadangan');
  });
});
