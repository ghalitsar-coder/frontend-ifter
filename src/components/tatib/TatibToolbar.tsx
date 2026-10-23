import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SEVERITY_STYLES } from '@/components/tatib/severityStyles';
import type { RuleSeverity, SeverityFilter } from '@/types/tatib';

const SEVERITY_ORDER: RuleSeverity[] = ['ringan', 'sedang', 'berat', 'kritis'];

/**
 * Search field and severity filter pills for the conduct rule catalog.
 *
 * @param props - Component properties.
 * @returns Toolbar JSX element.
 */
export function TatibToolbar(props: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSeverity: SeverityFilter;
  onSeverityChange: (severity: SeverityFilter) => void;
  totalCount: number;
  severityCounts: Record<RuleSeverity, number>;
}) {
  const t = useTranslations('TatibPage');

  return (
    <div className="mb-4 flex flex-col gap-3 border-b border-border-subtle pb-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex scrollbar-none items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
        <button
          type="button"
          onClick={() => {
            props.onSeverityChange('all');
          }}
          className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
            props.selectedSeverity === 'all'
              ? 'bg-pine-deep text-white'
              : 'border border-border-control bg-card text-muted-foreground hover:bg-pine-light hover:text-pine-deep'
          }`}
        >
          {t('filter_all', { count: props.totalCount })}
        </button>

        {SEVERITY_ORDER.map((severity) => (
          <button
            key={severity}
            type="button"
            onClick={() => {
              props.onSeverityChange(severity);
            }}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              props.selectedSeverity === severity
                ? 'bg-pine-deep text-white'
                : 'border border-border-control bg-card text-muted-foreground hover:bg-pine-light hover:text-pine-deep'
            }`}
          >
            <span className={`size-2 rounded-full ${SEVERITY_STYLES[severity].dot}`} />
            <span>
              {t(`severity_${severity}`)} ({props.severityCounts[severity]})
            </span>
          </button>
        ))}
      </div>

      <div className="relative w-full lg:w-80">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={props.searchQuery}
          onChange={(e) => {
            props.onSearchChange(e.target.value);
          }}
          placeholder={t('search_placeholder')}
          className="h-10 w-full rounded-xl border border-border-control bg-card pr-10 pl-10 text-xs text-foreground transition-all focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
        />
        {props.searchQuery && (
          <button
            type="button"
            onClick={() => {
              props.onSearchChange('');
            }}
            className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer p-1 text-muted-foreground hover:text-foreground"
            aria-label={t('btn_clear_search')}
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
