'use client';

import { Pencil, Plus, Power, UserRoundCheck } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { ApiError } from '@/lib/api/client';
import {
  mapSessionError,
  useAssignments,
  useSaveAssignment,
  useSubjects,
} from '@/lib/api/presensi-mapel';
import type { TeachingAssignment } from '@/lib/api/presensi-mapel';
import { can } from '@/lib/api/rbac';
import { SettingsTeachingAssignmentModal } from './SettingsTeachingAssignmentModal';

const filterClass =
  'h-9 cursor-pointer rounded-xl border border-border-control bg-surface-container-low px-2 text-xs font-bold text-pine-deep focus:outline-none';

/**
 * Teaching-assignment panel on the settings page: who teaches which subject in
 * which class. Every session created on the Presensi Mapel page comes from an
 * active row here, so the list is filtered by mapel and by active state.
 *
 * @returns Teaching-assignment card.
 */
export function SettingsTeachingAssignmentPanel() {
  const { roles } = useAuth();
  const canEdit = can(roles, 'master_data');
  const [subjectId, setSubjectId] = useState('');
  const [onlyActive, setOnlyActive] = useState(false);
  const [editing, setEditing] = useState<TeachingAssignment | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toggleMutation = useSaveAssignment();
  const assignmentsQuery = useAssignments({
    ...(subjectId === '' ? {} : { subject_id: subjectId }),
    ...(onlyActive ? { is_active: true } : {}),
  });
  const subjectsQuery = useSubjects({ is_active: true });

  const assignments = assignmentsQuery.data ?? [];
  const subjects = subjectsQuery.data ?? [];

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const toggleActive = (assignment: TeachingAssignment) => {
    toggleMutation.mutate(
      {
        assignmentId: assignment.id,
        teacher_id: assignment.teacher_id,
        subject_id: assignment.subject_id,
        class_id: assignment.class_id,
        is_active: !assignment.is_active,
      },
      {
        onSuccess: (saved) => {
          showToast(
            `Penugasan ${saved.teacher_name} ${saved.is_active ? 'diaktifkan.' : 'dinonaktifkan.'}`,
          );
        },
      },
    );
  };

  return (
    <section className="rounded-2xl border border-border-control bg-card p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <UserRoundCheck className="size-4 text-pine-deep" />
          <h2 className="text-sm font-bold text-pine-deep sm:text-base">Penugasan Mengajar Guru</h2>
        </div>
        <span className="rounded-full bg-pine-light px-2.5 py-0.5 text-[11px] font-bold text-pine-deep">
          {assignments.length} penugasan
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={subjectId}
          onChange={(event) => {
            setSubjectId(event.target.value);
          }}
          aria-label="Filter mapel"
          className={filterClass}
        >
          <option value="">Semua mapel</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.code} — {subject.name}
            </option>
          ))}
        </select>

        <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-pine-deep">
          <input
            type="checkbox"
            checked={onlyActive}
            onChange={(event) => {
              setOnlyActive(event.target.checked);
            }}
            className="size-4 cursor-pointer accent-pine-deep"
          />
          Hanya penugasan aktif
        </label>

        {canEdit && (
          <button
            type="button"
            onClick={() => {
              setCreateOpen(true);
            }}
            className="ml-auto inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-pine-deep px-3 text-xs font-semibold text-white transition-colors hover:bg-pine-hover"
          >
            <Plus className="size-3.5" />
            <span>Tambah Penugasan</span>
          </button>
        )}
      </div>

      {toggleMutation.isError && (
        <p className="mb-3 text-[11px] font-semibold text-rose-600">
          {toggleMutation.error instanceof ApiError
            ? mapSessionError(toggleMutation.error, 'assignment')
            : 'Gagal mengubah status penugasan.'}
        </p>
      )}

      {assignmentsQuery.isPending && (
        <p className="py-4 text-xs text-muted-foreground">Memuat penugasan…</p>
      )}
      {assignmentsQuery.isError && (
        <p className="py-4 text-xs text-rose-600">Daftar penugasan gagal dimuat dari server.</p>
      )}
      {!assignmentsQuery.isPending && !assignmentsQuery.isError && assignments.length === 0 && (
        <p className="py-4 text-xs text-muted-foreground">
          Belum ada penugasan pada filter ini. Tambahkan agar guru yang bersangkutan dapat membuat
          sesi absensi mapel.
        </p>
      )}

      {assignments.length > 0 && (
        <ul className="divide-y divide-border-subtle">
          {assignments.map((assignment) => (
            <li key={assignment.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">
                  {assignment.teacher_name} — {assignment.subject_name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Kelas {assignment.class_name} · {assignment.is_active ? 'Aktif' : 'Nonaktif'}
                </p>
              </div>
              {canEdit && (
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      toggleActive(assignment);
                    }}
                    aria-label={`${assignment.is_active ? 'Nonaktifkan' : 'Aktifkan'} penugasan ${assignment.teacher_name}`}
                    className="shrink-0 cursor-pointer rounded-lg p-1.5 text-text-muted transition-colors hover:bg-pine-light hover:text-pine-deep"
                  >
                    <Power className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(assignment);
                    }}
                    aria-label={`Ubah penugasan ${assignment.teacher_name}`}
                    className="shrink-0 cursor-pointer rounded-lg p-1.5 text-text-muted transition-colors hover:bg-pine-light hover:text-pine-deep"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {!canEdit && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Hanya administrator dan staf TU yang dapat mengubah penugasan mengajar.
        </p>
      )}

      {createOpen && (
        <SettingsTeachingAssignmentModal
          assignment={null}
          onClose={() => {
            setCreateOpen(false);
          }}
          onSaved={(message) => {
            setCreateOpen(false);
            showToast(message);
          }}
        />
      )}

      {editing !== null && (
        <SettingsTeachingAssignmentModal
          key={editing.id}
          assignment={editing}
          onClose={() => {
            setEditing(null);
          }}
          onSaved={(message) => {
            setEditing(null);
            showToast(message);
          }}
        />
      )}

      {toast !== null && (
        <output className="fixed right-4 bottom-4 z-[60] max-w-sm rounded-xl bg-pine-deep px-4 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </output>
      )}
    </section>
  );
}
