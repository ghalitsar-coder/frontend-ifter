'use client';

import { AlertTriangle, Check, Copy, KeyRound, X } from 'lucide-react';
import { useState } from 'react';

/**
 * Shows a device ingest token exactly once. The token is rendered from the
 * create/rotate response only; it is never stored, cached, or logged.
 *
 * @param props - Modal inputs.
 * @param props.deviceName - Device the token belongs to.
 * @param props.token - One-time plaintext ingest token.
 * @param props.onClose - Closes the modal.
 * @returns Modal overlay.
 */
export function DeviceTokenModal(props: {
  deviceName: string;
  token: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.token);
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
      aria-labelledby="device-token-title"
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
              <h2 id="device-token-title" className="text-lg font-bold text-pine-deep">
                Token Ingest Perangkat
              </h2>
              <p className="text-xs text-text-muted">{props.deviceName}</p>
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
              Token hanya ditampilkan satu kali dan tidak bisa dilihat lagi. Simpan sekarang dan
              pasang di perangkat. Rotasi token akan membatalkan token ini.
            </span>
          </div>

          <div className="flex items-stretch gap-2">
            <code className="min-w-0 flex-1 overflow-x-auto rounded-xl border border-border-control bg-surface-container-low px-3 py-2.5 font-mono text-sm break-all text-text-primary">
              {props.token}
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
