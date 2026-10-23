import { CheckCheck, Clock3, FileClock, Lock, ShieldCheck, TrendingDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CorrectionStats } from '@/types/attendanceCorrection';

/**
 * Monthly correction counters and reconciliation accuracy cards.
 *
 * @param props - Monthly stats.
 * @returns Statistics row.
 */
export function CorrectionStats(props: { stats: CorrectionStats }) {
  const t = useTranslations('AttendanceCorrectionPage');

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-2xl border border-border-subtle bg-card p-4 shadow-xs sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            {t('stat_total')}
          </h2>
          <span className="flex size-8 items-center justify-center rounded-full bg-surface-container-low text-muted-foreground">
            <FileClock className="size-4" />
          </span>
        </div>
        <p className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
          {props.stats.totalRequests}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {t('stat_total_label', { month: props.stats.month })}
        </p>
        <p className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <TrendingDown className="size-3.5 text-pine-deep" />
          <span className="font-bold text-pine-deep">{props.stats.deltaPercent}%</span>
          {t('stat_total_delta', {
            month: t('stat_prev_month'),
            count: props.stats.previousMonthTotal,
          })}
        </p>
      </article>

      <article className="rounded-2xl border border-border-subtle bg-card p-4 shadow-xs sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            {t('stat_approved')}
          </h2>
          <span className="flex size-8 items-center justify-center rounded-full bg-pine-light text-pine-deep">
            <CheckCheck className="size-4" />
          </span>
        </div>
        <p className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
          {props.stats.approved}
        </p>
        <p className="text-[11px] text-muted-foreground">{t('stat_approved_label')}</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container-low">
            <div
              className="h-full rounded-full bg-pine-deep"
              style={{ width: `${props.stats.approvedPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-foreground">
            {props.stats.approvedPercent}%
          </span>
        </div>
      </article>

      <article className="rounded-2xl border border-border-subtle bg-card p-4 shadow-xs sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            {t('stat_pending')}
          </h2>
          <span className="flex size-8 items-center justify-center rounded-full bg-amber-surface text-amber-dark">
            <Clock3 className="size-4" />
          </span>
        </div>
        <p className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
          {props.stats.pending}
        </p>
        <p className="text-[11px] text-muted-foreground">{t('stat_pending_label')}</p>
        <p className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-amber-dark">
          <span className="size-1.5 rounded-full bg-amber-gold" />
          {t('stat_pending_deadline', { time: props.stats.pendingDeadline })}
        </p>
      </article>

      <article className="rounded-2xl bg-pine-deep p-4 text-white shadow-md sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="max-w-[9rem] text-[10px] font-bold tracking-wider text-emerald-100/80 uppercase">
            {t('stat_accuracy')}
          </h2>
          <span className="flex size-8 items-center justify-center rounded-full bg-white/10 text-amber-gold">
            <ShieldCheck className="size-4" />
          </span>
        </div>
        <p className="mt-1 text-3xl font-extrabold tracking-tight text-amber-gold">
          {props.stats.accuracy}
          <span className="text-lg">%</span>
        </p>
        <p className="text-[11px] text-emerald-100/80">{t('stat_accuracy_label')}</p>
        <p className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-100/80">
          <Lock className="size-3 text-amber-gold" />
          {t('stat_accuracy_footer')}
          <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 font-bold text-white">
            {t('stat_accuracy_chip')}
          </span>
        </p>
      </article>
    </div>
  );
}
