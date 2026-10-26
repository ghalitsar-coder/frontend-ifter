import { MaterialIcon } from './MaterialIcon';

const complianceBadges = [
  { icon: 'check_circle', label: 'Siap Dapodik', className: 'bg-status-present' },
  { icon: 'lock', label: 'Enkripsi 256-bit', className: 'bg-status-permission' },
  { icon: 'school', label: '1.400+ Sekolah', className: 'bg-status-sick' },
];

const footerColumns = [
  {
    title: 'Solusi & Fitur',
    links: [
      { label: 'Presensi Murid & QR Kelas', href: '#fitur' },
      { label: 'Presensi Harian Guru & Staf', href: '#fitur' },
      { label: 'Buku Poin & Kedisiplinan Siswa', href: '#fitur' },
      { label: 'Pemberitahuan WhatsApp Orang Tua', href: '#fitur' },
      { label: 'Portal Wali Kelas & Guru BK', href: '#alur-kerja' },
    ],
  },
  {
    title: 'Kepatuhan & Sistem',
    links: [
      { label: 'Panduan Sinkronisasi Dapodik', href: '#integrasi-dapodik' },
      { label: 'Pencocokan NISN & NPSN', href: '#integrasi-dapodik' },
      { label: 'Pelindungan Data Pribadi (UU PDP)', href: '#faq' },
      { label: 'Pusat Panduan Operator Sekolah', href: '#faq' },
      { label: 'Galeri Penerapan Sekolah', href: '#galeri-penerapan' },
    ],
  },
  {
    title: 'Kelembagaan',
    links: [
      { label: 'Pendaftaran Uji Coba Gratis', href: '/pendaftaran' },
      { label: 'Portal Presensi Guru', href: '/presensi' },
      { label: 'Suasana di Sekolah', href: '#galeri-penerapan' },
      { label: 'Tanya Jawab Seputar Layanan', href: '#faq' },
    ],
  },
];

const legalLinks = [
  { label: 'Kebijakan Privasi', href: '#faq' },
  { label: 'Syarat dan Ketentuan', href: '#faq' },
  { label: 'Keamanan Sistem Awan', href: '#faq' },
];

export const LandingFooter = () => (
  <footer className="mt-space-3xl w-full scroll-mt-20 bg-surface-container-low" id="faq">
    <div className="mx-auto max-w-7xl px-margin pt-space-2xl pb-space-xl">
      <div className="mb-space-2xl flex flex-col items-start justify-between gap-space-md rounded-2xl border border-amber-gold/20 bg-amber-surface p-space-lg md:flex-row md:items-center">
        <div className="flex items-center gap-space-md">
          <div className="flex size-12 items-center justify-center rounded-xl bg-secondary-container text-primary">
            <MaterialIcon name="verified_user" className="text-[26px]" />
          </div>
          <div>
            <p className="font-headline-sm text-headline-sm text-primary">
              Tersinkronisasi Resmi &amp; Terenkripsi ISO 27001
            </p>
            <p className="font-body-md text-body-md text-amber-dark">
              Format data kehadiran, ketidakhadiran, dan buku catatan poin disiplin kompatibel penuh
              dengan skema ekspor Kemendikbudristek Dapodik.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          {complianceBadges.map((badge) => (
            <span
              className={`inline-flex items-center gap-space-xs rounded-full px-space-sm py-space-xs font-caption text-caption text-text-primary ${badge.className}`}
              key={badge.label}
            >
              <MaterialIcon name={badge.icon} className="text-[14px]" />
              {badge.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-gutter pb-space-2xl md:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-space-md pr-space-lg lg:col-span-2">
          <div className="flex items-center gap-space-sm">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary">
              <MaterialIcon name="verified" className="text-[20px] text-amber-gold" />
            </div>
            <span className="font-headline-sm text-headline-sm text-primary">Attendly</span>
          </div>
          <p className="font-body-md text-body-md leading-relaxed text-text-muted">
            Platform modern operasional presensi, pemantauan ketertiban siswa secara langsung, dan
            otomasi pembinaan disiplin sekolah terintegrasi di Indonesia.
          </p>
          <div className="flex items-center gap-space-sm pt-space-xs text-text-muted">
            <MaterialIcon name="verified_user" className="text-[18px]" />
            <span className="font-caption text-caption">
              Sistem Keamanan Data Siswa Terdistribusi Nasional
            </span>
          </div>
        </div>

        {footerColumns.map((column) => (
          <div className="flex flex-col gap-space-sm" key={column.title}>
            <h3 className="mb-space-xs font-eyebrow text-eyebrow tracking-wider text-primary uppercase">
              {column.title}
            </h3>
            {column.links.map((link) => (
              <a
                className="font-label-md text-label-md text-on-surface-variant transition-colors hover:text-on-surface"
                href={link.href}
                key={link.label}
              >
                {link.label}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-between gap-space-md pt-space-lg font-caption text-caption text-on-surface-variant md:flex-row">
        <p>
          © 2025 PT Attendly Edukasi Digital. Hak Cipta Dilindungi Undang-Undang. Mendukung
          standardisasi data sekolah di seluruh Indonesia.
        </p>
        <div className="flex items-center gap-space-lg">
          {legalLinks.map((link) => (
            <a
              className="transition-colors hover:text-on-surface"
              href={link.href}
              key={link.label}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);
