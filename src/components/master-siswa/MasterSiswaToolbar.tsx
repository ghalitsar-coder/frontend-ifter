import { ChevronDown, Filter, Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { GradeFilter, StatusFilter } from '@/types/masterSiswa';

/**
 * Filter toolbar with debounced-friendly search input and categorical selectors.
 *
 * @param props - Component properties.
 * @returns Filter bar component.
 */
export function MasterSiswaToolbar(props: {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  gradeFilter: GradeFilter;
  onGradeChange: (val: GradeFilter) => void;
  classFilter: string;
  onClassChange: (val: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (val: StatusFilter) => void;
  yearFilter: string;
  onYearChange: (val: string) => void;
  availableClasses: string[];
  onResetFilters: () => void;
}) {
  const t = useTranslations('MasterSiswaPage');

  const hasActiveFilters =
    props.searchQuery !== '' ||
    props.gradeFilter !== 'all' ||
    props.classFilter !== 'all' ||
    props.statusFilter !== 'all' ||
    props.yearFilter !== '2024/2025';

  return (
    <div className="flex flex-col gap-3">
      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="text-text-muted pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
        <input
          type="text"
          value={props.searchQuery}
          onChange={(e) => {
            props.onSearchChange(e.target.value);
          }}
          placeholder={t('search_placeholder')}
          className="bg-surface-card text-text-primary placeholder:text-text-muted h-11 w-full rounded-xl border border-border-control pr-10 pl-10 text-sm shadow-xs transition-all focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
        />
        {props.searchQuery && (
          <button
            type="button"
            onClick={() => {
              props.onSearchChange('');
            }}
            className="text-text-muted hover:text-text-primary absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer p-1"
            aria-label={t('btn_clear_search')}
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Grade filter */}
        <div className="relative">
          <select
            value={props.gradeFilter}
            onChange={(e) => {
              props.onGradeChange(e.target.value as GradeFilter);
            }}
            className="bg-surface-card text-text-primary h-9 cursor-pointer appearance-none rounded-xl border border-border-control pr-8 pl-3.5 text-xs font-medium shadow-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
          >
            <option value="all">{t('filter_grade_all')}</option>
            <option value="VII">{t('filter_grade_vii')}</option>
            <option value="VIII">{t('filter_grade_viii')}</option>
            <option value="IX">{t('filter_grade_ix')}</option>
          </select>
          <ChevronDown className="text-text-muted pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2" />
        </div>

        {/* Class Rombel filter */}
        <div className="relative">
          <select
            value={props.classFilter}
            onChange={(e) => {
              props.onClassChange(e.target.value);
            }}
            className="bg-surface-card text-text-primary h-9 cursor-pointer appearance-none rounded-xl border border-border-control pr-8 pl-3.5 text-xs font-medium shadow-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
          >
            <option value="all">{t('filter_class_all')}</option>
            {props.availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                {t('filter_class_option', { name: cls })}
              </option>
            ))}
          </select>
          <ChevronDown className="text-text-muted pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2" />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={props.statusFilter}
            onChange={(e) => {
              props.onStatusChange(e.target.value as StatusFilter);
            }}
            className="bg-surface-card text-text-primary h-9 cursor-pointer appearance-none rounded-xl border border-border-control pr-8 pl-3.5 text-xs font-medium shadow-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
          >
            <option value="all">{t('filter_status_all')}</option>
            <option value="active">{t('filter_status_active')}</option>
            <option value="mutation">{t('filter_status_mutation')}</option>
            <option value="alumni">{t('filter_status_alumni')}</option>
          </select>
          <ChevronDown className="text-text-muted pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2" />
        </div>

        {/* Year filter */}
        <div className="relative">
          <select
            value={props.yearFilter}
            onChange={(e) => {
              props.onYearChange(e.target.value);
            }}
            className="bg-surface-card text-text-primary h-9 cursor-pointer appearance-none rounded-xl border border-border-control pr-8 pl-3.5 text-xs font-medium shadow-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
          >
            <option value="2024/2025">{t('filter_year_2024_2025')}</option>
            <option value="2025/2026">{t('filter_year_2025_2026')}</option>
            <option value="2026/2027">{t('filter_year_2026_2027')}</option>
          </select>
          <ChevronDown className="text-text-muted pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2" />
        </div>

        {/* Reset button if filter active */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={props.onResetFilters}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
          >
            <Filter className="size-3" />
            <span>{t('btn_reset_filters')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
