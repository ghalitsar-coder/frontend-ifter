import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { DisciplineFilterState, DisciplineQuickTab } from '@/types/discipline';

/**
 * Filter and search toolbar for disciplinary incidents.
 *
 * @param props - Component properties.
 * @returns Rendered discipline filter bar.
 */
export function DisciplineFilterBar(props: {
  filter: DisciplineFilterState;
  onFilterChange: (next: DisciplineFilterState) => void;
  counts: {
    all: number;
    needAction: number;
    resolved: number;
    highPoints: number;
    showing: number;
    total: number;
  };
}) {
  const t = useTranslations('DisciplinePage');

  const handleQuickTab = (tab: DisciplineQuickTab) => {
    props.onFilterChange({
      ...props.filter,
      quickTab: tab,
    });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-xs">
      {/* Top Row: Search + dropdowns */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-12">
        {/* Search */}
        <div className="md:col-span-4">
          <label className="flex h-10 w-full items-center rounded-xl border border-border bg-surface-container-low px-3 transition-colors focus-within:border-pine-deep focus-within:ring-1 focus-within:ring-pine-deep">
            <Search className="mr-2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={props.filter.search}
              onChange={(e) => {
                props.onFilterChange({
                  ...props.filter,
                  search: e.target.value,
                });
              }}
              placeholder={t('search_placeholder')}
              className="w-full bg-transparent p-0 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden"
            />
          </label>
        </div>

        {/* Dropdown 1: Kelas */}
        <div className="md:col-span-2">
          <select
            value={props.filter.selectedClass}
            onChange={(e) => {
              props.onFilterChange({
                ...props.filter,
                selectedClass: e.target.value,
              });
            }}
            className="h-10 w-full rounded-xl border border-border bg-surface-container-low px-3 text-xs font-medium text-foreground focus:border-pine-deep focus:outline-hidden"
          >
            <option value="">{t('filter_class_all')}</option>
            <option value="VII A">VII A</option>
            <option value="VII B">VII B</option>
            <option value="VII C">VII C</option>
            <option value="VIII A">VIII A</option>
            <option value="VIII B">VIII B</option>
            <option value="IX A">IX A</option>
          </select>
        </div>

        {/* Dropdown 2: Kategori */}
        <div className="md:col-span-2">
          <select
            value={props.filter.selectedCategory}
            onChange={(e) => {
              props.onFilterChange({
                ...props.filter,
                selectedCategory: e.target.value,
              });
            }}
            className="h-10 w-full rounded-xl border border-border bg-surface-container-low px-3 text-xs font-medium text-foreground focus:border-pine-deep focus:outline-hidden"
          >
            <option value="">{t('filter_category_all')}</option>
            <option value="keterlambatan">Keterlambatan (+2)</option>
            <option value="seragam">Atribut Seragam (+3)</option>
            <option value="tatatertib">Tata Tertib Kelas (+5)</option>
            <option value="barang_terlarang">Barang Terlarang (+25)</option>
            <option value="bullying">Etika & Bullying (+50)</option>
          </select>
        </div>

        {/* Dropdown 3: Status */}
        <div className="md:col-span-2">
          <select
            value={props.filter.selectedStatus}
            onChange={(e) => {
              props.onFilterChange({
                ...props.filter,
                selectedStatus: e.target.value,
              });
            }}
            className="h-10 w-full rounded-xl border border-border bg-surface-container-low px-3 text-xs font-medium text-foreground focus:border-pine-deep focus:outline-hidden"
          >
            <option value="">{t('filter_status_all')}</option>
            <option value="baru">Baru Dicatat</option>
            <option value="tinjau">Dalam Peninjauan</option>
            <option value="tindak">Tindak Lanjut BK</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>

        {/* Dropdown 4: Periode */}
        <div className="md:col-span-2">
          <select
            value={props.filter.selectedPeriod}
            onChange={(e) => {
              props.onFilterChange({
                ...props.filter,
                selectedPeriod: e.target.value,
              });
            }}
            className="h-10 w-full rounded-xl border border-border bg-surface-container-low px-3 text-xs font-medium text-foreground focus:border-pine-deep focus:outline-hidden"
          >
            <option value="bulan">{t('filter_period_month')}</option>
            <option value="7hari">{t('filter_period_week')}</option>
            <option value="semester">{t('filter_period_semester')}</option>
          </select>
        </div>
      </div>

      {/* Bottom Row: Quick Status Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              handleQuickTab('all');
            }}
            className={`rounded-xl px-3 py-2 text-xs font-bold transition-all md:py-1.5 ${
              props.filter.quickTab === 'all'
                ? 'bg-pine-deep text-white shadow-2xs'
                : 'border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {t('tab_all')} ({props.counts.all})
          </button>

          <button
            type="button"
            onClick={() => {
              handleQuickTab('need_action');
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all md:py-1.5 ${
              props.filter.quickTab === 'need_action'
                ? 'bg-pine-deep text-white shadow-2xs'
                : 'border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <span>{t('tab_need_action')}</span>
            <span className="py-0.2 rounded-full border border-amber-gold/50 bg-amber-surface px-1.5 text-[10px] font-bold text-amber-dark">
              {props.counts.needAction}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleQuickTab('resolved');
            }}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all md:py-1.5 ${
              props.filter.quickTab === 'resolved'
                ? 'bg-pine-deep text-white shadow-2xs'
                : 'border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {t('tab_resolved')} ({props.counts.resolved})
          </button>

          <button
            type="button"
            onClick={() => {
              handleQuickTab('high_points');
            }}
            className={`flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition-all md:py-1.5 ${
              props.filter.quickTab === 'high_points'
                ? 'bg-red-700 text-white shadow-2xs'
                : 'border border-red-200 text-red-600 hover:bg-red-50'
            }`}
          >
            <span className="size-1.5 rounded-full bg-red-600" />
            <span>
              {t('tab_high_points')} ({props.counts.highPoints})
            </span>
          </button>
        </div>

        <div className="text-xs font-medium text-muted-foreground">
          {t('showing_count', {
            count: props.counts.showing,
            total: props.counts.total,
          })}
        </div>
      </div>
    </div>
  );
}
