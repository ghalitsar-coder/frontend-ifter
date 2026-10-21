import { AlertTriangle, Clock, RefreshCw, Shirt, UserCheck, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { PiketMetrics as PiketMetricsType } from '@/types/piket';

/**
 * 5 Telemetry Tally Counters for Gate Arrival & RFID monitoring.
 * @param props - Component properties.
 * @returns Rendered PiketMetrics component.
 */
export function PiketMetrics(props: { metrics: PiketMetricsType }) {
  const t = useTranslations('PiketPage');

  const presentPercent = Math.round(
    (props.metrics.totalPresent / props.metrics.totalEnrolled) * 100,
  );
  const onTimePercent = Math.round((props.metrics.onTimeCount / props.metrics.totalPresent) * 100);
  const remainingCount = props.metrics.totalEnrolled - props.metrics.totalPresent;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {/* Stat 1: Total Present */}
      <div className="bg-surface-card relative overflow-hidden rounded-2xl p-5 shadow-xs transition-shadow hover:shadow-md">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-caption text-text-muted text-xs uppercase">
            {t('card_total_title')}
          </span>
          <span className="flex size-8 items-center justify-center rounded-lg bg-pine-light text-pine-deep">
            <Users className="size-4.5" />
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-text-primary text-2xl font-bold">{props.metrics.totalPresent}</span>
          <span className="font-caption text-text-muted text-xs">
            / {t('card_total_enrolled', { total: props.metrics.totalEnrolled })}
          </span>
        </div>
        <div className="font-caption mt-3 flex items-center justify-between text-xs">
          <span className="font-semibold text-pine-deep">
            {t('card_total_sub', { rate: presentPercent })}
          </span>
          <span className="text-text-muted">
            {t('card_total_remaining', { count: remainingCount })}
          </span>
        </div>
        <div className="bg-canvas-base mt-2 h-1.5 w-full overflow-hidden rounded-full">
          <div
            className="h-1.5 rounded-full bg-pine-deep transition-all duration-300"
            style={{ width: `${presentPercent}%` }}
          />
        </div>
      </div>

      {/* Stat 2: On Time */}
      <div className="bg-surface-card rounded-2xl p-5 shadow-xs transition-shadow hover:shadow-md">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-caption text-text-muted text-xs uppercase">
            {t('card_ontime_title')}
          </span>
          <span className="bg-status-present/50 flex size-8 items-center justify-center rounded-lg text-pine-deep">
            <UserCheck className="size-4.5" />
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-pine-deep">{props.metrics.onTimeCount}</span>
          <span className="font-caption text-text-muted text-xs">{t('card_ontime_threshold')}</span>
        </div>
        <p className="font-caption text-text-muted mt-3 flex items-center gap-1 text-xs">
          <span className="font-semibold text-pine-deep">
            {t('card_ontime_sub', { rate: onTimePercent })}
          </span>
        </p>
        <div className="bg-canvas-base mt-2 h-1.5 w-full overflow-hidden rounded-full">
          <div
            className="h-1.5 rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${onTimePercent}%` }}
          />
        </div>
      </div>

      {/* Stat 3: Late Arrivals */}
      <div className="bg-surface-card rounded-2xl p-5 shadow-xs transition-shadow hover:shadow-md">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-caption text-text-muted text-xs uppercase">
            {t('card_late_title')}
          </span>
          <span className="bg-status-absent/50 text-error flex size-8 items-center justify-center rounded-lg">
            <Clock className="size-4.5" />
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-error text-2xl font-bold">{props.metrics.lateCount}</span>
          <span className="font-caption text-text-muted text-xs">{t('card_late_threshold')}</span>
        </div>
        <p className="font-caption text-error mt-3 flex items-center gap-1 text-xs font-medium">
          <AlertTriangle className="size-3.5" />
          <span>{t('card_late_sub')}</span>
        </p>
        <div className="bg-canvas-base mt-2 h-1.5 w-full overflow-hidden rounded-full">
          <div
            className="bg-error h-1.5 rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, (props.metrics.lateCount / 30) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Stat 4: Uniform Hold */}
      <div className="bg-surface-card rounded-2xl p-5 shadow-xs transition-shadow hover:shadow-md">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-caption text-text-muted text-xs uppercase">
            {t('card_uniform_title')}
          </span>
          <span className="flex size-8 items-center justify-center rounded-lg bg-amber-surface text-amber-dark">
            <Shirt className="size-4.5" />
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-dark">
            {props.metrics.uniformHoldCount}
          </span>
          <span className="font-caption text-text-muted text-xs">{t('card_uniform_unit')}</span>
        </div>
        <p className="font-caption mt-3 text-xs text-amber-dark">{t('card_uniform_sub')}</p>
        <div className="bg-canvas-base mt-2 h-1.5 w-full overflow-hidden rounded-full">
          <div
            className="h-1.5 rounded-full bg-amber-gold transition-all duration-300"
            style={{
              width: `${Math.min(100, (props.metrics.uniformHoldCount / 15) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Stat 5: Gate Readers Telemetry */}
      <div className="flex flex-col justify-between rounded-2xl bg-pine-deep/5 p-5 shadow-xs transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="font-caption text-xs font-bold text-pine-deep uppercase">
            {t('card_readers_title')}
          </span>
          <span className="size-2.5 animate-pulse rounded-full bg-pine-deep" />
        </div>
        <div>
          <div className="text-2xl font-bold text-pine-deep">
            {t('card_readers_count', { count: props.metrics.activeReadersCount })}
          </div>
          <div className="font-caption text-text-muted mt-0.5 text-xs">
            {t('card_readers_status')}
          </div>
        </div>
        <div className="font-caption flex items-center gap-2 pt-2 text-[11px] font-semibold text-pine-deep">
          <RefreshCw className="size-3.5" />
          <span>{t('card_readers_latency', { latency: props.metrics.readerLatencySec })}</span>
        </div>
      </div>
    </div>
  );
}
