'use client';

import { useState } from 'react';
import { MaterialIcon } from '@/components/landing/MaterialIcon';
import { Link } from '@/libs/I18nNavigation';

const NAV_ITEMS = [
  { href: '/#beranda', label: 'Beranda' },
  { href: '/#fitur', label: 'Fitur' },
  { href: '/#alur-kerja', label: 'Alur' },
  { href: '/#galeri-penerapan', label: 'Penerapan' },
  { href: '/#integrasi-dapodik', label: 'Dapodik' },
  { href: '/#faq', label: 'FAQ' },
] as const;

const NAV_LINK_CLASSES =
  'px-space-sm py-space-xs font-label-md text-label-md whitespace-nowrap text-on-surface-variant transition-colors hover:text-on-surface';

/**
 * The one header for every public Attendly surface: homepage, /login and /pendaftaran. Brand,
 * primary navigation and the two route CTAs render from a single source, and no label ever wraps.
 *
 * @returns Fixed header with desktop nav and the mobile disclosure.
 */
export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full bg-surface/90 shadow-[0_1px_8px_rgba(23,63,54,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-gutter px-margin">
        <Link
          className="flex items-center gap-space-sm whitespace-nowrap"
          href="/"
          onClick={() => {
            setIsOpen(false);
          }}
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary">
            <MaterialIcon name="verified" className="text-[22px] text-amber-gold" />
          </span>
          <span className="flex flex-col">
            <span className="font-headline-sm text-headline-sm leading-none tracking-tight text-primary">
              Attendly
            </span>
            <span className="font-caption text-caption text-text-muted">
              Presensi &amp; Disiplin Sekolah
            </span>
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-space-md xl:flex">
          {NAV_ITEMS.map((item) => (
            <Link className={NAV_LINK_CLASSES} href={item.href} key={item.label}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-space-sm">
          <Link
            className="hidden h-11 items-center justify-center rounded-xl bg-surface px-space-md font-label-md text-label-md whitespace-nowrap text-primary transition-all hover:bg-pine-light hover:text-primary md:inline-flex"
            href="/login"
          >
            Masuk Portal Presensi
          </Link>
          <Link
            className="hidden h-11 items-center justify-center rounded-xl bg-secondary-container px-space-lg font-label-md text-label-md font-semibold whitespace-nowrap text-primary shadow-[0_4px_16px_rgba(242,201,108,0.25)] transition-all hover:bg-amber-hover hover:text-primary sm:inline-flex"
            href="/pendaftaran"
          >
            Daftar Sekolah
          </Link>

          <div className="flex items-center xl:hidden">
            <button
              aria-controls="site-mobile-nav"
              aria-expanded={isOpen}
              className="inline-flex size-11 items-center justify-center rounded-xl text-primary transition-colors hover:bg-pine-light"
              onClick={() => {
                setIsOpen(!isOpen);
              }}
              type="button"
            >
              <MaterialIcon name={isOpen ? 'close' : 'menu'} className="text-[24px]" />
              <span className="sr-only">{isOpen ? 'Tutup menu' : 'Buka menu navigasi'}</span>
            </button>

            {isOpen ? (
              <nav
                aria-label="Navigasi utama"
                className="absolute inset-x-0 top-20 border-b border-border-subtle bg-surface/95 px-margin pt-space-md pb-space-xl shadow-xl backdrop-blur-xl"
                id="site-mobile-nav"
              >
                <ul className="flex flex-col gap-space-xs">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.href}>
                      <Link
                        className="flex min-h-11 items-center rounded-xl px-space-sm font-label-md text-label-md whitespace-nowrap text-on-surface transition-colors hover:bg-pine-light hover:text-primary"
                        href={item.href}
                        onClick={() => {
                          setIsOpen(false);
                        }}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li className="mt-space-xs border-t border-border-subtle pt-space-xs">
                    <Link
                      className="flex min-h-11 items-center rounded-xl px-space-sm font-label-md text-label-md font-semibold whitespace-nowrap text-primary transition-colors hover:bg-pine-light"
                      href="/login"
                      onClick={() => {
                        setIsOpen(false);
                      }}
                    >
                      Masuk Portal Presensi
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="flex min-h-11 items-center rounded-xl px-space-sm font-label-md text-label-md font-semibold whitespace-nowrap text-primary transition-colors hover:bg-pine-light"
                      href="/pendaftaran"
                      onClick={() => {
                        setIsOpen(false);
                      }}
                    >
                      Daftar Sekolah
                    </Link>
                  </li>
                </ul>
              </nav>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
