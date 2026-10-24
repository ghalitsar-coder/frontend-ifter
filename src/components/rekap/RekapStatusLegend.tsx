import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Attendance Status Legend Pills for Matrix Table.
 * @returns Rendered status legend component.
 */
export function RekapStatusLegend() {
  const t = useTranslations('RekapPage');

  return (
    <section className="bg-surface-card flex flex-col items-start justify-between gap-4 rounded-2xl px-6 py-4 shadow-xs md:flex-row md:items-center">
      <div className="text-text-primary flex items-center gap-2 text-sm font-semibold">
        <Info className="size-4 text-pine-deep" />
        <span>{t('legend_title')}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* H: Hadir */}
        <div className="bg-status-present font-caption inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-pine-deep">
          <span className="font-caption text-on-primary flex size-4 items-center justify-center rounded-full bg-pine-deep text-[10px] font-bold">
            H
          </span>
          <span>{t('legend_h')}</span>
        </div>

        {/* T: Terlambat */}
        <div className="bg-secondary-fixed font-caption inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-[#78350F]">
          <span className="font-caption text-on-primary flex size-4 items-center justify-center rounded-full bg-[#78350F] text-[10px] font-bold">
            T
          </span>
          <span>{t('legend_t')}</span>
        </div>

        {/* S: Sakit */}
        <div className="bg-status-permission font-caption inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-[#1E3A8A]">
          <span className="font-caption text-on-primary flex size-4 items-center justify-center rounded-full bg-[#1E3A8A] text-[10px] font-bold">
            S
          </span>
          <span>{t('legend_s')}</span>
        </div>

        {/* I: Izin */}
        <div className="bg-status-active/40 font-caption inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-[#581C87]">
          <span className="font-caption text-on-primary flex size-4 items-center justify-center rounded-full bg-[#581C87] text-[10px] font-bold">
            I
          </span>
          <span>{t('legend_i')}</span>
        </div>

        {/* A: Alpa */}
        <div className="bg-status-absent font-caption text-error inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
          <span className="bg-error font-caption text-on-primary flex size-4 items-center justify-center rounded-full text-[10px] font-bold">
            A
          </span>
          <span>{t('legend_a')}</span>
        </div>

        {/* L: Libur */}
        <div className="bg-surface-container font-caption text-text-muted inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
          <span className="bg-outline-variant font-caption text-text-primary flex size-4 items-center justify-center rounded-full text-[10px] font-bold">
            L
          </span>
          <span>{t('legend_l')}</span>
        </div>
      </div>
    </section>
  );
}
