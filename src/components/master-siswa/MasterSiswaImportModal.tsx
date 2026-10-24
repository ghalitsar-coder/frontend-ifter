import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { ApiError } from '@/lib/api/client';
import type { ImportJob, ImportMode, ImportErrorRow, ImportPreviewRow } from '@/lib/api/dto';
import {
  downloadStudentTemplate,
  useConfirmImport,
  useImportStudents,
} from '@/lib/api/master-siswa';

function errorText(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return 'Terjadi kesalahan tak terduga.';
}

function actionBadgeClass(action: string): string {
  if (action === 'invalid') {
    return 'bg-rose-100 text-rose-800';
  }
  if (action === 'update') {
    return 'bg-amber-100 text-amber-800';
  }
  return 'bg-emerald-100 text-emerald-800';
}

type UploadStepProps = {
  file: File | null;
  mode: ImportMode;
  templateBusy: boolean;
  templateError: string | null;
  uploadIsError: boolean;
  uploadError: unknown;
  uploadIsPending: boolean;
  onFilePicked: (file: File | null) => void;
  onModeChange: (mode: ImportMode) => void;
  onDownloadTemplate: () => void;
  onUpload: () => void;
};

/**
 * Step 1 of the import flow: file picker, official template download, mode selection, upload.
 * @param props - Upload-step state and callbacks (kept dumb; state lives in the modal).
 * @returns Step 1 JSX.
 */
function ImportUploadStep(props: UploadStepProps) {
  return (
    <>
      {/* File picker */}
      <div className="bg-surface-card space-y-3 rounded-2xl border border-border-control p-5 shadow-xs">
        <span className="text-text-primary block text-sm font-bold">Berkas Excel</span>
        <input
          type="file"
          accept=".xlsx"
          aria-label="Pilih berkas Excel"
          onChange={(e) => {
            props.onFilePicked(e.target.files?.[0] ?? null);
          }}
          className="text-text-muted block w-full text-xs file:mr-3 file:cursor-pointer file:rounded-xl file:border-0 file:bg-pine-light file:px-4 file:py-2 file:text-xs file:font-bold file:text-pine-deep"
        />
        {props.file !== null && (
          <p className="text-text-muted text-xs">
            Terpilih:{' '}
            <span className="font-mono font-semibold text-pine-deep">{props.file.name}</span>
          </p>
        )}
        {props.templateError !== null && (
          <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-700">
            <AlertTriangle className="size-3.5" /> Gagal mengunduh template: {props.templateError}
          </p>
        )}
        {props.uploadIsError && (
          <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-700">
            <AlertTriangle className="size-3.5" /> {errorText(props.uploadError)}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={props.onDownloadTemplate}
            disabled={props.templateBusy}
            className="bg-surface-card text-text-primary hover:bg-surface-container flex cursor-pointer items-center gap-1.5 rounded-xl border border-border-control px-3.5 py-2 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {props.templateBusy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            <span>Unduh Template Resmi Siswa</span>
          </button>
        </div>
      </div>

      {/* Mode selection */}
      <div className="bg-surface-card space-y-3 rounded-2xl border border-border-control p-5 shadow-xs">
        <span className="text-text-primary block text-sm font-bold">Mode Import</span>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <button
            type="button"
            aria-label="Pilih mode Create Only"
            onClick={() => {
              props.onModeChange('create_only');
            }}
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors ${
              props.mode === 'create_only'
                ? 'border-amber-gold bg-amber-surface/70 ring-1 ring-amber-gold'
                : 'bg-surface-card border-border-control hover:bg-pine-light/30'
            }`}
          >
            <div>
              <span className="block text-xs font-bold text-pine-deep sm:text-sm">Create Only</span>
              <span className="text-text-muted mt-0.5 block text-[11px] leading-relaxed">
                Menolak baris yang NISN / NIS-nya sudah terdaftar untuk menghindari timpa data.
              </span>
            </div>
          </button>
          <button
            type="button"
            aria-label="Pilih mode Upsert"
            onClick={() => {
              props.onModeChange('upsert');
            }}
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors ${
              props.mode === 'upsert'
                ? 'border-amber-gold bg-amber-surface/70 ring-1 ring-amber-gold'
                : 'bg-surface-card border-border-control hover:bg-pine-light/30'
            }`}
          >
            <div>
              <span className="block text-xs font-bold text-pine-deep sm:text-sm">
                Upsert (Perbarui)
              </span>
              <span className="text-text-muted mt-0.5 block text-[11px] leading-relaxed">
                Memperbarui data siswa lama yang NISN / NIS-nya sudah tercatat di sistem.
              </span>
            </div>
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={props.onUpload}
          disabled={props.file === null || props.uploadIsPending}
          className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-pine-deep px-5 text-xs font-bold text-white shadow-md transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
        >
          {props.uploadIsPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4 text-amber-gold" />
          )}
          <span>{props.uploadIsPending ? 'Mengunggah...' : 'Unggah & Validasi Baris'}</span>
        </button>
      </div>
    </>
  );
}

type ReviewStepProps = {
  job: ImportJob | undefined;
  errors: ImportErrorRow[];
  preview: ImportPreviewRow[];
  confirmIsError: boolean;
  confirmError: unknown;
};

/**
 * Step 2 of the import flow: validation KPIs, per-row error list and preview table.
 * @param props - Import job, preview/error rows and confirm-mutation state.
 * @returns Step 2 JSX.
 */
function ImportReviewStep(props: ReviewStepProps) {
  const { job } = props;
  return (
    <>
      {/* Validation summary */}
      <div className="bg-surface-card grid grid-cols-2 gap-3 rounded-2xl border border-border-control p-5 shadow-xs sm:grid-cols-4">
        <div className="flex flex-col gap-1">
          <span className="text-text-muted text-[11px] font-semibold uppercase">Total Baris</span>
          <span className="text-lg font-black text-pine-deep">{job?.total_rows ?? 0}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-text-muted text-[11px] font-semibold uppercase">Valid</span>
          <span className="text-lg font-black text-emerald-700">{job?.valid_rows ?? 0}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-text-muted text-[11px] font-semibold uppercase">Duplikat</span>
          <span className="text-lg font-black text-amber-700">{job?.duplicate_rows ?? 0}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-text-muted text-[11px] font-semibold uppercase">Invalid</span>
          <span className="text-lg font-black text-rose-700">{job?.invalid_rows ?? 0}</span>
        </div>
      </div>

      <p className="text-text-muted text-xs">
        Berkas{' '}
        <span className="font-mono font-semibold text-pine-deep">{job?.original_filename}</span> —
        status job: <span className="font-semibold text-pine-deep">{job?.status}</span>
      </p>

      {/* Per-row errors */}
      {props.errors.length > 0 && (
        <div className="bg-surface-card overflow-hidden rounded-2xl border border-rose-200 shadow-xs">
          <div className="border-b border-rose-100 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-800">
            Baris Bermasalah ({props.errors.length})
          </div>
          <div className="divide-y divide-border-subtle">
            {props.errors.map((rowErr) => (
              <div
                key={`${rowErr.row_number}-${rowErr.code}-${rowErr.column ?? ''}`}
                className="flex items-start gap-3 px-4 py-2.5 text-xs"
              >
                <span className="w-14 shrink-0 font-mono font-semibold text-rose-700">
                  Baris #{rowErr.row_number}
                </span>
                <span className="text-text-muted w-24 shrink-0 font-semibold">
                  {rowErr.column ?? '-'}
                </span>
                <span className="text-text-primary flex-1">{rowErr.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="bg-surface-card overflow-hidden rounded-2xl border border-border-control shadow-xs">
        <div className="border-b border-border-control bg-pine-light/60 px-4 py-2.5 text-xs font-bold text-pine-deep">
          Pratinjau Baris Terbaca ({props.preview.length})
        </div>
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-text-muted border-b border-border-control bg-surface-container-low/70 text-[10px] font-bold uppercase">
                <th scope="col" className="px-4 py-2">
                  Baris
                </th>
                <th scope="col" className="px-4 py-2">
                  Aksi
                </th>
                <th scope="col" className="px-4 py-2">
                  NISN / NIS
                </th>
                <th scope="col" className="px-4 py-2">
                  Nama
                </th>
                <th scope="col" className="px-4 py-2">
                  Kelas
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {props.preview.map((row) => (
                <tr key={row.row_number}>
                  <td className="text-text-muted px-4 py-2 font-mono">#{row.row_number}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${actionBadgeClass(row.action)}`}
                    >
                      {row.action}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono">{row.key}</td>
                  <td className="px-4 py-2 font-semibold text-pine-deep">{row.name}</td>
                  <td className="text-text-muted px-4 py-2">{row.class_name ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {props.confirmIsError && (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-700">
          <AlertTriangle className="size-3.5" /> {errorText(props.confirmError)}
        </p>
      )}
    </>
  );
}

/**
 * Excel bulk import modal for student master data: template download, upload with
 * mode selection, per-row preview + error validation, then job confirmation.
 * Domain strings are hard-coded Indonesian (import flow is school-facing content).
 *
 * @param props - Component properties.
 * @returns Modal element or null.
 */
export function MasterSiswaImportModal(props: {
  isOpen: boolean;
  onClose: () => void;
  onImported: (successRows: number) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ImportMode>('create_only');
  const [templateBusy, setTemplateBusy] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);

  const uploadMutation = useImportStudents();
  const confirmMutation = useConfirmImport();
  const upload = uploadMutation.data;

  const handleTemplateDownload = async () => {
    setTemplateBusy(true);
    setTemplateError(null);
    try {
      await downloadStudentTemplate();
    } catch (error) {
      setTemplateError(errorText(error));
    }
    setTemplateBusy(false);
  };

  const handleClose = () => {
    uploadMutation.reset();
    confirmMutation.reset();
    setFile(null);
    setTemplateError(null);
    props.onClose();
  };

  const handleUpload = () => {
    if (file === null) {
      return;
    }
    uploadMutation.mutate({ file, mode });
  };

  const handleConfirm = () => {
    if (upload?.job === undefined) {
      return;
    }
    confirmMutation.mutate(upload.job.id, {
      onSuccess: (job) => {
        props.onImported(job.success_rows);
        handleClose();
      },
    });
  };

  if (!props.isOpen) {
    return null;
  }

  const job = upload?.job;
  const canConfirm = job?.status === 'validated';

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is already scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-import-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-pine-deep/50 p-3 backdrop-blur-sm sm:p-6"
    >
      <div className="bg-surface-card relative flex max-h-[92vh] w-full max-w-4xl animate-in flex-col overflow-hidden rounded-3xl shadow-2xl duration-200 zoom-in-95 fade-in">
        <div className="h-1.5 w-full bg-gradient-to-r from-pine-deep via-pine-hover to-amber-gold" />

        {/* Header */}
        <div className="bg-surface-card flex items-start justify-between border-b border-border-control px-6 py-5 sm:px-8">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-pine-light text-pine-deep shadow-xs">
              <FileSpreadsheet className="size-6" />
            </div>
            <div>
              <h2
                id="modal-import-title"
                className="text-lg font-bold tracking-tight text-pine-deep sm:text-xl"
              >
                Import Data Siswa (Excel .xlsx)
              </h2>
              <p className="text-text-muted mt-0.5 text-xs sm:text-sm">
                Langkah 1: unggah berkas • Langkah 2: tinjau validasi baris • Langkah 3: konfirmasi
                ke database.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup jendela import"
            className="hover:bg-surface-container text-text-muted hover:text-text-primary flex size-9 cursor-pointer items-center justify-center rounded-xl bg-surface-container-low transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="bg-canvas-base flex-1 space-y-5 overflow-y-auto px-6 py-5 sm:px-8">
          {upload === undefined ? (
            <ImportUploadStep
              file={file}
              mode={mode}
              templateBusy={templateBusy}
              templateError={templateError}
              uploadIsError={uploadMutation.isError}
              uploadError={uploadMutation.error}
              uploadIsPending={uploadMutation.isPending}
              onFilePicked={setFile}
              onModeChange={setMode}
              onDownloadTemplate={() => {
                void handleTemplateDownload();
              }}
              onUpload={handleUpload}
            />
          ) : (
            <ImportReviewStep
              job={job}
              errors={upload.errors}
              preview={upload.preview}
              confirmIsError={confirmMutation.isError}
              confirmError={confirmMutation.error}
            />
          )}
        </div>

        {/* Footer */}
        <div className="bg-surface-card flex shrink-0 flex-col items-center justify-between gap-3 border-t border-border-control px-6 py-4 sm:flex-row sm:px-8">
          <button
            type="button"
            onClick={handleClose}
            className="hover:bg-surface-container text-text-muted hover:text-text-primary h-10 w-full cursor-pointer rounded-xl bg-surface-container-low px-4 text-xs font-semibold transition-colors sm:w-auto sm:text-sm"
          >
            Tutup
          </button>

          {upload === undefined ? (
            <span className="text-text-muted text-[11px]">
              Format .xlsx sesuai template Dapodik sekolah.
            </span>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm || confirmMutation.isPending || uploadMutation.isPending}
              className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-pine-deep px-5 text-xs font-bold text-white shadow-md transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
            >
              {confirmMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4 text-amber-gold" />
              )}
              <span>Konfirmasi & Simpan {job?.valid_rows ?? 0} Baris</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
