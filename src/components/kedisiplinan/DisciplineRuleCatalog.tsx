import { Info, Scale } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { DisciplineCategory } from '@/lib/api/dto';
import { useDisciplineCategories } from '@/lib/api/queries';

/**
 * Badge styling for a category card depending on its default point weight.
 *
 * @param points - Category default points.
 * @returns CSS class string.
 */
function ruleBadgeClass(points: number): string {
  if (points >= 50) {
    return 'bg-red-700 text-white';
  }
  if (points >= 25) {
    return 'bg-error-container text-red-700 border border-red-200';
  }
  if (points >= 5) {
    return 'bg-amber-surface text-amber-dark border border-amber-gold/40';
  }
  return 'bg-surface-card text-pine-deep border border-border-subtle';
}

/**
 * Map one backend discipline category to the catalog card shape.
 * The backend has no separate subtitle field, so the description is used.
 *
 * @param category - Active discipline category.
 * @returns Renderable catalog rule.
 */
function toCatalogRule(category: DisciplineCategory) {
  return {
    key: category.id,
    title: category.name,
    subtitle: category.description ?? '',
    points: category.default_points ?? 0,
    badgeClass: ruleBadgeClass(category.default_points ?? 0),
  };
}

/**
 * Preview strip of point weight rules and threshold limits from handbook.
 *
 * @returns Rendered rule and point catalog strip.
 */
export function DisciplineRuleCatalog() {
  const t = useTranslations('DisciplinePage');

  const categories = useDisciplineCategories();
  const rules = (categories.data ?? []).map(toCatalogRule);

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-xs">
      <div className="flex flex-col justify-between gap-2 border-b border-border pb-3 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <Scale className="size-4.5 text-pine-deep" />
          <span className="text-xs font-bold tracking-wider text-foreground uppercase">
            {t('catalog_title')}
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-container-low px-3 py-1 text-xs text-muted-foreground">
          <Info className="size-3.5 text-amber-dark" />
          <span>{t('catalog_thresholds')}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1 md:grid-cols-5">
        {rules.map((rule) => (
          <div
            key={rule.key}
            className="flex items-center justify-between rounded-xl border border-border bg-surface-container-low p-2.5 transition-colors hover:border-pine-light"
          >
            <div>
              <p className="text-xs font-semibold text-foreground">{rule.title}</p>
              <p className="text-[11px] text-muted-foreground">{rule.subtitle}</p>
            </div>
            <span
              className={`rounded-lg px-2 py-0.5 text-xs font-bold shadow-2xs ${rule.badgeClass}`}
            >
              +{rule.points} Poin
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
