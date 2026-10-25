import { MapPin, Navigation } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { GEOFENCE_RADIUS_RANGE } from '@/data/mockSettings';
import { ApiError } from '@/lib/api/client';
import {
  geofencePolicyToPayload,
  geofenceToPolicy,
  useGeofence,
  useUpdateGeofence,
} from '@/lib/api/pengaturan';
import type { GeofencePolicy } from '@/types/settings';

/**
 * Save-button caption for the geofence editor.
 * @param isPending - True while the PUT /geofence mutation is running.
 * @param isDirty - True when local edits differ from the saved policy.
 * @returns Caption text.
 */
function geofenceSaveLabel(isPending: boolean, isDirty: boolean): string {
  if (isPending) {
    return 'Menyimpan…';
  }
  return isDirty ? 'Simpan Lokasi Sekolah' : 'Tidak Ada Perubahan';
}

/**
 * School-location (geofence) editor wired to GET/PUT /geofence.
 * Coordinates, radius and the enabled flag are server-backed; the
 * anti-spoofing switches have no backend fields and stay local.
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
  const { roles } = useAuth();
  const canEdit = roles.includes('admin');
  const { data: geofence } = useGeofence();
  const updateGeofence = useUpdateGeofence();
  // Sparse patches keep the server document untouched until an edit happens;
  // `null` means "follow GET /geofence" (falling back to the local policy).
  const [policyPatch, setPolicyPatch] = useState<Partial<GeofencePolicy> | null>(null);
  const [enabledPatch, setEnabledPatch] = useState<boolean | null>(null);

  const serverPolicy: GeofencePolicy =
    geofence === undefined ? props.policy : geofenceToPolicy(geofence, props.policy);
  const policy: GeofencePolicy = { ...serverPolicy, ...policyPatch };
  const isEnabled = enabledPatch ?? geofence?.is_enabled ?? true;
  const isDirty = policyPatch !== null || enabledPatch !== null;

  const patchLocation = (patch: Partial<GeofencePolicy>) => {
    setPolicyPatch((current) => ({ ...current, ...patch }));
    props.onChange(patch);
  };

  const handleSave = () => {
    updateGeofence.mutate(geofencePolicyToPayload(policy, isEnabled), {
      onSuccess: () => {
        setPolicyPatch(null);
        setEnabledPatch(null);
      },
    });
  };

  const saveError =
    updateGeofence.error instanceof ApiError
      ? updateGeofence.error.message
      : 'Gagal menyimpan pengaturan geofence.';

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
            width: `${Math.min(140, policy.radiusMeters / 2 + 40)}px`,
            height: `${Math.min(140, policy.radiusMeters / 2 + 40)}px`,
          }}
        />
        <div className="z-10 flex size-8 items-center justify-center rounded-full bg-pine-deep text-white shadow-md">
          <MapPin className="size-4 text-amber-gold" />
        </div>
        <span className="absolute right-3 bottom-3 rounded-lg bg-card/90 px-2 py-1 font-mono text-[10px] font-semibold text-pine-deep">
          {policy.centerLat.toFixed(5)}, {policy.centerLng.toFixed(5)}
        </span>
        <span className="absolute top-3 left-3 rounded-lg bg-card/90 px-2 py-1 text-[10px] font-bold text-pine-deep">
          {policy.radiusMeters} {t('unit_meters')}
        </span>
        {geofence === undefined && (
          <span className="absolute top-3 right-3 rounded-lg bg-card/90 px-2 py-1 text-[10px] font-bold text-muted-foreground">
            Memuat lokasi sekolah…
          </span>
        )}
      </div>

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="geofence-radius" className="text-xs font-semibold text-foreground">
            {t('field_radius')}
          </label>
          <span className="text-[11px] font-bold text-pine-deep">
            {policy.radiusMeters} {t('unit_meters')}
          </span>
        </div>
        <input
          id="geofence-radius"
          type="range"
          min={GEOFENCE_RADIUS_RANGE.min}
          max={GEOFENCE_RADIUS_RANGE.max}
          step={GEOFENCE_RADIUS_RANGE.step}
          value={policy.radiusMeters}
          disabled={!canEdit}
          onChange={(e) => {
            patchLocation({ radiusMeters: Number(e.target.value) });
          }}
          className="w-full accent-pine-deep disabled:cursor-not-allowed"
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

      <div className="mb-4 grid grid-cols-2 gap-2">
        <div>
          <label
            htmlFor="geofence-lat"
            className="mb-1 block text-xs font-semibold text-foreground"
          >
            Lintang Sekolah (latitude)
          </label>
          <input
            id="geofence-lat"
            type="number"
            step={0.00001}
            min={-90}
            max={90}
            value={policy.centerLat}
            disabled={!canEdit}
            onChange={(e) => {
              const raw = Number(e.target.value);
              if (Number.isFinite(raw)) {
                patchLocation({ centerLat: raw });
              }
            }}
            className="w-full rounded-lg border border-border-control bg-card px-2 py-1.5 font-mono text-xs text-foreground transition-colors outline-none focus:border-pine-deep disabled:cursor-not-allowed disabled:bg-surface-container-low"
          />
        </div>
        <div>
          <label
            htmlFor="geofence-lng"
            className="mb-1 block text-xs font-semibold text-foreground"
          >
            Bujur Sekolah (longitude)
          </label>
          <input
            id="geofence-lng"
            type="number"
            step={0.00001}
            min={-180}
            max={180}
            value={policy.centerLng}
            disabled={!canEdit}
            onChange={(e) => {
              const raw = Number(e.target.value);
              if (Number.isFinite(raw)) {
                patchLocation({ centerLng: raw });
              }
            }}
            className="w-full rounded-lg border border-border-control bg-card px-2 py-1.5 font-mono text-xs text-foreground transition-colors outline-none focus:border-pine-deep disabled:cursor-not-allowed disabled:bg-surface-container-low"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="geofence-enabled"
          aria-label="Aktifkan gerbang geofence"
          className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-border-control bg-surface-container-low p-3"
        >
          <span>
            <span className="block text-xs font-bold text-pine-deep">
              Aktifkan Pemeriksaan Lokasi (Geofence)
            </span>
            <span className="block text-[10px] text-muted-foreground">
              Absensi guru hanya valid di dalam radius sekolah; dinonaktifkan = semua lokasi
              diterima.
            </span>
          </span>
          <input
            id="geofence-enabled"
            type="checkbox"
            checked={isEnabled}
            disabled={!canEdit}
            onChange={(e) => {
              setEnabledPatch(e.target.checked);
            }}
            className="mt-0.5 size-4 shrink-0 cursor-pointer accent-pine-deep disabled:cursor-not-allowed"
          />
        </label>

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

      {/* shortcut: deteksi GPS palsu + liveness selfie tidak punya field backend (PUT /geofence hanya lat/lng/radius/is_enabled), keep mock */}
      {!canEdit && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Hanya Administrator Sekolah yang dapat mengubah lokasi sekolah.
        </p>
      )}
      {canEdit && updateGeofence.isError && (
        <p className="mt-3 text-[11px] font-semibold text-rose-600">{saveError}</p>
      )}
      {canEdit && (
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || updateGeofence.isPending || geofence === undefined}
          className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-pine-deep px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MapPin className="size-3.5" />
          <span>{geofenceSaveLabel(updateGeofence.isPending, isDirty)}</span>
        </button>
      )}

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
