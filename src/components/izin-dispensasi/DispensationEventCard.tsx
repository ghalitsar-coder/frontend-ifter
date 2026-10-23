import { Building2, CalendarCheck2, CalendarDays, MapPin, Timer, Trophy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { countInclusiveDays, getCoveredLessonHours } from '@/data/mockDispensation';
import type { DispensationCoverage, DispensationEvent } from '@/types/dispensation';

/**
 * Event details, duration recap, and session coverage selection.
 *
 * @param props - Event data, active coverage, and change handler.
 * @returns Event detail card.
 */
export function DispensationEventCard(props: {
  event: DispensationEvent;
  coverage: DispensationCoverage;
  onCoverageChange: (coverage: DispensationCoverage) => void;
}) {
  const t = useTranslations('DispensationPage');
  const days = countInclusiveDays(props.event.startIso, props.event.endIso);
  const hours = getCoveredLessonHours(days, props.coverage);

  const rows = [
    { icon: Trophy, label: t('event_name_label'), value: props.event.competition },
    { icon: Building2, label: t('event_organizer_label'), value: props.event.organizer },
    { icon: MapPin, label: t('event_location_label'), value: props.event.location },
    { icon: CalendarDays, label: t('event_start_label'), value: props.event.startLabel },
    { icon: CalendarCheck2, label: t('event_end_label'), value: props.event.endLabel },
  ];

  const coverageOptions: DispensationCoverage[] = ['full', 'partial'];

  return (
    <section className="rounded-2xl border border-border-subtle bg-card p-4 shadow-xs sm:p-5">
      <h2 className="text-sm font-extrabold tracking-tight text-foreground">{t('event_title')}</h2>

      <dl className="mt-3 space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-2">
            <row.icon className="mt-0.5 size-3.5 shrink-0 text-pine-deep" />
            <dt className="w-36 shrink-0 text-[10px] text-muted-foreground sm:w-44">{row.label}</dt>
            <dd className="min-w-0 flex-1 text-[11px] font-semibold text-foreground">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-gold/40 bg-amber-surface px-3 py-2">
        <Timer className="mt-0.5 size-3.5 shrink-0 text-amber-dark" />
        <p className="text-[10px] leading-relaxed text-amber-dark">
          <span className="font-bold">{t('duration_label')}</span>{' '}
          {t('duration_note', { days, hours })}
        </p>
      </div>

      <p className="mt-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
        {t('coverage_title')}
      </p>
      <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {coverageOptions.map((coverage) => {
          const isSelected = props.coverage === coverage;

          return (
            <button
              key={coverage}
              type="button"
              onClick={() => {
                props.onCoverageChange(coverage);
              }}
              aria-pressed={isSelected}
              className={`cursor-pointer rounded-xl border p-3 text-left transition-colors ${
                isSelected
                  ? 'border-pine-deep bg-pine-light ring-1 ring-pine-deep/20'
                  : 'border-border-subtle bg-card hover:border-border-control'
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-foreground">
                  {t(`coverage_${coverage}_title`)}
                </span>
                <span
                  className={`flex size-3.5 shrink-0 items-center justify-center rounded-full border ${
                    isSelected ? 'border-pine-deep bg-pine-deep' : 'border-border-control'
                  }`}
                >
                  {isSelected && <span className="size-1.5 rounded-full bg-white" />}
                </span>
              </span>
              <span className="mt-1 block text-[10px] leading-relaxed text-muted-foreground">
                {t(`coverage_${coverage}_desc`)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
