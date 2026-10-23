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
    <div className="mb-8 flex flex-col gap-6">
      {/* Editorial Title & Actions Bar */}
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div className="flex max-w-2xl flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            <span className="text-[11px] font-bold tracking-wider text-amber-700 uppercase">
              {t('academic_cycle_badge')}
            </span>
            <span className="text-text-muted text-xs">/</span>
            <span className="text-text-muted text-[11px] font-semibold tracking-wider uppercase">
              {t('module_code_badge')}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-pine-deep sm:text-3xl lg:text-4xl">
            {t('page_title')}
          </h1>
          <p className="text-text-muted text-sm leading-relaxed">
            {t('page_subtitle', { total: props.totalCount })}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={props.onTogglePiketDrawer}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all sm:text-sm ${
              props.isPiketDrawerOpen
                ? 'border-pine-deep bg-pine-deep text-white shadow-sm'
                : 'bg-surface-card border-border-control text-pine-deep hover:bg-pine-light'
            }`}
          >
            <CalendarDays className="size-4" />
            <span>{t('btn_toggle_piket_schedule')}</span>
          </button>

          <button
            type="button"
            onClick={props.onOpenImportModal}
            className="bg-surface-card inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border-control px-3.5 py-2.5 text-xs font-semibold text-pine-deep shadow-xs transition-all hover:bg-pine-light sm:text-sm"
          >
            <Upload className="size-4 text-pine-deep" />
            <span>{t('btn_import_excel')}</span>
          </button>

          <button
            type="button"
            onClick={props.onExport}
            className="bg-surface-card inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border-control px-3.5 py-2.5 text-xs font-semibold text-pine-deep shadow-xs transition-all hover:bg-pine-light sm:text-sm"
          >
            <Download className="size-4" />
            <span>{t('btn_export_excel')}</span>
          </button>

          <button
            type="button"
            onClick={props.onOpenAddModal}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-pine-deep px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-pine-hover sm:text-sm"
          >
            <Plus className="size-4 text-amber-400" />
            <span>{t('btn_add_teacher')}</span>
          </button>
        </div>
      </div>

      {/* Bento Overview Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {/* Bento 1: Total PTK */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-pine-deep p-5 text-white shadow-md md:col-span-4">
          <div className="pointer-events-none absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-white/5 blur-2xl transition-all duration-700 group-hover:bg-amber-400/10" />
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-amber-300 uppercase">
                {t('metric_total_ptk_title')}
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-pine-light">
                {t('metric_status_all_active')}
              </span>
            </div>
            <div className="mb-1.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                {props.totalCount}
              </span>
              <span className="text-sm font-medium text-emerald-100">{t('unit_ptk')}</span>
            </div>
            <p className="text-xs leading-relaxed text-emerald-100/90">
              {t('metric_total_ptk_desc')}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3 text-xs text-amber-200">
            <ShieldCheck className="size-4 shrink-0 text-amber-300" />
            <span>{t('metric_dapodik_synced_hint')}</span>
          </div>
        </div>

        {/* Bento 2: Homeroom Class Distribution */}
        <div className="bg-surface-card flex flex-col justify-between rounded-2xl border border-border-control p-5 shadow-xs md:col-span-4">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-text-muted text-[11px] font-bold tracking-wider uppercase">
                {t('metric_homeroom_distribution_title')}
              </span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-pine-light text-pine-deep">
                <GraduationCap className="size-4" />
              </div>
            </div>
            <div className="mb-1.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-pine-deep sm:text-4xl">
                {props.homeroomCount} / {props.totalRombels}
              </span>
              <span className="text-text-muted text-sm font-medium">{t('unit_rombel')}</span>
            </div>
            <p className="text-text-muted text-xs leading-relaxed">
              {t('metric_homeroom_distribution_desc')}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="size-3.5" />
              <span>{t('metric_all_rombels_filled')}</span>
            </div>
            <span className="flex cursor-pointer items-center text-xs font-semibold text-pine-deep hover:underline">
              {t('btn_view_plotting')}
              <ChevronRight className="ml-0.5 size-3" />
            </span>
          </div>
        </div>

        {/* Bento 3: Today's Gate Picket Duty */}
        <div className="flex flex-col justify-between rounded-2xl border border-amber-200/80 bg-amber-50 p-5 shadow-xs md:col-span-4">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-amber-800 uppercase">
                {t('metric_picket_duty_title')}
              </span>
              <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-900">
                {t('metric_today_monday')}
              </span>
            </div>
            <div className="mb-1.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-amber-950 sm:text-4xl">
                {props.activePicketCount}
              </span>
              <span className="text-sm font-medium text-amber-800">
                {t('unit_teachers_active')}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-amber-800/90">
              {t('metric_picket_duty_desc')}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-amber-200/60 pt-3">
            <div className="flex -space-x-1.5 overflow-hidden">
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-pine-deep text-[10px] font-bold text-white ring-2 ring-amber-50">
                AS
              </span>
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-pine-hover text-[10px] font-bold text-white ring-2 ring-amber-50">
                BS
              </span>
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-emerald-700 text-[10px] font-bold text-white ring-2 ring-amber-50">
                RS
              </span>
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white ring-2 ring-amber-50">
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
