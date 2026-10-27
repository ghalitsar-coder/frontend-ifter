'use client';

import { useTranslations } from 'next-intl';
import { formatMegabytes } from '@/components/presensi/presensiDispensation';
import { openDispensationDocument } from '@/components/presensi/presensiDispensationDocument';
import type { PresensiStudent } from '@/types/presensi';

/**
 * Verified body of the dispensation dialog: the accepted document, the period it
 * covers, and the actions that follow from a valid permit.
 *
 * @param props - Student context, the accepted document, and close handler.
 * @returns Header, body and action footer of the verified state.
 */
export function PresensiDispensationVerified(props: {
  student: PresensiStudent;
  ordinal: number;
  file: File | null;
  onClose: () => void;
}) {
  const t = useTranslations('PresensiPage');

  return (
    <>
      <div className="relative flex items-start justify-between border-b border-border-subtle bg-surface-container-low/70 p-6 pb-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-0.5 font-eyebrow text-eyebrow font-bold tracking-wider text-[#065F46] uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
              {t('verified_eyebrow')}
            </span>
            <span className="font-caption text-caption text-text-muted">
              {t('upload_document_label')}{' '}
              <span className="font-semibold text-on-surface">{t('verified_document_number')}</span>
            </span>
          </div>
          <h3
            className="mt-1 font-headline-sm text-headline-sm font-bold tracking-tight text-pine-deep"
            id="dispensation-title"
          >
            {t('verified_title')}
          </h3>
          <p className="font-caption text-caption text-text-muted">{t('verified_context')}</p>
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
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pine-deep font-label-md text-label-md text-amber-gold shadow-sm ring-2 ring-emerald-500/20">
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
                <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-caption text-caption font-bold text-emerald-800">
                  {t('verified_badge')}
                </span>
              </div>
              <span className="truncate font-caption text-caption text-text-muted">
                {t('verified_identity_meta', { nisn: props.student.nisn })}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 justify-between border-t border-border-subtle/80 pt-2 text-left sm:flex-col sm:justify-start sm:border-t-0 sm:pt-0 sm:text-right">
            <div>
              <span className="block font-caption text-caption text-text-muted">
                {t('verified_approval_label')}
              </span>
              <span className="inline-flex items-center gap-1 font-label-md text-label-md font-bold text-emerald-700 sm:justify-end">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">
                  verified
                </span>
                {t('verified_approval_value')}
              </span>
            </div>
            <div className="sm:mt-0.5">
              <span className="font-caption text-caption text-text-muted sm:inline">
                {t('verified_approved_at_label')}{' '}
              </span>
              <span className="font-caption text-caption font-semibold text-on-surface">
                {t('verified_approved_at')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface-container-low/60 p-4">
          <div className="flex flex-col gap-2 border-b border-border-subtle/80 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pine-light text-pine-deep">
                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              </span>
              <div>
                <span className="block font-caption text-caption text-text-muted">
                  {t('verified_period_label')}
                </span>
                <span className="font-label-md text-label-md font-bold text-on-surface">
                  {t('verified_period_value')}
                </span>
              </div>
            </div>
            <span className="self-start rounded-md bg-pine-deep/10 px-2.5 py-1 font-caption text-caption font-semibold text-pine-deep sm:self-auto">
              {t('verified_period_total')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-[18px] text-emerald-600 [font-variation-settings:'FILL'_1]">
              check_circle
            </span>
            <span className="font-caption text-caption text-text-muted">
              {t('verified_presensi_label')}
            </span>
            <span className="font-label-md text-label-md font-semibold text-pine-deep">
              {t('verified_presensi_value')}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between font-label-md text-label-md font-semibold text-on-surface">
            <span>{t('verified_file_label')}</span>
            <span className="inline-flex items-center gap-1 font-caption text-caption font-bold text-emerald-700">
              <span className="material-symbols-outlined text-[14px]">task_alt</span>
              {t('verified_file_badge')}
            </span>
          </div>
          <div className="flex flex-col gap-3.5 rounded-2xl border border-emerald-200 bg-[#F4FBF7] p-4 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-300 bg-emerald-100 text-emerald-700 shadow-xs">
                  <span className="material-symbols-outlined text-[24px]">verified</span>
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-label-md text-label-md font-bold text-on-surface">
                    {props.file?.name ?? t('verified_file_name')}
                  </span>
                  <span className="font-caption text-caption text-text-muted">
                    {t('verified_file_meta', {
                      size: props.file ? formatMegabytes(props.file.size) : '2.4',
                    })}
                  </span>
                </div>
              </div>
              <span className="hidden shrink-0 rounded-md border border-emerald-200 bg-white px-2.5 py-1 font-caption text-caption font-bold text-emerald-800 sm:inline-block">
                {t('verified_file_type')}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-100/70 px-3 py-1.5 font-caption text-caption font-semibold text-emerald-800">
              <span className="material-symbols-outlined shrink-0 text-[16px] text-emerald-700">
                qr_code_scanner
              </span>
              <span>{t('verified_stamp')}</span>
            </div>
            <div className="flex items-center gap-2 border-t border-emerald-100 pt-1">
              <button
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-control bg-white px-3.5 py-1.5 font-label-md text-label-md font-semibold text-on-surface shadow-2xs transition-all hover:bg-surface-container"
                onClick={() =>{  openDispensationDocument(props.file, 'preview'); }}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] text-pine-deep">
                  visibility
                </span>
                <span>{t('verified_preview')}</span>
              </button>
              <button
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-control bg-white px-3.5 py-1.5 font-label-md text-label-md font-semibold text-on-surface shadow-2xs transition-all hover:bg-surface-container"
                onClick={() =>{  openDispensationDocument(props.file, 'download'); }}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] text-pine-deep">
                  download
                </span>
                <span>{t('verified_download')}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-start gap-3 rounded-xl border border-status-present bg-pine-light/70 p-3.5">
            <span className="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-pine-deep">
              menu_book
            </span>
            <p className="font-caption text-caption leading-relaxed text-pine-deep">
              {t.rich('verified_rights', {
                strong: (chunks) => <strong className="font-semibold">{chunks}</strong>,
              })}
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface-container-low p-3.5">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <span className="material-symbols-outlined text-[14px]">check</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-label-md text-label-md font-semibold text-on-surface">
                {t('verified_notify_title')}
              </span>
              <span className="font-caption text-caption text-text-muted">
                {t('verified_notify_hint')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border-subtle bg-surface-container-low/70 p-4 sm:px-6">
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-card px-4 py-2.5 font-label-md text-label-md font-semibold text-on-surface shadow-xs transition-all hover:bg-surface-container active:scale-95"
          onClick={() =>{  window.print(); }}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
            print
          </span>
          <span>{t('verified_print')}</span>
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-pine-deep px-6 py-2.5 font-label-md text-label-md font-semibold text-white shadow-xs transition-all hover:bg-pine-hover active:scale-95"
          onClick={props.onClose}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px] text-amber-gold">
            check_circle
          </span>
          <span>{t('verified_done')}</span>
        </button>
      </div>
    </>
  );
}
