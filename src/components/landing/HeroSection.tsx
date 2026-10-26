import Image from 'next/image';
import { MaterialIcon } from './MaterialIcon';

const attendanceDays = [
  { day: 'Sen', height: '96%', barClassName: 'bg-pine-deep', labelClassName: '' },
  { day: 'Sel', height: '94%', barClassName: 'bg-pine-deep', labelClassName: '' },
  { day: 'Rab', height: '100%', barClassName: 'bg-pine-deep', labelClassName: '' },
  { day: 'Kam', height: '98%', barClassName: 'bg-amber-gold', labelClassName: 'font-bold' },
  { day: 'Jum', height: '95%', barClassName: 'bg-pine-deep/40', labelClassName: '' },
];

const attendanceRows = [
  {
    initials: 'RP',
    name: 'Rizky Pratama',
    detail: '07:12 WIB • Scan QR Kartu',
    avatarClassName: 'bg-primary-fixed text-on-primary-fixed',
    status: 'Hadir',
    statusClassName: 'bg-status-present',
    showStatusIcon: true,
  },
  {
    initials: 'NP',
    name: 'Nabila Putri',
    detail: '07:14 WIB • Dikonfirmasi Guru',
    avatarClassName: 'bg-secondary-container text-on-secondary-container',
    status: 'Hadir',
    statusClassName: 'bg-status-present',
    showStatusIcon: true,
  },
  {
    initials: 'DS',
    name: 'Dimas Saputra',
    detail: 'Surat Dokter Terlampir',
    avatarClassName: 'bg-outline-variant text-text-primary',
    status: 'Izin Dokter',
    statusClassName: 'bg-status-sick',
    showStatusIcon: false,
  },
];

const dailyStats = [
  { label: 'Siswa Hadir', value: '942', valueClassName: 'text-primary' },
  { label: 'Terlambat', value: '14', valueClassName: 'text-on-secondary-fixed-variant' },
  { label: 'Izin / Sakit', value: '4', valueClassName: 'text-secondary' },
  { label: 'Poin Tercatat', value: '2 Kasus', valueClassName: 'text-error' },
];

export const HeroSection = () => (
  <section className="relative w-full overflow-hidden bg-surface px-margin pt-space-xl pb-space-3xl">
    <div className="pointer-events-none absolute -top-24 left-1/2 h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
    <div className="pointer-events-none absolute top-1/3 -right-24 h-[420px] w-[420px] rounded-full bg-secondary-container/20 blur-3xl" />

    <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center text-center">
      <div className="mb-space-lg inline-flex items-center gap-space-xs rounded-full bg-pine-light px-space-md py-1.5 text-primary shadow-sm">
        <MaterialIcon name="bolt" className="fill-1 text-[16px] text-amber-gold" />
        <span className="font-eyebrow text-eyebrow tracking-widest text-primary uppercase">
          ATTENDLY UNTUK SEKOLAH MODERN • EKOSISTEM PRESENSI TERINTEGRASI
        </span>
      </div>

      <h1 className="max-w-4xl font-display-hero text-display-hero tracking-tight text-balance text-text-primary">
        Presensi Siswa Jadi Lebih Mudah,
        <br />
        <span className="font-serif text-primary italic">Cepat, dan Tertib.</span>
      </h1>

      <p className="mt-space-lg max-w-2xl font-body-lg text-body-lg leading-relaxed text-balance text-text-muted">
        Catat kehadiran siswa dan guru dalam hitungan detik langsung dari ruang kelas, validasi
        otomatis via kode QR atau daftar murid terpadu, serta rekapitulasi poin kedisiplinan dan
        integrasi Dapodik tanpa kerumitan administrasi manual.
      </p>

      <div className="mt-space-xl flex w-full flex-col items-center gap-space-md sm:w-auto sm:flex-row">
        <a
          className="inline-flex h-12 w-full items-center justify-center gap-space-sm rounded-xl bg-pine-deep px-space-xl font-label-md text-label-md text-on-primary shadow-lg transition-all hover:bg-pine-hover hover:shadow-xl sm:w-auto"
          href="#daftar"
        >
          <span>Mulai Uji Coba Gratis 30 Hari</span>
          <MaterialIcon name="arrow_forward" className="text-[18px]" />
        </a>
        <a
          className="inline-flex h-12 w-full items-center justify-center gap-space-xs rounded-xl bg-surface-card px-space-lg font-label-md text-label-md text-text-primary shadow-sm transition-all hover:bg-surface-container sm:w-auto"
          href="#demo"
        >
          <MaterialIcon name="play_circle" className="text-[18px] text-primary" />
          <span>Jadwalkan Demo Langsung</span>
        </a>
      </div>

      <div className="mt-space-sm flex items-center gap-space-sm text-text-muted">
        <MaterialIcon name="check" className="text-[15px] text-primary" />
        <span className="font-caption text-caption">Tanpa kartu kredit</span>
        <span className="text-outline-variant">•</span>
        <MaterialIcon name="speed" className="text-[15px] text-primary" />
        <span className="font-caption text-caption">Siap aktif dalam 5 menit</span>
      </div>

      <div className="relative mt-space-2xl w-full overflow-hidden rounded-3xl border-4 border-surface-card shadow-2xl">
        <div className="relative h-[360px] w-full md:h-[480px] lg:h-[540px]">
          <Image
            alt="Foto guru dan siswa memindai QR code presensi di dalam kelas"
            className="object-cover object-center"
            fill
            preload
            sizes="(min-width: 1280px) 1216px, 100vw"
            src="/assets/images/landing/hero-classroom-qr.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
          <div className="absolute right-0 bottom-0 left-0 flex flex-col justify-between gap-space-md p-space-lg text-left text-on-primary md:flex-row md:items-end md:p-space-xl">
            <div className="max-w-2xl">
              <div className="mb-space-xs inline-flex items-center gap-2 rounded-full bg-secondary-container px-3 py-1 font-caption text-caption font-bold text-primary shadow-md">
                <span className="size-2 animate-ping rounded-full bg-primary" />
                Validasi Guru Pengampu • Presensi di Ruang Kelas
              </div>
              <p className="font-headline-sm text-headline-sm font-bold text-on-primary md:font-headline-lg md:text-headline-lg">
                Pencatatan Presensi Kelas Terpadu: Cek Kehadiran Murid Cepat &amp; Akurat Langsung
                dari Ruang Kelas
              </p>
              <p className="mt-1 font-body-md text-body-md text-primary-fixed-dim">
                Wali kelas dan guru pengampu memverifikasi kehadiran murid dalam sekejap via
                ponsel/tablet atau pemindaian kartu QR siswa secara mandiri dan transparan.
              </p>
            </div>
            <div className="flex items-center gap-space-sm rounded-2xl border border-white/20 bg-surface-card/15 px-space-md py-space-sm backdrop-blur-md">
              <MaterialIcon name="qr_code_scanner" className="text-[32px] text-amber-gold" />
              <div>
                <p className="font-caption text-caption font-semibold tracking-wider text-primary-fixed-dim uppercase">
                  Validasi Real-Time
                </p>
                <p className="font-headline-sm text-headline-sm font-bold text-amber-gold">
                  0.3 Detik / Siswa
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-space-2xl grid w-full grid-cols-1 items-end gap-gutter md:grid-cols-12">
        <div className="transform rounded-2xl bg-pine-deep p-space-lg text-left text-on-primary shadow-xl transition-transform duration-300 hover:rotate-0 md:col-span-4 md:-rotate-1">
          <div className="mb-space-sm flex items-center justify-between rounded-lg bg-primary/40 p-space-xs pb-space-sm">
            <div className="flex items-center gap-space-xs">
              <span className="inline-block size-2.5 animate-pulse rounded-full bg-amber-gold" />
              <span className="font-label-md text-label-md font-semibold text-amber-gold">
                Presensi Kelas VIII A • 07:15 WIB
              </span>
            </div>
            <span className="rounded bg-primary/80 px-2 py-0.5 font-caption text-caption text-primary-fixed-dim">
              Aktif di Kelas
            </span>
          </div>
          <p className="mb-space-sm font-caption text-caption text-primary-fixed-dim">
            Dicek oleh Guru: Sarah Rahma, S.Pd.
          </p>
          <div className="space-y-space-xs">
            {attendanceRows.map((row) => (
              <div
                className="flex items-center justify-between rounded-xl bg-tertiary-container/60 p-2.5"
                key={row.name}
              >
                <div className="flex items-center gap-space-sm">
                  <div
                    className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${row.avatarClassName}`}
                  >
                    {row.initials}
                  </div>
                  <div>
                    <p className="font-label-md text-label-md leading-tight font-medium text-on-primary">
                      {row.name}
                    </p>
                    <p className="font-caption text-caption text-primary-fixed-dim">{row.detail}</p>
                  </div>
                </div>
                <span
                  className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 font-caption text-caption font-semibold text-text-primary ${row.statusClassName}`}
                >
                  {row.showStatusIcon ? (
                    <MaterialIcon name="check" className="text-[12px]" />
                  ) : null}
                  {row.status}
                </span>
              </div>
            ))}
          </div>
          <button
            className="mt-space-md flex w-full items-center justify-center gap-space-xs rounded-xl bg-primary py-2 font-label-md text-label-md text-on-primary transition-colors hover:bg-pine-hover"
            type="button"
          >
            <MaterialIcon name="done_all" className="text-[16px]" />
            <span>Tandai Semua Hadir</span>
          </button>
        </div>

        <div className="relative z-20 rounded-2xl bg-pine-light p-space-lg text-text-primary shadow-xl md:col-span-4 md:-mt-8 md:scale-105">
          <div className="mb-space-sm flex items-center justify-between">
            <span className="font-caption text-caption font-bold tracking-wider text-primary uppercase">
              Tingkat Kehadiran Kelas VIII A
            </span>
            <span className="flex items-center gap-1 rounded-full bg-secondary-container px-space-xs py-0.5 font-caption text-caption font-bold text-on-secondary-container">
              <MaterialIcon name="star" className="text-[14px]" /> Sangat Baik
            </span>
          </div>
          <div className="flex items-baseline gap-space-xs">
            <span className="font-headline-xl text-headline-xl font-extrabold tracking-tight text-primary">
              98.4%
            </span>
            <span className="font-label-md text-label-md font-medium text-primary">
              Pekan Berjalan
            </span>
          </div>
          <p className="mt-1 font-caption text-caption text-text-muted">
            Rata-rata kumulatif kehadiran siswa per sesi mata pelajaran
          </p>
          <div className="mt-space-lg rounded-xl bg-surface-card p-space-md pt-space-sm">
            <div className="flex h-28 items-end justify-between gap-3 px-2">
              {attendanceDays.map((day) => (
                <div className="flex flex-1 flex-col items-center gap-1" key={day.day}>
                  <div
                    className={`w-full rounded-t-md transition-all hover:bg-amber-gold ${day.barClassName}`}
                    style={{ height: day.height }}
                  />
                  <span
                    className={`font-caption text-caption text-text-muted ${day.labelClassName}`}
                  >
                    {day.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="transform rounded-2xl bg-amber-surface p-space-lg text-left text-text-primary shadow-xl transition-transform duration-300 hover:rotate-0 md:col-span-4 md:rotate-1">
          <div className="mb-space-sm flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <MaterialIcon name="fact_check" className="text-[18px] text-amber-dark" />
              <span className="font-label-md text-label-md font-bold text-amber-dark">
                Pengecekan Harian &amp; Disiplin
              </span>
            </div>
            <span className="rounded-md bg-secondary-container/60 px-2 py-0.5 font-caption text-caption font-semibold text-amber-dark">
              Kamis, 07:30 WIB
            </span>
          </div>
          <div className="mt-space-sm grid grid-cols-2 gap-space-sm">
            {dailyStats.map((stat) => (
              <div className="rounded-xl bg-surface-card p-space-sm" key={stat.label}>
                <span className="font-caption text-caption text-text-muted">{stat.label}</span>
                <p className={`font-headline-sm text-headline-sm font-bold ${stat.valueClassName}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-space-md flex items-center justify-between rounded-xl border border-border-subtle bg-surface-card p-space-xs text-xs">
            <span className="text-text-muted">Kasus Hari Ini:</span>
            <span className="font-semibold text-error">Terlambat (1x) &amp; Atribut (1x)</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);
