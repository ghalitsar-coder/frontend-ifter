'use client';

import { useTranslations } from 'next-intl';
import type { PresensiCounts } from '@/components/presensi/presensiStatusStyles';
import type { PresensiFilter } from '@/types/presensi';

export type PresensiSortOption = 'nomor' | 'unrecorded' | 'abjad' | 'nisn';

const TOOLBAR_FILTERS = ['all', 'unrecorded', 'hadir', 'sakit', 'izin', 'alpa'] as const;

const FILTER_KEYS = {
  all: 'filter_all',
  unrecorded: 'filter_unrecorded',
  hadir: 'filter_hadir',
  sakit: 'filter_sakit',
  izin: 'filter_izin',
  alpa: 'filter_alpa',
} as const satisfies Record<PresensiFilter, string>;

const SORT_OPTIONS = ['nomor', 'unrecorded', 'abjad', 'nisn'] as const;

const SORT_KEYS = {
  nomor: 'sort_by_number',
  unrecorded: 'sort_unrecorded_first',
  abjad: 'sort_alphabetical',
  nisn: 'sort_by_nisn',
} as const satisfies Record<PresensiSortOption, string>;

const CHIP_BASE =
  'rounded-full px-3.5 py-2 font-label-md text-label-md whitespace-nowrap transition-colors';

const CHIP_IDLE =
  'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface';
const CHIP_ACTIVE = 'bg-pine-deep text-surface';
const CHIP_UNRECORDED =
  'border border-amber-300 bg-amber-50 font-bold text-amber-900 hover:bg-amber-100';

/**
 * Class list for a filter chip in its current state.
 *
 * @param filter - Chip's status filter.
 * @param isActive - Whether the chip is the selected filter.
 * @returns Tailwind classes.
 */
function chipClass(filter: PresensiFilter, isActive: boolean) {
  if (isActive) {
    return `${CHIP_BASE} ${CHIP_ACTIVE}`;
  }

  return `${CHIP_BASE} ${filter === 'unrecorded' ? CHIP_UNRECORDED : CHIP_IDLE}`;
}

/**
 * Search, status filter chips, and roster sorting controls.
 *
 * @param props - Current filter, sort, search values and their handlers.
 * @returns Toolbar card.
 */
export function PresensiRosterToolbar(props: {
  counts: PresensiCounts;
  activeFilter: PresensiFilter;
  sortOption: PresensiSortOption;
  searchQuery: string;
  onFilterChange: (filter: PresensiFilter) => void;
  onSortChange: (sort: PresensiSortOption) => void;
  onSearchChange: (query: string) => void;
}) {
  const t = useTranslations('PresensiPage');
  const { counts } = props;

  const filterCounts: Record<PresensiFilter, number> = {
    all: counts.total,
    unrecorded: counts.unrecorded,
    hadir: counts.hadir,
    sakit: counts.sakit,
    izin: counts.izin,
    alpa: counts.alpa,
  };

  return (
    <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border-[1.5px] border-border-control bg-surface p-4 shadow-[0_2px_12px_-2px_rgba(23,63,54,0.04)] lg:flex-row lg:items-center">
      <div className="relative min-w-[280px] flex-1">
        <span className="material-symbols-outlined absolute top-1/2 left-3.5 -translate-y-1/2 text-[20px] text-text-muted">
          search
        </span>
        <input
          className="h-11 w-full rounded-xl border border-transparent bg-surface-container-low pr-4 pl-11 font-label-md text-label-md text-on-surface transition-all placeholder:text-text-placeholder focus:border-border-control focus:bg-surface focus:ring-1 focus:ring-on-surface focus:outline-none"
          id="studentSearch"
          onChange={(event) => {
            props.onSearchChange(event.target.value);
          }}
          placeholder={t('search_placeholder')}
          type="text"
          value={props.searchQuery}
        />
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
        {TOOLBAR_FILTERS.map((filter) => {
          const isActive = props.activeFilter === filter;

          return (
            <button
              className={chipClass(filter, isActive)}
              key={filter}
              onClick={() => {
                props.onFilterChange(filter);
              }}
              type="button"
            >
              {t(FILTER_KEYS[filter], { count: filterCounts[filter] })}
            </button>
          );
        })}
      </div>

      <div className="flex shrink-0 items-center gap-2 self-end lg:self-auto">
        <div className="relative">
          <select
            className="h-11 cursor-pointer appearance-none rounded-xl border border-border-subtle bg-surface-container-low pr-8 pl-3.5 font-label-md text-label-md text-on-surface focus:outline-none"
            onChange={(event) => {
              props.onSortChange(event.target.value as PresensiSortOption);
            }}
            value={props.sortOption}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(SORT_KEYS[option])}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[18px] text-text-muted">
            sort
          </span>
        </div>
      </div>
    </div>
  );
}
