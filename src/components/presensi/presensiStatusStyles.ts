import type { PresensiStatus, PresensiStudent } from '@/types/presensi';

/**
 * Translation key of the default status badge label.
 */
export type PresensiBadgeLabelKey =
  | 'badge_hadir'
  | 'badge_sakit'
  | 'badge_izin'
  | 'badge_alpa'
  | 'badge_belum_diinput';

/**
 * Presentational tokens for one attendance status, mirroring the Stitch roster row.
 */
export type PresensiStatusStyle = {
  glyph: string;
  labelKey: PresensiBadgeLabelKey;
  rowClass: string;
  rowAccentClass: string;
  avatarClass: string;
  badgeClass: string;
  badgeDotClass: string;
  activeButtonClass: string;
  activeGlyphClass: string;
  idleButtonClass: string;
};

/**
 * Status → class/label map, taken value-for-value from the Stitch screen markup.
 */
export const PRESENSI_STATUS_STYLES: Record<PresensiStatus, PresensiStatusStyle> = {
  hadir: {
    glyph: '✓',
    labelKey: 'badge_hadir',
    rowClass: 'hover:bg-surface-container-low',
    rowAccentClass: 'border-l-pine-deep',
    avatarClass: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    badgeDotClass: 'bg-emerald-600',
    activeButtonClass: 'bg-pine-deep text-surface',
    activeGlyphClass: 'text-[12px] text-amber-gold',
    idleButtonClass: 'text-on-surface-variant hover:bg-emerald-50 hover:text-emerald-800',
  },
  sakit: {
    glyph: '+',
    labelKey: 'badge_sakit',
    rowClass: 'hover:bg-surface-container-low',
    rowAccentClass: 'border-l-amber-gold',
    avatarClass: 'border-amber-200 bg-amber-50 text-amber-800',
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-800',
    badgeDotClass: 'bg-amber-500',
    activeButtonClass: 'bg-amber-gold text-[#5B4300]',
    activeGlyphClass: 'text-[12px]',
    idleButtonClass: 'text-on-surface-variant hover:bg-amber-50 hover:text-amber-800',
  },
  izin: {
    glyph: '○',
    labelKey: 'badge_izin',
    rowClass: 'hover:bg-surface-container-low',
    rowAccentClass: 'border-l-[#5B88A8]',
    avatarClass: 'border-blue-200 bg-blue-50 text-blue-900',
    badgeClass: 'border-blue-200 bg-blue-50 text-blue-800',
    badgeDotClass: 'bg-blue-600',
    activeButtonClass: 'bg-status-permission text-[#1E3A5F]',
    activeGlyphClass: 'text-[12px]',
    idleButtonClass: 'text-on-surface-variant hover:bg-blue-50 hover:text-blue-800',
  },
  alpa: {
    glyph: '✕',
    labelKey: 'badge_alpa',
    rowClass: 'hover:bg-surface-container-low',
    rowAccentClass: 'border-l-[#D96B6B]',
    avatarClass: 'border-rose-200 bg-rose-50 text-rose-800',
    badgeClass: 'border-rose-200 bg-rose-50 text-rose-800',
    badgeDotClass: 'bg-rose-600',
    activeButtonClass: 'bg-status-absent text-[#7E1D1D]',
    activeGlyphClass: 'text-[12px]',
    idleButtonClass: 'text-on-surface-variant hover:bg-rose-50 hover:text-rose-800',
  },
  none: {
    glyph: '',
    labelKey: 'badge_belum_diinput',
    rowClass: 'bg-[#FDFBF7] hover:bg-[#FAF6EC]',
    rowAccentClass: 'border-l-amber-gold',
    avatarClass: 'border-amber-gold bg-[#FAF0DA] text-amber-dark',
    badgeClass: 'border-amber-gold bg-[#FAF0DA] text-amber-dark',
    badgeDotClass: 'animate-ping bg-amber-gold',
    activeButtonClass: '',
    activeGlyphClass: 'text-[12px] opacity-60',
    idleButtonClass: 'text-on-surface-variant',
  },
};

/**
 * The four markable statuses in the segment control order used by the screen.
 */
export const PRESENSI_MARKABLE_STATUSES = [
  'hadir',
  'izin',
  'sakit',
  'alpa',
] as const satisfies readonly Exclude<PresensiStatus, 'none'>[];

/**
 * Aggregated attendance counters for the metric cards, chips, and split bar.
 */
export type PresensiCounts = {
  total: number;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  unrecorded: number;
  recorded: number;
};

/**
 * Count roster entries per attendance status.
 *
 * @param students - Current roster rows.
 * @returns Status counts plus recorded/unrecorded totals.
 */
export function countPresensiStatuses(students: PresensiStudent[]): PresensiCounts {
  const counts: PresensiCounts = {
    total: students.length,
    hadir: 0,
    sakit: 0,
    izin: 0,
    alpa: 0,
    unrecorded: 0,
    recorded: 0,
  };

  for (const student of students) {
    if (student.status === 'none') {
      counts.unrecorded += 1;
      continue;
    }

    counts.recorded += 1;
    counts[student.status] += 1;
  }

  return counts;
}

/**
 * Share of the roster rounded to one decimal, dropping a trailing ".0" like the screen ("65.6", "25").
 *
 * @param value - Number of students in one bucket.
 * @param total - Roster size.
 * @returns Percentage number formatted without the percent sign.
 */
export function presensiPercent(value: number, total: number): string {
  if (total === 0) {
    return '0';
  }

  return String(Math.round((value / total) * 1000) / 10);
}
