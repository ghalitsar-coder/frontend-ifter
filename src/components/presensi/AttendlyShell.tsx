import { getTranslations } from 'next-intl/server';
import { AttendlyBrand } from '@/components/presensi/AttendlyBrand';
import { Link } from '@/libs/I18nNavigation';

/**
 * Attendly chrome shared by the portal screens: fixed header with the wordmark and the legal
 * footer, wrapping whatever screen sits between them.
 *
 * @param props - Screen content.
 * @returns Shell with header, main and footer.
 */
export async function AttendlyShell(props: { children: React.ReactNode }) {
  const t = await getTranslations('PresensiPage');

  return (
    <div className="attendly flex min-h-dvh flex-col bg-canvas-base text-body-md text-on-surface antialiased">
      {/* oxlint-disable-next-line next/no-page-custom-font -- the Stitch screens own this font, the dashboard shell does not load it */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        precedence="default"
        rel="stylesheet"
      />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-border-subtle bg-surface/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-margin">
          <div className="flex items-center gap-8">
            <AttendlyBrand />
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                className="font-label-md text-label-md text-on-surface-variant transition-colors duration-150 hover:text-on-surface"
                href="/dashboard"
              >
                {t('nav_dashboard')}
              </Link>
              <Link
                className="font-label-md text-label-md text-on-surface-variant transition-colors duration-150 hover:text-on-surface"
                href="/presensi"
              >
                {t('nav_classes')}
              </Link>
              <Link
                className="font-label-md text-label-md text-on-surface-variant transition-colors duration-150 hover:text-on-surface"
                href="/dashboard/presensi"
              >
                {t('nav_recap')}
              </Link>
              <Link
                className="font-label-md text-label-md text-on-surface-variant transition-colors duration-150 hover:text-on-surface"
                href="/pendaftaran"
              >
                {t('nav_register')}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="w-full flex-1 bg-canvas-base pt-16">{props.children}</main>

      <footer className="w-full bg-surface-container-low py-space-xl">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-space-md px-margin md:flex-row">
          <div className="flex items-center gap-3">
            <AttendlyBrand compact />
            <span className="font-caption text-caption text-text-muted">
              {t('footer_copyright')}
            </span>
          </div>
          <div className="flex items-center gap-6">
            {/* shortcut: placeholder legal/help targets until dedicated pages exist, then point each to its own route */}
            <Link
              className="font-caption text-caption text-on-surface-variant transition-colors hover:text-on-surface"
              href="/"
            >
              {t('footer_help')}
            </Link>
            <Link
              className="font-caption text-caption text-on-surface-variant transition-colors hover:text-on-surface"
              href="/"
            >
              {t('footer_privacy')}
            </Link>
            <Link
              className="font-caption text-caption text-on-surface-variant transition-colors hover:text-on-surface"
              href="/"
            >
              {t('footer_terms')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
