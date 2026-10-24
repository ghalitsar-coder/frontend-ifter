'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import type { ImportJob, ImportUploadResponse } from '@/lib/api/dto';
import {
  apiErrorMessage,
  downloadImportTemplate,
  mapImportPreview,
  saveBlob,
  uploadImportFile,
  useConfirmImport,
} from '@/lib/api/master-guru';
import type { TeacherImportRowView } from '@/lib/api/master-guru';

// shortcut: no backend endpoint for class (rombel) imports, keep mock preview rows
const SAMPLE_KELAS_ROWS: TeacherImportRowView[] = [
  {
    rowNumber: 1,
    nip: '-',
    name: 'Kelas VII A',
    detail: '7',
    actionLabel: 'Baru',
    validationStatus: 'valid',
    statusLabel: 'Valid',
    note: 'Contoh pratinjau — import kelas belum tersedia di API.',
  },
];

const pickRows = (
  uploadResult: ImportUploadResponse | undefined,
  isKelasMock: boolean,
): TeacherImportRowView[] => {
  if (isKelasMock) {
    return SAMPLE_KELAS_ROWS;
  }
  if (uploadResult === undefined) {
    return [];
  }
  return mapImportPreview(uploadResult.preview, uploadResult.errors);
};

const applyRowFilter = (
  rows: TeacherImportRowView[],
  filterType: 'all' | 'valid' | 'issues',
): TeacherImportRowView[] => {
  if (filterType === 'valid') {
    return rows.filter((row) => row.validationStatus === 'valid');
  }
  if (filterType === 'issues') {
    return rows.filter((row) => row.validationStatus !== 'valid');
  }
  return rows;
};

const uploadBadgeFor = (
  isPending: boolean,
  hasUpload: boolean,
): { tone: string; dot: string; text: string } => {
  if (isPending) {
    return { tone: 'bg-amber-100 text-amber-800', dot: 'bg-amber-600', text: 'Memeriksa…' };
  }
  if (hasUpload) {
    return {
      tone: 'bg-emerald-100 text-emerald-800',
      dot: 'bg-emerald-700',
      text: 'Sintaks Valid',
    };
  }
  return { tone: 'bg-stone-100 text-stone-500', dot: 'bg-stone-400', text: 'Belum Ada Berkas' };
};

const computeCanConfirm = (vars: {
  isKelasMock: boolean;
  job: ImportJob | undefined;
  allowPartialImport: boolean;
  issueCount: number;
}): boolean => {
  if (vars.isKelasMock || vars.job === undefined) {
    return false;
  }
  if (vars.job.status === 'completed' || vars.job.valid_rows <= 0) {
    return false;
  }
  return vars.allowPartialImport || vars.issueCount === 0;
};

const stepBadgeClass = (done: boolean, active: boolean): string => {
  if (done) {
    return 'bg-emerald-800 text-white ring-2 ring-emerald-100';
  }
  if (active) {
    return 'animate-pulse bg-amber-100 text-amber-900 ring-2 ring-amber-200';
  }
  return 'bg-stone-200 text-stone-500';
};

const step3BadgeClass = (syncing: boolean): string =>
  syncing ? 'bg-emerald-800 text-white' : 'bg-stone-200 text-stone-500';

const stepLabelClass = (done: boolean, active: boolean, idleClass: string): string => {
  if (done) {
    return 'font-semibold text-emerald-900';
  }
  if (active) {
    return 'font-bold text-stone-900';
  }
  return idleClass;
};

const step1BadgeContent = (done: boolean) => {
  if (!done) {
    return '1';
  }
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
};

const entityTabClass = (active: boolean): string =>
  `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
    active
      ? 'bg-emerald-900 text-white shadow-xs'
      : 'bg-stone-100 text-stone-600 hover:text-stone-900'
  }`;

const strategyCardClass = (active: boolean): string =>
  `flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all ${
    active
      ? 'border-emerald-700 bg-emerald-50/50 shadow-xs'
      : 'border-stone-200 bg-white hover:bg-stone-50'
  }`;

const fileTitleLabel = (file: File | null): string => file?.name ?? 'Belum ada berkas dipilih';

const fileNameLabel = (file: File | null): string =>
  file?.name ?? 'Pilih berkas .xlsx terlebih dahulu';

const fileSizeLabel = (file: File | null): string =>
  file === null ? '—' : `${(file.size / 1024 / 1024).toFixed(2)} MB`;

const filePickLabel = (file: File | null): string => (file === null ? 'Pilih File' : 'Ganti File');

const bannerTextFor = (feedback: string | null, uploadError: Error | null): string | null => {
  if (feedback !== null) {
    return feedback;
  }
  if (uploadError !== null) {
    return apiErrorMessage(uploadError, 'Gagal mengunggah berkas.');
  }
  return null;
};

const kpiSubtitle = (hasUpload: boolean, jobId: string | undefined): string => {
  if (hasUpload) {
    return `Job #${(jobId ?? '').slice(0, 8)} • format NIP, duplikasi, dan kelengkapan diverifikasi server.`;
  }
  return 'Format NIP 18 digit, duplikasi, dan mapel terdaftar (diperiksa server setelah unggah).';
};

const filterPillClass = (active: boolean): string =>
  active
    ? 'bg-emerald-900 text-white'
    : 'border border-stone-200 bg-white text-stone-600 hover:text-stone-900';

const issuesPillClass = (active: boolean): string =>
  active
    ? 'bg-amber-600 text-white'
    : 'border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100';

const emptyRowText = (isPending: boolean): string =>
  isPending
    ? 'Server sedang memvalidasi baris Excel…'
    : 'Unggah berkas .xlsx untuk melihat pratinjau validasi server.';

const rowToneClass = (status: TeacherImportRowView['validationStatus']): string => {
  if (status === 'error') {
    return 'bg-red-50/60 hover:bg-red-50';
  }
  if (status === 'warning') {
    return 'bg-amber-50/50 hover:bg-amber-50';
  }
  return 'hover:bg-stone-50/80';
};

const partialToleranceLabel = (on: boolean): string => (on ? 'aktif' : 'mati');

const confirmButtonContent = (isPending: boolean, readyCount: number) => {
  if (isPending) {
    return (
      <>
        <svg className="h-3.5 w-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Menyimpan...
      </>
    );
  }
  return (
    <>
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      Simpan {readyCount} Guru ke Database
    </>
  );
};

const ImportPreviewRowRow = (props: { row: TeacherImportRowView }) => {
  const { row } = props;
  return (
    <tr className={`transition-colors ${rowToneClass(row.validationStatus)}`}>
      <td className="px-3 py-2.5 text-center font-mono font-semibold text-stone-500">
        #{row.rowNumber}
      </td>
      <td className="px-3 py-2.5 font-mono font-medium text-stone-800">
        {row.nip === '' ? (
          <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
            [KOSONG]
          </span>
        ) : (
          row.nip
        )}
      </td>
      <td className="px-3 py-2.5 font-semibold text-stone-900">{row.name}</td>
      <td className="px-3 py-2.5 text-stone-700">{row.actionLabel}</td>
      <td className="px-3 py-2.5 text-center">
        <span className="inline-block rounded bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-700">
          {row.statusLabel}
        </span>
      </td>
      <td className="px-3 py-2.5 text-center">
        {row.validationStatus === 'valid' && (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Valid
          </span>
        )}
        {row.validationStatus === 'warning' && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Duplikat
          </span>
        )}
        {row.validationStatus === 'error' && (
          <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Error
          </span>
        )}
      </td>
      <td
        className={`px-3 py-2.5 text-[11px] ${
          row.validationStatus === 'error' ? 'font-medium text-red-700' : 'text-stone-600'
        }`}
      >
        {row.note}
      </td>
    </tr>
  );
};

/**
 * Excel Bulk Import & Validation Modal (FR-G01, FR-G02, FR-G03, FR-G07).
 * Uploads the workbook to POST /imports/{entity}, shows the real server-side
 * preview + row errors, then syncs via POST /imports/:id/confirm.
 * @param props - Modal control props.
 * @param props.isOpen - Whether the modal is rendered.
 * @param props.onClose - Requested close handler.
 * @param props.onImportSuccess - Callback with the confirmed row count.
 * @returns Import modal JSX element.
 */
export const MasterGuruImportModal = (props: {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (count: number) => void;
}) => {
  const [targetEntity, setTargetEntity] = useState<'guru' | 'siswa' | 'kelas'>('guru');
  const [importStrategy, setImportStrategy] = useState<'upsert' | 'create_only'>('upsert');
  const [filterType, setFilterType] = useState<'all' | 'valid' | 'issues'>('all');
  const [allowPartialImport, setAllowPartialImport] = useState<boolean>(true);
  const [file, setFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<Error | null>(null);

  const confirmImport = useConfirmImport();

  const uploadMutation = useMutation({
    mutationFn: async (vars: { entity: 'teachers' | 'students'; file: File }) =>
      await uploadImportFile(
        vars.entity,
        vars.file,
        importStrategy === 'upsert' ? 'upsert' : 'create_only',
      ),
    onSuccess: () => {
      setUploadError(null);
    },
    onError: (error) => {
      setUploadError(error);
    },
  });

  if (!props.isOpen) {
    return null;
  }

  const isKelasMock = targetEntity === 'kelas';
  const uploadResult = uploadMutation.data;
  const job = uploadResult?.job;
  const hasUpload = uploadResult !== undefined;
  const totalCount = job?.total_rows ?? 0;
  const validCount = job?.valid_rows ?? 0;
  const issueCount = (job?.invalid_rows ?? 0) + (job?.duplicate_rows ?? 0);

  const allRows: TeacherImportRowView[] = pickRows(uploadResult, isKelasMock);

  const filteredRows = applyRowFilter(allRows, filterType);

  const canConfirm = computeCanConfirm({
    isKelasMock,
    job,
    allowPartialImport,
    issueCount,
  });

  const handlePickFile = (next: File | null) => {
    uploadMutation.reset();
    setFeedback(null);
    setUploadError(null);
    if (next === null) {
      setFile(null);
      return;
    }
    if (!next.name.toLowerCase().endsWith('.xlsx')) {
      setFeedback('Berkas harus berformat Excel .xlsx.');
      return;
    }
    setFile(next);
    if (isKelasMock) {
      return;
    }
    uploadMutation.mutate({
      entity: targetEntity === 'guru' ? 'teachers' : 'students',
      file: next,
    });
  };

  const handleTemplateDownload = () => {
    if (isKelasMock) {
      setFeedback('Template kelas belum tersedia di API.');
      return;
    }
    const run = async () => {
      try {
        const { blob, filename } = await downloadImportTemplate(
          targetEntity === 'guru' ? 'teachers' : 'students',
        );
        saveBlob(blob, filename ?? 'template-import.xlsx');
      } catch (error: unknown) {
        setFeedback(apiErrorMessage(error, 'Gagal mengunduh template.'));
      }
    };
    void run();
  };

  const handleExecuteImport = () => {
    if (job === undefined) {
      return;
    }
    confirmImport.mutate(job.id, {
      onSuccess: (confirmed) => {
        props.onImportSuccess(confirmed.success_rows);
        props.onClose();
        setFile(null);
        uploadMutation.reset();
        setFeedback(null);
        setUploadError(null);
      },
      onError: (error) => {
        setFeedback(apiErrorMessage(error, 'Gagal menyinkronkan data ke database.'));
      },
    });
  };

  const step1Done = file !== null;
  const step2Active = file !== null && !confirmImport.isPending;

  const clearSelection = () => {
    setFile(null);
    uploadMutation.reset();
    setFeedback(null);
    setUploadError(null);
  };

  const badge = uploadBadgeFor(uploadMutation.isPending, hasUpload);
  const bannerText = bannerTextFor(feedback, uploadError);

  let syncStatus = 'Menunggu';
  if (isKelasMock) {
    syncStatus = 'Mock';
  } else if (hasUpload) {
    syncStatus = 'Ready';
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-6"
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is already scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={props.onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-5xl animate-in flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl duration-150 zoom-in-95 fade-in">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-stone-800 bg-stone-900 px-6 py-4.5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-600/30 text-emerald-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="import-modal-title"
                  className="text-base font-bold tracking-tight text-white sm:text-lg"
                >
                  Import & Validasi Massal Excel (.xlsx)
                </h2>
                <span className="rounded-full border border-emerald-800/60 bg-emerald-950 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  FR-G02 • FR-G07
                </span>
              </div>
              <p className="mt-0.5 text-xs text-stone-300">
                Unggah dan tinjau integritas data PTK / Guru sebelum sinkronisasi ke basis data
                sekolah.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-800 hover:text-white"
            aria-label="Tutup jendela import"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="space-y-5 overflow-y-auto bg-stone-50/60 p-6">
          {/* Step Indicator */}
          <nav aria-label="Alur Import" className="border-b border-stone-200 pb-3">
            <ol className="flex flex-wrap items-center gap-2 text-xs font-medium sm:gap-4 sm:text-sm">
              <li className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${stepBadgeClass(step1Done, false)}`}
                >
                  {step1BadgeContent(step1Done)}
                </span>
                <span className={stepLabelClass(step1Done, false, 'text-stone-500')}>
                  1. Berkas & Target
                </span>
              </li>
              <span className="text-stone-300">/</span>
              <li className="flex items-center gap-2" aria-current="step">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${stepBadgeClass(false, step2Active)}`}
                >
                  2
                </span>
                <span className={stepLabelClass(false, step2Active, 'text-stone-400')}>
                  2. Validasi Baris (Aktif)
                </span>
              </li>
              <span className="text-stone-300">/</span>
              <li className="flex items-center gap-2 text-stone-400">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${step3BadgeClass(confirmImport.isPending)}`}
                >
                  3
                </span>
                <span>3. Eksekusi Sinkronisasi</span>
              </li>
            </ol>
          </nav>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
            {/* Target Entity & Strategy */}
            <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm lg:col-span-7">
              <div>
                <span className="mb-2 block text-[11px] font-bold tracking-wider text-stone-500 uppercase">
                  Entitas Sasaran & Strategi (FR-G03)
                </span>
                <div className="mb-3 flex gap-2 border-b border-stone-200 pb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetEntity('guru');
                      clearSelection();
                    }}
                    className={entityTabClass(targetEntity === 'guru')}
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Data Guru / PTK
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetEntity('siswa');
                      clearSelection();
                    }}
                    className={entityTabClass(targetEntity === 'siswa')}
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 14l9-5-9-5-9 5 9 5z"
                      />
                    </svg>
                    Data Siswa
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetEntity('kelas');
                      clearSelection();
                    }}
                    className={entityTabClass(targetEntity === 'kelas')}
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    Data Kelas
                  </button>
                </div>

                {/* Strategy Radios */}
                <div className="space-y-2">
                  {/* oxlint-disable-next-line jsx-a11y/label-has-associated-control -- label text is rendered alongside the wrapped radio/checkbox control */}
                  <label className={strategyCardClass(importStrategy === 'upsert')}>
                    <input
                      type="radio"
                      name="strategy"
                      checked={importStrategy === 'upsert'}
                      onChange={() => {
                        setImportStrategy('upsert');
                      }}
                      className="mt-0.5 text-emerald-800 focus:ring-emerald-700"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900">
                          Upsert / Timpa Data Lama
                        </span>
                        <span className="py-0.2 rounded bg-emerald-100 px-1.5 text-[10px] font-semibold text-emerald-800">
                          Disarankan
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-stone-600">
                        Memperbarui profil dan penugasan jika NIP sudah tercatat di sistem (mode =
                        upsert).
                      </p>
                    </div>
                  </label>

                  {/* oxlint-disable-next-line jsx-a11y/label-has-associated-control -- label text is rendered alongside the wrapped radio/checkbox control */}
                  <label className={strategyCardClass(importStrategy === 'create_only')}>
                    <input
                      type="radio"
                      name="strategy"
                      checked={importStrategy === 'create_only'}
                      onChange={() => {
                        setImportStrategy('create_only');
                      }}
                      className="mt-0.5 text-emerald-800 focus:ring-emerald-700"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900">
                          Create Only (Strict)
                        </span>
                        <span className="py-0.2 rounded bg-stone-100 px-1.5 font-mono text-[10px] text-stone-600">
                          Hanya Baru
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-stone-600">
                        Menolak entri jika NIP / NUPTK telah ada untuk menghindari timpa data tidak
                        sengaja.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Attached File Card */}
            <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm lg:col-span-5">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider text-stone-500 uppercase">
                    File Excel Terunggah
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.tone}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                    {badge.text}
                  </span>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50/80 p-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-900 text-white shadow-xs">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4
                      className="truncate text-xs font-bold text-stone-900"
                      title={fileTitleLabel(file)}
                    >
                      {fileNameLabel(file)}
                    </h4>
                    <p className="mt-0.5 text-[11px] text-stone-500">{fileSizeLabel(file)}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <label className="cursor-pointer font-bold text-emerald-800 underline underline-offset-2 hover:text-emerald-950">
                        {filePickLabel(file)}
                        <input
                          type="file"
                          accept=".xlsx"
                          className="hidden"
                          onChange={(e) => {
                            handlePickFile(e.target.files?.[0] ?? null);
                          }}
                        />
                      </label>
                      <span className="text-stone-300">•</span>
                      <button
                        type="button"
                        onClick={handleTemplateDownload}
                        className="cursor-pointer font-medium text-stone-500 hover:text-stone-900"
                      >
                        Unduh Template Resmi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2 text-[11px] text-stone-500">
                <span>Skema Kemendikbudristek Dapodik</span>
                <span className="font-mono font-semibold text-emerald-800">{syncStatus}</span>
              </div>
            </div>
          </div>

          {/* Feedback banner (upload / confirm errors) */}
          {bannerText !== null && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[11px] font-semibold text-red-700">
              {bannerText}
            </div>
          )}

          {/* Validation Metrics KPI Bar */}
          <div className="flex flex-col justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
            <div className="flex items-start gap-3">
              <div className="shrink-0 rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-800">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-stone-900 sm:text-sm">
                  Ringkasan Validasi Baris Excel
                </h3>
                <p className="mt-0.5 text-[11px] text-stone-600">
                  {kpiSubtitle(hasUpload, job?.id)}
                </p>
              </div>
            </div>

            <div className="grid shrink-0 grid-cols-3 gap-2.5">
              <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-center">
                <span className="block text-[10px] font-medium text-stone-500">Total Baris</span>
                <span className="text-base font-extrabold text-stone-900 sm:text-lg">
                  {totalCount}
                </span>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center">
                <span className="block text-[10px] font-medium text-emerald-800">Baris Valid</span>
                <span className="text-base font-extrabold text-emerald-800 sm:text-lg">
                  {validCount}
                </span>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center">
                <span className="block text-[10px] font-medium text-amber-900">
                  Peringatan / Error
                </span>
                <span className="text-base font-extrabold text-red-600 sm:text-lg">
                  {issueCount}
                </span>
              </div>
            </div>
          </div>

          {/* Validation Table Section */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 bg-stone-50/70 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900">
                  Pratinjau Data Guru yang Terbaca
                </span>
                <span className="rounded bg-stone-200 px-2 py-0.5 font-mono text-[11px] text-stone-500">
                  {filteredRows.length} baris ditampilkan
                </span>
              </div>

              {/* Table Filter Pills */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('all');
                  }}
                  className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${filterPillClass(filterType === 'all')}`}
                >
                  Semua ({allRows.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('valid');
                  }}
                  className={`rounded-md px-2.5 py-1 font-medium transition-colors ${filterPillClass(filterType === 'valid')}`}
                >
                  Hanya Valid ({allRows.filter((r) => r.validationStatus === 'valid').length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('issues');
                  }}
                  className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${issuesPillClass(filterType === 'issues')}`}
                >
                  Perlu Perhatian ({allRows.filter((r) => r.validationStatus !== 'valid').length})
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-100/80 text-[10px] font-bold tracking-wider text-stone-600 uppercase">
                    <th className="w-14 px-3 py-2.5 text-center" scope="col">
                      Baris
                    </th>
                    <th className="w-40 px-3 py-2.5" scope="col">
                      NIP / NUPTK
                    </th>
                    <th className="px-3 py-2.5" scope="col">
                      Nama Guru / PTK
                    </th>
                    <th className="px-3 py-2.5" scope="col">
                      Aksi Server
                    </th>
                    <th className="w-24 px-3 py-2.5 text-center" scope="col">
                      Status
                    </th>
                    <th className="w-32 px-3 py-2.5 text-center" scope="col">
                      Validasi
                    </th>
                    <th className="px-3 py-2.5" scope="col">
                      Keterangan / Solusi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center text-[11px] text-stone-500">
                        {emptyRowText(uploadMutation.isPending)}
                      </td>
                    </tr>
                  )}
                  {filteredRows.map((row) => (
                    <ImportPreviewRowRow key={row.rowNumber} row={row} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-4 py-2.5 text-[11px] text-stone-500">
              <span>
                Menampilkan {filteredRows.length} dari {totalCount} baris total pada file Excel
              </span>
              <span className="font-semibold text-emerald-800">
                Toleransi error parsial {partialToleranceLabel(allowPartialImport)} (FR-G07)
              </span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="flex flex-col justify-between gap-3 border-t border-stone-200 bg-white px-6 py-4 sm:flex-row sm:items-center">
          {/* FR-G07 Checkbox */}
          {/* oxlint-disable-next-line jsx-a11y/label-has-associated-control -- label text is rendered alongside the wrapped radio/checkbox control */}
          <label className="flex cursor-pointer items-start gap-2.5 select-none">
            <input
              type="checkbox"
              checked={allowPartialImport}
              onChange={(e) => {
                setAllowPartialImport(e.target.checked);
              }}
              className="mt-0.5 rounded border-stone-300 text-emerald-800 focus:ring-emerald-700"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-stone-900">
                  Lewati {issueCount} baris error dan tetap import {validCount} baris valid
                </span>
                <span className="py-0.2 rounded bg-emerald-100 px-1.5 font-mono text-[10px] font-bold text-emerald-800">
                  FR-G07
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Baris error akan dicatat dalam berkas log untuk diperbaiki terpisah.
              </p>
            </div>
          </label>

          {/* Action Buttons */}
          <div className="flex shrink-0 items-center justify-end gap-2">
            <button
              type="button"
              onClick={props.onClose}
              disabled={confirmImport.isPending}
              className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100"
            >
              Batalkan & Tutup
            </button>
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={!canConfirm || confirmImport.isPending || uploadMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-900 px-5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-950 disabled:opacity-50"
            >
              {confirmButtonContent(confirmImport.isPending, validCount)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
