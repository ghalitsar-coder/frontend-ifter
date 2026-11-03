'use client';

import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
  Save,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from '@/libs/I18nNavigation';

type StudentCheckItem = {
  id: string;
  name: string;
  nis: string;
  missingTie: boolean;
  missingBelt: boolean;
  missingSocks: boolean;
  untidyHair: boolean;
  lateArrival: boolean;
};

const initialStudentsByClass: Record<string, StudentCheckItem[]> = {
  'VIII A': [
    { id: 's-1', name: 'Fajar Maulana', nis: '00829311', missingTie: true, missingBelt: false, missingSocks: false, untidyHair: false, lateArrival: false },
    { id: 's-2', name: 'Dimas Saputra', nis: '00829103', missingTie: false, missingBelt: false, missingSocks: false, untidyHair: false, lateArrival: true },
    { id: 's-3', name: 'Bagus Pamungkas', nis: '00829562', missingTie: false, missingBelt: true, missingSocks: false, untidyHair: false, lateArrival: false },
    { id: 's-4', name: 'Aisyah Zahra', nis: '00829670', missingTie: false, missingBelt: false, missingSocks: false, untidyHair: false, lateArrival: false },
    { id: 's-5', name: 'Dewi Anggraini', nis: '00829712', missingTie: false, missingBelt: false, missingSocks: false, untidyHair: false, lateArrival: false },
  ],
  'VIII B': [
    { id: 's-6', name: 'Aldo Firmansyah', nis: '00829440', missingTie: true, missingBelt: true, missingSocks: false, untidyHair: true, lateArrival: false },
    { id: 's-7', name: 'Budi Santoso', nis: '00829202', missingTie: false, missingBelt: false, missingSocks: false, untidyHair: false, lateArrival: false },
    { id: 's-8', name: 'Citra Lestari', nis: '00829505', missingTie: false, missingBelt: false, missingSocks: false, untidyHair: false, lateArrival: false },
  ],
  'IX A': [
    { id: 's-9', name: 'Rizky Pratama', nis: '00829103', missingTie: true, missingBelt: false, missingSocks: true, untidyHair: false, lateArrival: false },
    { id: 's-10', name: 'Bayu Nugroho', nis: '00829215', missingTie: false, missingBelt: false, missingSocks: false, untidyHair: false, lateArrival: false },
    { id: 's-11', name: 'Farhan Ramadhan', nis: '00829330', missingTie: false, missingBelt: false, missingSocks: false, untidyHair: false, lateArrival: false },
  ],
};

const inspectionClasses = ['VIII A', 'VIII B', 'IX A', 'VII A', 'VII B', 'VII C'];

/**
 * Page view for daily class attribute and discipline inspection.
 *
 * @returns Rendered inspection management screen.
 */
export function DisciplineInspectionView() {
  const [selectedClass, setSelectedClass] = useState('VIII A');
  const [sessionName, setSessionName] = useState('Sesi Pagi (Apel & Pembiasaan)');
  const [students, setStudents] = useState<Record<string, StudentCheckItem[]>>(initialStudentsByClass);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentClassStudents = students[selectedClass] ?? [
    { id: 's-gen-1', name: 'Ahmad Fauzi', nis: '00829911', missingTie: false, missingBelt: false, missingSocks: false, untidyHair: false, lateArrival: false },
    { id: 's-gen-2', name: 'Nabila Syahrani', nis: '00829912', missingTie: false, missingBelt: false, missingSocks: false, untidyHair: false, lateArrival: false },
    { id: 's-gen-3', name: 'Rian Kurniawan', nis: '00829913', missingTie: false, missingBelt: false, missingSocks: false, untidyHair: false, lateArrival: false },
  ];

  const handleToggle = (studentId: string, field: keyof Omit<StudentCheckItem, 'id' | 'name' | 'nis'>) => {
    setStudents((prev) => {
      const classList = (prev[selectedClass] ?? currentClassStudents).map((s) => {
        if (s.id === studentId) {
          return { ...s, [field]: !s[field] };
        }
        return s;
      });
      return { ...prev, [selectedClass]: classList };
    });
  };

  const handleMarkAllClean = () => {
    setStudents((prev) => {
      const classList = (prev[selectedClass] ?? currentClassStudents).map((s) => ({
        ...s,
        missingTie: false,
        missingBelt: false,
        missingSocks: false,
        untidyHair: false,
        lateArrival: false,
      }));
      return { ...prev, [selectedClass]: classList };
    });
    showToast(`Semua siswa di ${selectedClass} ditandai tertib & lengkap.`);
  };

  const handleSave = () => {
    showToast(`Hasil pemeriksaan ${selectedClass} berhasil disimpan ke basis data.`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Calculate statistics for the active class
  const totalCount = currentClassStudents.length;
  const violationCount = currentClassStudents.filter(
    (s) => s.missingTie || s.missingBelt || s.missingSocks || s.untidyHair || s.lateArrival,
  ).length;
  const compliantCount = totalCount - violationCount;
  const totalClassPoints = currentClassStudents.reduce((acc, s) => {
    let p = 0;
    if (s.missingTie) p += 3;
    if (s.missingBelt) p += 3;
    if (s.missingSocks) p += 3;
    if (s.untidyHair) p += 3;
    if (s.lateArrival) p += 2;
    return acc + p;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex animate-in items-center gap-2 rounded-xl bg-pine-deep px-4 py-3 text-sm font-semibold text-white shadow-xl duration-200 slide-in-from-top-4">
          <CheckCircle2 className="size-4 text-amber-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb & Navigation Bar */}
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
              <span className="text-muted-foreground">Pemeriksaan Harian</span>
            </div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-on-surface md:text-2xl">
              Pemeriksaan Kelas & Atribut Harian
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-on-surface shadow-xs transition-colors hover:bg-surface-card"
            onClick={handleMarkAllClean}
            type="button"
          >
            <RotateCcw className="size-3.5 text-pine-deep" />
            Tandai Semua Tertib
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
            onClick={handleSave}
            type="button"
          >
            <Save className="size-3.5 text-amber-gold" />
            Simpan Hasil Pemeriksaan
          </button>
        </div>
      </div>

      {/* Control Strip & Class Selector */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Pilih Rombel:</span>
            {inspectionClasses.map((cls) => {
              const active = selectedClass === cls;
              return (
                <button
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? 'bg-pine-deep text-white shadow-xs'
                      : 'border border-border bg-surface-card text-on-surface hover:border-pine-deep/40'
                  }`}
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  type="button"
                >
                  {cls}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5 text-pine-deep" />
              Kamis, 05 Okt 2026
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ClipboardCheck className="size-3.5 text-amber-gold" />
              {sessionName}
            </span>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip for Selected Class */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Siswa Terdaftar</span>
            <Users className="size-4 text-pine-deep" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-on-surface">{totalCount}</p>
          <span className="text-[11px] text-muted-foreground">Kelas {selectedClass}</span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Siswa Tertib & Lengkap</span>
            <UserCheck className="size-4 text-emerald-700" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-emerald-900">{compliantCount}</p>
          <span className="text-[11px] font-medium text-emerald-700">
            {totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 100}% kepatuhan
          </span>
        </div>

        <div className="rounded-2xl border border-amber-gold/40 bg-amber-surface/70 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-900">Perlu Catatan / Teguran</span>
            <AlertTriangle className="size-4 text-amber-700" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-amber-900">{violationCount}</p>
          <span className="text-[11px] font-medium text-amber-800">Atribut tidak standar</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Poin Terakumulasi Hari Ini</span>
            <ShieldCheck className="size-4 text-pine-deep" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-pine-deep">+{totalClassPoints}</p>
          <span className="text-[11px] text-muted-foreground">Bobot sanksi kelas</span>
        </div>
      </div>

      {/* Main Table: Student Attribute Checklist */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="border-b border-border bg-surface-card/60 px-6 py-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-heading text-sm font-bold text-on-surface">
                Checklist Seragam & Ketertiban: Kelas {selectedClass}
              </h2>
              <p className="text-xs text-muted-foreground">
                Centang kotak atribut yang <strong className="text-red-700">TIDAK LENGKAP / MELANGGAR</strong> untuk memberikan bobot poin otomatis.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-pine-light px-2.5 py-1 text-xs font-semibold text-pine-deep">
              Petugas: Ibu Rina, S.Pd. (Kesiswaan)
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="border-b border-border bg-surface-card/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3.5">Nama & NIS Siswa</th>
                <th className="px-3 py-3.5 text-center">Dasi (+3)</th>
                <th className="px-3 py-3.5 text-center">Ikat Pinggang (+3)</th>
                <th className="px-3 py-3.5 text-center">Kaus Kaki (+3)</th>
                <th className="px-3 py-3.5 text-center">Rambut / Jilbab (+3)</th>
                <th className="px-3 py-3.5 text-center">Terlambat (+2)</th>
                <th className="px-4 py-3.5 text-center">Poin Tercatat</th>
                <th className="px-6 py-3.5 text-right">Status Kepatuhan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {currentClassStudents.map((student) => {
                let p = 0;
                if (student.missingTie) p += 3;
                if (student.missingBelt) p += 3;
                if (student.missingSocks) p += 3;
                if (student.untidyHair) p += 3;
                if (student.lateArrival) p += 2;
                const hasInfraction = p > 0;

                return (
                  <tr
                    className={`transition-colors hover:bg-surface-card/40 ${
                      hasInfraction ? 'bg-amber-surface/20' : ''
                    }`}
                    key={student.id}
                  >
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-on-surface">{student.name}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">NIS {student.nis}</div>
                    </td>

                    <td className="px-3 py-3.5 text-center">
                      <input
                        checked={student.missingTie}
                        className="size-4 cursor-pointer rounded border-border text-red-600 focus:ring-red-500"
                        onChange={() => handleToggle(student.id, 'missingTie')}
                        type="checkbox"
                      />
                    </td>

                    <td className="px-3 py-3.5 text-center">
                      <input
                        checked={student.missingBelt}
                        className="size-4 cursor-pointer rounded border-border text-red-600 focus:ring-red-500"
                        onChange={() => handleToggle(student.id, 'missingBelt')}
                        type="checkbox"
                      />
                    </td>

                    <td className="px-3 py-3.5 text-center">
                      <input
                        checked={student.missingSocks}
                        className="size-4 cursor-pointer rounded border-border text-red-600 focus:ring-red-500"
                        onChange={() => handleToggle(student.id, 'missingSocks')}
                        type="checkbox"
                      />
                    </td>

                    <td className="px-3 py-3.5 text-center">
                      <input
                        checked={student.untidyHair}
                        className="size-4 cursor-pointer rounded border-border text-red-600 focus:ring-red-500"
                        onChange={() => handleToggle(student.id, 'untidyHair')}
                        type="checkbox"
                      />
                    </td>

                    <td className="px-3 py-3.5 text-center">
                      <input
                        checked={student.lateArrival}
                        className="size-4 cursor-pointer rounded border-border text-red-600 focus:ring-red-500"
                        onChange={() => handleToggle(student.id, 'lateArrival')}
                        type="checkbox"
                      />
                    </td>

                    <td className="px-4 py-3.5 text-center font-semibold">
                      {p > 0 ? (
                        <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                          +{p} Poin
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">0</span>
                      )}
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      {hasInfraction ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-gold/40 bg-amber-surface px-2.5 py-0.5 text-[11px] font-semibold text-amber-dark">
                          Perlu Pembinaan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                          <CheckCircle2 className="size-3 text-emerald-700" />
                          Tertib & Lengkap
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Notes */}
        <div className="border-t border-border bg-surface-card/40 px-6 py-3 text-xs text-muted-foreground">
          Sesuai Buku Pedoman Tata Tertib: Pelanggaran seragam dikenakan +3 poin per item, keterlambatan apel +2 poin. Hasil pemeriksaan otomatis tersinkron ke profil bimbingan wali kelas.
        </div>
      </div>
    </div>
  );
}
