'use client';

import { useTranslations } from 'next-intl';

/**
 * Sticky footer save bar with the unsaved-changes state and the two commit actions.
 *
 * @param props - Recorded/remaining counts, save availability and the action handlers.
 * @returns Fixed bottom bar.
 */
export function PresensiSaveBar(props: {
  recorded: number;
  total: number;
  unrecorded: number;
  disabled?: boolean;
  onMarkRemainingPresent: () => void;
  onSaveDraft: () => void;
}) {
  const t = useTranslations('PresensiPage');

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-amber-gold bg-pine-deep/98 px-margin py-3.5 shadow-[0_-4px_24px_rgba(0,0,0,0.18)] backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center">
            <div className="h-3.5 w-3.5 rounded-full bg-emerald-400" />
            <div className="absolute h-3.5 w-3.5 animate-ping rounded-full bg-emerald-400 opacity-75" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-label-md text-label-md font-bold tracking-wide text-white">
                {t('draft_saved')}
              </span>
              <span className="py-0.2 rounded-full bg-amber-gold px-2 text-[11px] font-bold text-pine-deep">
                {t('draft_saved_count', { recorded: props.recorded, total: props.total })}
              </span>
            </div>
            <span className="font-caption text-caption text-emerald-100/80">
              {t('draft_saved_hint', { count: props.unrecorded })}
            </span>
          </div>
        </div>

        <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
          <button
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/30 px-4 py-2.5 font-label-md text-label-md font-semibold text-white transition-all hover:bg-white/10 disabled:pointer-events-none disabled:opacity-50"
            disabled={props.disabled}
            onClick={props.onSaveDraft}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-amber-gold">save</span>
            <span>{t('save_draft')}</span>
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl border-[1.5px] border-amber-hover bg-amber-gold px-5 py-2.5 font-label-md text-label-md font-bold text-pine-deep shadow-md transition-all hover:brightness-105 active:scale-[0.98]"
            onClick={props.onMarkRemainingPresent}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px] font-bold text-pine-deep">
              check_circle
            </span>
            <span>{t('mark_remaining_and_save')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
