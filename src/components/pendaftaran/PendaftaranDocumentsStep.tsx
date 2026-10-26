'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

function formatFileSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadedDocumentPill(props: { file: File; onReplace: () => void }) {
  const t = useTranslations('PendaftaranPage');

  return (
    <div className="flex flex-col justify-between gap-space-md rounded-xl bg-surface-container-low p-space-md sm:flex-row sm:items-center">
      <div className="flex min-w-0 items-center gap-space-md">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pine-deep text-on-primary shadow-sm">
          <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
        </div>
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-space-xs">
            <span className="truncate font-label-md text-label-md font-semibold text-text-primary">
              {props.file.name}
            </span>
            <span className="rounded bg-status-present/50 px-2 py-0.5 font-caption text-caption font-bold text-pine-deep">
              {formatFileSize(props.file.size)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-space-xs">
        <button
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-surface-card px-3 py-2 font-label-md text-caption font-semibold text-error shadow-sm transition-colors hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-[#173F36] focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98]"
          onClick={props.onReplace}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
          {t('doc_replace_button')}
        </button>
      </div>
    </div>
  );
}

/**
 * Step 2 of the school registration wizard: legality document upload slots with an
 * OCR readout, file pickers for the Surat Kuasa and optional piagam, and a legal
 * attestation that gates the handoff to OTP verification.
 *
 * @param props - Wizard navigation callbacks plus the Dapodik school to show in the sidebar.
 * @returns The two-column document upload workspace for step 2.
 */
export function PendaftaranDocumentsStep(props: {
  onBack: () => void;
  onContinue: () => void;
  school: { name: string; npsn: string };
}) {
  const t = useTranslations('PendaftaranPage');
  const [suratKuasaFile, setSuratKuasaFile] = useState<File>();
  const [piagamFile, setPiagamFile] = useState<File>();
  const [attested, setAttested] = useState(true);
  const suratKuasaInputRef = useRef<HTMLInputElement>(null);
  const piagamInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="grid grid-cols-1 items-start gap-gutter lg:grid-cols-12">
      <div className="flex flex-col gap-space-xl lg:col-span-7 xl:col-span-8">
        <div className="rounded-2xl bg-surface-card p-space-xl shadow-sm">
          <div className="mb-space-xs flex items-center gap-space-xs">
            <span className="rounded-md bg-pine-light px-2.5 py-1 font-caption text-caption font-bold tracking-wide text-pine-deep uppercase">
              {t('doc_stage_badge')}
            </span>
            <span className="font-caption text-caption text-text-muted">
              {t('doc_standards_note')}
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-pine-deep">
            {t('doc_title')}
          </h1>
          <p className="mt-space-xs font-body-md text-body-md text-text-muted">
            {t('doc_description')}
          </p>
        </div>

        <div className="flex flex-col gap-space-md rounded-2xl bg-surface-card p-space-xl shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-space-sm pb-space-xs">
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="rounded bg-error-container px-2 py-0.5 font-caption text-caption font-bold tracking-wider text-on-error-container uppercase">
                  {t('doc_required_badge')}
                </span>
                <h2 className="font-headline-sm text-headline-sm font-bold text-pine-deep">
                  {t('doc_sk_title')}
                </h2>
              </div>
              <p className="mt-1 font-caption text-caption text-text-muted">
                {t('doc_sk_subtitle')}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-status-present px-3 py-1 font-caption text-caption font-semibold text-pine-deep">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              {t('doc_ocr_pass_badge')}
            </span>
          </div>

          <div className="flex flex-col justify-between gap-space-md rounded-xl bg-surface-container-low p-space-md sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-space-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pine-deep text-on-primary shadow-sm">
                <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
              </div>
              <div className="flex min-w-0 flex-col">
                <div className="flex items-center gap-space-xs">
                  <span className="truncate font-label-md text-label-md font-semibold text-text-primary">
                    {t('doc_sk_file_name')}
                  </span>
                  <span className="rounded bg-status-present/50 px-2 py-0.5 font-caption text-caption font-bold text-pine-deep">
                    {t('doc_sk_file_size')}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 font-caption text-caption text-text-muted">
                  <span className="inline-flex items-center gap-1 font-medium text-pine-deep">
                    <span className="h-1.5 w-1.5 rounded-full bg-pine-deep" />
                    {t('doc_checksum_valid')}
                  </span>
                  <span>•</span>
                  <span>{t('doc_uploaded_today')}</span>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-space-xs">
              <button
                className="inline-flex items-center gap-1 rounded-lg bg-surface-card px-3 py-2 font-label-md text-caption font-semibold text-pine-deep shadow-sm transition-colors hover:bg-surface-container"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                {t('doc_preview_button')}
              </button>
              <button
                className="inline-flex items-center gap-1 rounded-lg bg-surface-card px-3 py-2 font-label-md text-caption font-semibold text-error shadow-sm transition-colors hover:bg-surface-container"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                {t('doc_replace_button')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-space-md pt-space-xs md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label
                className="flex items-center justify-between font-label-md text-caption font-semibold text-text-muted"
                htmlFor="no-sk"
              >
                <span>{t('doc_sk_number_label')}</span>
                <span className="inline-flex items-center gap-0.5 font-caption text-caption text-pine-deep">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  {t('doc_sk_number_verified')}
                </span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[18px] text-pine-deep">
                  badge
                </span>
                <input
                  className="h-11 w-full rounded-xl bg-surface-container-low pr-10 pl-10 font-label-md text-label-md font-semibold text-pine-deep focus:outline-none"
                  id="no-sk"
                  readOnly
                  type="text"
                  value="421.2/1084/Disdik/2024"
                />
                <span className="material-symbols-outlined absolute right-3 text-[18px] text-pine-deep">
                  lock
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                className="flex items-center justify-between font-label-md text-caption font-semibold text-text-muted"
                htmlFor="tgl-sk"
              >
                <span>{t('doc_sk_date_label')}</span>
                <span className="inline-flex items-center gap-0.5 font-caption text-caption text-pine-deep">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  {t('doc_sk_date_verified')}
                </span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[18px] text-pine-deep">
                  event
                </span>
                <input
                  className="h-11 w-full rounded-xl bg-surface-container-low pr-10 pl-10 font-label-md text-label-md font-semibold text-pine-deep focus:outline-none"
                  id="tgl-sk"
                  readOnly
                  type="text"
                  value="15 Juli 2024"
                />
                <span className="material-symbols-outlined absolute right-3 text-[18px] text-pine-deep">
                  verified
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-space-md rounded-2xl bg-surface-card p-space-xl shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-space-sm pb-space-xs">
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="rounded bg-error-container px-2 py-0.5 font-caption text-caption font-bold tracking-wider text-on-error-container uppercase">
                  {t('doc_required_badge')}
                </span>
                <h2 className="font-headline-sm text-headline-sm font-bold text-pine-deep">
                  {t('doc_power_of_attorney_title')}
                </h2>
              </div>
              <p className="mt-1 font-caption text-caption text-text-muted">
                {t('doc_power_of_attorney_subtitle')}
              </p>
            </div>
            {/* shortcut: no template file is hosted yet, so the download control is honestly disabled */}
            <button
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg bg-amber-surface px-3 py-1.5 font-caption text-caption font-bold text-amber-dark opacity-60 shadow-sm"
              disabled
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              {t('doc_download_template')}
            </button>
          </div>

          {suratKuasaFile ? (
            <UploadedDocumentPill
              file={suratKuasaFile}
              onReplace={() => suratKuasaInputRef.current?.click()}
            />
          ) : (
            /* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- the label opens the associated file input natively; drag-and-drop is a pointer-only enhancement */
            <label
              className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl bg-surface-container-low p-space-xl text-center transition-all duration-200 hover:bg-pine-light/40"
              htmlFor="surat-kuasa-input"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                setSuratKuasaFile(event.dataTransfer.files[0]);
              }}
            >
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full rounded-2xl"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  fill="none"
                  height="98.5%"
                  rx="16"
                  stroke="#717975"
                  strokeDasharray="6, 6"
                  strokeOpacity="0.5"
                  strokeWidth="1.5"
                  width="99.5%"
                  x="1"
                  y="1"
                />
              </svg>
              <div className="mb-space-sm flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-card text-pine-deep shadow-md transition-transform group-hover:scale-105">
                <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
              </div>
              <p className="font-label-md text-label-md font-bold text-pine-deep">
                {t('doc_power_of_attorney_dropzone_title')}
              </p>
              <p className="mt-1 max-w-md font-caption text-caption text-text-muted">
                {t('doc_power_of_attorney_dropzone_hint')}
              </p>
              <div className="mt-space-md flex items-center gap-space-sm">
                <span className="rounded-xl bg-pine-deep px-space-md py-2.5 font-label-md text-caption font-bold text-on-primary shadow-sm transition-colors hover:bg-pine-hover">
                  {t('doc_browse_files')}
                </span>
                <span className="font-caption text-caption text-text-muted">
                  {t('doc_power_of_attorney_formats')}
                </span>
              </div>
            </label>
          )}
          <input
            accept=".pdf,.jpg,.jpeg"
            className="hidden"
            id="surat-kuasa-input"
            onChange={(event) => setSuratKuasaFile(event.target.files?.[0])}
            ref={suratKuasaInputRef}
            type="file"
          />

          <div className="flex items-center gap-space-sm rounded-xl bg-surface-container p-space-sm">
            <span className="material-symbols-outlined shrink-0 text-[18px] text-pine-deep">
              info
            </span>
            <span className="font-caption text-caption text-on-surface-variant">
              {t('doc_power_of_attorney_notice')}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-space-md rounded-2xl bg-surface-card p-space-xl shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-space-sm pb-space-xs">
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="rounded bg-surface-container-high px-2 py-0.5 font-caption text-caption font-bold tracking-wider text-text-muted uppercase">
                  {t('doc_optional_badge')}
                </span>
                <h2 className="font-headline-sm text-headline-sm font-bold text-pine-deep">
                  {t('doc_certificate_title')}
                </h2>
              </div>
              <p className="mt-1 font-caption text-caption text-text-muted">
                {t('doc_certificate_subtitle')}
              </p>
            </div>
            <span className="rounded-full bg-pine-light px-2.5 py-1 font-caption text-caption font-semibold text-pine-deep">
              {t('doc_api_accelerate_badge')}
            </span>
          </div>

          {piagamFile ? (
            <UploadedDocumentPill
              file={piagamFile}
              onReplace={() => piagamInputRef.current?.click()}
            />
          ) : (
            <div className="flex flex-col items-center justify-between gap-space-md rounded-xl bg-surface-container-low p-space-md sm:flex-row">
              <div className="flex items-center gap-space-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-card text-text-muted shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md font-semibold text-text-primary">
                    {t('doc_certificate_upload_title')}
                  </p>
                  <p className="font-caption text-caption text-text-muted">
                    {t('doc_certificate_upload_hint')}
                  </p>
                </div>
              </div>
              <button
                className="w-full cursor-pointer rounded-xl bg-surface-card px-space-md py-2 font-label-md text-caption font-semibold text-pine-deep shadow-sm transition-colors hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-[#173F36] focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] sm:w-auto"
                onClick={() => piagamInputRef.current?.click()}
                type="button"
              >
                {t('doc_choose_certificate')}
              </button>
            </div>
          )}
          <input
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(event) => setPiagamFile(event.target.files?.[0])}
            ref={piagamInputRef}
            type="file"
          />
        </div>

        <div className="rounded-2xl bg-surface-card p-space-xl shadow-sm">
          {/* oxlint-disable-next-line jsx-a11y/label-has-associated-control -- the control is nested and re-associated via htmlFor; the text sits in the custom checkbox markup */}
          <label
            className="flex cursor-pointer items-start gap-space-md select-none"
            htmlFor="legal-agreement"
          >
            <div className="relative mt-0.5 flex items-center">
              <input
                checked={attested}
                className="peer sr-only"
                id="legal-agreement"
                onChange={(event) => setAttested(event.target.checked)}
                type="checkbox"
              />
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-surface-card shadow-sm transition-all peer-checked:bg-pine-deep">
                <span className="material-symbols-outlined text-[16px] text-white opacity-0 transition-opacity peer-checked:opacity-100">
                  check
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md font-semibold text-pine-deep">
                {t('doc_attestation_title')}
              </span>
              <p className="mt-0.5 font-caption text-caption leading-relaxed text-text-muted">
                {t('doc_attestation_body')}
              </p>
            </div>
          </label>
        </div>

        <div className="flex flex-col items-center justify-between gap-space-md pt-space-xs pb-space-lg sm:flex-row">
          <button
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-surface-card px-space-xl py-3 font-label-md text-label-md font-semibold text-pine-deep shadow-sm transition-colors hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-[#173F36] focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] sm:w-auto"
            onClick={props.onBack}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            {t('doc_back_button')}
          </button>
          <button
            className="inline-flex w-full transform cursor-pointer items-center justify-center gap-2 rounded-xl bg-pine-deep px-space-xl py-3 font-label-md text-label-md font-bold text-on-primary shadow-md transition-all hover:bg-pine-hover hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[#173F36] focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            disabled={!attested || suratKuasaFile === undefined}
            onClick={props.onContinue}
            type="button"
          >
            <span>{t('doc_continue_button')}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-space-lg lg:col-span-5 xl:col-span-4">
        <div className="relative overflow-hidden rounded-2xl bg-surface-card p-space-xl shadow-sm">
          <div className="pointer-events-none absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-pine-light/50 blur-2xl" />
          <div className="mb-space-md flex items-center justify-between">
            <span className="font-caption text-caption font-bold tracking-wider text-text-muted uppercase">
              {t('doc_school_card_title')}
            </span>
            <span className="rounded-full bg-status-present px-2.5 py-0.5 font-caption text-caption font-bold text-pine-deep">
              {t('doc_school_connected_badge')}
            </span>
          </div>
          <div className="mb-space-md flex items-center gap-space-md">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-pine-light text-pine-deep shadow-inner">
              <span className="material-symbols-outlined text-[32px]">account_balance</span>
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-headline-sm text-headline-sm font-bold text-pine-deep">
                {props.school.name}
              </h3>
              <p className="flex items-center gap-1 font-caption text-caption text-text-muted">
                <span>{t('doc_school_npsn_label')}</span>
                <span className="font-mono font-bold text-pine-deep">{props.school.npsn}</span>
              </p>
            </div>
          </div>
          <div className="space-y-space-sm pt-space-xs font-label-md text-label-md">
            <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-2.5">
              <span className="font-caption text-caption text-text-muted">
                {t('doc_school_level_label')}
              </span>
              <span className="font-semibold text-pine-deep">{t('doc_school_level_value')}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-2.5">
              <span className="font-caption text-caption text-text-muted">
                {t('doc_school_accreditation_label')}
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-pine-deep">
                <span className="h-2 w-2 rounded-full bg-status-present" />
                {t('doc_school_accreditation_value')}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-2.5">
              <span className="font-caption text-caption text-text-muted">
                {t('doc_school_location_label')}
              </span>
              <span
                className="max-w-[170px] truncate font-semibold text-pine-deep"
                title={t('doc_school_location_title')}
              >
                {t('doc_school_location_value')}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-2.5">
              <span className="font-caption text-caption text-text-muted">
                {t('doc_school_operator_label')}
              </span>
              <span className="font-semibold text-pine-deep">{t('doc_school_operator_value')}</span>
            </div>
          </div>
          <div className="mt-space-md flex items-center justify-between pt-space-sm font-caption text-caption text-text-muted">
            <span>{t('doc_school_sync_label')}</span>
            <span className="font-medium text-pine-deep">{t('doc_school_sync_value')}</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-pine-deep p-space-xl text-on-primary shadow-md">
          <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-pine-hover opacity-60 blur-3xl" />
          <div className="mb-space-sm flex items-center gap-space-xs text-amber-gold">
            <span className="material-symbols-outlined text-[20px]">shield_locked</span>
            <span className="font-caption text-caption font-bold tracking-wider uppercase">
              {t('doc_security_eyebrow')}
            </span>
          </div>
          <h3 className="mb-space-xs font-headline-sm text-headline-sm font-bold text-white">
            {t('doc_security_title')}
          </h3>
          <p className="mb-space-lg font-body-md text-caption leading-relaxed text-on-primary-container">
            {t('doc_security_intro')}
          </p>
          <div className="space-y-space-md">
            <div className="flex items-start gap-space-sm">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-pine-hover text-amber-gold">
                <span className="material-symbols-outlined text-[16px]">lock</span>
              </div>
              <div>
                <p className="font-label-md text-label-md font-bold text-white">
                  {t('doc_security_encryption_title')}
                </p>
                <p className="font-caption text-caption text-on-primary-container">
                  {t('doc_security_encryption_body')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-space-sm">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-pine-hover text-amber-gold">
                <span className="material-symbols-outlined text-[16px]">branding_watermark</span>
              </div>
              <div>
                <p className="font-label-md text-label-md font-bold text-white">
                  {t('doc_security_watermark_title')}
                </p>
                <p className="font-caption text-caption text-on-primary-container">
                  {t('doc_security_watermark_body')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-space-sm">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-pine-hover text-amber-gold">
                <span className="material-symbols-outlined text-[16px]">bolt</span>
              </div>
              <div>
                <p className="font-label-md text-label-md font-bold text-white">
                  {t('doc_security_speed_title')}
                </p>
                <p className="font-caption text-caption text-on-primary-container">
                  {t('doc_security_speed_body')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-space-md rounded-2xl bg-surface-card p-space-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-caption text-caption font-bold tracking-wider text-text-muted uppercase">
              {t('doc_readiness_title')}
            </span>
            <span className="font-caption text-caption font-bold text-pine-deep">
              {t('doc_readiness_percent')}
            </span>
          </div>
          <div className="flex h-2.5 w-full gap-1 overflow-hidden rounded-full bg-surface-container p-0.5">
            <div className="w-1/3 rounded-full bg-status-present" />
            <div className="w-1/3 rounded-full bg-pine-deep" />
            <div className="w-1/3 rounded-full bg-transparent" />
          </div>
          <div className="flex items-center gap-space-md rounded-xl bg-surface-container-low p-space-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-status-present/60 text-pine-deep">
              <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
            </div>
            <div>
              <p className="font-label-md text-caption font-bold text-pine-deep">
                {t('doc_readiness_documents_received')}
              </p>
              <p className="font-caption text-caption text-text-muted">
                {t('doc_readiness_remaining_hint')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-space-md rounded-2xl bg-amber-surface p-space-lg shadow-sm">
          <div className="flex items-center gap-space-md">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-gold text-pine-deep shadow-sm">
              <span className="material-symbols-outlined text-[22px]">support_agent</span>
            </div>
            <div>
              <p className="font-label-md text-label-md font-bold text-amber-dark">
                {t('doc_support_title')}
              </p>
              <p className="font-caption text-caption text-text-muted">{t('doc_support_body')}</p>
            </div>
          </div>
          <button
            className="shrink-0 rounded-xl bg-pine-deep px-3.5 py-2 font-label-md text-caption font-bold text-on-primary shadow-sm transition-colors hover:bg-pine-hover"
            type="button"
          >
            {t('doc_support_button')}
          </button>
        </div>
      </div>
    </div>
  );
}
