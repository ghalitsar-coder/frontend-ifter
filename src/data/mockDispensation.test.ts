import { describe, expect, it } from 'vitest';
import {
  countInclusiveDays,
  getCoverageHours,
  getCoverageSessions,
  getCoveredLessonHours,
  mockDispensationEvent,
  mockDispensationStudent,
} from '@/data/mockDispensation';

describe('dispensation date range', () => {
  it('counts both ends of a multi-day event', () => {
    expect(countInclusiveDays('2026-10-07', '2026-10-09')).toBe(3);
  });

  it('treats a single day as one effective day', () => {
    expect(countInclusiveDays('2026-10-07', '2026-10-07')).toBe(1);
  });

  it('rejects reversed and malformed ranges', () => {
    expect(countInclusiveDays('2026-10-09', '2026-10-07')).toBe(0);
    expect(countInclusiveDays('not-a-date', '2026-10-09')).toBe(0);
  });
});

describe('dispensation coverage', () => {
  it('covers every session for a full-day dispensation', () => {
    expect(getCoverageSessions('full')).toBe('1-8');
    expect(getCoverageHours('full')).toBe(8);
  });

  it('covers only the afternoon for a partial dispensation', () => {
    expect(getCoverageSessions('partial')).toBe('5-8');
    expect(getCoverageHours('partial')).toBe(4);
  });

  it('totals the lesson hours of the mock event', () => {
    const days = countInclusiveDays(mockDispensationEvent.startIso, mockDispensationEvent.endIso);

    expect(getCoveredLessonHours(days, 'full')).toBe(24);
    expect(getCoveredLessonHours(days, 'partial')).toBe(12);
  });
});

describe('dispensation request data', () => {
  it('identifies the student with their attendance number and NISN', () => {
    expect(mockDispensationStudent.attendanceNumber).toBe('03');
    expect(mockDispensationStudent.nisn).toHaveLength(8);
    expect(mockDispensationStudent.className).toBe('Kelas VIII A');
  });
});
