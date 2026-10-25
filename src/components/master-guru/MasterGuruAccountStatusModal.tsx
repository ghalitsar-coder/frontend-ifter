'use client';

import { ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { ApiError } from '@/lib/api/client';
import {
  accountStatusLabel,
  nextAccountStatus,
  useUpdateUserAccountStatus,
} from '@/lib/api/master-guru';
import type { AccountStatus } from '@/lib/api/master-guru';

/**
 * Label for the confirm button.
 * @param pending - Mutation in flight.
 * @param deactivating - Target status is inactive.
 * @returns Button text.
 */
function confirmLabel(pending: boolean, deactivating: boolean): string {
  if (pending) {
    return 'Menyimpan…';
  }
  return deactivating ? 'Ya, nonaktifkan akun' : 'Ya, aktifkan akun';
}

/**
 * Admin confirmation dialog for toggling a teacher's LOGIN ACCOUNT
 * (PATCH /users/:id/status), kept visually separate from the teacher
 * employment-status toggle in the table.
 *
 * @param props - Component properties.
 * @returns Modal component.
 */
export function MasterGuruAccountStatusModal(props: {
  userId: string;
  username: string;
  teacherName: string;
  currentStatus: AccountStatus;
  onClose: () => void;
  onToast: (message: string) => void;
}) {
  const updateStatus = useUpdateUserAccountStatus();
  const [error, setError] = useState<string | null>(null);
  const next = nextAccountStatus(props.currentStatus);
  const isDeactivating = next === 'inactive';

  const handleConfirm = () => {
    setError(null);
    updateStatus.mutate(
      { userId: props.userId, status: next },
      {
        onSuccess: () => {
          props.onToast(
            isDeactivating
              ? `Akun login @${props.username} dinonaktifkan. Sesi aktif akun tersebut dicabut.`
              : `Akun login @${props.username} diaktifkan kembali.`,
          );
          props.onClose();
        },
        onError: (err) => {
          setError(
            err instanceof ApiError && err.message !== ''
              ? err.message
              : 'Gagal mengubah status akun login.',
          );
        },
      },
    );
  };

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is already scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-account-status-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-pine-deep/40 p-3 backdrop-blur-md sm:p-6"
    >
      <div className="bg-surface-card relative my-auto flex max-h-[92vh] w-full max-w-[480px] animate-in flex-col overflow-hidden rounded-3xl border border-border-control shadow-2xl duration-200 zoom-in-95 fade-in">
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

          <div
            className={`mb-3 flex size-10 items-center justify-center rounded-xl ${
              isDeactivating ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {isDeactivating ? (
              <ShieldAlert className="size-5" />
            ) : (
              <ShieldCheck className="size-5" />
            )}
          </div>

          <h2 id="modal-account-status-title" className="text-text-primary text-lg font-bold">
            {isDeactivating ? 'Nonaktifkan akun login' : 'Aktifkan akun login'}
          </h2>
          <p className="text-text-muted mt-0.5 text-xs">
            {props.teacherName} · @{props.username} · saat ini{' '}
            {accountStatusLabel(props.currentStatus)}
          </p>

          <div className="mt-4 flex flex-col gap-3">
            <p className="text-text-muted text-xs">
              {isDeactivating
                ? 'Akun tidak dapat masuk lagi dan seluruh sesi/refresh token dicabut. Data guru, kelas wali, dan jadwal piket tetap utuh.'
                : 'Akun dapat masuk kembali memakai kredensial yang ada. Tidak ada token baru yang dibuat.'}
            </p>
            <p className="rounded-xl border border-amber-gold/50 bg-amber-gold/10 px-3 py-2 text-[11px] font-medium text-amber-900">
              Ini hanya status AKUN LOGIN. Status kepegawaian guru (kolom Status) tidak ikut
              berubah.
            </p>
            {error !== null && <p className="text-xs font-semibold text-red-600">{error}</p>}
            <div className="mt-1 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={props.onClose}
                className="text-text-muted cursor-pointer rounded-lg border border-border-control px-3 py-2 text-xs font-semibold transition-colors hover:bg-surface-container-low hover:text-pine-deep"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={updateStatus.isPending}
                onClick={handleConfirm}
                className={`cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isDeactivating ? 'bg-rose-600' : 'bg-pine-deep'
                }`}
              >
                {confirmLabel(updateStatus.isPending, isDeactivating)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
