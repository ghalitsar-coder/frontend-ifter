import { MaterialIcon } from './MaterialIcon';

const steps = [
  {
    number: '01',
    numberClassName: 'text-outline-variant/40',
    title: 'Unggah Data Siswa & Guru',
    description:
      'Impor data kelas, rombongan belajar, NISN siswa, serta dewan guru via template berkas Excel atau cadangan Dapodik dalam 2 menit.',
    icon: 'file_upload',
    footer: 'Impor Excel instan & terstruktur',
    footerClassName: 'text-primary',
  },
  {
    number: '02',
    numberClassName: 'text-amber-gold',
    title: 'Guru Mencatat Absensi di Kelas',
    description:
      'Wali kelas dan guru mapel mengecek kehadiran murid per sesi pelajaran lewat tablet/ponsel, atau siswa memindai QR presensi mandiri.',
    icon: 'devices',
    footer: 'Satu ketukan di ruang kelas',
    footerClassName: 'text-amber-dark',
  },
  {
    number: '03',
    numberClassName: 'text-primary',
    title: 'Pantau Rekap & Tindak Lanjut Disiplin',
    description:
      'Rekapitulasi otomatis per rombel langsung tercipta, jejak poin kedisiplinan tercatat rapi, dan laporan siap diekspor untuk Dapodik.',
    icon: 'analytics',
    footer: 'Rekap terpadu & surat peringatan',
    footerClassName: 'text-primary',
  },
];

export const WorkflowSection = () => (
  <section
    className="w-full scroll-mt-20 bg-surface-container-low px-margin py-space-3xl"
    id="alur-kerja"
  >
    <div className="mx-auto max-w-7xl">
      <div className="mx-auto mb-space-2xl max-w-2xl text-center">
        <span className="font-eyebrow text-eyebrow font-semibold tracking-widest text-primary uppercase">
          Alur Penggunaan Mudah
        </span>
        <h2 className="mt-1 font-headline-xl text-headline-xl tracking-tight text-text-primary">
          3 Langkah Menuju Sekolah Tertib &amp; Modern
        </h2>
        <p className="mt-2 font-body-md text-body-md text-text-muted">
          Didesain tanpa instalasi server rumit. Sistem siap aktif digunakan guru dan siswa esok
          hari.
        </p>
      </div>

      <div className="relative grid grid-cols-1 gap-gutter md:grid-cols-3">
        {steps.map((step) => (
          <div
            className="relative z-10 flex flex-col justify-between rounded-2xl border border-border-subtle bg-surface-card p-space-xl shadow-sm"
            key={step.number}
          >
            <div>
              <span
                className={`mb-space-sm block font-display-hero text-display-hero leading-none ${step.numberClassName}`}
              >
                {step.number}
              </span>
              <h3 className="mb-space-xs font-headline-sm text-headline-sm text-primary">
                {step.title}
              </h3>
              <p className="font-body-md text-body-md leading-relaxed text-text-muted">
                {step.description}
              </p>
            </div>
            <div className="mt-space-lg border-t border-border-subtle pt-space-md">
              <span
                className={`inline-flex items-center gap-1 font-caption text-caption font-bold ${step.footerClassName}`}
              >
                <MaterialIcon name={step.icon} className="text-[16px]" /> {step.footer}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
