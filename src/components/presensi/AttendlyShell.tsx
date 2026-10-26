import { getTranslations } from 'next-intl/server';
import { AttendlyBrand } from '@/components/presensi/AttendlyBrand';
import { AttendlyHeader } from '@/components/presensi/AttendlyHeader';
import { Link } from '@/libs/I18nNavigation';

/**
 * Attendly chrome shared by the portal screens: the fixed portal header, and the legal
 * footer, wrapping whatever screen sits between them.
 *
 * @param props - Screen content and whether a signed-in account is present.
 * @returns Shell with header, main and footer.
 */
export async function AttendlyShell(props: { children: React.ReactNode; signedIn?: boolean }) {
  const t = await getTranslations('PresensiPage');

  return (
    <div className="attendly flex min-h-screen flex-col bg-canvas-base text-body-md text-on-surface antialiased">
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        precedence="default"
        rel="stylesheet"
      />

      <AttendlyHeader signedIn={props.signedIn} />

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
              href="/#faq"
            >
              {t('footer_help')}
            </Link>
            <Link
              className="font-caption text-caption text-on-surface-variant transition-colors hover:text-on-surface"
              href="/#faq"
            >
              {t('footer_privacy')}
            </Link>
            <Link
              className="font-caption text-caption text-on-surface-variant transition-colors hover:text-on-surface"
              href="/#faq"
            >
              {t('footer_terms')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
