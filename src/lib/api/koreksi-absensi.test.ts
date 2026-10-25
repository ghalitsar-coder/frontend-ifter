import { afterEach, describe, expect, it, vi } from 'vitest';
import { setAccessToken } from '@/lib/api/client';
import type { AttendanceCorrection, HistoryRecord } from '@/lib/api/dto';
import {
  buildEvidenceFormData,
  changeFilterToStatus,
  correctionTargetOptions,
  EVIDENCE_ACCEPT,
  evidenceFileError,
  filterRowsBySearch,
  formatDateId,
  formatFileSize,
  formatTimeId,
  historyQueryFor,
  isoDayToday,
  MAX_EVIDENCE_FILE_BYTES,
  pageMeta,
  shortHash,
  sourceLabel,
  statusNote,
  toBackendStatus,
  toCorrectionRow,
  toTrailEntry,
  toUiStatus,
  unwrapRecordDetail,
  uploadCorrectionEvidence,
} from '@/lib/api/koreksi-absensi';
import type { CorrectionHistoryFilters, CorrectionRecordDetail } from '@/lib/api/koreksi-absensi';

const baseRecord: HistoryRecord = {
  id: 'rec-9f2a7c',
  date: '2026-10-23',
  status: 'sick',
  check_in_at: '2026-10-23T07:12:00+07:00',
  notes: 'Surat keterangan dokter',
  source: 'bulk',
  student_id: 'stu-1',
  student_number: '00829103',
  student_name: 'Dimas Saputra',
  class_id: 'cls-1',
  class_name: 'VIII A',
  academic_year_id: 'ay-1',
  academic_year_name: '2026/2027',
  closed: true,
  created_at: '2026-10-23T07:00:00+07:00',
  updated_at: '2026-10-24T09:15:00+07:00',
};

const baseCorrection: AttendanceCorrection = {
  id: 'cor-1',
  attendance_record_id: 'rec-9f2a7c',
  old_status: 'absent',
  new_status: 'sick',
  reason: 'SKD menyusul dari RSUD',
  corrected_by_user_id: 'user-abc123',
  corrected_at: '2026-10-24T09:15:00+07:00',
};

/** Record-detail fixture (`GET /attendance/records/:id` carries extra audit ids). */
const baseDetail: CorrectionRecordDetail = {
  ...baseRecord,
  enrollment_id: 'enr-1',
  recorded_by_user_id: 'user-abc123',
  updated_by_user_id: 'user-abc123',
  corrections: [],
};

/**
 * Reads the multipart `file` part without an unchecked assertion.
 * @param form - Multipart body built by the API client.
 * @returns The uploaded file part.
 */
const formFile = (form: FormData): File => {
  const part = form.get('file');
  if (!(part instanceof File)) {
    throw new TypeError('expected the multipart file part');
  }
  return part;
};

describe('status mapping', () => {
  it('maps backend statuses to UI codes', () => {
    expect({
      present: toUiStatus('present'),
      late: toUiStatus('late'),
      sick: toUiStatus('sick'),
      excused: toUiStatus('excused'),
      absent: toUiStatus('absent'),
      unknown: toUiStatus('unknown'),
    }).toStrictEqual({
      present: 'hadir',
      late: 'hadir',
      sick: 'sakit',
      excused: 'izin',
      absent: 'alpa',
      unknown: 'alpa',
    });
  });

  it('maps UI codes back to supported backend statuses', () => {
    expect({
      hadir: toBackendStatus('hadir'),
      sakit: toBackendStatus('sakit'),
      izin: toBackendStatus('izin'),
      alpa: toBackendStatus('alpa'),
      // dispensasi has no backend status — falls back to the closest one
      dispensasi: toBackendStatus('dispensasi'),
    }).toStrictEqual({
      hadir: 'present',
      sakit: 'sick',
      izin: 'excused',
      alpa: 'absent',
      dispensasi: 'excused',
    });
  });

  it('maps toolbar change filters to a history status param', () => {
    expect(changeFilterToStatus).toStrictEqual({
      all: undefined,
      alpa_sakit: 'sick',
      alpa_izin: 'excused',
      izin_hadir: 'present',
      // shortcut: no `dispensasi` status in the backend, `excused` is the nearest filter
      dispensasi: 'excused',
    });
  });

  it('exposes correction target options with unique backend values', () => {
    const values = correctionTargetOptions.map((option) => option.value);

    expect(values).toHaveLength(5);
    expect(new Set(values).size).toBe(5);
    expect(values).toStrictEqual(
      expect.arrayContaining(['present', 'late', 'sick', 'excused', 'absent']),
    );
  });
});

describe('labels and dates', () => {
  it('labels statuses and sources in Indonesian', () => {
    expect({
      late: statusNote('late'),
      present: statusNote('present'),
      weird: statusNote('weird'),
      bulk: sourceLabel('bulk'),
      other: sourceLabel('other'),
    }).toStrictEqual({
      late: 'Terlambat',
      present: 'Hadir',
      weird: 'weird',
      bulk: 'Entri Massal Guru',
      other: 'other',
    });
  });

  it('formats ISO dates without timezone drift', () => {
    expect(formatDateId('2026-10-24')).toBe('24 Okt 2026');
    expect(formatDateId('2026-10-24T09:15:00+07:00')).toBe('24 Okt 2026');
    expect(formatDateId('nope')).toBe('');
  });

  it('formats ISO times', () => {
    expect(formatTimeId('2026-10-24T09:15:00+07:00')).toBe('09.15');
    expect(formatTimeId('2026-10-24')).toBe('');
  });

  it('produces ISO day strings', () => {
    expect(isoDayToday()).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
  });
});

describe('row mapper (GET /attendance/history)', () => {
  it('maps a history record into an audit-table row', () => {
    const row = toCorrectionRow(baseRecord);

    expect({
      id: row.id,
      recordId: row.recordId,
      studentId: row.studentId,
      student: row.student,
      loggedDate: row.loggedDate,
      loggedTime: row.loggedTime,
      sessionDate: row.sessionDate,
      sessionIso: row.sessionIso,
      sessionLabel: row.sessionLabel,
      status: row.status,
      reason: row.reason,
      sourceLabel: row.sourceLabel,
    }).toStrictEqual({
      id: 'LOG-9F2A7C',
      recordId: 'rec-9f2a7c',
      studentId: 'stu-1',
      student: { name: 'Dimas Saputra', nis: '00829103', className: 'VIII A' },
      loggedDate: '24 Okt 2026',
      loggedTime: '09.15',
      sessionDate: '23 Okt 2026',
      sessionIso: '2026-10-23',
      sessionLabel: 'Absen 07.12',
      status: 'sakit',
      reason: 'Surat keterangan dokter',
      sourceLabel: 'Entri Massal Guru',
    });
    expect(row.closed).toBeTruthy();
    expect(row.isLate).toBeFalsy();
  });

  it('falls back to lock/record labels and a dash note', () => {
    const closed = toCorrectionRow({ ...baseRecord, check_in_at: undefined, notes: undefined });
    const open = toCorrectionRow({
      ...baseRecord,
      closed: false,
      check_in_at: undefined,
      notes: undefined,
    });

    expect(closed.sessionLabel).toBe('Ditutup');
    expect(open.sessionLabel).toBe('Tercatat');
    expect(open.reason).toBe('—');
  });

  it('flags late records', () => {
    expect(toCorrectionRow({ ...baseRecord, status: 'late' }).isLate).toBeTruthy();
  });
});

describe('trail mapper (record corrections)', () => {
  const evidenceHash = '9b74f9b9ff50a5bdd7d45d1e1b1c4a72e2d0c9e5f6a7b8c9d0e1f2a3b4c5d6e7';

  it('maps a backend correction into a ledger trail entry', () => {
    const entry = toTrailEntry(baseCorrection);

    expect({
      fromStatus: entry.fromStatus,
      toStatus: entry.toStatus,
      toNote: entry.toNote,
      reason: entry.reason,
      loggedDate: entry.loggedDate,
      loggedTime: entry.loggedTime,
      officerName: entry.officerName,
      evidenceHash: entry.evidenceHash,
    }).toStrictEqual({
      fromStatus: 'alpa',
      toStatus: 'sakit',
      toNote: 'Sakit',
      reason: 'SKD menyusul dari RSUD',
      loggedDate: '24 Okt 2026',
      loggedTime: '09.15',
      officerName: 'Operator c123',
      // pre-migration rows omit evidence_hash on the wire → null in the view-model
      evidenceHash: null,
    });
  });

  it('carries the server-computed evidence_hash through untouched', () => {
    expect(toTrailEntry({ ...baseCorrection, evidence_hash: evidenceHash }).evidenceHash).toBe(
      evidenceHash,
    );
    expect(toTrailEntry({ ...baseCorrection, evidence_hash: null }).evidenceHash).toBeNull();
  });

  it('notes late targets', () => {
    expect(toTrailEntry({ ...baseCorrection, new_status: 'late' }).toNote).toBe('Hadir Terlambat');
  });
});

describe(shortHash, () => {
  it('truncates long hashes keeping head and tail', () => {
    expect(shortHash('9b74f9b9ff50a5bdd7d45d1e1b1c4a72')).toBe('9b74f9b9…1b1c4a72');
  });

  it('leaves short strings untouched', () => {
    expect(shortHash('abc123')).toBe('abc123');
    expect(shortHash('1234567890123456')).toBe('1234567890123456');
  });
});

describe('record detail unwrap', () => {
  it('accepts the flat record body', () => {
    const detail = unwrapRecordDetail({ ...baseDetail, corrections: [baseCorrection] });

    expect(detail.corrections).toHaveLength(1);
  });

  it('accepts a {record} wrapper and defaults missing corrections', () => {
    const wrapped = unwrapRecordDetail({ ...baseDetail, record: { ...baseDetail } });

    expect(wrapped.corrections).toStrictEqual([]);
    expect(wrapped.id).toBe('rec-9f2a7c');
  });
});

describe('toolbar filters → server query', () => {
  const filters: CorrectionHistoryFilters = {
    search: 'dimas',
    change: 'alpa_sakit',
    classId: 'cls-1',
    from: '2026-10-01',
    to: '2026-10-24',
  };

  it('builds a server query from toolbar filters and page', () => {
    expect(historyQueryFor(filters, 3)).toStrictEqual({
      from: '2026-10-01',
      to: '2026-10-24',
      class_id: 'cls-1',
      status: 'sick',
      limit: 5,
      offset: 10,
    });
  });

  it('omits all/empty filters', () => {
    const query = historyQueryFor(
      { ...filters, change: 'all', classId: 'all', from: '', to: '' },
      0,
    );

    expect(query.class_id).toBeUndefined();
    expect(query.status).toBeUndefined();
    expect(query.from).toBeUndefined();
    expect(query.offset).toBe(0);
  });
});

describe('pagination meta', () => {
  it('computes bounds from the server total', () => {
    expect(pageMeta(18, 2, 5)).toStrictEqual({
      page: 2,
      totalPages: 4,
      start: 6,
      end: 10,
      total: 18,
    });
  });

  it('clamps empty and overflowing pages', () => {
    expect(pageMeta(0, 1, 0)).toStrictEqual({ page: 1, totalPages: 1, start: 0, end: 0, total: 0 });
    expect(pageMeta(3, 9, 3).page).toBe(1);
  });
});

describe('client-side row search', () => {
  it('filters the loaded page by name or NIS', () => {
    const rows = [
      toCorrectionRow(baseRecord),
      toCorrectionRow({
        ...baseRecord,
        id: 'rec-2',
        student_name: 'Nadia Azzahra',
        student_number: '00829144',
      }),
    ];

    expect(filterRowsBySearch(rows, '')).toHaveLength(2);
    expect(filterRowsBySearch(rows, 'DIMAS')).toHaveLength(1);
    expect(filterRowsBySearch(rows, '00829103')).toHaveLength(1);
    expect(filterRowsBySearch(rows, 'zzz')).toHaveLength(0);
  });
});

const evidenceFile = (name: string, size: number, type = 'application/pdf') =>
  new File([new Uint8Array(size)], name, { type });

describe('correction evidence helpers (§6.6)', () => {
  it('accepts PDF/JPG/JPEG/PNG under the size limit', () => {
    expect(evidenceFileError(evidenceFile('surat.pdf', 1024))).toBeNull();
    expect(evidenceFileError(evidenceFile('foto.jpg', 1024))).toBeNull();
    expect(evidenceFileError(evidenceFile('foto.JPEG', 1024))).toBeNull();
    expect(evidenceFileError(evidenceFile('bukti.png', 1024))).toBeNull();
  });

  it('rejects empty, oversized, and unsupported files with Indonesian messages', () => {
    expect(evidenceFileError(evidenceFile('kosong.pdf', 0))).toBe(
      'Berkas kosong — pilih berkas lain.',
    );
    expect(evidenceFileError(evidenceFile('besar.pdf', MAX_EVIDENCE_FILE_BYTES + 1))).toBe(
      'Ukuran berkas maksimal 5.0 MB.',
    );
    expect(evidenceFileError(evidenceFile('dokumen.docx', 128))).toBe(
      'Format berkas harus PDF, JPG, JPEG, atau PNG.',
    );
  });

  it('exposes the picker accept list used by both modals', () => {
    expect(EVIDENCE_ACCEPT).toBe('.pdf,.jpg,.jpeg,.png');
  });

  it('formats evidence sizes', () => {
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(2048)).toBe('2 KB');
    expect(formatFileSize(1_572_864)).toBe('1.5 MB');
  });

  it('builds multipart form data with optional note and correction id', () => {
    const file = evidenceFile('surat.pdf', 64);
    const form = buildEvidenceFormData({ file, note: '  SKD dokter  ', correctionId: 'corr-1' });

    expect(formFile(form).name).toBe('surat.pdf');
    expect(form.get('note')).toBe('SKD dokter');
    expect(form.get('correction_id')).toBe('corr-1');
  });

  it('omits blank note and empty correction id from the multipart body', () => {
    const form = buildEvidenceFormData({ file: evidenceFile('bukti.png', 8), note: '   ' });

    expect(form.get('note')).toBeNull();
    expect(form.get('correction_id')).toBeNull();
  });
});

describe('upload correction evidence (POST …/corrections/evidence)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    setAccessToken(null);
  });

  it('posts the multipart body and unwraps the evidence envelope', async () => {
    const fetchMock = vi.fn<typeof globalThis.fetch>();
    vi.stubGlobal('fetch', fetchMock);
    setAccessToken('tok');

    fetchMock.mockResolvedValueOnce(
      Response.json(
        {
          evidence: {
            id: 'ev-1',
            attendance_record_id: 'rec-1',
            correction_id: 'corr-1',
            file_name: 'surat.pdf',
            content_type: 'application/pdf',
            size_bytes: 64,
            note: 'SKD dokter',
            uploaded_by: 'u-1',
            created_at: '2026-10-01T00:00:00Z',
          },
        },
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const evidence = await uploadCorrectionEvidence({
      recordId: 'rec-1',
      file: evidenceFile('surat.pdf', 64),
      note: 'SKD dokter',
      correctionId: 'corr-1',
    });

    expect(evidence.id).toBe('ev-1');
    expect(evidence.file_name).toBe('surat.pdf');

    const [request, init] = fetchMock.mock.calls[0] ?? [];
    if (typeof request !== 'string') {
      throw new TypeError('expected the evidence POST URL to be a string');
    }
    expect(request).toContain('/api/v1/attendance/records/rec-1/corrections/evidence');
    expect(init?.method).toBe('POST');
    const body = init?.body;
    if (!(body instanceof FormData)) {
      throw new TypeError('expected the evidence body to be FormData');
    }
    expect({
      fileName: formFile(body).name,
      note: body.get('note'),
      correctionId: body.get('correction_id'),
    }).toStrictEqual({
      fileName: 'surat.pdf',
      note: 'SKD dokter',
      correctionId: 'corr-1',
    });
  });
});
