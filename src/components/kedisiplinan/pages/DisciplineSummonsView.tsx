'use client';

import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Eye,
  FileText,
  MessageCircle,
  Pencil,
  PlusCircle,
  Printer,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from '@/libs/I18nNavigation';
import {
  createParentSummons,
  deleteParentSummons,
  DisciplineApiError,
  fetchParentSummons,
  fetchSchoolStudents,
  updateParentSummons,
  updateParentSummonsStatus,
} from '@/services/disciplineApi';
import type {
  ParentSummonsRecord,
  ParentSummonsStatus,
  SchoolStudentRecord,
} from '@/services/disciplineApi';

function sanitizePhoneForWhatsApp(phone: string | null): string {
  const digits = (phone ?? '').replace(/\D/g, '');
  if (!digits) {
    return '6281200000000';
  }
  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`;
  }
  return digits;
}

function formatMeetingDisplay(iso: string): string {
  if (!iso) {
    return '-';
  }
  const clean = iso.replace('T', ' ').slice(0, 16);
  return `${clean} WIB`;
}

function buildWhatsAppMessage(letter: ParentSummonsRecord): string {
  return [
    'Assalamu’alaikum Wr. Wb.',
    '',
    'Yth. Bapak/Ibu Wali Murid,',
    `*${letter.nama_ortu ?? `Orang Tua / Wali ${letter.student_name}`}*`,
    '',
    'Dengan hormat, melalui pesan ini kami sampaikan Surat Pemanggilan Orang Tua / Wali Siswa dari *SD Islam Bakti Asih*:',
    `• Nomor Surat: ${letter.nomor_surat}`,
    `• Nama Siswa: ${letter.student_name} (Kelas ${letter.nama_kelas ?? '-'} / NIS: ${letter.nis ?? '-'})`,
    `• Agenda: ${letter.alasan}`,
    `• Jadwal Pertemuan: ${formatMeetingDisplay(letter.jadwal_pertemuan)}`,
    `• Tempat: ${letter.ruangan}`,
    '',
    'Dimohon kehadiran Bapak/Ibu tepat pada waktunya untuk pendampingan pembinaan siswa bersama Kesiswaan & Wali Kelas.',
    'Wassalamu’alaikum Wr. Wb.',
    '',
    '_Bagian Kesiswaan & BK — SD Islam Bakti Asih_',
  ].join('\n');
}

/**
 * Full-CRUD Parent Summons view with official SD Islam Bakti Asih letter preview,
 * PDF print, and WhatsApp notification integration.
 *
 * @returns Rendered parent summons page.
 */
export function DisciplineSummonsView() {
  const [letters, setLetters] = useState<ParentSummonsRecord[]>([]);
  const [students, setStudents] = useState<SchoolStudentRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | ParentSummonsStatus>('all');
  const [previewLetter, setPreviewLetter] = useState<ParentSummonsRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<ParentSummonsRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [selectedStudentId, setSelectedStudentId] = useState<number>(1);
  const [nomorSurat, setNomorSurat] = useState('');
  const [tanggalSurat, setTanggalSurat] = useState(() => new Date().toISOString().slice(0, 10));
  const [jadwalPertemuan, setJadwalPertemuan] = useState('');
  const [ruangan, setRuangan] = useState('Ruang Bimbingan Konseling (BK) SD Islam Bakti Asih');
  const [namaOrtu, setNamaOrtu] = useState('');
  const [noHpOrtu, setNoHpOrtu] = useState('');
  const [alasan, setAlasan] = useState('');
  const [catatanHasil, setCatatanHasil] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadData = async () => {
    try {
      const [summonsList, studentList] = await Promise.all([
        fetchParentSummons(),
        fetchSchoolStudents(),
      ]);
      setLetters(summonsList);
      setStudents(studentList);
    } catch {
      // Keep current state when offline.
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filtered = letters.filter((l) => {
    if (statusFilter === 'all') {
      return true;
    }
    return l.status === statusFilter;
  });

  const openCreateModal = () => {
    const first = students[0];
    const seq = String(letters.length + 1).padStart(3, '0');
    const today = new Date().toISOString().slice(0, 10);

    setEditingLetter(null);
    setSelectedStudentId(first?.id ?? 1);
    setNomorSurat(`${seq}/SD-BA/KESISWAAN/XI/2026`);
    setTanggalSurat(today);
    setJadwalPertemuan(`${today}T09:00`);
    setRuangan('Ruang Bimbingan Konseling (BK) SD Islam Bakti Asih');
    setNamaOrtu(first ? `Orang Tua / Wali ${first.nama}` : '');
    setNoHpOrtu(first?.no_hp_ortu ?? '6281200000000');
    setAlasan('');
    setCatatanHasil('');
    setIsModalOpen(true);
  };

  const openEditModal = (letter: ParentSummonsRecord) => {
    setEditingLetter(letter);
    setSelectedStudentId(letter.student_id);
    setNomorSurat(letter.nomor_surat);
    setTanggalSurat(letter.tanggal_surat);
    setJadwalPertemuan(letter.jadwal_pertemuan.slice(0, 16));
    setRuangan(letter.ruangan);
    setNamaOrtu(letter.nama_ortu ?? '');
    setNoHpOrtu(letter.no_hp_ortu ?? '');
    setAlasan(letter.alasan);
    setCatatanHasil(letter.catatan_hasil ?? '');
    setIsModalOpen(true);
  };

  const handleStudentSelect = (id: number) => {
    setSelectedStudentId(id);
    const s = students.find((item) => item.id === id);
    if (s) {
      setNamaOrtu(`Orang Tua / Wali ${s.nama}`);
      setNoHpOrtu(s.no_hp_ortu ?? '6281200000000');
    }
  };

  const handleSave = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nomorSurat.trim() || !alasan.trim() || !jadwalPertemuan) {
      showToast('Nomor surat, jadwal pertemuan, dan alasan wajib diisi.');
      return;
    }
    try {
      if (editingLetter) {
        await updateParentSummons(editingLetter.id, {
          nomor_surat: nomorSurat.trim(),
          tanggal_surat: tanggalSurat,
          jadwal_pertemuan: jadwalPertemuan,
          ruangan: ruangan.trim(),
          alasan: alasan.trim(),
          nama_ortu: namaOrtu.trim() || undefined,
          no_hp_ortu: noHpOrtu.trim() || undefined,
          catatan_hasil: catatanHasil.trim() || undefined,
        });
        showToast(`Surat ${nomorSurat} berhasil diperbarui.`);
      } else {
        await createParentSummons({
          student_id: selectedStudentId,
          nomor_surat: nomorSurat.trim(),
          tanggal_surat: tanggalSurat,
          jadwal_pertemuan: jadwalPertemuan,
          ruangan: ruangan.trim(),
          alasan: alasan.trim(),
          nama_ortu: namaOrtu.trim() || undefined,
          no_hp_ortu: noHpOrtu.trim() || undefined,
          status: 'draft',
        });
        showToast(`Surat panggilan ${nomorSurat} berhasil dibuat.`);
      }
      setIsModalOpen(false);
      setEditingLetter(null);
      await loadData();
    } catch (error) {
      if (error instanceof DisciplineApiError) {
        showToast(error.message);
      }
    }
  };

  const handleSendWhatsApp = async (letter: ParentSummonsRecord) => {
    const phone = sanitizePhoneForWhatsApp(letter.no_hp_ortu);
    const text = encodeURIComponent(buildWhatsAppMessage(letter));
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer');

    try {
      await updateParentSummonsStatus(letter.id, 'sent');
      showToast(`Surat ${letter.nomor_surat} dibuka di WhatsApp & ditandai Terkirim.`);
      await loadData();
    } catch (error) {
      if (error instanceof DisciplineApiError) {
        showToast(error.message);
      }
    }
  };

  const handleMarkCompleted = async (letter: ParentSummonsRecord) => {
    try {
      await updateParentSummonsStatus(
        letter.id,
        'completed',
        letter.catatan_hasil ?? 'Orang tua/wali hadir dan menandatangani komitmen pembinaan.',
      );
      showToast(`Pertemuan untuk ${letter.student_name} ditandai selesai.`);
      await loadData();
    } catch (error) {
      if (error instanceof DisciplineApiError) {
        showToast(error.message);
      }
    }
  };

  const handleDelete = async (letter: ParentSummonsRecord) => {
    try {
      await deleteParentSummons(letter.id);
      showToast(`Surat ${letter.nomor_surat} berhasil dihapus.`);
      setLetters((prev) => prev.filter((item) => item.id !== letter.id));
    } catch (error) {
      if (error instanceof DisciplineApiError) {
        showToast(error.message);
      }
    }
  };

  const draftCount = letters.filter((l) => l.status === 'draft').length;
  const sentCount = letters.filter((l) => l.status === 'sent').length;
  const completedCount = letters.filter((l) => l.status === 'completed').length;

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex animate-in items-center gap-2 rounded-xl bg-pine-deep px-4 py-3 text-sm font-semibold text-white shadow-xl duration-200 slide-in-from-top-4">
          <CheckCircle2 className="size-4.5 text-amber-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
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
              <span>Pemanggilan Orang Tua</span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              Manajemen Surat Pemanggilan Orang Tua (SD Islam Bakti Asih)
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-pine-hover"
        >
          <PlusCircle className="size-4 text-amber-gold" />
          <span>+ Buat Surat Panggilan Baru</span>
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 print:hidden">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <span className="text-xs font-medium text-muted-foreground">Total Surat</span>
          <p className="mt-1 text-2xl font-black text-foreground">{letters.length}</p>
        </div>
        <div className="rounded-2xl border border-amber-gold/40 bg-amber-surface/40 p-5 shadow-xs">
          <span className="text-xs font-medium text-amber-900">Draf / Siap Dikirim</span>
          <p className="mt-1 text-2xl font-black text-amber-dark">{draftCount} Surat</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 shadow-xs">
          <span className="text-xs font-medium text-blue-900">Menunggu Kehadiran Wali</span>
          <p className="mt-1 text-2xl font-black text-blue-900">{sentCount} Wali</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-xs">
          <span className="text-xs font-medium text-emerald-900">Selesai Pertemuan</span>
          <p className="mt-1 text-2xl font-black text-emerald-900">{completedCount} Kasus</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 print:hidden">
        {[
          { id: 'all' as const, label: `Semua Surat (${letters.length})` },
          { id: 'draft' as const, label: `Draf / Siap Kirim (${draftCount})` },
          { id: 'sent' as const, label: `Terkirim (${sentCount})` },
          { id: 'completed' as const, label: `Selesai (${completedCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setStatusFilter(tab.id);
            }}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              statusFilter === tab.id
                ? 'bg-pine-deep text-white'
                : 'border border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-container-low text-[11px] font-bold text-muted-foreground uppercase">
                <th className="px-5 py-3.5">Nomor & Tanggal Surat</th>
                <th className="px-4 py-3.5">Siswa & Wali Murid</th>
                <th className="px-4 py-3.5">Alasan / Agenda</th>
                <th className="px-4 py-3.5">Jadwal & Tempat</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((letter) => (
                <tr key={letter.id} className="hover:bg-surface-container-low/60">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="font-mono font-bold text-foreground">{letter.nomor_surat}</div>
                    <div className="text-[11px] text-muted-foreground">{letter.tanggal_surat}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-foreground">{letter.student_name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      Kelas {letter.nama_kelas ?? '-'} • {letter.nama_ortu ?? 'Wali Murid'}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      WA: {letter.no_hp_ortu ?? '-'}
                    </div>
                  </td>
                  <td className="max-w-xs px-4 py-4">
                    <p className="line-clamp-2 text-foreground">{letter.alasan}</p>
                    <span className="mt-1 inline-block rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                      Akumulasi: {letter.total_points} Poin
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="font-semibold text-foreground">
                      {formatMeetingDisplay(letter.jadwal_pertemuan)}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{letter.ruangan}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {letter.status === 'draft' && (
                      <span className="rounded-full border border-amber-gold/40 bg-amber-surface px-2.5 py-1 text-[11px] font-bold text-amber-dark">
                        Draf / Siap Kirim
                      </span>
                    )}
                    {letter.status === 'sent' && (
                      <span className="rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-900">
                        Terkirim (WA)
                      </span>
                    )}
                    {letter.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-900">
                        <CheckCircle className="size-3" />
                        Selesai
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewLetter(letter);
                        }}
                        className="inline-flex h-7 items-center gap-1 rounded-lg border border-border bg-card px-2.5 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
                        title="Lihat & Cetak Format Surat Resmi"
                      >
                        <Eye className="size-3.5 text-pine-deep" />
                        <span>Surat</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          void handleSendWhatsApp(letter);
                        }}
                        className="inline-flex h-7 items-center gap-1 rounded-lg bg-emerald-700 px-2.5 text-[11px] font-bold text-white transition-colors hover:bg-emerald-800"
                        title="Kirim Surat via WhatsApp"
                      >
                        <MessageCircle className="size-3.5" />
                        <span>Kirim WA</span>
                      </button>

                      {letter.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => {
                            void handleMarkCompleted(letter);
                          }}
                          className="inline-flex h-7 items-center gap-1 rounded-lg bg-pine-deep px-2.5 text-[11px] font-bold text-white transition-colors hover:bg-pine-hover"
                          title="Tandai Wali Hadir & Selesai"
                        >
                          <UserCheck className="size-3.5 text-amber-gold" />
                          <span>Selesai</span>
                        </button>
                      )}

                      <span className="mx-0.5 h-4 w-px bg-border" />

                      <button
                        type="button"
                        onClick={() => {
                          openEditModal(letter);
                        }}
                        className="inline-flex size-7 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Edit Surat"
                      >
                        <Pencil className="size-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          void handleDelete(letter);
                        }}
                        className="inline-flex size-7 items-center justify-center rounded-lg border border-red-200 text-red-600 transition-colors hover:bg-red-50"
                        title="Hapus Surat"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground">
                    Belum ada surat panggilan orang tua pada filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official SD Islam Bakti Asih Letter Preview Modal */}
      {previewLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs print:static print:bg-white print:p-0">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-white text-slate-900 shadow-2xl print:border-0 print:shadow-none">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 print:hidden">
              <div className="flex items-center gap-2 font-bold">
                <FileText className="size-4 text-pine-deep" />
                <span>Pratinjau Format Surat Resmi</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-pine-deep px-3.5 py-1.5 text-xs font-bold text-white hover:bg-pine-hover"
                >
                  <Printer className="size-3.5 text-amber-gold" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleSendWhatsApp(previewLetter);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800"
                >
                  <MessageCircle className="size-3.5" />
                  <span>Kirim WA</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewLetter(null);
                  }}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-200"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4 p-8 font-serif text-sm leading-relaxed">
              {/* School Letterhead */}
              <div className="border-b-4 border-double border-slate-800 pb-4 text-center">
                <p className="text-xs font-bold tracking-widest uppercase">
                  YAYASAN PENDIDIKAN ISLAM BAKTI ASIH
                </p>
                <h2 className="text-xl font-black tracking-wide uppercase">
                  SD ISLAM BAKTI ASIH
                </h2>
                <p className="text-xs text-slate-600">
                  Jl. Bakti Asih No. 12, Bandung • Email: kesiswaan@sdbaktiasih.sch.id • Telp. (022) 720-xxxx
                </p>
              </div>

              <div className="flex justify-between text-xs">
                <div>
                  <p>
                    Nomor : <span className="font-semibold">{previewLetter.nomor_surat}</span>
                  </p>
                  <p>Lampiran : 1 Lembar Rekap Poin Kedisiplinan</p>
                  <p>
                    Hal : <span className="font-bold underline">Pemanggilan Orang Tua / Wali Siswa</span>
                  </p>
                </div>
                <p>Bandung, {previewLetter.tanggal_surat}</p>
              </div>

              <div className="pt-2 text-xs">
                <p>Kepada Yth.</p>
                <p className="font-bold">
                  {previewLetter.nama_ortu ?? `Bapak/Ibu Orang Tua / Wali ${previewLetter.student_name}`}
                </p>
                <p>di Tempat</p>
              </div>

              <p className="text-xs">Assalamu’alaikum Warahmatullahi Wabarakatuh,</p>
              <p className="text-justify text-xs">
                Dengan hormat, dalam rangka pembinaan karakter dan penegakan tata tertib siswa di{' '}
                <strong>SD Islam Bakti Asih</strong>, kami mengharap kehadiran Bapak/Ibu Orang
                Tua/Wali dari siswa:
              </p>

              <table className="w-full text-xs">
                <tbody>
                  <tr>
                    <td className="w-40 py-0.5">Nama Siswa</td>
                    <td>: <strong>{previewLetter.student_name}</strong></td>
                  </tr>
                  <tr>
                    <td className="py-0.5">NIS / Kelas</td>
                    <td>
                      : {previewLetter.nis ?? '-'} / Kelas {previewLetter.nama_kelas ?? '-'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-0.5">Akumulasi Poin</td>
                    <td>: {previewLetter.total_points} Poin</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 align-top">Agenda / Keperluan</td>
                    <td>: {previewLetter.alasan}</td>
                  </tr>
                </tbody>
              </table>

              <div className="rounded-lg border border-slate-300 bg-slate-50 p-3 text-xs">
                <p className="font-bold">Jadwal Pertemuan Orang Tua & Kesiswaan:</p>
                <p>Waktu : {formatMeetingDisplay(previewLetter.jadwal_pertemuan)}</p>
                <p>Tempat : {previewLetter.ruangan}</p>
              </div>

              <p className="text-justify text-xs">
                Mengingat pentingnya sinergi pembinaan antara pihak sekolah dan orang tua, kami
                sangat mengharapkan kehadiran Bapak/Ibu tepat pada waktunya. Atas perhatian dan
                kerja samanya, kami ucapkan terima kasih.
              </p>
              <p className="text-xs">Wassalamu’alaikum Warahmatullahi Wabarakatuh.</p>

              <div className="grid grid-cols-2 pt-6 text-center text-xs">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-bold">Kepala SD Islam Bakti Asih</p>
                  <div className="h-16" />
                  <p className="font-bold underline">Bapak Hendra</p>
                  <p className="text-[11px] text-slate-600">NIP. 19800303...</p>
                </div>
                <div>
                  <p>Koordinator Kesiswaan & BK,</p>
                  <p className="font-bold">Bagian Tata Tertib</p>
                  <div className="h-16" />
                  <p className="font-bold underline">
                    {previewLetter.created_by_name ?? 'Ibu Rina, S.Pd.'}
                  </p>
                  <p className="text-[11px] text-slate-600">NIP. 19800404...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Summons Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs print:hidden">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {editingLetter ? 'Edit Surat Pemanggilan Orang Tua' : 'Buat Surat Panggilan Baru'}
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
                void handleSave(e);
              }}
              className="mt-4 space-y-3 text-xs"
            >
              {editingLetter ? (
                <div className="rounded-xl border border-border bg-surface-container-low p-3 font-bold">
                  {editingLetter.student_name} (Kelas {editingLetter.nama_kelas ?? '-'})
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="block font-bold">Pilih Siswa *</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => {
                      handleStudentSelect(Number(e.target.value));
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
                  <label className="block font-bold">Nomor Surat *</label>
                  <input
                    type="text"
                    value={nomorSurat}
                    onChange={(e) => {
                      setNomorSurat(e.target.value);
                    }}
                    className="w-full rounded-xl border border-border bg-surface-container-low p-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold">Tanggal Surat *</label>
                  <input
                    type="date"
                    value={tanggalSurat}
                    onChange={(e) => {
                      setTanggalSurat(e.target.value);
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
                    value={jadwalPertemuan}
                    onChange={(e) => {
                      setJadwalPertemuan(e.target.value);
                    }}
                    className="w-full rounded-xl border border-border bg-surface-container-low p-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold">Ruangan *</label>
                  <input
                    type="text"
                    value={ruangan}
                    onChange={(e) => {
                      setRuangan(e.target.value);
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
                    value={namaOrtu}
                    onChange={(e) => {
                      setNamaOrtu(e.target.value);
                    }}
                    className="w-full rounded-xl border border-border bg-surface-container-low p-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold">No. WhatsApp Wali</label>
                  <input
                    type="text"
                    value={noHpOrtu}
                    onChange={(e) => {
                      setNoHpOrtu(e.target.value);
                    }}
                    placeholder="62812..."
                    className="w-full rounded-xl border border-border bg-surface-container-low p-2"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold">Alasan / Agenda Pertemuan *</label>
                <textarea
                  rows={2}
                  value={alasan}
                  onChange={(e) => {
                    setAlasan(e.target.value);
                  }}
                  placeholder="Jelaskan dasar pemanggilan dan rencana pembinaan..."
                  className="w-full rounded-xl border border-border bg-surface-container-low p-2"
                />
              </div>

              {editingLetter && (
                <div className="space-y-1">
                  <label className="block font-bold">Catatan Hasil Pertemuan (Opsional)</label>
                  <input
                    type="text"
                    value={catatanHasil}
                    onChange={(e) => {
                      setCatatanHasil(e.target.value);
                    }}
                    className="w-full rounded-xl border border-border bg-surface-container-low p-2"
                  />
                </div>
              )}

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
                  className="inline-flex items-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2 font-bold text-white hover:bg-pine-hover"
                >
                  <Calendar className="size-3.5 text-amber-gold" />
                  <span>{editingLetter ? 'Simpan Perubahan' : 'Simpan Surat Panggilan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
