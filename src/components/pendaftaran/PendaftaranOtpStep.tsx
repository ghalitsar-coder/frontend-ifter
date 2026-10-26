'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { otpCodeComplete } from '@/components/pendaftaran/pendaftaranState';
import type { PendaftaranRegisterErrorKey } from '@/components/pendaftaran/pendaftaranState';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 102;

const OTP_BOX_CLASSES =
  'h-14 w-full max-w-[64px] flex-1 appearance-none rounded-lg bg-surface-container-lowest text-center font-headline-sm text-headline-sm font-bold text-pine-deep shadow-inner caret-pine-deep outline-none transition-all placeholder:text-text-muted placeholder:opacity-60 focus:bg-surface-container-low focus:shadow-md focus:ring-2 focus:ring-pine-deep/20';

/**
 * Renders the resend cooldown as mm:ss, matching the mock's "01:42" readout.
 *
 * @param seconds - Whole seconds left before a resend is allowed.
 * @returns Zero-padded minutes and seconds.
 */
function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

/**
 * Step 3 of the school registration wizard: the page header band, the six-digit WhatsApp OTP
 * boxes with the phone-number context line, the simulated resend cooldown, the verify action,
 * the helpdesk strip, and the school preview sidebar. The parent wizard renders the step
 * tracker above and the shell provides header, footer, and the institution sidebar.
 *
 * @param props - Back returns to step two; verified advances once a complete code is confirmed;
 * school feeds the Dapodik preview rows in the sidebar.
 * @returns The OTP verification layout with the school preview sidebar.
 */
export function PendaftaranOtpStep(props: {
  errorKey: PendaftaranRegisterErrorKey | null;
  isSubmitting: boolean;
  onBack: () => void;
  onVerified: () => void;
  school: { level: string; name: string; npsn: string; pic: string };
}) {
  const t = useTranslations('PendaftaranPage');
  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: OTP_LENGTH }, () => ''),
  );
  const [secondsLeft, setSecondsLeft] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const code = digits.join('');
  const remaining = OTP_LENGTH - digits.filter((digit) => digit !== '').length;

  function writeAt(index: number, char: string) {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = char;
      return next;
    });
  }

  function focusIndex(index: number) {
    inputRefs.current[index]?.focus();
  }

  function handleChange(index: number, raw: string) {
    const char = raw.replaceAll(/\D/gu, '').slice(-1);
    writeAt(index, char);
    if (char !== '' && index < OTP_LENGTH - 1) {
      focusIndex(index + 1);
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Backspace') {
      return;
    }
    event.preventDefault();
    if (digits[index] !== '') {
      writeAt(index, '');
    } else if (index > 0) {
      writeAt(index - 1, '');
      focusIndex(index - 1);
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replaceAll(/\D/gu, '').slice(0, OTP_LENGTH);
    if (pasted === '') {
      return;
    }
    setDigits(Array.from({ length: OTP_LENGTH }, (_, index) => pasted.slice(index, index + 1)));
    focusIndex(Math.min(pasted.length, OTP_LENGTH - 1));
  }

  // shortcut: the resend cooldown is simulated client-side, ticked by a setTimeout chain kicked
  // off from this click handler (no interval effect); replace with the cooldown the OTP
  // resend endpoint returns once it exists.
  function resend() {
    let left = RESEND_SECONDS;
    setSecondsLeft(left);

    function tick() {
      if (left <= 0) {
        return;
      }
      window.setTimeout(() => {
        left -= 1;
        setSecondsLeft(left);
        tick();
      }, 1000);
    }

    tick();
  }

  return (
    <div className="flex flex-col gap-space-xl">
      <div className="w-full rounded-xl bg-surface-container-lowest p-space-md shadow-[0_8px_24px_rgba(23,63,54,0.04)] sm:p-space-lg">
        <div className="flex flex-col justify-between gap-space-md pb-space-md md:flex-row md:items-center">
          <div>
            <span className="mb-space-xs inline-flex items-center gap-space-xs rounded-full bg-amber-surface px-space-sm py-space-xs font-eyebrow text-eyebrow tracking-widest text-secondary uppercase">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-gold" />
              {t('otp_header_stage')}
            </span>
            <h1 className="font-headline-sm text-headline-sm text-text-primary">
              {t('otp_header_title')}
            </h1>
          </div>
          <div className="flex items-center gap-space-xs font-caption text-caption text-text-muted">
            <span
              className="material-symbols-outlined text-[18px] text-pine-deep"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified_user
            </span>
            {t('otp_header_secure')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-space-xl lg:grid-cols-12">
        <div className="flex flex-col gap-space-lg lg:col-span-7">
          <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_8px_24px_rgba(23,63,54,0.06)] sm:p-space-xl">
            <div className="mb-space-md flex items-center justify-between">
              <div className="inline-flex items-center gap-space-xs rounded-full bg-pine-light px-space-sm py-space-xs text-pine-deep">
                <span className="material-symbols-outlined text-[16px]">chat</span>
                <span className="font-caption text-caption font-semibold">
                  {t('otp_badge_whatsapp')}
                </span>
              </div>
              <div className="flex items-center gap-1 font-caption text-caption text-text-muted">
                <span className="material-symbols-outlined text-[16px] text-pine-deep">lock</span>
                {t('otp_badge_encryption')}
              </div>
            </div>

            <h2
              className="mb-space-xs font-headline-sm text-headline-sm text-text-primary"
              id="otp-heading"
            >
              {t('otp_title')}
            </h2>
            <p className="mb-space-xl font-body-md text-body-md text-text-muted">
              {t.rich('otp_sent_to', {
                number: (chunks) => (
                  <span className="inline-flex items-center gap-1 rounded bg-surface-container-high px-1.5 py-0.5 font-semibold text-text-primary">
                    {chunks}
                  </span>
                ),
                principal: (chunks) => (
                  <strong className="font-semibold text-text-primary">{chunks}</strong>
                ),
              })}
            </p>

            <div className="mb-space-lg">
              <label
                className="mb-space-sm block font-label-md text-label-md font-semibold text-text-primary"
                htmlFor="otp-digit-1"
              >
                {t('otp_code_label')}
              </label>
              <fieldset
                aria-labelledby="otp-heading"
                className="m-0 flex items-center justify-between gap-space-xs border-0 p-0 sm:gap-space-sm"
              >
                {digits.map((digit, index) => (
                  <input
                    aria-label={t('otp_code_label')}
                    autoComplete="one-time-code"
                    className={OTP_BOX_CLASSES}
                    id={`otp-digit-${index + 1}`}
                    inputMode="numeric"
                    key={index}
                    maxLength={1}
                    onChange={(event) => {
                      handleChange(index, event.target.value);
                    }}
                    onKeyDown={(event) => {
                      handleKeyDown(index, event);
                    }}
                    onPaste={handlePaste}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    type="text"
                    value={digit}
                  />
                ))}
              </fieldset>
              <div className="mt-space-sm flex items-center justify-between">
                {remaining > 0 ? (
                  <span className="font-caption text-caption text-text-muted">
                    {t('otp_remaining', { count: String(remaining) })}
                  </span>
                ) : (
                  <span />
                )}
                <button
                  className="flex cursor-pointer items-center gap-0.5 rounded font-caption text-caption font-semibold text-pine-deep transition-colors hover:text-pine-hover focus-visible:ring-2 focus-visible:ring-[#173F36] focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={props.isSubmitting}
                  onClick={props.onBack}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  {t('otp_change_number')}
                </button>
              </div>
            </div>

            <div className="mb-space-lg flex flex-col gap-space-sm rounded-lg bg-surface-container-low p-space-md sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-surface text-amber-dark">
                  <span className="material-symbols-outlined text-[18px]">timer</span>
                </div>
                <div>
                  <span className="block font-caption text-caption text-text-muted">
                    {t('otp_resend_limit_label')}
                  </span>
                  <span className="font-label-md text-label-md font-semibold text-text-primary">
                    {secondsLeft > 0
                      ? t('otp_resend_in', { seconds: formatCountdown(secondsLeft) })
                      : t('otp_resend_now')}
                  </span>
                </div>
              </div>
              <button
                className="inline-flex cursor-pointer items-center justify-center gap-space-xs rounded-lg bg-surface-container-high px-space-md py-space-xs font-label-md text-label-md text-text-muted transition-colors hover:text-text-primary focus-visible:ring-2 focus-visible:ring-[#173F36] focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={secondsLeft > 0}
                onClick={resend}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                {t('otp_resend_button')}
              </button>
            </div>

            <div className="flex flex-col gap-space-sm">
              {props.errorKey !== null && (
                <p
                  className="flex items-start gap-1 rounded-lg bg-error-container/40 p-space-sm font-caption text-caption font-medium text-error"
                  role="alert"
                >
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {t(props.errorKey)}
                </p>
              )}
              <button
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-space-sm rounded-xl bg-pine-deep font-label-md text-label-md font-semibold text-on-primary shadow-md transition-all hover:bg-pine-hover focus-visible:ring-2 focus-visible:ring-[#173F36] focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
                disabled={!otpCodeComplete(code) || props.isSubmitting}
                onClick={props.onVerified}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-amber-gold">
                  verified_user
                </span>
                <span>{t('otp_verify')}</span>
              </button>
              <div className="pt-space-xs text-center">
                <span className="font-caption text-caption text-text-muted">
                  {t('otp_not_received')}{' '}
                </span>
                {/* shortcut: alternative delivery channels have no route yet, so the control is honestly disabled */}
                <button
                  className="cursor-not-allowed rounded font-caption text-caption font-semibold text-text-muted"
                  disabled
                  type="button"
                >
                  {t('otp_alt_channel')}
                </button>
              </div>
            </div>

            <div className="mt-space-lg flex items-start gap-space-xs pt-space-md text-text-muted">
              <span className="material-symbols-outlined mt-0.5 shrink-0 text-[16px] text-amber-dark">
                info
              </span>
              <span className="font-caption text-caption leading-relaxed">
                {t('otp_security_note')}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-space-md rounded-xl bg-surface-container-low p-space-md shadow-sm">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[24px] text-pine-deep">
                support_agent
              </span>
              <div>
                <div className="font-label-md text-label-md font-semibold text-text-primary">
                  {t('otp_help_title')}
                </div>
                <div className="font-caption text-caption text-text-muted">
                  {t('otp_help_desc')}
                </div>
              </div>
            </div>
            {/* shortcut: the helpdesk button has no support channel route yet, so it stays inert; wire it to the help deep link once one exists */}
            <button
              className="shrink-0 rounded-lg bg-surface-card px-space-md py-space-xs font-label-md text-label-md font-semibold text-pine-deep transition-colors hover:bg-surface-container-high"
              type="button"
            >
              {t('otp_helpdesk_button')}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-space-lg lg:col-span-5">
          <div className="relative rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_8px_24px_rgba(23,63,54,0.06)]">
            <div className="mb-space-sm flex items-center justify-between pb-space-sm">
              <span className="font-eyebrow text-eyebrow tracking-wider text-text-muted uppercase">
                {t('otp_preview_eyebrow')}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-status-present px-2.5 py-0.5 text-[11px] font-semibold text-pine-deep">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                {t('otp_preview_badge')}
              </span>
            </div>

            <div className="mb-space-md flex items-center gap-space-md pb-space-md">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-pine-deep text-amber-gold shadow-md">
                <span className="material-symbols-outlined text-[32px]">account_balance</span>
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-headline-sm text-headline-sm text-text-primary">
                  {props.school.name}
                </h3>
                <p className="mt-0.5 flex items-center gap-1.5 font-caption text-caption text-text-muted">
                  <span>
                    {t('otp_preview_npsn_label')} <strong>{props.school.npsn}</strong>
                  </span>
                  <span>•</span>
                  <span>{t('otp_preview_region_value')}</span>
                </p>
              </div>
            </div>

            <div className="mb-space-md grid grid-cols-2 gap-space-sm">
              <div className="rounded-lg bg-surface-container-low p-space-sm">
                <span className="block font-caption text-caption text-text-muted">
                  {t('otp_preview_level_label')}
                </span>
                <span className="mt-0.5 flex items-center gap-1 font-label-md text-label-md font-semibold text-text-primary">
                  <span className="material-symbols-outlined text-[16px] text-pine-deep">
                    school
                  </span>
                  {props.school.level}
                </span>
              </div>
              <div className="rounded-lg bg-surface-container-low p-space-sm">
                <span className="block font-caption text-caption text-text-muted">
                  {t('otp_preview_integration_label')}
                </span>
                <span className="mt-0.5 flex items-center gap-1 font-label-md text-label-md font-semibold text-text-primary">
                  <span className="material-symbols-outlined text-[16px] text-pine-deep">sync</span>
                  {t('otp_preview_integration_value')}
                </span>
              </div>
            </div>

            <div className="mb-space-md rounded-xl bg-amber-surface p-space-md">
              <div className="flex items-start gap-space-sm">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-gold/30 text-amber-dark">
                  <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                </div>
                <div>
                  <div className="font-label-md text-label-md font-bold text-amber-dark">
                    {t('otp_package_title')}
                  </div>
                  <div className="mt-0.5 font-caption text-caption leading-relaxed text-amber-dark/90">
                    {t('otp_package_desc')}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-space-xs pt-space-xs font-caption text-caption text-text-muted">
              <div className="flex justify-between py-1">
                <span>{t('otp_package_pic_label')}</span>
                <span className="font-semibold text-text-primary">{props.school.pic}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>{t('otp_package_role_label')}</span>
                <span className="font-semibold text-text-primary">
                  {t('otp_package_role_value')}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>{t('otp_package_email_label')}</span>
                <span className="font-semibold text-text-primary">
                  {t('otp_package_email_value')}
                </span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-pine-deep p-space-md text-on-primary shadow-lg sm:p-space-lg">
            <div className="relative z-10">
              <div className="mb-space-xs flex items-center gap-space-xs font-caption text-caption font-bold text-amber-gold">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                {t('otp_trust_eyebrow')}
              </div>
              <h4 className="mb-space-xs font-label-md text-label-md font-semibold text-on-primary">
                {t('otp_trust_title')}
              </h4>
              <p className="font-caption text-caption leading-relaxed text-on-primary-container">
                {t('otp_trust_desc')}
              </p>
            </div>
            <div className="pointer-events-none absolute -right-4 -bottom-6 h-28 w-28 opacity-10">
              <svg
                className="h-full w-full text-white"
                fill="currentColor"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polygon points="50 0, 100 25, 100 75, 50 100, 0 75, 0 25" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
