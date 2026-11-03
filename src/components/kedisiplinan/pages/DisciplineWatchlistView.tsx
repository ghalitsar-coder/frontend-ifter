'use client';

import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Mail,
  Printer,
  ShieldAlert,
  UserCheck,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from '@/libs/I18nNavigation';

type WatchStudent = {
  id: string;
  name: string;
  nis: string;
  className: string;
  points: number;
  statusLabel: string;
  riskLevel: 'waspada' | 'tinggi' | 'kritis';
  lastViolation: string;
  lastDate: string;
  homeroom: string;
  counselor: string;
  parentName: string;
};

const initialWatchlist: WatchStudent[] = [
  {
    id: 'w-1',
    name: 'Rizky Pratama',
    nis: '00829103',
    className: 'Kelas IX A',
    points: 42,
    statusLabel: 'Menunggu Sanksi SP1 (42 Poin)',
    riskLevel: 'tinggi',
    lastViolation: 'Terlibat perkelahian di area kantin belakang',
    lastDate: '05 Okt 2026',
    homeroom: 'Sarah Rahma, S.Pd.',
    counselor: 'Dra. Nurhasanah (BK)',
    parentName: 'Hendra Pratama',
  },
  {
    id: 'w-2',
    name: 'Fajar Maulana',
    nis: '00829311',
    className: 'Kelas VIII A',
    points: 32,
    statusLabel: 'Ambang Panggilan Ortu 1 (32 Poin)',
    riskLevel: 'waspada',
    lastViolation: 'Bermain game online di smartphone saat KBM',
    lastDate: '05 Okt 2026',
    homeroom: 'Sarah Rahma, S.Pd.',
    counselor: 'Dra. Nurhasanah (BK)',
    parentName: 'Joko Susilo',
  },
  {
    id: 'w-3',
    name: 'Aldo Firmansyah',
    nis: '00829440',
    className: 'Kelas VIII B',
    points: 30,
    statusLabel: 'Baru Capai Ambang (30 Poin)',
    riskLevel: 'waspada',
    lastViolation: 'Tidak memakai dasi dan ikat pinggang saat upacara',
    lastDate: '04 Okt 2026',
    homeroom: 'Bambang Irawan, S.Pd.',
    counselor: 'Dra. Nurhasanah (BK)',
    parentName: 'Rahmat Hidayat',
  },
];

/**
 * Page view for watchlist monitoring students reaching sanction thresholds (>=30 points).
 *
 * @returns Rendered watchlist monitoring screen.
 */
export function DisciplineWatchlistView() {
  const [watchlist] = useState<WatchStudent[]>(initialWatchlist);
  const [filterTab, setFilterTab] = useState<'all' | 'panggilan' | 'sp1'>('all');
  const [selectedStudentForLetter, setSelectedStudentForLetter] = useState<WatchStudent | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filtered = watchlist.filter((s) => {
    if (filterTab === 'panggilan') return s.points >= 30 && s.points < 40;
    if (filterTab === 'sp1') return s.points >= 40;
    return true;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSendLetter = (student: WatchStudent) => {
    setSelectedStudentForLetter(student);
  };

  const handleConfirmSendLetter = () => {
    if (!selectedStudentForLetter) return;
    showToast(`Surat panggilan resmi untuk wali murid ${selectedStudentForLetter.name} berhasil diterbitkan.`);
    setSelectedStudentForLetter(null);
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

      {/* Header and Back Link */}
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
              <span className="text-muted-foreground">Monitoring Siswa Waspada</span>
            </div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-on-surface md:text-2xl">
              Siswa Waspada & Ambang Batas SP
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
            <ShieldAlert className="size-3.5" />
            Ambang Panggilan: ≥ 30 Poin
          </span>
        </div>
      </div>

      {/* KPI 4 Bento Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Siswa Waspada</span>
            <AlertTriangle className="size-4 text-amber-gold" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-on-surface">{watchlist.length}</p>
          <span className="text-[11px] text-muted-foreground">Perlu intervensi wali kelas</span>
        </div>

        <div className="rounded-2xl border border-amber-gold/40 bg-amber-surface/60 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-900">Ambang Panggilan 1 (30–39)</span>
            <Mail className="size-4 text-amber-dark" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-amber-900">2 Siswa</p>
          <span className="text-[11px] font-medium text-amber-800">Fajar M. & Aldo F.</span>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50/70 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-red-800">Mendekati SP1 (≥40 Poin)</span>
            <ShieldAlert className="size-4 text-red-700" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-red-900">1 Siswa</p>
          <span className="text-[11px] font-medium text-red-700">Rizky Pratama (42 Poin)</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Kasus Selesai Restoratif</span>
            <UserCheck className="size-4 text-emerald-700" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-emerald-900">5 Siswa</p>
          <span className="text-[11px] text-muted-foreground">Poin kembali ke ambang aman</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border text-xs font-semibold">
        <button
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            filterTab === 'all'
              ? 'border-pine-deep text-pine-deep font-bold'
              : 'border-transparent text-muted-foreground hover:text-on-surface'
          }`}
          onClick={() => setFilterTab('all')}
          type="button"
        >
          Semua Siswa Waspada ({watchlist.length})
        </button>
        <button
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            filterTab === 'panggilan'
              ? 'border-pine-deep text-pine-deep font-bold'
              : 'border-transparent text-muted-foreground hover:text-on-surface'
          }`}
          onClick={() => setFilterTab('panggilan')}
          type="button"
        >
          Ambang Panggilan Ortu (30–39 Poin)
        </button>
        <button
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            filterTab === 'sp1'
              ? 'border-pine-deep text-pine-deep font-bold'
              : 'border-transparent text-muted-foreground hover:text-on-surface'
          }`}
          onClick={() => setFilterTab('sp1')}
          type="button"
        >
          Mendekati SP1 (≥40 Poin)
        </button>
      </div>

      {/* Watchlist Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="border-b border-border bg-surface-card/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3.5">Nama & Rombel Siswa</th>
                <th className="px-4 py-3.5">Akumulasi Poin</th>
                <th className="px-6 py-3.5">Pelanggaran Terakhir</th>
                <th className="px-4 py-3.5">Status Peringatan</th>
                <th className="px-4 py-3.5">Pendamping BK</th>
                <th className="px-6 py-3.5 text-right">Tindakan Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((student) => {
                const percent = Math.min(100, Math.round((student.points / 75) * 100));

                return (
                  <tr className="transition-colors hover:bg-surface-card/40" key={student.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-9 items-center justify-center rounded-xl font-bold text-xs ${
                            student.points >= 40
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-amber-surface text-amber-dark border border-amber-gold/40'
                          }`}
                        >
                          {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-on-surface">{student.name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {student.className} • NIS {student.nis}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-base font-bold text-red-700">
                          {student.points}
                        </span>
                        <span className="text-[11px] text-muted-foreground">/ 75 SP3</span>
                      </div>
                      <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-border">
                        <div
                          className={`h-full transition-all ${
                            student.points >= 40 ? 'bg-red-600' : 'bg-amber-gold'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </td>

                    <td className="max-w-xs px-6 py-4">
                      <div className="text-xs text-on-surface">{student.lastViolation}</div>
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="size-3" />
                        {student.lastDate}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          student.points >= 40
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'border border-amber-gold/40 bg-amber-surface text-amber-dark'
                        }`}
                      >
                        {student.statusLabel}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-xs font-medium text-on-surface">{student.counselor}</div>
                      <div className="text-[11px] text-muted-foreground">Wali: {student.homeroom}</div>
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-on-surface shadow-xs transition-colors hover:bg-surface-card"
                          onClick={() => handleSendLetter(student)}
                          type="button"
                        >
                          <Mail className="size-3.5 text-amber-gold" />
                          Surat Panggilan
                        </button>
                        <button
                          className="inline-flex items-center gap-1 rounded-lg bg-pine-deep px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-95"
                          onClick={() => showToast(`Sesi konseling BK untuk ${student.name} dijadwalkan pada Kamis, 08 Okt 2026.`)}
                          type="button"
                        >
                          <Calendar className="size-3.5 text-amber-gold" />
                          Jadwal BK
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Summons Letter Preview Modal */}
      {selectedStudentForLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl animate-in rounded-2xl border border-border bg-card p-6 shadow-2xl zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-pine-deep" />
                <h3 className="font-heading text-base font-bold text-on-surface">
                  Pratinjau Surat Pemanggilan Orang Tua / Wali
                </h3>
              </div>
              <button
                className="rounded-lg p-1 text-muted-foreground hover:bg-surface-card hover:text-on-surface"
                onClick={() => setSelectedStudentForLetter(null)}
                type="button"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 rounded-xl border border-border bg-surface-card/60 p-5 text-xs leading-relaxed text-on-surface">
              {/* Header Surat */}
              <div className="border-b border-border/80 pb-3 text-center">
                <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-pine-deep">
                  SD / SMP Islam Bakti Asih
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Badan Pembina Pendidikan Kesiswaan & Bimbingan Konseling (BK)
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  Nomor: 042/SMP-BA/KESISWAAN/X/2026 • Hal: Pemanggilan Orang Tua
                </p>
              </div>

              {/* Isi Surat */}
              <div className="space-y-2">
                <p>Kepada Yth. Bapak/Ibu Wali dari:</p>
                <div className="rounded-lg bg-card p-3 border border-border space-y-1">
                  <div className="font-semibold text-on-surface">{selectedStudentForLetter.name} ({selectedStudentForLetter.className})</div>
                  <div className="text-[11px] text-muted-foreground">NIS: {selectedStudentForLetter.nis} • Akumulasi Poin: <span className="font-bold text-red-700">+{selectedStudentForLetter.points} Poin</span></div>
                  <div className="text-[11px] text-muted-foreground">Catatan Terakhir: {selectedStudentForLetter.lastViolation}</div>
                </div>

                <p>
                  Mengharap kehadiran Bapak/Ibu ke sekolah guna koordinasi dan pembinaan bersama pada:
                </p>
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-card p-2.5 border border-border text-[11px]">
                  <div><strong>Hari / Tanggal:</strong> Kamis, 08 Okt 2026</div>
                  <div><strong>Pukul:</strong> 09.00 – 10.30 WIB</div>
                  <div><strong>Tempat:</strong> Ruang Bimbingan Konseling (BK)</div>
                  <div><strong>Menghadap:</strong> Tim Kesiswaan & Wali Kelas</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-card"
                onClick={() => setSelectedStudentForLetter(null)}
                type="button"
              >
                Batal
              </button>
              <button
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-card"
                onClick={() => window.print()}
                type="button"
              >
                <Printer className="size-3.5 text-pine-deep" />
                Cetak Dokumen
              </button>
              <button
                className="inline-flex items-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-95"
                onClick={handleConfirmSendLetter}
                type="button"
              >
                <Mail className="size-3.5 text-amber-gold" />
                Terbitkan & Kirim Surat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
