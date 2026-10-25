'use client';

import { ChevronDown, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';
import type { AcademicYear } from '@/lib/api/dto';
import type { MasterKelasStatus } from '@/lib/api/master-kelas';

const GRADE_FILTERS = [7, 8, 9, 10, 11, 12] as const;

const selectClass =
  'bg-surface-card text-text-primary h-9 cursor-pointer appearance-none rounded-xl border border-border-control pr-8 pl-3.5 text-xs font-medium shadow-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm';

const parseStatus = (value: string): 'all' | MasterKelasStatus => {
  if (value === 'active' || value === 'archived') {
    return value;
  }
  return 'all';
};

/**
 * Small labelled select wrapper for the filter bar.
 * @param props - Select value, change handler, aria label, and options.
 * @returns Styled select with a chevron.
 */
function FilterSelect(props: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={props.value}
        onChange={(event) => {
          props.onChange(event.target.value);
        }}
        aria-label={props.ariaLabel}
        className={selectClass}
      >
        {props.children}
      </select>
      <ChevronDown className="text-text-muted pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2" />
    </div>
  );
}

/**
 * Filter toolbar for the class table (academic year, grade, status).
 *
 * @param props - Filter values, options, and callbacks.
 * @param props.yearFilter - Selected academic year id or `all`.
 * @param props.gradeFilter - Selected grade or `all`.
 * @param props.statusFilter - Selected status or `all`.
 * @param props.academicYears - Academic year options.
 * @param props.hasActiveFilters - Whether the reset button is shown.
 * @param props.shownCount - Number of rendered rows.
 * @param props.total - Server total for the active server filters.
 * @param props.onYearChange - Academic year change handler.
 * @param props.onGradeChange - Grade change handler.
 * @param props.onStatusChange - Status change handler.
 * @param props.onReset - Resets every filter.
 * @returns Filter toolbar.
 */
export function ClassToolbar(props: {
  yearFilter: string;
  gradeFilter: string;
  statusFilter: string;
  academicYears: AcademicYear[];
  hasActiveFilters: boolean;
  shownCount: number;
  total: number;
  onYearChange: (value: string) => void;
  onGradeChange: (value: string) => void;
  onStatusChange: (value: MasterKelasStatus | 'all') => void;
  onReset: () => void;
}) {
  return (
    <div className="bg-surface-card flex flex-col gap-3 rounded-2xl border border-border-control p-4 shadow-xs sm:p-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <FilterSelect
          value={props.yearFilter}
          onChange={props.onYearChange}
          ariaLabel="Filter tahun ajaran"
        >
          <option value="all">Semua Tahun Ajaran</option>
          {props.academicYears.map((year) => (
            <option key={year.id} value={year.id}>
              {year.name}
              {year.is_active ? ' (Aktif)' : ''}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          value={props.gradeFilter}
          onChange={props.onGradeChange}
          ariaLabel="Filter tingkat"
        >
          <option value="all">Semua Tingkat</option>
          {GRADE_FILTERS.map((grade) => (
            <option key={grade} value={grade}>
              Tingkat {grade}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          value={props.statusFilter}
          onChange={(value) => {
            props.onStatusChange(parseStatus(value));
          }}
          ariaLabel="Filter status"
        >
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="archived">Diarsipkan</option>
        </FilterSelect>

        {props.hasActiveFilters && (
          <button
            type="button"
            onClick={props.onReset}
            className="text-text-muted hover:text-text-primary flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="size-3.5" />
            Reset filter
          </button>
        )}

        <span className="text-text-muted ml-auto text-xs">
          Menampilkan {props.shownCount} dari {props.total} kelas
        </span>
      </div>
    </div>
  );
}
