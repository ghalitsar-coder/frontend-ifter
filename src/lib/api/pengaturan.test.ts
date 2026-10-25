import { describe, expect, it } from 'vitest';
import { defaultSystemSettings } from '@/data/mockSettings';
import type { AttendanceSettings } from '@/lib/api/dto';
import {
  geofencePolicyToPayload,
  geofenceToPolicy,
  presencePolicyToSettings,
  sanctionDraftsToRules,
  sanctionRulesToDrafts,
  settingsToPresencePolicy,
} from '@/lib/api/pengaturan';
import type { GeofenceDto, SanctionRuleDto } from '@/lib/api/pengaturan';

const baseSettings: AttendanceSettings = {
  school_name: 'SMP Negeri 1 Harapan Bangsa',
  timezone: 'Asia/Jakarta',
  attendance_auto_close_time: '07:15',
  updated_at: '2026-10-01T00:00:00Z',
  schedules: [
    { weekday: 1, start_time: '06:30', late_tolerance_minutes: 30 },
    { weekday: 2, start_time: '06:30', late_tolerance_minutes: 30 },
    { weekday: 5, start_time: '06:00', late_tolerance_minutes: 45 },
  ],
  holidays: [{ holiday_date: '2026-12-25', name: 'Hari Raya Natal', created_at: 'x' }],
};

describe('attendance settings to presence policy', () => {
  it('maps first schedule + auto-close time to the gate window', () => {
    const policy = settingsToPresencePolicy(baseSettings);

    expect(policy.gateOpen).toBe('06:30');
    expect(policy.onTimeUntil).toBe('07:00');
    expect(policy.gateClose).toBe('07:15');
  });

  it('keeps mock defaults for fields without backend support', () => {
    const policy = settingsToPresencePolicy(baseSettings);

    expect(policy.lateToleranceMinutes).toBe(defaultSystemSettings.presence.lateToleranceMinutes);
    expect(policy.dismissalWeekday).toBe(defaultSystemSettings.presence.dismissalWeekday);
    expect(policy.dismissalFriday).toBe(defaultSystemSettings.presence.dismissalFriday);
  });

  it('falls back to factory times when no schedules exist', () => {
    const empty = { ...baseSettings, schedules: [] };
    const policy = settingsToPresencePolicy(empty);

    expect(policy.gateOpen).toBe(defaultSystemSettings.presence.gateOpen);
    expect(policy.onTimeUntil).toBe(defaultSystemSettings.presence.gateOpen);
  });
});

describe('presence policy to attendance settings', () => {
  it('writes gate window back to every schedule row and preserves other fields', () => {
    const policy = {
      ...defaultSystemSettings.presence,
      gateOpen: '06:20',
      onTimeUntil: '06:50',
      gateClose: '07:20',
    };
    const result = presencePolicyToSettings(baseSettings, policy);

    expect(result.schedules).toHaveLength(3);
    for (const schedule of result.schedules) {
      expect(schedule.start_time).toBe('06:20');
      expect(schedule.late_tolerance_minutes).toBe(30);
    }
    expect(result.attendance_auto_close_time).toBe('07:20');
    expect(result.school_name).toBe(baseSettings.school_name);
    expect(result.timezone).toBe(baseSettings.timezone);
    expect(result.holidays).toStrictEqual(baseSettings.holidays);
  });

  it('creates Monday-Friday rows when the server has none', () => {
    const empty = { ...baseSettings, schedules: [] };
    const result = presencePolicyToSettings(empty, defaultSystemSettings.presence);

    expect(result.schedules.map((schedule) => schedule.weekday)).toStrictEqual([1, 2, 3, 4, 5]);
  });

  it('clamps negative on-time windows to zero tolerance', () => {
    const policy = { ...defaultSystemSettings.presence, gateOpen: '07:30', onTimeUntil: '06:45' };
    const result = presencePolicyToSettings(baseSettings, policy);

    expect(result.schedules[0]?.late_tolerance_minutes).toBe(0);
  });

  it('round-trips a policy through both mappers unchanged', () => {
    const policy = {
      ...defaultSystemSettings.presence,
      gateOpen: '06:15',
      onTimeUntil: '06:45',
      gateClose: '07:05',
    };
    const mapped = settingsToPresencePolicy(presencePolicyToSettings(baseSettings, policy));

    expect(mapped.gateOpen).toBe(policy.gateOpen);
    expect(mapped.onTimeUntil).toBe(policy.onTimeUntil);
    expect(mapped.gateClose).toBe(policy.gateClose);
  });
});

const sanctionRule = (overrides?: Partial<SanctionRuleDto>): SanctionRuleDto => ({
  id: 'rule-1',
  name: 'Teguran Tertulis',
  min_points: 30,
  max_points: 49,
  action: 'Surat peringatan orang tua',
  level: 'SP1',
  description: 'Tahap pertama pembinaan.',
  is_active: true,
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
  ...overrides,
});

describe('sanction rule mappers (GET/PUT /sanction-rules)', () => {
  it('maps backend rules to editable drafts', () => {
    const [draft] = sanctionRulesToDrafts([sanctionRule()]);

    expect(draft?.key).toBe('rule-1');
    expect(draft?.min_points).toBe(30);
    expect(draft?.max_points).toBe(49);
    expect(draft?.level).toBe('SP1');
    expect(draft?.is_active).toBeTruthy();
  });

  it('normalizes nullable level and description to empty strings', () => {
    const [draft] = sanctionRulesToDrafts([
      sanctionRule({ id: 'rule-2', level: null, description: null }),
    ]);

    expect(draft?.level).toBe('');
    expect(draft?.description).toBe('');
  });

  it('builds the replace-all payload with null max kept open-ended', () => {
    const drafts = sanctionRulesToDrafts([
      sanctionRule({ max_points: null }),
      sanctionRule({ id: 'rule-2', level: null, description: null }),
    ]);
    const payload = sanctionDraftsToRules(drafts);

    expect(payload[0]?.max_points).toBeNull();
    expect(payload[0]?.name).toBe('Teguran Tertulis');
    expect(payload[1]?.level).toBeUndefined();
    expect(payload[1]?.description).toBeUndefined();
    expect(payload[1]?.max_points).toBe(49);
  });

  it('round-trips a rule through both mappers without data loss', () => {
    const rule = sanctionRule();
    const [payload] = sanctionDraftsToRules(sanctionRulesToDrafts([rule]));

    expect(payload).toStrictEqual({
      name: rule.name,
      min_points: rule.min_points,
      max_points: rule.max_points,
      action: rule.action,
      level: rule.level,
      description: rule.description,
      is_active: rule.is_active,
    });
  });
});

const geofenceConfig: GeofenceDto = {
  latitude: -6.2,
  longitude: 106.8,
  radius_meters: 300,
  is_enabled: true,
};

describe('geofence mappers (GET/PUT /geofence)', () => {
  it('maps server config onto the panel policy and keeps mock flags from the fallback', () => {
    const policy = geofenceToPolicy(geofenceConfig, defaultSystemSettings.geofence);

    expect(policy.radiusMeters).toBe(300);
    expect(policy.centerLat).toBe(-6.2);
    expect(policy.centerLng).toBe(106.8);
    expect(policy.detectFakeGps).toBe(defaultSystemSettings.geofence.detectFakeGps);
    expect(policy.requireSelfieLiveness).toBe(defaultSystemSettings.geofence.requireSelfieLiveness);
  });

  it('builds a full-replace PUT body with an integer radius', () => {
    const policy = {
      ...defaultSystemSettings.geofence,
      centerLat: -6.2,
      centerLng: 106.8,
      radiusMeters: 150.6,
    };
    const payload = geofencePolicyToPayload(policy, false);

    expect(payload).toStrictEqual({
      latitude: -6.2,
      longitude: 106.8,
      radius_meters: 151,
      is_enabled: false,
    });
  });

  it('round-trips config through both mappers', () => {
    const payload = geofencePolicyToPayload(
      geofenceToPolicy(geofenceConfig, defaultSystemSettings.geofence),
      geofenceConfig.is_enabled,
    );

    expect(payload).toStrictEqual(geofenceConfig);
  });
});
