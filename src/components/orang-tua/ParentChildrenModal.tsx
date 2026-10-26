'use client';

import { Loader2, Plus, Trash2, Users, X } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/api/client';
import { useMasterStudentList } from '@/lib/api/master-siswa';
import {
  childLinkErrorMessage,
  relationshipOptions,
  useReplaceParentChildren,
  useUserChildren,
} from '@/lib/api/parent';

type ChildRow = { student_id: string; relationship: string; label: string };

const MAX_CHILDREN = 20;

const errorText = (error: unknown): string => {
  if (error instanceof ApiError) {
    return childLinkErrorMessage(error);
  }
  return 'Terjadi kesalahan tak terduga.';
};

/**
 * Links children to a parent account. Saving replaces the whole link list
 * (PUT /users/:id/children), so the modal always starts from the current
 * links and warns before overwriting them.
 *
 * @param props - Modal inputs and callbacks.
 * @param props.userId - Parent account id.
 * @param props.accountName - Account display name.
 * @param props.onClose - Closes the modal.
 * @param props.onSaved - Receives the toast message.
 * @returns Modal overlay.
 */
export function ParentChildrenModal(props: {
  userId: string;
  accountName: string;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const childrenQuery = useUserChildren(props.userId);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<ChildRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const studentSearch = useMasterStudentList({
    ...(search.trim() === '' ? {} : { search: search.trim() }),
    limit: 8,
  });
  const saveMutation = useReplaceParentChildren();

  const currentLinks = childrenQuery.data ?? [];
  const rows =
    draft ??
    currentLinks.map((child) => ({
      student_id: child.student_id,
      relationship: child.relationship ?? '',
      label: `${child.full_name} — NIS ${child.student_number}`,
    }));
  const rowIds = new Set(rows.map((row) => row.student_id));
  const candidates = (studentSearch.data?.data ?? []).filter((student) => !rowIds.has(student.id));

  const addStudent = (studentId: string, label: string) => {
    setDraft([...rows, { student_id: studentId, relationship: '', label }]);
  };

  const removeRow = (studentId: string) => {
    setDraft(rows.filter((row) => row.student_id !== studentId));
  };

  const changeRelationship = (studentId: string, relationship: string) => {
    setDraft(rows.map((row) => (row.student_id === studentId ? { ...row, relationship } : row)));
  };

  const handleSave = () => {
    setError(null);
    if (rows.length > MAX_CHILDREN) {
      setError(`Maksimal ${MAX_CHILDREN} anak per akun.`);
      return;
    }
    saveMutation.mutate(
      {
        userId: props.userId,
        rows: rows.map((row) => ({ student_id: row.student_id, relationship: row.relationship })),
      },
      {
        onSuccess: (result) => {
          props.onSaved(`${result.length} anak tertaut ke akun ${props.accountName}.`);
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
      aria-labelledby="parent-children-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-pine-deep/60 p-3 backdrop-blur-md sm:p-6"
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-surface-card shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-pine-deep via-amber-gold to-pine-deep" />
        <div className="flex items-start justify-between gap-4 border-b border-border-control px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pine-light text-pine-deep">
              <Users className="size-5" />
            </span>
            <div>
              <h2 id="parent-children-title" className="text-lg font-bold text-pine-deep">
                Tautkan Anak
              </h2>
              <p className="text-xs text-text-muted">{props.accountName}</p>
            </div>
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

        <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-6">
          <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
            Menyimpan akan menggantikan seluruh daftar tautan yang ada. Anak yang dihapus di sini
            tidak lagi terlihat oleh akun ini di portal orang tua.
          </p>

          {childrenQuery.isPending && <Skeleton className="h-8 w-full rounded-xl" />}

          {childrenQuery.isError && (
            <p role="alert" className="text-xs font-medium text-rose-700">
              {errorText(childrenQuery.error)}
            </p>
          )}

          {rows.length === 0 && !childrenQuery.isPending && (
            <p className="text-sm text-text-muted">
              Belum ada anak yang tertaut. Pilih siswa dari pencarian di bawah.
            </p>
          )}

          {rows.map((row) => (
            <div
              key={row.student_id}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-border-control bg-surface-container-low px-3 py-2"
            >
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text-primary">
                {row.label}
              </span>
              <select
                aria-label={`Hubungan ${row.label}`}
                value={row.relationship}
                onChange={(event) => {
                  changeRelationship(row.student_id, event.target.value);
                }}
                className="h-9 cursor-pointer rounded-xl border border-border-control bg-surface-card px-2 text-xs font-medium text-text-primary focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
              >
                <option value="">Belum ditentukan</option>
                {relationshipOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  removeRow(row.student_id);
                }}
                aria-label={`Hapus ${row.label}`}
                className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-rose-700 transition-colors hover:bg-rose-50"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}

          <div className="flex flex-col gap-2 rounded-xl border border-border-control bg-surface-card p-3">
            <label htmlFor="child-search" className="text-xs font-semibold text-text-primary">
              Cari siswa untuk ditautkan
            </label>
            <input
              id="child-search"
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              placeholder="Nama atau NIS"
              className="h-10 w-full rounded-xl border border-border-control bg-surface-card px-3 text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
            />
            {studentSearch.isPending && <p className="text-xs text-text-muted">Mencari siswa…</p>}
            {studentSearch.isError && (
              <p className="text-xs text-rose-700">
                Daftar siswa gagal dimuat. Periksa data induk siswa.
              </p>
            )}
            <ul className="flex flex-col gap-1">
              {candidates.map((student) => (
                <li
                  key={student.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-surface-container-low px-2 py-1.5"
                >
                  <span className="min-w-0 flex-1 truncate text-xs text-text-primary">
                    {student.full_name} — NIS {student.student_number}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      addStudent(
                        student.id,
                        `${student.full_name} — NIS ${student.student_number}`,
                      );
                    }}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border-control bg-surface-card px-2 py-1 text-[11px] font-bold text-pine-deep transition-colors hover:bg-pine-light"
                  >
                    <Plus className="size-3" />
                    Tautkan
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {error !== null && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
            >
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={props.onClose}
              className="cursor-pointer rounded-xl border border-border-control bg-surface-card px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-container-low"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={saveMutation.isPending || childrenQuery.isPending}
              onClick={handleSave}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-pine-deep px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Simpan Tautan ({rows.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
