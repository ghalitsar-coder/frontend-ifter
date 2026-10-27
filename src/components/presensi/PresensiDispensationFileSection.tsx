'use client';

import { useTranslations } from 'next-intl';
import {
  DISPENSATION_FILE_MAX_BYTES,
  formatMegabytes,
} from '@/components/presensi/presensiDispensation';
import type { DispensationIssue } from '@/components/presensi/presensiDispensation';
import { PresensiSpinner } from '@/components/presensi/PresensiSpinner';
import type { DispensationState } from '@/types/presensi';

const PICKER_CLASS =
  'group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border-control bg-surface-container-low/40 p-6 text-center transition-all hover:border-pine-deep hover:bg-surface-container-low sm:p-8';

const ERROR_PICKER_CLASS =
  'group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-red-400 bg-red-50/50 p-4 text-center transition-all hover:bg-red-50/80';

const MAX_MEGABYTES = String(DISPENSATION_FILE_MAX_BYTES / (1024 * 1024));

/**
 * Document picker rendered as a label, so both clicking and dropping a file
 * reach the same hidden input without any imperative open call.
 */
function PresensiFilePicker(props: {
  children: React.ReactNode;
  className: string;
  inputName: string;
  onSelect: (file: File | undefined) => void;
}) {
  return (
    <label
      className={props.className}
      onDragOver={(event) =>{  event.preventDefault(); }}
      onDrop={(event) => {
        event.preventDefault();
        props.onSelect(event.dataTransfer.files[0]);
      }}
    >
      <input
        className="sr-only"
        name={props.inputName}
        onChange={(event) =>{  props.onSelect(event.target.files?.[0]); }}
        type="file"
      />
      {props.children}
    </label>
  );
}

/**
 * Document section of the upload flow: the empty dropzone, the rejected file
 * with its replacement pickers, or the file currently being read.
 *
 * @param props - Chosen document, current state, progress, and pick handlers.
 * @returns The file block matching the modal state.
 */
export function PresensiDispensationFileSection(props: {
  document: File | null;
  issues: DispensationIssue[];
  percent: number;
  state: DispensationState;
  onCancelUpload: () => void;
  onSelectFile: (file: File | undefined) => void;
  onRetry: () => void;
}) {
  const t = useTranslations('PresensiPage');
  const { document } = props;
  const oversized = props.issues.includes('file_too_large') ? document : null;

  if (props.state === 'uploading' && document) {
    const bytesRead = (document.size * props.percent) / 100;

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between font-label-md text-label-md font-semibold text-on-surface">
          <span>{t('upload_file_label')}</span>
          <span className="font-caption text-caption text-text-muted">
            {t('upload_file_limit')}
          </span>
        </div>
        <div className="relative flex flex-col gap-3.5 overflow-hidden rounded-2xl border-2 border-pine-deep/40 bg-surface-container-low/50 p-4 shadow-sm transition-all sm:p-5">
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 shadow-xs">
                <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-label-md text-label-md font-bold text-on-surface">
                  {document.name}
                </span>
                <span className="font-caption text-caption text-text-muted">
                  {t('uploading_progress', {
                    percent: props.percent,
                    read: formatMegabytes(bytesRead),
                    size: formatMegabytes(document.size),
                  })}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-gold bg-amber-surface px-2.5 py-1 font-caption text-caption font-bold text-amber-dark">
                <PresensiSpinner className="h-3.5 w-3.5 text-amber-dark" />
                {t('uploading_percent_badge', { percent: props.percent })}
              </span>
              <button
                className="border-error/20 text-error rounded-lg border px-2.5 py-1 font-caption text-caption font-semibold transition-colors hover:bg-error-container/40"
                onClick={props.onCancelUpload}
                type="button"
              >
                {t('uploading_cancel')}
              </button>
            </div>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
            <div
              className="relative h-full rounded-full bg-gradient-to-r from-pine-deep via-pine-hover to-amber-gold transition-all duration-300"
              style={{ width: `${props.percent}%` }}
            >
              <div className="absolute inset-0 animate-[pulse_1.5s_infinite] bg-white/25" />
            </div>
          </div>
          <div className="flex items-center gap-2.5 border border-border-subtle bg-surface-card/80 p-2.5 pt-1 font-caption text-caption text-on-surface-variant">
            <span className="material-symbols-outlined shrink-0 animate-pulse text-[18px] text-pine-deep">
              document_scanner
            </span>
            <span className="truncate font-medium text-pine-deep">{t('uploading_scan')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (props.state === 'error' && oversized) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md font-semibold text-on-surface">
            {t('upload_file_label')}
          </span>
          <span className="text-error font-caption text-caption font-semibold">
            {t('error_file_limit', {
              max: MAX_MEGABYTES,
              size: formatMegabytes(oversized.size),
            })}
          </span>
        </div>
        <PresensiFilePicker
          className={ERROR_PICKER_CLASS}
          inputName="dispensation-document"
          onSelect={props.onSelectFile}
        >
          <span className="text-error flex h-11 w-11 items-center justify-center rounded-full border border-red-300 bg-white shadow-xs transition-transform group-hover:scale-105">
            <span className="material-symbols-outlined text-[24px]">cloud_sync</span>
          </span>
          <span className="flex flex-col">
            <span className="text-error font-label-md text-label-md font-semibold">
              {t.rich('error_dropzone_title', {
                browse: (chunks) => (
                  <span className="font-bold text-pine-deep underline hover:text-pine-hover">
                    {chunks}
                  </span>
                ),
              })}
            </span>
            <span className="font-caption text-caption text-red-700/80 sm:max-w-sm">
              {t('error_dropzone_hint')}
            </span>
          </span>
        </PresensiFilePicker>
        <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-red-300 bg-red-50/40 p-3.5 shadow-xs">
          <div className="flex min-w-0 items-center gap-3">
            <div className="text-error flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-100">
              <span className="material-symbols-outlined text-[22px] [font-variation-settings:'FILL'_1]">
                warning
              </span>
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="decoration-error/70 truncate font-label-md text-label-md font-bold text-on-surface line-through">
                {oversized.name}
              </span>
              <span className="flex items-center gap-2 font-caption text-caption">
                <span className="text-error font-bold">{formatMegabytes(oversized.size)} MB</span>
                <span className="text-red-400">•</span>
                <span className="text-error inline-flex items-center gap-1 rounded-md bg-red-100/80 px-2 py-0.5 font-bold">
                  <span className="material-symbols-outlined text-[13px] font-bold">cancel</span>
                  {t('error_file_failed')}
                </span>
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              className="text-error hover:border-error inline-flex items-center gap-1 rounded-lg border border-red-300 bg-white px-3 py-1.5 font-caption text-caption font-bold shadow-xs transition-colors hover:bg-red-50"
              onClick={props.onRetry}
              title={t('error_retry')}
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">refresh</span>
              <span>{t('error_retry')}</span>
            </button>
            <PresensiFilePicker
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border-subtle bg-white px-3 py-1.5 font-caption text-caption font-semibold text-pine-deep shadow-xs transition-colors hover:bg-pine-light"
              inputName="dispensation-document-replace"
              onSelect={props.onSelectFile}
            >
              <span className="material-symbols-outlined text-[15px]">upload_file</span>
              <span>{t('error_replace')}</span>
            </PresensiFilePicker>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between font-label-md text-label-md font-semibold text-on-surface">
        <span>{t('upload_file_label')}</span>
        <span className="font-caption text-caption text-text-muted">
          {oversized ? (
            <span className="text-error font-semibold">
              {t('error_file_limit', {
                max: MAX_MEGABYTES,
                size: formatMegabytes(oversized.size),
              })}
            </span>
          ) : (
            t('upload_file_limit')
          )}
        </span>
      </div>
      <PresensiFilePicker
        className={PICKER_CLASS}
        inputName="dispensation-document"
        onSelect={props.onSelectFile}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border-subtle bg-surface-card text-pine-deep shadow-xs transition-transform group-hover:scale-105">
          <span className="material-symbols-outlined text-[26px]">cloud_upload</span>
        </span>
        <span className="flex flex-col gap-1">
          <span className="font-label-md text-label-md font-semibold text-on-surface">
            {t.rich('upload_dropzone_title', {
              browse: (chunks) => (
                <span className="font-bold text-pine-deep underline">{chunks}</span>
              ),
            })}
          </span>
          <span className="font-caption text-caption text-text-muted">
            {t('upload_dropzone_hint')}
          </span>
        </span>
      </PresensiFilePicker>
    </div>
  );
}
