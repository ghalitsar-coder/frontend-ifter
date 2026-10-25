import { MaterialIcon } from './MaterialIcon';

export const CtaSection = () => (
  <section className="w-full scroll-mt-20 bg-surface px-margin py-space-3xl" id="daftar">
    <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-pine-deep p-space-2xl text-on-primary shadow-2xl md:p-space-3xl">
      <div className="pointer-events-none absolute -right-20 -bottom-20 size-80 rounded-full bg-tertiary-container/80 blur-2xl" />
      <div className="pointer-events-none absolute top-0 right-1/4 size-48 rounded-full bg-secondary-container/10 blur-xl" />

      <div className="relative z-10 max-w-3xl">
        <div className="mb-space-md inline-flex items-center gap-1.5 rounded-full bg-tertiary-container px-space-sm py-1 font-eyebrow text-eyebrow tracking-widest text-amber-gold uppercase">
          <MaterialIcon name="hourglass_top" className="text-[16px]" />
          <span>Penerapan Cepat Tanpa Mengganggu Jam Belajar Mengajar</span>
        </div>
        <h2 className="font-headline-xl text-headline-xl font-extrabold tracking-tight text-balance text-on-primary">
          Siap memodernisasi presensi sekolah Anda mulai esok hari?
        </h2>
        <p className="mt-space-md max-w-xl font-body-lg text-body-lg text-balance text-primary-fixed-dim">
          Bergabunglah bersama 1.400+ sekolah cerdas di seluruh Indonesia. Dapatkan akses demo
          langsung dan panduan integrasi resmi Dapodik bersama tim konsultan pendidikan kami.
        </p>
        <div className="mt-space-xl flex flex-col items-center gap-space-md sm:flex-row">
          <a
            className="hover:bg-amber-hover inline-flex h-12 w-full items-center justify-center gap-space-sm rounded-xl bg-secondary-container px-space-xl font-label-md text-label-md font-bold text-primary shadow-lg transition-all sm:w-auto"
            href="#daftar"
          >
            <span>Daftar Sekolah Sekarang</span>
            <MaterialIcon name="arrow_forward" className="text-[18px]" />
          </a>
          <a
            className="inline-flex h-12 w-full items-center justify-center gap-space-sm rounded-xl bg-tertiary-container px-space-lg font-label-md text-label-md text-on-primary transition-all hover:bg-primary sm:w-auto"
            href="#demo"
          >
            <MaterialIcon name="headset_mic" className="text-[18px]" />
            <span>Hubungi Tim Konsultan Kami</span>
          </a>
        </div>
      </div>
    </div>
  </section>
);
