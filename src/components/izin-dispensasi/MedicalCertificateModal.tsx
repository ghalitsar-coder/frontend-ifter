'use client';

import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Eye,
  FileText,
  ShieldCheck,
  Stethoscope,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { DispensationCategory, MedicalCertificateStudent } from '@/types/dispensation';

/**
 * Dark medical certificate modal for sick students.
 *
 * @param props - Sick student profile, close, and submit handlers.
 * @returns Medical certificate modal.
 */
export function MedicalCertificateModal(props: {
  student: MedicalCertificateStudent;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const t = useTranslations('DispensationPage');
  const [category, setCategory] = useState<DispensationCategory>('sakit');
  const [startDate, setStartDate] = useState('2026-10-05');
  const [endDate, setEndDate] = useState('2026-10-06');
  const [fileName, setFileName] = useState<string | null>(props.student.document.fileName);
  const [diagnosis, setDiagnosis] = useState(props.student.diagnosis);
  const canSubmit = fileName !== null && diagnosis.trim().length > 0;
  const initials = props.student.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is already scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="medical-certificate-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
    >
      <div className="relative my-3 w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-pine-deep text-white shadow-2xl sm:my-6">
        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-gold/15 px-2.5 py-1 text-[8px] font-extrabold tracking-wider text-amber-gold uppercase">
              <ShieldCheck className="size-3" />
              {t('med_badge')}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] font-bold text-emerald-100/50">
                {t('med_doc_number', { number: props.student.documentNumber })}
              </span>
              <button
                type="button"
                onClick={props.onClose}
                aria-label={t('btn_close')}
                className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-white/10 text-emerald-100/70 transition-colors hover:bg-white/20 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-2 flex items-start gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-gold/15 text-amber-gold">
              <Stethoscope className="size-4" />
            </span>
            <div>
              <h2
                id="medical-certificate-title"
                className="text-lg leading-tight font-extrabold tracking-tight"
              >
                {t('med_title')}
              </h2>
              <p className="mt-0.5 text-[10px] text-emerald-100/60">
                {t('med_subtitle', {
                  className: props.student.className,
                  session: props.student.sessionLabel,
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-[62vh] space-y-3.5 overflow-y-auto px-5 py-4">
          <div className="flex items-center gap-2.5 rounded-xl bg-white/5 p-2.5">
            <span className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-gold text-[10px] font-extrabold text-pine-deep">
              {initials}
              <BadgeCheck className="absolute -right-1 -bottom-1 size-3.5 rounded-full bg-pine-deep text-amber-gold" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-[11px] font-bold">
                  {props.student.attendanceNumber} · {props.student.name}
                </p>
                <span className="rounded-md bg-rose-300/20 px-1.5 py-0.5 text-[8px] font-bold text-rose-100">
                  {t('med_status')}
                </span>
              </div>
              <p className="text-[9px] text-emerald-100/60">
                {t('med_student_meta', {
                  nisn: props.student.nisn,
                  guardian: props.student.guardian,
                  phone: props.student.guardianPhone,
                })}
              </p>
            </div>
            <div className="hidden shrink-0 text-right sm:block">
              <p className="text-[8px] text-emerald-100/50">{t('med_date_label')}</p>
              <p className="text-[9px] font-bold">{props.student.dateLabel}</p>
            </div>
          </div>

          <div>
            <p className="mb-1 text-[10px] font-bold text-emerald-50">
              {t('med_category_label')}{' '}
              <span className="font-normal text-emerald-100/50">{t('med_required')}</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCategory('sakit');
                }}
                aria-pressed={category === 'sakit'}
                className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-[10px] font-bold transition-colors ${
                  category === 'sakit'
                    ? 'border-amber-gold bg-amber-gold/15 text-amber-gold'
                    : 'border-white/15 bg-white/5 text-emerald-100/60 hover:bg-white/10'
                }`}
              >
                <Stethoscope className="size-3.5" />
                {t('category_sick')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCategory('dispensasi');
                }}
                aria-pressed={category === 'dispensasi'}
                className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-[10px] font-bold transition-colors ${
                  category === 'dispensasi'
                    ? 'border-amber-gold bg-amber-gold/15 text-amber-gold'
                    : 'border-white/15 bg-white/5 text-emerald-100/60 hover:bg-white/10'
                }`}
              >
                <BadgeCheck className="size-3.5" />
                {t('category_dispensation')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label
                htmlFor="med-start"
                className="mb-1 flex items-center gap-1 text-[10px] font-bold text-emerald-50"
              >
                <CalendarDays className="size-3 text-amber-gold" />
                {t('field_start_date')}
              </label>
              <input
                id="med-start"
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);
                }}
                className="h-9 w-full rounded-xl border border-white/15 bg-white/5 px-2.5 text-[10px] text-white focus:ring-2 focus:ring-amber-gold/30 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="med-end"
                className="mb-1 flex items-center gap-1 text-[10px] font-bold text-emerald-50"
              >
                <CalendarDays className="size-3 text-amber-gold" />
                {t('field_end_date')}
              </label>
              <input
                id="med-end"
                type="date"
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value);
                }}
                className="h-9 w-full rounded-xl border border-white/15 bg-white/5 px-2.5 text-[10px] text-white focus:ring-2 focus:ring-amber-gold/30 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <p className="mb-1 flex items-center justify-between gap-2 text-[10px] font-bold text-emerald-50">
              {t('med_upload_title')}
              <span className="text-[8px] font-normal text-emerald-100/50">
                {t('med_upload_hint')}
              </span>
            </p>

            <label
              htmlFor="med-file"
              className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-dashed border-white/20 bg-white/5 px-3 py-3 text-center transition-colors hover:border-amber-gold/50 hover:bg-white/10"
            >
              <Upload className="size-4 text-amber-gold" />
              <span className="text-[10px] text-emerald-100/70">
                {t('upload_drag')}{' '}
                <span className="font-bold text-amber-gold underline underline-offset-2">
                  {t('upload_browse')}
                </span>
              </span>
              <span className="text-[8px] text-emerald-100/40">{t('med_upload_note')}</span>
              <input
                id="med-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="sr-only"
                onChange={(event) => {
                  setFileName(event.target.files?.[0]?.name ?? null);
                }}
              />
            </label>

            {fileName && (
              <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-white/5 p-2.5">
                <FileText className="size-4 shrink-0 text-amber-gold" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-bold text-white">{fileName}</p>
                  <p className="inline-flex items-center gap-1 text-[8px] text-emerald-100/50">
                    {props.student.document.fileSize} ·{' '}
                    <CheckCircle2 className="size-2.5 text-emerald-300" />
                    {t('med_file_valid')}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={t('btn_view')}
                  className="flex size-6 cursor-pointer items-center justify-center rounded-md text-emerald-100/60 hover:bg-white/10 hover:text-white"
                >
                  <Eye className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFileName(null);
                  }}
                  aria-label={t('btn_delete_file')}
                  className="flex size-6 cursor-pointer items-center justify-center rounded-md text-emerald-100/60 hover:bg-white/10 hover:text-rose-200"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="med-diagnosis"
              className="mb-1 flex items-center justify-between gap-2 text-[10px] font-bold text-emerald-50"
            >
              {t('med_note_label')}
              <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[8px] font-normal text-emerald-100/60">
                {t('med_optional')}
              </span>
            </label>
            <textarea
              id="med-diagnosis"
              rows={3}
              value={diagnosis}
              onChange={(event) => {
                setDiagnosis(event.target.value);
              }}
              className="w-full resize-y rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[10px] leading-relaxed text-white focus:ring-2 focus:ring-amber-gold/30 focus:outline-none"
            />
          </div>

          <label className="flex items-start gap-2 rounded-xl bg-white/5 p-2.5 text-[9px] leading-relaxed text-emerald-100/60">
            <input
              type="checkbox"
              defaultChecked
              className="mt-0.5 size-3 shrink-0 accent-amber-gold"
            />
            <span>
              <strong className="font-semibold text-emerald-50">{t('med_notify')}</strong>
              <br />
              {t('med_notify_sub')}
            </span>
          </label>
        </div>

        <div className="border-t border-white/10 px-5 py-4">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={props.onClose}
              className="cursor-pointer rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-semibold text-emerald-100/70 transition-colors hover:bg-white/10"
            >
              {t('btn_cancel')}
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={props.onSubmit}
              className="hover:bg-amber-hover inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-amber-gold px-4 py-2 text-[11px] font-bold text-pine-deep shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShieldCheck className="size-3.5" />
              {t('med_submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
