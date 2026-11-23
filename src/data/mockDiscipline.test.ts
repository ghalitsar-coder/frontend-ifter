import { describe, expect, it } from 'vitest';
import {
  filterDisciplineIncidents,
  mockDisciplineIncidents,
  mockDisciplineRules,
  mockDisciplineWatchlist,
} from './mockDiscipline';

describe('mockDiscipline', () => {
  describe('data integrity', () => {
    it('contains four baseline SD disciplinary incidents with codes', () => {
      expect(mockDisciplineIncidents).toHaveLength(4);
      expect(mockDisciplineIncidents[0]?.violationCode).toBe('PRL-05');
    });

    it('contains five rule categories with violation codes', () => {
      expect(mockDisciplineRules).toHaveLength(5);
      const codes = mockDisciplineRules.map((r) => r.code);
      expect(codes).toStrictEqual(['PRL-01', 'ATR-01', 'KRP-01', 'PRL-04', 'PRL-05']);
    });

    it('contains three watchlist students from SD classes', () => {
      expect(mockDisciplineWatchlist).toHaveLength(3);
      expect(mockDisciplineWatchlist[0]?.className).toContain('Kelas');
    });
  });

  describe(filterDisciplineIncidents, () => {
    const baseFilter = {
      search: '',
      selectedClass: '',
      selectedCategory: '',
      selectedStatus: '',
      selectedPeriod: 'bulan',
      quickTab: 'all' as const,
    };

    it('returns all incidents when no filter is applied', () => {
      const result = filterDisciplineIncidents(mockDisciplineIncidents, baseFilter);
      expect(result).toHaveLength(4);
    });

    it('filters incidents by student search query or violation code', () => {
      const byName = filterDisciplineIncidents(mockDisciplineIncidents, {
        ...baseFilter,
        search: 'rizky',
      });
      expect(byName).toHaveLength(1);
      expect(byName[0]?.studentName).toBe('Rizky Pratama');

      const byCode = filterDisciplineIncidents(mockDisciplineIncidents, {
        ...baseFilter,
        search: 'ATR-01',
      });
      expect(byCode).toHaveLength(1);
      expect(byCode[0]?.violationCode).toBe('ATR-01');
    });

    it('filters incidents by quick tab need_action', () => {
      const result = filterDisciplineIncidents(mockDisciplineIncidents, {
        ...baseFilter,
        quickTab: 'need_action',
      });
      expect(result.every((item) => item.status !== 'selesai')).toBeTruthy();
      expect(result).toHaveLength(3);
    });

    it('filters incidents by SD class selection', () => {
      const result = filterDisciplineIncidents(mockDisciplineIncidents, {
        ...baseFilter,
        selectedClass: '3A',
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.studentClass).toBe('3A');
    });

    it('filters incidents by high points threshold', () => {
      const result = filterDisciplineIncidents(mockDisciplineIncidents, {
        ...baseFilter,
        quickTab: 'high_points',
      });
      expect(result.every((item) => item.studentTotalPoints >= 30)).toBeTruthy();
      expect(result).toHaveLength(1);
    });
  });
});
