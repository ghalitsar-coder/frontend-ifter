'use client';

import { Loader2, X } from 'lucide-react';
import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { ApiError } from '@/lib/api/client';
import { useMasterGuruTeachers } from '@/lib/api/master-guru';
import { useMasterKelasList } from '@/lib/api/master-kelas';
import {
  buildAssignmentPayload,
  mapSessionError,
  useSaveAssignment,
  useSubjects,
} from '@/lib/api/presensi-mapel';
import type { TeachingAssignment } from '@/lib/api/presensi-mapel';

const controlClass =
  'h-10 w-full cursor-pointer rounded-xl border border-border-control bg-surface-card px-3 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-pine-deep';

const errorText = (error: unknown): string =>
  error instanceof ApiError ? mapSessionError(error, 'assignment') : 'Penugasan gagal disimpan.';

/**
 * Create-or-edit form of a teacher × subject × class assignment. The backend
 * keeps one row per triple, so a repeated combination surfaces as a duplicate.
 *
 * @param props - Row being edited and the close callback.
 * @param props.assignment - Existing row, or null when creating.
 * @param props.onClose - Closes the modal.
 * @param props.onSaved - Receives the success message.
 * @returns Modal overlay.
 */
export function SettingsTeachingAssignmentModal(props: {
  assignment: TeachingAssignment | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const saveMutation = useSaveAssignment();
  const teachersQuery = useMasterGuruTeachers();
  const subjectsQuery = useSubjects({ is_active: true });
  const classesQuery = useMasterKelasList();
  const [teacherId, setTeacherId] = useState(props.assignment?.teacher_id ?? '');
  const [subjectId, setSubjectId] = useState(props.assignment?.subject_id ?? '');
  const [classId, setClassId] = useState(props.assignment?.class_id ?? '');
  const [isActive, setIsActive] = useState(props.assignment?.is_active ?? true);
  const [error, setError] = useState<string | null>(null);

  const teachers = teachersQuery.data?.data ?? [];
  const subjects = subjectsQuery.data ?? [];
  const classes = classesQuery.data?.data ?? [];

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const draft = {
      teacher_id: teacherId,
      subject_id: subjectId,
      class_id: classId,
      is_active: isActive,
    };
    try {
      buildAssignmentPayload(draft);
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : 'Data tidak valid.');
      return;
    }

    saveMutation.mutate(
      props.assignment === null ? draft : { ...draft, assignmentId: props.assignment.id },
      {
        onSuccess: (saved) => {
          props.onSaved(
            props.assignment === null
              ? `Penugasan ${saved.teacher_name} disimpan.`
              : `Penugasan ${saved.teacher_name} diperbarui.`,
          );
        },
        onError: (mutationError) => {
          setError(errorText(mutationError));
        },
      },
    );
  };

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="assignment-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-pine-deep/60 p-3 backdrop-blur-md sm:p-6"
    >
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-surface-card shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-pine-deep via-amber-gold to-pine-deep" />
        <div className="flex items-start justify-between gap-4 border-b border-border-control px-5 py-4 sm:px-6">
          <div>
            <h2 id="assignment-form-title" className="text-lg font-bold text-pine-deep">
              {props.assignment === null ? 'Tambah Penugasan' : 'Ubah Penugasan'}
            </h2>
            <p className="text-xs text-text-muted">
              Satu penugasan untuk tiap kombinasi guru, mapel, dan kelas.
            </p>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            aria-label="Tutup"
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-surface-container-low text-text-muted transition-colors hover:bg-surface-container hover:text-text-primary"
          >
            <X className="size-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-6"
        >
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-primary">
            Guru <span className="text-rose-600">*</span>
            <select
              value={teacherId}
              onChange={(event) => {
                setTeacherId(event.target.value);
              }}
              className={controlClass}
            >
              <option value="">— Pilih guru —</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.full_name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-primary">
              Mapel <span className="text-rose-600">*</span>
              <select
                value={subjectId}
                onChange={(event) => {
                  setSubjectId(event.target.value);
                }}
                className={controlClass}
              >
                <option value="">— Pilih mapel —</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code} — {subject.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-primary">
              Kelas <span className="text-rose-600">*</span>
              <select
                value={classId}
                onChange={(event) => {
                  setClassId(event.target.value);
                }}
                className={controlClass}
              >
                <option value="">— Pilih kelas —</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-pine-deep">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => {
                setIsActive(event.target.checked);
              }}
              className="size-4 cursor-pointer accent-pine-deep"
            />
            Penugasan aktif (masih mengajar dan dapat dibuatkan sesi)
          </label>

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
              className="cursor-pointer rounded-xl border border-border-control bg-surface-card px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-container-low"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-pine-deep px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
