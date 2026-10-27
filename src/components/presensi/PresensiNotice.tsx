'use client';

import { PresensiSpinner } from '@/components/presensi/PresensiSpinner';

const NOTICES = {
  empty: {
    cardClass: 'border-border-control bg-surface-container-low text-on-surface-variant',
    glyph: 'school',
  },
  error: { cardClass: 'border-status-absent bg-[#FFF9F9] text-rose-900', glyph: 'warning' },
  loading: {
    cardClass: 'border-border-control bg-surface-container-low text-on-surface-variant',
    glyph: '',
  },
  locked: { cardClass: 'border-amber-gold bg-[#FFFCF5] text-amber-dark', glyph: 'lock' },
} as const;

/**
 * One-line status strip the attendance workspace shows when the roster cannot be worked on.
 *
 * @param props - Strip state and its already-translated text.
 * @returns Bordered notice row.
 */
export function PresensiNotice(props: {
  state: 'empty' | 'error' | 'locked' | 'loading';
  text: string;
}) {
  const notice = NOTICES[props.state];

  return (
    <div
      className={`flex items-center gap-2.5 rounded-2xl border-[1.5px] px-4 py-3.5 font-caption text-caption font-semibold ${notice.cardClass}`}
    >
      {props.state === 'loading' ? (
        <PresensiSpinner className="size-4 shrink-0" />
      ) : (
        <span className="material-symbols-outlined text-[18px]">{notice.glyph}</span>
      )}
      <span>{props.text}</span>
    </div>
  );
}
