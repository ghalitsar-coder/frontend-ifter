import { BookOpen, Download, FileText, Plus, Scale, ShieldCheck, Timer } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Editorial header and bento metrics for the school code of conduct catalog.
 *
 * @param props - Component properties.
 * @returns Header JSX element.
 */
export function TatibHeader(props: {
  ruleCount: number;
  tierCount: number;
  onOpenAddModal: () => void;
  onDownloadHandbook: () => void;
}) {
  const t = useTranslations('TatibPage');

  return (
    <div className="mb-8 flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div className="flex max-w-2xl flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" />
            <span className="text-[11px] font-bold tracking-wider text-pine-deep uppercase">
              {t('academic_year_badge')}
            </span>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              {t('module_badge')}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-pine-deep sm:text-3xl lg:text-4xl">
            {t('page_title')}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">{t('page_subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={props.onDownloadHandbook}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border-control bg-card px-3.5 py-2.5 text-xs font-semibold text-pine-deep shadow-xs transition-colors hover:bg-pine-light sm:text-sm"
          >
            <Download className="size-4" />
            <span>{t('btn_download_handbook')}</span>
          </button>
          <button
            type="button"
            onClick={props.onOpenAddModal}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-pine-deep px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-colors hover:bg-pine-hover sm:text-sm"
          >
            <Plus className="size-4 text-amber-gold" />
            <span>{t('btn_add_rule')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex flex-col justify-between rounded-2xl border border-border-control bg-card p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              {t('metric_total_rules')}
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-pine-light text-pine-deep">
              <BookOpen className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-pine-deep">
              {props.ruleCount}
            </span>
            <span className="text-sm font-medium text-muted-foreground">{t('unit_articles')}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t('metric_total_rules_desc')}</p>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-border-control bg-card p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              {t('metric_sanction_levels')}
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-surface text-amber-dark">
              <Scale className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-pine-deep">
              {props.tierCount}
            </span>
            <span className="text-sm font-medium text-muted-foreground">{t('unit_levels')}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t('metric_sanction_levels_desc')}</p>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-border-control bg-card p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              {t('metric_review_cycle')}
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-pine-light text-pine-deep">
              <Timer className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-pine-deep">
              {t('metric_review_cycle_value')}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t('metric_review_cycle_desc')}</p>
        </div>

        <div className="flex flex-col justify-between rounded-2xl bg-pine-deep p-5 text-white shadow-md">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-amber-gold uppercase">
              {t('metric_notification')}
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-white/10 text-amber-gold">
              <ShieldCheck className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">
              {t('metric_notification_value')}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-100/90">
            <FileText className="size-3.5 shrink-0 text-amber-gold" />
            <span>{t('metric_notification_desc')}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
