'use client';

import { useTranslations } from 'next-intl';
import { formatMegabytes } from '@/components/presensi/presensiDispensation';
import { openDispensationDocument } from '@/components/presensi/presensiDispensationDocument';
import type { PresensiStudent } from '@/types/presensi';

/**
 * Ratified body of the dispensation dialog: the editorial register layout the
 * school keeps as the record that a permit was accepted.
 *
 * @param props - Student context, the accepted document, and close handler.
 * @returns Status rail, header, summary grid and action footer.
 */
export function PresensiDispensationRegister(props: {
  student: PresensiStudent;
  ordinal: number;
  file: File | null;
  onClose: () => void;
}) {
  const t = useTranslations('PresensiPage');
  return (
    <>
      <div className="text-on-primary flex flex-wrap items-center justify-between gap-space-xs bg-pine-deep px-space-xl py-space-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-pine-light/15 px-2.5 py-1 font-eyebrow text-[11px] tracking-wider text-amber-gold uppercase">
            <span className="material-symbols-outlined text-[14px] [font-variation-settings:'FILL'_1]">
              verified
            </span>
            {t('ratified_rail_badge')}
          </span>
          <span className="bg-on-primary/30 hidden h-1 w-1 rounded-full sm:inline-block" />
          <span className="text-primary-fixed-dim font-caption text-caption">
            {t('ratified_rail_portal')}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-on-primary/60 font-caption text-caption">
            {t('ratified_registration_label')}
          </span>
          <span className="font-caption font-mono text-caption font-semibold tracking-tight text-amber-gold">
            {t('ratified_registration_number')}
          </span>
        </div>
      </div>

      <div className="flex items-start justify-between gap-space-md bg-surface-card px-space-xl pt-space-lg pb-space-sm">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-status-permission px-2.5 py-0.5 font-caption text-caption font-semibold text-pine-deep">
              {t('ratified_category')}
            </span>
            <span className="font-caption text-caption text-text-muted">
              {t('ratified_category_note')}
            </span>
          </div>
          <h3
            className="font-headline-sm text-headline-sm tracking-tight text-pine-deep"
            id="dispensation-title"
          >
            {t('ratified_title')}
          </h3>
          <p className="font-body-md text-body-md text-text-muted">
            {t.rich('ratified_context', {
              status: (chunks) => (
                <span className="rounded-md bg-pine-light px-2 py-0.5 font-semibold text-pine-deep">
                  {chunks}
                </span>
              ),
            })}
          </p>
        </div>
        <button
          aria-label={t('modal_close')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant transition-colors duration-150 hover:bg-surface-container hover:text-pine-deep"
          onClick={props.onClose}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div className="flex max-h-[calc(85vh-160px)] flex-col gap-space-lg overflow-y-auto px-space-xl py-space-md">
        <div className="relative overflow-hidden rounded-[18px] bg-emerald-50/70 p-space-lg">
          <div className="flex items-start gap-space-md">
            <div className="relative mt-0.5 shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pine-deep text-amber-gold shadow-sm">
                <span className="material-symbols-outlined text-[28px] [font-variation-settings:'FILL'_1]">
                  workspace_premium
                </span>
              </div>
              <div className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-gold text-pine-deep shadow-xs">
                <span className="material-symbols-outlined text-[13px] font-bold">check</span>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-label-md text-label-md text-base font-semibold text-pine-deep">
                  {t('ratified_hero_title')}
                </h4>
                <span className="inline-flex items-center gap-1 rounded-full bg-status-present px-2 py-0.5 font-caption text-[11px] font-semibold text-pine-deep">
                  <span className="material-symbols-outlined text-[12px] [font-variation-settings:'FILL'_1]">
                    check_circle
                  </span>
                  {t('ratified_hero_ocr')}
                </span>
              </div>
              <p className="font-label-md text-label-md leading-relaxed text-on-surface-variant">
                {t.rich('ratified_hero_body', {
                  strong: (chunks) => (
                    <strong className="font-semibold text-pine-deep">{chunks}</strong>
                  ),
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-space-sm md:grid-cols-12">
          <div className="flex flex-col justify-between rounded-2xl bg-surface-container-low p-space-md md:col-span-7">
            <div>
              <span className="font-eyebrow text-[11px] tracking-wide text-text-muted uppercase">
                {t('ratified_identity_label')}
              </span>
              <div className="mt-space-sm flex items-center gap-space-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pine-deep font-headline-sm text-headline-sm text-amber-gold shadow-sm">
                  <span className="font-bold">{props.student.initials}</span>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md text-[17px] font-bold text-pine-deep">
                    {props.student.name}
                  </h4>
                  <p className="font-caption text-caption text-text-muted">
                    {t.rich('ratified_class_nisn', {
                      mono: (chunks) => (
                        <span className="font-mono font-semibold text-pine-deep">{chunks}</span>
                      ),
                      nisn: props.student.nisn,
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-space-md flex items-center justify-between rounded-xl bg-surface-card/60 p-2.5 pt-space-sm text-xs">
              <div className="flex items-center gap-1.5 text-on-surface">
                <span className="material-symbols-outlined text-[16px] text-pine-deep">
                  shield_person
                </span>
                <span className="font-caption text-caption text-text-muted">
                  {t('ratified_wali_label')}
                </span>
                <span className="font-caption text-caption font-semibold text-pine-deep">
                  {t('ratified_wali_value')}
                </span>
              </div>
              <span className="rounded-full bg-status-present px-2 py-0.5 font-caption text-[11px] font-semibold text-pine-deep">
                {t('ratified_status_active')}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-amber-surface p-space-md md:col-span-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-eyebrow text-[11px] font-semibold tracking-wide text-amber-dark uppercase">
                  {t('ratified_impact_label')}
                </span>
                <span className="material-symbols-outlined text-[18px] text-amber-dark">
                  verified_user
                </span>
              </div>
              <div className="mt-space-xs">
                <div className="font-headline-sm text-headline-sm font-extrabold text-pine-deep">
                  {t('ratified_impact_value')}
                </div>
                <p className="mt-1 font-caption text-caption text-amber-dark">
                  {t.rich('ratified_impact_note', {
                    strong: (chunks) => (
                      <strong className="font-semibold text-pine-deep">{chunks}</strong>
                    ),
                  })}
                </p>
              </div>
            </div>
            <div className="mt-space-sm rounded-xl bg-white/70 p-2.5">
              <div className="flex items-center gap-1.5 font-caption text-caption font-semibold text-pine-deep">
                <span className="material-symbols-outlined text-[16px] text-pine-deep">school</span>
                <span>{t('ratified_academic_label')}</span>
              </div>
              <p className="mt-0.5 font-caption text-[11px] text-on-surface-variant">
                {t('ratified_academic_note')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-space-md rounded-2xl bg-surface-container-low p-space-md sm:grid-cols-3 md:col-span-12">
            <div className="flex flex-col gap-1">
              <span className="font-eyebrow text-[11px] text-text-muted uppercase">
                {t('ratified_event_label')}
              </span>
              <span className="flex items-start gap-1.5 font-label-md text-label-md font-semibold text-pine-deep">
                <span className="material-symbols-outlined mt-0.5 text-[16px] text-pine-deep">
                  emoji_events
                </span>
                <span>{t('ratified_event_value')}</span>
              </span>
              <p className="font-caption text-caption text-text-muted">
                {t('ratified_event_host')}
              </p>
            </div>
            <div className="flex flex-col gap-1 sm:border-l sm:border-surface-card sm:pl-space-md">
              <span className="font-eyebrow text-[11px] text-text-muted uppercase">
                {t('ratified_range_label')}
              </span>
              <span className="flex items-start gap-1.5 font-label-md text-label-md font-semibold text-pine-deep">
                <span className="material-symbols-outlined mt-0.5 text-[16px] text-pine-deep">
                  date_range
                </span>
                <span>{t('ratified_range_value')}</span>
              </span>
              <p className="font-caption text-caption text-text-muted">
                {t.rich('ratified_range_note', {
                  strong: (chunks) => (
                    <strong className="font-semibold text-pine-deep">{chunks}</strong>
                  ),
                })}
              </p>
            </div>
            <div className="flex flex-col gap-1 sm:border-l sm:border-surface-card sm:pl-space-md">
              <span className="font-eyebrow text-[11px] text-text-muted uppercase">
                {t('ratified_coach_label')}
              </span>
              <span className="flex items-start gap-1.5 font-label-md text-label-md font-semibold text-pine-deep">
                <span className="material-symbols-outlined mt-0.5 text-[16px] text-pine-deep">
                  supervisor_account
                </span>
                <span>{t('ratified_coach_value')}</span>
              </span>
              <p className="font-caption text-caption text-text-muted">{t('ratified_coach_nip')}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-surface-card p-space-md shadow-sm">
          <div className="flex flex-col items-start justify-between gap-space-md sm:flex-row sm:items-center">
            <div className="flex items-center gap-space-md">
              <div className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-pine-light text-pine-deep">
                <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
                <span className="font-eyebrow text-[9px] font-bold tracking-tight uppercase">
                  PDF
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="max-w-[280px] truncate font-label-md text-label-md font-semibold text-pine-deep sm:max-w-[340px]">
                    {props.file?.name ?? t('ratified_file_name')}
                  </span>
                  <span className="font-caption text-caption text-text-muted">
                    {t('ratified_file_size', {
                      size: props.file ? formatMegabytes(props.file.size) : '2.3',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <span className="inline-block h-2 w-2 rounded-full bg-status-present" />
                  <span className="font-caption text-caption font-medium text-pine-deep">
                    {t('ratified_file_status')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">
              <button
                className="flex items-center gap-1.5 rounded-xl bg-surface-container-low px-3.5 py-2 font-label-md text-label-md font-medium text-pine-deep transition-colors hover:bg-surface-container"
                onClick={() =>{  openDispensationDocument(props.file, 'preview'); }}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>{t('ratified_preview')}</span>
              </button>
              <button
                className="hover:text-on-primary flex items-center gap-1.5 rounded-xl bg-pine-light px-3.5 py-2 font-label-md text-label-md font-medium text-pine-deep transition-colors hover:bg-pine-deep"
                onClick={() =>{  openDispensationDocument(props.file, 'download'); }}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>{t('ratified_download')}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-space-sm rounded-xl bg-surface-container-low px-space-md py-space-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-status-present text-pine-deep">
              <span className="material-symbols-outlined text-[15px]">done_all</span>
            </div>
            <p className="font-caption text-caption text-on-surface-variant">
              {t.rich('ratified_notify', {
                strong: (chunks) => (
                  <strong className="font-semibold text-pine-deep">{chunks}</strong>
                ),
              })}
            </p>
          </div>
          <span className="font-caption font-mono text-[11px] text-text-muted">
            {t('ratified_notify_time')}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-space-md bg-surface-card px-space-xl py-space-lg sm:flex-row">
        <button
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-surface-card px-space-lg font-label-md text-label-md font-semibold text-pine-deep transition-colors hover:bg-surface-container-low sm:w-auto"
          onClick={() =>{  window.print(); }}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">print</span>
          <span>{t('ratified_print')}</span>
        </button>
        <button
          className="text-on-primary flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-pine-deep px-space-xl font-label-md text-label-md font-semibold shadow-md transition-all duration-150 hover:bg-pine-hover hover:shadow-lg sm:w-auto"
          onClick={props.onClose}
          type="button"
        >
          <span>{t('ratified_done')}</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </>
  );
}
