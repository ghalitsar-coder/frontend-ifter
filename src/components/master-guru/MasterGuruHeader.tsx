import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Download,
  GraduationCap,
  Plus,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Editorial header and bento analytics summary for Master Data Guru & Penugasan.
 *
 * @param props - Component properties.
 * @returns Header JSX element.
 */
export function MasterGuruHeader(props: {
  totalCount: number;
  homeroomCount: number;
  totalRombels: number;
  activePicketCount: number;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onTogglePiketDrawer: () => void;
  onExport: () => void;
  isPiketDrawerOpen: boolean;
}) {
  const t = useTranslations('MasterGuruPage');

  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* Editorial Title & Actions Bar */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="flex flex-col gap-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              {t('academic_cycle_badge')}
            </span>
            <span className="text-text-muted text-xs">/</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              {t('module_code_badge')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-pine-deep tracking-tight">
            {t('page_title')}
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            {t('page_subtitle', { total: props.totalCount })}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={props.onTogglePiketDrawer}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
              props.isPiketDrawerOpen
                ? 'bg-pine-deep text-white border-pine-deep shadow-sm'
                : 'bg-surface-card text-pine-deep border-border-control hover:bg-pine-light'
            }`}
          >
            <CalendarDays className="size-4" />
            <span>{t('btn_toggle_piket_schedule')}</span>
          </button>

          <button
            type="button"
            onClick={props.onOpenImportModal}
            className="inline-flex items-center gap-2 bg-surface-card text-pine-deep border border-border-control px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-pine-light transition-all cursor-pointer shadow-xs"
          >
            <Upload className="size-4 text-pine-deep" />
            <span>{t('btn_import_excel')}</span>
          </button>

          <button
            type="button"
            onClick={props.onExport}
            className="inline-flex items-center gap-2 bg-surface-card text-pine-deep border border-border-control px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-pine-light transition-all cursor-pointer shadow-xs"
          >
            <Download className="size-4" />
            <span>{t('btn_export_excel')}</span>
          </button>

          <button
            type="button"
            onClick={props.onOpenAddModal}
            className="inline-flex items-center gap-2 bg-pine-deep text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-pine-hover transition-all cursor-pointer shadow-md"
          >
            <Plus className="size-4 text-amber-400" />
            <span>{t('btn_add_teacher')}</span>
          </button>
        </div>
      </div>

      {/* Bento Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Bento 1: Total PTK */}
        <div className="md:col-span-4 bg-pine-deep rounded-2xl p-5 text-white shadow-md flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/5 blur-2xl group-hover:bg-amber-400/10 transition-all duration-700 pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold tracking-wider uppercase text-amber-300">
                {t('metric_total_ptk_title')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-semibold text-pine-light">
                {t('metric_status_all_active')}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {props.totalCount}
              </span>
              <span className="text-sm font-medium text-emerald-100">
                {t('unit_ptk')}
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              {t('metric_total_ptk_desc')}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-amber-200">
            <ShieldCheck className="size-4 text-amber-300 shrink-0" />
            <span>{t('metric_dapodik_synced_hint')}</span>
          </div>
        </div>

        {/* Bento 2: Homeroom Class Distribution */}
        <div className="md:col-span-4 bg-surface-card rounded-2xl p-5 border border-border-control shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold tracking-wider uppercase text-text-muted">
                {t('metric_homeroom_distribution_title')}
              </span>
              <div className="size-7 rounded-lg bg-pine-light text-pine-deep flex items-center justify-center">
                <GraduationCap className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold text-pine-deep tracking-tight">
                {props.homeroomCount} / {props.totalRombels}
              </span>
              <span className="text-sm font-medium text-text-muted">
                {t('unit_rombel')}
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              {t('metric_homeroom_distribution_desc')}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="size-3.5" />
              <span>{t('metric_all_rombels_filled')}</span>
            </div>
            <span className="text-xs font-semibold text-pine-deep hover:underline cursor-pointer flex items-center">
              {t('btn_view_plotting')}
              <ChevronRight className="size-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Bento 3: Today's Gate Picket Duty */}
        <div className="md:col-span-4 bg-amber-50 rounded-2xl p-5 border border-amber-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold tracking-wider uppercase text-amber-800">
                {t('metric_picket_duty_title')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-[11px] font-bold text-amber-900">
                {t('metric_today_monday')}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-950 tracking-tight">
                {props.activePicketCount}
              </span>
              <span className="text-sm font-medium text-amber-800">
                {t('unit_teachers_active')}
              </span>
            </div>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              {t('metric_picket_duty_desc')}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between">
            <div className="flex -space-x-1.5 overflow-hidden">
              <span className="inline-flex size-6 rounded-full bg-pine-deep text-white text-[10px] font-bold items-center justify-center ring-2 ring-amber-50">
                AS
              </span>
              <span className="inline-flex size-6 rounded-full bg-pine-hover text-white text-[10px] font-bold items-center justify-center ring-2 ring-amber-50">
                BS
              </span>
              <span className="inline-flex size-6 rounded-full bg-emerald-700 text-white text-[10px] font-bold items-center justify-center ring-2 ring-amber-50">
                RS
              </span>
              <span className="inline-flex size-6 rounded-full bg-amber-600 text-white text-[10px] font-bold items-center justify-center ring-2 ring-amber-50">
                +2
              </span>
            </div>
            <span className="text-xs font-semibold text-amber-900">
              {t('metric_standby_3_posts')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
