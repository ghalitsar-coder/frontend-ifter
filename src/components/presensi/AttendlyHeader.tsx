import { getTranslations } from 'next-intl/server';
import { AttendlyBrand } from '@/components/presensi/AttendlyBrand';
import { AttendlyMobileNav } from '@/components/presensi/AttendlyMobileNav';
import { PresensiSignOut } from '@/components/presensi/PresensiSignOut';
import { Link } from '@/libs/I18nNavigation';

const navLinkClassName =
  'rounded-md font-label-md text-label-md text-on-surface-variant transition-colors duration-150 hover:text-on-surface active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-pine-deep/40 focus-visible:outline-none';

/**
 * Portal header shared by the landing page and every Attendly screen: wordmark, top-level
 * navigation and either the sign-out cluster or the signed-out "Masuk" call to action.
 *
 * @param props - Whether a signed-in account is present.
 * @returns Fixed header bar.
 */
export async function AttendlyHeader(props: { signedIn?: boolean }) {
  const t = await getTranslations('PresensiPage');

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border-subtle bg-surface/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-margin">
        <div className="flex items-center gap-8">
          <Link
            aria-label={t('brand_home_aria')}
            className="rounded-lg transition-transform focus-visible:ring-2 focus-visible:ring-pine-deep/40 focus-visible:outline-none active:scale-[0.98]"
            href="/"
          >
            <AttendlyBrand />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link className={navLinkClassName} href="/dashboard">
              {t('nav_dashboard')}
            </Link>
            <Link className={navLinkClassName} href="/dashboard/presensi">
              {t('nav_classes')}
            </Link>
            <Link className={navLinkClassName} href="/dashboard/segera?item=Rekap%20Kehadiran">
              {t('nav_recap')}
            </Link>
            <Link className={navLinkClassName} href="/pendaftaran">
              {t('nav_register')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-4 md:flex">
            {props.signedIn ? (
              <>
                <div className="hidden flex-col items-end text-right lg:flex">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    {t('teacher_name')}
                  </span>
                  <span className="font-caption text-caption text-text-muted">
                    {t('teacher_role')}
                  </span>
                </div>
                <div className="relative flex size-10 items-center justify-center rounded-full border border-border-subtle bg-surface-container font-label-md text-label-md font-semibold text-on-surface">
                  <span className="text-[14px]">SW</span>
                  <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-surface bg-emerald-500" />
                </div>
                <PresensiSignOut />
              </>
            ) : (
              <Link
                className="inline-flex h-10 items-center justify-center rounded-xl bg-secondary-container px-space-md font-label-md text-label-md font-semibold text-primary shadow-[0_4px_16px_rgba(242,201,108,0.25)] transition-all hover:bg-amber-hover focus-visible:ring-2 focus-visible:ring-pine-deep/40 focus-visible:outline-none active:scale-[0.98]"
                href="/sign-in"
              >
                {t('nav_login')}
              </Link>
            )}
          </div>
          <AttendlyMobileNav signedIn={props.signedIn} />
        </div>
      </div>
    </header>
  );
}
