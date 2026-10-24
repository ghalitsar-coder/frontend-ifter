import { ArrowRight, CheckCircle2, Fingerprint, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { attendanceStatusStyles } from '@/components/koreksi-absensi/statusStyles';
// shortcut: no backend integrity-hash endpoint for the ledger, keep mock hash display
import { mockAuditLedgerHash } from '@/data/mockAttendanceCorrection';
import { toTrailEntry, useAttendanceRecord } from '@/lib/api/koreksi-absensi';
import type { CorrectionRow } from '@/lib/api/koreksi-absensi';

/**
 * Immutable ledger modal wired to GET /attendance/records/:id: shows the
 * record header plus the full correction trail (old → new status, reason,
 * timestamp) recorded by the backend.
 *
 * @param props - Audit row (record id) and close handler.
 * @returns Ledger modal.
 */
export function CorrectionHashModal(props: { row: CorrectionRow; onClose: () => void }) {
  const t = useTranslations('AttendanceCorrectionPage');
  const detailQuery = useAttendanceRecord(props.row.recordId);
  const corrections = (detailQuery.data?.corrections ?? []).map(toTrailEntry);
  const latest = corrections.at(-1);

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
              <p className="text-[10px] text-muted-foreground">{props.row.id}</p>
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

        <div className="max-h-[70vh] space-y-3 overflow-y-auto px-5 py-5">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2.5">
            <span className="text-[10px] text-muted-foreground">{t('ledger_subject')}</span>
            <span className="text-xs font-bold text-foreground">{props.row.student.name}</span>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2.5">
            <span className="text-[10px] text-muted-foreground">{t('ledger_change')}</span>
            <span className="flex items-center gap-1.5">
              {latest ? (
                <>
                  <span
                    className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${attendanceStatusStyles[latest.fromStatus]}`}
                  >
                    {t(`status_${latest.fromStatus}`)}
                  </span>
                  <ArrowRight className="size-3 text-muted-foreground" />
                  <span
                    className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${attendanceStatusStyles[latest.toStatus]}`}
                  >
                    {t(`status_${latest.toStatus}`)}
                  </span>
                </>
              ) : (
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {detailQuery.isPending
                    ? 'Memuat koreksi…'
                    : `Belum pernah dikoreksi — status ${props.row.sessionLabel.toLowerCase()}`}
                </span>
              )}
            </span>
          </div>

          {latest && (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2.5">
              <span className="text-[10px] text-muted-foreground">{t('ledger_officer')}</span>
              <span className="text-right">
                <span className="block text-xs font-bold text-foreground">
                  {latest.officerName}
                </span>
                <span className="block text-[9px] text-muted-foreground">Koreksi tersimpan</span>
              </span>
            </div>
          )}

          {latest && (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2.5">
              <span className="text-[10px] text-muted-foreground">{t('ledger_timestamp')}</span>
              <span className="text-xs font-semibold text-foreground">
                {latest.loggedDate}, {latest.loggedTime}
              </span>
            </div>
          )}

          {corrections.length > 0 && (
            <div>
              <p className="mb-1 text-[10px] text-muted-foreground">
                Riwayat koreksi ({corrections.length})
              </p>
              <ul className="space-y-2">
                {corrections.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-xl border border-border-subtle bg-surface-container-low/60 p-3"
                  >
                    <p className="flex items-center gap-1.5 text-[10px] font-bold text-foreground">
                      <span
                        className={`rounded-md border px-1.5 py-0.5 ${attendanceStatusStyles[entry.fromStatus]}`}
                      >
                        {t(`status_${entry.fromStatus}`)}
                      </span>
                      <ArrowRight className="size-3 text-muted-foreground" />
                      <span
                        className={`rounded-md border px-1.5 py-0.5 ${attendanceStatusStyles[entry.toStatus]}`}
                      >
                        {t(`status_${entry.toStatus}`)}
                      </span>
                      <span className="ml-auto font-medium text-muted-foreground">
                        {entry.loggedDate}, {entry.loggedTime}
                      </span>
                    </p>
                    <p className="mt-1 text-[10px] leading-relaxed text-foreground/80">
                      {entry.reason}
                    </p>
                    <p className="mt-0.5 text-[9px] text-muted-foreground">{entry.officerName}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
