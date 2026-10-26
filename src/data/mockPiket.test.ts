import { describe, expect, it } from 'vitest';
import { calculateInfractionPoints, UNIFORM_INFRACTIONS_CATALOG } from './mockPiket';

describe('mockPiket helper functions', () => {
  it('calculates total infraction points correctly', () => {
    const selectedIds = ['inf-dasi', 'inf-sabuk'];
    const total = calculateInfractionPoints(selectedIds, UNIFORM_INFRACTIONS_CATALOG);
    expect(total).toBe(5); // 3 + 2 = 5
  });

  it('returns 0 points when no infractions are selected', () => {
    const total = calculateInfractionPoints([], UNIFORM_INFRACTIONS_CATALOG);
    expect(total).toBe(0);
  });
});
