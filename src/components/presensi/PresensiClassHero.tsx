'use client';

import { useTranslations } from 'next-intl';

/**
 * Editorial class context hero with session meta and the quick mark-present action.
 *
 * @param props - Recorded counts and the mark-remaining handler.
 * @returns Hero card.
 */
export function PresensiClassHero(props: {
  recorded: number;
  total: number;
  progressPercent: number;
  locked: boolean;
  namaKelas: string;
  waliKelas: string | null;
  tanggal: string;
  onMarkRemainingPresent: () => void;
  onTanggalChange: (tanggal: string) => void;
}) {
  const t = useTranslations('PresensiPage');

  return (
    <div className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-2xl border-[1.5px] border-border-control bg-surface p-6 shadow-[0_4px_16px_-2px_rgba(23,63,54,0.06)] md:flex-row md:items-end md:p-8">
      <div className="relative z-10 flex max-w-2xl flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <span className="rounded-full border border-border-control bg-canvas-base px-2.5 py-0.5 font-eyebrow text-eyebrow tracking-wider text-pine-deep uppercase">
            {t('academic_year')}
          </span>
          <span className="font-caption text-caption text-text-muted">{t('semester')}</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg tracking-tight text-on-surface">
          {t('class_name', { name: props.namaKelas })}{' '}
          <span className="font-headline-sm text-headline-sm font-normal text-on-surface-variant">
            {t('homeroom_teacher', {
              teacher: props.waliKelas ?? t('no_homeroom_teacher'),
            })}
          </span>
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 font-label-md text-label-md text-on-surface-variant">
          <label className="inline-flex items-center gap-1.5">
            <span className="sr-only">{t('date_picker_label')}</span>
            <span className="material-symbols-outlined text-[18px] text-text-muted">
              calendar_today
            </span>
            <input
              className="rounded-lg border border-border-control bg-surface px-2 py-1 font-label-md text-label-md text-on-surface focus:border-pine-deep focus:ring-1 focus:ring-pine-deep focus:outline-none"
              onChange={(event) => {
                props.onTanggalChange(event.target.value);
              }}
              type="date"
              value={props.tanggal}
            />
          </label>
          <span className="text-border-control">•</span>
          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-900">
            <span className="material-symbols-outlined text-[18px] text-pine-deep">schedule</span>
            {t('session_time')}
          </span>
          <span className="text-border-control">•</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-text-muted">
              meeting_room
            </span>
            {t('room')}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
        <div className="flex items-center gap-2">
          {!props.locked && (
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-pine-deep px-4 py-2.5 font-label-md text-label-md font-semibold text-surface shadow-sm transition-all hover:bg-pine-hover active:scale-[0.98]"
              onClick={props.onMarkRemainingPresent}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-amber-gold">
                done_all
              </span>
              <span>{t('mark_remaining_present')}</span>
            </button>
          )}
          <button
            className="rounded-xl border border-border-subtle bg-surface-container-low p-2.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            title={t('history_tooltip')}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">history</span>
          </button>
        </div>
        <span className="font-caption text-caption font-medium text-amber-dark">
          {t('recorded_caption', {
            recorded: props.recorded,
            total: props.total,
            percent: props.progressPercent,
          })}
        </span>
      </div>
    </div>
  );
}
