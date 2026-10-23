import { CloudUpload, Eye, FileText, LockKeyhole, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { DispensationDocument } from '@/types/dispensation';

/**
 * Verified letter row, replacement trigger, extra-document dropzone, and notes.
 *
 * @param props - Uploaded document and handlers.
 * @returns Upload and disposition card.
 */
export function DispensationUploadCard(props: {
  document: DispensationDocument;
  onPreview: () => void;
  onReplace: () => void;
  onExtraFile: (file: File) => void;
}) {
  const t = useTranslations('DispensationPage');

  return (
    <section className="rounded-2xl border border-border-subtle bg-card p-4 shadow-xs sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-extrabold tracking-tight text-foreground">
            {t('upload_title')}
          </h2>
          <p className="mt-0.5 text-[10px] text-muted-foreground">{t('upload_desc')}</p>
        </div>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-muted-foreground">
          <LockKeyhole className="size-3.5" />
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface-container-low p-3 sm:flex-row sm:items-center">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-pine-deep text-white">
          <FileText className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-bold text-foreground">
            {props.document.fileName}
          </p>
          <p className="text-[9px] text-muted-foreground">
            {t('file_meta', {
              size: props.document.fileSize,
              uploadedBy: props.document.uploadedBy,
              note: props.document.verificationNote,
            })}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-pine-light px-2 py-0.5 text-[9px] font-bold text-pine-deep">
            {t('file_verified')}
          </span>
          <button
            type="button"
            onClick={props.onPreview}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border-control bg-card px-2 py-1 text-[10px] font-bold text-pine-deep transition-colors hover:bg-pine-light"
          >
            <Eye className="size-3" />
            {t('btn_view')}
          </button>
          <button
            type="button"
            onClick={props.onReplace}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border-control bg-card px-2 py-1 text-[10px] font-bold text-muted-foreground transition-colors hover:border-pine-deep hover:text-pine-deep"
          >
            <RefreshCw className="size-3" />
            {t('btn_replace')}
          </button>
        </div>
      </div>

      <label
        htmlFor="dispensation-extra-file"
        className="mt-2 flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-dashed border-border-control bg-surface-container-low/40 px-3 py-3 text-center transition-colors hover:border-pine-deep/40 hover:bg-pine-light/40"
      >
        <CloudUpload className="size-4 text-pine-deep" />
        <span className="text-[10px] text-muted-foreground">
          {t('dropzone_hint')}{' '}
          <span className="font-bold text-pine-deep underline underline-offset-2">
            {t('dropzone_browse')}
          </span>
        </span>
        <span className="text-[9px] text-muted-foreground">{t('dropzone_limit')}</span>
        <input
          id="dispensation-extra-file"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              props.onExtraFile(file);
            }
          }}
        />
      </label>

      <div className="mt-3 rounded-xl bg-surface-container-low p-3">
        <p className="text-[10px] font-bold text-foreground">{t('note_title')}</p>
        <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{t('note_body')}</p>

        <label className="mt-2.5 flex items-start gap-2 text-[10px] leading-relaxed text-muted-foreground">
          <input
            type="checkbox"
            defaultChecked
            className="mt-0.5 size-3 shrink-0 accent-pine-deep"
          />
          <span>
            <strong className="font-semibold text-foreground">{t('notify_parents_title')}</strong>
            <br />
            {t('notify_parents_desc')}
          </span>
        </label>
        <label className="mt-1.5 flex items-start gap-2 text-[10px] leading-relaxed text-muted-foreground">
          <input
            type="checkbox"
            defaultChecked
            className="mt-0.5 size-3 shrink-0 accent-pine-deep"
          />
          <span>
            <strong className="font-semibold text-foreground">{t('notify_journal_title')}</strong>
            <br />
            {t('notify_journal_desc')}
          </span>
        </label>
      </div>
    </section>
  );
}
