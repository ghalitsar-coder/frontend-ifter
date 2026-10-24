import { describe, expect, it } from 'vitest';
import {
  calculateAggregates,
  filterMatrixRows,
  generateCsvExport,
  generateOctober2026Days,
  MOCK_STUDENT_MATRIX_ROWS,
  OCTOBER_EFFECTIVE_DAYS,
} from './mockRekap';

describe('mockRekap calculations and utilities', () => {
  it('generates 31 days with correct weekend flags for October 2026', () => {
    const days = generateOctober2026Days();
    expect(days).toHaveLength(31);

    // Day 1 Thu (weekday), day 2 Fri (weekday), day 3 Sat and day 4 Sun (weekend)
    expect(days.slice(0, 4).map((d) => [d.dayNumber, d.isWeekend])).toStrictEqual([
      [1, false],
      [2, false],
      [3, true],
      [4, true],
    ]);

    expect(OCTOBER_EFFECTIVE_DAYS).toBe(22);
  });

  it('calculates student aggregates and identifies warning/critical status', () => {
    // 20 hadir, 2 terlambat = 22 presence out of 22 = 100%
    const perfectRecord = {
      1: 'H' as const,
      2: 'H' as const,
      5: 'H' as const,
      6: 'H' as const,
    };
    const res = calculateAggregates(perfectRecord, 4);
    expect(res.totalHadir).toBe(4);
    expect(res.percentage).toBe(100);
    expect(res.raporStatus).toBe('safe');

    // 2 Alpa triggers critical
    const criticalRecord = {
      1: 'H' as const,
      2: 'A' as const,
      3: 'A' as const,
      4: 'H' as const,
    };
    const criticalRes = calculateAggregates(criticalRecord, 4);
    expect(criticalRes.totalAlpa).toBe(2);
    expect(criticalRes.raporStatus).toBe('critical');
  });

  it('filters matrix rows by name and status', () => {
    const searchResult = filterMatrixRows(MOCK_STUDENT_MATRIX_ROWS, 'Rizky', 'all');
    expect(searchResult).toHaveLength(1);
    expect(searchResult[0]?.name).toBe('Rizky Pratama');

    const warningResult = filterMatrixRows(MOCK_STUDENT_MATRIX_ROWS, '', 'warning');
    expect(warningResult.every((r) => r.raporStatus === 'warning')).toBeTruthy();
  });

  it('generates well-formed CSV export string', () => {
    const days = generateOctober2026Days();
    const csv = generateCsvExport(MOCK_STUDENT_MATRIX_ROWS.slice(0, 2), days);
    expect(csv).toContain('No,NIS,Nama Lengkap,L/P');
    expect(csv).toContain('Rizky Pratama');
    expect(csv).toContain('Dimas Saputra');
  });
});
