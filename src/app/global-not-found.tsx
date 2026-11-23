import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { AttendlyBrand } from '@/components/presensi/AttendlyBrand';
import { AppConfig } from '@/utils/AppConfig';
import '@/styles/global.css';

// shortcut: global-not-found bypasses the [locale] layout, so this page renders in the default
// locale only; upgrade to a localized 404 if search traffic to bad URLs becomes material.
const locale = AppConfig.i18n.defaultLocale;

/**
 * Generate metadata for the global not-found page.
 *
 * @returns Metadata object.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'NotFoundPage' });
  return { title: t('title'), robots: { index: false } };
}

/**
 * Branded 404 served at the routing level for every unmatched URL: the [locale] layout owns the
 * <html> tag, so this page must be self-contained (styles, fonts and its own header chrome).
 *
 * @returns Standalone not-found document.
 */
export default async function GlobalNotFound() {
  const t = await getTranslations({ locale, namespace: 'NotFoundPage' });

  const quickLinks = [
    { href: '/dashboard/presensi', icon: 'fact_check', label: t('quick_presensi') },
    { href: '/dashboard/kedisiplinan', icon: 'gavel', label: t('quick_kedisiplinan') },
    { href: '/pendaftaran', icon: 'account_balance', label: t('quick_pendaftaran') },
  ] as const;

  return (
    <html lang={locale}>
      {/* shortcut: next/font does not run in global-not-found, so load Inter for this standalone document */}
      <head>
        {/* oxlint-disable-next-line next/no-page-custom-font -- next/font does not run in global-not-found, so load Inter for this standalone document */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="attendly min-h-screen bg-canvas-base text-body-md text-on-surface antialiased"
        style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
      >
        <header className="flex h-16 items-center justify-between border-b border-surface-container-high bg-surface px-margin">
          <AttendlyBrand />
          <Link
            className="flex cursor-pointer items-center rounded-full bg-secondary-container px-space-md py-1.5 font-label-md text-label-md font-semibold text-primary transition-colors hover:bg-amber-gold focus-visible:ring-2 focus-visible:ring-amber-gold focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98]"
            href="/sign-in"
          >
            {t('login_cta')}
          </Link>
        </header>

        <main className="mx-auto flex w-full max-w-2xl flex-col items-center px-margin py-space-3xl text-center">
          <span className="rounded-2xl bg-gradient-to-br from-pine-deep to-pine-hover px-space-xl py-space-md font-headline-xl text-headline-xl font-extrabold tracking-tight text-amber-gold shadow-lg">
            {t('code')}
          </span>
          <h1 className="mt-space-lg font-headline-lg text-headline-lg tracking-tight text-text-primary">
            {t('title')}
          </h1>
          <p className="mt-space-sm max-w-md font-body-md text-body-md text-text-muted">
            {t('description')}
          </p>

          <div className="mt-space-2xl flex w-full flex-col items-center justify-center gap-space-sm sm:w-auto sm:flex-row">
            <Link
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-space-xs rounded-xl bg-pine-deep px-space-xl font-label-md text-label-md font-semibold text-white shadow-sm transition-all hover:bg-pine-hover focus-visible:ring-2 focus-visible:ring-pine-deep focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] sm:w-auto"
              href="/"
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
              {t('home_cta')}
            </Link>
          </div>

          <div className="mt-space-2xl w-full border-t border-surface-container-high pt-space-lg">
            <p className="mb-space-sm font-eyebrow text-eyebrow tracking-wider text-text-muted uppercase">
              {t('quick_heading')}
            </p>
            <div className="flex flex-col items-center justify-center gap-space-sm sm:flex-row sm:gap-space-xl">
              {quickLinks.map((link) => (
                <a
                  className="flex cursor-pointer items-center gap-space-xs rounded-lg px-space-sm py-1.5 font-label-md text-label-md text-pine-deep transition-colors hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-pine-deep/40 focus-visible:outline-none active:scale-[0.98]"
                  href={link.href}
                  key={link.href}
                >
                  <span className="material-symbols-outlined text-[18px] text-amber-dark">
                    {link.icon}
                  </span>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
