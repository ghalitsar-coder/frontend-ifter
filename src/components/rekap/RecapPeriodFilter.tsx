const MONTHS = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
] as const;

type RecapPeriodFilterProps = {
  bulan: number;
  tahun: number;
  classes: { id: number; name: string }[];
  classFilter: number | 'all';
  classFilterDisabled?: boolean;
  classSearch: string;
  generating: boolean;
  filterClassLabel: string;
  filterAllClassesLabel: string;
  filterMonthLabel: string;
  filterYearLabel: string;
  filterSearchLabel: string;
  btnGenerateLabel: string;
  generateDisabled?: boolean;
  showGenerate?: boolean;
  generatingLabel: string;
  onBulanChange: (bulan: number) => void;
  onTahunChange: (tahun: number) => void;
  onClassChange: (classId: number | 'all') => void;
  onClassSearchChange: (search: string) => void;
  onGenerate: () => void;
};

/**
 * Filter bar for the Rekap Absensi page — Kelas search, Bulan, Tahun, and action buttons.
 */
export function RecapPeriodFilter(props: RecapPeriodFilterProps) {
  const currentYear = new Date().getFullYear();
  const years = [...new Set([currentYear - 2, currentYear - 1, currentYear, currentYear + 1, props.tahun])]
    .sort((left, right) => left - right);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-text-muted">{props.filterClassLabel}</label>
          <select
            className="h-12 rounded-xl border border-stone-200 bg-white px-3 text-sm font-semibold text-pine-deep shadow-sm focus:ring-2 focus:ring-amber-gold/60 focus:outline-none disabled:bg-stone-50"
            disabled={props.classFilterDisabled}
            value={props.classFilter}
            onChange={(event) =>
              props.onClassChange(event.target.value === 'all' ? 'all' : Number(event.target.value))
            }
          >
            <option value="all">{props.filterAllClassesLabel}</option>
            {props.classes.map((classOption) => (
              <option key={classOption.id} value={classOption.id}>
                {classOption.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-text-muted">{props.filterMonthLabel}</label>
          <select
            className="h-12 rounded-xl border border-stone-200 bg-white px-3 text-sm font-semibold text-pine-deep shadow-sm focus:ring-2 focus:ring-amber-gold/60 focus:outline-none"
            value={props.bulan}
            onChange={(e) => props.onBulanChange(Number(e.target.value))}
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-text-muted">{props.filterYearLabel}</label>
          <select
            className="h-12 rounded-xl border border-stone-200 bg-white px-3 text-sm font-semibold text-pine-deep shadow-sm focus:ring-2 focus:ring-amber-gold/60 focus:outline-none"
            value={props.tahun}
            onChange={(e) => props.onTahunChange(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-text-muted">{props.filterSearchLabel}</label>
          <input
            type="text"
            className="h-12 rounded-xl border border-stone-200 bg-white px-3 text-sm font-semibold text-pine-deep shadow-sm placeholder:font-normal placeholder:text-stone-400 focus:ring-2 focus:ring-amber-gold/60 focus:outline-none"
            placeholder={props.filterSearchLabel}
            value={props.classSearch}
            onChange={(e) => props.onClassSearchChange(e.target.value)}
          />
        </div>
      </div>

      {props.showGenerate !== false ? (
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            type="button"
            disabled={props.generating || props.generateDisabled}
            className="rounded-xl bg-amber-gold px-4 py-2.5 text-sm font-semibold text-pine-deep shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={props.onGenerate}
          >
            {props.generating ? props.generatingLabel : props.btnGenerateLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
