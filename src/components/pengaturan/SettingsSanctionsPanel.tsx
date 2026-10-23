import { ArrowUpRight, Scale } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SEVERITY_STYLES } from '@/components/tatib/severityStyles';
import { getRuleSeverity, mockSanctionTiers, mockTatibRules } from '@/data/mockTatib';
import { Link } from '@/libs/I18nNavigation';

/**
 * Read-only summary of sanction thresholds and rule weights owned by the conduct catalog.
 *
 * @returns Sanction summary section.
 */
export function SettingsSanctionsPanel() {
  const t = useTranslations('SettingsPage');
  const tTatib = useTranslations('TatibPage');

  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-sm font-bold text-pine-deep sm:text-base">{t('sanction_title')}</h2>
          <p className="text-xs text-muted-foreground">{t('sanction_subtitle')}</p>
        </div>
        <Link
          href="/dashboard/aturan"
          className="inline-flex items-center gap-1.5 rounded-xl border border-border-control bg-card px-3 py-2 text-xs font-semibold text-pine-deep transition-colors hover:bg-pine-light"
        >
          <Scale className="size-3.5" />
          <span>{t('btn_open_catalog')}</span>
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {mockSanctionTiers.slice(0, 3).map((tier, index) => (
          <div
            key={tier.id}
            className={`flex flex-col gap-2 rounded-2xl border p-4 shadow-xs ${
              index === 2 ? 'border-rose-200 bg-rose-50' : 'border-border-control bg-card'
            }`}
          >
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              {t('sanction_level', { level: index + 1 })}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-pine-deep">{tier.threshold}</span>
              <span className="text-[11px] text-muted-foreground">{t('unit_points')}</span>
            </div>
            <span className="text-xs font-bold text-pine-deep">{tier.label}</span>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {t(tier.descriptionKey)}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-control bg-card shadow-xs">
        <div className="border-b border-border-subtle bg-surface-container-low px-4 py-3">
          <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            {t('catalog_summary_title')}
          </h3>
        </div>
        <ul className="divide-y divide-border-subtle">
          {mockTatibRules.slice(0, 5).map((rule) => {
            const severity = getRuleSeverity(rule.points);
            return (
              <li key={rule.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-foreground">{rule.title}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{rule.code}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${SEVERITY_STYLES[severity].badge}`}
                  >
                    {tTatib(`severity_${severity}`)}
                  </span>
                  <span className="text-xs font-extrabold text-pine-deep">+{rule.points}</span>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-border-subtle px-4 py-2.5 text-[11px] text-muted-foreground">
          {t('catalog_summary_footer', { count: mockTatibRules.length })}
        </div>
      </div>
    </section>
  );
}
