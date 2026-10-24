'use client';

import { Check, CloudUpload, Gavel, Search, Send, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { attendanceStatusStyles } from '@/components/koreksi-absensi/statusStyles';
import type { AttendanceStatus as BackendAttendanceStatus, HistoryRecord } from '@/lib/api/dto';
import { correctionTargetOptions, toUiStatus, useRecordLookup } from '@/lib/api/koreksi-absensi';
import { useStudentSearch } from '@/lib/api/queries';

/** Payload lifted to the manager, which owns the POST corrections mutation. */
export type CorrectionRequestPayload = {
  recordId: string;
  studentLabel: string;
  status: BackendAttendanceStatus;
  reason: string;
};

type InitialTarget = { studentId: string; studentName: string; nis: string; date: string };

type StudentOption = { id: string; fullName: string; nis: string; className: string };

/**
 * Build the select options from the loaded student page, prepending the
 * prefilled student when it is not part of the fetched list.
 * @param initial - Row prefill from the audit table (null for a fresh request).
 * @param studentId - Currently selected student id.
 * @param loadedOptions - Students returned by GET /students.
 * @returns Options for the student select.
 */
function buildStudentOptions(
  initial: InitialTarget | null,
  studentId: string,
  loadedOptions: StudentOption[],
): StudentOption[] {
  if (initial === null || studentId === '' || initial.studentId === '') {
    return loadedOptions;
  }
  if (loadedOptions.some((student) => student.id === initial.studentId)) {
    return loadedOptions;
  }
  return [
    { id: initial.studentId, fullName: initial.studentName, nis: initial.nis, className: '-' },
    ...loadedOptions,
  ];
}

/**
 * Shows the current recorded status of the attendance entry resolved via
 * GET /attendance/history for the picked student + date.
 * @param props - Selection state and the located record (null when missing).
 * @returns Status hint node.
 */
function RecordStatusChip(props: {
  picked: boolean;
  pending: boolean;
  record: HistoryRecord | null;
}) {
  const t = useTranslations('AttendanceCorrectionPage');

  if (!props.picked) {
    return <>Belum ada rekor terpilih</>;
  }
  if (props.pending) {
    return <>Mencari rekor absensi…</>;
  }
  if (props.record === null) {
    return <>Tidak ada rekor absensi pada tanggal ini</>;
  }

  return (
    <>
      {'Tercatat: '}
      <span
        className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${attendanceStatusStyles[toUiStatus(props.record.status)]}`}
      >
        {t(`status_${toUiStatus(props.record.status)}`)}
        {props.record.status === 'late' ? ' (Terlambat)' : ''}
      </span>
    </>
  );
}

/**
 * Applicant identity block in the modal footer (from the real auth session).
 * @returns Avatar initials, name, and roles of the signed-in staff member.
 */
function ApplicantIdentity() {
  const t = useTranslations('AttendanceCorrectionPage');
  const { user } = useAuth();
  const fullName = user?.full_name ?? '—';
  const initials = fullName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pine-deep text-[10px] font-bold text-amber-gold">
        {initials}
      </span>
      <div>
        <p className="text-[11px] font-bold text-foreground">{fullName}</p>
        <p className="text-[9px] text-muted-foreground">Peran: {user?.roles.join(', ') ?? '—'}</p>
      </div>
      <span className="rounded-full bg-pine-light px-2 py-0.5 text-[9px] font-bold text-pine-deep">
        {t('applicant_valid')}
      </span>
    </div>
  );
}

/**
 * Correction form: pick a student + school date, the app resolves the attendance
 * record via GET /attendance/history, and submit posts a correction to
 * POST /attendance/records/:id/corrections (reason mandatory, enforced here).
 *
 * @param props - Optional row prefill, submitting flag, close and submit handlers.
 * @returns Correction request modal.
 */
export function CorrectionRequestModal(props: {
  initial: InitialTarget | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CorrectionRequestPayload) => void;
}) {
  const t = useTranslations('AttendanceCorrectionPage');
  const [studentId, setStudentId] = useState(props.initial?.studentId ?? '');
  const [studentQuery, setStudentQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [date, setDate] = useState(props.initial?.date ?? '');
  const [toStatus, setToStatus] = useState<BackendAttendanceStatus>('sick');
  const [reason, setReason] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);

  const studentsQuery = useStudentSearch({
    search: appliedQuery === '' ? undefined : appliedQuery,
    status: 'active',
    limit: 50,
  });
  const recordQuery = useRecordLookup(studentId, date);
  const record = recordQuery.data ?? null;

  // Prefilled student may sit outside the first 50 results — show it explicitly.
  const loadedOptions = (studentsQuery.data ?? []).map((student) => ({
    id: student.id,
    fullName: student.full_name,
    nis: student.student_number,
    className: student.current_class?.name ?? '-',
  }));
  const studentOptions = buildStudentOptions(props.initial, studentId, loadedOptions);

  const selectedStudent = studentOptions.find((student) => student.id === studentId);
  const studentLabel = selectedStudent
    ? `${selectedStudent.fullName} (${selectedStudent.nis})`
    : '';

  const canSubmit = reason.trim().length > 0 && record !== null && !props.submitting;

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is already scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="correction-request-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-3 backdrop-blur-sm sm:p-6"
    >
      <div className="relative my-3 w-full max-w-2xl overflow-hidden rounded-3xl border border-border-subtle bg-card shadow-2xl sm:my-6">
        <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-5 py-4 sm:px-6">
          <div>
            <h2
              id="correction-request-title"
              className="text-lg font-extrabold tracking-tight text-foreground"
            >
              {t('request_title')}
            </h2>
            <p className="text-[11px] text-muted-foreground">{t('request_subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            aria-label={t('btn_close')}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface-container-low text-muted-foreground transition-colors hover:bg-pine-light hover:text-pine-deep"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[68vh] space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="correction-student"
                className="mb-1 block text-[11px] font-bold text-foreground"
              >
                {t('field_student')} <span className="text-red-600">*</span>
              </label>
              <form
                className="relative mb-1.5"
                onSubmit={(event) => {
                  event.preventDefault();
                  setAppliedQuery(studentQuery.trim());
                }}
              >
                <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={studentQuery}
                  onChange={(event) => {
                    setStudentQuery(event.target.value);
                  }}
                  placeholder={t('search_placeholder')}
                  aria-label={t('search_placeholder')}
                  className="h-9 w-full rounded-xl border border-border-control bg-card pr-3 pl-9 text-[11px] text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
                />
              </form>
              <select
                id="correction-student"
                value={studentId}
                onChange={(event) => {
                  setStudentId(event.target.value);
                }}
                className="h-10 w-full cursor-pointer rounded-xl border border-border-control bg-card px-3 text-xs text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
              >
                <option value="">— pilih siswa —</option>
                {studentOptions.map((student) => (
                  <option key={student.id} value={student.id}>
                    {t('student_option', {
                      name: student.fullName,
                      className: student.className,
                      nis: student.nis,
                    })}
                  </option>
                ))}
              </select>
              {studentsQuery.isError && (
                <p className="mt-1 text-[10px] text-red-600">Gagal memuat daftar siswa.</p>
              )}
            </div>

            <div>
              <label
                htmlFor="correction-date"
                className="mb-1 block text-[11px] font-bold text-foreground"
              >
                {t('field_date')} <span className="text-red-600">*</span>
              </label>
              <input
                id="correction-date"
                type="date"
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                }}
                className="h-10 w-full rounded-xl border border-border-control bg-card px-3 text-xs text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
              />
            </div>

            <div>
              <p className="mb-1 block text-[11px] font-bold text-foreground">{t('col_change')}</p>
              <p className="flex h-10 items-center gap-2 rounded-xl border border-border-subtle bg-surface-container-low/60 px-3 text-[11px] text-muted-foreground">
                <RecordStatusChip
                  picked={studentId !== '' && date !== ''}
                  pending={recordQuery.isPending}
                  record={record}
                />
              </p>
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-bold text-foreground">{t('matrix_title')}</p>
            <div className="rounded-2xl border border-amber-gold/40 bg-amber-surface/70 p-3">
              <p className="mb-2 text-[10px] font-bold tracking-wider text-amber-dark uppercase">
                {t('matrix_to')}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {correctionTargetOptions.map((option) => {
                  const isSelected = toStatus === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setToStatus(option.value);
                      }}
                      aria-pressed={isSelected}
                      className={`cursor-pointer rounded-xl border px-2.5 py-2 text-left transition-colors ${
                        isSelected
                          ? 'border-pine-deep bg-pine-light ring-1 ring-pine-deep/20'
                          : 'border-amber-gold/30 bg-card hover:border-amber-gold'
                      }`}
                    >
                      <span className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-bold text-foreground">
                          {option.label}
                        </span>
                        <span
                          className={`flex size-3 items-center justify-center rounded-full border ${
                            isSelected ? 'border-pine-deep bg-pine-deep' : 'border-border-control'
                          }`}
                        >
                          {isSelected && <span className="size-1 rounded-full bg-white" />}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[9px] text-muted-foreground">
                        {option.note}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="correction-reason"
              className="mb-1 block text-[11px] font-bold text-foreground"
            >
              {t('field_reason')} <span className="text-red-600">*</span>
            </label>
            <textarea
              id="correction-reason"
              rows={3}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
              }}
              placeholder={t('reason_placeholder')}
              className="w-full resize-y rounded-xl border border-border-control bg-card px-3 py-2 text-xs leading-relaxed text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
            />
            <p className="mt-0.5 text-[9px] text-muted-foreground">{t('reason_hint')}</p>
          </div>

          <div>
            <p className="mb-1 block text-[11px] font-bold text-foreground">{t('field_upload')}</p>
            <label
              htmlFor="correction-evidence"
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border-control bg-surface-container-low/50 px-3 py-3 transition-colors hover:border-pine-deep/40 hover:bg-pine-light/40"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pine-light text-pine-deep">
                {fileName ? <Check className="size-4" /> : <CloudUpload className="size-4" />}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-foreground">
                  {fileName ?? t('upload_prompt')}
                </span>
                {/* shortcut: no backend endpoint for correction evidence files, keep mock — the file is not sent */}
                <span className="block text-[10px] text-muted-foreground">{t('upload_hint')}</span>
              </span>
              <input
                id="correction-evidence"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="sr-only"
                onChange={(event) => {
                  setFileName(event.target.files?.[0]?.name ?? null);
                }}
              />
            </label>
            <p className="mt-1 text-[9px] text-muted-foreground">
              Berkas pendukung belum dikirim ke server (belum ada endpoint unggah).
            </p>
          </div>
        </div>

        <div className="border-t border-border-subtle bg-surface-container-low/40 px-5 py-4 sm:px-6">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <ApplicantIdentity />

            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={props.onClose}
                className="cursor-pointer rounded-xl border border-border-control bg-card px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-surface-container-low"
              >
                {t('btn_cancel')}
              </button>
              <button
                type="button"
                disabled={!canSubmit}
                onClick={() => {
                  if (record === null) {
                    return;
                  }
                  props.onSubmit({
                    recordId: record.id,
                    studentLabel,
                    status: toStatus,
                    reason: reason.trim(),
                  });
                }}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="size-3.5 text-amber-gold" />
                {props.submitting ? 'Mengirim…' : t('btn_submit')}
              </button>
            </div>
          </div>

          <p className="mt-3 flex items-start gap-1.5 text-[9px] leading-relaxed text-muted-foreground">
            <Gavel className="mt-0.5 size-3 shrink-0 text-amber-dark" />
            {t('request_audit_note')}
          </p>
        </div>
      </div>
    </div>
  );
}
