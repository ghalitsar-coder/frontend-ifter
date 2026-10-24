'use client';

import { useTranslations } from 'next-intl';
import {
  DISPENSATION_FILE_MAX_BYTES,
  formatMegabytes,
  isDispensationUploadReady,
  listDispensationIssues,
} from '@/components/presensi/presensiDispensation';
import type {
  DispensationCategory,
  DispensationDraft,
} from '@/components/presensi/presensiDispensation';
import { PresensiDispensationFileSection } from '@/components/presensi/PresensiDispensationFileSection';
import { PresensiSpinner } from '@/components/presensi/PresensiSpinner';
import type { DispensationState, PresensiStudent } from '@/types/presensi';

const INPUT_CLASS =
  'w-full h-11 rounded-xl bg-surface-card border border-border-control font-label-md text-label-md text-on-surface placeholder:text-text-placeholder focus:outline-none focus:border-pine-deep focus:ring-1 focus:ring-pine-deep transition-all shadow-xs pl-10 pr-3 [&::-webkit-calendar-picker-indicator]:opacity-40';

const ERROR_INPUT_CLASS =
  'w-full h-11 rounded-xl bg-red-50/40 border-2 border-red-400 pr-9 font-label-md text-label-md text-error focus:outline-none focus:border-error focus:ring-1 focus:ring-error transition-all shadow-xs font-semibold';

const CATEGORY_IDLE = 'font-medium text-on-surface-variant hover:bg-surface-card';
const CATEGORY_ACTIVE = 'font-bold bg-pine-deep text-white shadow-sm';

const MAX_MEGABYTES = String(DISPENSATION_FILE_MAX_BYTES / (1024 * 1024));

const ISSUE_MESSAGE_KEY = {
  end_before_start: 'error_issue_date_range',
  file_too_large: 'error_issue_file_size',
} as const;

const CATEGORY_OPTIONS = [
  { glyph: 'medical_services', labelKey: 'form_category_sick', value: 'sakit' },
  { glyph: 'military_tech', labelKey: 'form_category_dispensation', value: 'izin' },
] as const satisfies readonly { glyph: string; labelKey: string; value: DispensationCategory }[];

/**
 * Upload layout of the dispensation dialog: the empty form a teacher fills in to
 * file a competition permit, then its error, progress and verified bodies.
 *
 * @param props - Student context, draft values, progress, and the flow handlers.
 * @returns Header, body and action footer of the upload flow.
 */
export function PresensiDispensationUpload(props: {
  student: PresensiStudent;
  ordinal: number;
  draft: DispensationDraft;
  percent: number;
  state: DispensationState;
  onCancelUpload: () => void;
  onDraftChange: (draft: DispensationDraft) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const t = useTranslations('PresensiPage');
  const { draft } = props;
  const issues = listDispensationIssues(draft);
  const isUploading = props.state === 'uploading';
  const isError = props.state === 'error';
  const dateRejected = issues.includes('end_before_start');
  const submitReady = isDispensationUploadReady(props.state, draft);

  function selectFile(file: File | undefined) {
    if (file) {
      props.onDraftChange({ ...draft, document: file });
    }
  }

  return (
    <>
      <div className="relative flex items-start justify-between border-b border-border-subtle bg-surface-container-low/70 p-6 pb-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-gold/50 bg-amber-surface px-3 py-0.5 font-eyebrow text-eyebrow font-bold tracking-wider text-amber-dark uppercase">
              <span
                className={`h-1.5 w-1.5 rounded-full bg-amber-dark ${isUploading ? 'animate-pulse' : ''}`}
              />
              {isUploading ? t('uploading_eyebrow') : t('upload_eyebrow')}
            </span>
            {isUploading ? null : (
              <span className="font-caption text-caption text-text-muted">
                {t('upload_document_label')}{' '}
                <span className="font-semibold text-on-surface">{t('upload_document_number')}</span>
              </span>
            )}
          </div>
          <h3
            className="mt-1 font-headline-sm text-headline-sm font-bold tracking-tight text-pine-deep"
            id="dispensation-title"
          >
            {t('upload_title')}
          </h3>
          <p className="font-caption text-caption text-text-muted">{t('upload_context')}</p>
        </div>
        <button
          aria-label={t('modal_close')}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-surface-card text-on-surface-variant shadow-xs transition-all hover:bg-surface-container hover:text-on-surface active:scale-95"
          onClick={props.onClose}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div className="flex max-h-[757px] flex-col gap-5 overflow-y-auto p-6">
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-border-subtle bg-canvas-base p-3.5 shadow-xs sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pine-deep font-label-md text-label-md text-amber-gold shadow-sm ring-2 ring-amber-gold/20">
              <span className="font-bold">{props.student.initials}</span>
            </div>
            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-2">
                <span className="truncate font-label-md text-label-md font-bold text-on-surface">
                  {t('form_student_name', {
                    name: props.student.name,
                    ordinal: String(props.ordinal).padStart(2, '0'),
                  })}
                </span>
                <span className="rounded-full border border-amber-gold/50 bg-amber-surface px-2 py-0.5 font-caption text-caption font-bold text-amber-dark">
                  {t('upload_identity_category')}
                </span>
              </div>
              <span className="truncate font-caption text-caption text-text-muted">
                {t('upload_identity_meta', { nisn: props.student.nisn })}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 justify-between border-t border-border-subtle/80 pt-2 text-left sm:flex-col sm:items-start sm:justify-start sm:border-t-0 sm:pt-0">
            <div>
              <span className="block font-caption text-caption text-text-muted">
                {isError ? t('error_duration_label') : t('upload_request_status_label')}
              </span>
              {isUploading ? (
                <span className="inline-flex items-center gap-1.5 font-label-md text-label-md font-bold text-amber-dark">
                  <span className="h-2 w-2 animate-ping rounded-full bg-amber-dark" />
                  {t('uploading_status_value')}
                </span>
              ) : (
                <span
                  className={`font-label-md text-label-md font-bold ${isError ? 'text-pine-deep' : 'text-amber-dark'}`}
                >
                  {isError ? t('error_duration_value') : t('upload_request_status_empty')}
                </span>
              )}
            </div>
            <div className="sm:mt-0.5">
              <span className="font-caption text-caption text-text-muted sm:inline">
                {t('upload_presensi_label')}{' '}
              </span>
              <span className="font-caption text-caption font-semibold text-on-surface">
                {t('upload_presensi_date')}
              </span>
            </div>
          </div>
        </div>

        {issues.length > 0 && isError ? (
          <div
            className="flex animate-in items-start gap-3 rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-red-900 shadow-xs duration-200 fade-in"
            role="alert"
          >
            <div className="text-error mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
              <span className="material-symbols-outlined text-[20px] [font-variation-settings:'FILL'_1]">
                error
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center justify-between">
                <span className="text-error font-label-md text-label-md font-bold">
                  {t('error_banner_title')}
                </span>
                <span className="py-0.2 text-error rounded-full bg-red-100 px-2 font-caption text-[11px] font-bold">
                  {t('error_banner_count', { count: issues.length })}
                </span>
              </div>
              {issues.map((issue) => (
                <p
                  className="mt-0.5 font-caption text-caption leading-relaxed text-red-800/90"
                  key={issue}
                >
                  {t(ISSUE_MESSAGE_KEY[issue], {
                    max: MAX_MEGABYTES,
                    size: draft.document ? formatMegabytes(draft.document.size) : '0.0',
                  })}
                </p>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between font-label-md text-label-md font-semibold text-on-surface">
            <span>{t('upload_category_label')}</span>
            <span className="inline-flex items-center gap-1 font-caption text-caption font-bold text-amber-dark">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-dark" />
              {t('upload_required_hint')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-border-subtle bg-surface-container-low p-1.5">
            {CATEGORY_OPTIONS.map((option) => {
              const isActive = draft.category === option.value;

              return (
                <button
                  aria-pressed={isActive}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 font-label-md text-label-md transition-all ${isActive ? CATEGORY_ACTIVE : CATEGORY_IDLE}`}
                  disabled={isUploading}
                  key={option.value}
                  onClick={() =>{  props.onDraftChange({ ...draft, category: option.value }); }}
                  type="button"
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${isActive ? 'text-amber-gold' : 'text-text-muted'}`}
                  >
                    {option.glyph}
                  </span>
                  <span>{t(option.labelKey)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 font-label-md text-label-md font-semibold text-on-surface">
            <span>{t('upload_start_date_label')}</span>
            <span className="relative">
              <span
                className={`material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-[18px] ${isUploading ? 'text-pine-deep' : 'text-text-muted'}`}
              >
                calendar_month
              </span>
              <input
                className={INPUT_CLASS}
                disabled={isUploading}
                name="dispensation-start-date"
                onChange={(event) =>{ 
                  props.onDraftChange({ ...draft, startDate: event.target.value }); }
                }
                placeholder={t('upload_start_date_placeholder')}
                type="date"
                value={draft.startDate}
              />
            </span>
          </label>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                className={`font-label-md text-label-md font-semibold ${dateRejected && isError ? 'text-error' : 'text-on-surface'}`}
                htmlFor="dispensation-end-date"
              >
                {t('upload_end_date_label')}
              </label>
              {dateRejected && isError ? (
                <span className="text-error inline-flex items-center gap-1 font-caption text-[11px] font-semibold">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {t('error_end_date_invalid')}
                </span>
              ) : (isUploading ? (
                <span className="rounded-md bg-pine-light px-2 py-0.5 font-caption text-caption font-semibold text-pine-deep">
                  {t('uploading_duration_badge')}
                </span>
              ) : null)}
            </div>
            <span className="relative">
              <span
                className={`material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-[18px] ${dateRejected && isError ? 'text-error' : (isUploading ? 'text-pine-deep' : 'text-text-muted')}`}
              >
                event_repeat
              </span>
              <input
                className={dateRejected && isError ? ERROR_INPUT_CLASS : INPUT_CLASS}
                disabled={isUploading}
                id="dispensation-end-date"
                name="dispensation-end-date"
                onChange={(event) =>{  props.onDraftChange({ ...draft, endDate: event.target.value }); }}
                placeholder={t('upload_end_date_placeholder')}
                type="date"
                value={draft.endDate}
              />
              {dateRejected && isError ? (
                <span className="material-symbols-outlined text-error absolute top-1/2 right-3 -translate-y-1/2 text-[18px]">
                  warning
                </span>
              ) : null}
            </span>
            {dateRejected && isError ? (
              <p className="text-error mt-0.5 inline-flex items-center gap-1 font-caption text-caption font-medium">
                <span className="material-symbols-outlined text-[13px]">info</span>
                {t('error_issue_date_range')}
              </p>
            ) : null}
          </div>
        </div>

        <PresensiDispensationFileSection
          document={draft.document}
          issues={issues}
          percent={props.percent}
          state={props.state}
          onCancelUpload={props.onCancelUpload}
          onSelectFile={selectFile}
          onRetry={props.onSubmit}
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between font-label-md text-label-md font-semibold text-on-surface">
            <span>{t('upload_notes_label')}</span>
            <span
              className={`font-caption text-caption ${isError ? 'text-error' : 'text-text-muted'}`}
            >
              {isError ? t('error_notes_caption') : t('upload_notes_optional')}
            </span>
          </div>
          <textarea
            className="w-full resize-none rounded-xl border border-border-control bg-surface-card p-3 font-label-md text-label-md leading-relaxed text-on-surface shadow-xs transition-all placeholder:text-text-placeholder focus:border-pine-deep focus:ring-1 focus:ring-pine-deep focus:outline-none"
            disabled={isUploading}
            name="dispensation-notes"
            placeholder={t('upload_notes_placeholder')}
            rows={isError ? 2 : 3}
           />
        </div>

        <div
          className={`flex items-start gap-3 rounded-xl border border-border-subtle bg-surface-container-low p-3.5 ${isError ? 'opacity-70' : ''}`}
        >
          <input
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-pine-deep"
            defaultChecked
            disabled={isUploading}
            id="checkWaDispensasi"
            name="dispensation-notify"
            type="checkbox"
          />
          <label className="flex cursor-pointer flex-col" htmlFor="checkWaDispensasi">
            <span className="font-label-md text-label-md font-semibold text-on-surface">
              {t('upload_notify_label')}
            </span>
            <span className="font-caption text-caption text-text-muted">
              {t('upload_notify_hint')}
            </span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border-subtle bg-surface-container-low/70 p-4 sm:px-6">
        <button
          className="rounded-xl border border-border-subtle bg-surface-card px-5 py-2.5 font-label-md text-label-md font-semibold text-on-surface-variant shadow-xs transition-all hover:bg-surface-container active:scale-95"
          onClick={props.onClose}
          type="button"
        >
          {t('modal_cancel')}
        </button>
        {isError ? (
          <span className="text-error inline-flex items-center gap-1 font-caption text-caption font-medium sm:hidden">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            {t('error_submit_issues', { count: issues.length })}
          </span>
        ) : null}
        <div className="relative">
          {isError ? (
            <div className="bg-inverse-surface text-inverse-on-surface pointer-events-none absolute right-0 bottom-full z-20 mb-2 flex max-w-[280px] items-start gap-2 rounded-xl border border-white/10 p-2.5 font-caption text-[12px] shadow-xl">
              <span className="material-symbols-outlined mt-0.5 shrink-0 text-[16px] text-amber-gold">
                report_problem
              </span>
              <span>{t('error_submit_tooltip')}</span>
            </div>
          ) : null}
          <button
            className={`inline-flex items-center gap-2.5 rounded-xl px-6 py-2.5 font-label-md text-label-md font-semibold ${
              isError
                ? 'cursor-not-allowed border border-border-control bg-surface-container-highest text-text-muted transition-all'
                : isUploading
                  ? 'bg-pine-deep text-white opacity-70 transition-none select-none'
                  : submitReady
                    ? 'bg-pine-deep text-white shadow-xs transition-all enabled:hover:bg-pine-hover enabled:active:scale-95'
                    : 'cursor-not-allowed bg-surface-container text-text-muted opacity-60 shadow-none transition-all'
            }`}
            disabled={!submitReady}
            onClick={props.onSubmit}
            title={
              isUploading
                ? t('uploading_submit_title')
                : (submitReady
                  ? undefined
                  : t('upload_submit_hint'))
            }
            type="button"
          >
            {isUploading ? (
              <PresensiSpinner className="h-4 w-4 text-amber-gold" />
            ) : (
              <span className="material-symbols-outlined text-[18px]">
                {isError ? 'block' : 'check'}
              </span>
            )}
            <span>{isUploading ? t('uploading_submit_label') : t('upload_submit')}</span>
          </button>
        </div>
      </div>
    </>
  );
}
