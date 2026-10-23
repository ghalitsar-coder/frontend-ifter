'use client';

import { CheckCircle2, FileCheck2, LockKeyhole, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  filterCorrectionLogs,
  mockCorrectionLogs,
  mockCorrectionStats,
  paginateCorrectionLogs,
} from '@/data/mockAttendanceCorrection';
import type { CorrectionFilterState, CorrectionLog } from '@/types/attendanceCorrection';
import { CorrectionAuditTable } from './CorrectionAuditTable';
import { CorrectionEvidenceModal } from './CorrectionEvidenceModal';
import { CorrectionHashModal } from './CorrectionHashModal';
import { CorrectionHero } from './CorrectionHero';
import { CorrectionRequestModal } from './CorrectionRequestModal';
import { CorrectionStats } from './CorrectionStats';
import { CorrectionToolbar } from './CorrectionToolbar';

const defaultFilters: CorrectionFilterState = {
  search: '',
  change: 'all',
  className: 'all',
};

/**
 * Coordinator for the attendance correction audit workspace and modals.
 *
 * @returns Correction audit workspace.
 */
export function CorrectionManager() {
  const t = useTranslations('AttendanceCorrectionPage');
  const [filters, setFilters] = useState<CorrectionFilterState>(defaultFilters);
  const [page, setPage] = useState(1);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [evidenceLog, setEvidenceLog] = useState<CorrectionLog | null>(null);
  const [hashLog, setHashLog] = useState<CorrectionLog | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const filteredLogs = filterCorrectionLogs(mockCorrectionLogs, filters);
  const pagination = paginateCorrectionLogs(filteredLogs, page);

  const updateFilters = (next: Partial<CorrectionFilterState>) => {
    setFilters((current) => ({ ...current, ...next }));
    setPage(1);
  };

  return (
    <div className="w-full">
      {toastMessage && (
        <div className="fixed right-6 bottom-6 z-50 flex animate-in items-center gap-3 rounded-xl border border-pine-hover bg-pine-deep px-4 py-3 text-white shadow-xl fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="size-5 shrink-0 text-amber-gold" />
          <span className="text-xs font-medium sm:text-sm">{toastMessage}</span>
          <button
            type="button"
            onClick={() => {
              setToastMessage(null);
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
          showToast(t('toast_export'));
        }}
        onRequest={() => {
          setIsRequestOpen(true);
        }}
      />

      <div className="mt-4">
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
          onClassChange={(className) => {
            updateFilters({ className });
          }}
          onReset={() => {
            setFilters(defaultFilters);
            setPage(1);
          }}
        />
      </div>

      <div className="mt-4">
        <CorrectionAuditTable
          logs={filteredLogs}
          pagination={pagination}
          onPageChange={setPage}
          onOpenEvidence={setEvidenceLog}
          onOpenHash={setHashLog}
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
          onClose={() => {
            setIsRequestOpen(false);
          }}
          onSubmit={(payload) => {
            setIsRequestOpen(false);
            showToast(t('toast_request_sent', { student: payload.student }));
          }}
        />
      )}

      {evidenceLog && (
        <CorrectionEvidenceModal
          log={evidenceLog}
          onClose={() => {
            setEvidenceLog(null);
          }}
          onDownload={() => {
            setEvidenceLog(null);
            showToast(t('toast_evidence_downloaded'));
          }}
        />
      )}

      {hashLog && (
        <CorrectionHashModal
          log={hashLog}
          onClose={() => {
            setHashLog(null);
          }}
        />
      )}
    </div>
  );
}
