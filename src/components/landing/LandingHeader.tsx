import { MaterialIcon } from './MaterialIcon';

const navItems = [
  { href: '#beranda', label: 'Beranda', active: true },
  { href: '#fitur', label: 'Fitur Utama' },
  { href: '#alur-kerja', label: 'Alur Penggunaan' },
  { href: '#galeri-penerapan', label: 'Penerapan Lapangan' },
  { href: '#integrasi-dapodik', label: 'Integrasi Dapodik' },
  { href: '#faq', label: 'Tanya Jawab' },
];

export const LandingHeader = () => (
  <header className="fixed top-0 z-50 w-full bg-surface/90 shadow-[0_1px_8px_rgba(23,63,54,0.06)] backdrop-blur-xl">
    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-gutter px-margin">
      <div className="flex items-center gap-space-lg">
        <a className="flex items-center gap-space-sm" href="#beranda">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary">
            <MaterialIcon name="verified" className="text-[22px] text-amber-gold" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm leading-none tracking-tight text-primary">
              Attendly
            </span>
            <span className="font-caption text-caption text-text-muted">
              Presensi &amp; Disiplin Sekolah
            </span>
          </div>
        </a>
      </div>

      <nav className="hidden items-center gap-space-md xl:flex">
        {navItems.map((item) => (
          <a
            aria-current={item.active ? 'page' : undefined}
            className={
              item.active
                ? 'px-space-sm py-space-xs font-bold text-primary transition-colors'
                : 'px-space-sm py-space-xs font-label-md text-label-md text-on-surface-variant transition-colors hover:text-on-surface'
            }
            href={item.href}
            key={item.label}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-space-sm">
        <a
          className="hidden h-11 items-center justify-center rounded-xl bg-surface px-space-md font-label-md text-label-md text-primary transition-all hover:bg-pine-light hover:text-primary md:inline-flex"
          href="#beranda"
        >
          Masuk Portal Presensi
        </a>
        <a
          className="inline-flex h-11 items-center justify-center rounded-xl bg-secondary-container px-space-lg font-label-md text-label-md font-semibold text-primary shadow-[0_4px_16px_rgba(242,201,108,0.25)] transition-all hover:bg-amber-hover hover:text-primary"
          href="#daftar"
        >
          Daftar Sekolah
        </a>
        <div className="ml-space-xs flex size-8 items-center justify-center rounded-full bg-primary">
          <MaterialIcon name="person" className="text-[18px] text-on-primary" />
        </div>
      </div>
    </div>
  </header>
);
