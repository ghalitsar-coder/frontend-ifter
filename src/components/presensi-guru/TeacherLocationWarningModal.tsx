import {
  Briefcase,
  ClipboardPlus,
  MapPin,
  Navigation,
  RefreshCcw,
  Ruler,
  School,
  ShieldCheck,
  TriangleAlert,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Geofence rejection modal with distance diagnostics and recovery actions.
 *
 * @param props - GPS diagnostics and recovery handlers.
 * @returns Out-of-radius warning modal.
 */
export function TeacherLocationWarningModal(props: {
  distanceMeters: number;
  radiusMeters: number;
  accuracyMeters: number;
  latitude: number;
  longitude: number;
  schoolName: string;
  onClose: () => void;
  onRecalibrate: () => void;
  onRetry: () => void;
  onRequestDuty: () => void;
}) {
  const t = useTranslations('TeacherPresencePage');
  const overshoot = props.distanceMeters - props.radiusMeters;

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is already scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-location-warning-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-3 backdrop-blur-sm sm:p-6"
    >
      <div className="relative my-4 w-full max-w-2xl overflow-hidden rounded-3xl border border-border-subtle bg-card shadow-2xl sm:my-8">
        <button
          type="button"
          onClick={props.onClose}
          className="absolute top-5 right-4 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full bg-surface-container-low text-muted-foreground transition-colors hover:bg-pine-light hover:text-pine-deep"
          aria-label={t('btn_close')}
        >
          <X className="size-4" />
        </button>

        <div className="px-5 pt-7 pb-5 sm:px-8">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-red-600">
              <TriangleAlert className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-red-600 uppercase">
                {t('warning_eyebrow')}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {t('warning_timestamp', { date: 'Senin, 05 Okt 2026', time: '06:49:12' })}
              </p>
            </div>
          </div>

          <h2
            id="teacher-location-warning-title"
            className="mt-4 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl"
          >
            {t('warning_title')}
          </h2>
          <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {t('warning_description', { school: props.schoolName })}
          </p>

          <div className="relative mt-5 h-44 overflow-hidden rounded-2xl border border-border-subtle bg-[#eceeed]">
            <div
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(23,63,54,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(23,63,54,0.06) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
              }}
            />
            <div className="absolute top-1/2 left-[38%] size-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-pine-deep/15" />
            <div className="absolute top-1/2 left-[38%] size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-pine-deep/40" />

            <div className="absolute top-1/2 left-[38%] z-10 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-pine-deep text-amber-gold shadow-lg ring-4 ring-pine-deep/10">
              <School className="size-5" />
            </div>

            <div className="absolute top-[30%] left-[74%] z-10 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 text-white shadow-lg ring-4 ring-red-600/15">
              <MapPin className="size-5" />
            </div>

            <svg
              aria-hidden="true"
              className="absolute inset-0 z-0 size-full"
              viewBox="0 0 560 176"
              preserveAspectRatio="none"
            >
              <line
                x1="213"
                y1="88"
                x2="414"
                y2="53"
                stroke="#dc2626"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>

            <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-md bg-card/95 px-2 py-1 text-[10px] font-bold text-red-600 shadow-xs">
              <Ruler className="size-3" />
              {t('warning_distance_chip', { distance: props.distanceMeters })}
            </span>

            <span className="absolute bottom-3 left-3 rounded-md bg-pine-deep px-2.5 py-1 text-[10px] font-semibold text-white shadow-xs">
              {t('warning_zone_chip', {
                radius: props.radiusMeters,
                school: props.schoolName,
              })}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-xs">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground">
                  {t('warning_overshoot_label')}
                </span>
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                  {t('warning_overshoot_value', { distance: overshoot })}
                </span>
              </div>
              <p className="text-2xl font-extrabold text-red-600">
                {props.distanceMeters} <span className="text-base">m</span>
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {t('warning_origin_label', { gate: 'Kampus A' })}
              </p>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-xs">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground">
                  {t('warning_accuracy_label')}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-pine-light px-2 py-0.5 text-[10px] font-bold text-pine-deep">
                  <span className="size-1.5 rounded-full bg-pine-deep" />
                  {t('warning_accuracy_chip')}
                </span>
              </div>
              <p className="text-2xl font-extrabold text-foreground">
                ± {props.accuracyMeters} <span className="text-base">m</span>
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {t('warning_signal_label')} · Lat: {props.latitude} • Lon: {props.longitude}
              </p>
            </div>
          </div>

          <p className="mt-5 mb-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            {t('warning_solutions_label')}
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col rounded-2xl border border-border-subtle bg-surface-container-low p-4">
              <div className="mb-1.5 flex items-center gap-2 text-pine-deep">
                <RefreshCcw className="size-4" />
                <h3 className="text-xs font-bold">{t('warning_inside_title')}</h3>
              </div>
              <p className="flex-1 text-[11px] leading-relaxed text-muted-foreground">
                {t.rich('warning_inside_desc', {
                  chip: (chunks) => (
                    <span className="rounded bg-card px-1 py-0.5 font-semibold text-pine-deep">
                      {chunks}
                    </span>
                  ),
                })}
              </p>
              <button
                type="button"
                onClick={props.onRecalibrate}
                className="mt-3 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border-control bg-card px-3 py-2 text-[11px] font-bold text-pine-deep transition-colors hover:bg-pine-light"
              >
                <Navigation className="size-3.5" />
                {t('warning_recalibrate')}
              </button>
            </div>

            <div className="flex flex-col rounded-2xl border border-amber-gold/40 bg-amber-surface p-4">
              <div className="mb-1.5 flex items-center gap-2 text-amber-dark">
                <Briefcase className="size-4" />
                <h3 className="text-xs font-bold">{t('warning_duty_title')}</h3>
              </div>
              <p className="flex-1 text-[11px] leading-relaxed text-amber-dark/90">
                {t('warning_duty_desc')}
              </p>
              <button
                type="button"
                onClick={props.onRequestDuty}
                className="mt-3 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-amber-gold px-3 py-2 text-[11px] font-bold text-pine-deep transition-colors hover:bg-amber-gold/80"
              >
                <ClipboardPlus className="size-3.5" />
                {t('warning_request_duty')}
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={props.onClose}
              className="cursor-pointer rounded-xl border border-border-control bg-card px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-surface-container-low"
            >
              {t('warning_back')}
            </button>
            <button
              type="button"
              onClick={props.onRetry}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-pine-hover"
            >
              <RefreshCcw className="size-3.5 text-amber-gold" />
              {t('warning_retry')}
            </button>
          </div>

          <p className="mt-4 flex items-center justify-center gap-1.5 border-t border-border-subtle pt-3 text-center text-[9px] text-muted-foreground">
            <ShieldCheck className="size-3" />
            {t('warning_audit_note')}
          </p>
        </div>
      </div>
    </div>
  );
}
