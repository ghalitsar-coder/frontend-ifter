import { MapPin, Navigation } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { GEOFENCE_RADIUS_RANGE } from '@/data/mockSettings';
import type { GeofencePolicy } from '@/types/settings';

/**
 * Geofence radius, anti-spoofing, and selfie verification editor.
 *
 * @param props - Component properties.
 * @returns Geofence policy card.
 */
export function SettingsGeofencePanel(props: {
  policy: GeofencePolicy;
  onChange: (patch: Partial<GeofencePolicy>) => void;
  onCalibrate: () => void;
}) {
  const t = useTranslations('SettingsPage');

  return (
    <section className="rounded-2xl border border-border-control bg-card p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-pine-deep" />
          <h2 className="text-sm font-bold text-pine-deep sm:text-base">{t('geofence_title')}</h2>
        </div>
        <span className="rounded-full bg-pine-light px-2.5 py-0.5 text-[11px] font-bold text-pine-deep">
          {t('gps_badge')}
        </span>
      </div>

      <div className="relative mb-4 flex h-40 items-center justify-center overflow-hidden rounded-xl border border-pine-light bg-pine-light/60">
        <div
          className="absolute rounded-full border border-pine-deep/20 bg-pine-deep/5"
          style={{
            width: `${Math.min(140, props.policy.radiusMeters / 2 + 40)}px`,
            height: `${Math.min(140, props.policy.radiusMeters / 2 + 40)}px`,
          }}
        />
        <div className="z-10 flex size-8 items-center justify-center rounded-full bg-pine-deep text-white shadow-md">
          <MapPin className="size-4 text-amber-gold" />
        </div>
        <span className="absolute right-3 bottom-3 rounded-lg bg-card/90 px-2 py-1 font-mono text-[10px] font-semibold text-pine-deep">
          {props.policy.centerLat.toFixed(5)}, {props.policy.centerLng.toFixed(5)}
        </span>
        <span className="absolute top-3 left-3 rounded-lg bg-card/90 px-2 py-1 text-[10px] font-bold text-pine-deep">
          {props.policy.radiusMeters} {t('unit_meters')}
        </span>
      </div>

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="geofence-radius" className="text-xs font-semibold text-foreground">
            {t('field_radius')}
          </label>
          <span className="text-[11px] font-bold text-pine-deep">
            {props.policy.radiusMeters} {t('unit_meters')}
          </span>
        </div>
        <input
          id="geofence-radius"
          type="range"
          min={GEOFENCE_RADIUS_RANGE.min}
          max={GEOFENCE_RADIUS_RANGE.max}
          step={GEOFENCE_RADIUS_RANGE.step}
          value={props.policy.radiusMeters}
          onChange={(e) => {
            props.onChange({ radiusMeters: Number(e.target.value) });
          }}
          className="w-full accent-pine-deep"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>
            {GEOFENCE_RADIUS_RANGE.min} {t('unit_meters')}
          </span>
          <span>
            {GEOFENCE_RADIUS_RANGE.max} {t('unit_meters')}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="geofence-fake-gps"
          aria-label={t('field_fake_gps')}
          className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-border-control bg-surface-container-low p-3"
        >
          <span>
            <span className="block text-xs font-bold text-pine-deep">{t('field_fake_gps')}</span>
            <span className="block text-[10px] text-muted-foreground">{t('hint_fake_gps')}</span>
          </span>
          <input
            id="geofence-fake-gps"
            type="checkbox"
            checked={props.policy.detectFakeGps}
            onChange={(e) => {
              props.onChange({ detectFakeGps: e.target.checked });
            }}
            className="mt-0.5 size-4 shrink-0 cursor-pointer accent-pine-deep"
          />
        </label>

        <label
          htmlFor="geofence-liveness"
          aria-label={t('field_liveness')}
          className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-border-control bg-surface-container-low p-3"
        >
          <span>
            <span className="block text-xs font-bold text-pine-deep">{t('field_liveness')}</span>
            <span className="block text-[10px] text-muted-foreground">{t('hint_liveness')}</span>
          </span>
          <input
            id="geofence-liveness"
            type="checkbox"
            checked={props.policy.requireSelfieLiveness}
            onChange={(e) => {
              props.onChange({ requireSelfieLiveness: e.target.checked });
            }}
            className="mt-0.5 size-4 shrink-0 cursor-pointer accent-pine-deep"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={props.onCalibrate}
        className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border-control bg-card px-3 py-2 text-xs font-semibold text-pine-deep transition-colors hover:bg-pine-light"
      >
        <Navigation className="size-3.5" />
        <span>{t('btn_calibrate_gps')}</span>
      </button>
    </section>
  );
}
