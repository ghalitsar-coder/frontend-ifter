import { describe, expect, it } from 'vitest';
import {
  calculateInfractionPoints,
  filterTapLogs,
  INITIAL_RFID_TAP_LOGS,
  UNIFORM_INFRACTIONS_CATALOG,
} from './mockPiket';

describe('mockPiket helper functions', () => {
  it('returns all logs when filter options are default', () => {
    const results = filterTapLogs(INITIAL_RFID_TAP_LOGS, {
      searchKeyword: '',
      classFilter: 'all',
      statusFilter: 'all',
    });
    expect(results).toHaveLength(INITIAL_RFID_TAP_LOGS.length);
  });

  it('filters logs by search keyword correctly', () => {
    const results = filterTapLogs(INITIAL_RFID_TAP_LOGS, {
      searchKeyword: 'Rizky',
      classFilter: 'all',
      statusFilter: 'all',
    });
    expect(results).toHaveLength(1);
    expect(results[0]?.studentName).toBe('Rizky Pratama');
  });

  it('filters logs by status filter', () => {
    const lateResults = filterTapLogs(INITIAL_RFID_TAP_LOGS, {
      searchKeyword: '',
      classFilter: 'all',
      statusFilter: 'late',
    });
    expect(lateResults.every((item) => item.status === 'late')).toBeTruthy();
    expect(lateResults.length).toBeGreaterThan(0);
  });

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
