import { ArrowRight, Check, CheckCircle2, Copy, Fingerprint, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { attendanceStatusStyles } from '@/components/koreksi-absensi/statusStyles';
import { shortHash, toTrailEntry, useAttendanceRecord } from '@/lib/api/koreksi-absensi';
import type { CorrectionRow } from '@/lib/api/koreksi-absensi';
import { can } from '@/lib/api/rbac';
import { CorrectionEvidenceList } from './CorrectionEvidenceList';

/**
 * Copy a hash to the clipboard and flash the copied state for two seconds.
 * @param key - Row key whose copy button should flash.
 * @param hash - Evidence hash text to copy.
 * @param onCopied - Sets the currently flashing row key.
 * @param onExpired - Clears the flash unless another row took over.
 */
async function copyHashToClipboard(
  key: string,
  hash: string,
  onCopied: (key: string) => void,
  onExpired: (key: string) => void,
): Promise<void> {
  try {
    await navigator.clipboard.writeText(hash);
  } catch {
    return;
  }
  onCopied(key);
  window.setTimeout(() => {
    onExpired(key);
  }, 2000);
}

/**
 * Immutable ledger modal wired to GET /attendance/records/:id: shows the
 * record header plus the full correction trail (old → new status, reason,
 * timestamp) recorded by the backend. Every trail row carries the
 * server-computed `evidence_hash` (sha256 over the correction payload,
 * migration 000014) shown read-only with a copy button — the client never
 * computes hashes itself.
 *
 * @param props - Audit row (record id) and close handler.
 * @returns Ledger modal.
 */
export function CorrectionHashModal(props: { row: CorrectionRow; onClose: () => void }) {
  const t = useTranslations('AttendanceCorrectionPage');
  const { roles } = useAuth();
  const detailQuery = useAttendanceRecord(props.row.recordId);
  const corrections = (detailQuery.data?.corrections ?? []).map(toTrailEntry);
  const latest = corrections.at(-1);
  const latestHash = latest?.evidenceHash ?? null;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyHash = (key: string, hash: string) => {
    void copyHashToClipboard(key, hash, setCopiedKey, (rowKey) => {
      setCopiedKey((current) => (current === rowKey ? null : current));
    });
  };

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is already scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="correction-hash-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-3 backdrop-blur-sm sm:p-6"
    >
      <div className="relative my-10 w-full max-w-xl overflow-hidden rounded-3xl border border-border-subtle bg-card shadow-2xl">
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
                {corrections.map((entry) => {
                  const entryHash = entry.evidenceHash;
                  return (
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
                      {entryHash !== null && (
                        <div className="mt-1.5 flex items-center justify-between gap-2 rounded-lg bg-surface-container-low px-2 py-1">
                          <span
                            title={entryHash}
                            className="flex items-center gap-1 font-mono text-[9px] break-all text-muted-foreground"
                          >
                            <Fingerprint className="size-3 shrink-0" />
                            {shortHash(entryHash)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              copyHash(entry.id, entryHash);
                            }}
                            aria-label="Salin hash bukti"
                            className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-pine-light hover:text-pine-deep"
                          >
                            {copiedKey === entry.id ? (
                              <Check className="size-3 text-pine-deep" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {corrections.length > 0 && (
            <div>
              <p className="mb-1 text-[10px] text-muted-foreground">{t('ledger_hash')}</p>
              {latestHash === null ? (
                <p className="rounded-xl border border-border-subtle bg-surface-container-low p-3 text-[10px] text-muted-foreground">
                  Hash bukti belum tersedia untuk koreksi lama ini.
                </p>
              ) : (
                <div className="flex items-start gap-2">
                  <p className="flex-1 rounded-xl border border-border-subtle bg-surface-container-low p-3 font-mono text-[10px] leading-relaxed break-all text-foreground/80 select-all">
                    {latestHash}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      copyHash('latest', latestHash);
                    }}
                    aria-label="Salin hash bukti"
                    className="mt-1 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border-control bg-card text-muted-foreground transition-colors hover:bg-pine-light hover:text-pine-deep"
                  >
                    {copiedKey === 'latest' ? (
                      <Check className="size-3.5 text-pine-deep" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {latestHash !== null && (
            <p className="inline-flex items-center gap-1.5 rounded-full bg-pine-light px-2.5 py-1 text-[10px] font-bold text-pine-deep">
              <CheckCircle2 className="size-3" />
              {t('ledger_integrity')}
            </p>
          )}

          <div className="border-t border-border-subtle pt-3">
            <CorrectionEvidenceList
              recordId={props.row.recordId}
              canManage={can(roles, 'attendance_ops')}
            />
          </div>
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
