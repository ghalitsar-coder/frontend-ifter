import { describe, expect, it } from 'vitest';
import {
  filterRotationCandidates,
  mockRotationCandidates,
  mockRotationCurrentTeacher,
  mockRotationIneligible,
} from './mockTeacherRotation';

describe('mockTeacherRotation', () => {
  it('returns every eligible teacher by default', () => {
    const results = filterRotationCandidates(mockRotationCandidates, '', 'all');

    expect(results).toHaveLength(3);
  });

  it('matches a teacher by name and NIP', () => {
    expect(filterRotationCandidates(mockRotationCandidates, 'hendra', 'all')).toHaveLength(1);
    expect(filterRotationCandidates(mockRotationCandidates, '19900314', 'all')[0]?.name).toBe(
      'Rahmat Fauzi, S.Si',
    );
  });

  it('filters by low workload and subject group', () => {
    expect(filterRotationCandidates(mockRotationCandidates, '', 'low')).toHaveLength(2);
    expect(filterRotationCandidates(mockRotationCandidates, '', 'subject')).toHaveLength(1);
  });

  it('keeps the declared teacher pool at eight', () => {
    expect(mockRotationCandidates.length + mockRotationIneligible.length).toBe(8);
    expect(mockRotationCurrentTeacher.homeroomStudents).toBe(32);
  });
});
