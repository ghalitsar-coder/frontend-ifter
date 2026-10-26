'use client';

import { AlertTriangle, Check, Copy, KeyRound, X } from 'lucide-react';
import { useState } from 'react';
import type { CredentialIssue } from '@/lib/api/dto';
import { formatIncidentDate, formatIncidentTime } from '@/lib/api/kedisiplinan';

/**
 * Shows a parent account's activation or reset token exactly once. The token
 * comes from the POST response only; it is never stored, cached, or logged, and
 * closing this modal is the only way to get rid of it.
 *
 * @param props - Modal inputs.
 * @param props.accountName - Account the credential belongs to.
 * @param props.credential - One-time token with its purpose and expiry.
 * @param props.onClose - Closes the modal.
 * @returns Modal overlay.
 */
export function ParentInviteTokenModal(props: {
  accountName: string;
  credential: CredentialIssue;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const isReset = props.credential.purpose.includes('reset');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.credential.token);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="parent-token-title"
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-pine-deep/60 p-3 backdrop-blur-md sm:p-6"
    >
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-surface-card shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-pine-deep via-amber-gold to-pine-deep" />
        <div className="flex items-start justify-between gap-4 border-b border-border-control px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pine-light text-pine-deep">
              <KeyRound className="size-5" />
            </span>
            <div>
              <h2 id="parent-token-title" className="text-lg font-bold text-pine-deep">
                {isReset ? 'Token Reset Akses' : 'Token Aktivasi Akun'}
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

        <div className="flex flex-col gap-4 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
            <AlertTriangle className="size-4 shrink-0" />
            <span>
              Token ini hanya ditampilkan satu kali. Salin sekarang dan sampaikan ke orang tua lewat
              jalur yang aman. Token berlaku sampai{' '}
              {formatIncidentDate(props.credential.expires_at)}{' '}
              {formatIncidentTime(props.credential.expires_at)}.
            </span>
          </div>

          <div className="flex items-stretch gap-2">
            <code className="min-w-0 flex-1 overflow-x-auto rounded-xl border border-border-control bg-surface-container-low px-3 py-2.5 font-mono text-sm break-all text-text-primary">
              {props.credential.token}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-pine-deep px-3 text-xs font-bold text-white transition-colors hover:bg-pine-hover"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? 'Tersalin' : 'Salin'}
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={props.onClose}
              className="cursor-pointer rounded-xl border border-border-control bg-surface-card px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-container-low"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
