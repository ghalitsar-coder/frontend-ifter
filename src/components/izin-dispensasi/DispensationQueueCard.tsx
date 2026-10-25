import { Download, FileCheck2, Inbox, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import {
  DISPENSATION_PAGE_SIZE,
  dispensationQueryFor,
  downloadDispensationDocument,
  dispensationErrorMessage,
  toDispensationRow,
  useDispensations,
} from '@/lib/api/izin-dispensasi';
import type { DispensationDto, DispensationFilters } from '@/lib/api/izin-dispensasi';

const statusOptions: { value: DispensationFilters['status']; label: string }[] = [
  { value: 'all', label: 'Semua Status' },
  { value: 'pending', label: 'Menunggu Verifikasi' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
];

const typeOptions: { value: DispensationFilters['type']; label: string }[] = [
  { value: 'all', label: 'Semua Tipe' },
  { value: 'sick', label: 'Sakit' },
  { value: 'late', label: 'Terlambat' },
  { value: 'permit', label: 'Izin' },
  { value: 'other', label: 'Lainnya' },
];

const selectClasses =
  'rounded-xl border border-border-control bg-card px-2.5 py-1.5 text-[10px] font-semibold text-foreground focus:border-pine-deep focus:outline-none';

const statusByValue = new Map<string, { value: DispensationFilters['status'] }>(
  statusOptions.map((option) => [option.value, option]),
);
const typeByValue = new Map<string, { value: DispensationFilters['type'] }>(
  typeOptions.map((option) => [option.value, option]),
);

/**
 * Narrow a status `<select>` value back to the filter union.
 * @param value - Raw `event.target.value`.
 * @returns A known status option, the 'all' option when unknown.
 */
function toStatusFilter(value: string): DispensationFilters['status'] {
  return (statusByValue.get(value) ?? statusByValue.get('all'))?.value ?? 'all';
}

/**
 * Narrow a type `<select>` value back to the filter union.
 * @param value - Raw `event.target.value`.
 * @returns A known type option, the 'all' option when unknown.
 */
function toTypeFilter(value: string): DispensationFilters['type'] {
  return (typeByValue.get(value) ?? typeByValue.get('all'))?.value ?? 'all';
}

/**
 * Tailwind tone classes for a queue status pill.
 * @param status - Normalised row status.
 * @returns Colour classes, amber default for pending.
 */
function statusTone(status: string): string {
  if (status === 'approved') {
    return 'bg-pine-light text-pine-deep';
  }
  if (status === 'rejected') {
    return 'bg-red-50 text-red-700';
  }
  return 'bg-amber-surface text-amber-dark';
}

/**
 * Live dispensation queue: GET /dispensations with status/type/date filters,
 * per-row private document download and role-gated verification.
 *
 * @param props - `canVerify` shows the verify action (admin/teacher/duty_teacher),
 *   `onToast` surfaces messages, `onVerifyRequest` opens the decision modal.
 * @returns Queue card.
 */
export function DispensationQueueCard(props: {
  canVerify: boolean;
  onToast: (message: string) => void;
  onVerifyRequest: (dispensation: DispensationDto) => void;
}) {
  const [filters, setFilters] = useState<DispensationFilters>({
    status: 'all',
    type: 'all',
    from: '',
    to: '',
  });
  const [page, setPage] = useState(1);

  const query = dispensationQueryFor(filters, page);
  const list = useDispensations(query);
  const total = list.data?.total ?? 0;
  const rows = (list.data?.data ?? []).map(toDispensationRow);
  const totalPages = Math.max(1, Math.ceil(total / DISPENSATION_PAGE_SIZE));

  const handleDownload = async (row: (typeof rows)[number]) => {
    try {
      const { blob, filename } = await downloadDispensationDocument(row.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename ?? `Dispensasi_${row.id}`);
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      props.onToast(`Dokumen diunduh: ${filename ?? row.studentName}`);
    } catch (error) {
      props.onToast(dispensationErrorMessage(error, 'Gagal mengunduh dokumen dispensasi.'));
    }
  };

  return (
    <section className="rounded-2xl border border-border-subtle bg-card p-4 shadow-xs sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-pine-light text-pine-deep">
            <Inbox className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-extrabold tracking-tight text-foreground">
              Antrian Dispensasi
            </h2>
            <p className="text-[10px] text-muted-foreground">
              Data nyata dari GET /dispensations — {total} total catatan
            </p>
          </div>
        </div>
        {props.canVerify && (
          <span className="inline-flex items-center gap-1 rounded-full bg-pine-light px-2 py-0.5 text-[9px] font-bold text-pine-deep">
            <ShieldCheck className="size-3" />
            Anda dapat memverifikasi
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          aria-label="Filter status dispensasi"
          value={filters.status}
          onChange={(event) => {
            setFilters((current) => ({
              ...current,
              status: toStatusFilter(event.target.value),
            }));
            setPage(1);
          }}
          className={selectClasses}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter tipe dispensasi"
          value={filters.type}
          onChange={(event) => {
            setFilters((current) => ({
              ...current,
              type: toTypeFilter(event.target.value),
            }));
            setPage(1);
          }}
          className={selectClasses}
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-1 text-[9px] font-semibold text-muted-foreground">
          Dari
          <input
            type="date"
            aria-label="Tanggal mulai filter"
            value={filters.from}
            onChange={(event) => {
              setFilters((current) => ({ ...current, from: event.target.value }));
              setPage(1);
            }}
            className={selectClasses}
          />
        </label>
        <label className="flex items-center gap-1 text-[9px] font-semibold text-muted-foreground">
          Sampai
          <input
            type="date"
            aria-label="Tanggal akhir filter"
            value={filters.to}
            onChange={(event) => {
              setFilters((current) => ({ ...current, to: event.target.value }));
              setPage(1);
            }}
            className={selectClasses}
          />
        </label>
      </div>

      {list.isPending && (
        <p className="mt-4 text-[11px] text-muted-foreground">Memuat antrian dispensasi…</p>
      )}
      {!list.isPending && list.isError && (
        <p className="mt-4 rounded-xl border border-amber-gold/40 bg-amber-surface px-3 py-2 text-[10px] text-amber-dark">
          Gagal memuat dispensasi:{' '}
          {dispensationErrorMessage(list.error, 'Terjadi kesalahan server.')}
        </p>
      )}
      {!list.isPending && !list.isError && rows.length === 0 && (
        <p className="mt-4 text-[11px] text-muted-foreground">
          Belum ada dispensasi untuk filter ini.
        </p>
      )}
      {!list.isPending && !list.isError && rows.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[10px]">
            <thead>
              <tr className="border-b border-border-subtle text-[8px] tracking-wider text-muted-foreground uppercase">
                <th className="py-1.5 pr-2 font-bold">Siswa</th>
                <th className="py-1.5 pr-2 font-bold">Tipe</th>
                <th className="py-1.5 pr-2 font-bold">Periode</th>
                <th className="py-1.5 pr-2 font-bold">Status</th>
                <th className="py-1.5 font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border-subtle/60 align-top">
                  <td className="py-2 pr-2">
                    <span className="block font-bold text-foreground">{row.studentName}</span>
                    <span className="block text-[9px] text-muted-foreground">{row.className}</span>
                  </td>
                  <td className="py-2 pr-2 font-semibold text-foreground">{row.typeLabel}</td>
                  <td className="py-2 pr-2 text-muted-foreground">{row.period}</td>
                  <td className="py-2 pr-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${statusTone(row.status)}`}
                    >
                      {row.statusLabel}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-1.5">
                      {row.documentAvailable && (
                        <button
                          type="button"
                          onClick={() => {
                            void handleDownload(row);
                          }}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border-control bg-card px-2 py-1 text-[9px] font-bold text-pine-deep transition-colors hover:bg-pine-light"
                        >
                          <Download className="size-3" />
                          Unduh
                        </button>
                      )}
                      {props.canVerify && row.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => {
                            const raw = list.data?.data.find((item) => item.id === row.id);

                            if (raw !== undefined) {
                              props.onVerifyRequest(raw);
                            }
                          }}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-pine-deep px-2 py-1 text-[9px] font-bold text-white transition-colors hover:bg-pine-hover"
                        >
                          <FileCheck2 className="size-3" />
                          Verifikasi
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-[9px] font-semibold text-muted-foreground">
        <span>
          Halaman {Math.min(page, totalPages)} dari {totalPages}
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => {
              setPage((current) => Math.max(1, current - 1));
            }}
            className="cursor-pointer rounded-lg border border-border-control bg-card px-2 py-1 transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sebelumnya
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => {
              setPage((current) => Math.min(totalPages, current + 1));
            }}
            className="cursor-pointer rounded-lg border border-border-control bg-card px-2 py-1 transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </section>
  );
}
