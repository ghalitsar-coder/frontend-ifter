'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { ApiError } from '@/lib/api/client';
import {
  useStudentAccount,
  useProvisionStudentAccount,
  useDeactivateStudentAccount,
} from '@/lib/api/master-siswa';
import type { StudentProfile } from '@/types/masterSiswa';

const accountStatusLabel: Record<string, string> = {
  pending: 'menunggu aktivasi',
  active: 'aktif',
  inactive: 'nonaktif',
};

/**
 * Human message for an unknown mutation error.
 * @param err - Thrown value.
 * @param fallback - Indonesian fallback when the API gave no message.
 * @returns Message text.
 */
const errorMessage = (err: unknown, fallback: string): string =>
  err instanceof ApiError && err.message !== '' ? err.message : fallback;

/**
 * Admin dialog to mint, inspect and withdraw a student's login account
 * (POST/GET/DELETE /students/:id/account). The invite token returned by the
 * backend exists only in the provisioning response, so it is shown here once
 * with a copy button; closing the dialog loses it (re-provisioning is blocked
 * by the idempotency guard — the admin must reset the credential instead).
 *
 * @param props - Component properties.
 * @returns Modal component.
 */
export function MasterSiswaAccountModal(props: {
  student: StudentProfile;
  onClose: () => void;
  onToast: (message: string) => void;
}) {
  const account = useStudentAccount(props.student.id);
  const provision = useProvisionStudentAccount();
  const deactivate = useDeactivateStudentAccount();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProvision = () => {
    setError(null);
    provision.mutate(
      { id: props.student.id, input: { username, email } },
      {
        onSuccess: (result) => {
          setIssuedToken(result.credential.token);
          void account.refetch();
          props.onToast(`Akun @${result.user.username} dibuat`);
        },
        onError: (err) => {
          setError(errorMessage(err, 'Gagal membuat akun'));
        },
      },
    );
  };

  const handleDeactivate = () => {
    setError(null);
    deactivate.mutate(props.student.id, {
      onSuccess: () => {
        setIssuedToken(null);
        void account.refetch();
        props.onToast('Akun login dicabut');
      },
      onError: (err) => {
        setError(errorMessage(err, 'Gagal mencabut akun'));
      },
    });
  };

  const linked = account.data?.user_id !== undefined && account.data.user_id !== null;

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is already scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-student-account-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-pine-deep/40 p-3 backdrop-blur-md sm:p-6"
    >
      <div className="bg-surface-card relative my-auto flex max-h-[92vh] w-full max-w-[460px] animate-in flex-col overflow-hidden rounded-3xl border border-border-control shadow-2xl duration-200 zoom-in-95 fade-in">
        <div className="h-1.5 w-full bg-gradient-to-r from-pine-deep via-amber-gold to-pine-deep" />
        <div className="px-6 pt-6 pb-6 sm:px-8">
          <button
            type="button"
            onClick={props.onClose}
            aria-label="Tutup"
            className="hover:bg-surface-container text-text-muted absolute top-5 right-5 flex size-8 cursor-pointer items-center justify-center rounded-full bg-surface-container-low transition-colors hover:text-pine-deep"
          >
            <X className="size-4" />
          </button>

          <h2 id="modal-student-account-title" className="text-text-primary text-lg font-bold">
            Akun login — {props.student.name}
          </h2>
          <p className="text-text-muted mt-0.5 text-xs">
            NIS {props.student.nis} · hanya admin yang dapat mengelola akun ini
          </p>

          {account.isLoading && <p className="text-text-muted mt-4 text-sm">Memuat akun…</p>}

          {!account.isLoading && linked && (
            <div className="bg-surface-container mt-4 rounded-2xl border border-border-control p-4 text-sm">
              <p className="text-text-primary font-semibold">@{account.data?.username}</p>
              <p className="text-text-muted mt-1">
                Status: {accountStatusLabel[account.data?.status ?? ''] ?? account.data?.status}
              </p>
              <p className="text-text-muted mt-0.5">
                Login terakhir: {account.data?.last_login_at ?? '—'}
              </p>
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={deactivate.isPending}
                className="mt-3 cursor-pointer rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deactivate.isPending ? 'Mencabut…' : 'Cabut akun'}
              </button>
            </div>
          )}

          {!account.isLoading && !linked && issuedToken === null && (
            <form
              className="mt-4 flex flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                handleProvision();
              }}
            >
              <p className="text-text-muted text-xs">
                Belum ada akun login. Username kosong akan memakai NIS ({props.student.nis}).
              </p>
              <input
                type="text"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                }}
                placeholder="Username (opsional)"
                className="rounded-lg border border-border-control bg-transparent px-3 py-2 text-sm outline-none focus:border-pine-deep"
              />
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
                placeholder="Email (opsional)"
                className="rounded-lg border border-border-control bg-transparent px-3 py-2 text-sm outline-none focus:border-pine-deep"
              />
              {error !== null && <p className="text-xs font-semibold text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={provision.isPending}
                className="cursor-pointer rounded-lg bg-pine-deep px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {provision.isPending ? 'Membuat…' : 'Buat akun & token invite'}
              </button>
            </form>
          )}

          {issuedToken !== null && (
            <div className="mt-4 rounded-2xl border border-amber-gold/50 bg-amber-gold/10 p-4">
              <p className="text-text-primary text-sm font-semibold">Token invite (satu kali)</p>
              <p className="text-text-muted mt-1 text-xs">
                Bagikan ke siswa sekarang — token hanya tampil sekali ini. Aktifkan lewat halaman
                Aktivasi Akun dengan password minimal 12 karakter.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  readOnly
                  value={issuedToken}
                  onFocus={(event) => {
                    event.target.select();
                  }}
                  className="min-w-0 flex-1 rounded-md border border-border-control bg-white px-2 py-1.5 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(issuedToken);
                      props.onToast('Token disalin');
                    } catch {
                      props.onToast('Gagal menyalin');
                    }
                  }}
                  className="shrink-0 cursor-pointer rounded-md bg-pine-deep px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Salin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
