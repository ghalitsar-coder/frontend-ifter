import { describe, expect, it } from 'vitest';
import { initialMockTeachers, mockPicketPosts } from '@/data/mockMasterGuru';

describe('mockMasterGuru', () => {
  it('contains valid teacher profiles with valid NIP and contacts', () => {
    expect(initialMockTeachers.length).toBeGreaterThanOrEqual(8);
    for (const teacher of initialMockTeachers) {
      expect(teacher.id).toMatch(/^ptk-/);
      expect(teacher.name.length).toBeGreaterThan(0);
      expect(teacher.nip.length).toBeGreaterThan(10);
      expect(teacher.email).toContain('@');
      expect(teacher.phone).toMatch(/^\+62/);
      expect(teacher.teachingHoursPerWeek).toBeGreaterThan(0);
    }
  });

  it('verifies homeroom teachers have assigned classes', () => {
    const homeroomTeachers = initialMockTeachers.filter((t) => t.roles.includes('Wali Kelas'));
    expect(homeroomTeachers.length).toBeGreaterThanOrEqual(4);
    for (const teacher of homeroomTeachers) {
      expect(teacher.homeroomClass).toBeDefined();
      expect(teacher.homeroomClass?.className).toMatch(/^Kelas (VII|VIII|IX)/);
      expect(teacher.homeroomClass?.studentCount).toBeGreaterThan(0);
    }
  });

  it('verifies picket posts have assigned active duty officers', () => {
    expect(mockPicketPosts).toHaveLength(3);
    for (const post of mockPicketPosts) {
      expect(post.postNumber).toMatch(/^Pos 0[1-3]/);
      expect(post.officerName.length).toBeGreaterThan(0);
      expect(post.officerInitial).toHaveLength(2);
      expect(post.checkInTime).toMatch(/WIB$/);
      expect(post.isCheckedIn).toBeTruthy();
    }
  });

  it('validates employment status and access level integrity', () => {
    const statuses = new Set(initialMockTeachers.map((t) => t.employmentStatus));
    expect(statuses.has('PNS')).toBeTruthy();
    expect(statuses.has('PPPK')).toBeTruthy();

    const admins = initialMockTeachers.filter((t) => t.accessLevel === 'admin');
    expect(admins.length).toBeGreaterThanOrEqual(1);
    expect(admins[0]?.name).toContain('Sarah Rahma');
  });
});
