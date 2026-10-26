'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { LOGIN_ROLE_FIELDS } from '@/components/presensi/presensiLoginRoles';
import type { PresensiLoginRole } from '@/components/presensi/presensiLoginRoles';
import { presensiErrorKey } from '@/components/presensi/presensiErrors';
import type { PresensiErrorKey } from '@/components/presensi/presensiErrors';
import { AUTH_QUERY_KEY, signIn } from '@/services/presensiApi';
import { Link, useRouter } from '@/libs/I18nNavigation';

const TAB_CLASSES = {
  active:
    'flex flex-1 items-center justify-center gap-space-xs rounded-lg bg-surface-card px-space-md py-2.5 font-label-md text-label-md font-semibold text-pine-deep shadow-sm transition-all duration-200',
  idle: 'flex flex-1 items-center justify-center gap-space-xs rounded-lg px-space-md py-2.5 font-label-md text-label-md font-medium text-text-muted transition-all duration-200 hover:text-text-primary',
} as const;

/**
 * Scandinavian credential form of the login screen: the role switcher decides which identity the
 * single backend `username` carries, and the submit button reports the pending and accepted phases.
 *
 * @param props - Opens the RFID tap dialog.
 * @returns Form column with alternative sign-in options and the compliance footer.
 */
export function PresensiLoginForm(props: { onRfidTap: () => void }) {
  const t = useTranslations('PresensiPage');
  const queryClient = useQueryClient();
  const router = useRouter();
  const [role, setRole] = useState<PresensiLoginRole>('teacher');
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [pending, setPending] = useState(false);
  const [errorKey, setErrorKey] = useState<PresensiErrorKey | null>(null);
  const field = LOGIN_ROLE_FIELDS[role];

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrorKey(null);

    try {
      await signIn({ password, username: credential });
      setAccepted(true);
      // Seed the gate cache so /presensi mounts the workspace without a refetch round trip.
      queryClient.setQueryData(AUTH_QUERY_KEY, true);
      router.replace('/presensi');
    } catch (error) {
      setErrorKey(presensiErrorKey(error));
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col justify-between rounded-xl bg-surface-card p-space-lg shadow-sm sm:p-space-2xl lg:col-span-7">
      <div>
        <div className="mb-space-lg flex items-center justify-between">
          <div>
            <span className="font-eyebrow text-eyebrow tracking-wider text-amber-dark uppercase">
              {t('login_form_eyebrow')}
            </span>
            <h1 className="mt-0.5 font-headline-lg text-headline-lg tracking-tight text-text-primary">
              {t('login_title')}
            </h1>
          </div>
          <span className="hidden items-center gap-space-xs rounded-full bg-pine-light px-space-sm py-1 font-label-md text-label-md text-pine-deep sm:flex">
            <span className="size-2 rounded-full bg-pine-deep" />
            {t('login_online_server')}
          </span>
        </div>

        <div
          aria-label={t('login_role_group')}
          className="mb-space-lg flex items-center gap-1 rounded-xl bg-surface-container p-1"
          role="tablist"
        >
          {(['teacher', 'admin'] as const).map((tab) => (
            <button
              aria-controls="login-form"
              aria-selected={role === tab}
              className={role === tab ? TAB_CLASSES.active : TAB_CLASSES.idle}
              key={tab}
              onClick={() => {
                setRole(tab);
              }}
              role="tab"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                {tab === 'teacher' ? 'school' : 'shield'}
              </span>
              <span>{t(tab === 'teacher' ? 'login_role_teacher' : 'login_role_admin')}</span>
            </button>
          ))}
        </div>

        <form className="space-y-space-md" id="login-form" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-1.5 block font-label-md text-label-md font-medium text-text-primary"
              htmlFor="username"
            >
              {t(field.labelKey)}
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined pointer-events-none absolute left-space-md text-[20px] text-text-muted">
                {field.icon}
              </span>
              <input
                aria-label={t(field.labelKey)}
                autoComplete="username"
                className="h-11 w-full rounded-xl bg-canvas-base pr-space-md pl-11 font-body-md text-body-md text-text-primary placeholder:text-text-muted transition-all duration-150 focus:bg-white focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
                id="username"
                name="username"
                onChange={(event) => {
                  setCredential(event.target.value);
                }}
                placeholder={t(field.placeholderKey)}
                required
                type={field.type}
                value={credential}
              />
            </div>
            <p className="mt-1 font-caption text-caption text-text-muted">{t(field.helpKey)}</p>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                className="block font-label-md text-label-md font-medium text-text-primary"
                htmlFor="password"
              >
                {t('login_password_label')}
              </label>
              {/* shortcut: reset-password has no route yet, so the link only points at itself */}
              <a
                className="font-caption text-caption rounded font-medium text-pine-deep underline-offset-2 hover:text-pine-hover hover:underline focus-visible:ring-2 focus-visible:ring-pine-deep focus-visible:ring-offset-2 focus:outline-none"
                href="#"
              >
                {t('login_forgot_password')}
              </a>
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined pointer-events-none absolute left-space-md text-[20px] text-text-muted">
                lock
              </span>
              <input
                aria-label={t('login_password_label')}
                autoComplete="current-password"
                className="h-11 w-full rounded-xl bg-canvas-base pr-11 pl-11 font-body-md text-body-md text-text-primary placeholder:text-text-muted transition-all duration-150 focus:bg-white focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
                id="password"
                name="password"
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
                placeholder={t('login_password_placeholder')}
                required
                type={visible ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={t(visible ? 'login_password_hide' : 'login_password_show')}
                aria-pressed={visible}
                className="absolute right-space-sm rounded-lg p-1.5 text-text-muted transition-colors hover:text-text-primary"
                onClick={() => {
                  setVisible(!visible);
                }}
                title={t('login_password_toggle')}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {visible ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex cursor-pointer items-center gap-space-xs select-none">
              <input
                className="size-5 cursor-pointer rounded accent-pine-deep"
                defaultChecked
                name="remember"
                type="checkbox"
              />
              <span className="font-label-md text-label-md text-text-primary">
                {t('login_remember')}
              </span>
            </label>
            <span className="hidden font-caption text-caption text-text-muted sm:inline">
              {t('login_remember_ttl')}
            </span>
          </div>

          {errorKey !== null && (
            <p className="flex items-center gap-2 font-caption text-caption font-semibold text-error" role="alert">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              <span>{t(errorKey)}</span>
            </p>
          )}

          <button
            className="group flex h-11 w-full items-center justify-center gap-space-xs rounded-xl bg-pine-deep font-label-md text-label-md font-semibold tracking-wide text-white shadow-sm transition-all duration-200 hover:bg-pine-hover hover:shadow-md focus-visible:ring-2 focus-visible:ring-pine-deep focus-visible:ring-offset-2 focus:outline-none disabled:pointer-events-none disabled:opacity-60"
            disabled={pending}
            type="submit"
          >
            {pending || accepted ? (
              <>
                <span
                  className={`material-symbols-outlined text-[18px] ${
                    accepted ? 'text-amber-gold' : 'animate-spin'
                  }`}
                >
                  {accepted ? 'check_circle' : 'progress_activity'}
                </span>
                <span>{t(accepted ? 'login_accepted' : 'login_pending')}</span>
              </>
            ) : (
              <>
                <span>{t(field.submitKey)}</span>
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>

        <div className="relative my-space-lg flex items-center justify-center">
          <div className="h-[1px] w-full bg-surface-container-high" />
          <span className="absolute bg-surface-card px-space-md font-caption text-caption tracking-wider text-text-muted uppercase">
            {t('login_divider')}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
          <button
            className="group flex w-full items-center justify-center gap-space-xs rounded-xl bg-surface-container-low px-space-md py-2.5 text-left transition-colors hover:bg-surface-container disabled:pointer-events-none disabled:opacity-60"
            disabled
            type="button"
          >
            <svg aria-hidden="true" className="size-5 shrink-0" viewBox="0 0 24 24">
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
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-label-md text-label-md font-medium text-text-primary">
                {t('login_google_title')}
              </span>
              <span className="truncate font-caption text-caption text-text-muted">
                {t('login_google_sub')}
              </span>
            </span>
          </button>

          <button
            className="flex w-full items-center justify-between rounded-xl bg-amber-surface px-space-md py-2.5 text-left transition-colors hover:bg-secondary-fixed/30"
            onClick={props.onRfidTap}
            type="button"
          >
            <span className="flex min-w-0 items-center gap-space-xs">
              <span className="material-symbols-outlined text-[22px] text-amber-dark">
                contactless
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-label-md text-label-md font-semibold text-amber-dark">
                  {t('login_rfid_title')}
                </span>
                <span className="truncate font-caption text-caption text-text-muted">
                  {t('login_rfid_sub')}
                </span>
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-amber-gold px-1.5 py-0.5 font-caption text-[11px] font-bold text-pine-deep">
              {t('login_rfid_badge')}
            </span>
          </button>
        </div>
      </div>

      <div className="mt-space-md flex flex-col items-center justify-between gap-space-sm rounded-xl bg-surface-container-low p-space-md pt-space-lg sm:flex-row">
        <span className="flex items-center gap-space-xs font-caption text-caption text-text-muted">
          <span className="material-symbols-outlined text-[16px] text-pine-deep">lock</span>
          {t('login_secure_note')}
        </span>
        <span className="font-label-md text-label-md">
          <span className="text-text-muted">{t('login_no_account')}</span>
          <Link className="ml-1 font-semibold text-pine-deep hover:underline" href="/pendaftaran">
            {t('login_register_cta')}
          </Link>
        </span>
      </div>
    </div>
  );
}
