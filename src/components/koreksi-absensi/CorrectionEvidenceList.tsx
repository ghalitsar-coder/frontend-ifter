'use client';

import { CloudUpload, Download, FileText, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { ApiError } from '@/lib/api/client';
import {
  downloadCorrectionEvidence,
  EVIDENCE_ACCEPT,
  evidenceFileError,
  formatDateId,
  formatFileSize,
  MAX_EVIDENCE_FILE_BYTES,
  saveDownloadedBlob,
  useCorrectionEvidence,
  useDeleteCorrectionEvidence,
  useUploadCorrectionEvidence,
} from '@/lib/api/koreksi-absensi';
import type { CorrectionEvidence } from '@/lib/api/koreksi-absensi';

const messageOf = (error: unknown, fallback: string) =>
  error instanceof ApiError && error.message !== '' ? error.message : fallback;

/**
 * One evidence row with download and two-step delete controls.
 * @param props - Evidence item, busy flags and action handlers.
 * @returns List item.
 */
function EvidenceRow(props: {
  item: CorrectionEvidence;
  canManage: boolean;
  downloading: boolean;
  confirming: boolean;
  deleting: boolean;
  onDownload: (item: CorrectionEvidence) => void;
  onAskDelete: (id: string | null) => void;
  onDelete: (item: CorrectionEvidence) => void;
}) {
  const { item } = props;

  return (
    <li className="rounded-xl border border-border-subtle bg-surface-container-low/60 p-2.5">
      <div className="flex items-start gap-2">
        <span className="bg-surface-card mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-pine-deep">
          <FileText className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-bold text-foreground" title={item.file_name}>
            {item.file_name}
          </p>
          <p className="text-[9px] text-muted-foreground">
            {formatFileSize(item.size_bytes)} • {formatDateId(item.created_at)}
            {item.correction_id === null ? ' • belum tertaut koreksi' : ''}
          </p>
          {item.note !== null && item.note !== '' && (
            <p className="mt-0.5 text-[10px] leading-relaxed text-foreground/80">{item.note}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => {
              props.onDownload(item);
            }}
            disabled={props.downloading}
            aria-label={`Unduh ${item.file_name}`}
            title="Unduh bukti"
            className="flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-pine-light hover:text-pine-deep disabled:opacity-50"
          >
            <Download className="size-3.5" />
          </button>
          {props.canManage && (
            <button
              type="button"
              onClick={() => {
                if (props.confirming) {
                  props.onDelete(item);
                } else {
                  props.onAskDelete(item.id);
                }
              }}
              disabled={props.deleting}
              aria-label={
                props.confirming ? `Konfirmasi hapus ${item.file_name}` : `Hapus ${item.file_name}`
              }
              title={props.confirming ? 'Klik lagi untuk menghapus' : 'Hapus bukti'}
              className={`flex h-6 cursor-pointer items-center justify-center gap-1 rounded-md px-1.5 transition-colors disabled:opacity-50 ${
                props.confirming
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'text-muted-foreground hover:bg-rose-50 hover:text-rose-600'
              }`}
            >
              <Trash2 className="size-3.5" />
              {props.confirming && <span className="text-[9px] font-bold">Hapus?</span>}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

/**
 * List body with its loading / error / empty states kept out of the manager
 * so each branch stays a plain early return.
 * @param props - Query state, rows and row actions.
 * @returns Error notice, empty notice or the evidence list.
 */
function EvidenceListBody(props: {
  isError: boolean;
  isPending: boolean;
  error: unknown;
  items: CorrectionEvidence[];
  canManage: boolean;
  downloadingId: string | null;
  confirmingId: string | null;
  deleting: boolean;
  onRefetch: () => void;
  onDownload: (item: CorrectionEvidence) => void;
  onAskDelete: (id: string | null) => void;
  onDelete: (item: CorrectionEvidence) => void;
}) {
  if (props.isError) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
        <span className="text-[10px] font-semibold text-red-700">
          {messageOf(props.error, 'Gagal memuat bukti pendukung.')}
        </span>
        <button
          type="button"
          onClick={props.onRefetch}
          className="cursor-pointer rounded-md border border-red-300 px-2 py-0.5 text-[10px] font-semibold text-red-700 hover:bg-red-100"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  if (props.items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border-subtle px-3 py-2 text-[10px] text-muted-foreground">
        {props.isPending ? 'Memuat bukti…' : 'Belum ada berkas bukti untuk rekor ini.'}
      </p>
    );
  }

  return (
    <ul className="space-y-1.5">
      {props.items.map((item) => (
        <EvidenceRow
          key={item.id}
          item={item}
          canManage={props.canManage}
          downloading={props.downloadingId === item.id}
          confirming={props.confirmingId === item.id}
          deleting={props.deleting}
          onDownload={props.onDownload}
          onAskDelete={props.onAskDelete}
          onDelete={props.onDelete}
        />
      ))}
    </ul>
  );
}

/**
 * Evidence manager for one attendance record (§6.6): lists uploaded files with
 * private download + delete, and (for attendance-ops roles) lets the user
 * upload a PDF/JPG/PNG up to the backend size limit.
 *
 * @param props - Record id, manage permission and optional toast sink.
 * @returns Evidence section.
 */
export function CorrectionEvidenceList(props: {
  recordId: string;
  canManage: boolean;
  onToast?: (message: string, tone?: 'success' | 'error') => void;
}) {
  const query = useCorrectionEvidence(props.recordId);
  const upload = useUploadCorrectionEvidence();
  const remove = useDeleteCorrectionEvidence();
  const items = query.data ?? [];

  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const notify = (message: string, tone: 'success' | 'error') => {
    props.onToast?.(message, tone);
    if (tone === 'error') {
      setUploadError(message);
    }
  };

  const handlePick = (picked: File | null) => {
    if (picked === null) {
      setFile(null);
      setUploadError(null);
      return;
    }
    const validation = evidenceFileError(picked);
    setUploadError(validation);
    setFile(validation === null ? picked : null);
  };

  const handleUpload = () => {
    if (file === null) {
      setUploadError('Pilih berkas bukti terlebih dahulu.');
      return;
    }
    setUploadError(null);
    upload.mutate(
      { recordId: props.recordId, file, note },
      {
        onSuccess: (evidence) => {
          setFile(null);
          setNote('');
          notify(`Bukti ${evidence.file_name} berhasil diunggah.`, 'success');
        },
        onError: (err) => {
          notify(messageOf(err, 'Gagal mengunggah bukti.'), 'error');
        },
      },
    );
  };

  const handleDownload = (item: CorrectionEvidence) => {
    setDownloadingId(item.id);
    const run = async () => {
      try {
        const { blob, filename } = await downloadCorrectionEvidence(item.id);
        saveDownloadedBlob(blob, filename ?? item.file_name);
      } catch (error) {
        notify(messageOf(error, 'Gagal mengunduh bukti.'), 'error');
      } finally {
        setDownloadingId(null);
      }
    };
    void run();
  };

  const handleDelete = (item: CorrectionEvidence) => {
    setUploadError(null);
    remove.mutate(
      { evidenceId: item.id, recordId: props.recordId },
      {
        onSuccess: () => {
          setConfirmingId(null);
          notify(`Bukti ${item.file_name} dihapus.`, 'success');
        },
        onError: (err) => {
          notify(messageOf(err, 'Gagal menghapus bukti.'), 'error');
        },
      },
    );
  };

  const renderBody = () => (
    <EvidenceListBody
      isError={query.isError}
      isPending={query.isPending}
      error={query.error}
      items={items}
      canManage={props.canManage}
      downloadingId={downloadingId}
      confirmingId={confirmingId}
      deleting={remove.isPending}
      onRefetch={() => {
        void query.refetch();
      }}
      onDownload={handleDownload}
      onAskDelete={setConfirmingId}
      onDelete={handleDelete}
    />
  );

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
          Bukti pendukung ({items.length})
        </p>
        {query.isFetching && <span className="text-[9px] text-muted-foreground">Memuat…</span>}
      </div>

      {renderBody()}

      {props.canManage && (
        <div className="mt-2 rounded-xl border border-dashed border-border-control bg-surface-container-low/50 p-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor="correction-evidence-upload"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-pine-light px-2.5 py-1.5 text-[10px] font-bold text-pine-deep transition-colors hover:bg-pine-light/70"
            >
              <CloudUpload className="size-3.5" />
              {file === null ? 'Pilih berkas' : 'Ganti berkas'}
              <input
                id="correction-evidence-upload"
                type="file"
                accept={EVIDENCE_ACCEPT}
                className="sr-only"
                onChange={(event) => {
                  handlePick(event.target.files?.[0] ?? null);
                }}
              />
            </label>
            <input
              type="text"
              value={note}
              maxLength={1000}
              onChange={(event) => {
                setNote(event.target.value);
              }}
              placeholder="Catatan bukti (opsional)"
              aria-label="Catatan bukti"
              className="h-7 min-w-0 flex-1 rounded-lg border border-border-control bg-card px-2 text-[10px] text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleUpload}
              disabled={upload.isPending || file === null}
              className="cursor-pointer rounded-lg bg-pine-deep px-2.5 py-1.5 text-[10px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {upload.isPending ? 'Mengunggah…' : 'Unggah bukti'}
            </button>
          </div>
          <p className="mt-1.5 flex items-center justify-between gap-2 text-[9px] text-muted-foreground">
            <span className="min-w-0 truncate">
              {file === null
                ? 'PDF, JPG, JPEG, atau PNG.'
                : `${file.name} • ${formatFileSize(file.size)}`}
            </span>
            <span className="shrink-0">Maks {formatFileSize(MAX_EVIDENCE_FILE_BYTES)}</span>
          </p>
        </div>
      )}

      {uploadError !== null && (
        <p className="mt-1 text-[10px] font-semibold text-red-600">{uploadError}</p>
      )}
      {confirmingId !== null && (
        <button
          type="button"
          onClick={() => {
            setConfirmingId(null);
          }}
          className="mt-1 inline-flex cursor-pointer items-center gap-1 text-[9px] font-semibold text-muted-foreground hover:text-pine-deep"
        >
          <X className="size-2.5" /> Batal hapus
        </button>
      )}
    </div>
  );
}
