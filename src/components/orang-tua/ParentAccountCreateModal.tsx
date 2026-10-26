'use client';

import { Loader2, UserRoundPlus, X } from 'lucide-react';
import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { ApiError } from '@/lib/api/client';
import type { CredentialIssue } from '@/lib/api/dto';
import { buildCreateParentPayload, useCreateParentAccount } from '@/lib/api/parent';

const errorText = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.status === 409 ? 'Username atau email sudah dipakai akun lain.' : error.message;
  }
  return 'Terjadi kesalahan tak terduga.';
};

/**
 * Creates a parent login account (POST /users with the `parent` role). The
 * backend answers with a one-time activation token that is handed straight to
 * the caller for single display and never kept here.
 *
 * @param props - Modal inputs and callbacks.
 * @param props.onClose - Closes the modal.
 * @param props.onCreated - Receives the account name and its one-time credential.
 * @returns Modal overlay.
 */
export function ParentAccountCreateModal(props: {
  onClose: () => void;
  onCreated: (accountName: string, credential: CredentialIssue) => void;
}) {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreateParentAccount();

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const draft = { username, email, full_name: fullName };
    try {
      buildCreateParentPayload(draft);
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : 'Data tidak valid.');
      return;
    }

    createMutation.mutate(draft, {
      onSuccess: (result) => {
        props.onCreated(result.user.full_name, result.credential);
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
      aria-labelledby="parent-create-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-pine-deep/60 p-3 backdrop-blur-md sm:p-6"
    >
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-surface-card shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-pine-deep via-amber-gold to-pine-deep" />
        <div className="flex items-start justify-between gap-4 border-b border-border-control px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pine-light text-pine-deep">
              <UserRoundPlus className="size-5" />
            </span>
            <div>
              <h2 id="parent-create-title" className="text-lg font-bold text-pine-deep">
                Buat Akun Orang Tua
              </h2>
              <p className="text-xs text-text-muted">
                Akun baru memakai peran orang tua dan otomatis memperoleh portal.
              </p>
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

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-6"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="parent-full-name" className="text-xs font-semibold text-text-primary">
              Nama Lengkap <span className="text-rose-600">*</span>
            </label>
            <input
              id="parent-full-name"
              type="text"
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
              }}
              maxLength={100}
              placeholder="Contoh: Sari Wulandari"
              required
              className="h-10 w-full rounded-xl border border-border-control bg-surface-card px-3 text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="parent-username" className="text-xs font-semibold text-text-primary">
              Username <span className="text-rose-600">*</span>
            </label>
            <input
              id="parent-username"
              type="text"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
              }}
              maxLength={64}
              placeholder="Contoh: ortu.sari"
              required
              className="h-10 w-full rounded-xl border border-border-control bg-surface-card px-3 font-mono text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="parent-email" className="text-xs font-semibold text-text-primary">
              Email <span className="font-normal text-text-muted">(opsional)</span>
            </label>
            <input
              id="parent-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
              maxLength={100}
              placeholder="contoh@email.com"
              className="h-10 w-full rounded-xl border border-border-control bg-surface-card px-3 text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
            />
          </div>

          <p className="rounded-xl border border-border-control bg-surface-container-low px-3 py-2 text-xs text-text-muted">
            Anak ditautkan setelah akun dibuat, dari tombol Kelola Anak. Batas maksimal 20 anak per
            akun.
          </p>

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
              disabled={createMutation.isPending}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-pine-deep px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Buat Akun
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
