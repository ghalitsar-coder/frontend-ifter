import { ArrowRight, CheckCircle2, Fingerprint, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { attendanceStatusStyles } from '@/components/koreksi-absensi/statusStyles';
import { mockAuditLedgerHash } from '@/data/mockAttendanceCorrection';
import type { CorrectionLog } from '@/types/attendanceCorrection';

/**
 * Immutable ledger modal with the entry hash and verification status.
 *
 * @param props - Audit entry and close handler.
 * @returns Ledger integrity modal.
 */
export function CorrectionHashModal(props: { log: CorrectionLog; onClose: () => void }) {
  const t = useTranslations('AttendanceCorrectionPage');

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is already scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="correction-hash-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-3 backdrop-blur-sm sm:p-6"
    >
      <div className="relative my-10 w-full max-w-lg overflow-hidden rounded-3xl border border-border-subtle bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-amber-surface text-amber-dark">
              <Fingerprint className="size-4" />
            </span>
            <div>
              <h2
                id="correction-hash-title"
                className="text-sm font-extrabold tracking-tight text-foreground"
              >
                {t('ledger_title')}
              </h2>
              <p className="text-[10px] text-muted-foreground">{props.log.id}</p>
            </div>
          </div>
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
          <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2.5">
            <span className="text-[10px] text-muted-foreground">{t('ledger_subject')}</span>
            <span className="text-xs font-bold text-foreground">{props.log.student.name}</span>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2.5">
            <span className="text-[10px] text-muted-foreground">{t('ledger_change')}</span>
            <span className="flex items-center gap-1.5">
              <span
                className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${attendanceStatusStyles[props.log.fromStatus]}`}
              >
                {t(`status_${props.log.fromStatus}`)}
              </span>
              <ArrowRight className="size-3 text-muted-foreground" />
              <span
                className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${attendanceStatusStyles[props.log.toStatus]}`}
              >
                {t(`status_${props.log.toStatus}`)}
              </span>
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2.5">
            <span className="text-[10px] text-muted-foreground">{t('ledger_officer')}</span>
            <span className="text-right">
              <span className="block text-xs font-bold text-foreground">
                {props.log.officer.name}
              </span>
              <span className="block text-[9px] text-muted-foreground">
                {props.log.officer.role}
              </span>
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2.5">
            <span className="text-[10px] text-muted-foreground">{t('ledger_timestamp')}</span>
            <span className="text-xs font-semibold text-foreground">
              {props.log.loggedDate}, {props.log.loggedTime}
            </span>
          </div>

          <div>
            <p className="mb-1 text-[10px] text-muted-foreground">{t('ledger_hash')}</p>
            <p className="rounded-xl border border-border-subtle bg-surface-container-low p-3 font-mono text-[10px] leading-relaxed break-all text-foreground/80">
              {mockAuditLedgerHash}
            </p>
          </div>

          <p className="inline-flex items-center gap-1.5 rounded-full bg-pine-light px-2.5 py-1 text-[10px] font-bold text-pine-deep">
            <CheckCircle2 className="size-3" />
            {t('ledger_integrity')}
          </p>
        </div>

        <div className="border-t border-border-subtle px-5 py-4">
          <button
            type="button"
            onClick={props.onClose}
            className="w-full cursor-pointer rounded-xl bg-pine-deep px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-pine-hover"
          >
            {t('ledger_done')}
          </button>
        </div>
      </div>
    </div>
  );
}
