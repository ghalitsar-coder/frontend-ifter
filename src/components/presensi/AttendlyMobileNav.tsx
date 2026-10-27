'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { PresensiSignOut } from '@/components/presensi/PresensiSignOut';
import { Link } from '@/libs/I18nNavigation';

const NAV_ITEMS = [
  { href: '/dashboard', labelKey: 'nav_dashboard' },
  { href: '/dashboard/presensi', labelKey: 'nav_classes' },
  { href: '/dashboard/segera?item=Rekap%20Kehadiran', labelKey: 'nav_recap' },
  { href: '/pendaftaran', labelKey: 'nav_register' },
] as const;

/**
 * Hamburger and drop-down panel that carries the portal navigation below the md breakpoint,
 * where the inline nav of AttendlyHeader is hidden.
 *
 * @param props - Whether a signed-in account is present.
 * @returns Icon toggle plus full-width panel of the nav links and the account cluster.
 */
export function AttendlyMobileNav(props: { signedIn?: boolean }) {
  const t = useTranslations('PresensiPage');
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
  };

  return (
    <div className="md:hidden">
      <button
        aria-expanded={open}
        aria-label={open ? t('nav_mobile_close') : t('nav_mobile_open')}
        className="flex size-11 cursor-pointer items-center justify-center rounded-xl text-on-surface transition-colors hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-pine-deep/40 focus-visible:outline-none active:scale-[0.96]"
        onClick={() => {
          setOpen(!open);
        }}
        type="button"
      >
        <span className="material-symbols-outlined text-[24px]">{open ? 'close' : 'menu'}</span>
      </button>

      {open ? (
        <nav className="fixed inset-x-0 top-16 z-50 flex flex-col border-b border-border-subtle bg-surface px-margin py-2 shadow-lg">
          {NAV_ITEMS.map((item) => (
            <Link
              className="rounded-lg px-2 py-3 font-label-md text-label-md text-on-surface-variant transition-colors hover:text-on-surface focus-visible:ring-2 focus-visible:ring-pine-deep/40 focus-visible:outline-none active:scale-[0.99] active:bg-surface-container"
              href={item.href}
              key={item.labelKey}
              onClick={close}
            >
              {t(item.labelKey)}
            </Link>
          ))}
          {props.signedIn ? (
            <div className="mt-1 flex items-center justify-between border-t border-border-subtle px-2 py-3">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  {t('teacher_name')}
                </span>
                <span className="font-caption text-caption text-text-muted">
                  {t('teacher_role')}
                </span>
              </div>
              <PresensiSignOut />
            </div>
          ) : (
            <Link
              className="mt-1 mb-2 inline-flex h-11 items-center justify-center rounded-xl bg-secondary-container px-space-md font-label-md text-label-md font-semibold text-primary focus-visible:ring-2 focus-visible:ring-pine-deep/40 focus-visible:outline-none active:scale-[0.98]"
              href="/sign-in"
              onClick={close}
            >
              {t('nav_login')}
            </Link>
          )}
        </nav>
      ) : null}
    </div>
  );
}
