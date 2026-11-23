'use client';

import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  HeartHandshake,
  Mail,
  ShieldAlert,
  UserCheck,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from '@/libs/I18nNavigation';
import {
  createCounselingRecord,
  createParentSummons,
  DisciplineApiError,
  fetchWatchlist,
} from '@/services/disciplineApi';
import type { CounselingStatus, WatchlistStudentRecord } from '@/services/disciplineApi';

/**
 * Pembinaan & SP monitoring page backed by real student point accumulations.
 * Includes direct CRUD creation for Bimbingan BK and Surat Pemanggilan Orang Tua.
 *
 * @returns Rendered Pembinaan & SP page.
 */
export function DisciplineWatchlistView() {
  const [students, setStudents] = useState<WatchlistStudentRecord[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'panggilan' | 'sp1'>('all');
  const [bkModalStudent, setBkModalStudent] = useState<WatchlistStudentRecord | null>(null);
  const [summonsModalStudent, setSummonsModalStudent] = useState<WatchlistStudentRecord | null>(
    null,
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Counseling quick-create form
  const [bkDate, setBkDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [bkTopik, setBkTopik] = useState('');
  const [bkCatatan, setBkCatatan] = useState('');
  const [bkTindakLanjut, setBkTindakLanjut] = useState('');
  const [bkStatus, setBkStatus] = useState<CounselingStatus>('scheduled');

  // Summons quick-create form
  const [letterNumber, setLetterNumber] = useState('');
  const [letterDate, setLetterDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [meetingDateTime, setMeetingDateTime] = useState('');
  const [room, setRoom] = useState('Ruang Bimbingan Konseling (BK) SD Islam Bakti Asih');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [reason, setReason] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadWatchlist = async () => {
    try {
      const data = await fetchWatchlist(1);
      setStudents(data);
    } catch {
      // Keep current state when offline.
    }
  };

  useEffect(() => {
    void loadWatchlist();
  }, []);

  const filtered = students.filter((s) => {
    if (filterTab === 'panggilan') {
      return s.total_points >= 30 && s.total_points < 50;
    }
    if (filterTab === 'sp1') {
      return s.total_points >= 50;
    }
    return true;
  });

  const openCreateBk = (s: WatchlistStudentRecord) => {
    setBkModalStudent(s);
    setBkDate(new Date().toISOString().slice(0, 10));
    setBkTopik(`Pembinaan Kedisiplinan (${s.total_points} Poin - ${s.status_sp})`);
    setBkCatatan('');
    setBkTindakLanjut('Pemantauan bersama wali kelas selama 1 pekan.');
    setBkStatus('scheduled');
  };

  const openCreateSummons = (s: WatchlistStudentRecord) => {
    const seq = String(Math.floor(10 + Math.random() * 89)).padStart(3, '0');
    setSummonsModalStudent(s);
    setLetterNumber(`${seq}/SD-BA/KESISWAAN/XI/2026`);
    setLetterDate(new Date().toISOString().slice(0, 10));
    setMeetingDateTime(`${new Date().toISOString().slice(0, 10)}T09:00`);
    setRoom('Ruang Bimbingan Konseling (BK) SD Islam Bakti Asih');
    setParentName(`Orang Tua / Wali ${s.student_name}`);
    setParentPhone(s.no_hp_ortu ?? '6281200000000');
    setReason(
      `Akumulasi poin kedisiplinan mencapai ${s.total_points} poin (${s.status_sp}) dari ${s.total_incidents} catatan pelanggaran.`,
    );
  };

  const handleSubmitBk = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bkModalStudent || !bkTopik.trim()) {
      return;
    }
    try {
      await createCounselingRecord({
        student_id: bkModalStudent.student_id,
        tanggal: bkDate,
        topik: bkTopik.trim(),
        catatan: bkCatatan.trim() || undefined,
        tindak_lanjut: bkTindakLanjut.trim() || undefined,
        status: bkStatus,
      });
      showToast(`Daftar bimbingan BK untuk ${bkModalStudent.student_name} berhasil dibuat.`);
      setBkModalStudent(null);
    } catch (error) {
      if (error instanceof DisciplineApiError) {
        showToast(error.message);
      }
    }
  };

  const handleSubmitSummons = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!summonsModalStudent || !letterNumber.trim() || !reason.trim()) {
      return;
    }
    try {
      await createParentSummons({
        student_id: summonsModalStudent.student_id,
        nomor_surat: letterNumber.trim(),
        tanggal_surat: letterDate,
        jadwal_pertemuan: meetingDateTime,
        ruangan: room.trim(),
        alasan: reason.trim(),
        nama_ortu: parentName.trim() || undefined,
        no_hp_ortu: parentPhone.trim() || undefined,
        status: 'draft',
      });
      showToast(`Surat panggilan orang tua ${summonsModalStudent.student_name} berhasil dibuat.`);
      setSummonsModalStudent(null);
    } catch (error) {
      if (error instanceof DisciplineApiError) {
        showToast(error.message);
      }
    }
  };

  const spCount = students.filter((s) => s.total_points >= 50).length;
  const summonsThresholdCount = students.filter((s) => s.total_points >= 30).length;
  const highestPoints = students.reduce((max, s) => Math.max(max, s.total_points), 0);

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
              <span>Pembinaan & SP</span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              Monitoring Pembinaan & Status SP Siswa
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/kedisiplinan/bimbingan"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
          >
            <HeartHandshake className="size-3.5 text-pine-deep" />
            <span>Lihat Rekam Bimbingan BK</span>
          </Link>
          <Link
            href="/dashboard/kedisiplinan/panggilan"
            className="inline-flex items-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2 text-xs font-bold text-white hover:bg-pine-hover"
          >
            <Mail className="size-3.5 text-amber-gold" />
            <span>Kelola Surat Panggilan</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <span className="text-xs font-medium text-muted-foreground">Siswa Dalam Pembinaan</span>
          <p className="mt-1 text-2xl font-black text-foreground">{students.length} Siswa</p>
        </div>
        <div className="rounded-2xl border border-amber-gold/40 bg-amber-surface/40 p-5 shadow-xs">
          <span className="text-xs font-medium text-amber-900">Ambang Panggilan Ortu (≥30)</span>
          <p className="mt-1 text-2xl font-black text-amber-dark">{summonsThresholdCount} Siswa</p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5 shadow-xs">
          <span className="text-xs font-medium text-red-900">Peringatan SP1–SP3 (≥50)</span>
          <p className="mt-1 text-2xl font-black text-red-700">{spCount} Siswa</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <span className="text-xs font-medium text-muted-foreground">Poin Tertinggi</span>
          <p className="mt-1 text-2xl font-black text-red-700">{highestPoints} Poin</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all' as const, label: `Semua (${students.length})` },
          {
            id: 'panggilan' as const,
            label: `Ambang Panggilan 30–49 (${students.filter((s) => s.total_points >= 30 && s.total_points < 50).length})`,
          },
          { id: 'sp1' as const, label: `Status SP1–SP3 ≥50 (${spCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setFilterTab(tab.id);
            }}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              filterTab === tab.id
                ? 'bg-pine-deep text-white'
                : 'border border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Watchlist Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="flex items-center justify-between border-b border-border bg-surface-container-low px-6 py-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-red-600" />
            <h2 className="text-sm font-bold text-foreground">
              Daftar Siswa Pembinaan & Status SP ({filtered.length})
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">SD Islam Bakti Asih</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-container-low text-[11px] font-bold text-muted-foreground uppercase">
                <th className="px-6 py-3.5">Nama & Kelas Siswa</th>
                <th className="px-4 py-3.5">Jumlah Insiden</th>
                <th className="px-4 py-3.5">Akumulasi Poin</th>
                <th className="px-4 py-3.5">Status Pembinaan / SP</th>
                <th className="px-4 py-3.5">Pelanggaran Terakhir</th>
                <th className="px-6 py-3.5 text-center">Buat Tindak Lanjut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.student_id} className="hover:bg-surface-container-low/60">
                  <td className="px-6 py-4">
                    <div className="font-bold text-foreground">{s.student_name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      Kelas {s.nama_kelas ?? '-'} • NIS: {s.nis ?? '-'}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-semibold">{s.total_incidents} Catatan</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-extrabold ${
                        s.total_points >= 50
                          ? 'bg-red-100 text-red-700'
                          : s.total_points >= 30
                            ? 'bg-amber-surface text-amber-dark'
                            : 'bg-pine-light text-pine-deep'
                      }`}
                    >
                      {s.total_points >= 50 && <AlertTriangle className="size-3.5" />}
                      {s.total_points} Poin
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-foreground">{s.status_sp}</td>
                  <td className="px-4 py-4 text-muted-foreground">{s.last_violation_date}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          openCreateBk(s);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-pine-deep hover:bg-muted"
                      >
                        <UserCheck className="size-3.5" />
                        <span>+ Daftar Bimbingan</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          openCreateSummons(s);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-pine-deep px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-pine-hover"
                      >
                        <Mail className="size-3.5 text-amber-gold" />
                        <span>+ Surat Panggilan</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground">
                    Tidak ada siswa dalam daftar pembinaan pada kategori ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Create Counseling Modal */}
      {bkModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Buat Jadwal / Rekam Bimbingan BK
                </h3>
                <p className="text-xs text-muted-foreground">
                  {bkModalStudent.student_name} (Kelas {bkModalStudent.nama_kelas ?? '-'})
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBkModalStudent(null);
                }}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                void handleSubmitBk(e);
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold">Tanggal Bimbingan *</label>
                  <input
                    type="date"
                    value={bkDate}
                    onChange={(e) => {
                      setBkDate(e.target.value);
                    }}
                    className="w-full rounded-xl border border-border bg-surface-container-low p-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold">Status</label>
                  <select
                    value={bkStatus}
                    onChange={(e) => {
                      setBkStatus(e.target.value as CounselingStatus);
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
                  value={bkTopik}
                  onChange={(e) => {
                    setBkTopik(e.target.value);
                  }}
                  className="w-full rounded-xl border border-border bg-surface-container-low p-2.5"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold">Catatan Konseling</label>
                <textarea
                  rows={2}
                  value={bkCatatan}
                  onChange={(e) => {
                    setBkCatatan(e.target.value);
                  }}
                  placeholder="Hasil observasi / komitmen siswa..."
                  className="w-full rounded-xl border border-border bg-surface-container-low p-2.5"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold">Rencana Tindak Lanjut</label>
                <input
                  type="text"
                  value={bkTindakLanjut}
                  onChange={(e) => {
                    setBkTindakLanjut(e.target.value);
                  }}
                  className="w-full rounded-xl border border-border bg-surface-container-low p-2.5"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setBkModalStudent(null);
                  }}
                  className="rounded-xl border border-border px-4 py-2 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-pine-deep px-4 py-2 font-bold text-white hover:bg-pine-hover"
                >
                  Simpan Bimbingan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Create Summons Modal */}
      {summonsModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Terbitkan Surat Pemanggilan Orang Tua
                </h3>
                <p className="text-xs text-muted-foreground">
                  {summonsModalStudent.student_name} (Kelas {summonsModalStudent.nama_kelas ?? '-'})
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSummonsModalStudent(null);
                }}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                void handleSubmitSummons(e);
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold">Nomor Surat *</label>
                  <input
                    type="text"
                    value={letterNumber}
                    onChange={(e) => {
                      setLetterNumber(e.target.value);
                    }}
                    className="w-full rounded-xl border border-border bg-surface-container-low p-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold">Tanggal Surat *</label>
                  <input
                    type="date"
                    value={letterDate}
                    onChange={(e) => {
                      setLetterDate(e.target.value);
                    }}
                    className="w-full rounded-xl border border-border bg-surface-container-low p-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold">Jadwal Pertemuan *</label>
                  <input
                    type="datetime-local"
                    value={meetingDateTime}
                    onChange={(e) => {
                      setMeetingDateTime(e.target.value);
                    }}
                    className="w-full rounded-xl border border-border bg-surface-container-low p-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold">Ruangan *</label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => {
                      setRoom(e.target.value);
                    }}
                    className="w-full rounded-xl border border-border bg-surface-container-low p-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => {
                      setParentName(e.target.value);
                    }}
                    className="w-full rounded-xl border border-border bg-surface-container-low p-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold">No. WhatsApp Wali</label>
                  <input
                    type="text"
                    value={parentPhone}
                    onChange={(e) => {
                      setParentPhone(e.target.value);
                    }}
                    className="w-full rounded-xl border border-border bg-surface-container-low p-2"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block font-bold">Alasan / Agenda Pertemuan *</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                  }}
                  className="w-full rounded-xl border border-border bg-surface-container-low p-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSummonsModalStudent(null);
                  }}
                  className="rounded-xl border border-border px-4 py-2 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2 font-bold text-white hover:bg-pine-hover"
                >
                  <Calendar className="size-3.5 text-amber-gold" />
                  <span>Simpan Surat Panggilan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
