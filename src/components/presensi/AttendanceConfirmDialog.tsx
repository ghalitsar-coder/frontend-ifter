import { TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

export type ConfirmRequest = {
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
};

/**
 * Lightweight confirmation dialog (FR-E03: explicit confirm before bulk
 * attendance changes). Replaces browser `window.confirm`, which the repo's
 * lint config forbids.
 *
 * @param props - Pending confirmation request and cancel callback.
 * @returns Modal overlay or null when nothing is pending.
 */
export function AttendanceConfirmDialog(props: {
  request: ConfirmRequest | null;
  onCancel: () => void;
}) {
  const t = useTranslations('AttendancePage');
  const { request } = props;

  if (request === null) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-low">
            <TriangleAlert className="size-5 text-amber-600" />
          </div>
          <p className="text-sm text-foreground">{request.message}</p>
        </div>
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={props.onCancel}
            className="rounded-xl border border-border/50 bg-surface-container-low px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-container-high"
          >
            {t('modal_close')}
          </button>
          <button
            type="button"
            onClick={() => {
              request.onConfirm();
            }}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {request.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
