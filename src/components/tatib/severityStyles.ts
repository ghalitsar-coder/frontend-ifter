import type { RuleSeverity } from '@/types/tatib';

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
