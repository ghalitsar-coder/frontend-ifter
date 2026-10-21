import { CheckCheck, Download, Search, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { AttendanceFilter } from '@/types/attendance';

/**
 * Filter pills, search bar, and bulk action toolbar for attendance.
 *
 * @param props - Toolbar callbacks and filter state.
 * @returns Toolbar section.
 */
export function AttendanceToolbar(props: {
  activeFilter: AttendanceFilter;
  onFilterChange: (filter: AttendanceFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: {
    all: number;
    hadir: number;
    sakit: number;
    izin: number;
    alpa: number;
  };
  onMarkAllPresent: () => void;
  onDownloadPdf: () => void;
  onSubmit: () => void;
}) {
  const t = useTranslations('AttendancePage');

  return (
    <section className="mb-4 flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs lg:flex-row lg:items-center">
      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => props.onFilterChange('all')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            props.activeFilter === 'all'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-surface-container-low text-foreground hover:bg-surface-container-high'
          }`}
        >
          <span>{t('filter_all')}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              props.activeFilter === 'all'
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-background text-muted-foreground'
            }`}
          >
            {props.counts.all}
          </span>
        </button>

        <button
          type="button"
          onClick={() => props.onFilterChange('hadir')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            props.activeFilter === 'hadir'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-surface-container-low text-foreground hover:bg-surface-container-high'
          }`}
        >
          <span className="size-2 rounded-full bg-pastel-mint inline-block" />
          <span>{t('hadir_label')}</span>
          <span className="text-xs text-muted-foreground font-semibold">
            {props.counts.hadir}
          </span>
        </button>

        <button
          type="button"
          onClick={() => props.onFilterChange('sakit')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            props.activeFilter === 'sakit'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-surface-container-low text-foreground hover:bg-surface-container-high'
          }`}
        >
          <span className="size-2 rounded-full bg-pastel-yellow inline-block" />
          <span>{t('sakit_label')}</span>
          <span className="text-xs text-muted-foreground font-semibold">
            {props.counts.sakit}
          </span>
        </button>

        <button
          type="button"
          onClick={() => props.onFilterChange('izin')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            props.activeFilter === 'izin'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-surface-container-low text-foreground hover:bg-surface-container-high'
          }`}
        >
          <span className="size-2 rounded-full bg-pastel-blue inline-block" />
          <span>{t('izin_label')}</span>
          <span className="text-xs text-muted-foreground font-semibold">
            {props.counts.izin}
          </span>
        </button>

        <button
          type="button"
          onClick={() => props.onFilterChange('alpa')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            props.activeFilter === 'alpa'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-surface-container-low text-foreground hover:bg-surface-container-high'
          }`}
        >
          <span className="size-2 rounded-full bg-pastel-red inline-block" />
          <span>{t('alpa_label')}</span>
          <span className="text-xs text-muted-foreground font-semibold">
            {props.counts.alpa}
          </span>
        </button>
      </div>

      {/* Search & Bulk Actions */}
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            value={props.searchQuery}
            onChange={e => props.onSearchChange(e.target.value)}
            placeholder={t('search_placeholder')}
            className="h-10 w-full rounded-xl bg-surface-container-low pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground border border-border/60 focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring transition-all"
          />
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <button
            type="button"
            onClick={props.onMarkAllPresent}
            className="flex h-10 items-center gap-1.5 whitespace-nowrap rounded-xl bg-surface-container-low px-4 text-sm font-medium text-foreground hover:bg-surface-container-high transition-colors border border-border/50"
          >
            <CheckCheck className="size-4 text-muted-foreground" />
            <span>{t('mark_all_present')}</span>
          </button>

          <button
            type="button"
            onClick={props.onDownloadPdf}
            title={t('download_pdf')}
            className="flex size-10 items-center justify-center rounded-xl bg-surface-container-low text-foreground hover:bg-surface-container-high transition-colors border border-border/50"
          >
            <Download className="size-4" />
          </button>

          <button
            type="button"
            onClick={props.onSubmit}
            className="flex h-10 items-center gap-2 whitespace-nowrap rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 shadow-xs transition-opacity"
          >
            <Send className="size-4" />
            <span>{t('submit_attendance')}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
