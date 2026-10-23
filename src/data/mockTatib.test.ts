import { describe, expect, it } from 'vitest';
import { getRuleSeverity, mockSanctionTiers, mockTatibRules } from '@/data/mockTatib';

describe('mockTatib', () => {
  it('maps low weights onto the light severity bands', () => {
    expect(getRuleSeverity(2)).toBe('ringan');
    expect(getRuleSeverity(15)).toBe('ringan');
    expect(getRuleSeverity(16)).toBe('sedang');
    expect(getRuleSeverity(25)).toBe('sedang');
  });

  it('maps high weights onto the heavy severity bands', () => {
    expect(getRuleSeverity(26)).toBe('berat');
    expect(getRuleSeverity(50)).toBe('berat');
    expect(getRuleSeverity(51)).toBe('kritis');
  });

  it('keeps article codes unique and sequential', () => {
    const codes = mockTatibRules.map((rule) => rule.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const rule of mockTatibRules) {
      expect(rule.code).toMatch(/^PASAL-\d{2}$/u);
    }
  });

  it('covers every severity band with at least one article', () => {
    const bands = new Set(mockTatibRules.map((rule) => getRuleSeverity(rule.points)));
    expect(bands).toStrictEqual(new Set(['ringan', 'sedang', 'berat', 'kritis']));
  });

  it('escalates sanction thresholds in ascending order', () => {
    const thresholds = mockSanctionTiers.map((tier) => tier.threshold);
    const isAscending = thresholds.every(
      (threshold, index) => index === 0 || (thresholds[index - 1] ?? 0) < threshold,
    );
    expect(isAscending).toBeTruthy();
    expect(thresholds.at(0)).toBe(30);
    expect(thresholds.at(-1)).toBe(100);
  });
});
