import { CalendarClock, TrendingUp, Trophy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { TeacherDuty, TeacherPerformance } from '@/types/teacherPresence';

/**
 * Monthly presence performance card and today's additional duty.
 *
 * @param props - Performance metrics and duty assignment.
 * @returns Performance column.
 */
export function TeacherPerformanceCard(props: {
  performance: TeacherPerformance;
  duty: TeacherDuty;
}) {
  const t = useTranslations('TeacherPresencePage');

  return (
    <div className="space-y-3">
      <section className="relative overflow-hidden rounded-2xl bg-pine-deep p-5 text-white shadow-md">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-emerald-100/80 uppercase">
              {t('performance_eyebrow')}
            </p>
            <p className="mt-0.5 text-sm font-semibold">{props.performance.month}</p>
          </div>
          <div className="flex size-8 items-center justify-center rounded-full bg-white/10 text-amber-gold">
            <TrendingUp className="size-4" />
          </div>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-extrabold tracking-tight text-amber-gold">
              {props.performance.rate}%
            </p>
            <p className="text-[11px] text-emerald-100/80">{t('performance_rate_label')}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {props.performance.presentDays} / {props.performance.workingDays}
              <span className="ml-1 text-[11px] font-medium text-emerald-100/80">
                {t('performance_days_unit')}
              </span>
            </p>
            <p className="text-[11px] text-emerald-100/80">{t('performance_days_label')}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-[11px]">
          <span className="text-emerald-100/80">
            {t('performance_permit')}{' '}
            <span className="font-bold text-white">
              {props.performance.permitDays} {t('performance_days_unit')}
            </span>
          </span>
          <span className="text-emerald-100/80">
            {t('performance_target')}{' '}
            <span className="font-bold text-white">
              {props.performance.achievedHours}/{props.performance.targetHours} JP
            </span>
          </span>
        </div>
      </section>

      <section className="flex items-start gap-3 rounded-2xl border border-amber-gold/40 bg-amber-surface p-4 shadow-xs">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-gold/30 text-amber-dark">
          <CalendarClock className="size-4" />
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-wider text-amber-dark uppercase">
            {t('duty_title')}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed font-medium text-foreground">
            {props.duty.title}
          </p>
        </div>
      </section>

      <p className="flex items-center justify-end gap-1.5 px-1 text-[10px] text-muted-foreground">
        <Trophy className="size-3 text-amber-dark" />
        {t('performance_footer')}
      </p>
    </div>
  );
}
