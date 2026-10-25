import { describe, expect, it, vi } from 'vitest';
import type * as I18nNavigation from '@/libs/I18nNavigation';
import { warningModalData } from './TeacherPresenceManager';

// The manager pulls next-intl navigation (and thus next/navigation), which
// cannot resolve in the node test environment — only its exported pure helper
// is under test here. vit.mock hoists the call above the imports at runtime.
// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- deliberate partial stub: the module under test only calls router.push
vi.mock(import('@/libs/I18nNavigation'), (() => ({
  useRouter: () => ({ push: vi.fn<() => void>() }),
})) as unknown as () => typeof I18nNavigation);

describe('geofence warning modal diagnostics', () => {
  it('uses the server distance, settings radius and raw GPS fix', () => {
    const data = warningModalData(
      {
        distanceMeters: 485.4,
        fix: { latitude: -7.716382, longitude: 110.355291, accuracy: 6.2 },
      },
      { latitude: -7.716, longitude: 110.355, radius_meters: 75, is_enabled: true },
    );
    expect(data).toStrictEqual({
      distanceMeters: 485,
      radiusMeters: 75,
      accuracyMeters: 6,
      latitude: -7.716382,
      longitude: 110.355291,
    });
  });

  it('falls back to the default radius when geofence is disabled or loading', () => {
    const data = warningModalData(null, {
      latitude: 0,
      longitude: 0,
      radius_meters: 75,
      is_enabled: false,
    });
    expect(data.radiusMeters).toBe(50);
    expect(data.distanceMeters).toBe(0);
    expect(data.latitude).toBe(0);
  });
});
