import { describe, expect, it, vi } from 'vitest';
import {
  checkInToast,
  checkOutToast,
  dayNameId,
  durationToJp,
  formatShortDateId,
  geolocationErrorMessage,
  getCurrentDevicePosition,
  isoDate,
  isoDateMinusDays,
  mapHistoryRow,
  mapTodayToAttendance,
  timeLabelId,
  toCheckPayload,
  verifyLocationFeedback,
} from '@/lib/api/presensi-guru';
import type {
  TeacherPresenceHistoryEntryDto,
  TeacherPresenceTodayDto,
} from '@/lib/api/presensi-guru';

const coordsSample = { latitude: -7.716382, longitude: 110.355291, accuracy: 6 };

const todayBase: TeacherPresenceTodayDto = {
  teacher_id: 'tch-1',
  presence_date: '2026-10-05',
  check_in_at: '2026-10-05T06:48:00',
  check_out_at: null,
  within_geofence: true,
  distance_meters: 12,
};

const historyBase: TeacherPresenceHistoryEntryDto = {
  id: 'tp-1',
  teacher_id: 'tch-1',
  presence_date: '2026-10-02',
  check_in_at: '2026-10-02T06:50:00',
  check_out_at: '2026-10-02T14:30:00',
  duration_minutes: 460,
  within_geofence: true,
  distance_meters: 15,
};

describe('time + date helpers', () => {
  it('formats HH:MM from an RFC3339 timestamp', () => {
    expect(timeLabelId('2026-10-05T06:48:00')).toBe('06:48');
  });

  it('returns null for missing or invalid timestamps', () => {
    expect(timeLabelId(null)).toBeNull();
    expect(timeLabelId('')).toBeNull();
    expect(timeLabelId('bukan-tanggal')).toBeNull();
  });

  it('formats Indonesian short dates and weekday names', () => {
    expect(formatShortDateId('2026-10-05')).toBe('5 Okt 2026');
    expect(formatShortDateId('2026-09-30')).toBe('30 Sep 2026');
    expect(dayNameId('2026-10-05')).toBe('Senin');
    expect(dayNameId('2026-10-02')).toBe('Jumat');
  });

  it('shifts ISO dates backwards for history date filters', () => {
    expect(isoDateMinusDays('2026-10-05', 6)).toBe('2026-09-29');
    expect(isoDateMinusDays('2026-10-01', 3)).toBe('2026-09-28');
    expect(isoDate(new Date('2026-10-05T12:00:00'))).toBe('2026-10-05');
  });

  it('converts durations to JP (40-minute lesson hours, floor)', () => {
    expect(durationToJp(320)).toBe('8 JP');
    expect(durationToJp(460)).toBe('11 JP');
    expect(durationToJp(0)).toBe('0 JP');
    expect(durationToJp(-5)).toBe('0 JP');
  });
});

describe('today payload to UI attendance', () => {
  it('marks belum when the teacher has not checked in', () => {
    const attendance = mapTodayToAttendance({ ...todayBase, check_in_at: null });
    expect(attendance.isCheckedIn).toBeFalsy();
    expect(attendance.status).toBe('belum');
  });

  it('falls back to the mock gate/biometric fields when the payload is absent', () => {
    const attendance = mapTodayToAttendance(null);
    expect(attendance.status).toBe('belum');
    expect(attendance.isCheckedOut ?? false).toBeFalsy();
  });

  it('maps an on-time check-in with server distance', () => {
    const attendance = mapTodayToAttendance(todayBase);
    expect(attendance.isCheckedIn).toBeTruthy();
    expect(attendance.status).toBe('tepat_waktu');
    expect(attendance.checkInTime).toBe('06:48');
    expect(attendance.distanceMeters).toBe(12);
  });

  it('derives terlambat from the late limit', () => {
    const attendance = mapTodayToAttendance({ ...todayBase, check_in_at: '2026-10-05T07:20:00' });
    expect(attendance.status).toBe('terlambat');
  });

  it('flags the recorded check-out', () => {
    const attendance = mapTodayToAttendance({ ...todayBase, check_out_at: '2026-10-05T15:31:00' });
    expect(attendance.isCheckedOut).toBeTruthy();
  });
});

describe('history row mapper', () => {
  it('maps a complete geofenced row to the UI table shape', () => {
    const row = mapHistoryRow(historyBase, '2026-10-05');
    expect(row.day).toBe('Jumat');
    expect(row.date).toBe('2 Okt 2026');
    expect(row.isToday).toBeFalsy();
    expect(row.checkIn).toBe('06:50');
    expect(row.checkOut).toBe('14:30');
  });

  it('derives jam pelajaran, status and method from a geofenced row', () => {
    const row = mapHistoryRow(historyBase, '2026-10-05');
    expect(row.hours).toBe('11 JP');
    expect(row.status).toBe('tepat_waktu');
    expect(row.method).toContain('GPS');
  });

  it('shows dashes for a missing check-out and marks the today row', () => {
    const row = mapHistoryRow(
      { ...historyBase, presence_date: '2026-10-05', check_out_at: null },
      '2026-10-05',
    );
    expect(row.isToday).toBeTruthy();
    expect(row.checkOut).toBe('---:---');
  });

  it('labels out-of-geofence days as dinas luar', () => {
    const row = mapHistoryRow({ ...historyBase, within_geofence: false }, '2026-10-05');
    expect(row.status).toBe('dinas_luar');
    expect(row.method).toContain('Dinas Luar');
  });
});

describe('check payload + toasts', () => {
  it('passes lat/lng/accuracy through for the server-side geofence verdict', () => {
    expect(
      toCheckPayload({ latitude: -7.716382, longitude: 110.355291, accuracy: 6 }),
    ).toStrictEqual({ latitude: -7.716382, longitude: 110.355291, accuracy: 6 });
  });

  it('includes distance and radius in the check-in toast', () => {
    const toast = checkInToast(
      {
        id: 'tp-1',
        teacher_id: 'tch-1',
        presence_date: '2026-10-05',
        check_in_at: '2026-10-05T06:48:00',
        within_geofence: true,
        distance_meters: 12.4,
        message: 'ok',
      },
      50,
    );
    expect(toast).toContain('12 m');
    expect(toast).toContain('radius 50 m');
    expect(toast).toContain('06:48');
  });

  it('warns in the toast when check-out happened outside the radius', () => {
    const toast = checkOutToast(
      {
        id: 'tp-1',
        teacher_id: 'tch-1',
        presence_date: '2026-10-05',
        check_in_at: '2026-10-05T06:48:00',
        check_out_at: '2026-10-05T15:30:00',
        duration_minutes: 522,
        check_out_within_geofence: false,
        check_out_distance_meters: 485,
        message: 'ok',
      },
      50,
    );
    expect(toast).toContain('di luar radius');
    expect(toast).toContain('485 m');
    expect(toast).toContain('15:30');
  });
});

describe('verify-location feedback (stored check-in vs radius)', () => {
  it('asks for a check-in when no distance is recorded yet', () => {
    expect(verifyLocationFeedback(null, 50).kind).toBe('idle');
    expect(verifyLocationFeedback({ ...todayBase, distance_meters: null }, 50).kind).toBe('idle');
  });

  it('confirms inside when the server verdict was within the geofence', () => {
    const feedback = verifyLocationFeedback(todayBase, 50);
    expect(feedback.kind).toBe('inside');
    expect(feedback.message).toContain('12 m');
  });

  it('reports the distance when the check-in was outside the radius', () => {
    const feedback = verifyLocationFeedback(
      { ...todayBase, within_geofence: false, distance_meters: 485.6 },
      50,
    );
    expect(feedback.kind).toBe('outside');
    expect(feedback.message).toContain('486 m');
  });
});

describe('geolocation integration', () => {
  it('maps permission errors to friendly Indonesian messages', () => {
    expect(geolocationErrorMessage(1)).toContain('Izin lokasi ditolak');
    expect(geolocationErrorMessage(2)).toContain('tidak tersedia');
    expect(geolocationErrorMessage(3)).toContain('habis');
  });

  it('resolves lat/lng/accuracy from a successful fix', async () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (success: (p: { coords: typeof coordsSample }) => void) => {
          success({ coords: coordsSample });
        },
      },
    });
    await expect(getCurrentDevicePosition()).resolves.toStrictEqual(coordsSample);
    vi.unstubAllGlobals();
  });

  it('rejects with the permission-denied message when the user blocks location', async () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (_s: unknown, error: (e: { code: number }) => void) => {
          error({ code: 1 });
        },
      },
    });
    await expect(getCurrentDevicePosition()).rejects.toThrow('Izin lokasi ditolak');
    vi.unstubAllGlobals();
  });

  it('rejects with a clear message when the browser has no geolocation', async () => {
    vi.stubGlobal('navigator', {});
    await expect(getCurrentDevicePosition()).rejects.toThrow('tidak mendukung');
    vi.unstubAllGlobals();
  });
});
