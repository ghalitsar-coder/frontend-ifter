import { MaterialIcon } from './MaterialIcon';

const schools = [
  { icon: 'account_balance', name: 'SMPN 1 Sleman' },
  { icon: 'school', name: 'SMA Labschool Jakarta' },
  { icon: 'local_library', name: 'SMPN 5 Bandung' },
  { icon: 'domain', name: 'SMP Harapan Bangsa' },
];

const complianceBadges = [
  { icon: 'verified', label: 'Kompatibel Penuh Dapodik & Kemenag EMIS' },
  { icon: 'lock', label: 'Enkripsi Standar ISO 27001' },
  { icon: 'cloud_done', label: 'Pusat Data Komputasi Awan Tingkat 4 Indonesia' },
];

export const TrustSection = () => (
  <section className="w-full bg-surface-container-low px-margin py-space-xl">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-space-lg md:flex-row">
      <div className="flex flex-col text-left">
        <span className="font-eyebrow text-eyebrow tracking-wider text-text-muted uppercase">
          Lembaga Pendidikan Rujukan
        </span>
        <h2 className="mt-1 font-headline-sm text-headline-sm text-primary">
          Digunakan di 1.400+ Sekolah Negeri &amp; Swasta
        </h2>
      </div>
      <div className="flex flex-wrap items-center gap-space-lg text-text-muted opacity-85">
        {schools.map((school) => (
          <div className="flex items-center gap-2" key={school.name}>
            <MaterialIcon name={school.icon} className="text-[24px] text-primary" />
            <span className="font-label-md text-label-md font-bold text-text-primary">
              {school.name}
            </span>
          </div>
        ))}
      </div>
    </div>

    <div className="mx-auto mt-space-lg flex max-w-7xl flex-wrap items-center justify-center gap-space-md pt-space-md text-text-muted md:justify-start">
      {complianceBadges.map((badge) => (
        <div
          className="inline-flex items-center gap-1.5 rounded-full bg-surface-card px-space-sm py-1 font-caption text-caption text-text-primary shadow-sm"
          key={badge.label}
        >
          <MaterialIcon name={badge.icon} className="text-[16px] text-primary" />
          <span>{badge.label}</span>
        </div>
      ))}
    </div>
  </section>
);
