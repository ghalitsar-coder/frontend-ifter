import { describe, expect, it } from 'vitest';
import { defaultSystemSettings } from '@/data/mockSettings';
import type { AttendanceHoliday, AttendanceSettings, AcademicYear } from '@/lib/api/dto';
import {
  academicYearInputError,
  formatIsoDayId,
  geofencePolicyToPayload,
  geofenceToPolicy,
  holidayInputError,
  presencePolicyToSettings,
  sanctionDraftsToRules,
  sanctionRulesToDrafts,
  settingsToPresencePolicy,
  sortHolidays,
  termInputError,
  toggleOperationalDay,
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

  it('maps operational days from the schedule weekdays', () => {
    expect(settingsToPresencePolicy(baseSettings).operationalDays).toStrictEqual([1, 2, 5]);
  });

  it('falls back to Monday-Friday operational days when schedules are empty', () => {
    const empty = { ...baseSettings, schedules: [] };

    expect(settingsToPresencePolicy(empty).operationalDays).toStrictEqual([1, 2, 3, 4, 5]);
  });
});

describe('operational day toggle', () => {
  it('adds a day and keeps the list sorted', () => {
    expect(toggleOperationalDay([1, 3], 6)).toStrictEqual([1, 3, 6]);
    expect(toggleOperationalDay([1, 5], 3)).toStrictEqual([1, 3, 5]);
  });

  it('removes a selected day', () => {
    expect(toggleOperationalDay([1, 2, 3], 2)).toStrictEqual([1, 3]);
  });

  it('refuses to remove the last operational day', () => {
    expect(toggleOperationalDay([4], 4)).toStrictEqual([4]);
  });
});

describe('presence policy to attendance settings', () => {
  it('writes gate window back to every schedule row and preserves other fields', () => {
    const policy = {
      ...settingsToPresencePolicy(baseSettings),
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

  it('writes one row per selected operational day only', () => {
    const policy = { ...settingsToPresencePolicy(baseSettings), operationalDays: [1, 3, 6] };
    const result = presencePolicyToSettings(baseSettings, policy);

    expect(result.schedules.map((schedule) => schedule.weekday)).toStrictEqual([1, 3, 6]);
  });

  it('falls back to Monday-Friday when no operational day is selected', () => {
    const policy = { ...settingsToPresencePolicy(baseSettings), operationalDays: [] };
    const result = presencePolicyToSettings(baseSettings, policy);

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

const holiday = (overrides?: Partial<AttendanceHoliday>): AttendanceHoliday => ({
  holiday_date: '2026-12-25',
  name: 'Hari Raya Natal',
  created_at: '2026-10-01T00:00:00Z',
  ...overrides,
});

describe('school holiday helpers (GET/POST/DELETE /attendance/holidays)', () => {
  it('formats ISO days for the holiday list', () => {
    expect(formatIsoDayId('2026-12-31')).toBe('31 Des 2026');
    expect(formatIsoDayId('2026-01-05')).toBe('5 Jan 2026');
  });

  it('returns an empty label for unparsable dates', () => {
    expect(formatIsoDayId('25-12-2026')).toBe('');
  });

  it('rejects missing date, blank name, and names over the backend limit', () => {
    expect(holidayInputError({ holiday_date: '', name: 'Libur' })).toBe(
      'Tanggal libur wajib diisi.',
    );
    expect(holidayInputError({ holiday_date: '2026-12-25', name: '   ' })).toBe(
      'Nama hari libur wajib diisi.',
    );
    expect(holidayInputError({ holiday_date: '2026-12-25', name: 'x'.repeat(151) })).toBe(
      'Nama hari libur maksimal 150 karakter.',
    );
  });

  it('accepts a valid holiday payload', () => {
    expect(holidayInputError({ holiday_date: '2026-12-25', name: 'Natal' })).toBeNull();
  });

  it('sorts holidays by date without mutating the server array', () => {
    const input = [
      holiday({ holiday_date: '2026-12-25' }),
      holiday({ holiday_date: '2026-01-01', name: 'Tahun Baru' }),
      holiday({ holiday_date: '2026-05-01', name: 'Hari Buruh' }),
    ];

    expect(sortHolidays(input).map((row) => row.holiday_date)).toStrictEqual([
      '2026-01-01',
      '2026-05-01',
      '2026-12-25',
    ]);
    expect(input.map((row) => row.holiday_date)).toStrictEqual([
      '2026-12-25',
      '2026-01-01',
      '2026-05-01',
    ]);
  });
});

const academicYear: AcademicYear = {
  id: 'ay-1',
  name: '2026/2027',
  start_date: '2026-07-01',
  end_date: '2027-06-30',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('academic year & term validation (MasterData)', () => {
  it('accepts a valid academic year', () => {
    expect(
      academicYearInputError({
        name: '2026/2027',
        start_date: '2026-07-01',
        end_date: '2027-06-30',
        is_active: true,
      }),
    ).toBeNull();
  });

  it('rejects blank names, dates that are not ISO, and end <= start', () => {
    expect(
      academicYearInputError({
        name: ' ',
        start_date: '2026-07-01',
        end_date: '2027-06-30',
        is_active: false,
      }),
    ).toBe('Nama tahun ajaran wajib diisi.');
    expect(
      academicYearInputError({
        name: '2026/2027',
        start_date: '',
        end_date: '2027-06-30',
        is_active: false,
      }),
    ).toBe('Tanggal mulai dan selesai tahun ajaran wajib diisi.');
    expect(
      academicYearInputError({
        name: '2026/2027',
        start_date: '2027-06-30',
        end_date: '2027-06-30',
        is_active: false,
      }),
    ).toBe('Tanggal selesai harus setelah tanggal mulai.');
  });

  it('accepts a term inside its parent year', () => {
    expect(
      termInputError(
        {
          term_number: 1,
          name: 'Semester 1',
          start_date: '2026-07-01',
          end_date: '2026-12-31',
        },
        academicYear,
      ),
    ).toBeNull();
  });

  it('rejects out-of-range term numbers', () => {
    expect(
      termInputError(
        { term_number: 5, name: 'Semester 5', start_date: '2026-07-01', end_date: '2026-12-31' },
        academicYear,
      ),
    ).toBe('Nomor semester harus antara 1 dan 4.');
  });

  it('rejects terms that fall outside the parent academic year', () => {
    expect(
      termInputError(
        { term_number: 2, name: 'Semester 2', start_date: '2027-01-01', end_date: '2027-07-15' },
        academicYear,
      ),
    ).toBe('Rentang semester harus berada di dalam rentang tahun ajaran.');
  });

  it('skips the parent-year check when no year is given', () => {
    expect(
      termInputError({
        term_number: 2,
        name: 'Semester 2',
        start_date: '2027-01-01',
        end_date: '2027-07-15',
      }),
    ).toBeNull();
  });
});

describe('presence policy school identity', () => {
  it('exposes school_name and timezone from the server settings', () => {
    const policy = settingsToPresencePolicy(baseSettings);

    expect(policy.schoolName).toBe(baseSettings.school_name);
    expect(policy.timezone).toBe(baseSettings.timezone);
  });

  it('writes edited school_name/timezone and preserves holidays', () => {
    const policy = {
      ...defaultSystemSettings.presence,
      schoolName: 'SMP Negeri 2 Harapan Bangsa',
      timezone: 'Asia/Makassar',
    };
    const result = presencePolicyToSettings(baseSettings, policy);

    expect(result.school_name).toBe('SMP Negeri 2 Harapan Bangsa');
    expect(result.timezone).toBe('Asia/Makassar');
    expect(result.holidays).toStrictEqual(baseSettings.holidays);
  });

  it('keeps the server identity when the edited policy omits it', () => {
    const policy = {
      ...defaultSystemSettings.presence,
      schoolName: undefined,
      timezone: undefined,
    };
    const result = presencePolicyToSettings(baseSettings, policy);

    expect(result.school_name).toBe(baseSettings.school_name);
    expect(result.timezone).toBe(baseSettings.timezone);
  });
});
