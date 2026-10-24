import { CalendarDays, Clock, HeartPulse, ShieldAlert, UserCheck, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { RekapSummaryMetrics } from '@/types/rekap';

/**
 * Summary Bento Grid for Monthly Attendance Metrics.
 * @param props - Component properties.
 * @returns Rendered Summary Bento component.
 */
export function RekapSummaryBento(props: { metrics: RekapSummaryMetrics }) {
  const t = useTranslations('RekapPage');

  return (
    <section className="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-6">
      {/* Tile 1: Effective Days */}
      <div className="bg-surface-card flex flex-col justify-between rounded-2xl p-4 shadow-xs transition-all hover:shadow-md">
        <div className="text-text-muted flex items-center justify-between">
          <span className="font-caption text-[11px] font-semibold tracking-wider uppercase">
            {t('tile_effective_days')}
          </span>
          <CalendarDays className="size-4 text-pine-deep" />
        </div>
        <div className="mt-3">
          <span className="text-text-primary text-2xl font-bold tracking-tight">
            {props.metrics.effectiveDays}
          </span>
          <span className="font-caption text-text-muted ml-1 text-xs">
            {t('tile_effective_days_unit')}
          </span>
        </div>
        <div className="font-caption text-text-muted mt-2 flex items-center gap-1 text-[11px]">
          <span className="size-1.5 rounded-full bg-pine-deep" />
          <span className="truncate">{t('tile_effective_days_sub')}</span>
        </div>
      </div>

      {/* Tile 2: Class Average (Hero Tile) */}
      <div className="text-on-primary flex flex-col justify-between rounded-2xl bg-pine-deep p-4 shadow-xs transition-all hover:shadow-md">
        <div className="text-tertiary-fixed-dim flex items-center justify-between">
          <span className="font-caption text-[11px] font-semibold tracking-wider uppercase">
            {t('tile_class_avg')}
          </span>
          <UserCheck className="size-4 text-amber-gold" />
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-amber-gold">
            {props.metrics.classAveragePercentage}%
          </span>
          <span className="font-caption text-tertiary-fixed-dim text-[11px] font-medium">
            ↑ +{props.metrics.classAverageDelta}%
          </span>
        </div>
        <div className="font-caption text-tertiary-fixed-dim mt-2 text-[11px]">
          {t('tile_class_avg_target')}
        </div>
      </div>

      {/* Tile 3: Total Sakit */}
      <div className="bg-surface-card flex flex-col justify-between rounded-2xl p-4 shadow-xs transition-all hover:shadow-md">
        <div className="text-text-muted flex items-center justify-between">
          <span className="font-caption text-[11px] font-semibold tracking-wider uppercase">
            {t('tile_sick')}
          </span>
          <HeartPulse className="size-4 text-[#1E3A8A]" />
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold tracking-tight text-[#1E3A8A]">
            {props.metrics.totalSakit}
          </span>
          <span className="font-caption text-text-muted ml-1 text-xs">{t('tile_sick_unit')}</span>
        </div>
        <div className="font-caption text-text-muted mt-2 truncate text-[11px]">
          {t('tile_sick_sub')}
        </div>
      </div>

      {/* Tile 4: Total Izin */}
      <div className="bg-surface-card flex flex-col justify-between rounded-2xl p-4 shadow-xs transition-all hover:shadow-md">
        <div className="text-text-muted flex items-center justify-between">
          <span className="font-caption text-[11px] font-semibold tracking-wider uppercase">
            {t('tile_permission')}
          </span>
          <Users className="size-4 text-[#581C87]" />
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold tracking-tight text-[#581C87]">
            {props.metrics.totalIzin}
          </span>
          <span className="font-caption text-text-muted ml-1 text-xs">
            {t('tile_permission_unit')}
          </span>
        </div>
        <div className="font-caption text-text-muted mt-2 truncate text-[11px]">
          {t('tile_permission_sub')}
        </div>
      </div>

      {/* Tile 5: Total Alpa */}
      <div className="bg-surface-card flex flex-col justify-between rounded-2xl p-4 shadow-xs transition-all hover:shadow-md">
        <div className="text-text-muted flex items-center justify-between">
          <span className="font-caption text-[11px] font-semibold tracking-wider uppercase">
            {t('tile_absent')}
          </span>
          <ShieldAlert className="text-error size-4" />
        </div>
        <div className="mt-3">
          <span className="text-error text-2xl font-bold tracking-tight">
            {props.metrics.totalAlpa}
          </span>
          <span className="font-caption text-text-muted ml-1 text-xs">{t('tile_absent_unit')}</span>
        </div>
        <div className="font-caption text-error mt-2 truncate text-[11px] font-medium">
          {t('tile_absent_sub')}
        </div>
      </div>

      {/* Tile 6: Terlambat Gerbang */}
      <div className="flex flex-col justify-between rounded-2xl bg-amber-surface p-4 shadow-xs transition-all hover:shadow-md">
        <div className="flex items-center justify-between text-amber-dark">
          <span className="font-caption text-[11px] font-semibold tracking-wider uppercase">
            {t('tile_late')}
          </span>
          <Clock className="size-4 text-amber-dark" />
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold tracking-tight text-amber-dark">
            {props.metrics.totalTerlambat}
          </span>
          <span className="font-caption ml-1 text-xs text-amber-dark/80">
            {t('tile_late_unit')}
          </span>
        </div>
        <div className="font-caption mt-2 truncate text-[11px] text-amber-dark">
          {t('tile_late_sub')}
        </div>
      </div>
    </section>
  );
}
