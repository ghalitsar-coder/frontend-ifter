import {
  AlertCircle,
  Barcode,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  Search,
  Wifi,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { GateFilterOptions, RfidTapLog, TapStatus } from '@/types/piket';

const VALID_TAP_STATUSES: TapStatus[] = ['on_time', 'late'];

function isValidTapStatus(value: string): value is TapStatus {
  return (VALID_TAP_STATUSES as string[]).includes(value);
}

/**
 * Live RFID and Barcode arrival stream with real-time logging.
 * @param props - Component properties.
 * @returns Rendered live tap stream component.
 */
export function PiketLiveTapStream(props: {
  logs: RfidTapLog[];
  filterOptions: GateFilterOptions;
  currentTime: string;
  onFilterChange: (options: Partial<GateFilterOptions>) => void;
  onOpenManualTap: () => void;
  onAssignComp: (student: RfidTapLog) => void;
}) {
  const t = useTranslations('PiketPage');

  const handleStatusFilterChange = (value: string) => {
    const statusFilter: GateFilterOptions['statusFilter'] = isValidTapStatus(value) ? value : 'all';
    props.onFilterChange({ statusFilter });
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="bg-surface-card rounded-2xl p-6 shadow-xs">
        {/* Stream Header & Clock */}
        <div className="flex flex-col justify-between gap-4 pb-4 sm:flex-row sm:items-center">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="size-2.5 animate-ping rounded-full bg-pine-deep" />
              <h2 className="text-text-primary text-lg font-bold">{t('stream_title')}</h2>
            </div>
            <p className="font-caption text-text-muted text-xs">{t('stream_subtitle')}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-caption inline-flex items-center gap-1 rounded-full bg-pine-light px-2.5 py-1 text-xs font-semibold text-pine-deep">
              <Wifi className="size-3.5" />
              {t('stream_autosync')}
            </span>
            <span className="font-caption text-text-muted text-xs font-medium">
              {props.currentTime}
            </span>
          </div>
        </div>

        {/* Filter Controls & Manual Scan Button */}
        <div className="flex flex-col gap-3 pt-2 pb-6 sm:flex-row">
          <div className="relative flex-1">
            <Search className="text-text-muted absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2" />
            <input
              className="bg-canvas-base text-text-primary placeholder:text-text-muted focus:bg-surface-card h-11 w-full rounded-xl pr-4 pl-10 text-sm shadow-inner focus:outline-none"
              id="input-search-stream"
              placeholder={t('search_placeholder')}
              type="search"
              value={props.filterOptions.searchKeyword}
              onChange={(e) => {
                props.onFilterChange({ searchKeyword: e.target.value });
              }}
            />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="relative">
              <select
                aria-label={t('filter_class_all')}
                className="bg-canvas-base h-11 cursor-pointer appearance-none rounded-xl pr-8 pl-3 text-xs font-medium text-pine-deep transition-colors hover:bg-pine-light focus:outline-none"
                value={props.filterOptions.classFilter}
                onChange={(e) => {
                  props.onFilterChange({ classFilter: e.target.value });
                }}
              >
                <option value="all">{t('filter_class_all')}</option>
                <option value="VII">Kelas VII</option>
                <option value="VIII">Kelas VIII</option>
                <option value="IX">Kelas IX</option>
              </select>
              <Filter className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-pine-deep" />
            </div>

            <div className="relative">
              <select
                aria-label={t('filter_status_all')}
                className="bg-canvas-base h-11 cursor-pointer appearance-none rounded-xl pr-8 pl-3 text-xs font-medium text-pine-deep transition-colors hover:bg-pine-light focus:outline-none"
                value={props.filterOptions.statusFilter}
                onChange={(e) => {
                  handleStatusFilterChange(e.target.value);
                }}
              >
                <option value="all">{t('filter_status_all')}</option>
                <option value="on_time">{t('filter_status_ontime')}</option>
                <option value="late">{t('filter_status_late')}</option>
              </select>
              <Filter className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-pine-deep" />
            </div>

            <button
              className="text-on-primary flex h-11 items-center gap-2 rounded-xl bg-pine-deep px-4 text-sm font-semibold shadow-xs transition-all hover:bg-pine-hover"
              id="btn-manual-tap"
              type="button"
              onClick={() => {
                props.onOpenManualTap();
              }}
            >
              <Barcode className="size-4.5" />
              <span>{t('btn_manual_tap')}</span>
            </button>
          </div>
        </div>

        {/* Live Feed Items */}
        <div className="space-y-3" id="live-stream-container">
          {props.logs.map((item) => {
            const isLate = item.status === 'late';

            return (
              <div
                key={item.id}
                className={`flex flex-col justify-between gap-4 rounded-xl p-4 transition-all md:flex-row md:items-center ${
                  isLate
                    ? 'bg-red-500/10 hover:bg-red-500/15'
                    : 'bg-canvas-base hover:bg-pine-light/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-xl shadow-xs">
                    <Image
                      alt={item.studentName}
                      className="size-full object-cover"
                      fill
                      src={item.photoUrl}
                    />
                    {isLate && (
                      <span className="bg-error font-caption text-on-primary absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold">
                        !
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-text-primary text-sm font-bold">
                        {item.studentName}
                      </span>
                      <span className="bg-surface-card font-caption text-text-primary rounded-full px-2 py-0.5 text-[11px] font-semibold">
                        {item.className}
                      </span>
                      <span className="font-caption text-text-muted text-xs">NIS: {item.nis}</span>
                    </div>

                    <div className="font-caption flex flex-wrap items-center gap-2 text-xs">
                      {isLate ? (
                        <>
                          <span className="text-error inline-flex items-center gap-1 font-semibold">
                            <Clock className="size-3.5" />
                            Tap: {item.tapTime} (+{item.delayMinutes} mnt)
                          </span>
                          <span>•</span>
                          <span className="bg-error/10 text-error rounded-md px-2 py-0.5 font-semibold">
                            {t('penalty_points', { points: item.pointPenalty })}
                          </span>
                          {item.compensationTask && (
                            <>
                              <span>•</span>
                              <span className="text-text-muted">
                                {t('compensation_prefix', { task: item.compensationTask })}
                              </span>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1 font-semibold text-pine-deep">
                            <CheckCircle2 className="size-3.5" />
                            Tap: {item.tapTime}
                          </span>
                          <span>•</span>
                          <span className="text-text-muted">{item.readerName}</span>
                          <span>•</span>
                          <span className="text-text-primary font-medium">
                            {item.isUniformComplete
                              ? t('tag_uniform_complete')
                              : t('tag_uniform_issue')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 self-end md:self-center">
                  {isLate ? (
                    <>
                      <span className="bg-status-absent/60 font-caption text-error inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold">
                        {t('tag_late')}
                      </span>
                      <button
                        className="bg-error flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-red-700"
                        type="button"
                        onClick={() => {
                          props.onAssignComp(item);
                        }}
                      >
                        <AlertCircle className="size-4" />
                        <span>
                          {item.compensationTask ? t('btn_process_ticket') : t('btn_assign_comp')}
                        </span>
                      </button>
                    </>
                  ) : (
                    <span className="bg-status-present font-caption inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-pine-deep">
                      <Check className="size-3.5" />
                      {t('tag_ontime')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Meta */}
        <div className="font-caption text-text-muted mt-4 flex items-center justify-between border-t border-border-subtle pt-4 text-xs">
          <span>{t('stream_showing', { count: props.logs.length, total: 682 })}</span>
          <span className="flex items-center gap-1 font-semibold text-pine-deep">
            {t('btn_view_all_logs')} <ChevronRight className="size-4" />
          </span>
        </div>
      </div>
    </div>
  );
}
