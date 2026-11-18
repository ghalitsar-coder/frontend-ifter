'use client';

import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Mail,
  MapPin,
  PlusCircle,
  Printer,
  Send,
  User,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from '@/libs/I18nNavigation';

type SummonsLetter = {
  id: string;
  letterNumber: string;
  studentName: string;
  studentClass: string;
  studentNis: string;
  parentName: string;
  reason: string;
  pointsAccumulated: number;
  scheduledDate: string;
  scheduledTime: string;
  room: string;
  counselor: string;
  status: 'draft' | 'sent' | 'completed' | 'no_show';
};

const initialLetters: SummonsLetter[] = [
  {
    id: 'let-1',
    letterNumber: '042/SMP-BA/KESISWAAN/X/2026',
    studentName: 'Rizky Pratama',
    studentClass: 'Kelas IX A',
    studentNis: '00829103',
    parentName: 'Hendra Pratama',
    reason: 'Akumulasi Poin Pelanggaran Mencapai 42 Poin (Kasus Perkelahian di Kantin)',
    pointsAccumulated: 42,
    scheduledDate: 'Kamis, 08 Okt 2026',
    scheduledTime: '09:00 WIB',
    room: 'Ruang Bimbingan Konseling (BK)',
    counselor: 'Ibu Rina, S.Pd. & Dra. Nurhasanah',
    status: 'draft',
  },
  {
    id: 'let-2',
    letterNumber: '041/SMP-BA/KESISWAAN/X/2026',
    studentName: 'Fajar Maulana',
    studentClass: 'Kelas VIII A',
    studentNis: '00829311',
    parentName: 'Joko Susilo',
    reason: 'Ambang Batas Poin 32 Poin (Pelanggaran Penggunaan Smartphone Saat KBM)',
    pointsAccumulated: 32,
    scheduledDate: 'Rabu, 07 Okt 2026',
    scheduledTime: '10:15 WIB',
    room: 'Ruang Kesiswaan & Tata Tertib',
    counselor: 'Sarah Rahma, S.Pd. (Wali Kelas)',
    status: 'sent',
  },
  {
    id: 'let-3',
    letterNumber: '039/SMP-BA/KESISWAAN/IX/2026',
    studentName: 'Aldo Firmansyah',
    studentClass: 'Kelas VIII B',
    studentNis: '00829440',
    parentName: 'Rahmat Hidayat',
    reason: 'Konseling Restoratif Ketertiban Atribut Seragam',
    pointsAccumulated: 30,
    scheduledDate: 'Senin, 28 Sep 2026',
    scheduledTime: '08:30 WIB',
    room: 'Ruang Bimbingan Konseling (BK)',
    counselor: 'Dra. Nurhasanah (BK)',
    status: 'completed',
  },
  {
    id: 'let-4',
    letterNumber: '038/SMP-BA/KESISWAAN/IX/2026',
    studentName: 'Bagus Pamungkas',
    studentClass: 'Kelas VIII A',
    studentNis: '00829562',
    parentName: 'Siti Rohimah',
    reason: 'Klarifikasi Meninggalkan Kelas Tanpa Izin',
    pointsAccumulated: 10,
    scheduledDate: 'Jumat, 25 Sep 2026',
    scheduledTime: '13:30 WIB',
    room: 'Ruang Kesiswaan',
    counselor: 'Ibu Rina, S.Pd.',
    status: 'completed',
  },
];

/**
 * Page view for parent summons letter management and tracking.
 *
 * @returns Rendered summons management screen.
 */
export function DisciplineSummonsView() {
  const [letters, setLetters] = useState<SummonsLetter[]>(initialLetters);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'sent' | 'completed'>('all');
  const [selectedLetter, setSelectedLetter] = useState<SummonsLetter | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Summons Form State
  const [newStudentName, setNewStudentName] = useState('Dimas Saputra');
  const [newStudentClass, setNewStudentClass] = useState('Kelas VIII A');
  const [newParentName, setNewParentName] = useState('Bambang Sutrisno');
  const [newReason, setNewReason] = useState('Keterlambatan berulang apel pagi lebih dari 3 kali');
  const [newDate, setNewDate] = useState('2026-10-10');
  const [newTime, setNewTime] = useState('09:00');

  const filteredLetters = letters.filter((l) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleMarkSent = (id: string) => {
    setLetters((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'sent' as const } : l)),
    );
    showToast('Status surat diperbarui menjadi: Terkirim ke Wali Murid.');
  };

  const handleMarkCompleted = (id: string) => {
    setLetters((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'completed' as const } : l)),
    );
    showToast('Pertemuan wali murid selesai dilaksanakan & dicatat di buku konseling.');
  };

  const handleCreateLetter = (e: React.FormEvent) => {
    e.preventDefault();
    const newLetter: SummonsLetter = {
      id: `let-${Date.now()}`,
      letterNumber: `04${letters.length + 1}/SMP-BA/KESISWAAN/X/2026`,
      studentName: newStudentName,
      studentClass: newStudentClass,
      studentNis: '00829199',
      parentName: newParentName,
      reason: newReason,
      pointsAccumulated: 25,
      scheduledDate: newDate,
      scheduledTime: `${newTime} WIB`,
      room: 'Ruang Bimbingan Konseling (BK)',
      counselor: 'Ibu Rina, S.Pd.',
      status: 'draft',
    };
    setLetters([newLetter, ...letters]);
    setIsNewModalOpen(false);
    showToast('Surat panggilan orang tua baru berhasil diterbitkan.');
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
              <span className="text-muted-foreground">Pemanggilan Orang Tua</span>
            </div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-on-surface md:text-2xl">
              Manajemen Surat Pemanggilan Orang Tua
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-on-surface shadow-xs transition-colors hover:bg-surface-card"
            onClick={() => showToast('Mengekspor rekapitulasi antrean surat panggilan...')}
            type="button"
          >
            <FileSpreadsheet className="size-3.5 text-pine-deep" />
            Ekspor Rekap
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
            onClick={() => setIsNewModalOpen(true)}
            type="button"
          >
            <PlusCircle className="size-3.5 text-amber-gold" />
            + Buat Surat Panggilan Baru
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Surat Diterbitkan</span>
            <FileText className="size-4 text-pine-deep" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-on-surface">{letters.length}</p>
          <span className="text-[11px] text-muted-foreground">Semester ganjil aktif</span>
        </div>

        <div className="rounded-2xl border border-amber-gold/40 bg-amber-surface/60 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-900">Menunggu TTD / Dikirim</span>
            <Mail className="size-4 text-amber-dark" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-amber-900">
            {letters.filter((l) => l.status === 'draft').length} Surat
          </p>
          <span className="text-[11px] font-medium text-amber-800">Perlu pengesahan kepala kesiswaan</span>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-900">Menunggu Kehadiran</span>
            <Clock className="size-4 text-blue-700" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-blue-900">
            {letters.filter((l) => l.status === 'sent').length} Wali
          </p>
          <span className="text-[11px] font-medium text-blue-700">Telah dikirim via pos/WA</span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-900">Selesai Pertemuan</span>
            <FileCheck2 className="size-4 text-emerald-700" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-emerald-900">
            {letters.filter((l) => l.status === 'completed').length} Kasus
          </p>
          <span className="text-[11px] font-medium text-emerald-700">Restorasi disepakati</span>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex border-b border-border text-xs font-semibold">
        <button
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            statusFilter === 'all'
              ? 'border-pine-deep text-pine-deep font-bold'
              : 'border-transparent text-muted-foreground hover:text-on-surface'
          }`}
          onClick={() => setStatusFilter('all')}
          type="button"
        >
          Semua Surat ({letters.length})
        </button>
        <button
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            statusFilter === 'draft'
              ? 'border-pine-deep text-pine-deep font-bold'
              : 'border-transparent text-muted-foreground hover:text-on-surface'
          }`}
          onClick={() => setStatusFilter('draft')}
          type="button"
        >
          Menunggu Dikirim ({letters.filter((l) => l.status === 'draft').length})
        </button>
        <button
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            statusFilter === 'sent'
              ? 'border-pine-deep text-pine-deep font-bold'
              : 'border-transparent text-muted-foreground hover:text-on-surface'
          }`}
          onClick={() => setStatusFilter('sent')}
          type="button"
        >
          Menunggu Kehadiran ({letters.filter((l) => l.status === 'sent').length})
        </button>
        <button
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            statusFilter === 'completed'
              ? 'border-pine-deep text-pine-deep font-bold'
              : 'border-transparent text-muted-foreground hover:text-on-surface'
          }`}
          onClick={() => setStatusFilter('completed')}
          type="button"
        >
          Selesai Konseling ({letters.filter((l) => l.status === 'completed').length})
        </button>
      </div>

      {/* Summons List Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="border-b border-border bg-surface-card/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3.5">Nomor & Tanggal Surat</th>
                <th className="px-4 py-3.5">Siswa & Wali Murid</th>
                <th className="px-6 py-3.5">Alasan / Agenda Menghadap</th>
                <th className="px-4 py-3.5">Jadwal & Ruangan</th>
                <th className="px-3 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredLetters.map((letter) => (
                <tr className="transition-colors hover:bg-surface-card/40" key={letter.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-pine-deep">{letter.letterNumber}</span>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{letter.scheduledDate}</div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="font-semibold text-on-surface">{letter.studentName}</div>
                    <div className="text-[11px] text-muted-foreground">{letter.studentClass}</div>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-pine-deep font-medium">
                      <User className="size-3" />
                      Wali: {letter.parentName}
                    </div>
                  </td>

                  <td className="max-w-xs px-6 py-4">
                    <div className="line-clamp-2 text-xs text-on-surface">{letter.reason}</div>
                    <div className="mt-1">
                      <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                        Akumulasi: +{letter.pointsAccumulated} Poin
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 font-semibold text-on-surface">
                      <Clock className="size-3 text-pine-deep" />
                      {letter.scheduledTime}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="size-3" />
                      {letter.room}
                    </div>
                  </td>

                  <td className="px-3 py-4 text-center whitespace-nowrap">
                    {letter.status === 'draft' && (
                      <span className="inline-flex rounded-full border border-amber-gold/40 bg-amber-surface px-2.5 py-0.5 text-[11px] font-semibold text-amber-dark">
                        Menunggu Dikirim
                      </span>
                    )}
                    {letter.status === 'sent' && (
                      <span className="inline-flex rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800">
                        Telah Dikirim
                      </span>
                    )}
                    {letter.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                        <CheckCircle2 className="size-3" />
                        Selesai Konseling
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-on-surface hover:bg-surface-card"
                        onClick={() => setSelectedLetter(letter)}
                        type="button"
                      >
                        <Eye className="size-3.5 text-pine-deep" />
                        Pratinjau
                      </button>

                      {letter.status === 'draft' && (
                        <button
                          className="inline-flex items-center gap-1 rounded-lg bg-pine-deep px-2.5 py-1.5 text-xs font-semibold text-white hover:opacity-95"
                          onClick={() => handleMarkSent(letter.id)}
                          type="button"
                        >
                          <Send className="size-3.5 text-amber-gold" />
                          Kirim Surat
                        </button>
                      )}

                      {letter.status === 'sent' && (
                        <button
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:opacity-95"
                          onClick={() => handleMarkCompleted(letter.id)}
                          type="button"
                        >
                          <CheckCircle2 className="size-3.5 text-white" />
                          Tandai Hadir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pratinjau Surat */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl animate-in rounded-2xl border border-border bg-card p-6 shadow-2xl zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-pine-deep" />
                <h3 className="font-heading text-base font-bold text-on-surface">
                  Pratinjau Surat Pemanggilan Resmi
                </h3>
              </div>
              <button
                className="rounded-lg p-1 text-muted-foreground hover:bg-surface-card hover:text-on-surface"
                onClick={() => setSelectedLetter(null)}
                type="button"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 rounded-xl border border-border bg-surface-card/60 p-5 text-xs leading-relaxed text-on-surface">
              <div className="border-b border-border/80 pb-3 text-center">
                <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-pine-deep">
                  SD / SMP Islam Bakti Asih
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Bidang Kesiswaan & Layanan Bimbingan Konseling (BK)
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  Nomor: {selectedLetter.letterNumber} • Sifat: Rahasia / Penting
                </p>
              </div>

              <div className="space-y-2">
                <p>Kepada Yth. Bapak/Ibu Wali dari <strong>{selectedLetter.studentName}</strong> ({selectedLetter.studentClass}):</p>
                <p>
                  Berdasarkan evaluasi kedisiplinan semester berjalan, siswa yang bersangkutan telah mencapai akumulasi{' '}
                  <span className="font-bold text-red-700">+{selectedLetter.pointsAccumulated} Poin</span> atas catatan:
                </p>
                <div className="rounded-lg bg-card p-3 border border-border italic text-[11px]">
                  &ldquo;{selectedLetter.reason}&rdquo;
                </div>
                <p>Maka kami mengundang kehadiran Bapak/Ibu pada:</p>
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-card p-3 border border-border text-[11px]">
                  <div><strong>Hari / Tanggal:</strong> {selectedLetter.scheduledDate}</div>
                  <div><strong>Waktu:</strong> {selectedLetter.scheduledTime}</div>
                  <div><strong>Ruangan:</strong> {selectedLetter.room}</div>
                  <div><strong>Pendamping:</strong> {selectedLetter.counselor}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-card"
                onClick={() => setSelectedLetter(null)}
                type="button"
              >
                Tutup
              </button>
              <button
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-card"
                onClick={() => window.print()}
                type="button"
              >
                <Printer className="size-3.5 text-pine-deep" />
                Cetak Surat
              </button>
              <button
                className="inline-flex items-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2 text-xs font-semibold text-white hover:opacity-95"
                onClick={() => {
                  showToast('Tautan surat panggilan telah dikirimkan ke kontak WhatsApp wali murid.');
                  setSelectedLetter(null);
                }}
                type="button"
              >
                <Send className="size-3.5 text-amber-gold" />
                Kirim via WhatsApp Wali
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Terbitkan Surat Baru */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg animate-in rounded-2xl border border-border bg-card p-6 shadow-2xl zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-heading text-base font-bold text-on-surface">
                Terbitkan Surat Panggilan Orang Tua Baru
              </h3>
              <button
                className="rounded-lg p-1 text-muted-foreground hover:bg-surface-card hover:text-on-surface"
                onClick={() => setIsNewModalOpen(false)}
                type="button"
              >
                <X className="size-5" />
              </button>
            </div>

            <form className="mt-4 space-y-4 text-xs" onSubmit={handleCreateLetter}>
              <div>
                <label className="block font-semibold text-on-surface mb-1">Pilih Siswa</label>
                <select
                  className="w-full rounded-xl border border-border bg-surface-card p-2.5 text-xs text-on-surface"
                  onChange={(e) => {
                    setNewStudentName(e.target.value);
                    if (e.target.value.includes('Dimas')) setNewStudentClass('Kelas VIII A');
                    if (e.target.value.includes('Bayu')) setNewStudentClass('Kelas IX A');
                  }}
                  value={newStudentName}
                >
                  <option value="Dimas Saputra">Dimas Saputra (Kelas VIII A - 00829103)</option>
                  <option value="Bayu Nugroho">Bayu Nugroho (Kelas IX A - 00829215)</option>
                  <option value="Farhan Ramadhan">Farhan Ramadhan (Kelas IX A - 00829330)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Nama Orang Tua / Wali Murid</label>
                <input
                  className="w-full rounded-xl border border-border bg-surface-card p-2.5 text-xs text-on-surface"
                  onChange={(e) => setNewParentName(e.target.value)}
                  required
                  type="text"
                  value={newParentName}
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Alasan / Pokok Perkara Pemanggilan</label>
                <textarea
                  className="w-full rounded-xl border border-border bg-surface-card p-2.5 text-xs text-on-surface"
                  onChange={(e) => setNewReason(e.target.value)}
                  required
                  rows={2}
                  value={newReason}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Tanggal Menghadap</label>
                  <input
                    className="w-full rounded-xl border border-border bg-surface-card p-2.5 text-xs text-on-surface"
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    type="date"
                    value={newDate}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Waktu</label>
                  <input
                    className="w-full rounded-xl border border-border bg-surface-card p-2.5 text-xs text-on-surface"
                    onChange={(e) => setNewTime(e.target.value)}
                    required
                    type="time"
                    value={newTime}
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-card"
                  onClick={() => setIsNewModalOpen(false)}
                  type="button"
                >
                  Batal
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2 text-xs font-semibold text-white hover:opacity-95"
                  type="submit"
                >
                  <Send className="size-3.5 text-amber-gold" />
                  Simpan & Terbitkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
