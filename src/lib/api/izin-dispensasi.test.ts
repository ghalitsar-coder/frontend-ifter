import { describe, expect, it } from 'vitest';
import {
  buildCreateDispensationFormData,
  buildVerifyDispensationBody,
  canVerifyDispensation,
  DISPENSATION_PAGE_SIZE,
  dispensationQueryFor,
  formatDayId,
  periodLabel,
  statusLabel,
  toDispensationRow,
  typeLabel,
} from '@/lib/api/izin-dispensasi';
import type { DispensationDto, DispensationFilters } from '@/lib/api/izin-dispensasi';

const baseItem: DispensationDto = {
  id: 'dsp-1',
  student_id: 'stu-1',
  student_name: 'Dimas Saputra',
  class_id: 'cls-1',
  class_name: 'VIII A',
  type: 'permit',
  reason: 'Delegasi OSN Matematika Sleman — Olimpiade Sains Nasional 2026',
  start_date: '2026-10-07',
  end_date: '2026-10-09',
  status: 'pending',
  document_available: true,
  submitted_by: 'user-1',
  verified_by: null,
  verified_at: null,
  note: null,
  created_at: '2026-10-06T08:45:00+07:00',
};

describe('labels', () => {
  it('maps backend types and statuses to Indonesian labels', () => {
    expect({
      sick: typeLabel('sick'),
      late: typeLabel('late'),
      permit: typeLabel('permit'),
      other: typeLabel('other'),
      weird: typeLabel('weird'),
    }).toStrictEqual({
      sick: 'Sakit',
      late: 'Terlambat',
      permit: 'Izin',
      other: 'Lainnya',
      weird: 'weird',
    });

    expect({
      pending: statusLabel('pending'),
      approved: statusLabel('approved'),
      rejected: statusLabel('rejected'),
      weird: statusLabel('weird'),
    }).toStrictEqual({
      pending: 'Menunggu Verifikasi',
      approved: 'Disetujui',
      rejected: 'Ditolak',
      weird: 'weird',
    });
  });
});

describe('date helpers', () => {
  it('formats ISO days without timezone drift', () => {
    expect(formatDayId('2026-10-07')).toBe('7 Okt 2026');
    expect(formatDayId('2026-10-07T08:45:00+07:00')).toBe('7 Okt 2026');
    expect(formatDayId('nope')).toBe('');
  });

  it('builds single-day and range period labels', () => {
    expect(periodLabel('2026-10-07', null)).toBe('7 Okt 2026');
    expect(periodLabel('2026-10-07', '2026-10-07')).toBe('7 Okt 2026');
    expect(periodLabel('2026-10-07', '2026-10-09')).toBe('7 Okt 2026 – 9 Okt 2026');
  });
});

describe('toolbar filters → server query', () => {
  const filters: DispensationFilters = {
    status: 'pending',
    type: 'sick',
    from: '2026-10-01',
    to: '2026-10-31',
  };

  it('keeps active filters and paginates', () => {
    expect(dispensationQueryFor(filters, 2)).toStrictEqual({
      status: 'pending',
      type: 'sick',
      from: '2026-10-01',
      to: '2026-10-31',
      limit: DISPENSATION_PAGE_SIZE,
      offset: DISPENSATION_PAGE_SIZE,
    });
  });

  it('omits all/empty filters and clamps the page', () => {
    expect(dispensationQueryFor({ status: 'all', type: 'all', from: '', to: '' }, 0)).toStrictEqual(
      {
        status: undefined,
        type: undefined,
        from: undefined,
        to: undefined,
        limit: DISPENSATION_PAGE_SIZE,
        offset: 0,
      },
    );
  });
});

describe('verify roles', () => {
  it('allows admin, teacher and duty_teacher only', () => {
    expect(canVerifyDispensation(['admin'])).toBeTruthy();
    expect(canVerifyDispensation(['teacher'])).toBeTruthy();
    expect(canVerifyDispensation(['duty_teacher'])).toBeTruthy();
    expect(canVerifyDispensation(['principal'])).toBeFalsy();
    expect(canVerifyDispensation([])).toBeFalsy();
  });

  it('shows the action when any of several roles qualifies', () => {
    expect(canVerifyDispensation(['principal', 'teacher'])).toBeTruthy();
  });
});

describe('queue row mapper', () => {
  it('maps a dispensation into a table row', () => {
    expect(toDispensationRow(baseItem)).toStrictEqual({
      id: 'dsp-1',
      studentName: 'Dimas Saputra',
      className: 'VIII A',
      typeLabel: 'Izin',
      statusLabel: 'Menunggu Verifikasi',
      status: 'pending',
      period: '7 Okt 2026 – 9 Okt 2026',
      reason: 'Delegasi OSN Matematika Sleman — Olimpiade Sains Nasional 2026',
      note: '—',
      documentAvailable: true,
    });
  });

  it('surfaces the verification note when present', () => {
    const row = toDispensationRow({ ...baseItem, note: 'Surat tugas sudah diverifikasi' });
    expect(row.note).toBe('Surat tugas sudah diverifikasi');
  });
});

describe('multipart create payload', () => {
  it('sets snake_case form fields and the document file part', () => {
    const file = new File(['pdf'], 'surat-tugas.pdf', { type: 'application/pdf' });
    const formData = buildCreateDispensationFormData({
      studentId: 'stu-1',
      type: 'permit',
      reason: 'Delegasi OSN',
      startDate: '2026-10-07',
      endDate: '2026-10-09',
      document: file,
    });

    expect(formData.get('student_id')).toBe('stu-1');
    expect(formData.get('type')).toBe('permit');
    expect(formData.get('reason')).toBe('Delegasi OSN');
    expect(formData.get('document')).toBe(file);
  });

  it('carries the full date range', () => {
    const file = new File(['pdf'], 'surat-tugas.pdf', { type: 'application/pdf' });
    const formData = buildCreateDispensationFormData({
      studentId: 'stu-1',
      type: 'permit',
      reason: 'Delegasi OSN',
      startDate: '2026-10-07',
      endDate: '2026-10-09',
      document: file,
    });

    expect(formData.get('start_date')).toBe('2026-10-07');
    expect(formData.get('end_date')).toBe('2026-10-09');
  });

  it('omits optional end date and file when absent', () => {
    const formData = buildCreateDispensationFormData({
      studentId: 'stu-2',
      type: 'sick',
      reason: 'Sakit sesuai surat dokter',
      startDate: '2026-10-10',
    });

    expect(formData.has('end_date')).toBeFalsy();
    expect(formData.has('document')).toBeFalsy();
  });
});

describe('verify body', () => {
  it('sends status plus a trimmed note when non-blank', () => {
    expect(
      buildVerifyDispensationBody({
        id: 'dsp-1',
        status: 'approved',
        note: ' Sesuai surat tugas ',
      }),
    ).toStrictEqual({ status: 'approved', note: 'Sesuai surat tugas' });
  });

  it('omits blank notes', () => {
    expect(
      buildVerifyDispensationBody({ id: 'dsp-1', status: 'rejected', note: '   ' }),
    ).toStrictEqual({ status: 'rejected' });
    expect(buildVerifyDispensationBody({ id: 'dsp-1', status: 'rejected' })).toStrictEqual({
      status: 'rejected',
    });
  });
});
