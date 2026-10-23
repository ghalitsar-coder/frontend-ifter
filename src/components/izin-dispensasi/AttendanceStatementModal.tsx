'use client';

import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Eye,
  FileText,
  RefreshCw,
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
  DispensationCoverage,
  DispensationDocument,
  DispensationEvent,
  DispensationStudent,
} from '@/types/dispensation';

/**
 * Full absence statement modal with sub-classification and session coverage.
 *
 * @param props - Student, event, current coverage and document, and handlers.
 * @returns Absence statement modal.
 */
export function AttendanceStatementModal(props: {
  student: DispensationStudent;
  event: DispensationEvent;
  document: DispensationDocument;
  coverage: DispensationCoverage;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const t = useTranslations('DispensationPage');
  const [category, setCategory] = useState<DispensationCategory>('dispensasi');
  const [subcategory, setSubcategory] = useState('competition');
  const [detail, setDetail] = useState(props.event.competition);
  const [startDate, setStartDate] = useState(props.event.startIso);
  const [endDate, setEndDate] = useState(props.event.endIso);
  const [coverage, setCoverage] = useState<DispensationCoverage>(props.coverage);
  const [fileName, setFileName] = useState<string | null>(props.document.fileName);
  const [note, setNote] = useState(
    'Siswa mewakili sekolah dalam ajang OSN Matematika tingkat Kabupaten Sleman. Diberikan dispensasi presensi penuh dan berhak mengikuti penugasan/ulangan susulan tanpa sanksi akademik.',
  );
  const days = countInclusiveDays(startDate, endDate);
  const canSubmit = detail.trim().length > 0 && fileName !== null;

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is already scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="attendance-statement-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-3 backdrop-blur-sm sm:p-6"
    >
      <div className="relative my-3 w-full max-w-xl overflow-hidden rounded-3xl border border-border-subtle bg-card shadow-2xl sm:my-6">
        <div className="border-b border-border-subtle px-5 py-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pine-light px-2.5 py-1 text-[8px] font-extrabold tracking-wider text-pine-deep uppercase">
              <FileText className="size-3" />
              {t('statement_badge')}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] font-bold text-muted-foreground">
                #IZN-202610-088
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
            id="attendance-statement-title"
            className="mt-2 text-lg leading-tight font-extrabold tracking-tight text-foreground"
          >
            {t('statement_title')}
          </h2>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {t('statement_subtitle', { className: props.student.className })}
          </p>
        </div>

        <div className="max-h-[62vh] space-y-3.5 overflow-y-auto px-5 py-4">
          <div className="flex items-center gap-2.5 rounded-xl bg-surface-container-low p-2.5">
            <span className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-pine-deep text-[10px] font-extrabold text-amber-gold">
              DS
              <BadgeCheck className="absolute -right-1 -bottom-1 size-3.5 rounded-full bg-card text-pine-deep" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-[11px] font-bold text-foreground">
                  {props.student.attendanceNumber} · {props.student.name}
                </p>
                <span className="rounded-md bg-pine-light px-1.5 py-0.5 text-[8px] font-bold text-pine-deep">
                  {t('statement_status')}
                </span>
              </div>
              <p className="text-[9px] text-muted-foreground">
                {t('statement_student_meta', {
                  nisn: props.student.nisn,
                  guardian: 'Hendra S.',
                  phone: '0812-7890-4421',
                })}
              </p>
            </div>
            <div className="hidden shrink-0 text-right sm:block">
              <p className="text-[8px] text-muted-foreground">{t('statement_coach_label')}</p>
              <p className="text-[9px] font-bold text-foreground">{props.student.coach}</p>
            </div>
          </div>

          <div>
            <p className="mb-1 text-[10px] font-bold text-foreground">
              {t('statement_category')} <span className="text-red-600">*</span>
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

          <div>
            <label
              htmlFor="statement-subcategory"
              className="mb-1 block text-[10px] font-bold text-foreground"
            >
              {t('statement_subcategory')} <span className="text-red-600">*</span>
            </label>
            <select
              id="statement-subcategory"
              value={subcategory}
              onChange={(event) => {
                setSubcategory(event.target.value);
              }}
              className="h-9 w-full cursor-pointer rounded-xl border border-border-control bg-card px-3 text-[10px] text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
            >
              <option value="competition">{t('statement_sub_competition')}</option>
              <option value="family">{t('statement_sub_family')}</option>
              <option value="organization">{t('statement_sub_organization')}</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="statement-detail"
              className="mb-1 block text-[10px] font-bold text-foreground"
            >
              {t('statement_detail')} <span className="text-red-600">*</span>
            </label>
            <input
              id="statement-detail"
              value={detail}
              onChange={(event) => {
                setDetail(event.target.value);
              }}
              className="h-9 w-full rounded-xl border border-border-control bg-card px-3 text-[10px] text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
            />
          </div>

          <div>
            <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
              <p className="text-[10px] font-bold text-foreground">
                {t('statement_range')} <span className="text-red-600">*</span>
              </p>
              <span className="rounded-full bg-amber-surface px-2 py-0.5 text-[8px] font-bold text-amber-dark">
                {t('statement_duration', { days })}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="statement-start"
                  className="mb-0.5 flex items-center gap-1 text-[9px] text-muted-foreground"
                >
                  <CalendarDays className="size-2.5 text-pine-deep" />
                  {t('field_start_date')}
                </label>
                <input
                  id="statement-start"
                  type="date"
                  value={startDate}
                  onChange={(event) => {
                    setStartDate(event.target.value);
                  }}
                  className="h-9 w-full rounded-xl border border-border-control bg-card px-2.5 text-[10px] text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="statement-end"
                  className="mb-0.5 flex items-center gap-1 text-[9px] text-muted-foreground"
                >
                  <CalendarDays className="size-2.5 text-pine-deep" />
                  {t('field_end_date')}
                </label>
                <input
                  id="statement-end"
                  type="date"
                  value={endDate}
                  onChange={(event) => {
                    setEndDate(event.target.value);
                  }}
                  className="h-9 w-full rounded-xl border border-border-control bg-card px-2.5 text-[10px] text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="mb-1 text-[10px] font-bold text-foreground">{t('statement_coverage')}</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(['full', 'partial'] as const).map((option) => {
                const isSelected = coverage === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setCoverage(option);
                    }}
                    aria-pressed={isSelected}
                    className={`cursor-pointer rounded-xl border p-2.5 text-left transition-colors ${
                      isSelected
                        ? 'border-pine-deep bg-pine-light ring-1 ring-pine-deep/20'
                        : 'border-border-subtle bg-card hover:border-border-control'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-foreground">
                        {t(`coverage_${option}_title`)}
                      </span>
                      <span
                        className={`flex size-3 shrink-0 items-center justify-center rounded-full border ${
                          isSelected ? 'border-pine-deep bg-pine-deep' : 'border-border-control'
                        }`}
                      >
                        {isSelected && <span className="size-1 rounded-full bg-white" />}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[9px] leading-relaxed text-muted-foreground">
                      {t(`coverage_${option}_desc`)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-1 flex items-center justify-between gap-2 text-[10px] font-bold text-foreground">
              {t('statement_file_title')}
              <span className="text-[8px] font-normal text-muted-foreground">
                {t('statement_file_hint')}
              </span>
            </p>

            {fileName && (
              <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-container-low p-2.5">
                <FileText className="size-4 shrink-0 text-pine-deep" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-bold text-foreground">{fileName}</p>
                  <p className="text-[8px] text-muted-foreground">
                    {t('statement_file_meta', {
                      size: props.document.fileSize,
                      uploader: props.document.uploadedBy,
                    })}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-pine-light px-1.5 py-0.5 text-[8px] font-bold text-pine-deep">
                  <CheckCircle2 className="size-2.5" />
                  {t('file_verified')}
                </span>
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

            <label
              htmlFor="statement-file"
              className="mt-1.5 flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-control bg-surface-container-low/40 px-3 py-2 text-[9px] text-muted-foreground transition-colors hover:border-pine-deep/40 hover:bg-pine-light/40"
            >
              {fileName ? (
                <RefreshCw className="size-3 text-pine-deep" />
              ) : (
                <Upload className="size-3 text-pine-deep" />
              )}
              {t('statement_replace_hint')}{' '}
              <span className="font-bold text-pine-deep underline underline-offset-2">
                {t('upload_browse')}
              </span>
              )
              <input
                id="statement-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="sr-only"
                onChange={(event) => {
                  setFileName(event.target.files?.[0]?.name ?? null);
                }}
              />
            </label>
          </div>

          <div>
            <label
              htmlFor="statement-note"
              className="mb-1 block text-[10px] font-bold text-foreground"
            >
              {t('statement_note_title')}
            </label>
            <textarea
              id="statement-note"
              rows={3}
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
              }}
              className="w-full resize-y rounded-xl border border-border-control bg-card px-3 py-2 text-[10px] leading-relaxed text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
            />
          </div>

          <label className="flex items-start gap-2 rounded-xl bg-surface-container-low p-2.5 text-[9px] leading-relaxed text-muted-foreground">
            <input
              type="checkbox"
              defaultChecked
              className="mt-0.5 size-3 shrink-0 accent-pine-deep"
            />
            <span>
              <strong className="font-semibold text-foreground">
                {t('statement_notify_parents')}
              </strong>
              <br />
              {t('statement_notify_parents_sub', {
                phone: '0812-7890-4421',
                guardian: 'Hendra Saputra',
              })}
            </span>
          </label>

          <label className="flex items-start gap-2 rounded-xl bg-surface-container-low p-2.5 text-[9px] leading-relaxed text-muted-foreground">
            <input
              type="checkbox"
              defaultChecked
              className="mt-0.5 size-3 shrink-0 accent-pine-deep"
            />
            <span>
              <strong className="font-semibold text-foreground">{t('statement_sync')}</strong>
              <br />
              {t('statement_sync_sub')}
            </span>
          </label>
        </div>

        <div className="border-t border-border-subtle bg-surface-container-low/40 px-5 py-4">
          <p className="mb-2.5 flex items-center gap-1.5 text-[9px] font-semibold text-pine-deep">
            <ShieldCheck className="size-3.5" />
            {t('statement_register_note')}
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
              {t('statement_submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
