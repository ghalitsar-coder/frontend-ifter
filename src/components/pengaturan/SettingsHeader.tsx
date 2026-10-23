import { RotateCcw, Save, Settings2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Page heading with reset and save actions for operational policies.
 *
 * @param props - Component properties.
 * @returns Header JSX element.
 */
export function SettingsHeader(props: {
  isDirty: boolean;
  onReset: () => void;
  onSave: () => void;
}) {
  const t = useTranslations('SettingsPage');

  return (
    <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
      <div className="flex max-w-2xl flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-gold" />
          <span className="text-[11px] font-bold tracking-wider text-amber-dark uppercase">
            {t('academic_year_badge')}
          </span>
          <span className="text-xs text-muted-foreground">/</span>
          <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            {t('module_badge')}
          </span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-pine-deep sm:text-3xl">
          {t('page_title')}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">{t('page_subtitle')}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={props.onReset}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border-control bg-card px-3.5 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-surface-container-low hover:text-pine-deep sm:text-sm"
        >
          <RotateCcw className="size-4" />
          <span>{t('btn_reset')}</span>
        </button>
        <button
          type="button"
          onClick={props.onSave}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-pine-deep px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-colors hover:bg-pine-hover sm:text-sm"
        >
          <Save className="size-4 text-amber-gold" />
          <span>{props.isDirty ? t('btn_save_dirty') : t('btn_save')}</span>
          <Settings2 className="size-3.5 opacity-60" />
        </button>
      </div>
    </div>
  );
}
