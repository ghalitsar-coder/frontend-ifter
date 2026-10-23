import { describe, expect, it } from 'vitest';
import {
  filterCorrectionLogs,
  mockCorrectionLogs,
  mockCorrectionStats,
  paginateCorrectionLogs,
} from '@/data/mockAttendanceCorrection';
import type { CorrectionFilterState } from '@/types/attendanceCorrection';

const defaultFilters: CorrectionFilterState = {
  search: '',
  change: 'all',
  className: 'all',
};

describe('correction audit filters', () => {
  it('matches entries by student name and NIS', () => {
    expect(
      filterCorrectionLogs(mockCorrectionLogs, { ...defaultFilters, search: 'nadia' }),
    ).toHaveLength(1);
    expect(
      filterCorrectionLogs(mockCorrectionLogs, { ...defaultFilters, search: '00829103' }),
    ).toHaveLength(1);
    expect(
      filterCorrectionLogs(mockCorrectionLogs, { ...defaultFilters, search: 'tidak-ada' }),
    ).toHaveLength(0);
  });

  it('groups changes by the selected change filter', () => {
    const countFor = (change: CorrectionFilterState['change']) =>
      filterCorrectionLogs(mockCorrectionLogs, { ...defaultFilters, change }).length;

    expect(countFor('alpa_sakit')).toBe(5);
    expect(countFor('alpa_izin')).toBe(5);
    expect(countFor('izin_hadir')).toBe(3);
    expect(countFor('dispensasi')).toBe(3);
    expect(countFor('all')).toBe(mockCorrectionLogs.length);
  });

  it('combines search, change, and class filters', () => {
    const result = filterCorrectionLogs(mockCorrectionLogs, {
      search: 'fajar',
      change: 'alpa_sakit',
      className: 'VII D',
    });

    expect(result).toHaveLength(1);
    expect(result.at(0)?.student.name).toBe('Fajar Ananda');
  });
});

describe('correction audit pagination', () => {
  it('slices entries into five-row pages', () => {
    const firstPage = paginateCorrectionLogs(mockCorrectionLogs, 1);
    expect(firstPage.items).toHaveLength(5);
    expect(firstPage.start).toBe(1);
    expect(firstPage.end).toBe(5);
    expect(firstPage.totalPages).toBe(4);
  });

  it('reports the bounds of the last page', () => {
    const lastPage = paginateCorrectionLogs(mockCorrectionLogs, 4);
    expect(lastPage.items).toHaveLength(3);
    expect(lastPage.end).toBe(18);
  });

  it('clamps out-of-range page numbers', () => {
    expect(paginateCorrectionLogs(mockCorrectionLogs, 0).page).toBe(1);
    expect(paginateCorrectionLogs(mockCorrectionLogs, 99).page).toBe(4);
    expect(paginateCorrectionLogs([], 3)).toStrictEqual({
      items: [],
      page: 1,
      totalPages: 1,
      start: 0,
      end: 0,
      total: 0,
    });
  });
});

describe('correction statistics', () => {
  it('aligns verification counters with the audit entries', () => {
    const validated = mockCorrectionLogs.filter((log) => log.verification === 'validated');
    const pending = mockCorrectionLogs.filter((log) => log.verification === 'pending');

    expect(validated).toHaveLength(mockCorrectionStats.approved);
    expect(pending).toHaveLength(mockCorrectionStats.pending);
    expect(mockCorrectionLogs).toHaveLength(mockCorrectionStats.totalRequests);
  });

  it('uses unique audit identifiers and NIS values per entry', () => {
    expect(new Set(mockCorrectionLogs.map((log) => log.id)).size).toBe(mockCorrectionLogs.length);
    expect(new Set(mockCorrectionLogs.map((log) => log.student.nis)).size).toBe(
      mockCorrectionLogs.length,
    );
  });
});
