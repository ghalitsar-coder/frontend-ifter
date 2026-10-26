'use client';

import { Loader2, X } from 'lucide-react';
import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { ApiError } from '@/lib/api/client';
import { buildSubjectPayload, mapSessionError, useSaveSubject } from '@/lib/api/presensi-mapel';
import type { Subject } from '@/lib/api/presensi-mapel';

const controlClass =
  'h-10 w-full rounded-xl border border-border-control bg-surface-card px-3 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-pine-deep';

const errorText = (error: unknown): string =>
  error instanceof ApiError ? mapSessionError(error, 'subject') : 'Mapel gagal disimpan.';

/**
 * Create-or-edit form of the subject catalog (POST/PUT /subjects). The code is
 * the unique school-facing key, so a 409 is reported as a duplicate code.
 *
 * @param props - Row being edited and the close callback.
 * @param props.subject - Existing row, or null when creating.
 * @param props.onClose - Closes the modal.
 * @param props.onSaved - Receives the success message.
 * @returns Modal overlay.
 */
export function SettingsSubjectModal(props: {
  subject: Subject | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const saveMutation = useSaveSubject();
  const [code, setCode] = useState(props.subject?.code ?? '');
  const [name, setName] = useState(props.subject?.name ?? '');
  const [description, setDescription] = useState(props.subject?.description ?? '');
  const [isActive, setIsActive] = useState(props.subject?.is_active ?? true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const draft = { code, name, description, is_active: isActive };
    try {
      buildSubjectPayload(draft);
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : 'Data tidak valid.');
      return;
    }

    saveMutation.mutate(
      props.subject === null ? draft : { ...draft, subjectId: props.subject.id },
      {
        onSuccess: (saved) => {
          props.onSaved(
            props.subject === null
              ? `Mapel ${saved.name} dibuat.`
              : `Mapel ${saved.name} diperbarui.`,
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
      aria-labelledby="subject-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-pine-deep/60 p-3 backdrop-blur-md sm:p-6"
    >
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-surface-card shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-pine-deep via-amber-gold to-pine-deep" />
        <div className="flex items-start justify-between gap-4 border-b border-border-control px-5 py-4 sm:px-6">
          <div>
            <h2 id="subject-form-title" className="text-lg font-bold text-pine-deep">
              {props.subject === null ? 'Tambah Mapel' : 'Ubah Mapel'}
            </h2>
            <p className="text-xs text-text-muted">
              Kode mapel dipakai pada penugasan guru dan laporan kehadiran.
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[140px_minmax(0,1fr)]">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-primary">
              Kode <span className="text-rose-600">*</span>
              <input
                type="text"
                value={code}
                maxLength={30}
                onChange={(event) => {
                  setCode(event.target.value);
                }}
                placeholder="MTK"
                className={`${controlClass} font-mono`}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-primary">
              Nama Mapel <span className="text-rose-600">*</span>
              <input
                type="text"
                value={name}
                maxLength={150}
                onChange={(event) => {
                  setName(event.target.value);
                }}
                placeholder="Matematika"
                className={controlClass}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-primary">
            Deskripsi
            <textarea
              value={description}
              rows={3}
              onChange={(event) => {
                setDescription(event.target.value);
              }}
              className={`${controlClass} h-auto py-2`}
            />
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-pine-deep">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => {
                setIsActive(event.target.checked);
              }}
              className="size-4 cursor-pointer accent-pine-deep"
            />
            Mapel aktif (dapat dipilih pada penugasan guru)
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
