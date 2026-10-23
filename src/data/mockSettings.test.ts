import { describe, expect, it } from 'vitest';
import { defaultSystemSettings, GEOFENCE_RADIUS_RANGE } from '@/data/mockSettings';

/**
 * Parse a HH:MM clock string into minutes since midnight.
 *
 * @param value - Clock string in HH:MM format.
 * @returns Minutes since midnight.
 */
function toMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

describe('system settings defaults', () => {
  it('keeps the gate window ordered from open to close', () => {
    const { gateOpen, onTimeUntil, gateClose } = defaultSystemSettings.presence;
    expect(toMinutes(gateOpen)).toBeLessThan(toMinutes(onTimeUntil));
    expect(toMinutes(onTimeUntil)).toBeLessThan(toMinutes(gateClose));
  });

  it('keeps the geofence radius inside the calibrated range', () => {
    expect(defaultSystemSettings.geofence.radiusMeters).toBeGreaterThanOrEqual(
      GEOFENCE_RADIUS_RANGE.min,
    );
    expect(defaultSystemSettings.geofence.radiusMeters).toBeLessThanOrEqual(
      GEOFENCE_RADIUS_RANGE.max,
    );
  });

  it('uses every placeholder referenced by the whatsapp templates', () => {
    const { checkInTemplate, sanctionTemplate } = defaultSystemSettings.notifications;
    expect(checkInTemplate).toContain('{nama_siswa}');
    expect(checkInTemplate).toContain('{jam_absen}');
    expect(sanctionTemplate).toContain('{total_poin}');
    expect(sanctionTemplate).toContain('{tanggal_sidang}');
  });
});
