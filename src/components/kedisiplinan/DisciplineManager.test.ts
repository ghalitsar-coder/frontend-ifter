import { describe, expect, it } from 'vitest';
import { getStudentAvatarBg, getStudentPointStatus } from './DisciplineManager';

describe('student avatar background tiers', () => {
  it('tiers the avatar background at 30 and 50 points', () => {
    expect(getStudentAvatarBg(60)).toContain('bg-red-100');
    expect(getStudentAvatarBg(35)).toContain('bg-amber-surface');
    expect(getStudentAvatarBg(4)).toContain('bg-pine-light');
  });
});

describe('guidance point status labels', () => {
  it('labels guidance risk from cumulative points', () => {
    expect(getStudentPointStatus(50)).toBe('SP1 Waspada');
    expect(getStudentPointStatus(30)).toBe('Panggilan Ortu');
    expect(getStudentPointStatus(29)).toBe('Aman');
  });
});
