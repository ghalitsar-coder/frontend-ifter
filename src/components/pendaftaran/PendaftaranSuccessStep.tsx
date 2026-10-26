'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { LEVEL_LABELS } from '@/components/pendaftaran/PendaftaranIdentityStep';
import { Link } from '@/libs/I18nNavigation';
import { getBaseUrl } from '@/utils/Helpers';

const COPY_TOAST_MS = 2500;

const WORKSPACE_URL = getBaseUrl();

const CONFIG_BUTTON =
  'flex w-full items-center justify-center gap-space-xs rounded-xl bg-surface-container px-space-md py-space-sm font-label-md text-label-md font-semibold text-pine-deep transition-colors hover:bg-surface-container-high';

const CARD_NUMBER =
  'inline-flex h-10 w-10 items-center justify-center rounded-xl font-headline-sm text-headline-sm font-bold';

const METRIC_CELL = 'flex flex-col';

const SEAL_ICON = 'shrink-0 rounded-lg p-space-xs text-pine-deep';

const BAND_STEP_LABEL = 'font-caption text-caption';

const BAND_STEP_NAME = 'font-label-md text-label-md font-semibold truncate';

const BAND_DONE_CARD =
  'flex items-center gap-space-sm rounded-lg bg-surface-container-lowest px-space-md py-space-sm shadow-sm';

/**
 * Wizard breadcrumb folded from the activation mock: the "final stage" eyebrow, the completion ratio,
 * and the three step cards read as finished (the last one as the verified active step).
 *
 * @returns Full-width tracker panel rendered above the success headline.
 */
function PendaftaranCompletionBand() {
  const t = useTranslations('PendaftaranPage');
  const doneSteps = [
    { labelKey: 'done_band_step1_label', nameKey: 'done_band_step1_name' },
    { labelKey: 'done_band_step2_label', nameKey: 'done_band_step2_name' },
  ] as const;

  return (
    <div className="mx-auto mb-space-2xl w-full max-w-4xl">
      <div className="mb-space-sm flex items-center justify-between">
        <span className="flex items-center gap-space-xs font-eyebrow text-eyebrow tracking-widest text-secondary uppercase">
          <span className="inline-block h-2 w-2 animate-ping rounded-full bg-amber-gold" />
          {t('done_band_eyebrow')}
        </span>
        <span className="font-caption text-caption text-text-muted">{t('done_band_progress')}</span>
      </div>
      <div className="grid grid-cols-1 gap-space-sm rounded-xl bg-surface-container p-space-xs shadow-inner md:grid-cols-3">
        {doneSteps.map(({ labelKey, nameKey }) => (
          <div className={BAND_DONE_CARD} key={labelKey}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-status-present text-pine-deep">
              <span className="material-symbols-outlined text-[16px]">check</span>
            </div>
            <div className="flex min-w-0 flex-col">
              <span className={`${BAND_STEP_LABEL} text-text-muted`}>{t(labelKey)}</span>
              <span className={`${BAND_STEP_NAME} text-text-primary`}>{t(nameKey)}</span>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-space-sm rounded-lg bg-pine-deep px-space-md py-space-sm text-on-primary shadow-sm">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-gold text-pine-deep shadow-sm">
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
          </div>
          <div className="flex min-w-0 flex-col">
            <span className={`${BAND_STEP_LABEL} text-amber-gold`}>
              {t('done_band_step3_label')}
            </span>
            <span className={`${BAND_STEP_NAME} text-on-primary`}>{t('done_band_step3_name')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Editorial headline confirming the registration succeeded: a completion badge, the welcome title,
 * and the one-line summary of what the wizard provisioned.
 *
 * @returns Centered header block for the success screen.
 */
function PendaftaranSuccessHeader() {
  const t = useTranslations('PendaftaranPage');

  return (
    <div className="mx-auto mb-space-2xl max-w-3xl text-center">
      <div className="mb-space-md inline-flex items-center gap-space-xs rounded-full bg-status-present px-space-md py-space-xs text-text-primary">
        <span
          className="material-symbols-outlined text-[16px] text-pine-deep"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          stars
        </span>
        <span className="font-caption text-caption font-semibold tracking-wider uppercase">
          {t('done_badge')}
        </span>
      </div>
      <h1 className="mb-space-sm font-headline-xl text-headline-xl tracking-tight text-pine-deep">
        {t('done_title')}
      </h1>
      <p className="mx-auto max-w-2xl font-body-lg text-body-lg text-text-muted">
        {t('done_summary')}
      </p>
    </div>
  );
}

/**
 * Hero workspace card: the verification crest, the provisioned school identity, the four provisioning
 * metrics, and a quick action to copy the workspace URL.
 *
 * @param props - Registered school, and the clipboard handler for the workspace URL.
 * @returns Rounded hero card with accent strip, crest emblem, school data, and copy dock.
 */
function PendaftaranWorkspaceCard(props: {
  onCopy: (value: string) => void;
  school: { email: string; level: string; name: string; npsn: string };
}) {
  const t = useTranslations('PendaftaranPage');
  const { level } = props.school;
  const levelKey =
    level === 'SD' || level === 'SMP' || level === 'SMA' || level === 'SMK' || level === 'PESANTREN'
      ? LEVEL_LABELS[level]
      : undefined;

  return (
    <div className="relative mx-auto mb-space-3xl w-full max-w-5xl overflow-hidden rounded-2xl bg-surface-container-lowest shadow-xl">
      <div className="h-2 w-full bg-gradient-to-r from-pine-deep via-amber-gold to-pine-deep" />
      <div className="relative flex flex-col items-center gap-space-2xl p-space-xl sm:p-space-3xl md:flex-row">
        <div className="relative flex shrink-0 items-center justify-center">
          <div className="absolute inset-0 scale-150 rounded-full bg-status-present/50 blur-2xl" />
          <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-pine-deep p-space-xs shadow-lg sm:h-44 sm:w-44">
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-pine-deep p-space-md text-center">
              <span
                className="material-symbols-outlined animate-bounce text-[54px] text-amber-gold sm:text-[64px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified_user
              </span>
              <span className="mt-space-xs font-eyebrow text-eyebrow tracking-widest text-primary-fixed uppercase">
                {t('done_crest_label')}
              </span>
            </div>
            <div className="absolute -bottom-2 flex items-center gap-1 rounded-full bg-amber-gold px-space-md py-0.5 font-caption text-caption font-bold text-pine-deep shadow-md">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              {t('done_seal')}
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1 text-center md:text-left">
          <div className="mb-space-sm inline-flex items-center gap-space-xs rounded-full bg-amber-surface px-space-md py-space-xs text-amber-dark">
            <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-amber-gold" />
            <span className="font-caption text-caption font-semibold">{t('done_trial_note')}</span>
          </div>
          <h2 className="mb-space-xs font-headline-lg text-headline-lg tracking-tight text-text-primary">
            {props.school.name}
          </h2>
          <p className="mb-space-lg flex flex-wrap items-center justify-center gap-x-space-md gap-y-space-xs font-body-md text-body-md text-text-muted md:justify-start">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-pine-deep">tag</span>
              <span>
                {t('done_level_label')}{' '}
                <strong className="font-medium text-text-primary">
                  {levelKey === undefined ? props.school.level : t(levelKey)}
                </strong>
              </span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-pine-deep">domain</span>
              <span>
                {t('done_npsn_label')}{' '}
                <strong className="font-medium text-text-primary">{props.school.npsn}</strong>
              </span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-pine-deep">badge</span>
              <span>
                {t('done_admin_label')}{' '}
                <strong className="font-medium text-text-primary">{props.school.email}</strong>
              </span>
            </span>
          </p>
          <div className="grid grid-cols-2 gap-space-sm rounded-xl bg-canvas-base p-space-md sm:grid-cols-4">
            <div className={METRIC_CELL}>
              <span className="font-caption text-caption text-text-muted">
                {t('done_metric_capacity_label')}
              </span>
              <span className="font-headline-sm text-headline-sm font-semibold text-pine-deep">
                {t('done_metric_capacity_value')}
              </span>
            </div>
            <div className={METRIC_CELL}>
              <span className="font-caption text-caption text-text-muted">
                {t('done_metric_staff_label')}
              </span>
              <span className="font-headline-sm text-headline-sm font-semibold text-pine-deep">
                {t('done_metric_staff_value')}
              </span>
            </div>
            <div className={METRIC_CELL}>
              <span className="font-caption text-caption text-text-muted">
                {t('done_metric_sync_label')}
              </span>
              <span className="font-headline-sm text-headline-sm font-semibold text-pine-deep">
                {t('done_metric_sync_value')}
              </span>
            </div>
            <div className={METRIC_CELL}>
              <span className="font-caption text-caption text-text-muted">
                {t('done_metric_sla_label')}
              </span>
              <span className="font-headline-sm text-headline-sm font-semibold text-pine-deep">
                {t('done_metric_sla_value')}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between gap-space-md bg-surface-container px-space-xl py-space-lg sm:flex-row sm:px-space-3xl">
        <div className="flex items-center gap-space-sm font-caption text-caption text-text-muted">
          <span className="material-symbols-outlined text-[18px] text-pine-deep">lock</span>
          <span>{t('done_secure_note')}</span>
        </div>
        <div className="flex w-full items-center gap-space-sm sm:w-auto">
          <button
            className="flex cursor-pointer items-center justify-center gap-space-xs rounded-lg bg-surface-container-lowest px-space-md py-space-xs font-label-md text-label-md text-text-primary shadow-sm transition-colors hover:bg-surface-container-high focus-visible:ring-2 focus-visible:ring-[#173F36] focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] sm:w-auto"
            onClick={() => props.onCopy(WORKSPACE_URL)}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">content_copy</span>
            {t('done_copy_url')}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Trial subscription summary folded from the second mock: the plan title, the validity window, the
 * remaining duration, and the unlocked feature list.
 *
 * @returns Pine licence card with trial badge and feature checklist.
 */
function PendaftaranTrialLicence() {
  const t = useTranslations('PendaftaranPage');
  const features = [
    'done_feature_biometric',
    'done_feature_whatsapp',
    'done_feature_portal',
    'done_feature_export',
  ] as const;

  return (
    <div className="relative mx-auto mb-space-2xl w-full max-w-5xl overflow-hidden rounded-2xl bg-pine-deep p-space-xl text-on-primary shadow-lg">
      <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-secondary-container/10 blur-xl" />
      <div className="relative flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <span className="font-eyebrow text-eyebrow font-semibold tracking-wider text-secondary-container uppercase">
            {t('done_licence_eyebrow')}
          </span>
          <span className="rounded-full bg-secondary-container px-space-xs py-0.5 font-caption text-[11px] font-bold text-on-secondary-container">
            {t('done_licence_badge')}
          </span>
        </div>
        <div>
          <h3 className="font-headline-sm text-headline-sm font-bold text-white">
            {t('done_licence_title')}
          </h3>
          <p className="mt-1 font-label-md text-caption text-on-primary-container">
            {t('done_licence_desc')}
          </p>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-surface-card/10 p-space-md backdrop-blur-sm">
          <div>
            <span className="block font-caption text-[11px] text-on-primary-container uppercase">
              {t('done_licence_validity_label')}
            </span>
            <span className="font-label-md text-label-md font-bold text-white">
              {t('done_licence_validity_value')}
            </span>
          </div>
          <div className="text-right">
            <span className="block font-caption text-[11px] text-on-primary-container uppercase">
              {t('done_licence_remaining_label')}
            </span>
            <span className="font-headline-sm text-headline-sm leading-none font-bold text-secondary-container">
              {t('done_licence_remaining_value')}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-space-xs pt-space-xs font-caption text-caption text-white">
          <span className="mb-1 font-label-md text-label-md font-semibold text-secondary-container">
            {t('done_licence_features_label')}
          </span>
          {features.map((featureKey) => (
            <div className="flex items-center gap-space-xs" key={featureKey}>
              <span className="material-symbols-outlined text-[16px] text-secondary-container">
                check_circle
              </span>
              <span>{t(featureKey)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Bento checklist of the three first-time setup tasks folded from the primary mock, each with its
 * accent badge, supporting snapshot pill, and action.
 *
 * @returns Section header plus a responsive three-card setup grid.
 */
function PendaftaranSetupBento() {
  const t = useTranslations('PendaftaranPage');

  return (
    <>
      <div className="mx-auto mb-space-lg flex w-full max-w-5xl flex-col justify-between gap-space-sm sm:flex-row sm:items-end">
        <div>
          <span className="mb-space-xs block font-eyebrow text-eyebrow tracking-wider text-secondary uppercase">
            {t('done_bento_eyebrow')}
          </span>
          <h3 className="font-headline-sm text-headline-sm font-bold text-pine-deep">
            {t('done_bento_title')}
          </h3>
        </div>
        <p className="max-w-xs font-caption text-caption text-text-muted">{t('done_bento_hint')}</p>
      </div>

      <div className="mx-auto mb-space-2xl grid w-full max-w-5xl grid-cols-1 gap-space-lg md:grid-cols-3">
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-pine-deep p-space-xl text-on-primary shadow-lg">
          <span className="material-symbols-outlined pointer-events-none absolute -right-6 -bottom-6 text-[140px] text-primary-container transition-transform duration-300 select-none group-hover:scale-110">
            sync_saved_locally
          </span>
          <div className="relative z-10">
            <div className="mb-space-lg flex items-center justify-between">
              <span className={`${CARD_NUMBER} bg-amber-gold text-pine-deep`}>1</span>
              <span className="rounded-full bg-primary-container px-space-sm py-1 font-caption text-caption font-semibold text-amber-gold">
                {t('done_task1_badge')}
              </span>
            </div>
            <h4 className="mb-space-xs font-headline-sm text-headline-sm font-semibold text-on-primary">
              {t('done_task1_title')}
            </h4>
            <p className="mb-space-lg font-body-md text-body-md text-primary-fixed">
              {t('done_task1_desc')}
            </p>
          </div>
          <div className="relative z-10 pt-space-md">
            {/* shortcut: the data-import wizard has no route yet, so the internal link targets the app root; point it at the wizard once it ships. */}
            <Link
              className="flex w-full items-center justify-center gap-space-xs rounded-xl bg-amber-gold px-space-md py-space-sm font-label-md text-label-md font-semibold text-pine-deep shadow transition-colors hover:bg-amber-hover"
              href="/dashboard/presensi"
            >
              <span>{t('done_task1_action')}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-space-xl shadow-sm transition-shadow hover:shadow-md">
          <div>
            <div className="mb-space-lg flex items-center justify-between">
              <span className={`${CARD_NUMBER} bg-surface-container-high text-pine-deep`}>2</span>
              <span className="rounded-full bg-pine-light px-space-sm py-1 font-caption text-caption font-semibold text-pine-deep">
                {t('done_task2_badge')}
              </span>
            </div>
            <h4 className="mb-space-xs font-headline-sm text-headline-sm font-semibold text-text-primary">
              {t('done_task2_title')}
            </h4>
            <p className="mb-space-lg font-body-md text-body-md text-text-muted">
              {t('done_task2_desc')}
            </p>
            <div className="mb-space-md flex items-center gap-space-sm rounded-xl bg-canvas-base p-space-sm">
              <span className="material-symbols-outlined text-[20px] text-secondary">
                my_location
              </span>
              <div className="flex flex-col">
                <span className="font-caption text-caption font-semibold text-text-primary">
                  {t('done_task2_coord_title')}
                </span>
                <span className="font-caption text-caption text-text-muted">
                  {t('done_task2_coord_value')}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-space-md">
            <button className={CONFIG_BUTTON} type="button">
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>{t('done_task2_action')}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-space-xl shadow-sm transition-shadow hover:shadow-md">
          <div>
            <div className="mb-space-lg flex items-center justify-between">
              <span className={`${CARD_NUMBER} bg-surface-container-high text-pine-deep`}>3</span>
              <span className="flex items-center gap-1 rounded-full bg-status-present px-space-sm py-1 font-caption text-caption font-semibold text-pine-deep">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-pine-deep" />
                {t('done_task3_badge')}
              </span>
            </div>
            <h4 className="mb-space-xs font-headline-sm text-headline-sm font-semibold text-text-primary">
              {t('done_task3_title')}
            </h4>
            <p className="mb-space-lg font-body-md text-body-md text-text-muted">
              {t('done_task3_desc')}
            </p>
            <div className="mb-space-md flex items-center gap-space-sm rounded-xl bg-amber-surface p-space-sm">
              <span className="material-symbols-outlined text-[20px] text-amber-dark">
                notifications_active
              </span>
              <div className="flex flex-col">
                <span className="font-caption text-caption font-semibold text-amber-dark">
                  {t('done_task3_format_title')}
                </span>
                <span className="font-caption text-caption text-text-muted">
                  {t('done_task3_format_value')}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-space-md">
            <button className={CONFIG_BUTTON} type="button">
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span>{t('done_task3_action')}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Primary action dock: the enter-dashboard CTA plus the admin-guide download and the staff invite row.
 *
 * @param props - Handler invoked by the primary dashboard CTA.
 * @returns Panel with the next-action headline, CTA pair, and additional-operator invite row.
 */
function PendaftaranActionDock(props: { onStart: () => void }) {
  const t = useTranslations('PendaftaranPage');

  return (
    <div className="mx-auto mb-space-2xl w-full max-w-5xl rounded-2xl bg-surface-container-lowest p-space-xl shadow-lg">
      <div className="flex flex-col items-center justify-between gap-space-lg lg:flex-row">
        <div className="max-w-xl text-center lg:text-left">
          <h4 className="mb-space-xs font-headline-sm text-headline-sm font-bold text-pine-deep">
            {t('done_cta_title')}
          </h4>
          <p className="font-body-md text-body-md text-text-muted">{t('done_cta_desc')}</p>
        </div>
        <div className="flex w-full flex-col items-center gap-space-md sm:flex-row lg:w-auto">
          {/* The mock renders "Masuk ke Dashboard" as an in-app anchor; here it is the primary CTA, so the parent owns navigation via onStart rather than a Link. */}
          <button
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-space-sm rounded-xl bg-pine-deep px-space-xl font-label-md text-label-md font-semibold text-on-primary shadow-md transition-all hover:scale-[1.02] hover:bg-pine-hover focus-visible:ring-2 focus-visible:ring-[#173F36] focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.99] sm:w-auto"
            onClick={props.onStart}
            type="button"
          >
            <span>{t('done_cta_dashboard')}</span>
            <span className="material-symbols-outlined text-[20px] text-amber-gold">east</span>
          </button>
          <button
            className="flex h-12 w-full items-center justify-center gap-space-xs rounded-xl bg-surface-container-lowest px-space-lg font-label-md text-label-md font-semibold text-pine-deep shadow-sm transition-colors hover:bg-surface-container sm:w-auto"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>{t('done_cta_guide')}</span>
          </button>
        </div>
      </div>
      <div className="mt-space-lg flex flex-col items-center justify-between gap-space-md border-t border-border-subtle pt-space-lg sm:flex-row">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-[20px] text-pine-deep">group_add</span>
          <span className="font-label-md text-label-md font-medium text-text-primary">
            {t('done_invite_label')}
          </span>
        </div>
        <div className="flex w-full items-center gap-space-sm sm:w-auto">
          <input
            className="h-10 w-full rounded-xl bg-canvas-base px-space-md font-label-md text-label-md text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-pine-deep focus:outline-none sm:w-64"
            placeholder={t('done_invite_placeholder')}
            type="email"
          />
          <button
            className="h-10 shrink-0 rounded-xl bg-secondary-container px-space-md font-label-md text-label-md font-semibold text-on-secondary-container transition-colors hover:bg-amber-gold"
            type="button"
          >
            {t('done_invite_cta')}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Verification and authority strip: the four trust seals (digital certificate, encryption, Dapodik
 * sync, and the registered person-in-charge).
 *
 * @returns Canvas panel with four icon-and-caption security seals.
 */
function PendaftaranSecurityBox() {
  const t = useTranslations('PendaftaranPage');

  return (
    <div className="mx-auto mb-space-2xl grid w-full max-w-5xl grid-cols-1 items-center gap-space-lg rounded-2xl bg-canvas-base p-space-xl md:grid-cols-4">
      <div className="flex items-start gap-space-sm">
        <div className={`${SEAL_ICON} bg-status-present`}>
          <span className="material-symbols-outlined text-[20px]">verified</span>
        </div>
        <div>
          <div className="font-label-md text-label-md font-semibold text-text-primary">
            {t('done_seal_cert_title')}
          </div>
          <div className="font-caption text-caption text-text-muted">
            {t('done_seal_cert_value')}
          </div>
        </div>
      </div>
      <div className="flex items-start gap-space-sm">
        <div className={`${SEAL_ICON} bg-status-present`}>
          <span className="material-symbols-outlined text-[20px]">encrypted</span>
        </div>
        <div>
          <div className="font-label-md text-label-md font-semibold text-text-primary">
            {t('done_seal_encryption_title')}
          </div>
          <div className="font-caption text-caption text-text-muted">
            {t('done_seal_encryption_value')}
          </div>
        </div>
      </div>
      <div className="flex items-start gap-space-sm">
        <div className={`${SEAL_ICON} bg-status-present`}>
          <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
        </div>
        <div>
          <div className="font-label-md text-label-md font-semibold text-text-primary">
            {t('done_seal_sync_title')}
          </div>
          <div className="font-caption text-caption text-text-muted">
            {t('done_seal_sync_value')}
          </div>
        </div>
      </div>
      <div className="flex items-start gap-space-sm">
        <div className={`${SEAL_ICON} bg-surface-container-high`}>
          <span className="material-symbols-outlined text-[20px]">badge</span>
        </div>
        <div>
          <div className="font-label-md text-label-md font-semibold text-text-primary">
            {t('done_seal_pic_title')}
          </div>
          <div className="font-caption text-caption text-text-muted">
            {t('done_seal_pic_value')}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Dedicated support banner offering a live onboarding session with an implementation consultant.
 *
 * @returns Amber banner with the support pitch and a WhatsApp consultant link.
 */
function PendaftaranSupportBanner() {
  const t = useTranslations('PendaftaranPage');

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-space-md rounded-2xl bg-amber-surface p-space-lg sm:flex-row">
      <div className="flex items-center gap-space-md">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-gold/30 text-amber-dark">
          <span className="material-symbols-outlined text-[28px]">support_agent</span>
        </div>
        <div>
          <h5 className="font-label-md text-label-md font-bold text-amber-dark">
            {t('done_support_title')}
          </h5>
          <p className="font-caption text-caption text-text-muted">{t('done_support_desc')}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-space-sm">
        <a
          className="inline-flex items-center gap-space-xs rounded-xl bg-pine-deep px-space-md py-space-xs font-label-md text-label-md font-medium text-on-primary shadow-sm transition-colors hover:bg-pine-hover"
          href="https://wa.me/6281234567890"
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="material-symbols-outlined text-[18px]">call</span>
          <span>{t('done_support_cta')}</span>
        </a>
      </div>
    </div>
  );
}

/**
 * Terminal screen of the school registration wizard, merged from the two success mocks: opens with the
 * activation mock's completion band and keeps the editorial confirmation layout of the primary mock,
 * then folds in the second mock's unique trial-licence summary and administrator email.
 *
 * @param props - Registered school and the handler invoked by the primary dashboard CTA.
 * @returns Full success screen with copy-to-clipboard toast feedback.
 */
export function PendaftaranSuccessStep(props: {
  onStart: () => void;
  school: { email: string; level: string; name: string; npsn: string };
}) {
  const t = useTranslations('PendaftaranPage');
  const [isCopied, setIsCopied] = useState(false);

  function copyToClipboard(value: string) {
    void navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), COPY_TOAST_MS);
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-margin py-space-xl sm:py-space-2xl">
      <PendaftaranCompletionBand />
      <PendaftaranSuccessHeader />
      <PendaftaranWorkspaceCard onCopy={copyToClipboard} school={props.school} />
      <PendaftaranTrialLicence />
      <PendaftaranSetupBento />
      <PendaftaranActionDock onStart={props.onStart} />
      <PendaftaranSecurityBox />
      <PendaftaranSupportBanner />
      <div
        className={`fixed right-6 bottom-6 z-50 flex transform items-center gap-space-sm rounded-xl bg-primary px-space-md py-space-sm text-on-primary shadow-xl transition-all duration-300 ${
          isCopied ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-20 opacity-0'
        }`}
      >
        <span className="material-symbols-outlined text-[18px] text-secondary-container">
          check_circle
        </span>
        <span className="font-label-md text-caption font-semibold">{t('done_toast_copied')}</span>
      </div>
    </section>
  );
}
