import { FileSpreadsheet, PlusCircle, SlidersHorizontal, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Header section for Discipline and Points management module.
 *
 * @param props - Component properties.
 * @returns Rendered discipline header.
 */
export function DisciplineHeader(props: {
  onOpenRecordModal: () => void;
  onExportExcel: () => void;
  onOpenCategoryRules: () => void;
}) {
  const t = useTranslations('DisciplinePage');

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-xs md:p-8">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="max-w-2xl space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-amber-gold/40 bg-amber-surface px-2.5 py-0.5 text-xs font-semibold text-amber-dark">
              <ShieldCheck className="mr-1 size-3.5" />
              {t('academic_year_badge')}
            </span>
            <span className="inline-flex items-center rounded bg-pine-light px-2 py-0.5 text-[11px] font-semibold text-pine-deep">
              {t('prd_module_badge')}
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
            {t('page_title')}
          </h1>

          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            {t('page_subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={props.onOpenCategoryRules}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted"
          >
            <SlidersHorizontal className="size-4 text-pine-deep" />
            <span>{t('btn_add_category')}</span>
          </button>

          <button
            type="button"
            onClick={props.onExportExcel}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted"
          >
            <FileSpreadsheet className="size-4 text-pine-deep" />
            <span>{t('btn_export_excel')}</span>
          </button>

          <button
            type="button"
            onClick={props.onOpenRecordModal}
            className="group inline-flex items-center gap-2 rounded-xl bg-pine-deep px-5 py-2.5 text-sm font-bold text-white shadow-xs transition-all hover:bg-pine-hover active:scale-[0.99]"
          >
            <span className="size-2 rounded-full bg-amber-gold ring-2 ring-pine-deep/40 transition-transform group-hover:scale-125" />
            <PlusCircle className="size-5" />
            <span>{t('btn_record_violation')}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
