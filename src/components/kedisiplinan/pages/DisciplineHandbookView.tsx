'use client';

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Download,
  Printer,
  Search,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { DisciplineViolationTypesModal } from '@/components/kedisiplinan/DisciplineViolationTypesModal';
import { Link } from '@/libs/I18nNavigation';
import { fetchViolationTypes } from '@/services/disciplineApi';
import type { ViolationTypeRecord } from '@/services/disciplineApi';

const categoryTitles: Record<string, string> = {
  atribut: 'Atribut Seragam',
  kerapihan: 'Kerapihan',
  perilaku: 'Perilaku & Tata Tertib',
  lainnya: 'Lainnya',
};

function getBadgeStyle(points: number): string {
  if (points >= 25) {
    return 'bg-red-700 text-white';
  }
  if (points >= 10) {
    return 'bg-red-100 text-red-700 border border-red-200';
  }
  if (points >= 5) {
    return 'bg-amber-surface text-amber-dark border border-amber-gold/40';
  }
  return 'bg-surface-card text-pine-deep border border-border';
}

/**
 * Interactive Discipline Handbook page with live violation type CRUD.
 *
 * @returns Rendered handbook page.
 */
export function DisciplineHandbookView() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [violationTypes, setViolationTypes] = useState<ViolationTypeRecord[]>([]);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadTypes = async () => {
    try {
      const data = await fetchViolationTypes(true);
      setViolationTypes(data);
    } catch {
      // Keep current list if offline.
    }
  };

  useEffect(() => {
    void loadTypes();
  }, []);

  const filteredRules = violationTypes.filter((rule) => {
    if (selectedCategory !== 'all' && rule.kategori !== selectedCategory) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        rule.kode.toLowerCase().includes(q) ||
        rule.nama.toLowerCase().includes(q) ||
        rule.kategori.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDownloadHandbook = () => {
    const lines = [
      'BUKU PEDOMAN TATA TERTIB & POIN KEDISIPLINAN SISWA',
      'SD ISLAM BAKTI ASIH',
      '======================================================',
      '',
      ...violationTypes.map(
        (r) => `[${r.kode}] ${r.nama} | Kategori: ${r.kategori} | Bobot: +${r.poin_default} Poin`,
      ),
    ].join('\n');
    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Buku_Pedoman_Tata_Tertib_SD_Islam_Bakti_Asih.txt');
    document.body.append(link);
    link.click();
    link.remove();
    showToast('Buku pedoman tata tertib SD Islam Bakti Asih berhasil diunduh.');
  };

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
              <span>Buku Pedoman Tata Tertib</span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              Buku Pedoman Tata Tertib & Bobot Poin SD Islam Bakti Asih
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setIsManageOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-pine-hover"
          >
            <SlidersHorizontal className="size-3.5 text-amber-gold" />
            <span>+ Kelola Kategori & Kode</span>
          </button>

          <button
            type="button"
            onClick={() => {
              window.print();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-2xs transition-colors hover:bg-muted"
          >
            <Printer className="size-3.5 text-pine-deep" />
            <span>Cetak</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadHandbook}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-2xs transition-colors hover:bg-muted"
          >
            <Download className="size-3.5 text-pine-deep" />
            <span>Unduh (.TXT)</span>
          </button>
        </div>
      </div>

      {/* Threshold Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <span className="text-xs font-bold text-pine-deep">15 – 29 Poin</span>
          <p className="mt-1 text-sm font-bold text-foreground">Pembinaan Wali Kelas</p>
          <p className="mt-1 text-xs text-muted-foreground">Teguran lisan & buku penghubung siswa.</p>
        </div>
        <div className="rounded-2xl border border-amber-gold/40 bg-amber-surface/40 p-4 shadow-xs">
          <span className="text-xs font-bold text-amber-dark">30 – 49 Poin</span>
          <p className="mt-1 text-sm font-bold text-foreground">Panggilan Orang Tua</p>
          <p className="mt-1 text-xs text-muted-foreground">Surat pemanggilan resmi ke Ruang BK.</p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50/40 p-4 shadow-xs">
          <span className="text-xs font-bold text-red-700">50 – 74 Poin</span>
          <p className="mt-1 text-sm font-bold text-foreground">Surat Peringatan 1 (SP1)</p>
          <p className="mt-1 text-xs text-muted-foreground">Pembinaan intensif bersama Kepala Sekolah.</p>
        </div>
        <div className="rounded-2xl border border-red-300 bg-red-100/50 p-4 shadow-xs">
          <span className="text-xs font-bold text-red-800">≥ 75 Poin</span>
          <p className="mt-1 text-sm font-bold text-foreground">SP2 / Evaluasi Khusus</p>
          <p className="mt-1 text-xs text-muted-foreground">Skorsing pembinaan karakter & konferensi kasus.</p>
        </div>
      </div>

      {/* Search & Category Tabs */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'atribut', label: 'Atribut Seragam' },
            { id: 'kerapihan', label: 'Kerapihan' },
            { id: 'perilaku', label: 'Perilaku & Tata Tertib' },
            { id: 'lainnya', label: 'Lainnya' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-pine-deep text-white'
                  : 'border border-border bg-surface-container-low text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.label}
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
            placeholder="Cari kode (ATR-01) atau nama aturan..."
            className="w-full bg-transparent text-xs focus:outline-hidden"
          />
        </label>
      </div>

      {/* Rules Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="flex items-center justify-between border-b border-border bg-surface-container-low px-6 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-pine-deep" />
            <h2 className="text-sm font-bold text-foreground">
              Daftar Kode & Aturan Pelanggaran ({filteredRules.length})
            </h2>
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ShieldAlert className="size-3.5 text-amber-dark" />
            Tersinkron dengan database backend
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-container-low text-[11px] font-bold text-muted-foreground uppercase">
                <th className="px-6 py-3">Kode</th>
                <th className="px-4 py-3">Nama Pelanggaran</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Bobot Poin</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-surface-container-low/60">
                  <td className="px-6 py-3.5 font-mono font-bold text-pine-deep">{rule.kode}</td>
                  <td className="px-4 py-3.5 font-semibold text-foreground">{rule.nama}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {categoryTitles[rule.kategori] ?? rule.kategori}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-lg px-2.5 py-0.5 font-bold ${getBadgeStyle(rule.poin_default)}`}>
                      +{rule.poin_default} Poin
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    {rule.is_active ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                        Aktif
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        Nonaktif
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRules.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-muted-foreground">
                    Tidak ada aturan yang sesuai pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DisciplineViolationTypesModal
        isOpen={isManageOpen}
        violationTypes={violationTypes}
        onClose={() => {
          setIsManageOpen(false);
        }}
        onChanged={() => {
          void loadTypes();
        }}
        onNotify={showToast}
      />
    </div>
  );
}
