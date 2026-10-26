'use client';

import { BookOpen, Pencil, Plus, Power } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { ApiError } from '@/lib/api/client';
import { mapSessionError, useSaveSubject, useSubjects } from '@/lib/api/presensi-mapel';
import type { Subject } from '@/lib/api/presensi-mapel';
import { can } from '@/lib/api/rbac';
import { SettingsSubjectModal } from './SettingsSubjectModal';

/**
 * Subject catalog panel on the settings page: search, create, edit and the
 * active flag behind the `master_data` capability. Sessions and assignments
 * both pick from this catalog, so a retired subject is switched off rather
 * than deleted.
 *
 * @returns Subject catalog card.
 */
export function SettingsSubjectPanel() {
  const { roles } = useAuth();
  const canEdit = can(roles, 'master_data');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Subject | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toggleMutation = useSaveSubject();
  const subjectsQuery = useSubjects(search.trim() === '' ? {} : { search: search.trim() });

  const subjects = subjectsQuery.data ?? [];

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const toggleActive = (subject: Subject) => {
    toggleMutation.mutate(
      {
        subjectId: subject.id,
        code: subject.code,
        name: subject.name,
        description: subject.description ?? '',
        is_active: !subject.is_active,
      },
      {
        onSuccess: (saved) => {
          showToast(`Mapel ${saved.name} ${saved.is_active ? 'diaktifkan.' : 'dinonaktifkan.'}`);
        },
      },
    );
  };

  return (
    <section className="rounded-2xl border border-border-control bg-card p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-pine-deep" />
          <h2 className="text-sm font-bold text-pine-deep sm:text-base">Katalog Mata Pelajaran</h2>
        </div>
        <span className="rounded-full bg-pine-light px-2.5 py-0.5 text-[11px] font-bold text-pine-deep">
          {subjects.length} mapel
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          placeholder="Cari kode atau nama mapel"
          aria-label="Cari mapel"
          className="h-10 min-w-0 flex-1 rounded-xl border border-border-control bg-surface-container-low px-3 text-xs text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
        />
        {canEdit && (
          <button
            type="button"
            onClick={() => {
              setCreateOpen(true);
            }}
            className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-pine-deep px-3 text-xs font-semibold text-white transition-colors hover:bg-pine-hover sm:text-sm"
          >
            <Plus className="size-3.5" />
            <span>Tambah Mapel</span>
          </button>
        )}
      </div>

      {toggleMutation.isError && (
        <p className="mb-3 text-[11px] font-semibold text-rose-600">
          {toggleMutation.error instanceof ApiError
            ? mapSessionError(toggleMutation.error, 'subject')
            : 'Gagal mengubah status mapel.'}
        </p>
      )}

      {subjectsQuery.isPending && (
        <p className="py-4 text-xs text-muted-foreground">Memuat mapel…</p>
      )}
      {subjectsQuery.isError && (
        <p className="py-4 text-xs text-rose-600">Daftar mapel gagal dimuat dari server.</p>
      )}
      {!subjectsQuery.isPending && !subjectsQuery.isError && subjects.length === 0 && (
        <p className="py-4 text-xs text-muted-foreground">
          Belum ada mapel pada pencarian ini. Tambahkan lewat tombol Tambah Mapel.
        </p>
      )}

      {subjects.length > 0 && (
        <ul className="divide-y divide-border-subtle">
          {subjects.map((subject) => (
            <li key={subject.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">
                  <span className="font-mono text-[11px] text-pine-deep">{subject.code}</span> —{' '}
                  {subject.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {subject.description ?? 'Tanpa deskripsi'} ·{' '}
                  {subject.is_active ? 'Aktif' : 'Nonaktif'}
                </p>
              </div>
              {canEdit && (
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      toggleActive(subject);
                    }}
                    aria-label={`${subject.is_active ? 'Nonaktifkan' : 'Aktifkan'} mapel ${subject.name}`}
                    className="shrink-0 cursor-pointer rounded-lg p-1.5 text-text-muted transition-colors hover:bg-pine-light hover:text-pine-deep"
                  >
                    <Power className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(subject);
                    }}
                    aria-label={`Ubah mapel ${subject.name}`}
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
          Hanya administrator dan staf TU yang dapat mengubah katalog mapel.
        </p>
      )}

      {createOpen && (
        <SettingsSubjectModal
          subject={null}
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
        <SettingsSubjectModal
          key={editing.id}
          subject={editing}
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
