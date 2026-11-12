import { describe, expect, it } from 'vitest';
import { toClassSummaries } from '@/services/recapApi';
import type { StudentRecap } from '@/types/recap';

function makeStudentRecap(
  overrides: Partial<StudentRecap> & { class_id: number; class_name: string },
): StudentRecap {
  return {
    id: 1,
    student_id: 1,
    student_name: 'Andi Susanto',
    bulan: 9,
    tahun: 2026,
    total_hadir: 20,
    total_sakit: 1,
    total_izin: 0,
    total_alpa: 0,
    persentase_hadir: 95,
    status_kunci: 'draft',
    verified_by: null,
    created_at: '2026-09-01T00:00:00Z',
    ...overrides,
  };
}

describe('toClassSummaries', () => {
  it('returns an empty array for an empty input', () => {
    expect(toClassSummaries([])).toStrictEqual([]);
  });

  it('groups a single student into one class summary', () => {
    const summaries = toClassSummaries([
      makeStudentRecap({ class_id: 1, class_name: '1A' }),
    ]);

    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toMatchObject({
      class_id: 1,
      class_name: '1A',
      student_count: 1,
      total_hadir: 20,
      total_sakit: 1,
      total_izin: 0,
      total_alpa: 0,
      persentase_hadir: 95,
    });
  });

  it('sums attendance totals for multiple students in the same class', () => {
    const summaries = toClassSummaries([
      makeStudentRecap({
        class_id: 2,
        class_name: '2B',
        total_hadir: 18,
        total_alpa: 2,
      }),
      makeStudentRecap({
        id: 2,
        student_id: 2,
        class_id: 2,
        class_name: '2B',
        total_hadir: 20,
        total_sakit: 0,
      }),
    ]);

    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toMatchObject({
      student_count: 2,
      total_hadir: 38,
      total_sakit: 1,
      total_alpa: 2,
      persentase_hadir: 93,
    });
  });

  it('produces one summary per distinct class_id', () => {
    const summaries = toClassSummaries([
      makeStudentRecap({ class_id: 1, class_name: '1A' }),
      makeStudentRecap({ id: 2, student_id: 2, class_id: 2, class_name: '2A' }),
    ]);

    expect(summaries).toHaveLength(2);
    expect(summaries.map((summary) => summary.class_id)).toStrictEqual([1, 2]);
  });

  it('sorts summaries alphabetically by class_name', () => {
    const summaries = toClassSummaries([
      makeStudentRecap({ class_id: 2, class_name: '2B' }),
      makeStudentRecap({ id: 2, student_id: 2, class_id: 1, class_name: '1A' }),
    ]);

    expect(summaries.map((summary) => summary.class_name)).toStrictEqual(['1A', '2B']);
  });

  it('calculates the class percentage from the summed attendance counts', () => {
    const summaries = toClassSummaries([
      makeStudentRecap({
        class_id: 1,
        class_name: '1A',
        total_hadir: 1,
        total_sakit: 0,
        total_izin: 0,
        total_alpa: 0,
      }),
      makeStudentRecap({
        id: 2,
        student_id: 2,
        class_id: 1,
        class_name: '1A',
        total_hadir: 1,
        total_sakit: 0,
        total_izin: 0,
        total_alpa: 8,
      }),
    ]);

    expect(summaries[0]?.persentase_hadir).toBe(20);
  });

  it('returns zero when a class has no recorded attendance sessions', () => {
    const summaries = toClassSummaries([
      makeStudentRecap({
        class_id: 1,
        class_name: '1A',
        total_hadir: 0,
        total_sakit: 0,
        total_izin: 0,
        total_alpa: 0,
      }),
    ]);

    expect(summaries[0]?.persentase_hadir).toBe(0);
  });
});
