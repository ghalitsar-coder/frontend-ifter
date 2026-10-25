import Image from 'next/image';
import { MaterialIcon } from './MaterialIcon';

const featureCards = [
  {
    image: '/assets/images/landing/feature-student-attendance.jpg',
    imageAlt: 'Guru memvalidasi kehadiran murid di kelas via tablet',
    imageClassName: 'object-top',
    icon: 'how_to_reg',
    badge: 'Presensi Murid & QR',
    title: 'Pencatatan Presensi Murid & Opsi QR Mandiri',
    description:
      'Guru pengampu memvalidasi kehadiran murid di kelas dalam hitungan detik via ponsel/tablet atau opsi pemindaian kode QR presensi murid secara mandiri. Keterangan sakit, izin, dan dispensasi langsung tersimpan terpusat.',
    stats: [
      { title: 'Cepat', caption: 'Satu Sentuhan Kelas' },
      { title: 'QR Siswa', caption: 'Scan Mandiri Kartu' },
    ],
  },
  {
    image: '/assets/images/landing/feature-teacher-attendance.jpg',
    imageAlt: 'Dewan guru berdiskusi tentang rekap presensi dan jadwal mengajar di laptop',
    imageClassName: 'object-center',
    icon: 'badge',
    badge: 'Presensi Pendidik',
    title: 'Presensi Harian Guru & Staf',
    description:
      'Pencatatan kehadiran pendidik dan tenaga kependidikan berbasis jam tugas, jadwal mengajar di kelas, dan verifikasi radius sekolah tanpa repot tanda tangan manual di buku absensi kertas kantor guru.',
    stats: [
      { title: 'Jadwal Otomatis', caption: 'Sesuai Jam Pelajaran' },
      { title: 'Radius Valid', caption: 'Area Lokasi Sekolah' },
    ],
  },
  {
    image: '/assets/images/landing/feature-discipline.jpg',
    imageAlt: 'Guru BK sedang membimbing siswa dengan buku catatan disiplin dan prestasi',
    imageClassName: 'object-center',
    icon: 'balance',
    badge: 'Disiplin & Poin Siswa',
    title: 'Manajemen Kedisiplinan & Poin Siswa',
    description:
      'Pencatatan pelanggaran tata tertib sekolah, riwayat pembinaan guru BK, dan penerbitan surat peringatan otomatis secara transparan dan berkeadilan serta pencatatan poin apresiasi prestasi siswa.',
    stats: [
      { title: 'Buku Sanksi', caption: 'Poin Adil & Obyektif' },
      { title: 'Riwayat BK', caption: 'Terpadu & Bertahap' },
    ],
  },
];

const exportRows = [
  {
    label: 'Format Rekap Rombel & Semester',
    value: 'Otomatis XLS & PDF',
    valueClassName: 'text-primary',
  },
  {
    label: 'Kompilasi Poin Disiplin & Prestasi',
    value: 'Buku Kasus Digital',
    valueClassName: 'text-amber-dark',
  },
  {
    label: 'Waktu Pengerjaan Operator Sekolah',
    value: 'Selesai dalam 1 Klik',
    valueClassName: 'text-primary',
  },
];

export const FeaturesSection = () => (
  <section className="w-full scroll-mt-20 bg-surface px-margin py-space-3xl" id="fitur">
    <div className="mx-auto max-w-7xl">
      <div className="mb-space-2xl flex flex-col justify-between gap-space-md md:flex-row md:items-end">
        <div>
          <span className="font-eyebrow text-eyebrow font-semibold tracking-widest text-primary uppercase">
            3 Pilar Solusi Utama
          </span>
          <h2 className="mt-1 font-headline-xl text-headline-xl tracking-tight text-text-primary">
            Presensi &amp; Ketertiban Tanpa Beban Administrasi
          </h2>
        </div>
        <p className="max-w-md font-body-md text-body-md text-text-muted">
          Dirancang khusus untuk manajemen operasional sekolah di Indonesia: mencakup absensi
          murid di kelas, presensi kehadiran guru/staf, serta pembinaan kedisiplinan dan poin tata
          tertib terpadu.
        </p>
      </div>

      <div className="mb-space-xl grid grid-cols-1 gap-gutter lg:grid-cols-3">
        {featureCards.map((card) => (
          <div
            className="flex flex-col justify-between overflow-hidden rounded-3xl border border-border-subtle bg-surface-card shadow-sm transition-all hover:shadow-md"
            key={card.title}
          >
            <div className="relative h-64 w-full overflow-hidden">
              <Image
                alt={card.imageAlt}
                className={`object-cover transition-transform duration-500 hover:scale-105 ${card.imageClassName}`}
                fill
                sizes="(min-width: 1024px) 400px, 100vw"
                src={card.image}
              />
              <div className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-primary px-3 py-1 font-caption text-caption font-semibold text-on-primary">
                <MaterialIcon name={card.icon} className="text-[16px] text-amber-gold" />
                {card.badge}
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-between p-space-lg">
              <div>
                <h3 className="mb-space-xs font-headline-sm text-headline-sm text-primary">
                  {card.title}
                </h3>
                <p className="mb-space-md font-body-md text-body-md text-text-muted">
                  {card.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-space-xs border-t border-border-subtle pt-space-xs">
                {card.stats.map((stat) => (
                  <div className="rounded-xl bg-surface-container-low py-2 text-center" key={stat.title}>
                    <p className="font-label-md text-label-md font-bold text-primary">
                      {stat.title}
                    </p>
                    <p className="font-caption text-caption text-text-muted">{stat.caption}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
        <div className="flex flex-col justify-between rounded-2xl bg-pine-deep p-space-xl text-on-primary shadow-sm transition-shadow hover:shadow-md md:col-span-6">
          <div>
            <div className="mb-space-md flex size-12 items-center justify-center rounded-xl bg-tertiary-container text-amber-gold">
              <MaterialIcon name="notifications_active" className="text-[28px]" />
            </div>
            <h3 className="mb-space-xs font-headline-sm text-headline-sm text-on-primary">
              Pemberitahuan WhatsApp Otomatis ke Orang Tua
            </h3>
            <p className="mb-space-md font-body-md text-body-md text-primary-fixed-dim">
              Kirim pesan resmi secara langsung ke nomor WhatsApp wali murid saat konfirmasi
              presensi kelas telah selesai atau jika siswa belum berada di ruang kelas.
            </p>
          </div>
          <div className="space-y-2 rounded-xl border border-pine-light/10 bg-tertiary-container/80 p-space-md">
            <div className="flex items-center gap-2">
              <MaterialIcon name="chat_bubble" className="text-[18px] text-amber-gold" />
              <span className="font-caption text-caption font-semibold text-amber-gold">
                Notifikasi Langsung ke Wali Murid
              </span>
            </div>
            <p className="font-caption text-caption leading-relaxed text-surface-bright">
              &quot;Yth. Orang Tua dari Rizky Pratama (Kelas VIII A), ananda tercatat HADIR pada
              sesi jam pertama (07:15 WIB). Selamat belajar!&quot;
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-amber-gold/20 bg-amber-surface p-space-xl shadow-sm transition-shadow hover:shadow-md md:col-span-6">
          <div>
            <div className="mb-space-md flex size-12 items-center justify-center rounded-xl bg-secondary-container text-amber-dark">
              <MaterialIcon name="auto_graph" className="text-[28px]" />
            </div>
            <h3 className="mb-space-xs font-headline-sm text-headline-sm text-primary">
              Rekap Bulanan Siap Ekspor Dapodik
            </h3>
            <p className="mb-space-md font-body-md text-body-md text-amber-dark">
              Format rekapan absensi per rombongan belajar dan jam tatap muka guru sudah sesuai
              dengan skema Kemendikbudristek Dapodik tanpa perlu input manual ulang.
            </p>
          </div>
          <div className="space-y-2 rounded-xl bg-surface-card p-space-md">
            {exportRows.map((row, index) => (
              <div
                className={`flex items-center justify-between text-xs ${
                  index === exportRows.length - 1
                    ? 'border-t border-border-subtle pt-1 text-text-muted'
                    : ''
                }`}
                key={row.label}
              >
                <span className={index === exportRows.length - 1 ? '' : 'font-medium text-text-primary'}>
                  {row.label}
                </span>
                <span className={`font-bold ${row.valueClassName}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);
