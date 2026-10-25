'use client';

import { CheckCircle2, ScrollText, X } from 'lucide-react';
import { useState } from 'react';
import {
  buildAuditLogQuery,
  formatAuditPayload,
  formatAuditTimestamp,
  useAuditLogs,
} from '@/lib/api/audit';
import { ApiError } from '@/lib/api/client';

const PAGE_SIZE = 25;

const ENTITY_TYPE_OPTIONS = [
  'student',
  'teacher',
  'user',
  'class',
  'term',
  'academic_year',
  'school_settings',
  'school_holiday',
  'school_geofence',
  'attendance_correction_evidence',
  'discipline_record',
  'discipline_category',
  'dispensation',
  'duty_assignment',
  'duty_rotation',
  'sanction_rule',
  'employment_type',
  'import_job',
];

/**
 * Admin-only audit log workspace: server-filtered, paginated view over
 * GET /audit-logs with expandable before/after payloads.
 *
 * @returns Audit log page content.
 */
export function AuditLogManager() {
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const query = buildAuditLogQuery(
    { action, entity_type: entityType, entity_id: entityId, from, to },
    page,
    PAGE_SIZE,
  );
  const logsQuery = useAuditLogs(query);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const logs = logsQuery.data?.data ?? [];
  const total = logsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleRefresh = () => {
    void logsQuery.refetch();
    showToast('Log audit dimuat ulang.');
  };

  return (
    <div className="w-full">
      {toastMessage && (
        <div className="fixed right-6 bottom-6 z-50 flex animate-in items-center gap-3 rounded-xl border border-pine-hover bg-pine-deep px-4 py-3 text-white shadow-xl fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />
          <span className="text-xs font-medium sm:text-sm">{toastMessage}</span>
          <button
            type="button"
            onClick={() => {
              setToastMessage(null);
            }}
            className="ml-2 cursor-pointer text-white/60 hover:text-white"
            aria-label="Tutup notifikasi"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="bg-surface-card mb-4 rounded-2xl border border-border-control p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-pine-deep text-amber-gold shadow-xs">
            <ScrollText className="size-5" />
          </div>
          <div>
            <h1 className="text-text-primary text-lg font-bold">Log Audit</h1>
            <p className="text-text-muted text-xs">
              Jejak perubahan data sistem — hanya dapat diakses admin
            </p>
          </div>
        </div>

        <form
          className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            showToast('Filter diterapkan.');
          }}
        >
          <input
            type="text"
            aria-label="Filter aksi"
            value={action}
            onChange={(event) => {
              setAction(event.target.value);
              setPage(1);
            }}
            placeholder="Aksi (mis. student.update)"
            className="rounded-xl border border-border-control bg-surface-container-low px-3 py-2 text-xs focus:border-pine-deep focus:outline-hidden"
          />
          <select
            aria-label="Filter tipe entitas"
            value={entityType}
            onChange={(event) => {
              setEntityType(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-border-control bg-surface-container-low px-3 py-2 text-xs focus:border-pine-deep focus:outline-hidden"
          >
            <option value="">Semua tipe entitas</option>
            {ENTITY_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            type="text"
            aria-label="Filter id entitas"
            value={entityId}
            onChange={(event) => {
              setEntityId(event.target.value);
              setPage(1);
            }}
            placeholder="ID entitas"
            className="rounded-xl border border-border-control bg-surface-container-low px-3 py-2 text-xs focus:border-pine-deep focus:outline-hidden"
          />
          <label className="text-text-muted flex flex-col gap-1 text-[11px] font-semibold">
            Dari tanggal
            <input
              type="date"
              aria-label="Filter tanggal mulai"
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-border-control bg-surface-container-low px-3 py-2 text-xs font-normal focus:border-pine-deep focus:outline-hidden"
            />
          </label>
          <label className="text-text-muted flex flex-col gap-1 text-[11px] font-semibold">
            Sampai tanggal
            <input
              type="date"
              aria-label="Filter tanggal akhir"
              value={to}
              onChange={(event) => {
                setTo(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-border-control bg-surface-container-low px-3 py-2 text-xs font-normal focus:border-pine-deep focus:outline-hidden"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 cursor-pointer rounded-xl bg-pine-deep px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-pine-hover"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              className="hover:bg-surface-container cursor-pointer rounded-xl border border-border-control px-3 py-2 text-xs font-semibold transition-colors"
            >
              Muat
            </button>
          </div>
        </form>
      </div>

      {logsQuery.isPending && (
        <div className="bg-surface-card text-text-muted mb-4 rounded-xl border border-border-control px-4 py-3 text-xs font-semibold">
          Memuat log audit dari server…
        </div>
      )}
      {logsQuery.isError && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
          <span>
            {logsQuery.error instanceof ApiError
              ? logsQuery.error.message
              : 'Gagal memuat log audit.'}
          </span>
          <button
            type="button"
            onClick={() => {
              void logsQuery.refetch();
            }}
            className="cursor-pointer rounded-lg border border-rose-300 px-3 py-1 transition-colors hover:bg-rose-100"
          >
            Coba Lagi
          </button>
        </div>
      )}

      <div className="bg-surface-card overflow-hidden rounded-2xl border border-border-control">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container text-text-muted border-b border-border-control text-[11px] font-semibold tracking-wider uppercase">
              <tr>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Aktor</th>
                <th className="px-4 py-3">Aksi</th>
                <th className="px-4 py-3">Entitas</th>
                <th className="px-4 py-3">Alasan</th>
                <th className="px-4 py-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const before = formatAuditPayload(log.before_data);
                const after = formatAuditPayload(log.after_data);
                return (
                  <tr
                    key={log.id}
                    className="border-b border-border-control/60 last:border-0 hover:bg-surface-container-low"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatAuditTimestamp(log.created_at)}
                    </td>
                    <td className="px-4 py-3">{log.actor_name}</td>
                    <td className="px-4 py-3 font-mono">{log.action}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">{log.entity_type}</span>
                      {log.entity_id !== undefined && (
                        <span className="text-text-muted ml-1 font-mono text-[10px]">
                          #{log.entity_id.slice(0, 8)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{log.reason ?? '—'}</td>
                    <td className="px-4 py-3">
                      {before === '' && after === '' ? (
                        <span className="text-text-muted">—</span>
                      ) : (
                        <details className="max-w-[280px]">
                          <summary className="cursor-pointer font-semibold text-pine-deep">
                            Lihat
                          </summary>
                          {before !== '' && (
                            <pre className="bg-surface-container mt-2 max-h-40 overflow-auto rounded-lg p-2 font-mono text-[10px]">
                              {before}
                            </pre>
                          )}
                          {after !== '' && (
                            <pre className="bg-surface-container mt-2 max-h-40 overflow-auto rounded-lg p-2 font-mono text-[10px]">
                              {after}
                            </pre>
                          )}
                        </details>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!logsQuery.isPending && logs.length === 0 && (
                <tr>
                  <td className="text-text-muted px-4 py-6 text-center" colSpan={6}>
                    Tidak ada entri log untuk filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border-control px-4 py-3 text-xs">
          <span className="text-text-muted">
            Menampilkan {total === 0 ? 0 : query.offset + 1}–
            {Math.min(query.offset + PAGE_SIZE, total)} dari {total} entri
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => {
                setPage((current) => Math.max(1, current - 1));
              }}
              className="hover:bg-surface-container cursor-pointer rounded-lg border border-border-control px-3 py-1.5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <span className="text-text-muted">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => {
                setPage((current) => Math.min(totalPages, current + 1));
              }}
              className="hover:bg-surface-container cursor-pointer rounded-lg border border-border-control px-3 py-1.5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
