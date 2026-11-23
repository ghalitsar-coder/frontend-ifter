'use client';

import { Pencil, Plus, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import {
  createViolationType,
  deleteViolationType,
  DisciplineApiError,
  updateViolationType,
} from '@/services/disciplineApi';
import type { ViolationTypeRecord } from '@/services/disciplineApi';

type CategoryOption = 'atribut' | 'kerapihan' | 'perilaku' | 'lainnya';

const categoryLabels: Record<CategoryOption, string> = {
  atribut: 'Atribut Seragam',
  kerapihan: 'Kerapihan',
  perilaku: 'Perilaku & Tata Tertib',
  lainnya: 'Lainnya',
};

/**
 * CRUD modal for managing school violation types and point rules.
 *
 * @param props - Component properties.
 * @returns Rendered violation types manager modal.
 */
export function DisciplineViolationTypesModal(props: {
  isOpen: boolean;
  onChanged: () => void;
  onClose: () => void;
  onNotify: (message: string) => void;
  violationTypes: ViolationTypeRecord[];
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [kode, setKode] = useState('');
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState<CategoryOption>('atribut');
  const [poinDefault, setPoinDefault] = useState(3);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!props.isOpen) {
    return null;
  }

  const resetForm = () => {
    setEditingId(null);
    setKode('');
    setNama('');
    setKategori('atribut');
    setPoinDefault(3);
    setIsActive(true);
    setErrorMsg(null);
  };

  const handleStartEdit = (vt: ViolationTypeRecord) => {
    setEditingId(vt.id);
    setKode(vt.kode);
    setNama(vt.nama);
    const k = vt.kategori;
    if (k === 'atribut' || k === 'kerapihan' || k === 'perilaku' || k === 'lainnya') {
      setKategori(k);
    } else {
      setKategori('lainnya');
    }
    setPoinDefault(vt.poin_default);
    setIsActive(vt.is_active);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!kode.trim() || !nama.trim()) {
      setErrorMsg('Kode dan nama jenis pelanggaran wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        kode: kode.trim().toUpperCase(),
        nama: nama.trim(),
        kategori,
        poin_default: Math.max(0, Number(poinDefault) || 0),
        is_active: isActive,
      };
      if (editingId !== null) {
        await updateViolationType(editingId, payload);
        props.onNotify(`Jenis pelanggaran ${payload.kode} berhasil diperbarui.`);
      } else {
        await createViolationType(payload);
        props.onNotify(`Jenis pelanggaran ${payload.kode} berhasil ditambahkan.`);
      }
      resetForm();
      props.onChanged();
    } catch (error) {
      if (error instanceof DisciplineApiError) {
        if (error.status === 409) {
          setErrorMsg(`Kode "${kode.trim().toUpperCase()}" sudah digunakan.`);
        } else if (error.status === 403) {
          setErrorMsg('Akses ditolak: hanya akun Kesiswaan yang dapat mengubah aturan.');
        } else {
          setErrorMsg(error.message);
        }
      } else {
        setErrorMsg('Gagal menyimpan jenis pelanggaran.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (vt: ViolationTypeRecord) => {
    setErrorMsg(null);
    try {
      await deleteViolationType(vt.id);
      props.onNotify(`Jenis pelanggaran ${vt.kode} berhasil dihapus.`);
      if (editingId === vt.id) {
        resetForm();
      }
      props.onChanged();
    } catch (error) {
      if (error instanceof DisciplineApiError && error.status === 409) {
        setErrorMsg(
          `Kode ${vt.kode} sudah pernah tercatat pada insiden siswa. Edit lalu nonaktifkan status aktifnya jika tidak dipakai lagi.`,
        );
      } else if (error instanceof DisciplineApiError) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('Gagal menghapus jenis pelanggaran.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/50 p-4 backdrop-blur-xs duration-150 fade-in">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border bg-surface-container-low p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-pine-deep text-amber-gold">
              <SlidersHorizontal className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Kelola Kategori & Kode Pelanggaran
              </h3>
              <p className="text-xs text-muted-foreground">
                Tambah, ubah kategori/bobot poin, atau nonaktifkan kode pelanggaran SD Islam Bakti Asih
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Tutup modal"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 text-xs">
          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 font-medium text-red-700">
              {errorMsg}
            </div>
          )}

          {/* Create / Edit Form */}
          <form
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
            className="space-y-3 rounded-xl border border-border bg-surface-container-low p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">
                {editingId !== null ? 'Edit Jenis Pelanggaran' : 'Tambah Kode Pelanggaran Baru'}
              </span>
              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-[11px] font-semibold text-pine-deep hover:underline"
                >
                  + Mode Tambah Baru
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
              <div className="space-y-1 sm:col-span-3">
                <label className="block font-semibold text-foreground">Kode *</label>
                <input
                  type="text"
                  value={kode}
                  onChange={(e) => {
                    setKode(e.target.value);
                  }}
                  placeholder="Misal: ATR-04"
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 uppercase focus:border-pine-deep focus:outline-hidden"
                />
              </div>

              <div className="space-y-1 sm:col-span-4">
                <label className="block font-semibold text-foreground">Nama Pelanggaran *</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => {
                    setNama(e.target.value);
                  }}
                  placeholder="Misal: Tidak memakai peci/kerudung"
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 focus:border-pine-deep focus:outline-hidden"
                />
              </div>

              <div className="space-y-1 sm:col-span-3">
                <label className="block font-semibold text-foreground">Kategori *</label>
                <select
                  value={kategori}
                  onChange={(e) => {
                    setKategori(e.target.value as CategoryOption);
                  }}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 focus:border-pine-deep focus:outline-hidden"
                >
                  <option value="atribut">Atribut Seragam</option>
                  <option value="kerapihan">Kerapihan</option>
                  <option value="perilaku">Perilaku & Tata Tertib</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="block font-semibold text-foreground">Poin *</label>
                <input
                  type="number"
                  min={0}
                  value={poinDefault}
                  onChange={(e) => {
                    setPoinDefault(Number(e.target.value));
                  }}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 focus:border-pine-deep focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="inline-flex items-center gap-2 font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => {
                    setIsActive(e.target.checked);
                  }}
                  className="size-4 rounded accent-pine-deep"
                />
                <span>Aktif ditampilkan pada form pencatatan</span>
              </label>

              <div className="flex items-center gap-2">
                {editingId !== null && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-border bg-card px-3 py-2 font-semibold text-foreground hover:bg-muted"
                  >
                    Batal Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2 font-bold text-white hover:bg-pine-hover disabled:opacity-60"
                >
                  <Plus className="size-4" />
                  <span>{editingId !== null ? 'Simpan Perubahan' : 'Tambah Jenis'}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Table of existing violation types */}
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-container-low text-[11px] font-bold text-muted-foreground uppercase">
                  <th className="px-4 py-2.5">Kode</th>
                  <th className="px-4 py-2.5">Nama Pelanggaran</th>
                  <th className="px-4 py-2.5">Kategori</th>
                  <th className="px-4 py-2.5">Poin</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {props.violationTypes.map((vt) => (
                  <tr key={vt.id} className="hover:bg-surface-container-low/60">
                    <td className="px-4 py-2.5 font-mono font-bold text-pine-deep">{vt.kode}</td>
                    <td className="px-4 py-2.5 font-medium text-foreground">{vt.nama}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {categoryLabels[vt.kategori as CategoryOption] ?? vt.kategori}
                    </td>
                    <td className="px-4 py-2.5 font-bold text-foreground">+{vt.poin_default}</td>
                    <td className="px-4 py-2.5">
                      {vt.is_active ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Aktif
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            handleStartEdit(vt);
                          }}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Edit jenis pelanggaran"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void handleDelete(vt);
                          }}
                          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                          title="Hapus jenis pelanggaran"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {props.violationTypes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      Belum ada jenis pelanggaran terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
