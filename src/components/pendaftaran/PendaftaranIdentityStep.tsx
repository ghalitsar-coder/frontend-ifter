'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type {
  PendaftaranDraft,
  PendaftaranField,
  PendaftaranIssue,
  PendaftaranIssueMap,
} from '@/components/pendaftaran/pendaftaranState';
import { Link } from '@/libs/I18nNavigation';

const INPUT_BASE =
  'w-full h-11 pl-10 pr-4 rounded-xl bg-surface-card text-text-primary font-body-md text-body-md placeholder-text-muted outline-none shadow-sm focus:bg-surface-container-lowest focus:shadow-md transition-all';
const INPUT_ERROR = `${INPUT_BASE} pr-10 bg-error-container/30 text-text-primary shadow-[0_0_0_2px_#ba1a1a]`;
const LABEL_BASE = 'block font-label-md text-label-md font-semibold text-text-primary mb-1';
const LEADING_ICON =
  'material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px]';
const LINK =
  'text-primary font-semibold underline underline-offset-4 hover:text-pine-hover rounded focus-visible:ring-2 focus-visible:ring-[#173F36]';

/**
 * Element id of every step-one field, kept identical to the Stitch mock so the summary banner can
 * scroll straight to the offending input.
 */
const FIELD_IDS: Record<PendaftaranField, string> = {
  adminName: 'admin-name',
  confirmPassword: 'confirm-password',
  email: 'admin-email',
  level: 'school-level',
  name: 'school-name',
  npsn: 'school-npsn',
  password: 'admin-password',
  phone: 'admin-phone',
  termsAccepted: 'terms-agreement',
  waOptIn: 'wa-notification-optin',
};

const FIELD_ENTRIES = [
  {
    field: 'name',
    icon: 'account_balance',
    kind: 'text',
    labelKey: 'id_name_label',
    maxLength: 120,
    placeholderKey: 'id_name_placeholder',
    span2: true,
    type: 'text',
  },
  {
    field: 'npsn',
    icon: 'pin',
    kind: 'text',
    labelKey: 'id_npsn_label',
    maxLength: 8,
    pattern: '[0-9]{8}',
    placeholderKey: 'id_npsn_placeholder',
    span2: false,
    type: 'text',
  },
  {
    field: 'level',
    icon: 'school',
    kind: 'select',
    labelKey: 'id_level_label',
    placeholderKey: 'id_level_prompt',
    span2: false,
  },
  {
    field: 'adminName',
    icon: 'badge',
    kind: 'text',
    labelKey: 'id_admin_label',
    maxLength: 100,
    placeholderKey: 'id_admin_placeholder',
    span2: true,
    type: 'text',
  },
  {
    field: 'email',
    icon: 'alternate_email',
    kind: 'text',
    labelKey: 'id_email_label',
    maxLength: 254,
    placeholderKey: 'id_email_placeholder',
    span2: false,
    type: 'email',
  },
  {
    field: 'phone',
    icon: 'chat',
    kind: 'text',
    labelKey: 'id_phone_label',
    maxLength: 20,
    placeholderKey: 'id_phone_placeholder',
    span2: false,
    type: 'tel',
  },
  {
    field: 'password',
    icon: 'lock',
    kind: 'password',
    labelKey: 'id_password_label',
    maxLength: 72,
    placeholderKey: 'id_password_placeholder',
    span2: false,
    type: 'password',
  },
  {
    field: 'confirmPassword',
    icon: 'lock_reset',
    kind: 'password',
    labelKey: 'id_confirm_label',
    maxLength: 72,
    placeholderKey: 'id_confirm_placeholder',
    span2: false,
    type: 'password',
  },
] as const;

const LEVEL_VALUES = ['SD', 'SMP', 'SMA', 'SMK', 'PESANTREN'] as const;

export const LEVEL_LABELS = {
  PESANTREN: 'id_level_pesantren',
  SD: 'id_level_sd',
  SMA: 'id_level_sma',
  SMK: 'id_level_smk',
  SMP: 'id_level_smp',
} as const;

const BANNER_LABELS = {
  adminName: 'id_admin_label',
  confirmPassword: 'id_confirm_label',
  email: 'id_email_label',
  level: 'id_level_label',
  name: 'id_name_label',
  npsn: 'id_npsn_label',
  password: 'id_password_label',
  phone: 'id_phone_label',
  termsAccepted: 'id_terms_short',
} as const;

const CHECK_ROWS = ['aside_item_setup', 'aside_item_access', 'aside_item_mobile'] as const;

const PILL_STATUSES = [
  { glyph: 'check', labelKey: 'pill_hadir', tone: 'bg-status-present' },
  { glyph: 'add', labelKey: 'pill_sakit', tone: 'bg-status-sick' },
  { glyph: 'circle', labelKey: 'pill_izin', tone: 'bg-status-permission' },
  { glyph: 'close', labelKey: 'pill_alpa', tone: 'bg-status-absent' },
] as const;

/**
 * One-line failure message under a field, with the copy and values of the validation rule.
 *
 * @param props - Issue of the field, if any.
 * @returns The error row, or nothing when the field passes.
 */
function FieldMessage(props: { id?: string; issue?: PendaftaranIssue }) {
  const t = useTranslations('PendaftaranPage');

  if (props.issue === undefined) {
    return null;
  }

  return (
    <p
      className="mt-0.5 flex items-center gap-1 font-caption text-caption font-medium text-error"
      id={props.id}
    >
      <span className="material-symbols-outlined text-[16px]">error</span>
      {t(props.issue.messageKey, props.issue.values)}
    </p>
  );
}

/**
 * One labelled input of step one, in its passing or failing look.
 *
 * @param props - Field description, current draft, the issues to render against it, and the writers.
 * @returns Label, control, adornments and error message for one field.
 */
function PendaftaranFieldControl(props: {
  entry: (typeof FIELD_ENTRIES)[number];
  issues: PendaftaranIssueMap;
  onReveal: (field: PendaftaranField) => void;
  onUpdate: (field: PendaftaranField, value: string) => void;
  revealed: string;
  value: string;
}) {
  const t = useTranslations('PendaftaranPage');
  const { entry } = props;
  const issue = props.issues[entry.field];
  const hasIssue = issue !== undefined;
  const inputClass = hasIssue ? INPUT_ERROR : INPUT_BASE;

  return (
    <div
      className={`${entry.span2 ? 'md:col-span-2' : ''} flex scroll-mt-24 flex-col gap-space-xs`}
    >
      <label className={LABEL_BASE} htmlFor={FIELD_IDS[entry.field]}>
        {t(entry.labelKey)} <span className="text-error">*</span>
      </label>
      <div className="relative">
        <span className={`${LEADING_ICON} ${hasIssue ? 'text-error' : 'text-text-muted'}`}>
          {entry.icon}
        </span>
        {entry.kind === 'select' ? (
          <>
            <select
              aria-describedby={hasIssue ? `${FIELD_IDS[entry.field]}-error` : undefined}
              aria-invalid={hasIssue}
              className={
                hasIssue
                  ? `${INPUT_ERROR} cursor-pointer appearance-none`
                  : 'h-11 w-full cursor-pointer appearance-none rounded-xl bg-surface-card pr-10 pl-10 font-body-md text-body-md text-text-primary shadow-sm transition-all outline-none focus:bg-surface-container-lowest focus:shadow-md'
              }
              id={FIELD_IDS[entry.field]}
              onChange={(event) => {
                props.onUpdate(entry.field, event.target.value);
              }}
              value={props.value}
            >
              <option disabled value="">
                {t('id_level_prompt')}
              </option>
              {LEVEL_VALUES.map((value) => (
                <option key={value} value={value}>
                  {t(LEVEL_LABELS[value])}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[20px] text-text-muted">
              expand_more
            </span>
          </>
        ) : (
          <>
            <input
              aria-describedby={hasIssue ? `${FIELD_IDS[entry.field]}-error` : undefined}
              aria-invalid={hasIssue}
              className={entry.kind === 'password' ? `${inputClass} pr-10` : inputClass}
              id={FIELD_IDS[entry.field]}
              maxLength={'maxLength' in entry ? entry.maxLength : undefined}
              onChange={(event) => {
                props.onUpdate(entry.field, event.target.value);
              }}
              pattern={'pattern' in entry ? entry.pattern : undefined}
              placeholder={t(entry.placeholderKey)}
              type={
                entry.kind === 'password' && props.revealed !== entry.field
                  ? 'password'
                  : entry.type
              }
              value={props.value}
            />
            {entry.kind === 'password' ? (
              <button
                aria-label={t('id_toggle_visibility')}
                aria-pressed={props.revealed === entry.field}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-text-muted outline-none hover:text-text-primary focus-visible:ring-2 focus-visible:ring-[#173F36] focus-visible:ring-offset-2"
                onClick={() => {
                  props.onReveal(entry.field);
                }}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  {props.revealed === entry.field ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            ) : (
              hasIssue && (
                <span className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center text-error">
                  <span className="material-symbols-outlined text-[22px]">cancel</span>
                </span>
              )
            )}
          </>
        )}
      </div>
      {entry.field === 'adminName' && (
        <p className="font-caption text-caption text-text-muted">{t('id_admin_hint')}</p>
      )}
      {issue !== undefined && <FieldMessage id={`${FIELD_IDS[entry.field]}-error`} issue={issue} />}
    </div>
  );
}

/**
 * Step one of the registration wizard: school profile, person-in-charge account, consent
 * checkboxes, and the trust sidebar the mock pairs with them.
 *
 * @param props - Draft values, the failures to mark on them, the field writer, and the handler that
 * advances the wizard.
 * @returns Step-one form column, sidebar column, and the category pill strip below them.
 */
export function PendaftaranIdentityStep(props: {
  draft: PendaftaranDraft;
  issues: PendaftaranIssueMap;
  onChange: (field: PendaftaranField, value: string | boolean) => void;
  onSubmit: () => void;
}) {
  const t = useTranslations('PendaftaranPage');
  const [revealed, setRevealed] = useState('');

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-1 items-start gap-space-xl lg:grid-cols-12">
        <div className="flex flex-col gap-space-xl lg:col-span-8">
          {Object.keys(props.issues).length > 0 && (
            <div className="rounded-2xl bg-amber-surface p-space-md text-amber-dark shadow-sm sm:p-space-lg">
              <div className="flex items-start gap-space-sm">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-gold/30 text-amber-dark">
                  <span className="material-symbols-outlined text-[22px]">warning</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="font-label-md text-label-md font-bold text-amber-dark">
                      {t('banner_title')}
                    </h2>
                    <span className="rounded-full bg-amber-gold/40 px-2 py-0.5 font-caption text-caption font-bold tracking-wider text-amber-dark uppercase">
                      {t('banner_attention')}
                    </span>
                  </div>
                  <p className="mt-1 font-body-md text-body-md font-normal text-on-surface">
                    {t.rich('banner_desc', {
                      count: (chunk) => <strong>{chunk}</strong>,
                      count_value: Object.keys(props.issues).length,
                    })}
                  </p>
                  <div className="mt-space-sm flex flex-wrap gap-space-sm">
                    {Object.keys(props.issues).map((field) => (
                      <a
                        className="inline-flex items-center gap-1 rounded-lg bg-surface-card px-space-sm py-1 font-caption text-caption font-semibold text-pine-deep shadow-sm transition-colors hover:bg-surface-container"
                        href={`#${FIELD_IDS[field as PendaftaranField]}`}
                        key={field}
                      >
                        <span className="material-symbols-outlined text-[14px] text-error">
                          arrow_downward
                        </span>
                        {t(BANNER_LABELS[field as keyof typeof BANNER_LABELS])}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <form
            className="space-y-space-xl rounded-xl bg-surface-card p-space-xl shadow-sm sm:p-space-2xl"
            onSubmit={(event) => {
              event.preventDefault();
              props.onSubmit();
            }}
          >
            <div className="flex flex-col items-start justify-between gap-space-md rounded-xl bg-amber-surface p-space-lg sm:flex-row sm:items-center">
              <div className="flex items-center gap-space-md">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-card shadow-sm">
                  <svg aria-hidden="true" className="size-6" viewBox="0 0 24 24">
                    <path
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.24v3.15C3.26 21.4 7.33 24 12 24z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.59H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.41l4.04-3.15z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.6 1.24 6.59l4.04 3.15c.95-2.84 3.6-4.99 6.72-4.99z"
                      fill="#EA4335"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-label-md text-label-md font-semibold text-text-primary">
                    {t('id_google_title')}
                  </h3>
                  <p className="font-caption text-caption text-text-muted">{t('id_google_desc')}</p>
                </div>
              </div>
              {/* shortcut: no school-domain identity provider exists yet, so the fast track stays inert; enable it once one is wired. */}
              <button
                className="w-full shrink-0 rounded-lg bg-surface-card px-space-md py-2.5 font-label-md text-label-md font-semibold text-text-primary shadow-sm transition-all outline-none hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-[#173F36] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
                disabled
                type="button"
              >
                {t('id_google_cta')}
              </button>
            </div>

            <div className="relative flex items-center py-space-xs">
              <div className="h-0.5 flex-grow rounded-full bg-surface-container-high" />
              <span className="mx-4 flex-shrink font-caption text-caption tracking-wider text-text-muted uppercase">
                {t('id_divider')}
              </span>
              <div className="h-0.5 flex-grow rounded-full bg-surface-container-high" />
            </div>

            <div className="space-y-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-gold" />
                <h2 className="font-headline-sm text-headline-sm tracking-tight text-text-primary">
                  {t('id_section_school')}
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
                {FIELD_ENTRIES.slice(0, 3).map((entry) => (
                  <PendaftaranFieldControl
                    entry={entry}
                    issues={props.issues}
                    key={entry.field}
                    onReveal={setRevealed}
                    onUpdate={props.onChange}
                    revealed={revealed}
                    value={props.draft[entry.field]}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-space-md pt-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="h-2.5 w-2.5 rounded-full bg-primary-container" />
                <h2 className="font-headline-sm text-headline-sm tracking-tight text-text-primary">
                  {t('id_section_admin')}
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
                {FIELD_ENTRIES.slice(3).map((entry) => (
                  <PendaftaranFieldControl
                    entry={entry}
                    issues={props.issues}
                    key={entry.field}
                    onReveal={setRevealed}
                    onUpdate={props.onChange}
                    revealed={revealed}
                    value={props.draft[entry.field]}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-space-md rounded-xl bg-canvas-base p-space-lg pt-space-md">
              <div className="flex items-start gap-space-sm">
                <input
                  aria-invalid={props.issues.termsAccepted !== undefined}
                  checked={props.draft.termsAccepted}
                  className="mt-1 h-5 w-5 cursor-pointer rounded accent-pine-deep outline-none focus-visible:ring-2 focus-visible:ring-[#173F36] focus-visible:ring-offset-2"
                  id={FIELD_IDS.termsAccepted}
                  onChange={(event) => {
                    props.onChange('termsAccepted', event.target.checked);
                  }}
                  type="checkbox"
                />
                <label
                  className="cursor-pointer font-label-md text-label-md leading-snug text-text-primary"
                  htmlFor={FIELD_IDS.termsAccepted}
                >
                  {t.rich('id_terms', {
                    layanan: (chunk) => (
                      <a className={LINK} href="#">
                        {chunk}
                      </a>
                    ),
                    privasi: (chunk) => (
                      <a className={LINK} href="#">
                        {chunk}
                      </a>
                    ),
                  })}
                </label>
              </div>
              {props.issues.termsAccepted !== undefined && (
                <FieldMessage issue={props.issues.termsAccepted} />
              )}
              <div className="flex items-start gap-space-sm">
                <input
                  checked={props.draft.waOptIn}
                  className="mt-1 h-5 w-5 cursor-pointer rounded accent-pine-deep outline-none focus-visible:ring-2 focus-visible:ring-[#173F36] focus-visible:ring-offset-2"
                  id={FIELD_IDS.waOptIn}
                  onChange={(event) => {
                    props.onChange('waOptIn', event.target.checked);
                  }}
                  type="checkbox"
                />
                <label className="flex-1 cursor-pointer" htmlFor={FIELD_IDS.waOptIn}>
                  <span className="flex items-center gap-space-xs font-label-md text-label-md font-semibold text-text-primary">
                    {t('id_wa_title')}
                    <span className="rounded-full bg-status-present px-2 py-0.5 font-caption text-caption text-primary">
                      {t('id_wa_badge')}
                    </span>
                  </span>
                  <p className="mt-0.5 font-caption text-caption text-text-muted">
                    {t('id_wa_desc')}
                  </p>
                </label>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-space-md pt-space-md sm:flex-row">
              <button
                className="flex h-12 w-full items-center justify-center gap-space-sm rounded-xl bg-pine-deep px-space-xl font-label-md text-label-md font-semibold text-on-primary shadow-md transition-all outline-none hover:-translate-y-0.5 hover:bg-pine-hover focus-visible:ring-2 focus-visible:ring-[#173F36] focus-visible:ring-offset-2 sm:w-auto"
                type="submit"
              >
                <span>{t('id_submit')}</span>
                <span className="material-symbols-outlined text-[20px] text-amber-gold">
                  arrow_forward
                </span>
              </button>
              <div className="text-center font-label-md text-label-md text-text-muted sm:text-right">
                {t('id_already')}{' '}
                <Link
                  className="ml-1 font-semibold text-primary underline-offset-4 hover:underline"
                  href="/dashboard/presensi"
                >
                  {t('id_sign_in')}
                </Link>
              </div>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-space-lg lg:col-span-4">
          <div className="relative overflow-hidden rounded-xl bg-pine-deep p-space-xl text-on-primary shadow-md">
            <div className="pointer-events-none absolute -right-8 -bottom-8 text-on-primary opacity-10">
              <span className="material-symbols-outlined text-[140px]">school</span>
            </div>
            <div className="mb-space-sm flex items-center gap-space-xs text-amber-gold">
              <span className="material-symbols-outlined text-[20px]">stars</span>
              <span className="font-eyebrow text-eyebrow tracking-widest uppercase">
                {t('aside_eyebrow')}
              </span>
            </div>
            <h3 className="mb-space-sm font-headline-sm text-headline-sm font-semibold text-on-primary">
              {t('aside_trial_title')}
            </h3>
            <p className="mb-space-lg font-body-md text-body-md text-pine-light opacity-90">
              {t('aside_trial_desc')}
            </p>
            <div className="space-y-space-sm">
              {CHECK_ROWS.map((rowKey) => (
                <div
                  className="flex items-center gap-space-sm font-label-md text-label-md text-on-primary"
                  key={rowKey}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-status-present text-primary">
                    <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                  </span>
                  <span>{t(rowKey)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-surface-card p-space-xl shadow-sm">
            <div className="mb-space-md flex items-start gap-space-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-status-present/60">
                <span className="material-symbols-outlined text-[24px] text-primary">sync</span>
              </div>
              <div>
                <h4 className="font-label-md text-label-md font-bold text-text-primary">
                  {t('aside_sync_title')}
                </h4>
                <p className="mt-1 font-caption text-caption text-text-muted">
                  {t('aside_sync_desc')}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-canvas-base p-space-md text-center">
              <div className="flex flex-col items-center">
                <span className="material-symbols-outlined mb-1 text-[20px] text-primary">
                  dataset
                </span>
                <span className="font-caption text-caption font-semibold text-text-primary">
                  {t('aside_node_dapodik')}
                </span>
              </div>
              <span className="material-symbols-outlined text-[20px] text-text-muted">
                arrow_forward
              </span>
              <div className="flex flex-col items-center">
                <span className="material-symbols-outlined mb-1 text-[20px] text-amber-dark">
                  cloud_done
                </span>
                <span className="font-caption text-caption font-semibold text-text-primary">
                  {t('aside_node_core')}
                </span>
              </div>
              <span className="material-symbols-outlined text-[20px] text-text-muted">
                arrow_forward
              </span>
              <div className="flex flex-col items-center">
                <span className="material-symbols-outlined mb-1 text-[20px] text-primary">
                  mark_chat_read
                </span>
                <span className="font-caption text-caption font-semibold text-text-primary">
                  {t('aside_node_wa')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-space-md rounded-xl bg-surface-card p-space-xl shadow-sm">
            <div className="flex items-center gap-space-sm">
              <div className="flex -space-x-2 overflow-hidden">
                {[
                  { initials: 'SM', tone: 'bg-status-permission text-text-primary' },
                  { initials: 'AL', tone: 'bg-status-sick text-text-primary' },
                  { initials: 'TR', tone: 'bg-status-present text-text-primary' },
                  { initials: '+1k', tone: 'bg-primary text-on-primary' },
                ].map((avatar) => (
                  <div
                    className={`flex inline-block h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold ring-2 ring-surface-card ${avatar.tone}`}
                    key={avatar.initials}
                  >
                    {avatar.initials}
                  </div>
                ))}
              </div>
              <div className="min-w-0">
                <span className="block font-label-md text-label-md leading-tight font-bold text-text-primary">
                  {t('aside_proof_title')}
                </span>
                <span className="font-caption text-caption text-text-muted">
                  {t('aside_proof_region')}
                </span>
              </div>
            </div>
            <blockquote className="rounded-r-lg border-l-2 bg-surface-container/40 py-1 pl-3 font-caption text-caption text-text-muted italic">
              {t('aside_quote')}
              <span className="mt-1 block font-semibold text-text-primary not-italic">
                {t('aside_quote_by')}
              </span>
            </blockquote>
          </div>
        </div>
      </div>

      <div className="mt-space-3xl flex flex-col items-center justify-between gap-space-lg pt-space-xl md:flex-row">
        <div className="flex items-center gap-space-md">
          <span className="font-eyebrow text-eyebrow tracking-wider text-text-muted uppercase">
            {t('pill_label')}
          </span>
          <div className="flex flex-wrap items-center gap-space-xs">
            {PILL_STATUSES.map((pill) => (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${pill.tone} font-caption text-caption font-medium text-text-primary`}
                key={pill.labelKey}
              >
                <span className="material-symbols-outlined text-[14px]">{pill.glyph}</span>
                {t(pill.labelKey)}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-space-sm font-caption text-caption text-text-muted">
          <span className="material-symbols-outlined text-[18px] text-primary">security</span>
          <span>{t('pill_security')}</span>
        </div>
      </div>
    </div>
  );
}
