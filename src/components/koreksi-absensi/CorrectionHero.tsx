import { ChevronRight, Download, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Editorial hero with requirements badge and correction request actions.
 *
 * @param props - Action handlers for export and request modal.
 * @returns Hero section.
 */
export function CorrectionHero(props: { onDownload: () => void; onRequest: () => void }) {
  const t = useTranslations('AttendanceCorrectionPage');

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border-subtle bg-gradient-to-br from-amber-surface via-card to-pine-light/70 p-5 sm:p-8">
      <div className="pointer-events-none absolute -top-16 right-24 size-56 rounded-full bg-amber-gold/15 blur-3xl" />

      <div className="mb-5 flex flex-wrap items-center gap-2 text-[10px] font-bold tracking-wider uppercase">
        <span className="rounded-md bg-card/80 px-2 py-1 text-muted-foreground">
          {t('breadcrumb_group')}
        </span>
        <ChevronRight className="size-3 text-muted-foreground" />
        <span className="rounded-md bg-card/80 px-2 py-1 text-muted-foreground">
          {t('breadcrumb_page')}
        </span>
        <span className="ml-1 inline-flex rotate-6 rounded-full border border-amber-gold bg-amber-gold px-2.5 py-1 text-[9px] font-extrabold text-pine-deep shadow-sm">
          {t('requirement_badge')}
        </span>
      </div>

      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-xl">
          <h1 className="text-3xl leading-[1.05] font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            {t('title')}
          </h1>
          <p className="mt-3 max-w-lg text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {t('description')}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
          <button
            type="button"
            onClick={props.onDownload}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border-control bg-card px-4 py-2.5 text-[11px] font-bold text-foreground transition-colors hover:bg-surface-container-low sm:text-xs"
          >
            <Download className="size-3.5 text-muted-foreground" />
            {t('btn_export')}
          </button>
          <button
            type="button"
            onClick={props.onRequest}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-pine-deep px-4 py-2.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-pine-hover sm:text-xs"
          >
            <Plus className="size-3.5 text-amber-gold" />
            {t('btn_request')}
          </button>
        </div>
      </div>
    </section>
  );
}
