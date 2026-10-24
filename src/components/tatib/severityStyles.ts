import type { RuleSeverity } from '@/types/tatib';

/**
 * Upper bound of each severity band in discipline points, mirroring the
 * backend `default_points` scale for discipline categories.
 */
const SEVERITY_BOUNDS: { severity: RuleSeverity; max: number }[] = [
  { severity: 'ringan', max: 15 },
  { severity: 'sedang', max: 25 },
  { severity: 'berat', max: 50 },
];

/**
 * Derive the severity band from a rule point weight.
 *
 * @param points - Point deduction of the rule.
 * @returns Severity band for the given weight.
 */
export function getRuleSeverity(points: number): RuleSeverity {
  const band = SEVERITY_BOUNDS.find((item) => points <= item.max);
  return band ? band.severity : 'kritis';
}

/**
 * Badge, dot, and ring styling per severity band, shared by catalog and modal.
 */
export const SEVERITY_STYLES: Record<RuleSeverity, { badge: string; dot: string; ring: string }> = {
  ringan: {
    badge: 'border border-pine-light bg-pine-light text-pine-deep',
    dot: 'bg-pine-deep',
    ring: 'border-pine-deep bg-pine-light',
  },
  sedang: {
    badge: 'border border-amber-gold/40 bg-amber-surface text-amber-dark',
    dot: 'bg-amber-gold',
    ring: 'border-amber-gold bg-amber-surface',
  },
  berat: {
    badge: 'border border-rose-200 bg-rose-50 text-rose-700',
    dot: 'bg-rose-400',
    ring: 'border-rose-300 bg-rose-50',
  },
  kritis: {
    badge: 'border border-red-700 bg-red-700 text-white',
    dot: 'bg-red-700',
    ring: 'border-red-700 bg-red-50',
  },
};
