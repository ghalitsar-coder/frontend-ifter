import { describe, expect, it } from 'vitest';
import { AVAILABLE_ROMBELS, INITIAL_STUDENTS } from '@/data/mockMasterSiswa';

describe('mockMasterSiswa dataset', () => {
  it('contains expected number of student profiles', () => {
    expect(INITIAL_STUDENTS.length).toBeGreaterThanOrEqual(8);
  });

  it('provides valid unique identification numbers for all students', () => {
    const nisSet = new Set(INITIAL_STUDENTS.map((s) => s.nis));
    expect(nisSet.size).toBe(INITIAL_STUDENTS.length);

    const nisnSet = new Set(INITIAL_STUDENTS.map((s) => s.nisn));
    expect(nisnSet.size).toBe(INITIAL_STUDENTS.length);
  });

  it('includes complete guardian details and attendance metrics', () => {
    for (const student of INITIAL_STUDENTS) {
      expect(student.guardian.name.length).toBeGreaterThan(0);
      expect(student.guardian.phone.length).toBeGreaterThan(0);
      expect(student.semesterAttendanceRate).toBeGreaterThanOrEqual(0);
      expect(student.semesterAttendanceRate).toBeLessThanOrEqual(100);
    }
  });

  it('defines available rombel quotas within capacities', () => {
    expect(AVAILABLE_ROMBELS.length).toBeGreaterThanOrEqual(6);
    for (const rombel of AVAILABLE_ROMBELS) {
      expect(rombel.capacity).toBeGreaterThanOrEqual(rombel.currentCount);
    }
  });
});
