'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { useResetUserCredential } from '@/lib/api/master-guru';

/**
 * Admin dialog that mints a one-time password reset token for a staff login
 * account (POST /users/:id/credential-reset). The token is only present in
 * the response, so it is shown once with a copy button; the recipient then
 * activates it on the public "Aktivasi Akun" page.
 *
 * @param props - Component properties.
 * @returns Modal component.
 */
export function MasterGuruCredentialModal(props: {
  userId: string;
  username: string;
  teacherName: string;
  onClose: () => void;
  onToast: (message: string) => void;
}) {
  const reset = useResetUserCredential();
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleIssue = () => {
    setError(null);
    reset.mutate(props.userId, {
      onSuccess: (result) => {
        setToken(result.credential.token);
        setExpiresAt(result.credential.expires_at);
        props.onToast(`Token reset untuk @${props.username} dibuat`);
      },
      onError: (err) => {
        setError(
          err instanceof ApiError && err.message !== '' ? err.message : 'Gagal membuat token',
        );
      },
    });
  };

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is already scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-credential-reset-title"
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

          <h2 id="modal-credential-reset-title" className="text-text-primary text-lg font-bold">
            Reset password — {props.teacherName}
          </h2>
          <p className="text-text-muted mt-0.5 text-xs">
            Akun @{props.username} · hanya admin yang dapat membuat token ini
          </p>

          {token === null ? (
            <form
              className="mt-4 flex flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                handleIssue();
              }}
            >
              <p className="text-text-muted text-xs">
                Token ini menggantikan token reset sebelumnya. Bagikan ke yang bersangkutan untuk
                dipakai di halaman Aktivasi Akun (password minimal 12 karakter).
              </p>
              {error !== null && <p className="text-xs font-semibold text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={reset.isPending}
                className="cursor-pointer rounded-lg bg-pine-deep px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reset.isPending ? 'Membuat…' : 'Buat token reset'}
              </button>
            </form>
          ) : (
            <div className="mt-4 rounded-2xl border border-amber-gold/50 bg-amber-gold/10 p-4">
              <p className="text-text-primary text-sm font-semibold">Token reset (satu kali)</p>
              {expiresAt !== null && (
                <p className="text-text-muted mt-1 text-xs">Berlaku sampai {expiresAt}</p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <input
                  readOnly
                  value={token}
                  onFocus={(event) => {
                    event.target.select();
                  }}
                  className="min-w-0 flex-1 rounded-md border border-border-control bg-white px-2 py-1.5 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(token);
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
