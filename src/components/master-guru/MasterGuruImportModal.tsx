'use client';

import { useState } from 'react';

/**
 * Import validation sample row item.
 */
type ValidationPreviewRow = {
  rowNumber: number;
  nip: string;
  name: string;
  subject: string;
  status: string;
  homeroom: string;
  validationStatus: 'valid' | 'warning' | 'error';
  statusLabel: string;
  note: string;
};

const SAMPLE_GURU_ROWS: ValidationPreviewRow[] = [
  {
    rowNumber: 1,
    nip: '19680512 199303 1 004',
    name: 'Drs. Agus Subagyo, M.Pd.',
    subject: 'Matematika Peminatan',
    status: 'PNS',
    homeroom: 'XII MIPA 1',
    validationStatus: 'valid',
    statusLabel: 'Valid',
    note: 'Data lengkap, NIP terverifikasi unik dan valid di Dapodik.',
  },
  {
    rowNumber: 2,
    nip: '19850315 200902 2 008',
    name: 'Sarah Rahma, S.Pd.',
    subject: 'Bahasa Indonesia',
    status: 'PPPK',
    homeroom: 'XI IPS 1',
    validationStatus: 'valid',
    statusLabel: 'Valid',
    note: 'Format NIP dan NUPTK sesuai spesifikasi.',
  },
  {
    rowNumber: 3,
    nip: '19791104 200501 1 003',
    name: 'Hendra Gunawan, S.Si.',
    subject: 'Fisika Terapan',
    status: 'PNS',
    homeroom: 'XI MIPA 2',
    validationStatus: 'warning',
    statusLabel: 'Duplikat NIP',
    note: 'NIP sudah ada di database. Mode Upsert akan otomatis memperbarui penugasan mengajar.',
  },
  {
    rowNumber: 4,
    nip: '',
    name: 'Siti Fatimah, S.Pd.',
    subject: 'Biologi',
    status: 'Guru Honorer',
    homeroom: '-',
    validationStatus: 'error',
    statusLabel: 'NIP / NUPTK Kosong',
    note: 'Kolom NIP / NUPTK tidak boleh kosong. Guru membutuhkan identifier unik primer.',
  },
  {
    rowNumber: 5,
    nip: '19650220 199003 1 002',
    name: 'Drs. Bambang Sutrisno',
    subject: 'Kimia Analitik',
    status: 'PNS',
    homeroom: '-',
    validationStatus: 'valid',
    statusLabel: 'Valid',
    note: 'Data lengkap dan siap diintegrasikan ke master data.',
  },
  {
    rowNumber: 6,
    nip: '19800101 2008',
    name: 'Joko Susilo, S.Pd.',
    subject: 'Sejarah Indonesia',
    status: 'PNS',
    homeroom: '-',
    validationStatus: 'error',
    statusLabel: 'Format NIP Salah',
    note: 'Format NIP tidak valid (hanya 12 digit, standar BKN 18 digit angka).',
  },
];

/**
 * Excel Bulk Import & Row Validation Modal (FR-G01, FR-G02, FR-G03, FR-G07).
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!props.isOpen) {
    return null;
  }

  const validCount = SAMPLE_GURU_ROWS.filter((r) => r.validationStatus === 'valid').length;
  const issueCount = SAMPLE_GURU_ROWS.filter((r) => r.validationStatus !== 'valid').length;
  const totalCount = 36; // Full sheet count representation
  const readyToImportCount = allowPartialImport ? 34 : 0;

  const filteredRows = SAMPLE_GURU_ROWS.filter((row) => {
    if (filterType === 'valid') {
      return row.validationStatus === 'valid';
    }
    if (filterType === 'issues') {
      return row.validationStatus !== 'valid';
    }
    return true;
  });

  const handleExecuteImport = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      props.onImportSuccess(readyToImportCount);
      props.onClose();
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-6"
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
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-800 text-xs font-bold text-white ring-2 ring-emerald-100">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <span className="font-semibold text-emerald-900">1. Berkas & Target</span>
              </li>
              <span className="text-stone-300">/</span>
              <li className="flex items-center gap-2" aria-current="step">
                <span className="flex h-6 w-6 animate-pulse items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-900 ring-2 ring-amber-200">
                  2
                </span>
                <span className="font-bold text-stone-900">2. Validasi Baris (Aktif)</span>
              </li>
              <span className="text-stone-300">/</span>
              <li className="flex items-center gap-2 text-stone-400">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-200 text-xs font-bold text-stone-500">
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
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      targetEntity === 'guru'
                        ? 'bg-emerald-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                    }`}
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
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      targetEntity === 'siswa'
                        ? 'bg-emerald-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                    }`}
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
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      targetEntity === 'kelas'
                        ? 'bg-emerald-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                    }`}
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
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all ${
                      importStrategy === 'upsert'
                        ? 'border-emerald-700 bg-emerald-50/50 shadow-xs'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
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
                        Memperbarui profil, mapel, dan penugasan wali kelas jika NIP sudah tercatat
                        di sistem.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all ${
                      importStrategy === 'create_only'
                        ? 'border-emerald-700 bg-emerald-50/50 shadow-xs'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
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
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-700" />
                    Sintaks Valid
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
                      title="Template_Data_Guru_PTK_2024_2025.xlsx"
                    >
                      Template_Data_Guru_PTK_2024_2025.xlsx
                    </h4>
                    <p className="mt-0.5 text-[11px] text-stone-500">
                      1.4 MB • Sheet: &quot;DATA_GURU_AKTIF&quot;
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        className="font-bold text-emerald-800 underline underline-offset-2 hover:text-emerald-950"
                      >
                        Ganti File
                      </button>
                      <span className="text-stone-300">•</span>
                      <a
                        href="#template"
                        className="font-medium text-stone-500 hover:text-stone-900"
                      >
                        Unduh Template Resmi
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2 text-[11px] text-stone-500">
                <span>Skema Kemendikbudristek Dapodik</span>
                <span className="font-mono font-semibold text-emerald-800">Ready</span>
              </div>
            </div>
          </div>

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
                  Parsed in 0.38s • Format NIP 18 digit, duplikasi, dan mapel terdaftar.
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
                <span className="text-base font-extrabold text-emerald-800 sm:text-lg">34</span>
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
                  {filteredRows.length} sampel ditampilkan
                </span>
              </div>

              {/* Table Filter Pills */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('all');
                  }}
                  className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                    filterType === 'all'
                      ? 'bg-emerald-900 text-white'
                      : 'border border-stone-200 bg-white text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Semua ({SAMPLE_GURU_ROWS.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('valid');
                  }}
                  className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                    filterType === 'valid'
                      ? 'bg-emerald-900 text-white'
                      : 'border border-stone-200 bg-white text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Hanya Valid ({validCount})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('issues');
                  }}
                  className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                    filterType === 'issues'
                      ? 'bg-amber-600 text-white'
                      : 'border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  Perlu Perhatian ({issueCount})
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
                      Mata Pelajaran
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
                  {filteredRows.map((row) => (
                    <tr
                      key={row.rowNumber}
                      className={`transition-colors ${
                        row.validationStatus === 'error'
                          ? 'bg-red-50/60 hover:bg-red-50'
                          : (row.validationStatus === 'warning'
                            ? 'bg-amber-50/50 hover:bg-amber-50'
                            : 'hover:bg-stone-50/80')
                      }`}
                    >
                      <td className="px-3 py-2.5 text-center font-mono font-semibold text-stone-500">
                        #{row.rowNumber}
                      </td>
                      <td className="px-3 py-2.5 font-mono font-medium text-stone-800">
                        {row.nip || (
                          <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                            [KOSONG]
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-stone-900">{row.name}</td>
                      <td className="px-3 py-2.5 text-stone-700">{row.subject}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="inline-block rounded bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-700">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {row.validationStatus === 'valid' && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
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
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
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
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
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
                          row.validationStatus === 'error'
                            ? 'font-medium text-red-700'
                            : 'text-stone-600'
                        }`}
                      >
                        {row.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-4 py-2.5 text-[11px] text-stone-500">
              <span>Menampilkan {filteredRows.length} dari 36 baris total pada file Excel</span>
              <span className="font-semibold text-emerald-800">
                Toleransi error parsial aktif (FR-G07)
              </span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="flex flex-col justify-between gap-3 border-t border-stone-200 bg-white px-6 py-4 sm:flex-row sm:items-center">
          {/* FR-G07 Checkbox */}
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
                  Lewati 2 baris error dan tetap import {readyToImportCount} baris valid
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
              disabled={isSubmitting}
              className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100"
            >
              Batalkan & Tutup
            </button>
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={isSubmitting || readyToImportCount === 0}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-900 px-5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-950 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="h-3.5 w-3.5 animate-spin text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
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
              ) : (
                <>
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Simpan {readyToImportCount} Guru ke Database
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
