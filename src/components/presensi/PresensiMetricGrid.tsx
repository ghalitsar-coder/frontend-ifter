'use client';

import { useTranslations } from 'next-intl';
import { presensiPercent } from '@/components/presensi/presensiStatusStyles';
import type { PresensiCounts } from '@/components/presensi/presensiStatusStyles';

type StatusCard = {
  status: 'hadir' | 'sakit' | 'izin' | 'alpa';
  labelKey: string;
  footnoteKey: string;
  /** Full student context shown as the tooltip of the truncated footnote. */
  footnoteTitleKey: string | null;
  cardClass: string;
  accentClass: string;
  labelClass: string;
  circleClass: string;
  glyph: string;
  valueClass: string;
  chipClass: string;
  footnoteClass: string;
};

const STATUS_CARDS = [
  {
    status: 'hadir',
    labelKey: 'metric_hadir',
    footnoteKey: 'metric_hadir_note',
    footnoteTitleKey: null,
    cardClass: 'border-status-present bg-[#FAFDFB]',
    accentClass: 'bg-pine-deep',
    labelClass: 'text-emerald-900',
    circleClass: 'bg-pine-deep text-white',
    glyph: '✓',
    valueClass: 'text-emerald-950',
    chipClass: 'bg-emerald-100 text-emerald-800',
    footnoteClass: 'text-emerald-700',
  },
  {
    status: 'sakit',
    labelKey: 'metric_sakit',
    footnoteKey: 'metric_sakit_note',
    footnoteTitleKey: 'metric_sakit_note_full',
    cardClass: 'border-amber-gold bg-[#FFFCF5]',
    accentClass: 'bg-amber-gold',
    labelClass: 'text-amber-dark',
    circleClass: 'bg-amber-gold text-[#5B4300]',
    glyph: '+',
    valueClass: 'text-amber-dark',
    chipClass: 'bg-[#FAF0DA] text-amber-dark',
    footnoteClass: 'text-amber-dark',
  },
  {
    status: 'izin',
    labelKey: 'metric_izin',
    footnoteKey: 'metric_izin_note',
    footnoteTitleKey: 'metric_izin_note_full',
    cardClass: 'border-status-permission bg-[#F8FAFD]',
    accentClass: 'bg-[#5B88A8]',
    labelClass: 'text-blue-900',
    circleClass: 'bg-status-permission text-blue-900',
    glyph: '○',
    valueClass: 'text-blue-950',
    chipClass: 'bg-blue-100 text-blue-800',
    footnoteClass: 'text-blue-800',
  },
  {
    status: 'alpa',
    labelKey: 'metric_alpa',
    footnoteKey: 'metric_alpa_note',
    footnoteTitleKey: 'metric_alpa_note_full',
    cardClass: 'border-status-absent bg-[#FFF9F9]',
    accentClass: 'bg-[#D96B6B]',
    labelClass: 'text-rose-900',
    circleClass: 'bg-status-absent text-rose-900',
    glyph: '✕',
    valueClass: 'text-rose-950',
    chipClass: 'bg-rose-100 text-rose-800',
    footnoteClass: 'text-rose-800',
  },
] as const satisfies readonly StatusCard[];

/**
 * Live attendance summary: total, unrecorded highlight, and one card per status.
 *
 * @param props - Current counts and the unrecorded filter handler.
 * @returns Six-column metric grid.
 */ export function PresensiMetricGrid(props: {
  counts: PresensiCounts;
  onFilterUnrecorded: () => void;
}) {
  const t = useTranslations('PresensiPage');
  const { counts } = props;
  const remainingShare = Math.round(Number(presensiPercent(counts.unrecorded, counts.total)));

  return (
    <div className="grid grid-cols-2 gap-3.5 md:grid-cols-6">
      <div className="relative col-span-2 flex flex-col justify-between overflow-hidden rounded-2xl border border-pine-hover bg-[linear-gradient(145deg,#173F36_0%,#0F2E27_100%)] p-5 text-white shadow-sm transition-all duration-300 md:col-span-1">
        <div className="flex items-center justify-between">
          <span className="font-caption text-caption font-semibold tracking-wider text-emerald-100/80 uppercase">
            {t('metric_total')}
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-amber-gold">
            <span className="material-symbols-outlined text-[18px]">group</span>
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-headline-lg text-headline-lg font-bold tracking-tight text-white">
            {counts.total}
          </span>
          <span className="font-label-md text-label-md font-medium text-amber-gold">
            {t('metric_total_unit')}
          </span>
        </div>
      </div>

      <button
        className="relative col-span-2 flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border-[1.5px] border-amber-gold bg-amber-surface p-5 text-left shadow-sm transition-all duration-300 hover:shadow-md md:col-span-1"
        onClick={props.onFilterUnrecorded}
        type="button"
      >
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-amber-gold" />
        <div className="flex items-center justify-between">
          <span className="font-caption text-caption font-bold text-amber-dark">
            {t('metric_unrecorded')}
          </span>
          <span className="inline-flex h-6 w-6 animate-bounce items-center justify-center rounded-full bg-amber-gold text-[12px] font-bold text-[#5B4300] shadow-xs">
            !
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-headline-lg text-headline-lg font-bold tracking-tight text-amber-dark">
            {counts.unrecorded}
          </span>
          <span className="rounded-full bg-[#FAF0DA] px-2 py-0.5 font-caption text-caption font-bold text-amber-dark">
            {t('metric_unrecorded_share', { share: remainingShare })}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-amber-gold/30 pt-2 text-[11px] font-semibold text-amber-dark">
          <span>{t('metric_unrecorded_action', { count: counts.unrecorded })}</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </div>
      </button>

      {STATUS_CARDS.map((card) => (
        <div
          className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border-[1.5px] bg-surface p-5 shadow-sm transition-all duration-300 ${card.cardClass}`}
          key={card.status}
        >
          <div className={`absolute top-0 right-0 left-0 h-1.5 ${card.accentClass}`} />
          <div className="flex items-center justify-between">
            <span className={`font-caption text-caption font-bold ${card.labelClass}`}>
              {t(card.labelKey)}
            </span>
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold ${card.circleClass}`}
            >
              {card.glyph}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`font-headline-lg text-headline-lg font-bold tracking-tight ${card.valueClass}`}
            >
              {counts[card.status]}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 font-caption text-caption font-bold ${card.chipClass}`}
            >
              {presensiPercent(counts[card.status], counts.total)}%
            </span>
          </div>
          <span
            className={`mt-1 truncate font-caption text-[11px] font-medium ${card.footnoteClass}`}
            title={card.footnoteTitleKey === null ? undefined : t(card.footnoteTitleKey)}
          >
            {t(card.footnoteKey)}
          </span>
        </div>
      ))}
    </div>
  );
}
