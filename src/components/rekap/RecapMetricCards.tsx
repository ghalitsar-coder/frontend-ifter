export type RecapMetric = {
  label: string;
  value: string;
  accent: 'blue' | 'green' | 'orange' | 'amber';
};

const ACCENTS: Record<RecapMetric['accent'], string> = {
  amber: '#f5b82e',
  blue: '#3b82f6',
  green: '#2fa36b',
  orange: '#f05a35',
};

function MetricCard(props: RecapMetric) {
  return (
    <div
      className="flex min-h-20 flex-col justify-center gap-1 rounded-xl border border-stone-200 bg-white px-5 py-3"
      style={{ borderLeftWidth: '4px', borderLeftColor: ACCENTS[props.accent] }}
    >
      <span className="truncate text-2xl font-bold text-pine-deep">{props.value}</span>
      <span className="text-sm text-text-muted">{props.label}</span>
    </div>
  );
}

export function RecapMetricCards(props: { metrics: RecapMetric[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {props.metrics.map((metric) => (
        <MetricCard {...metric} key={metric.label} />
      ))}
    </div>
  );
}
