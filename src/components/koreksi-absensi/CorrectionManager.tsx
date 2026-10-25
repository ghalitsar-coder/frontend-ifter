'use client';

import { CheckCircle2, FileCheck2, LockKeyhole, TriangleAlert, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { mockCorrectionStats } from '@/data/mockAttendanceCorrection';
import { ApiError } from '@/lib/api/client';
import type { CorrectionHistoryFilters, CorrectionRow } from '@/lib/api/koreksi-absensi';
import {
  defaultHistoryRange,
  exportAttendanceAudit,
  filterRowsBySearch,
  historyQueryFor,
  pageMeta,
  shortHash,
  toCorrectionRow,
  useAttendanceHistory,
  useSubmitCorrection,
} from '@/lib/api/koreksi-absensi';
import { CorrectionAuditTable } from './CorrectionAuditTable';
import { CorrectionEvidenceModal } from './CorrectionEvidenceModal';
import { CorrectionHashModal } from './CorrectionHashModal';
import { CorrectionHero } from './CorrectionHero';
import type { CorrectionRequestPayload } from './CorrectionRequestModal';
import { CorrectionRequestModal } from './CorrectionRequestModal';
import { CorrectionStats } from './CorrectionStats';
import { CorrectionToolbar } from './CorrectionToolbar';

const defaultFilters: CorrectionHistoryFilters = {
  search: '',
  change: 'all',
  classId: 'all',
  ...defaultHistoryRange(),
};

type RequestPrefill = { studentId: string; studentName: string; nis: string; date: string };

const errorMessage = (error: unknown) =>
  error instanceof ApiError ? error.message : 'Terjadi kesalahan, coba lagi.';

/**
 * Coordinator for the attendance correction audit workspace and modals.
 *
 * @returns Correction audit workspace backed by GET /attendance/history.
 */
export function CorrectionManager() {
  const t = useTranslations('AttendanceCorrectionPage');
  const [filters, setFilters] = useState<CorrectionHistoryFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [requestPrefill, setRequestPrefill] = useState<RequestPrefill | null>(null);
  const [evidenceRow, setEvidenceRow] = useState<CorrectionRow | null>(null);
  const [ledgerRow, setLedgerRow] = useState<CorrectionRow | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);

  const historyQuery = useAttendanceHistory(historyQueryFor(filters, page));
  const submitCorrection = useSubmitCorrection();

  const showToast = (message: string, tone: 'success' | 'error' = 'success') => {
    setToast({ message, tone });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // shortcut: history endpoint has no text-search param; the toolbar search
  // filters the currently loaded page client-side.
  const rows = filterRowsBySearch(
    (historyQuery.data?.data ?? []).map(toCorrectionRow),
    filters.search,
  );
  const pagination = pageMeta(historyQuery.data?.total ?? 0, page, rows.length);

  const updateFilters = (next: Partial<CorrectionHistoryFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
    setPage(1);
  };

  const handleRequestSubmit = (payload: CorrectionRequestPayload) => {
    submitCorrection.mutate(payload, {
      onSuccess: (detail) => {
        setIsRequestOpen(false);
        setRequestPrefill(null);
        const sent = t('toast_request_sent', { student: payload.studentLabel });
        // Server-computed evidence_hash of the correction just stored
        // (POST /attendance/records/:id/corrections returns the fresh trail).
        const hash = detail.corrections.at(-1)?.evidence_hash;
        showToast(hash === undefined || hash === null ? sent : `${sent} Hash: ${shortHash(hash)}`);
      },
      onError: (error) => {
        showToast(errorMessage(error), 'error');
      },
    });
  };

  const handleExport = async () => {
    try {
      // GET /exports/attendance is an admin endpoint; staff receive the backend
      // permission error message through the error toast.
      const { blob, filename } = await exportAttendanceAudit(filters);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename ?? 'rekap-absensi.xlsx';
      anchor.click();
      URL.revokeObjectURL(url);
      showToast(t('toast_export'));
    } catch (error) {
      showToast(errorMessage(error), 'error');
    }
  };

  return (
    <div className="w-full">
      {toast && (
        <div
          className={`fixed right-6 bottom-6 z-50 flex animate-in items-center gap-3 rounded-xl border px-4 py-3 text-white shadow-xl fade-in slide-in-from-bottom-3 ${
            toast.tone === 'error' ? 'border-red-500 bg-red-700' : 'border-pine-hover bg-pine-deep'
          }`}
        >
          {toast.tone === 'error' ? (
            <TriangleAlert className="size-5 shrink-0" />
          ) : (
            <CheckCircle2 className="size-5 shrink-0 text-amber-gold" />
          )}
          <span className="text-xs font-medium sm:text-sm">{toast.message}</span>
          <button
            type="button"
            onClick={() => {
              setToast(null);
            }}
            className="ml-2 cursor-pointer text-white/60 hover:text-white"
            aria-label={t('btn_close_notification')}
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <CorrectionHero
        onDownload={() => {
          void handleExport();
        }}
        onRequest={() => {
          setRequestPrefill(null);
          setIsRequestOpen(true);
        }}
      />

      <div className="mt-4">
        {/* shortcut: no backend endpoint for the monthly correction recap counters, keep mock */}
        <CorrectionStats stats={mockCorrectionStats} />
      </div>

      <div className="mt-4">
        <CorrectionToolbar
          filters={filters}
          onSearchChange={(search) => {
            updateFilters({ search });
          }}
          onChangeFilterChange={(change) => {
            updateFilters({ change });
          }}
          onClassChange={(classId) => {
            updateFilters({ classId });
          }}
          onFromChange={(from) => {
            updateFilters({ from });
          }}
          onToChange={(to) => {
            updateFilters({ to });
          }}
          onReset={() => {
            setFilters(defaultFilters);
            setPage(1);
          }}
        />
      </div>

      <div className="mt-4">
        <CorrectionAuditTable
          rows={rows}
          pagination={pagination}
          loading={historyQuery.isPending}
          error={historyQuery.isError ? errorMessage(historyQuery.error) : null}
          onPageChange={setPage}
          onOpenEvidence={setEvidenceRow}
          onOpenLedger={setLedgerRow}
          onCorrect={(row) => {
            setRequestPrefill({
              studentId: row.studentId,
              studentName: row.student.name,
              nis: row.student.nis,
              date: row.sessionIso,
            });
            setIsRequestOpen(true);
          }}
        />
      </div>

      <aside className="mt-4 flex flex-col gap-3 rounded-2xl border border-amber-gold/40 bg-amber-surface p-4 sm:flex-row sm:items-start">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-gold/30 text-amber-dark">
          <FileCheck2 className="size-4" />
        </span>
        <div className="flex-1">
          <h2 className="text-xs font-bold text-amber-dark">{t('compliance_title')}</h2>
          <p className="mt-0.5 text-[11px] leading-relaxed text-amber-dark/90">
            {t('compliance_body')}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 self-start rounded-full bg-card px-2.5 py-1 text-[10px] font-bold text-pine-deep">
          <LockKeyhole className="size-3" />
          {t('compliance_lock')}
        </span>
      </aside>

      {isRequestOpen && (
        <CorrectionRequestModal
          initial={requestPrefill}
          submitting={submitCorrection.isPending}
          onClose={() => {
            setIsRequestOpen(false);
            setRequestPrefill(null);
          }}
          onSubmit={handleRequestSubmit}
        />
      )}

      {evidenceRow && (
        <CorrectionEvidenceModal
          row={evidenceRow}
          onClose={() => {
            setEvidenceRow(null);
          }}
        />
      )}

      {ledgerRow && (
        <CorrectionHashModal
          row={ledgerRow}
          onClose={() => {
            setLedgerRow(null);
          }}
        />
      )}
    </div>
  );
}
