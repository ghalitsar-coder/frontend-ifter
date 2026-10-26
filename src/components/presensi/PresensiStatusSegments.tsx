'use client';

import { useTranslations } from 'next-intl';
import {
  PRESENSI_MARKABLE_STATUSES,
  PRESENSI_STATUS_STYLES,
} from '@/components/presensi/presensiStatusStyles';
import type { PresensiStatus } from '@/types/presensi';

const SEGMENT_LABEL_KEYS = {
  hadir: 'status_hadir',
  izin: 'status_izin',
  sakit: 'status_sakit',
  alpa: 'status_alpa',
} as const;

const SEGMENT_SHELL =
  'inline-flex w-full max-w-sm items-center justify-between gap-1 rounded-xl p-1';
const SEGMENT_BASE =
  'flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-center flex font-label-md text-label-md transition-all md:py-1.5';
const SEGMENT_PENDING_PRESENT = `${SEGMENT_BASE} rounded-lg border border-emerald-200 bg-emerald-50 font-semibold text-emerald-800 hover:bg-pine-deep hover:text-surface`;

type MarkableStatus = (typeof PRESENSI_MARKABLE_STATUSES)[number];

/**
 * Whether the row is unrecorded and this is the pre-highlighted Hadir button.
 *
 * @param status - Current row status.
 * @param value - Segment button status.
 * @returns True for the pending Hadir shortcut.
 */
function isPendingPresent(status: PresensiStatus, value: MarkableStatus) {
  return status === 'none' && value === 'hadir';
}

/**
 * Class list for a segment button in its current state.
 *
 * @param status - Current row status.
 * @param value - Segment button status.
 * @returns Tailwind classes.
 */
function segmentClasses(status: PresensiStatus, value: MarkableStatus) {
  if (isPendingPresent(status, value)) {
    return SEGMENT_PENDING_PRESENT;
  }

  const style = PRESENSI_STATUS_STYLES[value];

  if (status === value) {
    return `${SEGMENT_BASE} font-bold shadow-sm ${style.activeButtonClass}`;
  }

  return `${SEGMENT_BASE} border border-transparent font-medium hover:text-on-surface ${style.idleButtonClass}`;
}

/**
 * Class list for the status glyph inside a segment button.
 *
 * @param status - Current row status.
 * @param value - Segment button status.
 * @returns Tailwind classes.
 */
function glyphClasses(status: PresensiStatus, value: MarkableStatus) {
  if (isPendingPresent(status, value)) {
    return 'text-[12px]';
  }

  if (status === value) {
    return PRESENSI_STATUS_STYLES[value].activeGlyphClass;
  }

  return 'text-[12px] opacity-60';
}

/**
 * One-click Hadir/Izin/Sakit/Alpa segment control used by every roster row.
 *
 * @param props - Current status and the change handler.
 * @returns Segment control for the row.
 */
export function PresensiStatusSegments(props: {
  status: PresensiStatus;
  onStatusChange: (status: Exclude<PresensiStatus, 'none'>) => void;
  disabled?: boolean;
}) {
  const t = useTranslations('PresensiPage');
  const isUnrecorded = props.status === 'none';

  return (
    <div
      className={`${SEGMENT_SHELL} ${
        isUnrecorded
          ? 'border-2 border-amber-gold bg-surface shadow-xs'
          : 'border border-border-subtle bg-surface-container-low'
      } ${props.disabled === true ? 'opacity-60' : ''}`}
    >
      {PRESENSI_MARKABLE_STATUSES.map((value) => {
        const style = PRESENSI_STATUS_STYLES[value];

        return (
          <button
            className={segmentClasses(props.status, value)}
            disabled={props.disabled}
            key={value}
            onClick={() => {
              props.onStatusChange(value);
            }}
            type="button"
          >
            <span className={glyphClasses(props.status, value)}>{style.glyph}</span>
            <span>{t(SEGMENT_LABEL_KEYS[value])}</span>
          </button>
        );
      })}
    </div>
  );
}
