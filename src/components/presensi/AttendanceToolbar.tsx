import { CheckCheck, Download, Lock, Search, Send } from 'lucide-react';
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
  /** Finalizes the day via POST /attendance/close (optional; hides button when absent). */
  onCloseDay?: () => void;
  /** Disables write actions while a mutation is in flight or the day is closed. */
  saving?: boolean;
  readOnly?: boolean;
}) {
  const t = useTranslations('AttendancePage');

  return (
    <section className="mb-4 flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs lg:flex-row lg:items-center">
      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            props.onFilterChange('all');
          }}
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
          onClick={() => {
            props.onFilterChange('hadir');
          }}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            props.activeFilter === 'hadir'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-surface-container-low text-foreground hover:bg-surface-container-high'
          }`}
        >
          <span className="inline-block size-2 rounded-full bg-pastel-mint" />
          <span>{t('hadir_label')}</span>
          <span className="text-xs font-semibold text-muted-foreground">{props.counts.hadir}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            props.onFilterChange('sakit');
          }}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            props.activeFilter === 'sakit'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-surface-container-low text-foreground hover:bg-surface-container-high'
          }`}
        >
          <span className="inline-block size-2 rounded-full bg-pastel-yellow" />
          <span>{t('sakit_label')}</span>
          <span className="text-xs font-semibold text-muted-foreground">{props.counts.sakit}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            props.onFilterChange('izin');
          }}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            props.activeFilter === 'izin'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-surface-container-low text-foreground hover:bg-surface-container-high'
          }`}
        >
          <span className="inline-block size-2 rounded-full bg-pastel-blue" />
          <span>{t('izin_label')}</span>
          <span className="text-xs font-semibold text-muted-foreground">{props.counts.izin}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            props.onFilterChange('alpa');
          }}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            props.activeFilter === 'alpa'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-surface-container-low text-foreground hover:bg-surface-container-high'
          }`}
        >
          <span className="inline-block size-2 rounded-full bg-pastel-red" />
          <span>{t('alpa_label')}</span>
          <span className="text-xs font-semibold text-muted-foreground">{props.counts.alpa}</span>
        </button>
      </div>

      {/* Search & Bulk Actions */}
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <div className="relative w-full sm:w-64">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <input
            type="text"
            value={props.searchQuery}
            onChange={(e) => {
              props.onSearchChange(e.target.value);
            }}
            placeholder={t('search_placeholder')}
            className="h-10 w-full rounded-xl border border-border/60 bg-surface-container-low pr-3 pl-9 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:bg-background focus:ring-1 focus:ring-ring focus:outline-none"
          />
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <button
            type="button"
            onClick={props.onMarkAllPresent}
            disabled={props.readOnly === true || props.saving === true}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-border/50 bg-surface-container-low px-4 text-sm font-medium whitespace-nowrap text-foreground transition-colors hover:bg-surface-container-high disabled:opacity-50"
          >
            <CheckCheck className="size-4 text-muted-foreground" />
            <span>{t('mark_all_present')}</span>
          </button>

          {props.onCloseDay !== undefined && (
            <button
              type="button"
              onClick={props.onCloseDay}
              disabled={props.readOnly === true || props.saving === true}
              title="Tutup absensi hari ini"
              className="flex size-10 items-center justify-center rounded-xl border border-border/50 bg-surface-container-low text-foreground transition-colors hover:bg-surface-container-high disabled:opacity-50"
            >
              <Lock className="size-4" />
            </button>
          )}

          <button
            type="button"
            onClick={props.onDownloadPdf}
            title={t('download_pdf')}
            className="flex size-10 items-center justify-center rounded-xl border border-border/50 bg-surface-container-low text-foreground transition-colors hover:bg-surface-container-high"
          >
            <Download className="size-4" />
          </button>

          <button
            type="button"
            onClick={props.onSubmit}
            disabled={props.readOnly === true || props.saving === true}
            className="flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium whitespace-nowrap text-primary-foreground shadow-xs transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Send className="size-4" />
            <span>{t('submit_attendance')}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
