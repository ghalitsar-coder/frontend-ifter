'use client';

import {
  ArrowLeft,
  Award,
  BarChart3,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Printer,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from '@/libs/I18nNavigation';

type ClassMatrixRow = {
  className: string;
  homeroom: string;
  totalStudents: number;
  lateCount: number;
  uniformCount: number;
  rulesCount: number;
  contrabandCount: number;
  bullyingCount: number;
  totalIncidents: number;
  totalPoints: number;
  complianceRate: number;
  status: 'teladan' | 'tertib' | 'waspada';
};

const initialMatrixData: ClassMatrixRow[] = [
  {
    className: 'Kelas VII A',
    homeroom: 'Dra. Hj. Maimunah',
    totalStudents: 32,
    lateCount: 2,
    uniformCount: 1,
    rulesCount: 0,
    contrabandCount: 0,
    bullyingCount: 0,
    totalIncidents: 3,
    totalPoints: 7,
    complianceRate: 96.8,
    status: 'tertib',
  },
  {
    className: 'Kelas VII B',
    homeroom: 'Ahmad Syafii, S.Pd.',
    totalStudents: 30,
    lateCount: 0,
    uniformCount: 0,
    rulesCount: 0,
    contrabandCount: 0,
    bullyingCount: 0,
    totalIncidents: 0,
    totalPoints: 0,
    complianceRate: 100.0,
    status: 'teladan',
  },
  {
    className: 'Kelas VII C',
    homeroom: 'Sri Wahyuni, S.Pd.',
    totalStudents: 31,
    lateCount: 1,
    uniformCount: 2,
    rulesCount: 1,
    contrabandCount: 0,
    bullyingCount: 0,
    totalIncidents: 4,
    totalPoints: 13,
    complianceRate: 94.2,
    status: 'tertib',
  },
  {
    className: 'Kelas VIII A',
    homeroom: 'Sarah Rahma, S.Pd.',
    totalStudents: 32,
    lateCount: 3,
    uniformCount: 2,
    rulesCount: 3,
    contrabandCount: 0,
    bullyingCount: 0,
    totalIncidents: 8,
    totalPoints: 27,
    complianceRate: 88.5,
    status: 'waspada',
  },
  {
    className: 'Kelas VIII B',
    homeroom: 'Bambang Irawan, S.Pd.',
    totalStudents: 31,
    lateCount: 1,
    uniformCount: 4,
    rulesCount: 1,
    contrabandCount: 0,
    bullyingCount: 0,
    totalIncidents: 6,
    totalPoints: 19,
    complianceRate: 91.0,
    status: 'tertib',
  },
  {
    className: 'Kelas IX A',
    homeroom: 'Drs. Agus Subagyo, M.Pd.',
    totalStudents: 32,
    lateCount: 2,
    uniformCount: 3,
    rulesCount: 1,
    contrabandCount: 0,
    bullyingCount: 1,
    totalIncidents: 7,
    totalPoints: 68,
    complianceRate: 82.4,
    status: 'waspada',
  },
  {
    className: 'Kelas IX B',
    homeroom: 'Nurul Hidayati, S.Pd.',
    totalStudents: 30,
    lateCount: 1,
    uniformCount: 1,
    rulesCount: 0,
    contrabandCount: 0,
    bullyingCount: 0,
    totalIncidents: 2,
    totalPoints: 5,
    complianceRate: 98.0,
    status: 'tertib',
  },
];

/**
 * Page view for School Discipline Class Matrix and Monthly Reporting.
 *
 * @returns Rendered matrix reporting screen.
 */
export function DisciplineMatrixView() {
  const [matrixData] = useState<ClassMatrixRow[]>(initialMatrixData);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleExportXlsx = () => {
    showToast('Mengunduh berkas Matriks Kedisiplinan Siswa (Format XLSX)...');
  };

  const handlePrint = () => {
    window.print();
  };

  const grandTotalStudents = matrixData.reduce((acc, r) => acc + r.totalStudents, 0);
  const grandTotalIncidents = matrixData.reduce((acc, r) => acc + r.totalIncidents, 0);
  const grandTotalPoints = matrixData.reduce((acc, r) => acc + r.totalPoints, 0);
  const averageCompliance = Math.round(
    (matrixData.reduce((acc, r) => acc + r.complianceRate, 0) / matrixData.length) * 10,
  ) / 10;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex animate-in items-center gap-2 rounded-xl bg-pine-deep px-4 py-3 text-sm font-semibold text-white shadow-xl duration-200 slide-in-from-top-4">
          <CheckCircle2 className="size-4 text-amber-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-on-surface shadow-xs transition-colors hover:bg-surface-card"
            href="/dashboard/kedisiplinan?role=kesiswaan"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-pine-deep">
              <span>Tata Tertib Kesiswaan</span>
              <span>/</span>
              <span className="text-muted-foreground">Matriks & Laporan Rombel</span>
            </div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-on-surface md:text-2xl">
              Matriks Kedisiplinan & Laporan Rombel
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-on-surface shadow-xs transition-colors hover:bg-surface-card"
            onClick={handlePrint}
            type="button"
          >
            <Printer className="size-3.5 text-pine-deep" />
            Cetak Rekap
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
            onClick={handleExportXlsx}
            type="button"
          >
            <FileSpreadsheet className="size-3.5 text-amber-gold" />
            Unduh Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Rata-rata Kepatuhan Sekolah</span>
            <ShieldCheck className="size-4 text-emerald-700" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-emerald-900">{averageCompliance}%</p>
          <span className="text-[11px] text-muted-foreground">Dari {grandTotalStudents} total siswa</span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-900">Kelas Teladan Bebas Kasus</span>
            <Award className="size-4 text-emerald-700" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-emerald-900">Kelas VII B</p>
          <span className="text-[11px] font-medium text-emerald-700">0 insiden & kepatuhan 100%</span>
        </div>

        <div className="rounded-2xl border border-amber-gold/40 bg-amber-surface/60 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-900">Total Insiden Bulan Ini</span>
            <TrendingUp className="size-4 text-amber-dark" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-amber-900">{grandTotalIncidents} Kasus</p>
          <span className="text-[11px] font-medium text-amber-800">Akumulasi {grandTotalPoints} poin</span>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50/70 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-red-900">Rombel Perlu Pembinaan</span>
            <ShieldAlert className="size-4 text-red-700" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-red-900">Kelas IX A</p>
          <span className="text-[11px] font-medium text-red-700">68 Poin (Perkelahian di kantin)</span>
        </div>
      </div>

      {/* Main Matrix Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="border-b border-border bg-surface-card/60 px-6 py-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-pine-deep" />
            <h2 className="font-heading text-sm font-bold text-on-surface">
              Distribusi Pelanggaran Tata Tertib Antar Kelas (Periode Oktober 2026)
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="border-b border-border bg-surface-card/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3.5">Rombongan Belajar</th>
                <th className="px-4 py-3.5">Wali Kelas</th>
                <th className="px-3 py-3.5 text-center">Siswa</th>
                <th className="px-3 py-3.5 text-center">Terlambat (+2)</th>
                <th className="px-3 py-3.5 text-center">Seragam (+3)</th>
                <th className="px-3 py-3.5 text-center">Tata Tertib (+5)</th>
                <th className="px-3 py-3.5 text-center">Berat (+50)</th>
                <th className="px-3 py-3.5 text-center">Total Kasus</th>
                <th className="px-4 py-3.5 text-center">Akumulasi Poin</th>
                <th className="px-6 py-3.5 text-right">Tingkat Kepatuhan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {matrixData.map((row) => (
                <tr className="transition-colors hover:bg-surface-card/40" key={row.className}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-on-surface">{row.className}</span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                    {row.homeroom}
                  </td>

                  <td className="px-3 py-4 text-center">{row.totalStudents}</td>

                  <td className="px-3 py-4 text-center font-mono">
                    {row.lateCount > 0 ? (
                      <span className="text-on-surface">{row.lateCount}</span>
                    ) : (
                      <span className="text-muted-foreground/40">-</span>
                    )}
                  </td>

                  <td className="px-3 py-4 text-center font-mono">
                    {row.uniformCount > 0 ? (
                      <span className="text-on-surface">{row.uniformCount}</span>
                    ) : (
                      <span className="text-muted-foreground/40">-</span>
                    )}
                  </td>

                  <td className="px-3 py-4 text-center font-mono">
                    {row.rulesCount > 0 ? (
                      <span className="text-amber-dark font-bold">{row.rulesCount}</span>
                    ) : (
                      <span className="text-muted-foreground/40">-</span>
                    )}
                  </td>

                  <td className="px-3 py-4 text-center font-mono">
                    {row.bullyingCount > 0 ? (
                      <span className="text-red-700 font-bold">{row.bullyingCount}</span>
                    ) : (
                      <span className="text-muted-foreground/40">-</span>
                    )}
                  </td>

                  <td className="px-3 py-4 text-center font-bold text-on-surface">
                    {row.totalIncidents}
                  </td>

                  <td className="px-4 py-4 text-center">
                    {row.totalPoints > 0 ? (
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                          row.totalPoints >= 40
                            ? 'bg-red-100 text-red-700'
                            : row.totalPoints >= 20
                            ? 'bg-amber-surface text-amber-dark'
                            : 'bg-pine-light text-pine-deep'
                        }`}
                      >
                        +{row.totalPoints}
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-bold">0</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-semibold">{row.complianceRate}%</span>
                      {row.status === 'teladan' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          <Award className="size-3" />
                          Teladan
                        </span>
                      )}
                      {row.status === 'tertib' && (
                        <span className="inline-flex rounded-full bg-pine-light px-2 py-0.5 text-[10px] font-bold text-pine-deep">
                          Tertib
                        </span>
                      )}
                      {row.status === 'waspada' && (
                        <span className="inline-flex rounded-full border border-amber-gold/40 bg-amber-surface px-2 py-0.5 text-[10px] font-bold text-amber-dark">
                          Pembinaan
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-border bg-surface-card/60 font-bold text-xs text-on-surface">
              <tr>
                <td className="px-6 py-3.5" colSpan={2}>
                  Total / Rata-Rata Seluruh Rombel
                </td>
                <td className="px-3 py-3.5 text-center">{grandTotalStudents}</td>
                <td className="px-3 py-3.5 text-center font-mono">
                  {matrixData.reduce((acc, r) => acc + r.lateCount, 0)}
                </td>
                <td className="px-3 py-3.5 text-center font-mono">
                  {matrixData.reduce((acc, r) => acc + r.uniformCount, 0)}
                </td>
                <td className="px-3 py-3.5 text-center font-mono">
                  {matrixData.reduce((acc, r) => acc + r.rulesCount, 0)}
                </td>
                <td className="px-3 py-3.5 text-center font-mono">
                  {matrixData.reduce((acc, r) => acc + r.bullyingCount, 0)}
                </td>
                <td className="px-3 py-3.5 text-center text-pine-deep">{grandTotalIncidents}</td>
                <td className="px-4 py-3.5 text-center text-red-700">+{grandTotalPoints} Poin</td>
                <td className="px-6 py-3.5 text-right text-emerald-800">{averageCompliance}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
