import { Download, Plus, Users, UserX } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Top header displaying academic year context, summary metrics, and global actions.
 *
 * @param props - Component properties.
 * @returns Rendered header element.
 */
export function MasterSiswaHeader(props: {
  totalCount: number;
  maleCount: number;
  femaleCount: number;
  rombelCapacitySummary: string;
  onOpenAddStudent: () => void;
  onExportExcel: () => void;
  onToggleBulkMode?: () => void;
}) {
  const t = useTranslations('MasterSiswaPage');

  return (
    <div className="flex flex-col gap-6">
      {/* Top Title and Action Row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="flex size-2 animate-pulse rounded-full bg-emerald-600" />
            <span className="font-mono text-xs font-semibold tracking-wider text-pine-deep uppercase">
              {t('academic_year_badge')}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-pine-deep sm:text-3xl">
            {t('page_title')}
          </h1>
          <p className="text-text-muted text-sm">
            {t('page_subtitle', { total: props.totalCount })}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={props.onExportExcel}
            className="bg-surface-card text-text-primary flex cursor-pointer items-center gap-2 rounded-xl border border-border-control px-3.5 py-2 text-xs font-semibold shadow-xs transition-colors hover:bg-surface-container-low sm:text-sm"
          >
            <Download className="text-text-muted size-4" />
            <span>{t('btn_export_excel')}</span>
          </button>

          {props.onToggleBulkMode && (
            <button
              type="button"
              onClick={props.onToggleBulkMode}
              className="bg-surface-card text-text-primary flex cursor-pointer items-center gap-2 rounded-xl border border-border-control px-3.5 py-2 text-xs font-semibold shadow-xs transition-colors hover:bg-surface-container-low sm:text-sm"
            >
              <Users className="size-4 text-pine-deep" />
              <span>{t('btn_bulk_action')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={props.onOpenAddStudent}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-pine-deep px-4 py-2 text-xs font-bold tracking-wide text-white shadow-sm transition-colors hover:bg-pine-hover sm:text-sm"
          >
            <Plus className="size-4 text-amber-gold" />
            <span>{t('btn_add_student')}</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Bento Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="bg-surface-card flex flex-col gap-1.5 rounded-2xl border border-border-control p-4 shadow-xs sm:p-5">
          <div className="text-text-muted flex items-center justify-between text-xs font-medium">
            <span>{t('metric_total_students')}</span>
            <Users className="size-4 text-pine-deep" />
          </div>
          <p className="text-xl font-black tracking-tight text-pine-deep sm:text-2xl">
            {props.totalCount} {t('unit_student')}
          </p>
          <span className="text-text-muted text-[11px]">{t('metric_total_students_hint')}</span>
        </div>

        <div className="bg-surface-card flex flex-col gap-1.5 rounded-2xl border border-border-control p-4 shadow-xs sm:p-5">
          <div className="text-text-muted flex items-center justify-between text-xs font-medium">
            <span>{t('metric_male_students')}</span>
            <span className="rounded bg-pine-light px-1.5 py-0.5 text-xs font-bold text-pine-deep">
              L
            </span>
          </div>
          <p className="text-xl font-black tracking-tight text-pine-deep sm:text-2xl">
            {props.maleCount} {t('unit_student')}
          </p>
          <span className="text-text-muted text-[11px]">
            {Math.round((props.maleCount / (props.totalCount || 1)) * 100)}%{' '}
            {t('metric_ratio_label')}
          </span>
        </div>

        <div className="bg-surface-card flex flex-col gap-1.5 rounded-2xl border border-border-control p-4 shadow-xs sm:p-5">
          <div className="text-text-muted flex items-center justify-between text-xs font-medium">
            <span>{t('metric_female_students')}</span>
            <span className="rounded bg-amber-surface px-1.5 py-0.5 text-xs font-bold text-amber-dark">
              P
            </span>
          </div>
          <p className="text-xl font-black tracking-tight text-pine-deep sm:text-2xl">
            {props.femaleCount} {t('unit_student')}
          </p>
          <span className="text-text-muted text-[11px]">
            {Math.round((props.femaleCount / (props.totalCount || 1)) * 100)}%{' '}
            {t('metric_ratio_label')}
          </span>
        </div>

        <div className="bg-surface-card flex flex-col gap-1.5 rounded-2xl border border-border-control p-4 shadow-xs sm:p-5">
          <div className="text-text-muted flex items-center justify-between text-xs font-medium">
            <span>{t('metric_rombel_fill')}</span>
            <UserX className="size-4 text-amber-dark" />
          </div>
          <p className="text-xl font-black tracking-tight text-pine-deep sm:text-2xl">
            {props.rombelCapacitySummary}
          </p>
          <span className="text-[11px] font-medium text-emerald-700">
            {t('metric_rombel_fill_hint')}
          </span>
        </div>
      </div>
    </div>
  );
}
