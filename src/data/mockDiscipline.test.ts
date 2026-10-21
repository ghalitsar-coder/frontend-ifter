import { describe, expect, it } from 'vitest';

import {
  filterDisciplineIncidents,
  mockDisciplineIncidents,
  mockDisciplineRules,
  mockDisciplineWatchlist,
} from './mockDiscipline';

describe('mockDiscipline', () => {
  describe('data integrity', () => {
    it('contains six baseline disciplinary incidents', () => {
      expect(mockDisciplineIncidents).toHaveLength(6);
    });

    it('contains five rule categories matching handbook points', () => {
      expect(mockDisciplineRules).toHaveLength(5);
      const points = mockDisciplineRules.map(r => r.points);
      expect(points).toStrictEqual([2, 3, 5, 25, 50]);
    });

    it('contains three high risk watchlist students', () => {
      expect(mockDisciplineWatchlist).toHaveLength(3);
      expect(mockDisciplineWatchlist[0]?.points).toBeGreaterThanOrEqual(30);
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
      expect(result).toHaveLength(6);
    });

    it('filters incidents by student search query', () => {
      const result = filterDisciplineIncidents(mockDisciplineIncidents, {
        ...baseFilter,
        search: 'rizky',
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.studentName).toBe('Rizky Pratama');
    });

    it('filters incidents by quick tab need_action', () => {
      const result = filterDisciplineIncidents(mockDisciplineIncidents, {
        ...baseFilter,
        quickTab: 'need_action',
      });
      expect(result.every(item => item.status !== 'selesai')).toBeTruthy();
      expect(result).toHaveLength(3);
    });

    it('filters incidents by class selection', () => {
      const result = filterDisciplineIncidents(mockDisciplineIncidents, {
        ...baseFilter,
        selectedClass: 'VIII A',
      });
      expect(result).toHaveLength(3);
      expect(result.every(item => item.studentClass === 'VIII A')).toBeTruthy();
    });

    it('filters incidents by high points threshold', () => {
      const result = filterDisciplineIncidents(mockDisciplineIncidents, {
        ...baseFilter,
        quickTab: 'high_points',
      });
      expect(result.every(item => item.studentTotalPoints >= 30)).toBeTruthy();
      expect(result).toHaveLength(3);
    });
  });
});
