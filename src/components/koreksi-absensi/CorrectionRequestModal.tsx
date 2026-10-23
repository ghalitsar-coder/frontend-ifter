'use client';

import { Check, CloudUpload, Gavel, Send, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  mockCorrectionStudents,
  mockInitialStatusOptions,
  mockNewStatusOptions,
} from '@/data/mockAttendanceCorrection';
import type { AttendanceStatus } from '@/types/attendanceCorrection';

/**
 * Correction request form with status matrix, chronology, and evidence upload.
 *
 * @param props - Close and submit handlers.
 * @returns Request modal.
 */
export function CorrectionRequestModal(props: {
  onClose: () => void;
  onSubmit: (payload: {
    student: string;
    fromStatus: AttendanceStatus;
    toStatus: AttendanceStatus;
    reason: string;
  }) => void;
}) {
  const t = useTranslations('AttendanceCorrectionPage');
  const [studentIndex, setStudentIndex] = useState(0);
  const [fromStatus, setFromStatus] = useState<AttendanceStatus>('alpa');
  const [toStatus, setToStatus] = useState<AttendanceStatus>('sakit');
  const [reason, setReason] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);

  const canSubmit = reason.trim().length > 0 && fileName !== null;

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
              <select
                id="correction-student"
                value={studentIndex}
                onChange={(event) => {
                  setStudentIndex(Number(event.target.value));
                }}
                className="h-10 w-full cursor-pointer rounded-xl border border-border-control bg-card px-3 text-xs text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
              >
                {mockCorrectionStudents.map((student, index) => (
                  <option key={student.nis} value={index}>
                    {t('student_option', {
                      name: student.name,
                      className: student.className,
                      nis: student.nis,
                    })}
                  </option>
                ))}
              </select>
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
                defaultValue="2026-10-24"
                className="h-10 w-full rounded-xl border border-border-control bg-card px-3 text-xs text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="correction-session"
                className="mb-1 block text-[11px] font-bold text-foreground"
              >
                {t('field_session')} <span className="text-red-600">*</span>
              </label>
              <select
                id="correction-session"
                defaultValue="full"
                className="h-10 w-full cursor-pointer rounded-xl border border-border-control bg-card px-3 text-xs text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
              >
                <option value="full">{t('session_full')}</option>
                <option value="morning">{t('session_morning')}</option>
                <option value="afternoon">{t('session_afternoon')}</option>
              </select>
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-bold text-foreground">{t('matrix_title')}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border-subtle bg-surface-container-low/60 p-3">
                <p className="mb-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  {t('matrix_from')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {mockInitialStatusOptions.map((option) => {
                    const isSelected = fromStatus === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setFromStatus(option.id);
                        }}
                        aria-pressed={isSelected}
                        className={`cursor-pointer rounded-xl border px-2.5 py-2 text-left transition-colors ${
                          isSelected
                            ? 'border-pine-deep bg-pine-light ring-1 ring-pine-deep/20'
                            : 'border-border-subtle bg-card hover:border-border-control'
                        }`}
                      >
                        <span className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-bold text-foreground">
                            {t(`status_${option.id}`)}
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

              <div className="rounded-2xl border border-amber-gold/40 bg-amber-surface/70 p-3">
                <p className="mb-2 text-[10px] font-bold tracking-wider text-amber-dark uppercase">
                  {t('matrix_to')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {mockNewStatusOptions.map((option) => {
                    const isSelected = toStatus === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setToStatus(option.id);
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
                            {t(`status_${option.id}`)}
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
            <p className="mb-1 block text-[11px] font-bold text-foreground">
              {t('field_upload')} <span className="text-red-600">*</span>
            </p>
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
          </div>
        </div>

        <div className="border-t border-border-subtle bg-surface-container-low/40 px-5 py-4 sm:px-6">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pine-deep text-[10px] font-bold text-amber-gold">
                SR
              </span>
              <div>
                <p className="text-[11px] font-bold text-foreground">{t('applicant_name')}</p>
                <p className="text-[9px] text-muted-foreground">{t('applicant_role')}</p>
              </div>
              <span className="rounded-full bg-pine-light px-2 py-0.5 text-[9px] font-bold text-pine-deep">
                {t('applicant_valid')}
              </span>
            </div>

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
                  const student = mockCorrectionStudents[studentIndex];

                  props.onSubmit({
                    student: student ? `${student.name} (${student.nis})` : '',
                    fromStatus,
                    toStatus,
                    reason: reason.trim(),
                  });
                }}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="size-3.5 text-amber-gold" />
                {t('btn_submit')}
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
