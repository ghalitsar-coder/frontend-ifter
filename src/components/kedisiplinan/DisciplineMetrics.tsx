import { AlertCircle, Award, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Bento summary metric cards showing key discipline indicators.
 *
 * @param props - Component properties.
 * @returns Rendered discipline metric cards.
 */
export function DisciplineMetrics(props: {
  totalIncidents?: number;
  accumulatedPoints?: number;
  needActionCount?: number;
  resolvedCount?: number;
}) {
  const t = useTranslations('DisciplinePage');

  const total = props.totalIncidents ?? 42;
  const points = props.accumulatedPoints ?? 186;
  const needAction = props.needActionCount ?? 7;
  const resolved = props.resolvedCount ?? 35;

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: Total Bulan Ini */}
      <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-pine-light">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('metric_total_title')}
            </span>
            <div className="text-3xl font-black tracking-tight text-foreground">
              {total}{' '}
              <span className="text-base font-semibold text-muted-foreground">
                {t('metric_total_unit')}
              </span>
            </div>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-pine-light text-pine-deep">
            <AlertCircle className="size-5" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3 text-xs">
          <span className="inline-flex items-center font-semibold text-red-600">
            <TrendingUp className="mr-0.5 size-3.5" />
            {t('metric_total_trend')}
          </span>
          <span className="text-muted-foreground">{t('metric_total_period')}</span>
        </div>
      </div>

      {/* Card 2: Poin Terakumulasi */}
      <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-amber-gold/50">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('metric_points_title')}
            </span>
            <div className="text-3xl font-black tracking-tight text-foreground">
              {points}{' '}
              <span className="text-base font-semibold text-muted-foreground">
                {t('metric_points_unit')}
              </span>
            </div>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl border border-amber-gold/30 bg-amber-surface text-amber-dark">
            <Award className="size-5" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3 text-xs">
          <span className="inline-flex items-center rounded-md border border-amber-gold/30 bg-amber-surface px-2 py-0.5 font-semibold text-amber-dark">
            {t('metric_points_sub')}
          </span>
          <span className="text-muted-foreground">{t('metric_points_scope')}</span>
        </div>
      </div>

      {/* Card 3: Perlu Tindak Lanjut */}
      <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-yellow-200">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('metric_followup_title')}
            </span>
            <div className="text-3xl font-black tracking-tight text-pine-deep">
              {needAction}{' '}
              <span className="text-base font-semibold text-muted-foreground">
                {t('metric_followup_unit')}
              </span>
            </div>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-800">
            <Clock className="size-5" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3 text-xs">
          <span className="font-medium text-foreground">{t('metric_followup_review')}</span>
          <span className="inline-flex items-center font-bold text-pine-deep">
            {t('metric_followup_counselor')}
          </span>
        </div>
      </div>

      {/* Card 4: Sanksi Tuntas */}
      <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-pine-light">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('metric_resolved_title')}
            </span>
            <div className="text-3xl font-black tracking-tight text-foreground">
              {resolved}{' '}
              <span className="text-base font-semibold text-muted-foreground">
                {t('metric_resolved_unit')}
              </span>
            </div>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-pastel-mint text-pine-deep">
            <CheckCircle2 className="size-5" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3 text-xs">
          <span className="inline-flex items-center font-semibold text-pine-deep">
            <CheckCircle2 className="mr-1 size-3.5" />
            {t('metric_resolved_rate')}
          </span>
          <span className="text-muted-foreground">{t('metric_resolved_status')}</span>
        </div>
      </div>
    </section>
  );
}
