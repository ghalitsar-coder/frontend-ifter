'use client';

import { Loader2, UserCheck, X } from 'lucide-react';
import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { ApiError } from '@/lib/api/client';
import type { Class } from '@/lib/api/dto';
import { buildHomeroomPayload, useAssignHomeroom } from '@/lib/api/master-kelas';
import { useTeacherOptions } from '@/lib/api/queries';

const errorText = (error: unknown): string =>
  error instanceof ApiError ? error.message : 'Terjadi kesalahan tak terduga.';

/**
 * Assigns or replaces the homeroom teacher of a class (PUT /classes/:id/homeroom).
 *
 * @param props - Modal inputs and callbacks.
 * @param props.classRecord - Class being assigned.
 * @param props.onClose - Closes the modal.
 * @param props.onSaved - Receives the success toast message.
 * @returns Modal overlay.
 */
export function ClassHomeroomModal(props: {
  classRecord: Class;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  // Start empty: the current teacher may be inactive and absent from the
  // active-only options, so a pre-filled id would silently submit a stale value.
  const [teacherId, setTeacherId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const teachersQuery = useTeacherOptions({ status: 'active', limit: 100 });
  const assignMutation = useAssignHomeroom();
  const teachers = teachersQuery.data ?? [];

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      const payload = buildHomeroomPayload(teacherId, startDate);
      assignMutation.mutate(
        { classId: props.classRecord.id, ...payload },
        {
          onSuccess: () => {
            props.onSaved(`Wali kelas ${props.classRecord.name} berhasil ditetapkan.`);
          },
          onError: (mutationError) => {
            setError(errorText(mutationError));
          },
        },
      );
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : 'Data tidak valid.');
    }
  };

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="class-homeroom-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-pine-deep/60 p-3 backdrop-blur-md sm:p-6"
    >
      <div className="bg-surface-card flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-pine-deep via-amber-gold to-pine-deep" />
        <div className="flex items-start justify-between gap-4 border-b border-border-control px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pine-light text-pine-deep">
              <UserCheck className="size-5" />
            </span>
            <div>
              <h2 id="class-homeroom-title" className="text-lg font-bold text-pine-deep">
                Penugasan Wali Kelas
              </h2>
              <p className="text-text-muted text-xs">
                {props.classRecord.name} • {props.classRecord.academic_year_name}
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5 sm:px-6">
          <div className="rounded-xl border border-border-control bg-surface-container-low px-3 py-2.5 text-xs">
            <span className="text-text-muted">Wali kelas saat ini: </span>
            <span className="text-text-primary font-semibold">
              {props.classRecord.homeroom_teacher_name?.trim() ?? 'Belum ditugaskan'}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="homeroom-teacher" className="text-text-primary text-xs font-semibold">
              Guru Aktif <span className="text-rose-600">*</span>
            </label>
            <select
              id="homeroom-teacher"
              value={teacherId}
              onChange={(event) => {
                setTeacherId(event.target.value);
              }}
              required
              className="bg-surface-card text-text-primary h-10 w-full cursor-pointer rounded-xl border border-border-control px-3 text-sm focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
            >
              <option value="">
                {teachersQuery.isLoading ? 'Memuat guru…' : 'Pilih guru aktif'}
              </option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.full_name}
                  {teacher.employee_number === undefined ? '' : ` — ${teacher.employee_number}`}
                </option>
              ))}
            </select>
            {teachersQuery.isError && (
              <span className="text-xs text-rose-700">Gagal memuat daftar guru.</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="homeroom-start" className="text-text-primary text-xs font-semibold">
              Tanggal Mulai <span className="text-text-muted font-normal">(opsional)</span>
            </label>
            <input
              id="homeroom-start"
              type="date"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value);
              }}
              className="bg-surface-card text-text-primary h-10 w-full rounded-xl border border-border-control px-3 text-sm focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
            />
            <span className="text-text-muted text-[11px]">
              Kosongkan untuk memakai tanggal mulai tahun ajaran.
            </span>
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
              disabled={assignMutation.isPending}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-pine-deep px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {assignMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Tetapkan Wali Kelas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
