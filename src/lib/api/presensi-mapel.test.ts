import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, setAccessToken } from '@/lib/api/client';
import {
  buildAssignmentPayload,
  buildRecordsPayload,
  buildSessionListQuery,
  buildSessionPayload,
  buildSubjectPayload,
  createSession,
  defaultMonthRange,
  fetchAssignments,
  fetchSessionRoster,
  fetchSessions,
  fetchSubjects,
  fetchSubjectReport,
  mapelKeys,
  mapSessionError,
  percentageLabel,
  saveSessionRecords,
  sessionStatusLabel,
  sessionsOptions,
  validateRange,
} from '@/lib/api/presensi-mapel';

const jsonResponse = (status: number, body: unknown) =>
  Response.json(body, {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const fetchMock = vi.fn<typeof globalThis.fetch>();

const parseBody = (init: RequestInit | undefined): unknown => {
  const body = init?.body;
  if (typeof body !== 'string') {
    throw new TypeError('expected a JSON string body');
  }
  return JSON.parse(body);
};

const apiErrorOf = (status: number, code: string, message: string) =>
  new ApiError(status, code, message);

describe('range builders', () => {
  it('spans the first of the month through today', () => {
    expect(defaultMonthRange(new Date(2026, 9, 26))).toStrictEqual({
      from: '2026-10-01',
      to: '2026-10-26',
    });
  });

  it('requires both bounds before calling the backend', () => {
    expect(validateRange({ from: '', to: '2026-10-26' })).toBe(
      'Tanggal mulai dan akhir wajib diisi.',
    );
    expect(validateRange({ from: '2026-10-26', to: '2026-10-1' })).toBe(
      'Format tanggal harus YYYY-MM-DD.',
    );
  });

  it('counts both bounds against the 366-day cap', () => {
    expect(validateRange({ from: '2026-10-01', to: '2026-10-01' })).toBeNull();
    expect(validateRange({ from: '2025-10-01', to: '2026-10-01' })).toBeNull();
    expect(validateRange({ from: '2025-10-01', to: '2026-10-02' })).toBe(
      'Rentang tanggal maksimal 366 hari.',
    );
  });

  it('drops empty session filters from the query', () => {
    expect(
      buildSessionListQuery({
        from: '2026-10-01',
        to: '2026-10-26',
        class_id: '',
        subject_id: '  ',
        teacher_id: 't-1',
        status: 'open',
      }),
    ).toStrictEqual({ from: '2026-10-01', to: '2026-10-26', teacher_id: 't-1', status: 'open' });
  });

  it('adds paging keys only when the caller pages', () => {
    expect(
      buildSessionListQuery({ from: '2026-10-01', to: '2026-10-26' }, { limit: 20, offset: 40 }),
    ).toStrictEqual({ from: '2026-10-01', to: '2026-10-26', limit: 20, offset: 40 });
  });
});

describe('payload builders', () => {
  it('trims subject fields and keeps the active flag', () => {
    expect(
      buildSubjectPayload({
        code: ' mtk ',
        name: '  Matematika ',
        description: ' Wajib ',
        is_active: true,
      }),
    ).toStrictEqual({ code: 'mtk', name: 'Matematika', description: 'Wajib', is_active: true });
  });

  it('rejects a blank or oversized subject code', () => {
    expect(() => buildSubjectPayload({ code: '  ', name: 'Matematika' })).toThrow(
      'Kode mapel wajib diisi.',
    );
    expect(() => buildSubjectPayload({ code: 'X'.repeat(31), name: 'Matematika' })).toThrow(
      'Kode mapel maksimal 30 karakter.',
    );
  });

  it('rejects a subject name longer than the backend cap', () => {
    expect(() => buildSubjectPayload({ code: 'MTK', name: 'N'.repeat(151) })).toThrow(
      'Nama mapel maksimal 150 karakter.',
    );
  });

  it('requires every assignment reference', () => {
    expect(
      buildAssignmentPayload({ teacher_id: ' t-1 ', subject_id: 's-1', class_id: 'c-1' }),
    ).toStrictEqual({ teacher_id: 't-1', subject_id: 's-1', class_id: 'c-1' });
    expect(() =>
      buildAssignmentPayload({ teacher_id: '', subject_id: 's-1', class_id: 'c-1' }),
    ).toThrow('Guru, mapel, dan kelas wajib dipilih.');
  });

  it('keeps JP numbers inside the school day window', () => {
    expect(() =>
      buildSessionPayload({
        teaching_assignment_id: 'a-1',
        session_date: '2026-10-26',
        period_start: 0,
        period_end: 2,
      }),
    ).toThrow('Nomor JP harus antara 1 dan 20.');
    expect(() =>
      buildSessionPayload({
        teaching_assignment_id: 'a-1',
        session_date: '2026-10-26',
        period_start: 5,
        period_end: 3,
      }),
    ).toThrow('JP akhir tidak boleh lebih kecil dari JP awal.');
  });

  it('trims topic and notes and enforces their caps', () => {
    expect(
      buildSessionPayload({
        teaching_assignment_id: 'a-1',
        session_date: '2026-10-26',
        period_start: 1,
        period_end: 2,
        topic: '  Persamaan kuadrat  ',
        notes: '   ',
      }),
    ).toStrictEqual({
      teaching_assignment_id: 'a-1',
      session_date: '2026-10-26',
      period_start: 1,
      period_end: 2,
      topic: 'Persamaan kuadrat',
      notes: '',
    });
    expect(() =>
      buildSessionPayload({
        teaching_assignment_id: 'a-1',
        session_date: '2026-10-26',
        period_start: 1,
        period_end: 2,
        topic: 'T'.repeat(201),
      }),
    ).toThrow('Topik maksimal 200 karakter.');
  });

  it('rejects a session without a valid date', () => {
    expect(() =>
      buildSessionPayload({
        teaching_assignment_id: 'a-1',
        session_date: '26-10-2026',
        period_start: 1,
        period_end: 1,
      }),
    ).toThrow('Tanggal sesi harus YYYY-MM-DD.');
  });

  it('sends only the rows whose status was chosen', () => {
    expect(
      buildRecordsPayload([
        { student_id: 's-1', status: 'present', note: ' ' },
        { student_id: 's-2', status: '', note: 'belum dipilih' },
      ]),
    ).toStrictEqual({ records: [{ student_id: 's-1', status: 'present', note: '' }] });
  });

  it('rejects unknown statuses and a batch above the backend cap', () => {
    expect(() => buildRecordsPayload([{ student_id: 's-1', status: 'hadir', note: '' }])).toThrow(
      'Status absensi tidak dikenali.',
    );
    const rows = Array.from({ length: 201 }, (_, index) => ({
      student_id: `s-${index}`,
      status: 'present',
      note: '',
    }));
    expect(() => buildRecordsPayload(rows)).toThrow('Maksimal 200 siswa per penyimpanan.');
  });
});

describe('labels', () => {
  it('maps session status to Indonesian', () => {
    expect(sessionStatusLabel('open')).toBe('Berlangsung');
    expect(sessionStatusLabel('closed')).toBe('Ditutup');
    expect(sessionStatusLabel('archived')).toBe('archived');
  });

  it('renders the recap percentage with two decimals', () => {
    expect(percentageLabel(100)).toBe('100,00%');
    expect(percentageLabel(85.5)).toBe('85,50%');
  });
});

describe('error mapping', () => {
  it('names the duplicate the caller just tried to create', () => {
    expect(mapSessionError(apiErrorOf(409, 'conflict', 'x'), 'subject')).toBe(
      'Kode mapel sudah dipakai mapel lain.',
    );
    expect(mapSessionError(apiErrorOf(409, 'conflict', 'x'), 'assignment')).toBe(
      'Penugasan guru, mapel, dan kelas ini sudah ada.',
    );
    expect(mapSessionError(apiErrorOf(409, 'conflict', 'x'), 'session')).toBe(
      'Sesi untuk JP awal itu sudah ada pada tanggal tersebut.',
    );
  });

  it('explains a rejected write on a closed session', () => {
    expect(mapSessionError(apiErrorOf(409, 'conflict', 'x'), 'records')).toBe(
      'Sesi sudah ditutup dan tidak bisa diubah.',
    );
    expect(mapSessionError(apiErrorOf(409, 'conflict', 'x'), 'close')).toBe(
      'Sesi sudah ditutup dan tidak bisa diubah.',
    );
  });

  it('separates forbidden from not-found and non-api failures', () => {
    expect(mapSessionError(apiErrorOf(403, 'forbidden', 'x'), 'session')).toBe(
      'Akun Anda tidak punya akses ke data ini.',
    );
    expect(mapSessionError(apiErrorOf(404, 'not_found', 'x'), 'session')).toBe(
      'Data tidak ditemukan.',
    );
    expect(mapSessionError(apiErrorOf(400, 'invalid_request', 'invalid request'), 'session')).toBe(
      'Data belum benar, periksa lagi isinya.',
    );
    expect(mapSessionError(new TypeError('network'), 'subject')).toBe(
      'Terjadi kesalahan. Coba lagi beberapa saat.',
    );
  });

  it('hides server failure details behind the generic message', () => {
    expect(
      mapSessionError(apiErrorOf(500, 'internal', 'sql: no rows in result set'), 'session'),
    ).toBe('Terjadi kesalahan. Coba lagi beberapa saat.');
  });
});

describe('query keys and options', () => {
  it('keys the session list by filters and page', () => {
    expect(mapelKeys.sessions({ from: '2026-10-01', to: '2026-10-02' }, {})).toStrictEqual([
      'presensi-mapel',
      'sessions',
      { from: '2026-10-01', to: '2026-10-02' },
      {},
    ]);
  });

  it('disables the session list until the range is complete', () => {
    expect(buildSessionListQuery({ from: '2026-10-01', to: '' }).to).toBeUndefined();
    expect(sessionsOptions({ from: '2026-10-01', to: '' }, {}, true).enabled).toBeFalsy();
    expect(
      sessionsOptions({ from: '2026-10-01', to: '2026-10-02' }, {}, true).enabled,
    ).toBeTruthy();
  });
});

describe('subject attendance requests', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    setAccessToken(null);
  });

  it('GET /subjects forwards search and the active flag', async () => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: [] }));

    await expect(fetchSubjects({ search: '  mtk ', is_active: true })).resolves.toStrictEqual([]);

    const [url] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(
      expect.stringContaining('/api/v1/subjects?search=mtk&is_active=true'),
    );
  });

  it('GET /teaching-assignments keeps only the set filters', async () => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: [{ id: 'a-1' }] }));

    await expect(
      fetchAssignments({ teacher_id: 't-1', subject_id: '', class_id: 'c-1' }),
    ).resolves.toHaveLength(1);

    const [url] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(
      expect.stringContaining('/api/v1/teaching-assignments?teacher_id=t-1&class_id=c-1'),
    );
  });

  it('GET /attendance-sessions sends the range and unwraps the page', async () => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { data: [{ id: 's-1' }], total: 8, limit: 20, offset: 20 }),
    );

    const page = await fetchSessions(
      { from: '2026-10-01', to: '2026-10-26' },
      { limit: 20, offset: 20 },
    );
    expect(page.total).toBe(8);
    expect(page.data).toHaveLength(1);

    const [url] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/attendance-sessions?from='));
    expect(url).toStrictEqual(expect.stringContaining('limit=20&offset=20'));
  });

  it('GET /attendance-sessions/:id/roster encodes the id', async () => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { data: [{ student_id: 's-1', status: null }] }),
    );

    await expect(fetchSessionRoster('id/1')).resolves.toMatchObject([{ student_id: 's-1' }]);

    const [url] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/attendance-sessions/id%2F1/roster'));
  });

  it('POST /attendance-sessions creates a session from an assignment', async () => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValueOnce(jsonResponse(201, { session: { id: 'ss-1', status: 'open' } }));

    await expect(
      createSession({
        teaching_assignment_id: 'a-1',
        session_date: '2026-10-26',
        period_start: 1,
        period_end: 2,
        topic: 'Persamaan kuadrat',
      }),
    ).resolves.toMatchObject({ id: 'ss-1', status: 'open' });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/attendance-sessions'));
    expect(init?.method).toBe('POST');
    expect(parseBody(init)).toStrictEqual({
      teaching_assignment_id: 'a-1',
      session_date: '2026-10-26',
      period_start: 1,
      period_end: 2,
      topic: 'Persamaan kuadrat',
      notes: '',
    });
  });

  it('PUT /attendance-sessions/:id/records replaces the roster statuses', async () => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: [{ id: 'r-1' }] }));

    await expect(
      saveSessionRecords('id/1', [{ student_id: 's-1', status: 'late', note: 'telat' }]),
    ).resolves.toMatchObject([{ id: 'r-1' }]);

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(
      expect.stringContaining('/api/v1/attendance-sessions/id%2F1/records'),
    );
    expect(init?.method).toBe('PUT');
    expect(parseBody(init)).toStrictEqual({
      records: [{ student_id: 's-1', status: 'late', note: 'telat' }],
    });
  });

  it('GET /reports/subject-attendance returns rows and totals', async () => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        from: '2026-10-01',
        to: '2026-10-26',
        data: [
          { teaching_assignment_id: 'a-1', sessions: 1, records: 3, attendance_percentage: 100 },
        ],
        totals: { sessions: 1, records: 3, attendance_percentage: 100 },
      }),
    );

    await expect(
      fetchSubjectReport({ from: '2026-10-01', to: '2026-10-26', class_id: 'c-1' }),
    ).resolves.toMatchObject({ from: '2026-10-01', totals: { sessions: 1 } });

    const [url] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/reports/subject-attendance?from='));
    expect(url).toStrictEqual(expect.stringContaining('class_id=c-1'));
  });
});
