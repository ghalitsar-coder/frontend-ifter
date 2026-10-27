'use client';

import { useTranslations } from 'next-intl';
import { presensiPercent } from '@/components/presensi/presensiStatusStyles';
import type { PresensiCounts } from '@/components/presensi/presensiStatusStyles';

/**
 * Progress summary card with the multi-segment bar and its legend.
 *
 * @param props - Current attendance counts.
 * @returns Split progress bar card.
 */
export function PresensiProgressBarRow(props: { counts: PresensiCounts }) {
  const t = useTranslations('PresensiPage');
  const { counts } = props;
  const filledShare = presensiPercent(counts.recorded, counts.total);

  const segments = [
    { value: counts.hadir, fillClass: 'bg-pine-deep', titleKey: 'legend_hadir' },
    { value: counts.izin, fillClass: 'bg-[#5B88A8]', titleKey: 'legend_izin' },
    { value: counts.sakit, fillClass: 'bg-amber-gold', titleKey: 'legend_sakit' },
    { value: counts.alpa, fillClass: 'bg-[#D96B6B]', titleKey: 'legend_alpa' },
    { value: counts.unrecorded, fillClass: 'bg-neutral-200', titleKey: 'legend_unrecorded' },
  ] as const;

  const legend = [
    {
      value: counts.hadir,
      dotClass: 'bg-pine-deep',
      textClass: 'text-emerald-900',
      shortKey: 'legend_short_hadir',
    },
    {
      value: counts.sakit,
      dotClass: 'bg-amber-gold',
      textClass: 'text-amber-900',
      shortKey: 'legend_short_sakit',
    },
    {
      value: counts.izin,
      dotClass: 'bg-[#5B88A8]',
      textClass: 'text-blue-900',
      shortKey: 'legend_short_izin',
    },
    {
      value: counts.alpa,
      dotClass: 'bg-[#D96B6B]',
      textClass: 'text-rose-900',
      shortKey: 'legend_short_alpa',
    },
  ] as const;

  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border-[1.5px] border-border-control bg-surface p-5 shadow-sm md:flex-row">
      <div className="flex w-full items-center gap-3 md:w-auto">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pine-light text-pine-deep">
          <span className="material-symbols-outlined text-[22px] font-semibold">donut_large</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-label-md text-label-md font-bold text-on-surface">
              {t('progress_title', {
                percent: Math.round(Number(filledShare)),
                recorded: counts.recorded,
                total: counts.total,
              })}
            </span>
            <span className="rounded-full border border-amber-gold bg-amber-surface px-2 py-0.5 font-caption text-caption font-semibold text-amber-dark">
              {t('progress_pending_chip', { count: counts.unrecorded })}
            </span>
          </div>
          <p className="font-caption text-caption text-text-muted">
            {t('progress_caption', { count: counts.unrecorded })}
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-1.5 md:w-96">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-container shadow-inner">
          {segments.map((segment) => (
            <div
              className={`h-full transition-all duration-300 ${segment.fillClass}`}
              key={segment.titleKey}
              style={{ width: `${presensiPercent(segment.value, counts.total)}%` }}
              title={t(segment.titleKey, {
                count: segment.value,
                percent: presensiPercent(segment.value, counts.total),
              })}
            />
          ))}
        </div>
        <div className="flex items-center justify-between px-1 font-caption text-[11px]">
          <div className="flex items-center gap-2.5">
            {legend.map((item) => (
              <span
                className={`inline-flex items-center gap-1 font-medium ${item.textClass}`}
                key={item.shortKey}
              >
                <span className={`h-2 w-2 rounded-full ${item.dotClass}`} />
                {t(item.shortKey, { count: item.value })}
              </span>
            ))}
          </div>
          <span className="inline-flex items-center gap-1 font-bold text-amber-dark">
            {t('legend_short_unrecorded', { count: counts.unrecorded })}
          </span>
        </div>
      </div>
    </div>
  );
}
