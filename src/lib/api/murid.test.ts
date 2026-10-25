import { describe, expect, it } from 'vitest';
import {
  attendanceStatusLabel,
  dispensationDateLabel,
  dispensationStatusLabel,
  dispensationTypeLabel,
  lastNDaysRange,
  muridKeys,
  toCreateMyDispensationForm,
  toCreateMyDispensationJson,
} from './murid';
import type { DispensationItem } from './murid';

const dispensation = (overrides: Partial<DispensationItem>): DispensationItem => ({
  id: 'disp-1',
  student_id: 'student-1',
  student_name: 'Ahmad Fauzi',
  class_id: 'class-1',
  class_name: 'XI IPA 2',
  type: 'sick',
  reason: 'Demam tiga hari',
  start_date: '2026-10-19',
  end_date: '2026-10-21',
  status: 'pending',
  document_available: true,
  submitted_by: 'user-1',
  verified_by: null,
  verified_at: null,
  note: null,
  created_at: '2026-10-19T04:10:00Z',
  ...overrides,
});

describe(lastNDaysRange, () => {
  it('builds an inclusive 30-day window ending today', () => {
    const today = new Date(2026, 9, 21); // 2026-10-21
    expect(lastNDaysRange(30, today)).toStrictEqual({ from: '2026-09-22', to: '2026-10-21' });
  });

  it('pads single-digit months and days', () => {
    const today = new Date(2026, 0, 5);
    expect(lastNDaysRange(7, today)).toStrictEqual({ from: '2025-12-30', to: '2026-01-05' });
  });

  it('a one-day range collapses to today', () => {
    const today = new Date(2026, 9, 21);
    expect(lastNDaysRange(1, today)).toStrictEqual({ from: '2026-10-21', to: '2026-10-21' });
  });

  it('clamps non-positive widths to one day', () => {
    const today = new Date(2026, 9, 21);
    expect(lastNDaysRange(0, today)).toStrictEqual({ from: '2026-10-21', to: '2026-10-21' });
  });
});

describe('status & label mappers', () => {
  it('maps attendance statuses to Indonesian labels', () => {
    expect(attendanceStatusLabel('present')).toBe('Hadir');
    expect(attendanceStatusLabel('late')).toBe('Terlambat');
    expect(attendanceStatusLabel('sick')).toBe('Sakit');
    expect(attendanceStatusLabel('excused')).toBe('Izin');
    expect(attendanceStatusLabel('absent')).toBe('Alpa');
  });

  it('passes unknown attendance codes through unchanged', () => {
    expect(attendanceStatusLabel('future_status')).toBe('future_status');
  });

  it('maps dispensation types (sick|late|permit|other)', () => {
    expect(dispensationTypeLabel('sick')).toBe('Sakit');
    expect(dispensationTypeLabel('late')).toBe('Terlambat');
    expect(dispensationTypeLabel('permit')).toBe('Izin');
    expect(dispensationTypeLabel('other')).toBe('Lainnya');
    expect(dispensationTypeLabel('weird')).toBe('weird');
  });

  it('maps dispensation statuses (pending|approved|rejected)', () => {
    expect(dispensationStatusLabel('pending')).toBe('Menunggu Verifikasi');
    expect(dispensationStatusLabel('approved')).toBe('Disetujui');
    expect(dispensationStatusLabel('rejected')).toBe('Ditolak');
  });

  it('renders single-day dispensations without a range and multi-day with s/d', () => {
    expect(dispensationDateLabel(dispensation({ end_date: null }))).toBe('2026-10-19');
    expect(dispensationDateLabel(dispensation({ end_date: '2026-10-19' }))).toBe('2026-10-19');
    expect(dispensationDateLabel(dispensation({}))).toBe('2026-10-19 s/d 2026-10-21');
  });
});

describe(toCreateMyDispensationJson, () => {
  it('sends snake_case type/reason/start_date and omits an empty end_date', () => {
    expect(
      toCreateMyDispensationJson({
        type: 'permit',
        reason: 'Acara keluarga',
        start_date: '2026-10-22',
        end_date: '',
      }),
    ).toStrictEqual({ type: 'permit', reason: 'Acara keluarga', start_date: '2026-10-22' });
  });

  it('includes end_date when set', () => {
    expect(
      toCreateMyDispensationJson({
        type: 'sick',
        reason: 'Flu',
        start_date: '2026-10-22',
        end_date: '2026-10-23',
      }),
    ).toStrictEqual({
      type: 'sick',
      reason: 'Flu',
      start_date: '2026-10-22',
      end_date: '2026-10-23',
    });
  });
});

describe(toCreateMyDispensationForm, () => {
  it('uses the backend form field names and the "document" file part', () => {
    const file = new File(['pdf-bytes'], 'surat.pdf', { type: 'application/pdf' });
    const form = toCreateMyDispensationForm({
      type: 'sick',
      reason: 'Demam',
      start_date: '2026-10-19',
      end_date: '2026-10-21',
      document: file,
    });
    expect(form.get('type')).toBe('sick');
    expect(form.get('reason')).toBe('Demam');
    expect(form.get('start_date')).toBe('2026-10-19');
    expect(form.get('end_date')).toBe('2026-10-21');
    expect(form.get('document')).toBeInstanceOf(File);
  });

  it('omits end_date and document when absent', () => {
    const form = toCreateMyDispensationForm({
      type: 'other',
      reason: 'Lomba',
      start_date: '2026-10-25',
      document: null,
    });
    expect(form.get('end_date')).toBeNull();
    expect(form.get('document')).toBeNull();
  });
});

describe('query key factory', () => {
  it('nests every /my/* key under the murid root', () => {
    expect(muridKeys.all).toStrictEqual(['murid']);
    expect(muridKeys.profile[0]).toBe('murid');
    expect(muridKeys.attendanceSummary({ from: '2026-09-22', to: '2026-10-21' })[0]).toBe('murid');
    expect(muridKeys.discipline({ from: 'a', to: 'b' })[0]).toBe('murid');
    expect(muridKeys.dispensations({})[0]).toBe('murid');
  });
});
