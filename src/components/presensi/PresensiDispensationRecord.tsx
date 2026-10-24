'use client';

import { useTranslations } from 'next-intl';
import { PresensiDispensationForm } from '@/components/presensi/PresensiDispensationForm';
import type { PresensiStudent } from '@/types/presensi';

/**
 * Detail layout of the dispensation dialog: the editable view of a filed record,
 * with the pine-to-amber accent rail the mock puts above the form.
 *
 * @param props - Student context, close handler, and the ratifying action.
 * @returns Header, form and action footer of the record view.
 */
export function PresensiDispensationRecord(props: {
  student: PresensiStudent;
  ordinal: number;
  onClose: () => void;
  onRatify: () => void;
}) {
  const t = useTranslations('PresensiPage');

  return (
    <>
      <div className="h-1.5 w-full bg-gradient-to-r from-pine-deep via-amber-gold to-pine-deep" />

      <div className="flex items-start justify-between bg-surface-card px-space-xl pt-space-lg pb-space-md">
        <div className="space-y-space-xs">
          <div className="flex flex-wrap items-center gap-space-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-surface px-2.5 py-0.5 font-caption text-caption font-semibold tracking-wider text-amber-dark uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-gold" />
              {t('modal_eyebrow')}
            </span>
            <span className="rounded-full bg-surface-container-high px-2 py-0.5 font-caption font-mono text-caption text-text-muted">
              {t('modal_document_number')}
            </span>
          </div>
          <h2
            className="font-headline-sm text-headline-sm text-text-primary"
            id="dispensation-title"
          >
            {t('modal_title')}
          </h2>
          <div className="flex items-center gap-space-xs font-caption text-caption text-text-muted">
            <span className="material-symbols-outlined text-[16px] text-pine-deep">school</span>
            <span>{t('modal_context_class')}</span>
            <span className="text-outline-variant">•</span>
            <span>{t('modal_context_year')}</span>
            <span className="text-outline-variant">•</span>
            <span className="font-semibold text-pine-deep">{t('modal_context_session')}</span>
          </div>
        </div>
        <button
          aria-label={t('modal_close')}
          className="-mt-1 -mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-container hover:text-text-primary"
          onClick={props.onClose}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <PresensiDispensationForm ordinal={props.ordinal} student={props.student} />

      <div className="flex shrink-0 flex-col-reverse items-center justify-between gap-space-md bg-canvas-base px-space-xl py-space-md sm:flex-row">
        <div className="flex w-full items-center gap-space-xs font-caption text-caption text-text-muted sm:w-auto">
          <span className="material-symbols-outlined text-[16px] text-amber-dark">security</span>
          <span>{t('modal_register_note')}</span>
        </div>
        <div className="flex w-full items-center justify-end gap-space-sm sm:w-auto">
          <button
            className="w-full rounded-xl bg-surface-card px-space-lg py-2.5 font-label-md text-label-md font-semibold text-text-primary shadow-sm transition-all hover:bg-surface-container active:scale-95 sm:w-auto"
            onClick={props.onClose}
            type="button"
          >
            {t('modal_cancel')}
          </button>
          <button
            className="inline-flex w-full items-center justify-center gap-space-sm rounded-xl bg-pine-deep px-space-xl py-2.5 font-label-md text-label-md font-semibold text-surface shadow-md transition-all hover:bg-pine-hover active:scale-95 sm:w-auto"
            onClick={props.onRatify}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-amber-gold">verified</span>
            <span>{t('modal_submit')}</span>
          </button>
        </div>
      </div>
    </>
  );
}
