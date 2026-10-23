import { BookOpen, Check, History, Library, Printer, Sparkles, Trees } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ActiveCompensation } from '@/types/piket';

function renderIcon(iconName: ActiveCompensation['areaIcon']) {
  switch (iconName) {
    case 'park': {
      return <Trees className="size-3 text-amber-dark" />;
    }
    case 'local_library': {
      return <Library className="size-3 text-amber-dark" />;
    }
    case 'cleaning_services': {
      return <Sparkles className="size-3 text-amber-dark" />;
    }
    case 'menu_book': {
      return <BookOpen className="size-3 text-amber-dark" />;
    }
    default: {
      return <Trees className="size-3 text-amber-dark" />;
    }
  }
}

/**
 * Morning Disciplinary Tasks & Compensation Tracker.
 * @param props - Component properties.
 * @returns Rendered active compensation tracker.
 */
export function PiketActiveCompensation(props: {
  compensations: ActiveCompensation[];
  onCompleteCompensation: (id: string) => void;
  onPrintPermit: (student: ActiveCompensation) => void;
  onPrintRecap: () => void;
}) {
  const t = useTranslations('PiketPage');

  const activeCount = props.compensations.filter((c) => !c.isCompleted).length;

  return (
    <div className="bg-surface-card rounded-2xl p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-amber-dark" />
            <h2 className="text-text-primary text-lg font-bold">{t('comp_title')}</h2>
          </div>
          <p className="font-caption text-text-muted text-xs">{t('comp_subtitle')}</p>
        </div>
        <span className="font-caption rounded-full bg-amber-surface px-2.5 py-1 text-xs font-bold text-amber-dark">
          {t('comp_active_badge', { count: activeCount })}
        </span>
      </div>

      <div className="space-y-3 pt-2">
        {props.compensations.map((item) => (
          <div
            key={item.id}
            className="bg-canvas-base flex items-center justify-between gap-3 rounded-xl p-3.5 transition-colors hover:bg-pine-light/20"
          >
            <div className="flex items-center gap-3">
              <div className="text-on-primary flex size-9 shrink-0 items-center justify-center rounded-full bg-pine-deep text-xs font-bold">
                {item.initials}
              </div>
              <div className="space-y-0.5">
                <p className="text-text-primary text-xs leading-tight font-bold">
                  {item.studentName} ({item.className.replace('Kelas ', '')})
                </p>
                <p className="font-caption text-text-muted flex items-center gap-1 text-[11px]">
                  {renderIcon(item.areaIcon)}
                  <span>Area: {item.area}</span>
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {item.isCompleted ? (
                <>
                  <span className="font-caption rounded-md bg-amber-surface px-2 py-1 text-xs font-semibold text-amber-dark">
                    {t('comp_done_badge')}
                  </span>
                  <button
                    className="hover:bg-amber-hover flex size-8 items-center justify-center rounded-lg bg-amber-gold text-pine-deep shadow-xs transition-colors"
                    title={t('btn_print_permit')}
                    type="button"
                    onClick={() => {
                      props.onPrintPermit(item);
                    }}
                  >
                    <Printer className="size-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className="font-caption rounded-md bg-pine-light px-2 py-1 text-xs font-semibold text-pine-deep">
                    {t('comp_remaining_min', { count: item.remainingMinutes })}
                  </span>
                  <button
                    className="text-on-primary flex size-8 items-center justify-center rounded-lg bg-pine-deep shadow-xs transition-colors hover:bg-pine-hover"
                    title={t('btn_mark_complete')}
                    type="button"
                    onClick={() => {
                      props.onCompleteCompensation(item.id);
                    }}
                  >
                    <Check className="size-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="font-caption text-text-muted mt-4 flex items-center justify-between border-t border-border-subtle pt-3 text-xs">
        <span className="flex items-center gap-1 font-medium text-pine-deep">
          <History className="size-3.5" />
          {t('comp_cutoff')}
        </span>
        <button
          className="font-semibold text-pine-deep transition-colors hover:text-pine-hover"
          type="button"
          onClick={() => {
            props.onPrintRecap();
          }}
        >
          {t('btn_print_recap')}
        </button>
      </div>
    </div>
  );
}
