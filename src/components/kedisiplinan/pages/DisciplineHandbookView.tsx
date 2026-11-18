'use client';

import {
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Download,
  FileText,
  Gavel,
  Printer,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from '@/libs/I18nNavigation';

type HandbookRule = {
  code: string;
  category: 'keterlambatan' | 'seragam' | 'tatatertib' | 'barang_terlarang' | 'bullying';
  categoryLabel: string;
  title: string;
  description: string;
  points: number;
  badgeClass: string;
  directSanction: string;
  authority: string;
};

const handbookRules: HandbookRule[] = [
  {
    code: 'K-01',
    category: 'keterlambatan',
    categoryLabel: 'Keterlambatan',
    title: 'Terlambat Masuk Apel Pagi',
    description: 'Tiba di sekolah setelah pukul 07.00 WIB saat apel pembiasaan pagi telah dimulai.',
    points: 2,
    badgeClass: 'bg-surface-card text-pine-deep border border-border',
    directSanction: 'Membaca Al-Qur\'an / tadarus 1 juz di gazebo piket & doa bersama.',
    authority: 'Guru Piket',
  },
  {
    code: 'K-02',
    category: 'keterlambatan',
    categoryLabel: 'Keterlambatan',
    title: 'Terlambat Masuk Jam Pelajaran',
    description: 'Terlambat masuk kelas setelah pergantian jam pelajaran atau istirahat lebih dari 10 menit.',
    points: 2,
    badgeClass: 'bg-surface-card text-pine-deep border border-border',
    directSanction: 'Mencatat materi tertinggal di bawah pengawasan guru mapel.',
    authority: 'Guru Mapel',
  },
  {
    code: 'S-01',
    category: 'seragam',
    categoryLabel: 'Atribut Seragam',
    title: 'Tidak Memakai Dasi / Bet Lokasi',
    description: 'Seragam tidak dilengkapi dasi resmi atau atribut badge lokasi dan lambang OSIS sekolah.',
    points: 3,
    badgeClass: 'bg-surface-card text-pine-deep border border-border',
    directSanction: 'Mencatat di buku piket & wajib melengkapi keesokan harinya.',
    authority: 'Kesiswaan',
  },
  {
    code: 'S-02',
    category: 'seragam',
    categoryLabel: 'Atribut Seragam',
    title: 'Sepatu atau Kaus Kaki Tidak Sesuai Ketentuan',
    description: 'Memakai sepatu selain warna hitam polos atau kaus kaki bukan putih standar pada hari upacara.',
    points: 3,
    badgeClass: 'bg-surface-card text-pine-deep border border-border',
    directSanction: 'Peringatan tertulis dan penggantian sementara bila tersedia.',
    authority: 'Wali Kelas',
  },
  {
    code: 'S-03',
    category: 'seragam',
    categoryLabel: 'Atribut Seragam',
    title: 'Rambut Tidak Rapi / Pewarnaan Rambut',
    description: 'Rambut putra melewati kerah atau telinga, atau rambut disemir dengan warna selain hitam alami.',
    points: 3,
    badgeClass: 'bg-surface-card text-pine-deep border border-border',
    directSanction: 'Batas waktu perapian 2x24 jam sebelum pemanggilan orang tua.',
    authority: 'Kesiswaan & BK',
  },
  {
    code: 'T-01',
    category: 'tatatertib',
    categoryLabel: 'Tata Tertib',
    title: 'Menggunakan Smartphone Saat Jam KBM',
    description: 'Bermain game, media sosial, atau menggunakan ponsel tanpa instruksi pembelajaran guru.',
    points: 5,
    badgeClass: 'bg-amber-surface text-amber-dark border border-amber-gold/40',
    directSanction: 'Penyitaan smartphone sementara dan penyerahan hanya kepada orang tua.',
    authority: 'Wali Kelas / BK',
  },
  {
    code: 'T-02',
    category: 'tatatertib',
    categoryLabel: 'Tata Tertib',
    title: 'Meninggalkan Lingkungan Sekolah Tanpa Izin (Bolos)',
    description: 'Keluar dari gerbang sekolah selama jam belajar tanpa surat izin guru piket atau UKS.',
    points: 10,
    badgeClass: 'bg-amber-surface text-amber-dark border border-amber-gold/40',
    directSanction: 'Surat teguran tertulis & pemanggilan orang tua.',
    authority: 'Kesiswaan',
  },
  {
    code: 'B-01',
    category: 'barang_terlarang',
    categoryLabel: 'Barang Terlarang',
    title: 'Membawa / Menghisap Rokok atau Vape',
    description: 'Membawa, menyimpan, atau menghisap rokok/vape di dalam lingkungan maupun sekitar sekolah saat berseragam.',
    points: 25,
    badgeClass: 'bg-error-container text-red-700 border border-red-200',
    directSanction: 'Penyitaan barang bukti, SP1 langsung, dan pemanggilan orang tua mendesak.',
    authority: 'Kesiswaan & Kepsek',
  },
  {
    code: 'B-02',
    category: 'barang_terlarang',
    categoryLabel: 'Barang Terlarang',
    title: 'Membawa Senjata Tajam / Benda Berbahaya',
    description: 'Membawa sajam, pemukul, atau barang berbahaya yang tidak terkait kegiatan belajar.',
    points: 50,
    badgeClass: 'bg-red-700 text-white',
    directSanction: 'Penyitaan, SP2 langsung, skorsing 3 hari & investigasi pleno.',
    authority: 'Tim Disiplin & Kepsek',
  },
  {
    code: 'E-01',
    category: 'bullying',
    categoryLabel: 'Etika & Bullying',
    title: 'Perkelahian / Tawuran Antar Pelajar',
    description: 'Terlibat dalam adu fisik, perkelahian di dalam/luar sekolah, atau provokasi bentrok kelompok.',
    points: 50,
    badgeClass: 'bg-red-700 text-white',
    directSanction: 'SP2/SP3 langsung, pemanggilan orang tua darurat, ganti rugi medis bila ada.',
    authority: 'Kepala Sekolah',
  },
  {
    code: 'E-02',
    category: 'bullying',
    categoryLabel: 'Etika & Bullying',
    title: 'Perundungan Fisik, Verbal, atau Cyberbullying',
    description: 'Melakukan intimidasi, pemerasan uang jajan, penghinaan martabat teman di medsos atau kelas.',
    points: 40,
    badgeClass: 'bg-red-700 text-white',
    directSanction: 'Sesi konseling intensif BK, penandatanganan pakta anti-bullying bersama orang tua.',
    authority: 'Tim Pencegahan Bullying & BK',
  },
];

/**
 * Page view for School Code of Conduct and Point Weights Catalog.
 *
 * @returns Rendered handbook screen.
 */
export function DisciplineHandbookView() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = [
    { key: 'all', label: 'Semua Kategori' },
    { key: 'keterlambatan', label: 'Keterlambatan (+2)' },
    { key: 'seragam', label: 'Atribut Seragam (+3)' },
    { key: 'tatatertib', label: 'Tata Tertib (+5 s.d +10)' },
    { key: 'barang_terlarang', label: 'Barang Terlarang (+25 s.d +50)' },
    { key: 'bullying', label: 'Etika & Bullying (+40 s.d +50)' },
  ];

  const filteredRules = handbookRules.filter((rule) => {
    if (selectedCategory !== 'all' && rule.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        rule.code.toLowerCase().includes(q) ||
        rule.title.toLowerCase().includes(q) ||
        rule.description.toLowerCase().includes(q) ||
        rule.directSanction.toLowerCase().includes(q)
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

  const handleDownloadPdf = () => {
    showToast('Mengunduh salinan resmi Buku Pedoman Tata Tertib Siswa (PDF)...');
  };

  const handlePrint = () => {
    window.print();
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
              <span className="text-muted-foreground">Buku Pedoman & Bobot Poin</span>
            </div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-on-surface md:text-2xl">
              Buku Pedoman Tata Tertib & Bobot Sanksi
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
            Cetak Pedoman
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
            onClick={handleDownloadPdf}
            type="button"
          >
            <Download className="size-3.5 text-amber-gold" />
            Unduh Salinan PDF
          </button>
        </div>
      </div>

      {/* Sanction Threshold Banners */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <ShieldAlert className="size-4 text-amber-gold" />
          <span>Ambang Batas Poin Akumulasi & Jenjang Sanksi Resmi</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="rounded bg-pine-light px-2 py-0.5 text-xs font-bold text-pine-deep">
                10 – 29 Poin
              </span>
              <FileText className="size-4 text-pine-deep" />
            </div>
            <h2 className="mt-2 text-sm font-bold text-on-surface">Peringatan Lisan</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Teguran edukatif oleh wali kelas, pencatatan di buku pembinaan kelas, dan target perbaikan sikap 1 pekan.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-gold/40 bg-amber-surface/60 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="rounded border border-amber-gold/40 bg-amber-gold px-2 py-0.5 text-xs font-bold text-pine-deep">
                30 – 49 Poin
              </span>
              <AlertTriangle className="size-4 text-amber-dark" />
            </div>
            <h2 className="mt-2 text-sm font-bold text-amber-900">Panggilan Orang Tua I</h2>
            <p className="mt-1 text-xs text-amber-800">
              Surat panggilan resmi kesiswaan kepada wali murid, sesi konseling BK, dan penandatanganan surat komitmen.
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50/70 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                50 – 74 Poin
              </span>
              <AlertOctagon className="size-4 text-red-700" />
            </div>
            <h2 className="mt-2 text-sm font-bold text-red-900">Surat Peringatan 1 (SP1)</h2>
            <p className="mt-1 text-xs text-red-700">
              Penerbitan SP1 resmi sekolah, skorsing pembinaan di rumah selama 3 hari, dan monitoring ketat perilaku.
            </p>
          </div>

          <div className="rounded-2xl border border-red-300 bg-red-100/60 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="rounded bg-red-800 px-2 py-0.5 text-xs font-bold text-white">
                ≥ 75 Poin
              </span>
              <Gavel className="size-4 text-red-800" />
            </div>
            <h2 className="mt-2 text-sm font-bold text-red-950">SP2 / SP3 & Pleno</h2>
            <p className="mt-1 text-xs text-red-800">
              Konferensi kasus tingkat pimpinan sekolah, SP2/SP3, hingga pengembalian siswa kepada orang tua/wali murid.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-xl border border-border bg-surface-card py-2 pr-4 pl-10 text-xs text-on-surface placeholder:text-muted-foreground focus:border-pine-deep focus:outline-hidden"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode pasal, nama pelanggaran, atau sanksi..."
            type="text"
            value={searchQuery}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((c) => {
            const active = selectedCategory === c.key;
            return (
              <button
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? 'bg-pine-deep text-white shadow-xs'
                    : 'border border-border bg-surface-card text-on-surface hover:border-pine-deep/40'
                }`}
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                type="button"
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Rules Catalog Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="border-b border-border bg-surface-card/60 px-6 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-pine-deep" />
            <h2 className="font-heading text-sm font-bold text-on-surface">
              Katalog Butir Pelanggaran & Sanksi Edukatif
            </h2>
            <span className="text-xs text-muted-foreground">({filteredRules.length} Butir Ditemukan)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="border-b border-border bg-surface-card/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3.5">Kode & Kategori</th>
                <th className="px-4 py-3.5">Nama & Uraian Pelanggaran</th>
                <th className="px-3 py-3.5 text-center">Bobot</th>
                <th className="px-6 py-3.5">Sanksi Edukatif / Konsekuensi</th>
                <th className="px-4 py-3.5">Pihak Berwenang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredRules.map((rule) => (
                <tr className="transition-colors hover:bg-surface-card/40" key={rule.code}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-pine-deep">{rule.code}</span>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{rule.categoryLabel}</div>
                  </td>

                  <td className="max-w-xs px-4 py-4">
                    <div className="font-semibold text-on-surface">{rule.title}</div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{rule.description}</p>
                  </td>

                  <td className="px-3 py-4 text-center whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${rule.badgeClass}`}>
                      +{rule.points} Poin
                    </span>
                  </td>

                  <td className="max-w-sm px-6 py-4">
                    <div className="text-xs font-medium text-on-surface">{rule.directSanction}</div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex rounded-md bg-surface-card px-2 py-1 text-[11px] font-semibold text-muted-foreground border border-border">
                      {rule.authority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
