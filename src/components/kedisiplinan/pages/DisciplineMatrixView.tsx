'use client';

import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Eye,
  FileSpreadsheet,
  Printer,
  Table2,
  TrendingDown,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from '@/libs/I18nNavigation';
import { fetchSchoolStudents, fetchStudentViolations } from '@/services/disciplineApi';
import type { SchoolStudentRecord, StudentViolationRecord } from '@/services/disciplineApi';
import { getClasses } from '@/services/presensiApi';
import type { ClassRecord } from '@/services/presensiApi';

type ClassMatrixRow = {
  classId: number;
  className: string;
  waliKelas: string;
  studentCount: number;
  atributCount: number;
  kerapihanCount: number;
  perilakuCount: number;
  lainnyaCount: number;
  totalIncidents: number;
  totalPoints: number;
  complianceRate: number;
};

function getStudentStatusLabel(points: number): string {
  if (points >= 100) return 'SP3';
  if (points >= 75) return 'SP2';
  if (points >= 50) return 'SP1';
  if (points >= 30) return 'Panggilan Ortu';
  if (points >= 15) return 'Pembinaan Wali';
  if (points > 0) return 'Catatan Ringan';
  return 'Tertib (Aman)';
}

/**
 * Dynamic per-class Discipline Matrix with clickable per-class student breakdown
 * and clean data-only printing for either the full matrix or a single class.
 *
 * @returns Rendered discipline matrix report page.
 */
export function DisciplineMatrixView() {
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [students, setStudents] = useState<SchoolStudentRecord[]>([]);
  const [violations, setViolations] = useState<StudentViolationRecord[]>([]);
  const [selectedTingkat, setSelectedTingkat] = useState<string>('all');
  const [selectedClassRow, setSelectedClassRow] = useState<ClassMatrixRow | null>(null);
  const [printScope, setPrintScope] = useState<'matrix' | 'class'>('matrix');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  useEffect(() => {
    async function loadAll() {
      try {
        const [cls, stus, vios] = await Promise.all([
          getClasses(),
          fetchSchoolStudents(),
          fetchStudentViolations(),
        ]);
        setClasses(cls);
        setStudents(stus);
        setViolations(vios);
      } catch {
        // Keep empty fallback if offline.
      }
    }
    void loadAll();
  }, []);

  const filteredClasses = classes.filter((c) => {
    if (selectedTingkat === 'all') {
      return true;
    }
    return String(c.tingkat) === selectedTingkat;
  });

  const rows: ClassMatrixRow[] = filteredClasses.map((cls) => {
    const classStudents = students.filter((s) => s.nama_kelas === cls.nama_kelas);
    const classViolations = violations.filter((v) => v.nama_kelas === cls.nama_kelas);
    const atributCount = classViolations.filter((v) => v.violation_category === 'atribut').length;
    const kerapihanCount = classViolations.filter((v) => v.violation_category === 'kerapihan').length;
    const perilakuCount = classViolations.filter((v) => v.violation_category === 'perilaku').length;
    const lainnyaCount = classViolations.filter((v) => v.violation_category === 'lainnya').length;
    const totalPoints = classViolations.reduce((sum, v) => sum + v.poin, 0);

    const studentsWithViolations = new Set(classViolations.map((v) => v.student_id)).size;
    const studentCount = classStudents.length;
    const complianceRate =
      studentCount > 0
        ? Math.max(0, Math.round(((studentCount - studentsWithViolations) / studentCount) * 1000) / 10)
        : 100;

    return {
      classId: cls.id,
      className: cls.nama_kelas,
      waliKelas: cls.wali_kelas ?? 'Wali Kelas',
      studentCount,
      atributCount,
      kerapihanCount,
      perilakuCount,
      lainnyaCount,
      totalIncidents: classViolations.length,
      totalPoints,
      complianceRate,
    };
  });

  const triggerPrint = (scope: 'matrix' | 'class') => {
    setPrintScope(scope);
    setTimeout(() => {
      window.print();
    }, 80);
  };

  const handleExportCsv = () => {
    const headers =
      'Kelas,Wali Kelas,Jumlah Siswa,Atribut,Kerapihan,Perilaku,Lainnya,Total Insiden,Total Poin,Kepatuhan (%)\n';
    const body = rows
      .map(
        (r) =>
          `"${r.className}","${r.waliKelas}",${r.studentCount},${r.atributCount},${r.kerapihanCount},${r.perilakuCount},${r.lainnyaCount},${r.totalIncidents},${r.totalPoints},${r.complianceRate}`,
      )
      .join('\n');
    const blob = new Blob([headers + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Matriks_Kedisiplinan_SD_Islam_Bakti_Asih_${Date.now()}.csv`);
    document.body.append(link);
    link.click();
    link.remove();
    showToast('Matriks kedisiplinan SD Islam Bakti Asih berhasil diekspor (.csv).');
  };

  const handleExportClassCsv = (row: ClassMatrixRow) => {
    const classStudents = students.filter((s) => s.nama_kelas === row.className);
    const headers = 'No,NIS,Nama Siswa,L/P,Jumlah Catatan,Total Poin,Status,Rincian Kode\n';
    const body = classStudents
      .map((s, idx) => {
        const sVios = violations.filter((v) => v.student_id === s.id);
        const pts = sVios.reduce((acc, v) => acc + v.poin, 0);
        const codes = sVios.map((v) => `${v.violation_code}(+${v.poin})`).join('; ');
        return `${idx + 1},"${s.nis ?? '-'}","${s.nama}","${s.jenis_kelamin}",${sVios.length},${pts},"${getStudentStatusLabel(pts)}","${codes || '-'}"`;
      })
      .join('\n');
    const blob = new Blob([headers + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Kedisiplinan_Kelas_${row.className}_${Date.now()}.csv`);
    document.body.append(link);
    link.click();
    link.remove();
    showToast(`Data siswa Kelas ${row.className} berhasil diekspor (.csv).`);
  };

  const totalStudents = rows.reduce((s, r) => s + r.studentCount, 0);
  const totalIncidents = rows.reduce((s, r) => s + r.totalIncidents, 0);
  const totalPoints = rows.reduce((s, r) => s + r.totalPoints, 0);
  const avgCompliance =
    rows.length > 0
      ? (rows.reduce((s, r) => s + r.complianceRate, 0) / rows.length).toFixed(1)
      : '100.0';

  const selectedClassStudents = selectedClassRow
    ? students.filter((s) => s.nama_kelas === selectedClassRow.className)
    : [];

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex animate-in items-center gap-2 rounded-xl bg-pine-deep px-4 py-3 text-sm font-semibold text-white shadow-xl duration-200 slide-in-from-top-4 print:hidden">
          <CheckCircle2 className="size-4.5 text-amber-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Matrix View (hidden when printing a specific class detail) */}
      <div className={printScope === 'class' ? 'space-y-6 print:hidden' : 'space-y-6'}>
        {/* Header (not printed) */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/kedisiplinan"
              className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="size-4.5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Link href="/dashboard/kedisiplinan" className="hover:text-pine-deep">
                  Tata Tertib Kesiswaan
                </Link>
                <span>/</span>
                <span>Matriks & Laporan Kelas</span>
              </div>
              <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                Matriks Kedisiplinan & Laporan Kelas SD Islam Bakti Asih
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                triggerPrint('matrix');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted"
            >
              <Printer className="size-3.5 text-pine-deep" />
              <span>Cetak Rekap Kelas</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-pine-hover"
            >
              <FileSpreadsheet className="size-3.5 text-amber-gold" />
              <span>Ekspor CSV / Excel</span>
              <Download className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Summary Cards (hidden on print so only clean table data prints) */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 print:hidden">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <span className="text-xs font-medium text-muted-foreground">Total Kelas & Siswa</span>
            <p className="mt-1 text-2xl font-black text-foreground">
              {rows.length} Kelas ({totalStudents} Siswa)
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-xs">
            <span className="text-xs font-medium text-emerald-900">Rata-Rata Kepatuhan</span>
            <p className="mt-1 text-2xl font-black text-emerald-900">{avgCompliance}%</p>
          </div>
          <div className="rounded-2xl border border-amber-gold/40 bg-amber-surface/40 p-5 shadow-xs">
            <span className="text-xs font-medium text-amber-900">Total Catatan Insiden</span>
            <p className="mt-1 text-2xl font-black text-amber-dark">{totalIncidents} Insiden</p>
          </div>
          <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5 shadow-xs">
            <span className="text-xs font-medium text-red-900">Akumulasi Poin Sekolah</span>
            <p className="mt-1 text-2xl font-black text-red-700">{totalPoints} Poin</p>
          </div>
        </div>

        {/* Grade Level Filter (hidden on print) */}
        <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'Semua Tingkat (1–6)' },
              { id: '1', label: 'Kelas 1' },
              { id: '2', label: 'Kelas 2' },
              { id: '3', label: 'Kelas 3' },
              { id: '4', label: 'Kelas 4' },
              { id: '5', label: 'Kelas 5' },
              { id: '6', label: 'Kelas 6' },
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setSelectedTingkat(g.id);
                }}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  selectedTingkat === g.id
                    ? 'bg-pine-deep text-white'
                    : 'border border-border bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            Klik baris kelas untuk melihat daftar seluruh siswa & mencetak per kelas.
          </span>
        </div>

        {/* Clean Data-Only Print Header (only visible on print) */}
        <div className="hidden border-b-2 border-slate-800 pb-3 text-center print:block">
          <p className="text-xs font-bold tracking-wider uppercase">
            SD ISLAM BAKTI ASIH • BAGIAN KESISWAAN & TATA TERTIB
          </p>
          <h2 className="text-lg font-black uppercase">
            REKAPITULASI MATRIKS KEDISIPLINAN PER KELAS
          </h2>
          <p className="text-xs text-slate-600">
            Total: {rows.length} Kelas ({totalStudents} Siswa) • Total Insiden: {totalIncidents} • Total Poin: {totalPoints}
          </p>
        </div>

        {/* Matrix Table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs print:rounded-none print:border-slate-300 print:shadow-none">
          <div className="flex items-center justify-between border-b border-border bg-surface-container-low px-6 py-4 print:hidden">
            <div className="flex items-center gap-2">
              <Table2 className="size-4 text-pine-deep" />
              <h2 className="text-sm font-bold text-foreground">
                Rekapitulasi Kedisiplinan Per Kelas
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingDown className="size-3.5 text-pine-deep" />
              Terhubung real-time dengan database
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-container-low text-[11px] font-bold text-muted-foreground uppercase print:bg-slate-100 print:text-slate-900">
                  <th className="px-6 py-3.5">Kelas & Wali Kelas</th>
                  <th className="px-4 py-3.5 text-center">Siswa</th>
                  <th className="px-4 py-3.5 text-center">Atribut</th>
                  <th className="px-4 py-3.5 text-center">Kerapihan</th>
                  <th className="px-4 py-3.5 text-center">Perilaku</th>
                  <th className="px-4 py-3.5 text-center">Total Insiden</th>
                  <th className="px-4 py-3.5 text-center">Akumulasi Poin</th>
                  <th className="px-4 py-3.5 text-right">Kepatuhan</th>
                  <th className="px-6 py-3.5 text-center print:hidden">Detail Kelas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr
                    key={r.className}
                    onClick={() => {
                      setSelectedClassRow(r);
                    }}
                    className="cursor-pointer transition-colors hover:bg-pine-light/40"
                  >
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-foreground">Kelas {r.className}</div>
                      <div className="text-[11px] text-muted-foreground">{r.waliKelas}</div>
                    </td>
                    <td className="px-4 py-3.5 text-center font-semibold">{r.studentCount}</td>
                    <td className="px-4 py-3.5 text-center">{r.atributCount}</td>
                    <td className="px-4 py-3.5 text-center">{r.kerapihanCount}</td>
                    <td className="px-4 py-3.5 text-center">{r.perilakuCount}</td>
                    <td className="px-4 py-3.5 text-center font-bold">{r.totalIncidents}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`rounded-md px-2 py-0.5 font-bold ${
                          r.totalPoints >= 30
                            ? 'bg-red-100 text-red-700'
                            : r.totalPoints > 0
                              ? 'bg-amber-surface text-amber-dark'
                              : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {r.totalPoints} Poin
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-pine-deep">
                      {r.complianceRate}%
                    </td>
                    <td className="px-6 py-3.5 text-center print:hidden">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClassRow(r);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-pine-deep hover:bg-muted"
                      >
                        <Eye className="size-3.5" />
                        <span>Lihat Siswa</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-muted-foreground">
                      Belum ada data kelas terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Per-Class Student List Modal & Dedicated Print View */}
      {selectedClassRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs print:static print:block print:bg-white print:p-0">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl print:max-h-none print:max-w-none print:rounded-none print:border-0 print:shadow-none">
            {/* Screen Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-container-low px-6 py-4 print:hidden">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-pine-deep text-amber-gold">
                  <Users className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Daftar Seluruh Siswa — Kelas {selectedClassRow.className}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Wali Kelas: {selectedClassRow.waliKelas} • {selectedClassStudents.length} Siswa • Kepatuhan {selectedClassRow.complianceRate}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleExportClassCsv(selectedClassRow);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  <Download className="size-3.5 text-pine-deep" />
                  <span>Ekspor CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerPrint('class');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-pine-deep px-3.5 py-1.5 text-xs font-bold text-white hover:bg-pine-hover"
                >
                  <Printer className="size-3.5 text-amber-gold" />
                  <span>Cetak Kelas {selectedClassRow.className}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClassRow(null);
                    setPrintScope('matrix');
                  }}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                  aria-label="Tutup detail kelas"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Print-Only Header for Per-Class Student Data */}
            <div className="hidden border-b-2 border-slate-800 pb-3 text-center print:block">
              <p className="text-xs font-bold tracking-wider uppercase">
                SD ISLAM BAKTI ASIH • BAGIAN KESISWAAN & TATA TERTIB
              </p>
              <h2 className="text-lg font-black uppercase">
                LAPORAN KEDISIPLINAN SISWA KELAS {selectedClassRow.className}
              </h2>
              <p className="text-xs text-slate-600">
                Wali Kelas: {selectedClassRow.waliKelas} • Jumlah Siswa: {selectedClassStudents.length} • Akumulasi Poin: {selectedClassRow.totalPoints} • Kepatuhan: {selectedClassRow.complianceRate}%
              </p>
            </div>

            {/* Student Roster & Violation Table */}
            <div className="flex-1 overflow-y-auto p-5 print:overflow-visible print:p-0 print:pt-4">
              <table className="w-full border-collapse text-left text-xs print:border print:border-slate-300">
                <thead>
                  <tr className="border-b border-border bg-surface-container-low text-[11px] font-bold text-muted-foreground uppercase print:bg-slate-100 print:text-slate-900">
                    <th className="px-3 py-2.5 text-center">No</th>
                    <th className="px-3 py-2.5">NIS</th>
                    <th className="px-3 py-2.5">Nama Siswa</th>
                    <th className="px-3 py-2.5 text-center">L/P</th>
                    <th className="px-3 py-2.5 text-center">Jumlah Catatan</th>
                    <th className="px-3 py-2.5 text-center">Total Poin</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">Rincian Pelanggaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedClassStudents.map((stu, idx) => {
                    const stuViolations = violations.filter((v) => v.student_id === stu.id);
                    const stuPoints = stuViolations.reduce((acc, v) => acc + v.poin, 0);
                    return (
                      <tr key={stu.id} className="hover:bg-surface-container-low/60">
                        <td className="px-3 py-3 text-center font-medium">{idx + 1}</td>
                        <td className="px-3 py-3 font-mono text-[11px]">{stu.nis ?? '-'}</td>
                        <td className="px-3 py-3 font-bold text-foreground">{stu.nama}</td>
                        <td className="px-3 py-3 text-center">{stu.jenis_kelamin}</td>
                        <td className="px-3 py-3 text-center">{stuViolations.length}</td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`rounded px-2 py-0.5 font-bold ${
                              stuPoints >= 30
                                ? 'bg-red-100 text-red-700'
                                : stuPoints > 0
                                  ? 'bg-amber-surface text-amber-dark'
                                  : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {stuPoints} Poin
                          </span>
                        </td>
                        <td className="px-3 py-3 font-semibold text-foreground">
                          {getStudentStatusLabel(stuPoints)}
                        </td>
                        <td className="px-3 py-3">
                          {stuViolations.length === 0 ? (
                            <span className="text-muted-foreground">Tertib (Belum ada catatan)</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {stuViolations.map((v) => (
                                <span
                                  key={v.id}
                                  className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-800"
                                >
                                  {v.violation_code} ({v.tanggal}, +{v.poin})
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {selectedClassStudents.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground">
                        Belum ada siswa aktif terdaftar di Kelas {selectedClassRow.className}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
