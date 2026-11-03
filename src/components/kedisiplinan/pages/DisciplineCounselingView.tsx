'use client';

import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  HeartHandshake,
  History,
  MessageSquare,
  PlusCircle,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from '@/libs/I18nNavigation';

type CounselingRecord = {
  id: string;
  date: string;
  studentName: string;
  studentClass: string;
  studentNis: string;
  counselorName: string;
  topic: string;
  category: 'disiplin' | 'sosial' | 'akademik';
  approach: string;
  studentCommitment: string;
  status: 'monitoring' | 'resolved';
  followupDate: string;
};

const initialCounselingRecords: CounselingRecord[] = [
  {
    id: 'c-1',
    date: '05 Okt 2026',
    studentName: 'Rizky Pratama',
    studentClass: 'Kelas IX A',
    studentNis: '00829103',
    counselorName: 'Dra. Nurhasanah (Guru BK)',
    topic: 'Klarifikasi & Mediasi Konflik Fisik di Area Kantin',
    category: 'sosial',
    approach: 'Restitusi Tiga Segitiga & Mediasi Empati Teman Sebaya',
    studentCommitment: 'Menyadari kesalahan, meminta maaf secara terbuka kepada pihak terkait, serta bersedia membantu piket kebersihan perpustakaan selama 3 hari sebagai wujud tanggung jawab.',
    status: 'monitoring',
    followupDate: '12 Okt 2026',
  },
  {
    id: 'c-2',
    date: '04 Okt 2026',
    studentName: 'Aldo Firmansyah',
    studentClass: 'Kelas VIII B',
    studentNis: '00829440',
    counselorName: 'Dra. Nurhasanah (Guru BK)',
    topic: 'Bimbingan Kelengkapan Atribut & Kebiasaan Disiplin Diri',
    category: 'disiplin',
    approach: 'Konseling Individual & Pembuatan Lembar Kontrak Diri',
    studentCommitment: 'Berkomitmen menyiapkan kelengkapan seragam (dasi & sabuk) di malam hari sebelum tidur, dengan paraf kontrol harian dari orang tua pada buku penghubung.',
    status: 'resolved',
    followupDate: 'Selesai',
  },
  {
    id: 'c-3',
    date: '02 Okt 2026',
    studentName: 'Fajar Maulana',
    studentClass: 'Kelas VIII A',
    studentNis: '00829311',
    counselorName: 'Sarah Rahma, S.Pd. & Guru BK',
    topic: 'Kecanduan Game Online & Penggunaan Smartphone Saat Belajar',
    category: 'akademik',
    approach: 'Restrukturisasi Kognitif & Manajemen Waktu Layar',
    studentCommitment: 'Smartphone dititipkan pada loker piket setiap pagi sebelum jam 07.00 WIB selama 2 pekan ke depan.',
    status: 'monitoring',
    followupDate: '09 Okt 2026',
  },
  {
    id: 'c-4',
    date: '28 Sep 2026',
    studentName: 'Dimas Saputra',
    studentClass: 'Kelas VIII A',
    studentNis: '00829103',
    counselorName: 'Dra. Nurhasanah (Guru BK)',
    topic: 'Motivasi Kesiapan Bangun Pagi & Manajemen Rute Bersekolah',
    category: 'disiplin',
    approach: 'Bimbingan Afektif & Solusi Kendaraan Bersama Orang Tua',
    studentCommitment: 'Bangun lebih awal pukul 05.00 WIB dan berangkat pukul 06.15 WIB.',
    status: 'resolved',
    followupDate: 'Selesai',
  },
];

/**
 * Page view for Guidance and Counseling (BK) student tracking and journal.
 *
 * @returns Rendered counseling screen.
 */
export function DisciplineCounselingView() {
  const [records, setRecords] = useState<CounselingRecord[]>(initialCounselingRecords);
  const [filterCategory, setFilterCategory] = useState<'all' | 'disiplin' | 'sosial' | 'akademik'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Record State
  const [newStudent, setNewStudent] = useState('Bagus Pamungkas');
  const [newClass, setNewClass] = useState('Kelas VIII A');
  const [newTopic, setNewTopic] = useState('Meninggalkan kelas tanpa izin dan evaluasi kejenuhan belajar');
  const [newApproach, setNewApproach] = useState('Konseling Individual & Kontrak Perilaku');
  const [newCommitment, setNewCommitment] = useState('Siswa berjanji melapor ke wali kelas sebelum keluar kelas.');

  const filtered = records.filter((r) => {
    if (filterCategory !== 'all' && r.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        r.studentName.toLowerCase().includes(q) ||
        r.topic.toLowerCase().includes(q) ||
        r.studentCommitment.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: CounselingRecord = {
      id: `c-${Date.now()}`,
      date: '05 Okt 2026',
      studentName: newStudent,
      studentClass: newClass,
      studentNis: '00829562',
      counselorName: 'Dra. Nurhasanah (Guru BK)',
      topic: newTopic,
      category: 'disiplin',
      approach: newApproach,
      studentCommitment: newCommitment,
      status: 'monitoring',
      followupDate: '12 Okt 2026',
    };
    setRecords([newEntry, ...records]);
    setIsModalOpen(false);
    showToast(`Jurnal sesi konseling untuk ${newStudent} berhasil disimpan.`);
  };

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
              <span className="text-muted-foreground">Jurnal Bimbingan Konseling</span>
            </div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-on-surface md:text-2xl">
              Rekam Jejak Bimbingan & Konseling (BK)
            </h1>
          </div>
        </div>

        <button
          className="inline-flex items-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
          onClick={() => setIsModalOpen(true)}
          type="button"
        >
          <PlusCircle className="size-3.5 text-amber-gold" />
          + Catat Sesi Konseling Baru
        </button>
      </div>

      {/* KPI Bento Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Sesi Bulan Ini</span>
            <MessageSquare className="size-4 text-pine-deep" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-on-surface">{records.length} Sesi</p>
          <span className="text-[11px] text-muted-foreground">Terdokumentasi lengkap di portal BK</span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-900">Restitusi Tuntas & Positif</span>
            <HeartHandshake className="size-4 text-emerald-700" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-emerald-900">
            {records.filter((r) => r.status === 'resolved').length} Kasus
          </p>
          <span className="text-[11px] font-medium text-emerald-700">Perilaku kembali sesuai tata tertib</span>
        </div>

        <div className="rounded-2xl border border-amber-gold/40 bg-amber-surface/60 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-900">Dalam Monitoring Lanjutan</span>
            <Clock className="size-4 text-amber-dark" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-amber-900">
            {records.filter((r) => r.status === 'monitoring').length} Siswa
          </p>
          <span className="text-[11px] font-medium text-amber-800">Evaluasi berkala 7–14 hari</span>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-xl border border-border bg-surface-card py-2 pr-4 pl-10 text-xs text-on-surface placeholder:text-muted-foreground focus:border-pine-deep focus:outline-hidden"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa, topik bimbingan, atau komitmen..."
            type="text"
            value={searchQuery}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterCategory === 'all'
                ? 'bg-pine-deep text-white shadow-xs'
                : 'border border-border bg-surface-card text-on-surface hover:border-pine-deep/40'
            }`}
            onClick={() => setFilterCategory('all')}
            type="button"
          >
            Semua Topik
          </button>
          <button
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterCategory === 'disiplin'
                ? 'bg-pine-deep text-white shadow-xs'
                : 'border border-border bg-surface-card text-on-surface hover:border-pine-deep/40'
            }`}
            onClick={() => setFilterCategory('disiplin')}
            type="button"
          >
            Kedisiplinan
          </button>
          <button
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterCategory === 'sosial'
                ? 'bg-pine-deep text-white shadow-xs'
                : 'border border-border bg-surface-card text-on-surface hover:border-pine-deep/40'
            }`}
            onClick={() => setFilterCategory('sosial')}
            type="button"
          >
            Sosial & Mediasi
          </button>
          <button
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterCategory === 'akademik'
                ? 'bg-pine-deep text-white shadow-xs'
                : 'border border-border bg-surface-card text-on-surface hover:border-pine-deep/40'
            }`}
            onClick={() => setFilterCategory('akademik')}
            type="button"
          >
            Kebiasaan Belajar
          </button>
        </div>
      </div>

      {/* Counseling Feed List */}
      <div className="space-y-4">
        {filtered.map((record) => (
          <div
            className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-pine-deep/30"
            key={record.id}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-pine-light font-bold text-pine-deep">
                  {record.studentName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-sm font-bold text-on-surface">
                      {record.studentName}
                    </h3>
                    <span className="rounded bg-surface-card px-2 py-0.5 text-[11px] font-semibold text-muted-foreground border border-border">
                      {record.studentClass} • NIS {record.studentNis}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        record.category === 'sosial'
                          ? 'bg-purple-100 text-purple-800'
                          : record.category === 'akademik'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-surface text-amber-dark border border-amber-gold/40'
                      }`}
                    >
                      {record.category === 'sosial' ? 'Mediasi Sosial' : record.category === 'akademik' ? 'Akademik' : 'Kedisiplinan'}
                    </span>
                  </div>
                  <p className="mt-1 font-semibold text-xs text-pine-deep">
                    Topik: {record.topic}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-right">
                {record.status === 'resolved' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="size-3 text-emerald-700" />
                    Kasus Selesai (Restoratif)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-gold/40 bg-amber-surface px-2.5 py-1 text-xs font-semibold text-amber-dark">
                    <Clock className="size-3" />
                    Monitoring s.d {record.followupDate}
                  </span>
                )}
              </div>
            </div>

            {/* Approach & Commitment Details */}
            <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-border bg-surface-card/60 p-4 text-xs md:grid-cols-2">
              <div>
                <span className="font-bold text-muted-foreground">Pendekatan / Layanan Konseling:</span>
                <p className="mt-0.5 text-on-surface">{record.approach}</p>
                <div className="mt-2 text-[11px] text-muted-foreground">
                  Konselor: <strong>{record.counselorName}</strong> • {record.date}
                </div>
              </div>

              <div>
                <span className="font-bold text-muted-foreground">Komitmen Siswa & Solusi Disepakati:</span>
                <p className="mt-0.5 text-on-surface italic">&ldquo;{record.studentCommitment}&rdquo;</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Catat Sesi Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg animate-in rounded-2xl border border-border bg-card p-6 shadow-2xl zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-heading text-base font-bold text-on-surface">
                Catat Sesi Bimbingan Konseling Baru
              </h3>
              <button
                className="rounded-lg p-1 text-muted-foreground hover:bg-surface-card hover:text-on-surface"
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                <X className="size-5" />
              </button>
            </div>

            <form className="mt-4 space-y-4 text-xs" onSubmit={handleCreateRecord}>
              <div>
                <label className="block font-semibold text-on-surface mb-1">Nama Siswa</label>
                <select
                  className="w-full rounded-xl border border-border bg-surface-card p-2.5 text-xs text-on-surface"
                  onChange={(e) => {
                    setNewStudent(e.target.value);
                    if (e.target.value.includes('Bagus')) setNewClass('Kelas VIII A');
                    if (e.target.value.includes('Rizky')) setNewClass('Kelas IX A');
                  }}
                  value={newStudent}
                >
                  <option value="Bagus Pamungkas">Bagus Pamungkas (Kelas VIII A)</option>
                  <option value="Rizky Pratama">Rizky Pratama (Kelas IX A)</option>
                  <option value="Dimas Saputra">Dimas Saputra (Kelas VIII A)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Topik Bimbingan</label>
                <input
                  className="w-full rounded-xl border border-border bg-surface-card p-2.5 text-xs text-on-surface"
                  onChange={(e) => setNewTopic(e.target.value)}
                  required
                  type="text"
                  value={newTopic}
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Pendekatan / Layanan Konseling</label>
                <input
                  className="w-full rounded-xl border border-border bg-surface-card p-2.5 text-xs text-on-surface"
                  onChange={(e) => setNewApproach(e.target.value)}
                  required
                  type="text"
                  value={newApproach}
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Komitmen & Solusi Restoratif Siswa</label>
                <textarea
                  className="w-full rounded-xl border border-border bg-surface-card p-2.5 text-xs text-on-surface"
                  onChange={(e) => setNewCommitment(e.target.value)}
                  required
                  rows={3}
                  value={newCommitment}
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-card"
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                >
                  Batal
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2 text-xs font-semibold text-white hover:opacity-95"
                  type="submit"
                >
                  <CheckCircle2 className="size-3.5 text-amber-gold" />
                  Simpan Sesi BK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
