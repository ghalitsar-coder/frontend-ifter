import { afterEach, describe, expect, it, vi } from 'vitest';
import type { StudentSummaryRecord } from '@/services/disciplineApi';
import {
  DisciplineApiError,
  fetchInspections,
  fetchStudentSummary,
} from '@/services/disciplineApi';

describe(DisciplineApiError, () => {
  it('correctly constructs with code, message and status', () => {
    const err = new DisciplineApiError({
      code: 'invalid_points',
      message: 'Points must be non-negative',
      status: 422,
    });

    expect(err.name).toBe('DisciplineApiError');
    expect(err.code).toBe('invalid_points');
    expect(err.message).toBe('Points must be non-negative');
    expect(err.status).toBe(422);
    expect(err instanceof Error).toBeTruthy();
  });
});

describe('Discipline queries', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests inspections for the selected class and date', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ data: [] }));
    vi.stubGlobal('fetch', fetcher);
    await expect(fetchInspections({ classId: 12, tanggal: '2026-11-23' })).resolves.toStrictEqual(
      [],
    );
    expect(fetcher).toHaveBeenCalledWith(
      '/api/backend/v1/discipline/inspections?class_id=12&tanggal=2026-11-23',
      expect.objectContaining({ headers: new Headers({ 'Content-Type': 'application/json' }) }),
    );
  });

  it('returns the requested student summary', async () => {
    const summary: StudentSummaryRecord = {
      student_id: 7,
      total_points: 5,
      total_incidents: 1,
      status_sp: 'sp1',
    };
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ data: summary }));
    vi.stubGlobal('fetch', fetcher);
    await expect(fetchStudentSummary(7)).resolves.toStrictEqual(summary);
    expect(fetcher).toHaveBeenCalledWith(
      '/api/backend/v1/discipline/students/7/summary',
      expect.anything(),
    );
  });
});
