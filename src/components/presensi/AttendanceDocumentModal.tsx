import { Download, FileText, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { DocumentPreviewData } from '@/types/attendance';

/**
 * Modal dialog for inspecting attached student medical certificates or dispensation letters.
 *
 * @param props - Preview data and close callback.
 * @returns Document modal dialog.
 */
export function AttendanceDocumentModal(props: {
  preview: DocumentPreviewData | null;
  onClose: () => void;
  onDownload: () => void;
}) {
  const t = useTranslations('AttendancePage');

  if (!props.preview) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="flex w-full max-w-lg flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">{t('modal_title')}</h3>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-container-low hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Document Card Preview */}
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/50 bg-surface-container-low p-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-card text-primary shadow-xs">
            <FileText className="size-7" />
          </div>
          <span className="mt-2 text-sm font-semibold text-foreground">
            {t('modal_doc_verified')}
          </span>
          <span className="text-xs text-muted-foreground">
            {props.preview.documentName} • {props.preview.studentName}
            {props.preview.clinic ? ` • ${props.preview.clinic}` : ''}
            {props.preview.doctor ? ` • ${props.preview.doctor}` : ''}
          </span>
          <span className="mt-1 rounded-full bg-pastel-mint px-3 py-1 text-xs font-semibold text-black">
            {t('modal_validity')}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={props.onClose}
            className="rounded-xl border border-border/50 bg-surface-container-low px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-container-high"
          >
            {t('modal_close')}
          </button>
          <button
            type="button"
            onClick={props.onDownload}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Download className="size-4" />
            <span>{t('modal_download')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
