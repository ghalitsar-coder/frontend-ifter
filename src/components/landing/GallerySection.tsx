import Image from 'next/image';
import { MaterialIcon } from './MaterialIcon';

const highlights = [
  'Analisis tingkat kehadiran rombel per bulan secara komparatif',
  'Deteksi dini siswa dengan indikasi penurunan kehadiran',
  'Rekapitulasi berkas akreditasi sekolah siap cetak satu klik',
];

const pillars = [
  {
    icon: 'verified_user',
    iconClassName: 'bg-pine-light text-primary',
    title: 'Kepastian Bagi Orang Tua',
    description:
      'Rasa cemas orang tua sirna berkat notifikasi pesan kedatangan tepat waktu di saat jam sibuk pagi hari.',
    footerIcon: 'hub',
    footer: 'Kemitraan Sekolah & Keluarga',
    footerClassName: 'text-primary',
  },
  {
    icon: 'psychology',
    iconClassName: 'bg-secondary-container text-amber-dark',
    title: 'Guru Fokus Mengajar',
    description:
      'Pendidik tidak lagi terbebani rekapitulasi manual di kertas absen dan dapat memaksimalkan jam belajar mengajar di kelas.',
    footerIcon: 'auto_stories',
    footer: 'Pembelajaran Efektif',
    footerClassName: 'text-amber-dark',
  },
  {
    icon: 'fact_check',
    iconClassName: 'bg-tertiary-fixed text-primary',
    title: 'Tertib Administrasi Dinas',
    description:
      'Seluruh rekaman data presensi dan sanksi tersinkron rapi sesuai format standar Kemendikbudristek tanpa ada data terlewat.',
    footerIcon: 'task_alt',
    footer: 'Laporan Siap Sidang',
    footerClassName: 'text-primary',
  },
];

export const GallerySection = () => (
  <section className="w-full scroll-mt-20 bg-surface px-margin py-space-3xl" id="galeri-penerapan">
    <div className="mx-auto max-w-7xl">
      <div className="mx-auto mb-space-2xl max-w-2xl text-center">
        <div className="mb-space-sm inline-flex items-center gap-space-xs rounded-full bg-pine-light px-space-md py-1 text-primary">
          <MaterialIcon name="verified" className="text-[16px] text-amber-gold" />
          <span className="font-eyebrow text-eyebrow tracking-widest text-primary uppercase">
            KOLABORASI PENDIDIK &amp; KELUARGA
          </span>
        </div>
        <h2 className="mt-1 font-headline-xl text-headline-xl tracking-tight text-text-primary">
          Keunggulan Implementasi Lapangan Nyata
        </h2>
        <p className="mt-2 font-body-md text-body-md text-text-muted">
          Menghadirkan kenyamanan bagi pendidik, transparansi bagi orang tua, dan kedisiplinan yang
          menyenangkan bagi siswa di seluruh penjuru tanah air.
        </p>
      </div>

      <div className="mb-space-2xl grid grid-cols-1 items-center overflow-hidden rounded-3xl border border-border-subtle bg-surface-card shadow-md lg:grid-cols-12">
        <div className="relative h-80 overflow-hidden sm:h-96 lg:col-span-7 lg:h-[420px]">
          <Image
            alt="Kepala sekolah dan para dewan guru berdiskusi hangat di ruang guru melihat dasbor analitik laptop"
            className="object-cover object-center"
            fill
            sizes="(min-width: 1024px) 708px, 100vw"
            src="/assets/images/landing/gallery-teacher-meeting.jpg"
          />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-transparent via-transparent to-surface-card/20 lg:block lg:to-surface-card" />
        </div>
        <div className="flex flex-col justify-center p-space-xl text-left lg:col-span-5 lg:p-space-2xl">
          <span className="mb-space-xs font-caption text-caption font-bold tracking-wider text-amber-dark uppercase">
            Ruang Rapat &amp; Evaluasi Berkala
          </span>
          <h3 className="mb-space-sm font-headline-sm text-headline-sm font-bold text-primary md:font-headline-lg md:text-headline-lg">
            Rapat Evaluasi Guru Jadi Singkat dan Penuh Bukti Nyata
          </h3>
          <p className="mb-space-lg font-body-md text-body-md leading-relaxed text-text-muted">
            Kepala sekolah bersama dewan guru dapat langsung meninjau grafik ketertiban antarkelas
            tanpa membuang waktu mengumpulkan tumpukan kertas presensi. Keputusan bimbingan
            konseling diambil lebih dini dan tepat sasaran.
          </p>
          <div className="space-y-space-sm">
            {highlights.map((item) => (
              <div className="flex items-center gap-space-sm text-text-primary" key={item}>
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-pine-light text-primary">
                  <MaterialIcon name="check" className="text-[16px]" />
                </div>
                <span className="font-label-md text-label-md">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
        {pillars.map((pillar) => (
          <div
            className="flex flex-col justify-between rounded-2xl border border-border-subtle bg-surface-container-low p-space-lg"
            key={pillar.title}
          >
            <div>
              <div
                className={`mb-space-sm flex size-12 items-center justify-center rounded-xl ${pillar.iconClassName}`}
              >
                <MaterialIcon name={pillar.icon} className="text-[24px]" />
              </div>
              <h4 className="mb-1 font-headline-sm text-headline-sm text-primary">{pillar.title}</h4>
              <p className="font-body-md text-body-md text-text-muted">{pillar.description}</p>
            </div>
            <div
              className={`mt-space-md flex items-center gap-1 pt-space-xs font-caption text-caption font-bold ${pillar.footerClassName}`}
            >
              <MaterialIcon name={pillar.footerIcon} className="text-[16px]" /> {pillar.footer}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
