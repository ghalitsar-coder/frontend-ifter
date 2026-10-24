import { describe, expect, it } from 'vitest';
import { toAttendanceInputs, toPresensiStudent } from '@/services/presensiApi';
import type { SessionAttendance } from '@/services/presensiApi';
import type { PresensiStatus, PresensiStudent } from '@/types/presensi';

function attendanceRow(overrides: Partial<SessionAttendance>): SessionAttendance {
  return {
    keterangan: null,
    nama: 'Budi Santoso',
    nis: '00829107',
    status: 'hadir',
    student_id: 7,
    ...overrides,
  };
}

function student(id: string, status: PresensiStatus, note?: string): PresensiStudent {
  return { id, initials: 'BS', name: 'Budi Santoso', nisn: '00829107', note, status };
}

describe('Presensi roster mapper', () => {
  it('maps a recorded row onto the roster shape', () => {
    expect(toPresensiStudent(attendanceRow({}))).toStrictEqual({
      id: '7',
      initials: 'BS',
      name: 'Budi Santoso',
      nisn: '00829107',
      note: undefined,
      status: 'hadir',
    });
  });

  it('marks a row without a saved status as unrecorded', () => {
    expect(toPresensiStudent(attendanceRow({ status: null })).status).toBe('none');
  });

  it('carries keterangan into the row note', () => {
    const row = toPresensiStudent(attendanceRow({ keterangan: 'Surat dokter', status: 'sakit' }));

    expect(row.note).toBe('Surat dokter');
    expect(row.status).toBe('sakit');
  });

  it('takes initials from the first two words of the name', () => {
    expect(toPresensiStudent(attendanceRow({ nama: 'Intan Permata Sari' })).initials).toBe('IP');
    expect(toPresensiStudent(attendanceRow({ nama: 'budi' })).initials).toBe('B');
  });

  it('leaves nisn empty when the student has no nis', () => {
    expect(toPresensiStudent(attendanceRow({ nis: null })).nisn).toBe('');
  });

  it('round-trips student_id through the row id', () => {
    const row = toPresensiStudent(attendanceRow({ student_id: 1204 }));

    expect(Number(row.id)).toBe(1204);
    expect(row.id).toBe('1204');
  });

  it('leaves the fields the backend cannot source unset', () => {
    const row = toPresensiStudent(attendanceRow({ keterangan: null }));

    expect([row.hasDocument, row.note]).toStrictEqual([undefined, undefined]);
  });
});

describe('Presensi save payload', () => {
  it('sends every marked row and drops the unmarked ones', () => {
    expect(
      toAttendanceInputs([
        student('7', 'hadir'),
        student('8', 'none'),
        student('9', 'sakit', 'Surat dokter'),
      ]),
    ).toStrictEqual([
      { keterangan: null, status: 'hadir', student_id: 7 },
      { keterangan: 'Surat dokter', status: 'sakit', student_id: 9 },
    ]);
  });

  it('sends nothing when the teacher has not marked a single student', () => {
    expect(toAttendanceInputs([student('1', 'none')])).toStrictEqual([]);
  });
});
