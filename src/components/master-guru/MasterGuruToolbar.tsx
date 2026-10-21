import { ChevronDown, Filter, Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { EmploymentStatus, RoleFilter } from '@/types/masterGuru';

/**
 * Filter toolbar with role pills, employment status dropdown, and real-time search.
 *
 * @param props - Component properties.
 * @returns Toolbar JSX element.
 */
export function MasterGuruToolbar(props: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedRole: RoleFilter;
  onRoleChange: (role: RoleFilter) => void;
  selectedStatus: 'all' | EmploymentStatus;
  onStatusChange: (status: 'all' | EmploymentStatus) => void;
  totalTeachers: number;
  homeroomCount: number;
  picketCount: number;
  adminCount: number;
  onResetFilters: () => void;
  isFilterActive: boolean;
}) {
  const t = useTranslations('MasterGuruPage');

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      {/* Role Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
        <button
          type="button"
          onClick={() => {
            props.onRoleChange('all');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            props.selectedRole === 'all'
              ? 'bg-pine-deep text-white shadow-xs'
              : 'bg-surface-card text-text-muted hover:text-text-primary hover:bg-slate-100 border border-border-control'
          }`}
        >
          {t('role_tab_all', { count: props.totalTeachers })}
        </button>

        <button
          type="button"
          onClick={() => {
            props.onRoleChange('homeroom');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            props.selectedRole === 'homeroom'
              ? 'bg-pine-deep text-white shadow-xs'
              : 'bg-surface-card text-text-muted hover:text-text-primary hover:bg-slate-100 border border-border-control'
          }`}
        >
          {t('role_tab_homeroom', { count: props.homeroomCount })}
        </button>

        <button
          type="button"
          onClick={() => {
            props.onRoleChange('picket');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            props.selectedRole === 'picket'
              ? 'bg-pine-deep text-white shadow-xs'
              : 'bg-surface-card text-text-muted hover:text-text-primary hover:bg-slate-100 border border-border-control'
          }`}
        >
          {t('role_tab_picket', { count: props.picketCount })}
        </button>

        <button
          type="button"
          onClick={() => {
            props.onRoleChange('admin');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            props.selectedRole === 'admin'
              ? 'bg-pine-deep text-white shadow-xs'
              : 'bg-surface-card text-text-muted hover:text-text-primary hover:bg-slate-100 border border-border-control'
          }`}
        >
          {t('role_tab_admin', { count: props.adminCount })}
        </button>
      </div>

      {/* Search Input & Status Dropdown */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 sm:w-72 lg:w-80">
          <Search className="text-text-muted pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
          <input
            type="text"
            value={props.searchQuery}
            onChange={(e) => {
              props.onSearchChange(e.target.value);
            }}
            placeholder={t('search_placeholder')}
            className="bg-surface-card text-text-primary placeholder:text-text-muted h-10 w-full rounded-xl border border-border-control pr-10 pl-10 text-xs sm:text-sm shadow-xs transition-all focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
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

        {/* Status Dropdown */}
        <div className="relative">
          <select
            value={props.selectedStatus}
            onChange={(e) => {
              props.onStatusChange(e.target.value as 'all' | EmploymentStatus);
            }}
            className="bg-surface-card text-text-primary h-10 cursor-pointer appearance-none rounded-xl border border-border-control pr-8 pl-3.5 text-xs sm:text-sm font-medium shadow-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
          >
            <option value="all">{t('status_filter_all')}</option>
            <option value="PNS">{t('status_filter_pns')}</option>
            <option value="PPPK">{t('status_filter_pppk')}</option>
            <option value="Guru Honorer">{t('status_filter_honorer')}</option>
            <option value="GTY">{t('status_filter_gty')}</option>
          </select>
          <ChevronDown className="text-text-muted pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2" />
        </div>

        {/* Reset filter button */}
        {props.isFilterActive && (
          <button
            type="button"
            onClick={props.onResetFilters}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
          >
            <Filter className="size-3" />
            <span>{t('btn_reset_filters')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
