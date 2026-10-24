import { ArrowLeftRight, Download, Edit3, Megaphone, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Floating drawer triggered when one or more student rows are selected for batch processing.
 *
 * @param props - Component properties.
 * @returns Floating bottom action panel.
 */
export function MasterSiswaBulkDrawer(props: {
  selectedCount: number;
  isStatusPending?: boolean;
  onClearSelection: () => void;
  onOpenMutationModal: () => void;
  onBroadcastCall: () => void;
  onExportSelected: () => void;
  onChangeStatus: () => void;
}) {
  const t = useTranslations('MasterSiswaPage');

  if (props.selectedCount === 0) {
    return null;
  }

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- drawer landmark region needs explicit role for the labelled panel
      role="region"
      aria-live="polite"
      aria-label={t('bulk_drawer_aria')}
      className="fixed bottom-6 left-1/2 z-40 w-[95%] max-w-4xl -translate-x-1/2 animate-in duration-200 fade-in slide-in-from-bottom-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-pine-hover bg-pine-deep p-4 text-white shadow-2xl">
        {/* Count and indicator */}
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-amber-gold text-xs font-black text-pine-deep shadow-xs">
            {props.selectedCount}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">
              {t('bulk_selected_count', { count: props.selectedCount })}
            </span>
            <span className="hidden text-[11px] text-pine-light/80 sm:inline-block">
              {t('bulk_action_hint')}
            </span>
          </div>
        </div>

        {/* Action Button Cluster */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={props.onOpenMutationModal}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20"
          >
            <ArrowLeftRight className="size-3.5 text-amber-gold" />
            <span>{t('btn_bulk_mutate')}</span>
          </button>

          <button
            type="button"
            onClick={props.onBroadcastCall}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20"
          >
            <Megaphone className="size-3.5 text-amber-gold" />
            <span>{t('btn_bulk_call_guardians')}</span>
          </button>

          <button
            type="button"
            onClick={props.onExportSelected}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20"
          >
            <Download className="size-3.5" />
            <span>{t('btn_bulk_export')}</span>
          </button>

          <button
            type="button"
            onClick={props.onChangeStatus}
            disabled={props.isStatusPending === true}
            className="hover:bg-amber-hover flex cursor-pointer items-center gap-1.5 rounded-xl bg-amber-gold px-3 py-2 text-xs font-bold text-pine-deep transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Edit3 className="size-3.5" />
            {/* shortcut: no busy locale key; hard-coded Indonesian action feedback */}
            <span>
              {props.isStatusPending === true ? 'Menyimpan...' : t('btn_bulk_change_status')}
            </span>
          </button>

          <button
            type="button"
            onClick={props.onClearSelection}
            aria-label={t('btn_clear_selection')}
            className="ml-1 flex size-8 cursor-pointer items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
