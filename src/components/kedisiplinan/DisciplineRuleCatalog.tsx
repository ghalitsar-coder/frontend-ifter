import { Info, Scale } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { mockDisciplineRules } from '@/data/mockDiscipline';
import type { ViolationTypeRecord } from '@/services/disciplineApi';

function getPointBadgeClass(points: number): string {
  if (points >= 25) {
    return 'bg-red-700 text-white';
  }
  if (points >= 10) {
    return 'bg-error-container text-red-700 border border-red-200';
  }
  if (points >= 5) {
    return 'bg-amber-surface text-amber-dark border border-amber-gold/40';
  }
  return 'bg-surface-card text-pine-deep border border-border-subtle';
}

/**
 * Preview strip of point weight rules and threshold limits from handbook.
 *
 * @param props - Component properties.
 * @returns Rendered rule and point catalog strip.
 */
export function DisciplineRuleCatalog(props: { violationTypes?: ViolationTypeRecord[] }) {
  const t = useTranslations('DisciplinePage');
  const activeTypes = (props.violationTypes ?? []).filter((vt) => vt.is_active).slice(0, 5);

  const items =
    activeTypes.length > 0
      ? activeTypes.map((vt) => ({
          id: String(vt.id),
          code: vt.kode,
          title: vt.nama,
          subtitle: vt.kategori.toUpperCase(),
          points: vt.poin_default,
          badgeClass: getPointBadgeClass(vt.poin_default),
        }))
      : mockDisciplineRules.map((rule) => ({
          id: rule.code,
          code: rule.code,
          title: rule.title,
          subtitle: rule.subtitle,
          points: rule.points,
          badgeClass: rule.badgeClass,
        }));

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

      <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2 md:grid-cols-5">
        {items.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface-container-low p-2.5 transition-colors hover:border-pine-light"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-pine-deep/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-pine-deep">
                  {rule.code}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {rule.subtitle}
                </span>
              </div>
              <p className="mt-1 truncate text-xs font-semibold text-foreground">{rule.title}</p>
            </div>
            <span
              className={`shrink-0 rounded-lg px-2 py-0.5 text-xs font-bold shadow-2xs ${rule.badgeClass}`}
            >
              +{rule.points}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
