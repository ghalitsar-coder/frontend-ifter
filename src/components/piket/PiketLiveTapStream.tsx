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

const VALID_TAP_STATUSES: TapStatus[] = ['on_time', 'late', 'unknown_card'];

function isValidTapStatus(value: string): value is TapStatus {
  return (VALID_TAP_STATUSES as string[]).includes(value);
}

const ROW_CLASSES: Record<TapStatus, string> = {
  on_time: 'bg-canvas-base hover:bg-pine-light/30',
  late: 'bg-red-500/10 hover:bg-red-500/15',
  unknown_card: 'bg-amber-500/10 hover:bg-amber-500/15',
  uniform_hold: 'bg-amber-500/10 hover:bg-amber-500/15',
};

const initialsOf = (name: string): string =>
  name
    .split(' ')
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();

/**
 * Live RFID and Barcode arrival stream with real-time logging.
 * @param props - Component properties.
 * @returns Rendered live tap stream component.
 */
export function PiketLiveTapStream(props: {
  logs: RfidTapLog[];
  filterOptions: GateFilterOptions;
  currentTime: string;
  canReadTaps: boolean;
  isTapsLoading: boolean;
  readerOptions: { id: string; name: string }[];
  totalCount: number;
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
      <div className="rounded-2xl bg-surface-card p-6 shadow-xs">
        {/* Stream Header & Clock */}
        <div className="flex flex-col justify-between gap-4 pb-4 sm:flex-row sm:items-center">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="size-2.5 animate-ping rounded-full bg-pine-deep" />
              <h2 className="text-lg font-bold text-text-primary">{t('stream_title')}</h2>
            </div>
            <p className="font-caption text-xs text-text-muted">{t('stream_subtitle')}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-pine-light px-2.5 py-1 font-caption text-xs font-semibold text-pine-deep">
              <Wifi className="size-3.5" />
              {t('stream_autosync')}
            </span>
            <span className="font-caption text-xs font-medium text-text-muted">
              {props.currentTime}
            </span>
          </div>
        </div>

        {!props.canReadTaps && (
          <p
            role="note"
            className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800"
          >
            Role Anda tidak dapat membaca stream tap perangkat. Tap manual tetap tersedia dan
            tercatat di daftar ini.
          </p>
        )}

        {/* Filter Controls & Manual Scan Button */}
        <div className="flex flex-col gap-3 pt-2 pb-6 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-text-muted" />
            <input
              className="h-11 w-full rounded-xl bg-canvas-base pr-4 pl-10 text-sm text-text-primary shadow-inner placeholder:text-text-muted focus:bg-surface-card focus:outline-none"
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
                aria-label="Semua Reader"
                className="h-11 cursor-pointer appearance-none rounded-xl bg-canvas-base pr-8 pl-3 text-xs font-medium text-pine-deep transition-colors hover:bg-pine-light focus:outline-none"
                value={props.filterOptions.readerFilter}
                onChange={(e) => {
                  props.onFilterChange({ readerFilter: e.target.value });
                }}
              >
                <option value="all">Semua Reader</option>
                {props.readerOptions.map((reader) => (
                  <option key={reader.id} value={reader.id}>
                    {reader.name}
                  </option>
                ))}
              </select>
              <Filter className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-pine-deep" />
            </div>

            <div className="relative">
              <select
                aria-label={t('filter_status_all')}
                className="h-11 cursor-pointer appearance-none rounded-xl bg-canvas-base pr-8 pl-3 text-xs font-medium text-pine-deep transition-colors hover:bg-pine-light focus:outline-none"
                value={props.filterOptions.statusFilter}
                onChange={(e) => {
                  handleStatusFilterChange(e.target.value);
                }}
              >
                <option value="all">{t('filter_status_all')}</option>
                <option value="on_time">{t('filter_status_ontime')}</option>
                <option value="late">{t('filter_status_late')}</option>
                <option value="unknown_card">Kartu Tak Dikenal</option>
              </select>
              <Filter className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-pine-deep" />
            </div>

            <button
              className="flex h-11 items-center gap-2 rounded-xl bg-pine-deep px-4 text-sm font-semibold text-on-primary shadow-xs transition-all hover:bg-pine-hover"
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
          {props.isTapsLoading && props.logs.length === 0 && (
            <p className="py-6 text-center font-caption text-xs text-text-muted">
              Memuat tap perangkat hari ini...
            </p>
          )}
          {!props.isTapsLoading && props.logs.length === 0 && (
            <p className="py-6 text-center font-caption text-xs text-text-muted">
              Belum ada tap hari ini pada filter ini.
            </p>
          )}

          {props.logs.map((item) => {
            const isLate = item.status === 'late';
            const isUnknown = item.status === 'unknown_card';

            return (
              <div
                key={item.id}
                className={`flex flex-col justify-between gap-4 rounded-xl p-4 transition-all md:flex-row md:items-center ${ROW_CLASSES[item.status]}`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-pine-deep shadow-xs">
                    {item.photoUrl === undefined ? (
                      <span className="flex size-full items-center justify-center text-sm font-black text-white">
                        {isUnknown ? '?' : initialsOf(item.studentName)}
                      </span>
                    ) : (
                      <Image
                        alt={item.studentName}
                        className="size-full object-cover"
                        fill
                        src={item.photoUrl}
                      />
                    )}
                    {isLate && (
                      <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-error font-caption text-[10px] font-bold text-on-primary">
                        !
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-text-primary">
                        {item.studentName}
                      </span>
                      {item.className !== '' && (
                        <span className="rounded-full bg-surface-card px-2 py-0.5 font-caption text-[11px] font-semibold text-text-primary">
                          {item.className}
                        </span>
                      )}
                      <span className="font-caption text-xs text-text-muted">
                        {isUnknown ? `Kartu: ${item.cardUid ?? '—'}` : `NIS: ${item.nis}`}
                      </span>
                      {item.origin === 'manual' && (
                        <span className="rounded-full border border-border-control bg-surface-card px-2 py-0.5 text-[10px] font-bold text-text-muted">
                          Manual
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 font-caption text-xs">
                      {isLate ? (
                        <>
                          <span className="inline-flex items-center gap-1 font-semibold text-error">
                            <Clock className="size-3.5" />
                            Tap: {item.tapTime} (+{item.delayMinutes} mnt)
                          </span>
                          <span>•</span>
                          <span className="rounded-md bg-error/10 px-2 py-0.5 font-semibold text-error">
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
                          {!isUnknown && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-text-primary">
                                {item.isUniformComplete
                                  ? t('tag_uniform_complete')
                                  : t('tag_uniform_issue')}
                              </span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 self-end md:self-center">
                  {isLate && (
                    <>
                      <span className="inline-flex items-center gap-1 rounded-full bg-status-absent/60 px-2.5 py-1 font-caption text-xs font-bold text-error">
                        {t('tag_late')}
                      </span>
                      <button
                        className="flex items-center gap-1.5 rounded-xl bg-error px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-red-700"
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
                  )}
                  {isUnknown && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-800">
                      <AlertCircle className="size-3.5" />
                      Kartu Tak Dikenal
                    </span>
                  )}
                  {!isLate && !isUnknown && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-status-present px-3 py-1.5 font-caption text-xs font-bold text-pine-deep">
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
        <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-4 font-caption text-xs text-text-muted">
          <span>{t('stream_showing', { count: props.logs.length, total: props.totalCount })}</span>
          <span className="flex items-center gap-1 font-semibold text-pine-deep">
            {t('btn_view_all_logs')} <ChevronRight className="size-4" />
          </span>
        </div>
      </div>
    </div>
  );
}
