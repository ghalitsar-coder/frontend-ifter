'use client';

import { GraduationCap, Loader2, X } from 'lucide-react';
import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { ApiError } from '@/lib/api/client';
import type { AcademicYear, Class } from '@/lib/api/dto';
import {
  buildCreateClassPayload,
  buildUpdateClassPayload,
  useCreateClass,
  useUpdateClass,
} from '@/lib/api/master-kelas';

const GRADE_OPTIONS = [7, 8, 9, 10, 11, 12] as const;

const activeYearId = (years: AcademicYear[]): string =>
  years.find((year) => year.is_active)?.id ?? years[0]?.id ?? '';

type FormValues = {
  name: string;
  gradeLevel: number;
  academicYearId: string;
  major: string;
};

const initialValues = (
  classRecord: Class | undefined,
  academicYears: AcademicYear[],
): FormValues => ({
  name: classRecord?.name ?? '',
  gradeLevel: classRecord?.grade_level ?? 7,
  academicYearId: classRecord?.academic_year_id ?? activeYearId(academicYears),
  major: classRecord?.major ?? '',
});

const errorText = (error: unknown): string =>
  error instanceof ApiError ? error.message : 'Terjadi kesalahan tak terduga.';

/**
 * Create/edit modal for a class (name, grade 7-12, academic year, optional major).
 *
 * @param props - Modal inputs and callbacks.
 * @param props.mode - Whether the form creates or edits a class.
 * @param props.classRecord - Source class record when editing.
 * @param props.academicYears - Academic year options from GET /academic-years.
 * @param props.onClose - Closes the modal.
 * @param props.onSaved - Receives the success toast message.
 * @returns Modal overlay.
 */
export function ClassFormModal(props: {
  mode: 'create' | 'edit';
  classRecord?: Class;
  academicYears: AcademicYear[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const initial = initialValues(props.classRecord, props.academicYears);
  const [name, setName] = useState(initial.name);
  const [gradeLevel, setGradeLevel] = useState<number>(initial.gradeLevel);
  const [academicYearId, setAcademicYearId] = useState(initial.academicYearId);
  const [major, setMajor] = useState(initial.major);
  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreateClass();
  const updateMutation = useUpdateClass();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isEdit = props.mode === 'edit' && props.classRecord !== undefined;
  // Fall back to the active year so an early open (years still loading) does
  // not submit an empty year id once the options arrive.
  const selectedYearId = academicYearId === '' ? activeYearId(props.academicYears) : academicYearId;
  const hasCurrentYear = props.academicYears.some((year) => year.id === academicYearId);

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const draft = { name, gradeLevel, academicYearId: selectedYearId, major };
    try {
      if (props.mode === 'edit' && props.classRecord !== undefined) {
        const payload = buildUpdateClassPayload(draft);
        updateMutation.mutate(
          { classId: props.classRecord.id, ...payload },
          {
            onSuccess: () => {
              props.onSaved(`Kelas ${payload.name} berhasil diperbarui.`);
            },
            onError: (mutationError) => {
              setError(errorText(mutationError));
            },
          },
        );
        return;
      }
      const payload = buildCreateClassPayload(draft);
      createMutation.mutate(payload, {
        onSuccess: () => {
          props.onSaved(`Kelas ${payload.name} berhasil ditambahkan.`);
        },
        onError: (mutationError) => {
          setError(errorText(mutationError));
        },
      });
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : 'Data tidak valid.');
    }
  };

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="class-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-pine-deep/60 p-3 backdrop-blur-md sm:p-6"
    >
      <div className="bg-surface-card flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-pine-deep via-amber-gold to-pine-deep" />
        <div className="flex items-start justify-between gap-4 border-b border-border-control px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pine-light text-pine-deep">
              <GraduationCap className="size-5" />
            </span>
            <div>
              <h2 id="class-form-title" className="text-lg font-bold text-pine-deep">
                {isEdit ? 'Edit Kelas' : 'Tambah Kelas'}
              </h2>
              <p className="text-text-muted text-xs">
                {isEdit
                  ? 'Perbarui nama, tingkat, dan jurusan kelas.'
                  : 'Buat rombel baru untuk tahun ajaran berjalan.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            aria-label="Tutup"
            className="text-text-muted hover:bg-surface-container hover:text-text-primary flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-surface-container-low transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-6"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="class-name" className="text-text-primary text-xs font-semibold">
              Nama Kelas <span className="text-rose-600">*</span>
            </label>
            <input
              id="class-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
              }}
              maxLength={100}
              placeholder="Contoh: 7A"
              required
              className="bg-surface-card text-text-primary placeholder:text-text-muted h-10 w-full rounded-xl border border-border-control px-3 text-sm focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="class-grade" className="text-text-primary text-xs font-semibold">
                Tingkat <span className="text-rose-600">*</span>
              </label>
              <select
                id="class-grade"
                value={gradeLevel}
                onChange={(event) => {
                  setGradeLevel(Number(event.target.value));
                }}
                className="bg-surface-card text-text-primary h-10 w-full cursor-pointer rounded-xl border border-border-control px-3 text-sm focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
              >
                {GRADE_OPTIONS.map((grade) => (
                  <option key={grade} value={grade}>
                    Tingkat {grade}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="class-year" className="text-text-primary text-xs font-semibold">
                Tahun Ajaran <span className="text-rose-600">*</span>
              </label>
              <select
                id="class-year"
                value={selectedYearId}
                onChange={(event) => {
                  setAcademicYearId(event.target.value);
                }}
                disabled={isEdit}
                className="bg-surface-card text-text-primary h-10 w-full cursor-pointer rounded-xl border border-border-control px-3 text-sm focus:ring-2 focus:ring-pine-deep/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                {props.academicYears.length === 0 && !isEdit && (
                  <option value="">Memuat tahun ajaran…</option>
                )}
                {isEdit && !hasCurrentYear && (
                  <option value={academicYearId}>
                    {props.classRecord?.academic_year_name ?? academicYearId}
                  </option>
                )}
                {props.academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name}
                    {year.is_active ? ' (Aktif)' : ''}
                  </option>
                ))}
              </select>
              {isEdit && (
                <span className="text-text-muted text-[11px]">
                  Tahun ajaran tidak dapat diubah setelah kelas dibuat.
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="class-major" className="text-text-primary text-xs font-semibold">
              Jurusan <span className="text-text-muted font-normal">(opsional)</span>
            </label>
            <input
              id="class-major"
              type="text"
              value={major}
              onChange={(event) => {
                setMajor(event.target.value);
              }}
              maxLength={100}
              placeholder="Contoh: IPA / IPS"
              className="bg-surface-card text-text-primary placeholder:text-text-muted h-10 w-full rounded-xl border border-border-control px-3 text-sm focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
            />
          </div>

          {error !== null && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
            >
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={props.onClose}
              className="text-text-primary bg-surface-card cursor-pointer rounded-xl border border-border-control px-4 py-2 text-sm font-semibold transition-colors hover:bg-surface-container-low"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-pine-deep px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? 'Simpan Perubahan' : 'Tambah Kelas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
