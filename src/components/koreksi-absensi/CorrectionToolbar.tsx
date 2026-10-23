import { CalendarDays, ChevronDown, RefreshCw, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { mockCorrectionClasses } from '@/data/mockAttendanceCorrection';
import type { CorrectionChangeFilter, CorrectionFilterState } from '@/types/attendanceCorrection';

const changeFilters: CorrectionChangeFilter[] = [
  'all',
  'alpa_sakit',
  'alpa_izin',
  'izin_hadir',
  'dispensasi',
];

/**
 * Search, change type, class, and period filters for the audit log.
 *
 * @param props - Active filters and change handlers.
 * @returns Filter toolbar.
 */
export function CorrectionToolbar(props: {
  filters: CorrectionFilterState;
  onSearchChange: (value: string) => void;
  onChangeFilterChange: (value: CorrectionChangeFilter) => void;
  onClassChange: (value: string) => void;
  onReset: () => void;
}) {
  const t = useTranslations('AttendanceCorrectionPage');

  const selectClassName =
    'h-10 cursor-pointer rounded-xl border border-border-control bg-card px-3 text-[11px] font-semibold text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-xs';

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border-subtle bg-card p-3 shadow-xs">
      <div className="relative min-w-0 flex-1 sm:min-w-[15rem]">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={props.filters.search}
          onChange={(event) => {
            props.onSearchChange(event.target.value);
          }}
          placeholder={t('search_placeholder')}
          aria-label={t('search_placeholder')}
          className="h-10 w-full rounded-xl border border-border-control bg-card pr-3 pl-9 text-[11px] text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-xs"
        />
      </div>

      <select
        value={props.filters.change}
        onChange={(event) => {
          props.onChangeFilterChange(event.target.value as CorrectionChangeFilter);
        }}
        aria-label={t('filter_change_label')}
        className={selectClassName}
      >
        {changeFilters.map((filter) => (
          <option key={filter} value={filter}>
            {t(`filter_${filter}`)}
          </option>
        ))}
      </select>

      <select
        value={props.filters.className}
        onChange={(event) => {
          props.onClassChange(event.target.value);
        }}
        aria-label={t('filter_class_label')}
        className={selectClassName}
      >
        <option value="all">{t('filter_all_classes')}</option>
        {mockCorrectionClasses.map((className) => (
          <option key={className} value={className}>
            {t('class_option', { className })}
          </option>
        ))}
      </select>

      <div className="flex h-10 items-center gap-1.5 rounded-xl border border-border-control bg-card px-3 text-[11px] font-semibold text-foreground">
        <CalendarDays className="size-3.5 text-muted-foreground" />
        {t('date_range')}
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </div>

      <button
        type="button"
        onClick={props.onReset}
        aria-label={t('filter_reset')}
        className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border-control bg-card text-muted-foreground transition-colors hover:bg-surface-container-low hover:text-pine-deep"
      >
        <RefreshCw className="size-4" />
      </button>
    </div>
  );
}
