'use client';

import { ArrowLeft, Lock, Save, UserCheck, Users } from 'lucide-react';
import { useState } from 'react';
import { AttendanceConfirmDialog } from '@/components/presensi/AttendanceConfirmDialog';
import type { ConfirmRequest } from '@/components/presensi/AttendanceConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { attendanceStatusLabel } from '@/lib/api/murid';
import {
  buildRecordsPayload,
  mapSessionError,
  recordStatusOptions,
  sessionStatusLabel,
  useCloseSession,
  useSaveSessionRecords,
  useSession,
  useSessionRoster,
} from '@/lib/api/presensi-mapel';
import type { AttendanceSession } from '@/lib/api/presensi-mapel';

const selectClass =
  'h-9 w-full cursor-pointer rounded-xl border border-border-control bg-surface-card px-2 text-xs font-semibold text-pine-deep outline-none focus-visible:ring-2 focus-visible:ring-pine-deep';
const noteClass =
  'h-9 w-full rounded-xl border border-border-control bg-surface-card px-2 text-xs text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-pine-deep';

/** One roster row after applying the local draft over the saved record. */
type EditableRow = {
  student_id: string;
  full_name: string;
  student_number: string;
  status: string;
  note: string;
};

/**
 * Local edits of one student. A key stays absent until the operator touches it,
 * so changing the note never blanks the saved status.
 */
type RowDraft = {
  status?: string;
  note?: string;
};

/**
 * One editable roster row: the student identity plus the status and note
 * draft. Kept separate so the panel stays focused on the session state.
 *
 * @param props - Row data plus the draft handlers.
 * @param props.row - Roster row with the local draft applied.
 * @param props.isClosed - Whether the session freezes the inputs.
 * @param props.onStatusChange - Receives the student id and the new status.
 * @param props.onNoteChange - Receives the student id and the new note.
 * @returns List item for one student.
 */
function SessionRosterRow(props: {
  row: EditableRow;
  isClosed: boolean;
  onStatusChange: (studentId: string, status: string) => void;
  onNoteChange: (studentId: string, note: string) => void;
}) {
  return (
    <li className="grid grid-cols-1 items-center gap-2 rounded-xl border border-border-control bg-surface-container-low p-2.5 sm:grid-cols-[minmax(0,1fr)_150px_minmax(0,1fr)]">
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-text-primary">{props.row.full_name}</p>
        <p className="font-mono text-[11px] text-text-muted">{props.row.student_number}</p>
      </div>
      <select
        value={props.row.status}
        disabled={props.isClosed}
        onChange={(event) => {
          props.onStatusChange(props.row.student_id, event.target.value);
        }}
        aria-label={`Status absensi ${props.row.full_name}`}
        className={`${selectClass} disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <option value="">— Pilih status —</option>
        {recordStatusOptions.map((status) => (
          <option key={status} value={status}>
            {attendanceStatusLabel(status)}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={props.row.note}
        maxLength={500}
        disabled={props.isClosed}
        onChange={(event) => {
          props.onNoteChange(props.row.student_id, event.target.value);
        }}
        placeholder="Catatan (opsional)"
        aria-label={`Catatan absensi ${props.row.full_name}`}
        className={`${noteClass} disabled:cursor-not-allowed disabled:opacity-60`}
      />
    </li>
  );
}

/**
 * Header card of a session: identity, status, progress and the messages of the
 * two write actions.
 *
 * @param props - Session plus the derived counters and handlers.
 * @param props.session - Session being displayed.
 * @param props.isClosed - Whether the session is frozen.
 * @param props.total - Number of students in the roster.
 * @param props.markedCount - Number of students with a status chosen.
 * @param props.saveError - Validation or request message for the save action.
 * @param props.closeError - Request message for the close action.
 * @param props.onBack - Returns to the session list.
 * @param props.onMarkAll - Marks every student present.
 * @returns Session summary card.
 */
function SessionSummaryCard(props: {
  session: AttendanceSession;
  isClosed: boolean;
  total: number;
  markedCount: number;
  saveError: string | null;
  closeError: string | null;
  onBack: () => void;
  onMarkAll: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border-control bg-surface-card p-4 shadow-xs sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={props.onBack}
            aria-label="Kembali ke daftar sesi"
            className="flex size-9 cursor-pointer items-center justify-center rounded-xl bg-surface-container-low text-text-muted transition-colors hover:bg-pine-light hover:text-pine-deep"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-pine-deep sm:text-lg">
              {props.session.subject_name} — {props.session.class_name}
            </h2>
            <p className="text-xs text-text-muted">
              {props.session.session_date} · JP {props.session.period_start}
              {props.session.period_end === props.session.period_start
                ? ''
                : `–${props.session.period_end}`}{' '}
              · {props.session.teacher_name}
            </p>
            {props.session.topic !== null && props.session.topic !== '' && (
              <p className="mt-1 text-xs text-text-primary">Topik: {props.session.topic}</p>
            )}
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-bold ${
            props.isClosed
              ? 'bg-surface-container-low text-text-muted'
              : 'bg-pine-light text-pine-deep'
          }`}
        >
          {sessionStatusLabel(props.session.status)}
        </span>
      </div>

      {props.isClosed && (
        <div className="flex items-start gap-2 rounded-xl border border-border-control bg-surface-container-low px-3 py-2 text-xs text-text-muted">
          <Lock className="mt-0.5 size-3.5 shrink-0" />
          Sesi sudah ditutup. Isian di bawah hanya untuk dibaca.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={props.isClosed || props.total === 0}
          onClick={props.onMarkAll}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-border-control bg-surface-container-low px-3 py-1.5 text-xs font-bold text-pine-deep transition-colors hover:bg-pine-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          <UserCheck className="size-3.5" />
          Tandai semua hadir
        </button>
        <span className="text-[11px] font-semibold text-text-muted">
          {props.markedCount} dari {props.total} siswa ditandai
        </span>
      </div>

      {props.saveError !== null && (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
        >
          {props.saveError}
        </p>
      )}
      {props.closeError !== null && (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
        >
          {props.closeError}
        </p>
      )}
    </div>
  );
}

/**
 * Roster of one session with the status of every enrolled student. Unmarked
 * rows are skipped on save, a closed session is read-only, and closing asks
 * for an explicit confirmation because it freezes the records.
 *
 * @param props - Session id and the callback to leave the detail view.
 * @param props.sessionId - Session being edited.
 * @param props.onBack - Returns to the session list.
 * @param props.onSaved - Receives the toast message after a save.
 * @returns Session detail card.
 */
export function SessionDetailPanel(props: {
  sessionId: string;
  onBack: () => void;
  onSaved: (message: string) => void;
}) {
  const sessionQuery = useSession(props.sessionId);
  const rosterQuery = useSessionRoster(props.sessionId);
  const saveMutation = useSaveSessionRecords();
  const closeMutation = useCloseSession();
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingClose, setPendingClose] = useState(false);

  const session = sessionQuery.data;
  const roster = rosterQuery.data ?? [];
  const isClosed = session?.status === 'closed';

  const rows: EditableRow[] = roster.map((entry) => {
    const draft = drafts[entry.student_id];
    return {
      student_id: entry.student_id,
      full_name: entry.full_name,
      student_number: entry.student_number,
      status: draft?.status ?? entry.status ?? '',
      note: draft?.note ?? entry.note ?? '',
    };
  });
  const markedCount = rows.filter((row) => row.status !== '').length;

  const setStatus = (studentId: string, status: string) => {
    setDrafts((prev) => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
  };

  const setNote = (studentId: string, note: string) => {
    setDrafts((prev) => ({ ...prev, [studentId]: { ...prev[studentId], note } }));
  };

  const markAllPresent = () => {
    const next: Record<string, RowDraft> = {};
    for (const row of rows) {
      next[row.student_id] = { status: 'present', note: row.note };
    }
    setDrafts(next);
  };

  const handleSave = () => {
    setFormError(null);
    try {
      // Validated here so the message appears before the request is sent; the
      // mutation builds the same payload again on the way out.
      buildRecordsPayload(rows);
    } catch (validationError) {
      setFormError(
        validationError instanceof Error ? validationError.message : 'Data tidak valid.',
      );
      return;
    }
    saveMutation.mutate(
      { sessionId: props.sessionId, rows },
      {
        onSuccess: (records) => {
          props.onSaved(`Absensi tersimpan (${records.length} siswa).`);
        },
      },
    );
  };

  const confirmClose = () => {
    closeMutation.mutate(props.sessionId, {
      onSuccess: () => {
        setPendingClose(false);
        props.onSaved('Sesi ditutup dan tidak dapat diubah lagi.');
      },
    });
  };

  const closeRequest: ConfirmRequest | null = pendingClose
    ? {
        message:
          'Tutup sesi ini? Setelah tertutup, status absensi tidak bisa diubah lagi dan sesi tidak dapat ditutup ulang.',
        confirmLabel: 'Tutup Sesi',
        onConfirm: confirmClose,
      }
    : null;

  if (sessionQuery.isPending || rosterQuery.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const listError = sessionQuery.isError ? sessionQuery.error : rosterQuery.error;
  if (listError !== undefined && (sessionQuery.isError || rosterQuery.isError)) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-border-control bg-surface-card p-5 shadow-xs">
        <p className="text-sm text-rose-700">{mapSessionError(listError, 'session')}</p>
        <button
          type="button"
          onClick={props.onBack}
          className="w-fit text-xs font-bold text-pine-deep underline"
        >
          Kembali ke daftar sesi
        </button>
      </div>
    );
  }

  if (session === undefined) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <SessionSummaryCard
        session={session}
        isClosed={isClosed}
        total={rows.length}
        markedCount={markedCount}
        saveError={
          formError ??
          (saveMutation.isError ? mapSessionError(saveMutation.error, 'records') : null)
        }
        closeError={closeMutation.isError ? mapSessionError(closeMutation.error, 'close') : null}
        onBack={props.onBack}
        onMarkAll={markAllPresent}
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-border-control bg-surface-card p-4 shadow-xs sm:p-5">
        <div className="flex items-center gap-2 border-b border-border-control pb-3">
          <Users className="size-4 text-pine-deep" />
          <h3 className="text-sm font-bold text-pine-deep">Daftar Siswa</h3>
        </div>

        {rows.length === 0 && (
          <p className="py-6 text-center text-sm text-text-muted">
            Kelas ini belum punya siswa aktif. Tambahkan anggota kelas lewat halaman Kelas.
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <SessionRosterRow
              key={row.student_id}
              row={row}
              isClosed={isClosed}
              onStatusChange={setStatus}
              onNoteChange={setNote}
            />
          ))}
        </ul>

        {!isClosed && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border-control pt-3">
            <button
              type="button"
              onClick={() => {
                setPendingClose(true);
              }}
              className="cursor-pointer rounded-xl border border-border-control bg-surface-card px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-container-low"
            >
              Tutup Sesi
            </button>
            <button
              type="button"
              disabled={saveMutation.isPending || markedCount === 0}
              onClick={handleSave}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-pine-deep px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="size-4" />
              {saveMutation.isPending ? 'Menyimpan…' : 'Simpan Absensi'}
            </button>
          </div>
        )}
      </div>

      <AttendanceConfirmDialog
        request={closeRequest}
        onCancel={() => {
          setPendingClose(false);
        }}
      />
    </div>
  );
}
