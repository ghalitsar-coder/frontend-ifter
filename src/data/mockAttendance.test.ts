import { describe, expect, it } from 'vitest';
import { INITIAL_STUDENT_ROSTER } from './mockAttendance';

describe('Mock attendance roster', () => {
  describe('Dataset integrity', () => {
    it('contains ten sample students for class VIII A', () => {
      expect(INITIAL_STUDENT_ROSTER).toHaveLength(10);
    });

    it('ensures each student has unique id and nisn', () => {
      const ids = new Set(INITIAL_STUDENT_ROSTER.map((s) => s.id));
      const nisns = new Set(INITIAL_STUDENT_ROSTER.map((s) => s.nisn));

      expect(ids.size).toBe(INITIAL_STUDENT_ROSTER.length);
      expect(nisns.size).toBe(INITIAL_STUDENT_ROSTER.length);
    });

    it('assigns valid attendance categories', () => {
      const validStatuses = new Set(['hadir', 'sakit', 'izin', 'alpa']);

      for (const student of INITIAL_STUDENT_ROSTER) {
        expect(validStatuses.has(student.status)).toBeTruthy();
      }
    });

    it('provides document details when student has doctor certificate', () => {
      const alya = INITIAL_STUDENT_ROSTER.find((s) => s.id === '2');

      expect(alya).toBeDefined();
      expect(alya?.documentName).toBe('SKD_RSKasihIbu.pdf');
      expect(alya?.documentClinic).toBe('RS Kasih Ibu');
    });
  });
});
