import { afterEach, describe, expect, it, vi } from 'vitest';
import { setAccessToken } from '@/lib/api/client';
import {
  fetchStudentCard,
  normalizeCardUid,
  setStudentCard,
  studentCardKeys,
} from '@/lib/api/student-card';

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

describe('card uid normalization', () => {
  it('trims and uppercases the uid', () => {
    expect(normalizeCardUid(' a1b2 c3 ')).toBe('A1B2 C3');
  });

  it('turns blank input into null so callers can clear a binding', () => {
    expect(normalizeCardUid('')).toBeNull();
    expect(normalizeCardUid('   ')).toBeNull();
  });
});

describe('card requests', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    setAccessToken(null);
  });

  it('keys the query per student', () => {
    expect(studentCardKeys.card('stu-1')).toStrictEqual(['master-siswa', 'card', 'stu-1']);
  });

  it('GET /students/:id/card unwraps the student_card field', async () => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { student_card: { student_id: 'stu-1', card_uid: 'A1B2' } }),
    );

    await expect(fetchStudentCard('stu-1')).resolves.toStrictEqual({
      student_id: 'stu-1',
      card_uid: 'A1B2',
    });

    const [url] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/students/stu-1/card'));
  });

  it('PUT /students/:id/card sends the normalized uid', async () => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { student_card: { student_id: 'stu-1', card_uid: 'A1B2' } }),
    );

    await expect(setStudentCard('stu-1', ' a1b2 ')).resolves.toMatchObject({ card_uid: 'A1B2' });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/api/v1/students/stu-1/card'));
    expect(init?.method).toBe('PUT');
    expect(parseBody(init)).toStrictEqual({ card_uid: 'A1B2' });
  });

  it('sends an empty string to clear the binding', async () => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { student_card: { student_id: 'stu-1', card_uid: null } }),
    );

    await expect(setStudentCard('stu-1', null)).resolves.toMatchObject({ card_uid: null });
    expect(parseBody(fetchMock.mock.calls[0]?.[1])).toStrictEqual({ card_uid: '' });
  });

  it('escapes the student id in the path', async () => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { student_card: { student_id: 'a/b', card_uid: null } }),
    );

    await setStudentCard('a/b', null);
    const [url] = fetchMock.mock.calls[0] ?? [];
    expect(url).toStrictEqual(expect.stringContaining('/students/a%2Fb/card'));
  });

  it('surfaces an already-used card as a conflict ApiError', async () => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(409, { code: 'conflict', message: 'card already assigned' }),
    );

    await expect(setStudentCard('stu-1', 'A1B2')).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 'conflict',
    });
  });
});
