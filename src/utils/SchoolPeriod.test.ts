import { describe, expect, it } from 'vitest';
import { academicPeriodLabel } from '@/utils/SchoolPeriod';

describe('Academic period label', () => {
  it('labels July as the start of the odd semester', () => {
    expect(academicPeriodLabel(new Date('2026-07-01T12:00:00+07:00'))).toBe(
      'T.A. 2026/2027 Ganjil',
    );
  });

  it('labels January as the even semester of the previous academic year', () => {
    expect(academicPeriodLabel(new Date('2027-01-15T12:00:00+07:00'))).toBe('T.A. 2026/2027 Genap');
  });

  it('labels June as the end of the even semester', () => {
    expect(academicPeriodLabel(new Date('2027-06-30T12:00:00+07:00'))).toBe('T.A. 2026/2027 Genap');
  });

  it('rolls to the next academic year at Jakarta midnight', () => {
    expect(academicPeriodLabel(new Date('2026-06-30T18:00:00Z'))).toBe('T.A. 2026/2027 Ganjil');
  });
});
