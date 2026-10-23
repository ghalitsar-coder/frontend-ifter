import { BookX, PencilLine } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getRuleSeverity } from '@/data/mockTatib';
import type { TatibRule } from '@/types/tatib';
import { SEVERITY_STYLES } from './severityStyles';

/**
 * Catalog table of conduct articles with weight, procedure, and status.
 *
 * @param props - Component properties.
 * @returns Table JSX element.
 */
export function TatibTable(props: { rules: TatibRule[]; onEditRule: (rule: TatibRule) => void }) {
  const t = useTranslations('TatibPage');

  if (props.rules.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border-control bg-card p-12 text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-surface-container-low text-muted-foreground">
          <BookX className="size-6" />
        </div>
        <h3 className="mb-1 text-base font-bold text-pine-deep">{t('empty_title')}</h3>
        <p className="mx-auto max-w-sm text-xs text-muted-foreground">{t('empty_desc')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border-control bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-container-low text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              <th className="px-4 py-3.5 sm:px-6">{t('th_code')}</th>
              <th className="px-4 py-3.5">{t('th_violation')}</th>
              <th className="px-4 py-3.5">{t('th_severity')}</th>
              <th className="px-4 py-3.5">{t('th_points')}</th>
              <th className="px-4 py-3.5">{t('th_procedure')}</th>
              <th className="px-4 py-3.5">{t('th_status')}</th>
              <th className="px-4 py-3.5 text-right sm:px-6">{t('th_actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {props.rules.map((rule) => {
              const severity = getRuleSeverity(rule.points);

              return (
                <tr key={rule.id} className="group transition-colors hover:bg-hover-row">
                  <td className="px-4 py-4 align-top sm:px-6">
                    <span className="font-mono text-[11px] font-bold text-pine-deep">
                      {rule.code}
                    </span>
                  </td>

                  <td className="max-w-xs px-4 py-4 align-top">
                    <p className="leading-tight font-bold text-foreground">{rule.title}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      {rule.detail}
                    </p>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${SEVERITY_STYLES[severity].badge}`}
                    >
                      <span className={`size-1.5 rounded-full ${SEVERITY_STYLES[severity].dot}`} />
                      {t(`severity_${severity}`)}
                    </span>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <span className="text-sm font-extrabold whitespace-nowrap text-pine-deep">
                      +{rule.points}
                    </span>
                    <span className="ml-1 text-[11px] text-muted-foreground">{t('unit_poin')}</span>
                  </td>

                  <td className="max-w-sm px-4 py-4 align-top text-[11px] leading-relaxed text-muted-foreground">
                    <p>{rule.procedure}</p>
                    <p className="mt-1 font-semibold text-pine-deep">{rule.authority}</p>
                  </td>

                  <td className="px-4 py-4 align-top">
                    {rule.isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                        <span className="size-1.5 rounded-full bg-emerald-600" />
                        {t('status_active')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                        <span className="size-1.5 rounded-full bg-muted-foreground" />
                        {t('status_inactive')}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-right align-top sm:px-6">
                    <button
                      type="button"
                      onClick={() => {
                        props.onEditRule(rule);
                      }}
                      className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-pine-light hover:text-pine-deep"
                      title={t('btn_edit_rule')}
                      aria-label={t('btn_edit_rule')}
                    >
                      <PencilLine className="size-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border-subtle px-4 py-3 text-[11px] text-muted-foreground sm:px-6">
        <span>{t('showing_label', { count: props.rules.length })}</span>
        <span className="font-semibold text-pine-deep">{t('footer_note')}</span>
      </div>
    </div>
  );
}
