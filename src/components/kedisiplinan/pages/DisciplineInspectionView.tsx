'use client';

import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Eye,
  HelpCircle,
  Pencil,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { DisciplineViolationTypesModal } from '@/components/kedisiplinan/DisciplineViolationTypesModal';
import { Link } from '@/libs/I18nNavigation';
import {
  deleteInspection,
  DisciplineApiError,
  fetchClassStudents,
  fetchInspections,
  fetchViolationTypes,
  postCreateInspection,
  updateInspection,
} from '@/services/disciplineApi';
import type {
  ClassStudentRecord,
  CreateInspectionViolationItem,
  DisciplineInspectionRecord,
  ViolationTypeRecord,
} from '@/services/disciplineApi';
import { getClasses } from '@/services/presensiApi';
import type { ClassRecord } from '@/services/presensiApi';

type CategoryFilterKey = 'pagi' | 'atribut' | 'kerapihan' | 'perilaku' | 'semua';

const categoryFilterOptions: { value: CategoryFilterKey; label: string }[] = [
  { value: 'pagi', label: 'Pemeriksaan Pagi (4 Item Utama)' },
  { value: 'atribut', label: 'Kategori: Atribut Seragam' },
  { value: 'kerapihan', label: 'Kategori: Kerapihan & Kebersihan' },
  { value: 'perilaku', label: 'Kategori: Perilaku & Tata Tertib' },
  { value: 'semua', label: 'Semua Kategori Aktif' },
];

function syncChecksFromInspection(
  students: ClassStudentRecord[],
  inspection: DisciplineInspectionRecord | undefined,
): Record<number, number[]> {
  const next: Record<number, number[]> = {};
  for (const s of students) {
    next[s.id] = [];
  }
  if (!inspection?.violations) {
    return next;
  }
  for (const v of inspection.violations) {
    const existing = next[v.student_id] ?? [];
    if (!existing.includes(v.violation_type_id)) {
      next[v.student_id] = [...existing, v.violation_type_id];
    }
  }
  return next;
}

/**
 * Clean tabular daily class inspection page with category dropdown selector,
 * inline per-row CRUD actions right inside the checklist, and read-only History Preview.
 *
 * @returns Rendered daily class inspection page.
 */
export function DisciplineInspectionView() {
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number>(1);
  const [inspectionDate, setInspectionDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [generalNotes, setGeneralNotes] = useState('');
  const [students, setStudents] = useState<ClassStudentRecord[]>([]);
  const [violationTypes, setViolationTypes] = useState<ViolationTypeRecord[]>([]);
  const [selectedTypeIdsByStudent, setSelectedTypeIdsByStudent] = useState<
    Record<number, number[]>
  >({});
  const [savedInspections, setSavedInspections] = useState<DisciplineInspectionRecord[]>([]);
  const [editingInspectionId, setEditingInspectionId] = useState<number | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [categoryPreset, setCategoryPreset] = useState<CategoryFilterKey>('pagi');
  const [previewInspection, setPreviewInspection] = useState<DisciplineInspectionRecord | null>(
    null,
  );
  const [isManageTypesOpen, setIsManageTypesOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadMeta = async () => {
    try {
      const [cls, vts, insList] = await Promise.all([
        getClasses(),
        fetchViolationTypes(true),
        fetchInspections(),
      ]);
      setClasses(cls);
      if (cls[0] && !cls.some((c) => c.id === selectedClassId)) {
        setSelectedClassId(cls[0].id);
      }
      setViolationTypes(vts);
      setSavedInspections(insList);
    } catch {
      // Keep current state when offline.
    }
  };

  useEffect(() => {
    void loadMeta();
  }, []);

  useEffect(() => {
    let active = true;
    async function loadRosterAndMatch() {
      if (selectedClassId <= 0) {
        return;
      }
      try {
        const list = await fetchClassStudents(selectedClassId);
        if (!active) {
          return;
        }
        setStudents(list);
        setEditingStudentId(null);

        const matched = savedInspections.find(
          (ins) => ins.class_id === selectedClassId && ins.tanggal === inspectionDate,
        );
        if (matched) {
          setEditingInspectionId(matched.id);
          setGeneralNotes(matched.catatan ?? '');
          setSelectedTypeIdsByStudent(syncChecksFromInspection(list, matched));
        } else {
          setEditingInspectionId(null);
          setGeneralNotes('');
          setSelectedTypeIdsByStudent(syncChecksFromInspection(list, undefined));
        }
      } catch {
        if (!active) {
          return;
        }
        setStudents([]);
      }
    }
    void loadRosterAndMatch();
    return () => {
      active = false;
    };
  }, [selectedClassId, inspectionDate, savedInspections]);

  const activeTypes = violationTypes.filter((vt) => vt.is_active);
  const getColumnsForPreset = (): ViolationTypeRecord[] => {
    if (categoryPreset === 'pagi') {
      const mainCodes = ['ATR-01', 'ATR-02', 'KRP-01', 'PRL-01'];
      const picked = mainCodes
        .map((code) => activeTypes.find((vt) => vt.kode === code))
        .filter((item): item is ViolationTypeRecord => Boolean(item));
      return picked.length > 0 ? picked : activeTypes.slice(0, 4);
    }
    if (categoryPreset === 'semua') {
      return activeTypes;
    }
    return activeTypes.filter((vt) => vt.kategori === categoryPreset);
  };

  const columnTypes = getColumnsForPreset();

  const toggleStudentViolation = (studentId: number, typeId: number) => {
    const current = selectedTypeIdsByStudent[studentId] ?? [];
    const exists = current.includes(typeId);
    const next = exists ? current.filter((id) => id !== typeId) : [...current, typeId];
    setSelectedTypeIdsByStudent({
      ...selectedTypeIdsByStudent,
      [studentId]: next,
    });
  };

  const calcStudentPoints = (typeIds: number[]): number => {
    return typeIds.reduce((sum, id) => {
      const vt = violationTypes.find((item) => item.id === id);
      return sum + (vt?.poin_default ?? 0);
    }, 0);
  };

  const buildViolationItems = (
    overrideMap?: Record<number, number[]>,
  ): CreateInspectionViolationItem[] => {
    const source = overrideMap ?? selectedTypeIdsByStudent;
    const items: CreateInspectionViolationItem[] = [];
    for (const s of students) {
      const pickedIds = source[s.id] ?? [];
      for (const typeId of pickedIds) {
        const vt = violationTypes.find((item) => item.id === typeId);
        items.push({
          student_id: s.id,
          violation_type_id: typeId,
          poin: vt?.poin_default,
          keterangan: vt
            ? `[${vt.kode}] ${vt.nama} (Pemeriksaan Harian)`
            : 'Catatan Pemeriksaan Harian',
        });
      }
    }
    return items;
  };

  const persistChecklist = async (
    overrideMap?: Record<number, number[]>,
    successMessage?: string,
  ) => {
    if (selectedClassId <= 0) {
      return;
    }
    setSubmitting(true);
    const items = buildViolationItems(overrideMap);

    try {
      if (editingInspectionId !== null) {
        await updateInspection(editingInspectionId, {
          tanggal: inspectionDate,
          jumlah_diperiksa: students.length,
          catatan: generalNotes.trim() || undefined,
          violations: items,
        });
      } else {
        await postCreateInspection({
          class_id: selectedClassId,
          tanggal: inspectionDate,
          jumlah_diperiksa: students.length,
          catatan: generalNotes.trim() || undefined,
          violations: items,
        });
      }
      setEditingStudentId(null);
      const updated = await fetchInspections();
      setSavedInspections(updated);
      showToast(
        successMessage ??
          `Checklist Kelas ${selectedClassName} berhasil disimpan (${items.length} catatan). Riwayat diperbarui.`,
      );
    } catch (error) {
      if (error instanceof DisciplineApiError) {
        showToast(error.message);
      } else {
        showToast('Gagal menyimpan hasil pemeriksaan.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAllOrderly = () => {
    const cleared = syncChecksFromInspection(students, undefined);
    setSelectedTypeIdsByStudent(cleared);
    if (editingInspectionId !== null) {
      void persistChecklist(
        cleared,
        `Semua siswa Kelas ${selectedClassName} ditandai tertib & disimpan.`,
      );
    } else {
      showToast('Semua siswa pada checklist ditandai tertib.');
    }
  };

  const handleClearStudentRow = (student: ClassStudentRecord) => {
    const nextMap = {
      ...selectedTypeIdsByStudent,
      [student.id]: [],
    };
    setSelectedTypeIdsByStudent(nextMap);
    if (editingInspectionId !== null) {
      void persistChecklist(
        nextMap,
        `Catatan ${student.nama} dihapus (menjadi Tertib & Lengkap).`,
      );
    } else {
      showToast(`Centang ${student.nama} direset.`);
    }
  };

  const handleDeleteCurrentInspection = async () => {
    if (editingInspectionId === null) {
      return;
    }
    try {
      await deleteInspection(editingInspectionId);
      setEditingInspectionId(null);
      setEditingStudentId(null);
      setSelectedTypeIdsByStudent(syncChecksFromInspection(students, undefined));
      setSavedInspections((prev) => prev.filter((item) => item.id !== editingInspectionId));
      showToast(`Pemeriksaan Kelas ${selectedClassName} (${inspectionDate}) dihapus.`);
    } catch (error) {
      if (error instanceof DisciplineApiError) {
        showToast(error.message);
      }
    }
  };

  const selectedClassName =
    classes.find((c) => c.id === selectedClassId)?.nama_kelas ?? `${selectedClassId}`;
  const violationStudentsCount = students.filter(
    (s) => (selectedTypeIdsByStudent[s.id] ?? []).length > 0,
  ).length;
  const orderlyStudentsCount = students.length - violationStudentsCount;
  const totalDayPoints = students.reduce(
    (sum, s) => sum + calcStudentPoints(selectedTypeIdsByStudent[s.id] ?? []),
    0,
  );

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex animate-in items-center gap-2 rounded-xl bg-pine-deep px-4 py-3 text-sm font-semibold text-white shadow-xl duration-200 slide-in-from-top-4">
          <CheckCircle2 className="size-4.5 text-amber-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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
              <span>Pemeriksaan Harian</span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              Pemeriksaan Kelas & Atribut Harian
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsManageTypesOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-2xs transition-colors hover:bg-muted"
          >
            <SlidersHorizontal className="size-3.5 text-pine-deep" />
            <span>+ Kelola Kategori</span>
          </button>

          <button
            type="button"
            onClick={handleMarkAllOrderly}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-2xs transition-colors hover:bg-muted"
          >
            <RotateCcw className="size-3.5 text-pine-deep" />
            <span>Tandai Semua Tertib</span>
          </button>

          <button
            type="button"
            disabled={submitting || students.length === 0}
            onClick={() => {
              void persistChecklist();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-pine-hover disabled:opacity-60"
          >
            <Save className="size-3.5 text-amber-gold" />
            <span>
              {submitting
                ? 'Menyimpan...'
                : editingInspectionId !== null
                  ? 'Simpan Perubahan'
                  : 'Simpan Hasil Pemeriksaan'}
            </span>
          </button>
        </div>
      </div>

      {/* Panduan Singkat */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-pine-deep/15 bg-pine-light/30 px-4 py-3 text-xs text-muted-foreground">
        <HelpCircle className="mt-0.5 size-4 shrink-0 text-pine-deep" />
        <p>
          <strong className="text-pine-deep">Cara Pakai:</strong> Pilih <strong>Kelas</strong> &{' '}
          <strong>Tanggal</strong>, ganti <strong>Kategori Pemeriksaan</strong> lewat dropdown panah jika ingin mengecek kategori lain, lalu centang kotak pelanggaran siswa dan simpan. Gunakan tombol <strong>Edit / Simpan / Hapus</strong> di kolom <strong>Aksi</strong> per siswa; tabel <strong>Riwayat</strong> di bawah otomatis terupdate sebagai pratinjau hasil tersimpan.
        </p>
      </div>

      {/* Selector Kelas (Dropdown Panah) & Tanggal */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-muted-foreground">Pilih Kelas:</span>
          <div className="relative">
            <select
              aria-label="Pilih Kelas Pemeriksaan"
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(Number(e.target.value));
              }}
              className="appearance-none rounded-xl border border-border bg-surface-container-low py-2 pr-9 pl-3.5 text-xs font-bold text-foreground shadow-2xs focus:border-pine-deep focus:outline-hidden"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  Kelas {cls.nama_kelas}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-pine-deep" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <label className="flex items-center gap-1.5 font-medium text-foreground">
            <Calendar className="size-3.5 text-pine-deep" />
            <input
              type="date"
              value={inspectionDate}
              onChange={(e) => {
                setInspectionDate(e.target.value);
              }}
              className="rounded-lg border border-border bg-surface-container-low px-2.5 py-1 text-xs focus:border-pine-deep focus:outline-hidden"
            />
          </label>
          <input
            type="text"
            value={generalNotes}
            onChange={(e) => {
              setGeneralNotes(e.target.value);
            }}
            placeholder="Catatan pemeriksaan kelas (opsional)..."
            className="w-56 rounded-lg border border-border bg-surface-container-low px-3 py-1.5 text-xs focus:border-pine-deep focus:outline-hidden"
          />
          {editingInspectionId !== null && (
            <button
              type="button"
              onClick={() => {
                void handleDeleteCurrentInspection();
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-700 hover:bg-red-100"
              title="Hapus seluruh hasil pemeriksaan tanggal ini"
            >
              <Trash2 className="size-3.5" />
              <span>Hapus Sesi</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <span className="text-xs font-medium text-muted-foreground">
            Total Siswa Kelas {selectedClassName}
          </span>
          <p className="mt-1 text-2xl font-black text-foreground">{students.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-xs">
          <span className="text-xs font-medium text-emerald-900">Siswa Tertib & Lengkap</span>
          <p className="mt-1 text-2xl font-black text-emerald-900">{orderlyStudentsCount}</p>
        </div>
        <div className="rounded-2xl border border-amber-gold/40 bg-amber-surface/40 p-4 shadow-xs">
          <span className="text-xs font-medium text-amber-900">Perlu Catatan / Teguran</span>
          <p className="mt-1 text-2xl font-black text-amber-dark">{violationStudentsCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <span className="text-xs font-medium text-muted-foreground">Poin Terakumulasi</span>
          <p className="mt-1 text-2xl font-black text-red-700">+{totalDayPoints}</p>
        </div>
      </div>

      {/* Checklist Table (Tidy Tabular Grid + Category Dropdown + Inline CRUD Aksi) */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="flex flex-col justify-between gap-3 border-b border-border bg-surface-container-low px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">
                Checklist Seragam & Ketertiban: Kelas {selectedClassName}
              </h2>
              {editingInspectionId !== null && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  Tersimpan ({inspectionDate})
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Centang kolom yang dilanggar atau pilih kategori tambahan pada dropdown panah.
            </p>
          </div>

          {/* Dropdown Kategori Pemeriksaan (dengan panah) */}
          <div className="relative flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Kategori:</span>
            <div className="relative">
              <select
                aria-label="Pilih Kategori Pemeriksaan"
                value={categoryPreset}
                onChange={(e) => {
                  setCategoryPreset(e.target.value as CategoryFilterKey);
                }}
                className="appearance-none rounded-xl border border-border bg-card py-2 pr-9 pl-3.5 text-xs font-bold text-foreground shadow-2xs focus:border-pine-deep focus:outline-hidden"
              >
                {categoryFilterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-pine-deep" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-container-low text-[11px] font-bold text-muted-foreground uppercase">
                <th className="px-5 py-3.5 whitespace-nowrap">Nama & NIS Siswa</th>
                {columnTypes.map((vt) => (
                  <th
                    key={vt.id}
                    className="px-3 py-3.5 text-center whitespace-nowrap"
                    title={vt.nama}
                  >
                    <div>{vt.kode} (+{vt.poin_default})</div>
                    <div className="max-w-[120px] truncate text-[10px] font-medium normal-case text-muted-foreground">
                      {vt.nama}
                    </div>
                  </th>
                ))}
                <th className="px-3 py-3.5 whitespace-nowrap">+ Tambah Item Lain</th>
                <th className="px-3 py-3.5 text-center whitespace-nowrap">Poin</th>
                <th className="px-3 py-3.5 whitespace-nowrap">Status / Catatan</th>
                <th className="px-5 py-3.5 text-center whitespace-nowrap">Aksi Checklist</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((student) => {
                const pickedIds = selectedTypeIdsByStudent[student.id] ?? [];
                const pts = calcStudentPoints(pickedIds);
                const extraItems = activeTypes.filter(
                  (vt) => pickedIds.includes(vt.id) && !columnTypes.some((c) => c.id === vt.id),
                );
                const availableExtras = activeTypes.filter(
                  (vt) => !columnTypes.some((c) => c.id === vt.id) && !pickedIds.includes(vt.id),
                );
                const isRowHighlighted = editingStudentId === student.id;

                return (
                  <tr
                    key={student.id}
                    className={`transition-colors hover:bg-surface-container-low/60 ${
                      isRowHighlighted ? 'bg-amber-surface/25' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-bold text-foreground">{student.nama}</div>
                      <div className="text-[11px] text-muted-foreground">
                        NIS: {student.nis ?? '-'} • {student.jenis_kelamin}
                      </div>
                    </td>

                    {columnTypes.map((vt) => {
                      const checked = pickedIds.includes(vt.id);
                      return (
                        <td key={vt.id} className="px-3 py-3.5 text-center">
                          <input
                            type="checkbox"
                            aria-label={`${student.nama} - ${vt.kode}`}
                            checked={checked}
                            onChange={() => {
                              setEditingStudentId(student.id);
                              toggleStudentViolation(student.id, vt.id);
                            }}
                            className="size-4 cursor-pointer rounded border-border accent-pine-deep"
                          />
                        </td>
                      );
                    })}

                    {/* Dropdown panah per siswa untuk item kategori lain */}
                    <td className="px-3 py-3.5">
                      <div className="space-y-1">
                        {availableExtras.length > 0 && (
                          <div className="relative inline-block">
                            <select
                              aria-label={`Tambah pelanggaran lain untuk ${student.nama}`}
                              value=""
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                if (val > 0) {
                                  setEditingStudentId(student.id);
                                  toggleStudentViolation(student.id, val);
                                }
                              }}
                              className="w-36 appearance-none rounded-lg border border-border bg-surface-container-low py-1 pr-6 pl-2 text-[11px] font-medium text-foreground focus:border-pine-deep focus:outline-hidden"
                            >
                              <option value="">Pilih kategori...</option>
                              {availableExtras.map((vt) => (
                                <option key={vt.id} value={vt.id}>
                                  {vt.kode} - {vt.nama} (+{vt.poin_default})
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute top-1/2 right-1.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                          </div>
                        )}
                        {extraItems.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {extraItems.map((vt) => (
                              <button
                                key={vt.id}
                                type="button"
                                onClick={() => {
                                  setEditingStudentId(student.id);
                                  toggleStudentViolation(student.id, vt.id);
                                }}
                                className="inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700 hover:bg-red-200"
                                title="Klik untuk hapus item ini"
                              >
                                <span>{vt.kode}</span>
                                <X className="size-2.5" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-3.5 text-center whitespace-nowrap">
                      {pts > 0 ? (
                        <span className="rounded-md bg-red-100 px-2 py-0.5 font-bold text-red-700">
                          +{pts}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {pts > 0 ? (
                        <span className="rounded-full bg-amber-surface px-2.5 py-1 text-[11px] font-bold text-amber-dark">
                          Ada Catatan ({pickedIds.length})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-900">
                          <Check className="size-3" />
                          Tertib & Lengkap
                        </span>
                      )}
                    </td>

                    {/* CRUD langsung di samping Status/Catatan */}
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStudentId(
                              editingStudentId === student.id ? null : student.id,
                            );
                          }}
                          className={`rounded-lg p-1.5 transition-colors ${
                            isRowHighlighted
                              ? 'bg-pine-deep text-white'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                          title="Edit checklist siswa ini"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => {
                            void persistChecklist(
                              undefined,
                              `Perubahan untuk ${student.nama} disimpan. Riwayat diperbarui.`,
                            );
                          }}
                          className="rounded-lg bg-pine-light p-1.5 text-pine-deep transition-colors hover:bg-pine-deep hover:text-white"
                          title="Simpan checklist langsung"
                        >
                          <Save className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={submitting || pickedIds.length === 0}
                          onClick={() => {
                            handleClearStudentRow(student);
                          }}
                          className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-30"
                          title="Hapus catatan pelanggaran siswa ini"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td
                    colSpan={columnTypes.length + 5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Belum ada siswa aktif terdaftar pada kelas ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Riwayat Pemeriksaan Tersimpan (Read-Only Preview Otomatis Tersinkron) */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="flex items-center justify-between border-b border-border bg-surface-container-low px-6 py-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Riwayat Pemeriksaan Kelas Tersimpan ({savedInspections.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Pratinjau hasil pemeriksaan yang sudah tersimpan — otomatis berubah saat checklist di atas diedit & disimpan.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-pine-light px-3 py-1 text-xs font-semibold text-pine-deep">
            <ClipboardCheck className="size-3.5" />
            SD Islam Bakti Asih
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-container-low text-[11px] font-bold text-muted-foreground uppercase">
                <th className="px-6 py-3">Tanggal</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Siswa Diperiksa</th>
                <th className="px-4 py-3">Tertib</th>
                <th className="px-4 py-3">Ada Catatan</th>
                <th className="px-4 py-3">Total Poin</th>
                <th className="px-4 py-3">Petugas</th>
                <th className="px-6 py-3 text-center">Pratinjau</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {savedInspections.map((ins) => {
                const vios = ins.violations ?? [];
                const flaggedStudents = new Set(vios.map((v) => v.student_id)).size;
                const orderlyCount = Math.max(0, ins.jumlah_diperiksa - flaggedStudents);
                const totalPts = vios.reduce((s, v) => s + v.poin, 0);

                return (
                  <tr key={ins.id} className="hover:bg-surface-container-low/60">
                    <td className="px-6 py-3.5 font-semibold text-foreground">{ins.tanggal}</td>
                    <td className="px-4 py-3.5 font-bold text-pine-deep">
                      Kelas {ins.nama_kelas}
                    </td>
                    <td className="px-4 py-3.5">{ins.jumlah_diperiksa} Siswa</td>
                    <td className="px-4 py-3.5 font-semibold text-emerald-800">
                      {orderlyCount} Siswa
                    </td>
                    <td className="px-4 py-3.5">
                      {flaggedStudents > 0 ? (
                        <span className="rounded-full bg-amber-surface px-2 py-0.5 text-[11px] font-bold text-amber-dark">
                          {flaggedStudents} Siswa ({vios.length} Item)
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0 Siswa</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-red-700">+{totalPts} Poin</td>
                    <td className="px-4 py-3.5 text-muted-foreground">{ins.inspector_name}</td>
                    <td className="px-6 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewInspection(ins);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-pine-deep hover:bg-muted"
                      >
                        <Eye className="size-3.5" />
                        <span>Pratinjau</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {savedInspections.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    Belum ada riwayat pemeriksaan kelas tersimpan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pratinjau Riwayat (Read-Only Detail + Pintasan Buka di Checklist) */}
      {previewInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Pratinjau Hasil Pemeriksaan — Kelas {previewInspection.nama_kelas}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Tanggal: {previewInspection.tanggal} • Petugas: {previewInspection.inspector_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewInspection(null);
                }}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl border border-border bg-surface-container-low p-3">
                <p className="font-semibold text-foreground">
                  Catatan Kelas: {previewInspection.catatan ?? 'Tidak ada catatan tambahan.'}
                </p>
              </div>

              {(previewInspection.violations ?? []).length === 0 ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center font-semibold text-emerald-900">
                  Seluruh {previewInspection.jumlah_diperiksa} siswa pada kelas ini tercatat tertib & lengkap.
                </div>
              ) : (
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {(previewInspection.violations ?? []).map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-surface-container-low px-3 py-2"
                    >
                      <div>
                        <p className="font-bold text-foreground">{v.student_name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          <span className="font-mono font-bold text-pine-deep">
                            {v.violation_code}
                          </span>{' '}
                          • {v.violation_name}
                        </p>
                      </div>
                      <span className="rounded-md bg-red-100 px-2 py-0.5 font-bold text-red-700">
                        +{v.poin} Poin
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClassId(previewInspection.class_id);
                    setInspectionDate(previewInspection.tanggal);
                    setPreviewInspection(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1 rounded-xl bg-pine-deep px-4 py-2 font-bold text-white hover:bg-pine-hover"
                >
                  <Pencil className="size-3.5 text-amber-gold" />
                  <span>Buka di Checklist Atas</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewInspection(null);
                  }}
                  className="rounded-xl border border-border px-4 py-2 font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Kelola Kategori & Kode Pelanggaran */}
      <DisciplineViolationTypesModal
        isOpen={isManageTypesOpen}
        violationTypes={violationTypes}
        onClose={() => {
          setIsManageTypesOpen(false);
        }}
        onChanged={() => {
          void loadMeta();
        }}
        onNotify={showToast}
      />
    </div>
  );
}
