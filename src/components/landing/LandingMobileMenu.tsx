'use client';

import { useState } from 'react';
import { Link } from '@/libs/I18nNavigation';
import { MaterialIcon } from './MaterialIcon';

type LandingMenuItem = { href: string; label: string };

/**
 * Hamburger disclosure for viewports below `xl`, where the desktop nav is hidden.
 * @param props - Menu items mirrored from the desktop navigation.
 * @returns The toggle button and, when open, a full-width sheet under the header.
 */
export const LandingMobileMenu = (props: { items: LandingMenuItem[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center xl:hidden">
      <button
        aria-controls="landing-mobile-nav"
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
          className="absolute inset-x-0 top-20 border-b border-border-subtle bg-surface/95 px-margin pt-space-md pb-space-xl shadow-xl backdrop-blur-xl"
          id="landing-mobile-nav"
        >
          <ul className="flex flex-col gap-space-xs">
            {props.items.map((item) => (
              <li key={item.href}>
                <a
                  className="flex min-h-11 items-center rounded-xl px-space-sm font-label-md text-label-md text-on-surface transition-colors hover:bg-pine-light hover:text-primary"
                  href={item.href}
                  onClick={() => {
                    setIsOpen(false);
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                className="flex min-h-11 items-center rounded-xl px-space-sm font-label-md text-label-md text-primary transition-colors hover:bg-pine-light"
                href="/login"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                Masuk Portal Presensi
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </div>
  );
};
