'use client';

import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  HeartHandshake,
  MessageSquare,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from '@/libs/I18nNavigation';
import {
  createCounselingRecord,
  deleteCounselingRecord,
  DisciplineApiError,
  fetchCounselingRecords,
  fetchSchoolStudents,
  updateCounselingRecord,
} from '@/services/disciplineApi';
import type {
  CounselingRecord,
  CounselingStatus,
  SchoolStudentRecord,
} from '@/services/disciplineApi';

const statusMeta: Record<CounselingStatus, { label: string; className: string }> = {
  scheduled: {
    label: 'Terjadwal',
    className: 'border border-blue-200 bg-blue-100 text-blue-900',
  },
  ongoing: {
    label: 'Dalam Pendampingan',
    className: 'border border-amber-gold/40 bg-amber-surface text-amber-dark',
  },
  completed: {
    label: 'Selesai',
    className: 'bg-emerald-100 text-emerald-900',
  },
};

/**
 * Full-CRUD Counseling (Bimbingan BK) journal view connected to backend APIs.
 *
 * @returns Rendered counseling journal page.
 */
export function DisciplineCounselingView() {
  const [records, setRecords] = useState<CounselingRecord[]>([]);
  const [students, setStudents] = useState<SchoolStudentRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CounselingStatus>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CounselingRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [selectedStudentId, setSelectedStudentId] = useState<number>(1);
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10));
  const [topik, setTopik] = useState('');
  const [catatan, setCatatan] = useState('');
  const [tindakLanjut, setTindakLanjut] = useState('');
  const [status, setStatus] = useState<CounselingStatus>('scheduled');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadData = async () => {
    try {
      const [counselings, studentList] = await Promise.all([
        fetchCounselingRecords(),
        fetchSchoolStudents(),
      ]);
      setRecords(counselings);
      setStudents(studentList);
      if (studentList[0] && selectedStudentId === 1) {
        setSelectedStudentId(studentList[0].id);
      }
    } catch {
      // Keep current state when offline.
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filtered = records.filter((rec) => {
    if (statusFilter !== 'all' && rec.status !== statusFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        rec.student_name.toLowerCase().includes(q) ||
        rec.topik.toLowerCase().includes(q) ||
        (rec.nama_kelas ?? '').toLowerCase().includes(q) ||
        (rec.nis ?? '').includes(q)
      );
    }
    return true;
  });

  const openCreateModal = () => {
    setEditingRecord(null);
    setSelectedStudentId(students[0]?.id ?? 1);
    setTanggal(new Date().toISOString().slice(0, 10));
    setTopik('');
    setCatatan('');
    setTindakLanjut('');
    setStatus('scheduled');
    setIsModalOpen(true);
  };

  const openEditModal = (rec: CounselingRecord) => {
    setEditingRecord(rec);
    setSelectedStudentId(rec.student_id);
    setTanggal(rec.tanggal);
    setTopik(rec.topik);
    setCatatan(rec.catatan ?? '');
    setTindakLanjut(rec.tindak_lanjut ?? '');
    setStatus(rec.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!topik.trim()) {
      showToast('Topik pembinaan wajib diisi.');
      return;
    }
    try {
      if (editingRecord) {
        await updateCounselingRecord(editingRecord.id, {
          tanggal,
          topik: topik.trim(),
          catatan: catatan.trim() || undefined,
          tindak_lanjut: tindakLanjut.trim() || undefined,
          status,
        });
        showToast('Catatan bimbingan BK berhasil diperbarui.');
      } else {
        await createCounselingRecord({
          student_id: selectedStudentId,
          tanggal,
          topik: topik.trim(),
          catatan: catatan.trim() || undefined,
          tindak_lanjut: tindakLanjut.trim() || undefined,
          status,
        });
        showToast('Daftar bimbingan BK baru berhasil disimpan.');
      }
      setIsModalOpen(false);
      setEditingRecord(null);
      await loadData();
    } catch (error) {
      if (error instanceof DisciplineApiError) {
        showToast(error.message);
      }
    }
  };

  const handleDelete = async (rec: CounselingRecord) => {
    try {
      await deleteCounselingRecord(rec.id);
      showToast(`Catatan bimbingan ${rec.student_name} berhasil dihapus.`);
      setRecords((prev) => prev.filter((item) => item.id !== rec.id));
    } catch (error) {
      if (error instanceof DisciplineApiError) {
        showToast(error.message);
      }
    }
  };

  const ongoingCount = records.filter((r) => r.status !== 'completed').length;
  const completedCount = records.filter((r) => r.status === 'completed').length;

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
              <span>Rekam Bimbingan BK</span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              Jurnal Rekam Bimbingan & Konseling (BK)
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-pine-hover"
        >
          <PlusCircle className="size-4 text-amber-gold" />
          <span>+ Tambah Sesi Bimbingan</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <span className="text-xs font-medium text-muted-foreground">Total Sesi Bimbingan</span>
          <p className="mt-1 text-2xl font-black text-foreground">{records.length} Sesi</p>
        </div>
        <div className="rounded-2xl border border-amber-gold/40 bg-amber-surface/40 p-5 shadow-xs">
          <span className="text-xs font-medium text-amber-900">Terjadwal / Pendampingan</span>
          <p className="mt-1 text-2xl font-black text-amber-dark">{ongoingCount} Siswa</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-xs">
          <span className="text-xs font-medium text-emerald-900">Selesai Pembinaan</span>
          <p className="mt-1 text-2xl font-black text-emerald-900">{completedCount} Kasus</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all' as const, label: `Semua (${records.length})` },
            {
              id: 'scheduled' as const,
              label: `Terjadwal (${records.filter((r) => r.status === 'scheduled').length})`,
            },
            {
              id: 'ongoing' as const,
              label: `Pendampingan (${records.filter((r) => r.status === 'ongoing').length})`,
            },
            { id: 'completed' as const, label: `Selesai (${completedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                statusFilter === tab.id
                  ? 'bg-pine-deep text-white'
                  : 'border border-border bg-surface-container-low text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <label className="flex h-9 w-full items-center rounded-xl border border-border bg-surface-container-low px-3 sm:w-72">
          <Search className="mr-2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            placeholder="Cari siswa, kelas, atau topik bimbingan..."
            className="w-full bg-transparent text-xs focus:outline-hidden"
          />
        </label>
      </div>

      {/* Counseling Cards */}
      <div className="space-y-4">
        {filtered.map((rec) => {
          const meta = statusMeta[rec.status] ?? statusMeta.scheduled;
          return (
            <div
              key={rec.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-pine-light"
            >
              <div className="flex flex-col justify-between gap-3 border-b border-border pb-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-pine-light text-pine-deep">
                    <HeartHandshake className="size-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">{rec.student_name}</h3>
                      <span className="rounded bg-surface-container-low px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        Kelas {rec.nama_kelas ?? '-'} • NIS: {rec.nis ?? '-'}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${meta.className}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="size-3 text-pine-deep" />
                      <span>
                        Tanggal: {rec.tanggal} • Konselor: {rec.counselor_name ?? 'Petugas BK / Kesiswaan'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      openEditModal(rec);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    <Pencil className="size-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleDelete(rec);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-4 text-xs md:grid-cols-3">
                <div>
                  <span className="font-semibold text-muted-foreground">Topik Pembinaan</span>
                  <p className="mt-1 font-bold text-foreground">{rec.topik}</p>
                </div>
                <div>
                  <span className="flex items-center gap-1 font-semibold text-muted-foreground">
                    <MessageSquare className="size-3.5 text-pine-deep" />
                    <span>Catatan Konseling</span>
                  </span>
                  <p className="mt-1 text-foreground">{rec.catatan ?? 'Belum ada catatan.'}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Rencana Tindak Lanjut</span>
                  <p className="mt-1 text-foreground">{rec.tindak_lanjut ?? '-'}</p>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-border bg-card py-12 text-center text-xs text-muted-foreground">
            Belum ada sesi bimbingan konseling yang sesuai filter.
          </div>
        )}
      </div>

      {/* Create / Edit Counseling Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {editingRecord ? 'Edit Catatan Bimbingan BK' : 'Tambah Sesi Bimbingan BK'}
                </h3>
                <p className="text-xs text-muted-foreground">SD Islam Bakti Asih</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                }}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                void handleSubmit(e);
              }}
              className="mt-4 space-y-3 text-xs"
            >
              {editingRecord ? (
                <div className="rounded-xl border border-border bg-surface-container-low p-3 font-bold">
                  {editingRecord.student_name} (Kelas {editingRecord.nama_kelas ?? '-'})
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="block font-bold">Pilih Siswa *</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => {
                      setSelectedStudentId(Number(e.target.value));
                    }}
                    className="w-full rounded-xl border border-border bg-surface-container-low p-2.5"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        Kelas {s.nama_kelas} — {s.nama} (NIS: {s.nis ?? '-'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold">Tanggal *</label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => {
                      setTanggal(e.target.value);
                    }}
                    className="w-full rounded-xl border border-border bg-surface-container-low p-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold">Status Pembinaan</label>
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value as CounselingStatus);
                    }}
                    className="w-full rounded-xl border border-border bg-surface-container-low p-2"
                  >
                    <option value="scheduled">Terjadwal</option>
                    <option value="ongoing">Dalam Pendampingan</option>
                    <option value="completed">Selesai</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold">Topik Pembinaan *</label>
                <input
                  type="text"
                  value={topik}
                  onChange={(e) => {
                    setTopik(e.target.value);
                  }}
                  placeholder="Misal: Pembinaan kedisiplinan masuk tepat waktu"
                  className="w-full rounded-xl border border-border bg-surface-container-low p-2.5"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold">Catatan Konseling & Komitmen Siswa</label>
                <textarea
                  rows={3}
                  value={catatan}
                  onChange={(e) => {
                    setCatatan(e.target.value);
                  }}
                  className="w-full rounded-xl border border-border bg-surface-container-low p-2.5"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold">Rencana Tindak Lanjut</label>
                <input
                  type="text"
                  value={tindakLanjut}
                  onChange={(e) => {
                    setTindakLanjut(e.target.value);
                  }}
                  placeholder="Misal: Pemantauan wali kelas 1 minggu"
                  className="w-full rounded-xl border border-border bg-surface-container-low p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                  }}
                  className="rounded-xl border border-border px-4 py-2 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-pine-deep px-4 py-2 font-bold text-white hover:bg-pine-hover"
                >
                  {editingRecord ? 'Simpan Perubahan' : 'Simpan Sesi Bimbingan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
