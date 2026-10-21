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

  const validCount = SAMPLE_GURU_ROWS.filter(r => r.validationStatus === 'valid').length;
  const issueCount = SAMPLE_GURU_ROWS.filter(r => r.validationStatus !== 'valid').length;
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
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
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="px-6 py-4.5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="import-modal-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Import & Validasi Massal Excel (.xlsx)
                </h2>
                <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  FR-G02 • FR-G07
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Unggah dan tinjau integritas data PTK / Guru sebelum sinkronisasi ke basis data sekolah.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            className="w-8 h-8 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 flex items-center justify-center transition-colors"
            aria-label="Tutup jendela import"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 bg-stone-50/60">
          {/* Step Indicator */}
          <nav aria-label="Alur Import" className="border-b border-stone-200 pb-3">
            <ol className="flex items-center flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm font-medium">
              <li className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-800 text-white text-xs font-bold ring-2 ring-emerald-100">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-emerald-900 font-semibold">1. Berkas & Target</span>
              </li>
              <span className="text-stone-300">/</span>
              <li className="flex items-center gap-2" aria-current="step">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-900 text-xs font-bold ring-2 ring-amber-200 animate-pulse">
                  2
                </span>
                <span className="text-stone-900 font-bold">2. Validasi Baris (Aktif)</span>
              </li>
              <span className="text-stone-300">/</span>
              <li className="flex items-center gap-2 text-stone-400">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-stone-200 text-stone-500 text-xs font-bold">
                  3
                </span>
                <span>3. Eksekusi Sinkronisasi</span>
              </li>
            </ol>
          </nav>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Target Entity & Strategy */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
                  Entitas Sasaran & Strategi (FR-G03)
                </span>
                <div className="flex gap-2 border-b border-stone-200 pb-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setTargetEntity('guru')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      targetEntity === 'guru'
                        ? 'bg-emerald-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Data Guru / PTK
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetEntity('siswa')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      targetEntity === 'siswa'
                        ? 'bg-emerald-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    </svg>
                    Data Siswa
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetEntity('kelas')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      targetEntity === 'kelas'
                        ? 'bg-emerald-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Data Kelas
                  </button>
                </div>

                {/* Strategy Radios */}
                <div className="space-y-2">
                  <label
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                      importStrategy === 'upsert'
                        ? 'border-emerald-700 bg-emerald-50/50 shadow-xs'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="strategy"
                      checked={importStrategy === 'upsert'}
                      onChange={() => setImportStrategy('upsert')}
                      className="mt-0.5 text-emerald-800 focus:ring-emerald-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900">
                          Upsert / Timpa Data Lama
                        </span>
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                          Disarankan
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        Memperbarui profil, mapel, dan penugasan wali kelas jika NIP sudah tercatat di sistem.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                      importStrategy === 'create_only'
                        ? 'border-emerald-700 bg-emerald-50/50 shadow-xs'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="strategy"
                      checked={importStrategy === 'create_only'}
                      onChange={() => setImportStrategy('create_only')}
                      className="mt-0.5 text-emerald-800 focus:ring-emerald-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900">
                          Create Only (Strict)
                        </span>
                        <span className="text-[10px] font-mono bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded">
                          Hanya Baru
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        Menolak entri jika NIP / NUPTK telah ada untuk menghindari timpa data tidak sengaja.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Attached File Card */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    File Excel Terunggah
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>
                    Sintaks Valid
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/80 flex items-start gap-3">
                  <div className="w-11 h-11 rounded-lg bg-emerald-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-stone-900 truncate" title="Template_Data_Guru_PTK_2024_2025.xlsx">
                      Template_Data_Guru_PTK_2024_2025.xlsx
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      1.4 MB • Sheet: &quot;DATA_GURU_AKTIF&quot;
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        className="text-emerald-800 hover:text-emerald-950 font-bold underline underline-offset-2"
                      >
                        Ganti File
                      </button>
                      <span className="text-stone-300">•</span>
                      <a
                        href="#template"
                        className="text-stone-500 hover:text-stone-900 font-medium"
                      >
                        Unduh Template Resmi
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between">
                <span>Skema Kemendikbudristek Dapodik</span>
                <span className="font-mono text-emerald-800 font-semibold">Ready</span>
              </div>
            </div>
          </div>

          {/* Validation Metrics KPI Bar */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900">
                  Ringkasan Validasi Baris Excel
                </h3>
                <p className="text-[11px] text-stone-600 mt-0.5">
                  Parsed in 0.38s • Format NIP 18 digit, duplikasi, dan mapel terdaftar.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 shrink-0">
              <div className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-center">
                <span className="text-[10px] font-medium text-stone-500 block">Total Baris</span>
                <span className="text-base sm:text-lg font-extrabold text-stone-900">{totalCount}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-center">
                <span className="text-[10px] font-medium text-emerald-800 block">Baris Valid</span>
                <span className="text-base sm:text-lg font-extrabold text-emerald-800">34</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center">
                <span className="text-[10px] font-medium text-amber-900 block">Peringatan / Error</span>
                <span className="text-base sm:text-lg font-extrabold text-red-600">{issueCount}</span>
              </div>
            </div>
          </div>

          {/* Validation Table Section */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 bg-stone-50/70">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900">
                  Pratinjau Data Guru yang Terbaca
                </span>
                <span className="text-[11px] text-stone-500 bg-stone-200 px-2 py-0.5 rounded font-mono">
                  {filteredRows.length} sampel ditampilkan
                </span>
              </div>

              {/* Table Filter Pills */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    filterType === 'all'
                      ? 'bg-emerald-900 text-white'
                      : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Semua ({SAMPLE_GURU_ROWS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('valid')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    filterType === 'valid'
                      ? 'bg-emerald-900 text-white'
                      : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Hanya Valid ({validCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('issues')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    filterType === 'issues'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  Perlu Perhatian ({issueCount})
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3 text-center w-14" scope="col">Baris</th>
                    <th className="py-2.5 px-3 w-40" scope="col">NIP / NUPTK</th>
                    <th className="py-2.5 px-3" scope="col">Nama Guru / PTK</th>
                    <th className="py-2.5 px-3" scope="col">Mata Pelajaran</th>
                    <th className="py-2.5 px-3 text-center w-24" scope="col">Status</th>
                    <th className="py-2.5 px-3 text-center w-32" scope="col">Validasi</th>
                    <th className="py-2.5 px-3" scope="col">Keterangan / Solusi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {filteredRows.map((row) => (
                    <tr
                      key={row.rowNumber}
                      className={`transition-colors ${
                        row.validationStatus === 'error'
                          ? 'bg-red-50/60 hover:bg-red-50'
                          : row.validationStatus === 'warning'
                            ? 'bg-amber-50/50 hover:bg-amber-50'
                            : 'hover:bg-stone-50/80'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-mono font-semibold text-stone-500">
                        #{row.rowNumber}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-stone-800">
                        {row.nip || (
                          <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            [KOSONG]
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-stone-900">
                        {row.name}
                      </td>
                      <td className="py-2.5 px-3 text-stone-700">
                        {row.subject}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-medium">
                          {row.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {row.validationStatus === 'valid' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                            Valid
                          </span>
                        )}
                        {row.validationStatus === 'warning' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Duplikat
                          </span>
                        )}
                        {row.validationStatus === 'error' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-300">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Error
                          </span>
                        )}
                      </td>
                      <td className={`py-2.5 px-3 text-[11px] ${
                        row.validationStatus === 'error' ? 'text-red-700 font-medium' : 'text-stone-600'
                      }`}>
                        {row.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
              <span>Menampilkan {filteredRows.length} dari 36 baris total pada file Excel</span>
              <span className="text-emerald-800 font-semibold">Toleransi error parsial aktif (FR-G07)</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* FR-G07 Checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allowPartialImport}
              onChange={(e) => setAllowPartialImport(e.target.checked)}
              className="mt-0.5 rounded border-stone-300 text-emerald-800 focus:ring-emerald-700"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-stone-900">
                  Lewati 2 baris error dan tetap import {readyToImportCount} baris valid
                </span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                  FR-G07
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Baris error akan dicatat dalam berkas log untuk diperbaiki terpisah.
              </p>
            </div>
          </label>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 justify-end shrink-0">
            <button
              type="button"
              onClick={props.onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition-colors"
            >
              Batalkan & Tutup
            </button>
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={isSubmitting || readyToImportCount === 0}
              className="px-5 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-bold shadow-sm transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
