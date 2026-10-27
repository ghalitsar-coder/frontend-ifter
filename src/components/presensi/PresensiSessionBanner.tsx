'use client';

import { useTranslations } from 'next-intl';

/**
 * In-progress session banner with the remaining time and the two focus actions.
 *
 * @param props - Remaining unrecorded students and the action handlers.
 * @returns Dark pine action banner.
 */
export function PresensiSessionBanner(props: {
  unrecorded: number;
  recorded: number;
  total: number;
  progressPercent: number;
  onMarkRemainingPresent: () => void;
  onFocusUnrecorded: () => void;
}) {
  const t = useTranslations('PresensiPage');

  return (
    <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl border-[1.5px] border-pine-hover bg-[linear-gradient(135deg,#173F36_0%,#0F2E27_100%)] p-6 shadow-sm md:flex-row">
      <div className="pointer-events-none absolute right-[-2rem] bottom-[-2rem] h-36 w-36 rounded-full bg-white/4" />
      <div className="relative z-10 flex items-center gap-4">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-gold text-pine-deep shadow-md">
          <span className="material-symbols-outlined text-[28px] font-bold">timelapse</span>
          <span className="absolute top-[-0.25rem] right-[-0.25rem] h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="font-headline-sm text-headline-sm font-bold tracking-tight text-white">
              {t('banner_title')}
            </h3>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold tracking-wider text-amber-gold uppercase">
              {t('banner_time_left')}
            </span>
          </div>
          <p className="mt-0.5 font-caption text-caption text-emerald-100/90">
            {t('banner_description', {
              recorded: props.recorded,
              total: props.total,
              percent: props.progressPercent,
              remaining: props.unrecorded,
            })}
          </p>
        </div>
      </div>

      <div className="relative z-10 flex w-full shrink-0 flex-wrap items-center gap-3 md:w-auto">
        <button
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-gold px-5 py-3 font-label-md text-label-md font-bold text-pine-deep shadow-md transition-all hover:brightness-105 active:scale-[0.98] md:flex-initial"
          onClick={props.onMarkRemainingPresent}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
          <span>{t('banner_mark_remaining', { count: props.unrecorded })}</span>
        </button>
        <button
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-[1.5px] border-amber-gold/40 bg-white/8 px-4 py-3 font-label-md text-label-md font-semibold text-white transition-all hover:bg-white/10 md:flex-initial"
          onClick={props.onFocusUnrecorded}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px] text-amber-gold">filter_list</span>
          <span>{t('banner_focus_remaining')}</span>
        </button>
      </div>
    </div>
  );
}
