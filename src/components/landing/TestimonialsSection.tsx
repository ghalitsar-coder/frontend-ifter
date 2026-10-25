import { MaterialIcon } from './MaterialIcon';

const metrics = [
  {
    value: '500.000+',
    title: 'Presensi Tercatat Sukses',
    caption: 'Dipercaya untuk kelancaran ritme pagi sekolah',
  },
  {
    value: '99.98%',
    title: 'Keandalan Server Presensi',
    caption: 'Tetap stabil saat jam puncak 06.30 - 07.15 WIB',
  },
  {
    value: '0 Menit',
    title: 'Rekapitulasi Manual',
    caption: 'Menghemat puluhan jam kerja guru setiap bulan',
  },
];

const testimonials = [
  {
    quote:
      'Sebelum ada Attendly, wali kelas menghabiskan waktu 15 menit awal pelajaran hanya untuk absen manual. Sekarang jam 07.15, rekap sudah rapi di meja saya dan wali murid tenang menerima kepastian ananda di kelas.',
    initials: 'SW',
    avatarClassName: 'bg-primary text-on-primary',
    name: 'Dra. Sri Wahyuni, M.Pd.',
    role: 'Kepala SMP Teladan Yogyakarta',
  },
  {
    quote:
      'Fitur poin kedisiplinan dan integrasi ekspor Dapodik-nya sangat juara. Saat akreditasi sekolah kemarin, semua rekap kehadiran siswa dan dokumen pendukung siap cetak tanpa lembur sama sekali.',
    initials: 'HD',
    avatarClassName: 'bg-tertiary text-on-tertiary',
    name: 'Bpk. Handoko, S.Pd.',
    role: 'Wakasek Kesiswaan & Guru Pamong',
  },
];

export const TestimonialsSection = () => (
  <section
    className="w-full scroll-mt-20 bg-surface-container-low px-margin py-space-3xl"
    id="integrasi-dapodik"
  >
    <div className="mx-auto max-w-7xl">
      <div className="mb-space-3xl grid grid-cols-1 gap-gutter rounded-2xl bg-pine-deep p-space-xl text-on-primary md:grid-cols-3">
        {metrics.map((metric) => (
          <div
            className="flex flex-col items-center text-center md:items-start md:text-left"
            key={metric.title}
          >
            <span className="font-display-hero text-display-hero font-extrabold tracking-tight text-amber-gold">
              {metric.value}
            </span>
            <p className="mt-1 font-headline-sm text-headline-sm font-semibold text-on-primary">
              {metric.title}
            </p>
            <p className="font-caption text-caption text-primary-fixed-dim">{metric.caption}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
        {testimonials.map((testimonial) => (
          <div
            className="flex flex-col justify-between rounded-2xl border border-border-subtle bg-surface-card p-space-xl shadow-sm"
            key={testimonial.name}
          >
            <div className="space-y-space-md">
              <div className="flex items-center gap-1 text-amber-gold">
                <span className="sr-only">5 dari 5 bintang</span>
                {Array.from({ length: 5 }, (_, index) => (
                  <MaterialIcon className="text-[20px] fill-1" key={index} name="star" />
                ))}
              </div>
              <p className="font-body-lg text-body-lg leading-relaxed text-text-primary italic">
                &quot;{testimonial.quote}&quot;
              </p>
            </div>
            <div className="mt-space-lg flex items-center gap-space-md border-t border-border-subtle pt-space-md">
              <div
                className={`flex size-12 items-center justify-center rounded-full font-bold ${testimonial.avatarClassName}`}
              >
                {testimonial.initials}
              </div>
              <div>
                <p className="font-label-md text-label-md font-bold text-text-primary">
                  {testimonial.name}
                </p>
                <p className="font-caption text-caption text-text-muted">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
