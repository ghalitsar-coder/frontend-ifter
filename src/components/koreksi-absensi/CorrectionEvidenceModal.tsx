import { BadgeCheck, ShieldCheck, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CorrectionRow } from '@/lib/api/koreksi-absensi';

/**
 * Evidence/reason modal for an audit row.
 * shortcut: the backend stores no attachment metadata for attendance
 * corrections, so the modal shows the recorded reason/notes only.
 *
 * @param props - Audit row and close handler.
 * @returns Evidence modal.
 */
export function CorrectionEvidenceModal(props: { row: CorrectionRow; onClose: () => void }) {
  const t = useTranslations('AttendanceCorrectionPage');

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is already scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="correction-evidence-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-3 backdrop-blur-sm sm:p-6"
    >
      <div className="relative my-8 w-full max-w-md overflow-hidden rounded-3xl border border-border-subtle bg-card shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
          <h2
            id="correction-evidence-title"
            className="text-sm font-extrabold tracking-tight text-foreground"
          >
            {t('evidence_title')}
          </h2>
          <button
            type="button"
            onClick={props.onClose}
            aria-label={t('btn_close')}
            className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-surface-container-low text-muted-foreground transition-colors hover:bg-pine-light hover:text-pine-deep"
          >
            <X className="size-3.5" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-5">
          <div className="rounded-2xl border border-border-subtle bg-surface-container-low p-3.5">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-pine-deep">
              <BadgeCheck className="size-3.5" />
              {props.row.student.name} • {props.row.sessionDate}
            </p>
            <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
              {props.row.reason}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-gold/40 bg-amber-surface p-3.5">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-amber-dark">
              <ShieldCheck className="size-3.5" />
              {t('evidence_signature')}
            </p>
            <p className="mt-1 text-[10px] leading-relaxed text-amber-dark/90">
              {t('evidence_signature_desc')}
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-border-subtle px-5 py-4">
          <button
            type="button"
            onClick={props.onClose}
            className="cursor-pointer rounded-xl border border-border-control bg-card px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-surface-container-low"
          >
            {t('btn_close')}
          </button>
        </div>
      </div>
    </div>
  );
}
