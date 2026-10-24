import { describe, expect, it } from 'vitest';
import { initialMockTeachers, mockPicketPosts } from '@/data/mockMasterGuru';

describe('mockMasterGuru', () => {
  it('contains valid teacher profiles with valid NIP and contacts', () => {
    expect(initialMockTeachers.length).toBeGreaterThanOrEqual(8);
    for (const teacher of initialMockTeachers) {
      expect(teacher).toMatchObject({
        id: expect.stringMatching(/^ptk-/u),
        nip: expect.stringMatching(/^.{11,}$/u),
        email: expect.stringContaining('@'),
        phone: expect.stringMatching(/^\+62/u),
      });
      expect(teacher.name.length > 0 && teacher.teachingHoursPerWeek > 0).toBeTruthy();
    }
  });

  it('verifies homeroom teachers have assigned classes', () => {
    const homeroomTeachers = initialMockTeachers.filter((t) => t.roles.includes('Wali Kelas'));
    expect(homeroomTeachers.length).toBeGreaterThanOrEqual(4);
    for (const teacher of homeroomTeachers) {
      expect(teacher.homeroomClass).toMatchObject({
        className: expect.stringMatching(/^Kelas (VII|VIII|IX)/u),
        studentCount: expect.any(Number),
      });
      expect(teacher.homeroomClass?.studentCount ?? 0).toBeGreaterThan(0);
    }
  });

  it('verifies picket posts have assigned active duty officers', () => {
    expect(mockPicketPosts).toHaveLength(3);
    for (const post of mockPicketPosts) {
      expect(post).toMatchObject({
        postNumber: expect.stringMatching(/^Pos 0[1-3]/u),
        officerInitial: expect.stringMatching(/^.{2}$/u),
        checkInTime: expect.stringMatching(/WIB$/u),
      });
      expect(post.officerName.length > 0 && post.isCheckedIn).toBeTruthy();
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
