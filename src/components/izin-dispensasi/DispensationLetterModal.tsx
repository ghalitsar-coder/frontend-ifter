'use client';

import {
  BadgeCheck,
  CalendarDays,
  Eye,
  FileBadge,
  FileText,
  ShieldCheck,
  Star,
  Stethoscope,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { countInclusiveDays } from '@/data/mockDispensation';
import type {
  DispensationCategory,
  DispensationDocument,
  DispensationEvent,
  DispensationStudent,
} from '@/types/dispensation';

/**
 * Compact dispensation and competition letter upload modal.
 *
 * @param props - Student, event, current document, and handlers.
 * @returns Dispensation letter modal.
 */
export function DispensationLetterModal(props: {
  student: DispensationStudent;
  event: DispensationEvent;
  document: DispensationDocument;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const t = useTranslations('DispensationPage');
  const [category, setCategory] = useState<DispensationCategory>('dispensasi');
  const [competition, setCompetition] = useState(props.event.competition);
  const [organizer, setOrganizer] = useState(props.event.organizer);
  const [startDate, setStartDate] = useState(props.event.startIso);
  const [endDate, setEndDate] = useState(props.event.endIso);
  const [letterNumber, setLetterNumber] = useState(props.event.letterNumber);
  const [note, setNote] = useState(
    'Siswa mewakili sekolah dalam pembinaan intensif dan pelaksanaan babak penyisihan OSN bidang Matematika. Seluruh tugas terstruktur diberikan toleransi pengumpulan hingga 12 Oktober 2026.',
  );
  const [fileName, setFileName] = useState<string | null>(props.document.fileName);
  const days = countInclusiveDays(startDate, endDate);
  const canSubmit = competition.trim().length > 0 && fileName !== null;

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is already scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="dispensation-letter-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-3 backdrop-blur-sm sm:p-6"
    >
      <div className="relative my-3 w-full max-w-xl overflow-hidden rounded-3xl border border-border-subtle bg-card shadow-2xl sm:my-6">
        <div className="border-b border-border-subtle px-5 py-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-surface px-2.5 py-1 text-[8px] font-extrabold tracking-wider text-amber-dark uppercase">
              <FileBadge className="size-3" />
              {t('disp_badge')}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] font-bold text-muted-foreground">
                {props.student.requestId}
              </span>
              <button
                type="button"
                onClick={props.onClose}
                aria-label={t('btn_close')}
                className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-surface-container-low text-muted-foreground transition-colors hover:bg-pine-light hover:text-pine-deep"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          <h2
            id="dispensation-letter-title"
            className="mt-2 text-lg leading-tight font-extrabold tracking-tight text-foreground"
          >
            {t('disp_title')}
          </h2>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {t('disp_subtitle', { className: props.student.className })}
          </p>
        </div>

        <div className="max-h-[64vh] space-y-3.5 overflow-y-auto px-5 py-4">
          <div className="flex items-center gap-2.5 rounded-xl bg-surface-container-low p-2.5">
            <span className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-pine-deep text-[10px] font-extrabold text-amber-gold">
              DS
              <BadgeCheck className="absolute -right-1 -bottom-1 size-3.5 rounded-full bg-card text-pine-deep" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-foreground">
                {props.student.attendanceNumber} · {props.student.name}
              </p>
              <p className="text-[9px] text-muted-foreground">
                {t('disp_student_meta', {
                  nisn: props.student.nisn,
                  coach: props.student.coach,
                  phone: props.student.coachPhone,
                })}
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-pine-light px-2 py-0.5 text-[9px] font-bold text-pine-deep">
              {t('category_dispensation')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border-subtle bg-card px-3 py-2">
              <p className="text-[8px] font-bold tracking-wider text-muted-foreground uppercase">
                {t('disp_duration_label')}
              </p>
              <p className="mt-0.5 text-[10px] font-bold text-foreground">
                {t('disp_duration_value', { days })}
              </p>
            </div>
            <div className="rounded-xl border border-border-subtle bg-card px-3 py-2">
              <p className="text-[8px] font-bold tracking-wider text-muted-foreground uppercase">
                {t('event_start_label')}
              </p>
              <p className="mt-0.5 text-[10px] font-bold text-foreground">
                {props.event.startLabel}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-1 text-[10px] font-bold text-foreground">{t('disp_category_label')}</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCategory('sakit');
                }}
                aria-pressed={category === 'sakit'}
                className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-[10px] font-bold transition-colors ${
                  category === 'sakit'
                    ? 'border-pine-deep bg-pine-light text-pine-deep'
                    : 'border-border-subtle bg-card text-muted-foreground hover:border-border-control'
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
                    ? 'border-pine-deep bg-pine-light text-pine-deep'
                    : 'border-border-subtle bg-card text-muted-foreground hover:border-border-control'
                }`}
              >
                <Star className="size-3.5" />
                {t('category_dispensation')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="disp-competition"
                className="mb-1 block text-[10px] font-bold text-foreground"
              >
                {t('disp_competition')} <span className="text-red-600">*</span>
              </label>
              <input
                id="disp-competition"
                value={competition}
                onChange={(event) => {
                  setCompetition(event.target.value);
                }}
                className="h-9 w-full rounded-xl border border-border-control bg-card px-3 text-[11px] text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="disp-organizer"
                className="mb-1 block text-[10px] font-bold text-foreground"
              >
                {t('disp_organizer')} <span className="text-red-600">*</span>
              </label>
              <input
                id="disp-organizer"
                value={organizer}
                onChange={(event) => {
                  setOrganizer(event.target.value);
                }}
                className="h-9 w-full rounded-xl border border-border-control bg-card px-3 text-[11px] text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="disp-start"
                className="mb-1 flex items-center gap-1 text-[10px] font-bold text-foreground"
              >
                <CalendarDays className="size-3 text-pine-deep" />
                {t('field_start_date')} <span className="text-red-600">*</span>
              </label>
              <input
                id="disp-start"
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);
                }}
                className="h-9 w-full rounded-xl border border-border-control bg-card px-2.5 text-[11px] text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="disp-end"
                className="mb-1 flex items-center gap-1 text-[10px] font-bold text-foreground"
              >
                <CalendarDays className="size-3 text-pine-deep" />
                {t('field_end_date')} <span className="text-red-600">*</span>
              </label>
              <input
                id="disp-end"
                type="date"
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value);
                }}
                className="h-9 w-full rounded-xl border border-border-control bg-card px-2.5 text-[11px] text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="disp-letter-number"
                className="mb-1 block text-[10px] font-bold text-foreground"
              >
                {t('disp_letter_number')}
              </label>
              <input
                id="disp-letter-number"
                value={letterNumber}
                onChange={(event) => {
                  setLetterNumber(event.target.value);
                }}
                className="h-9 w-full rounded-xl border border-border-control bg-card px-3 font-mono text-[10px] text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <p className="mb-1 text-[10px] font-bold text-foreground">
              {t('disp_upload')} <span className="text-red-600">*</span>
            </p>
            <label
              htmlFor="disp-file"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border-control bg-surface-container-low/50 px-3 py-2.5 transition-colors hover:border-pine-deep/40 hover:bg-pine-light/40"
            >
              <Upload className="size-3.5 text-pine-deep" />
              <span className="text-[10px] text-muted-foreground">
                {t('upload_drag')}{' '}
                <span className="font-bold text-pine-deep underline underline-offset-2">
                  {t('upload_browse')}
                </span>
              </span>
              <span className="text-[9px] text-muted-foreground">{t('upload_hint')}</span>
              <input
                id="disp-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="sr-only"
                onChange={(event) => {
                  setFileName(event.target.files?.[0]?.name ?? null);
                }}
              />
            </label>

            {fileName && (
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-container-low p-2.5">
                <FileText className="size-4 shrink-0 text-pine-deep" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-bold text-foreground">{fileName}</p>
                  <p className="text-[9px] text-muted-foreground">
                    {t('disp_file_meta', { size: props.document.fileSize })}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={t('btn_view')}
                  className="flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-card hover:text-pine-deep"
                >
                  <Eye className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFileName(null);
                  }}
                  aria-label={t('btn_delete_file')}
                  className="flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-card hover:text-red-600"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="disp-note" className="mb-1 block text-[10px] font-bold text-foreground">
              {t('disp_note_label')}
            </label>
            <textarea
              id="disp-note"
              rows={3}
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
              }}
              className="w-full resize-y rounded-xl border border-border-control bg-card px-3 py-2 text-[10px] leading-relaxed text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
            />
          </div>

          <label className="flex items-start gap-2 text-[10px] leading-relaxed text-muted-foreground">
            <input
              type="checkbox"
              defaultChecked
              className="mt-0.5 size-3 shrink-0 accent-pine-deep"
            />
            {t('disp_notify_parents')}
          </label>
          <label className="flex items-start gap-2 text-[10px] leading-relaxed text-muted-foreground">
            <input
              type="checkbox"
              defaultChecked
              className="mt-0.5 size-3 shrink-0 accent-pine-deep"
            />
            {t('disp_mark_present')}
          </label>
        </div>

        <div className="border-t border-border-subtle bg-surface-container-low/40 px-5 py-4">
          <p className="mb-2.5 flex items-center gap-1.5 text-[9px] font-semibold text-pine-deep">
            <ShieldCheck className="size-3.5" />
            {t('disp_validated')}
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={props.onClose}
              className="cursor-pointer rounded-xl border border-border-control bg-card px-4 py-2 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-surface-container-low"
            >
              {t('btn_cancel')}
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={props.onSubmit}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShieldCheck className="size-3.5 text-amber-gold" />
              {t('disp_submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
