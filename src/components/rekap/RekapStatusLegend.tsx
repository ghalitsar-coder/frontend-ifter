import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Attendance Status Legend Pills for Matrix Table.
 * @returns Rendered status legend component.
 */
export function RekapStatusLegend() {
  const t = useTranslations('RekapPage');

  return (
    <section className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-surface-card px-6 py-4 shadow-xs md:flex-row md:items-center">
      <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Info className="size-4 text-pine-deep" />
        <span>{t('legend_title')}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* H: Hadir */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-status-present px-3 py-1 font-caption text-xs font-semibold text-pine-deep">
          <span className="flex size-4 items-center justify-center rounded-full bg-pine-deep font-caption text-[10px] font-bold text-on-primary">
            H
          </span>
          <span>{t('legend_h')}</span>
        </div>

        {/* T: Terlambat */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed px-3 py-1 font-caption text-xs font-semibold text-[#78350F]">
          <span className="flex size-4 items-center justify-center rounded-full bg-[#78350F] font-caption text-[10px] font-bold text-on-primary">
            T
          </span>
          <span>{t('legend_t')}</span>
        </div>

        {/* S: Sakit */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-status-permission px-3 py-1 font-caption text-xs font-semibold text-[#1E3A8A]">
          <span className="flex size-4 items-center justify-center rounded-full bg-[#1E3A8A] font-caption text-[10px] font-bold text-on-primary">
            S
          </span>
          <span>{t('legend_s')}</span>
        </div>

        {/* I: Izin */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-status-active/40 px-3 py-1 font-caption text-xs font-semibold text-[#581C87]">
          <span className="flex size-4 items-center justify-center rounded-full bg-[#581C87] font-caption text-[10px] font-bold text-on-primary">
            I
          </span>
          <span>{t('legend_i')}</span>
        </div>

        {/* A: Alpa */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-status-absent px-3 py-1 font-caption text-xs font-semibold text-error">
          <span className="flex size-4 items-center justify-center rounded-full bg-error font-caption text-[10px] font-bold text-on-primary">
            A
          </span>
          <span>{t('legend_a')}</span>
        </div>

        {/* L: Libur */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 font-caption text-xs font-medium text-text-muted">
          <span className="flex size-4 items-center justify-center rounded-full bg-outline-variant font-caption text-[10px] font-bold text-text-primary">
            L
          </span>
          <span>{t('legend_l')}</span>
        </div>
      </div>
    </section>
  );
}
