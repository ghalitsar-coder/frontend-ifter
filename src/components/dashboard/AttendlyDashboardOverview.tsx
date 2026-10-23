import { currentUser } from '@clerk/nextjs/server';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Clock,
  DoorOpen,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { Link } from '@/libs/I18nNavigation';

/**
 * Attendly Main Administrative Executive Overview Dashboard.
 * Replaces default boilerplate hello/sponsor components.
 *
 * @returns Dashboard JSX element.
 */
export async function AttendlyDashboardOverview() {
  const user = await currentUser();
  const userName =
    user?.firstName || user?.fullName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Administrator';

  return (
    <div className="space-y-8 pb-12">
      {/* Editorial Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#E4E8E6] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E9F0EE] text-[#173F36] border border-[#D4DAD7]">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Sistem Aktif Normal
            </span>
            <span className="text-xs text-[#6E7A76]">•</span>
            <span className="text-xs text-[#6E7A76] font-mono">FR-A01 • FR-A03 • FR-C02</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#173F36] tracking-tight">
            Selamat Datang, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-[#6E7A76] mt-1 max-w-2xl leading-relaxed">
            Ikhtisar operasional presensi, kedisiplinan siswa, jadwal piket gerbang, dan master pendidik SMP Negeri 1 Harapan Bangsa.
          </p>
        </div>

        {/* Quick Date Indicator */}
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E4E8E6] text-xs font-semibold text-[#173F36] shadow-xs">
          <Calendar className="size-4 text-[#785a00]" />
          <span>Senin, 05 Oktober 2026</span>
          <span className="size-1 rounded-full bg-[#173F36]" />
          <span className="text-[#6E7A76]">Sesi Pagi</span>
        </div>
      </div>

      {/* 4 Bento Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: Kehadiran Siswa */}
        <div className="bg-white rounded-2xl p-5 border border-[#E4E8E6] shadow-xs flex flex-col justify-between group hover:border-[#173F36] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E7A76]">
              Kehadiran Siswa
            </span>
            <div className="size-8 rounded-lg bg-[#E9F0EE] text-[#173F36] flex items-center justify-center">
              <UserCheck className="size-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-[#173F36]">96.8%</span>
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-0.5">
              <TrendingUp className="size-3" /> +1.2%
            </span>
          </div>
          <p className="text-[11px] text-[#6E7A76]">
            724 dari 748 siswa hadir tepat waktu di 24 rombel.
          </p>
        </div>

        {/* KPI 2: Guru & Tendik */}
        <div className="bg-[#173F36] text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 size-24 rounded-full bg-white/5 blur-xl group-hover:bg-[#F2C96C]/10 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#F2C96C]">
              Guru & PTK
            </span>
            <div className="size-8 rounded-lg bg-white/10 text-[#F2C96C] flex items-center justify-center">
              <Users className="size-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-[#F2C96C]">46</span>
            <span className="text-xs font-medium text-emerald-100">100% Aktif</span>
          </div>
          <p className="text-[11px] text-emerald-100/80">
            38 Guru Tetap, 5 Honorer, 3 Staf TU (Dapodik Sinkron).
          </p>
        </div>

        {/* KPI 3: Pos Piket Gerbang */}
        <div className="bg-[#FDF8ED] rounded-2xl p-5 border border-[#F2C96C]/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#785a00]">
              Pos Piket Gerbang
            </span>
            <div className="size-8 rounded-lg bg-[#F2C96C]/30 text-[#785a00] flex items-center justify-center">
              <DoorOpen className="size-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-[#785a00]">3/3</span>
            <span className="text-xs font-bold text-[#785a00]">Terisi Penuh</span>
          </div>
          <p className="text-[11px] text-[#785a00]/80">
            Gerbang Selatan, Utama, dan Ruang BK bertugas normal.
          </p>
        </div>

        {/* KPI 4: Pelanggaran & Poin */}
        <div className="bg-white rounded-2xl p-5 border border-[#E4E8E6] shadow-xs flex flex-col justify-between group hover:border-[#173F36] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E7A76]">
              Kedisiplinan Siswa
            </span>
            <div className="size-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="size-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-[#173F36]">3</span>
            <span className="text-xs font-semibold text-amber-700">Insiden Baru</span>
          </div>
          <p className="text-[11px] text-[#6E7A76]">
            1 Terlambat gerbang, 2 pelanggaran atribut seragam.
          </p>
        </div>
      </div>

      {/* Quick Navigation Action Hub */}
      <div className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-[#173F36]">
          Akses Modul Utama Sekolah
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Master Guru */}
          <Link
            href="/dashboard/master-guru"
            className="p-5 rounded-2xl bg-white border border-[#E4E8E6] hover:border-[#173F36] hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="size-10 rounded-xl bg-[#E9F0EE] text-[#173F36] flex items-center justify-center mb-4 group-hover:bg-[#173F36] group-hover:text-white transition-colors">
                <Users className="size-5" />
              </div>
              <h3 className="text-base font-bold text-[#173F36] group-hover:text-[#173F36]">
                Master Data Guru & Penugasan
              </h3>
              <p className="text-xs text-[#6E7A76] mt-1.5 leading-relaxed">
                Kelola 46 pendidik, penugasan wali kelas, jadwal piket gerbang, import Excel, dan akses sistem.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E4E8E6] flex items-center justify-between text-xs font-bold text-[#173F36]">
              <span>Buka Data Guru</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Presensi Siswa */}
          <Link
            href="/dashboard/presensi"
            className="p-5 rounded-2xl bg-white border border-[#E4E8E6] hover:border-[#173F36] hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="size-10 rounded-xl bg-[#E9F0EE] text-[#173F36] flex items-center justify-center mb-4 group-hover:bg-[#173F36] group-hover:text-white transition-colors">
                <UserCheck className="size-5" />
              </div>
              <h3 className="text-base font-bold text-[#173F36]">
                Presensi Kelas & Harian
              </h3>
              <p className="text-xs text-[#6E7A76] mt-1.5 leading-relaxed">
                Pencatatan absensi rombel, verifikasi dispensasi lomba, input surat dokter, dan broadcast WhatsApp wali murid.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E4E8E6] flex items-center justify-between text-xs font-bold text-[#173F36]">
              <span>Buka Presensi</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Kedisiplinan Siswa */}
          <Link
            href="/dashboard/kedisiplinan"
            className="p-5 rounded-2xl bg-white border border-[#E4E8E6] hover:border-[#173F36] hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="size-10 rounded-xl bg-[#E9F0EE] text-[#173F36] flex items-center justify-center mb-4 group-hover:bg-[#173F36] group-hover:text-white transition-colors">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="text-base font-bold text-[#173F36]">
                Kedisiplinan & Poin Pelanggaran
              </h3>
              <p className="text-xs text-[#6E7A76] mt-1.5 leading-relaxed">
                Pencatatan pelanggaran, tata tertib, monitoring ambang sanksi (SP1 &gt;= 30 poin), dan konseling bimbingan (BK).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E4E8E6] flex items-center justify-between text-xs font-bold text-[#173F36]">
              <span>Buka Kedisiplinan</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Operational Picket Feed Table */}
      <div className="rounded-2xl border border-[#E4E8E6] bg-white shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E4E8E6] flex items-center justify-between bg-[#F8F9F8]">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-[#E9F0EE] text-[#173F36] flex items-center justify-center">
              <Clock className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#173F36]">
                Log Kehadiran Petugas Piket Gerbang Hari Ini
              </h3>
              <p className="text-[11px] text-[#6E7A76]">
                Operasional pemantauan kedisiplinan dan absensi gerbang (06.15 - 07.15 WIB)
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/master-guru"
            className="text-xs font-bold text-[#173F36] hover:underline flex items-center gap-1"
          >
            Kelola Jadwal Piket
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#E4E8E6] text-xs">
          <div className="px-5 py-3.5 flex items-center justify-between hover:bg-[#F8F9F8] transition-colors">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-[#173F36] text-white flex items-center justify-center font-bold text-xs">
                AS
              </div>
              <div>
                <span className="font-bold text-[#111816] block">Drs. Agus Subagyo, M.Pd.</span>
                <span className="text-[#6E7A76] text-[11px]">Pos 01 Gerbang Selatan (Dropzone) • Kedisiplinan & Kerapian</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[#173F36] font-semibold">06.24 WIB</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Bertugas
              </span>
            </div>
          </div>

          <div className="px-5 py-3.5 flex items-center justify-between hover:bg-[#F8F9F8] transition-colors">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-[#173F36] text-white flex items-center justify-center font-bold text-xs">
                BS
              </div>
              <div>
                <span className="font-bold text-[#111816] block">Drs. Bambang Sutrisno</span>
                <span className="text-[#6E7A76] text-[11px]">Pos 02 Gerbang Utama & Parkir Guru • Koordinator Piket</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[#173F36] font-semibold">06.28 WIB</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Bertugas
              </span>
            </div>
          </div>

          <div className="px-5 py-3.5 flex items-center justify-between hover:bg-[#F8F9F8] transition-colors">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-[#173F36] text-white flex items-center justify-center font-bold text-xs">
                RS
              </div>
              <div>
                <span className="font-bold text-[#111816] block">Ibu Ratna Suminar, S.Pd.</span>
                <span className="text-[#6E7A76] text-[11px]">Pos 03 Ruang Piket & BK • Perizinan Masuk Terlambat</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[#173F36] font-semibold">06.31 WIB</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Bertugas
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
