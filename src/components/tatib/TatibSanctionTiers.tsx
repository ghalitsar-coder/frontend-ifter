import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { SanctionTier } from '@/types/tatib';

/**
 * Escalation ladder of point thresholds and their sanction consequences.
 *
 * @param props - Component properties.
 * @returns Sanction tier grid.
 */
export function TatibSanctionTiers(props: { tiers: SanctionTier[] }) {
  const t = useTranslations('TatibPage');

  return (
    <section className="mb-6 space-y-3">
      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
        <h2 className="text-sm font-bold tracking-tight text-pine-deep sm:text-base">
          {t('tiers_title')}
        </h2>
        <span className="text-xs text-muted-foreground">{t('tiers_subtitle')}</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {props.tiers.map((tier, index) => (
          <div
            key={tier.id}
            className={`flex flex-col justify-between gap-3 rounded-2xl border p-4 shadow-xs ${
              index === props.tiers.length - 1
                ? 'border-red-300 bg-red-50'
                : 'border-border-control bg-card'
            }`}
          >
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded-lg bg-pine-deep px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
                  {tier.label}
                </span>
                <span className="text-[11px] font-bold text-pine-deep">
                  ≥ {tier.threshold} {t('unit_points')}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t(tier.descriptionKey)}
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-pine-deep">
              <span>{index === 0 ? t('tier_start') : t('tier_next')}</span>
              <ArrowRight className="size-3" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
