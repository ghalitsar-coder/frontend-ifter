'use client';

import { Loader2, X } from 'lucide-react';
import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { ApiError } from '@/lib/api/client';
import {
  buildSessionPayload,
  mapSessionError,
  useAssignments,
  useCreateSession,
} from '@/lib/api/presensi-mapel';

const JP_OPTIONS = Array.from({ length: 20 }, (_, index) => index + 1);

const controlClass =
  'h-10 w-full rounded-xl border border-border-control bg-surface-card px-3 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-pine-deep';

const todayIso = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

const errorText = (error: unknown): string =>
  error instanceof ApiError ? mapSessionError(error, 'session') : 'Sesi gagal dibuat.';

/**
 * Creates one lesson meeting (POST /attendance-sessions) from an active
 * teaching assignment, so the roster is fixed by class enrollment the moment
 * the session is saved.
 *
 * @param props - Modal callbacks.
 * @param props.onClose - Closes the modal.
 * @param props.onCreated - Receives the success message and the new session id.
 * @returns Modal overlay.
 */
export function SessionCreateModal(props: {
  onClose: () => void;
  onCreated: (message: string, sessionId: string) => void;
}) {
  const assignmentsQuery = useAssignments({ is_active: true });
  const createMutation = useCreateSession();
  const assignments = assignmentsQuery.data ?? [];
  const [assignmentId, setAssignmentId] = useState('');
  const [sessionDate, setSessionDate] = useState(todayIso);
  const [periodStart, setPeriodStart] = useState('1');
  const [periodEnd, setPeriodEnd] = useState('1');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const draft = {
      teaching_assignment_id: assignmentId,
      session_date: sessionDate,
      period_start: Number(periodStart),
      period_end: Number(periodEnd),
      topic,
      notes,
    };
    try {
      buildSessionPayload(draft);
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : 'Data tidak valid.');
      return;
    }

    createMutation.mutate(draft, {
      onSuccess: (session) => {
        props.onCreated(`Sesi ${session.subject_name} dibuat.`, session.id);
      },
      onError: (mutationError) => {
        setError(errorText(mutationError));
      },
    });
  };

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-create-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-pine-deep/60 p-3 backdrop-blur-md sm:p-6"
    >
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-surface-card shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-pine-deep via-amber-gold to-pine-deep" />
        <div className="flex items-start justify-between gap-4 border-b border-border-control px-5 py-4 sm:px-6">
          <div>
            <h2 id="session-create-title" className="text-lg font-bold text-pine-deep">
              Buat Sesi Absensi
            </h2>
            <p className="text-xs text-text-muted">
              Pilih penugasan aktif, tanggal, dan nomor jam pelajaran keberapa.
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
            Penugasan
            <select
              value={assignmentId}
              onChange={(event) => {
                setAssignmentId(event.target.value);
              }}
              className={controlClass}
            >
              <option value="">— Pilih penugasan aktif —</option>
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.subject_name} — {assignment.class_name} — {assignment.teacher_name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-primary">
              Tanggal
              <input
                type="date"
                value={sessionDate}
                onChange={(event) => {
                  setSessionDate(event.target.value);
                }}
                className={controlClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-primary">
              JP awal
              <select
                value={periodStart}
                onChange={(event) => {
                  setPeriodStart(event.target.value);
                }}
                className={controlClass}
              >
                {JP_OPTIONS.map((jp) => (
                  <option key={jp} value={jp}>
                    JP {jp}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-primary">
              JP akhir
              <select
                value={periodEnd}
                onChange={(event) => {
                  setPeriodEnd(event.target.value);
                }}
                className={controlClass}
              >
                {JP_OPTIONS.map((jp) => (
                  <option key={jp} value={jp}>
                    JP {jp}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-primary">
            Topik
            <input
              type="text"
              value={topic}
              maxLength={200}
              onChange={(event) => {
                setTopic(event.target.value);
              }}
              placeholder="Contoh: Bab 3 — Sistem Persamaan Linear"
              className={controlClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-primary">
            Catatan
            <textarea
              value={notes}
              maxLength={2000}
              rows={3}
              onChange={(event) => {
                setNotes(event.target.value);
              }}
              className={`${controlClass} h-auto py-2`}
            />
          </label>

          {assignmentsQuery.isError && (
            <p className="text-xs font-semibold text-rose-700">
              Daftar penugasan aktif gagal dimuat. Pastikan penugasan guru sudah dibuat di
              Pengaturan.
            </p>
          )}

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
              disabled={createMutation.isPending || assignmentId === ''}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-pine-deep px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Buat Sesi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
