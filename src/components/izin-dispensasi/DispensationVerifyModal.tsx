import { ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import {
  dispensationErrorMessage,
  periodLabel,
  statusLabel,
  typeLabel,
  useVerifyDispensation,
} from '@/lib/api/izin-dispensasi';
import type { DispensationDecision, DispensationDto } from '@/lib/api/izin-dispensasi';

const decisionOptions: { value: DispensationDecision; label: string; style: string }[] = [
  {
    value: 'approved',
    label: 'Setujui',
    style: 'bg-pine-deep text-white hover:bg-pine-hover',
  },
  {
    value: 'rejected',
    label: 'Tolak',
    style: 'bg-card text-red-700 border border-red-300 hover:bg-red-50',
  },
];

/**
 * Verification decision modal for one pending dispensation
 * (POST /dispensations/:id/verify, audited server-side).
 *
 * @param props - Raw dispensation being verified, close handler and toast hook.
 * @returns Decision modal.
 */
export function DispensationVerifyModal(props: {
  dispensation: DispensationDto;
  onClose: () => void;
  onVerified: (message: string) => void;
}) {
  const [decision, setDecision] = useState<DispensationDecision>('approved');
  const [note, setNote] = useState('');
  const verify = useVerifyDispensation();
  const item = props.dispensation;

  const handleSubmit = () => {
    verify.mutate(
      { id: item.id, status: decision, note },
      {
        onSuccess: () => {
          props.onVerified(
            `Dispensasi ${item.student_name} ${decision === 'approved' ? 'disetujui' : 'ditolak'}.`,
          );
          props.onClose();
        },
        onError: (error) => {
          props.onVerified(dispensationErrorMessage(error, 'Gagal memverifikasi dispensasi.'));
        },
      },
    );
  };

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is already scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="dispensation-verify-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-3 backdrop-blur-sm sm:p-6"
    >
      <div className="relative my-3 w-full max-w-md overflow-hidden rounded-3xl border border-border-subtle bg-card shadow-2xl sm:my-6">
        <div className="border-b border-border-subtle px-5 py-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pine-light px-2.5 py-1 text-[8px] font-extrabold tracking-wider text-pine-deep uppercase">
              <ShieldCheck className="size-3" />
              Verifikasi Dispensasi
            </span>
            <button
              type="button"
              onClick={props.onClose}
              aria-label="Tutup modal verifikasi"
              className="cursor-pointer rounded-lg p-1 text-muted-foreground transition-colors hover:bg-surface-container-low hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
          <h2
            id="dispensation-verify-title"
            className="mt-2 text-base font-extrabold tracking-tight text-foreground"
          >
            {item.student_name}
          </h2>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {item.class_name} · {typeLabel(item.type)} ·{' '}
            {periodLabel(item.start_date, item.end_date)} · saat ini {statusLabel(item.status)}
          </p>
        </div>

        <div className="px-5 py-4">
          <p className="rounded-xl border border-border-subtle bg-surface-container-low px-3 py-2 text-[10px] leading-relaxed text-muted-foreground">
            {item.reason}
          </p>

          <p className="mt-3 text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
            Keputusan
          </p>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {decisionOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={decision === option.value}
                onClick={() => {
                  setDecision(option.value);
                }}
                className={`cursor-pointer rounded-xl px-3 py-2 text-[11px] font-bold transition-colors ${option.style} ${
                  decision === option.value ? 'ring-2 ring-pine-deep/30' : ''
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className="mt-3 block text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
            Catatan Verifikasi (opsional)
            <textarea
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
              }}
              rows={3}
              placeholder="Contoh: Surat tugas sesuai, dispensasi diberikan penuh."
              className="mt-1 w-full rounded-xl border border-border-control bg-card px-3 py-2 text-[11px] font-medium text-foreground normal-case focus:border-pine-deep focus:outline-none"
            />
          </label>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={props.onClose}
              className="cursor-pointer rounded-xl border border-border-control bg-card px-4 py-2 text-[11px] font-semibold text-foreground transition-colors hover:bg-surface-container-low"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={verify.isPending}
              onClick={handleSubmit}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldCheck className="size-3.5" />
              {verify.isPending ? 'Mengirim…' : 'Kirim Keputusan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
