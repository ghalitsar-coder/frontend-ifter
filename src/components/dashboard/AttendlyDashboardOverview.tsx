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
    user?.firstName ||
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress?.split('@')[0] ||
    'Administrator';

  return (
    <div className="space-y-8 pb-12">
      {/* Editorial Welcome Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#E4E8E6] pb-6 lg:flex-row lg:items-end">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4DAD7] bg-[#E9F0EE] px-2.5 py-0.5 text-xs font-bold text-[#173F36]">
              <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
              Sistem Aktif Normal
            </span>
            <span className="text-xs text-[#6E7A76]">•</span>
            <span className="font-mono text-xs text-[#6E7A76]">FR-A01 • FR-A03 • FR-C02</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#173F36] sm:text-3xl lg:text-4xl">
            Selamat Datang, {userName}
          </h1>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#6E7A76] sm:text-sm">
            Ikhtisar operasional presensi, kedisiplinan siswa, jadwal piket gerbang, dan master
            pendidik SMP Negeri 1 Harapan Bangsa.
          </p>
        </div>

        {/* Quick Date Indicator */}
        <div className="inline-flex items-center gap-2 rounded-xl border border-[#E4E8E6] bg-white px-3.5 py-2 text-xs font-semibold text-[#173F36] shadow-xs">
          <Calendar className="size-4 text-[#785a00]" />
          <span>Senin, 05 Oktober 2026</span>
          <span className="size-1 rounded-full bg-[#173F36]" />
          <span className="text-[#6E7A76]">Sesi Pagi</span>
        </div>
      </div>

      {/* 4 Bento Overview KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {/* KPI 1: Kehadiran Siswa */}
        <div className="group flex flex-col justify-between rounded-2xl border border-[#E4E8E6] bg-white p-5 shadow-xs transition-all hover:border-[#173F36]">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-[#6E7A76] uppercase">
              Kehadiran Siswa
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#E9F0EE] text-[#173F36]">
              <UserCheck className="size-4.5" />
            </div>
          </div>
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#173F36]">96.8%</span>
            <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-700">
              <TrendingUp className="size-3" /> +1.2%
            </span>
          </div>
          <p className="text-[11px] text-[#6E7A76]">
            724 dari 748 siswa hadir tepat waktu di 24 rombel.
          </p>
        </div>

        {/* KPI 2: Guru & Tendik */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[#173F36] p-5 text-white shadow-sm">
          <div className="absolute -right-6 -bottom-6 size-24 rounded-full bg-white/5 blur-xl transition-all group-hover:bg-[#F2C96C]/10" />
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-[#F2C96C] uppercase">
              Guru & PTK
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-[#F2C96C]">
              <Users className="size-4.5" />
            </div>
          </div>
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#F2C96C]">46</span>
            <span className="text-xs font-medium text-emerald-100">100% Aktif</span>
          </div>
          <p className="text-[11px] text-emerald-100/80">
            38 Guru Tetap, 5 Honorer, 3 Staf TU (Dapodik Sinkron).
          </p>
        </div>

        {/* KPI 3: Pos Piket Gerbang */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#F2C96C]/40 bg-[#FDF8ED] p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-[#785a00] uppercase">
              Pos Piket Gerbang
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#F2C96C]/30 text-[#785a00]">
              <DoorOpen className="size-4.5" />
            </div>
          </div>
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#785a00]">3/3</span>
            <span className="text-xs font-bold text-[#785a00]">Terisi Penuh</span>
          </div>
          <p className="text-[11px] text-[#785a00]/80">
            Gerbang Selatan, Utama, dan Ruang BK bertugas normal.
          </p>
        </div>

        {/* KPI 4: Pelanggaran & Poin */}
        <div className="group flex flex-col justify-between rounded-2xl border border-[#E4E8E6] bg-white p-5 shadow-xs transition-all hover:border-[#173F36]">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-[#6E7A76] uppercase">
              Kedisiplinan Siswa
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <AlertTriangle className="size-4.5" />
            </div>
          </div>
          <div className="mb-1 flex items-baseline gap-2">
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
        <h2 className="text-base font-bold text-[#173F36] sm:text-lg">Akses Modul Utama Sekolah</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Master Guru */}
          <Link
            href="/dashboard/master-guru"
            className="group flex flex-col justify-between rounded-2xl border border-[#E4E8E6] bg-white p-5 transition-all hover:border-[#173F36] hover:shadow-md"
          >
            <div>
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-[#E9F0EE] text-[#173F36] transition-colors group-hover:bg-[#173F36] group-hover:text-white">
                <Users className="size-5" />
              </div>
              <h3 className="text-base font-bold text-[#173F36] group-hover:text-[#173F36]">
                Master Data Guru & Penugasan
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#6E7A76]">
                Kelola 46 pendidik, penugasan wali kelas, jadwal piket gerbang, import Excel, dan
                akses sistem.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[#E4E8E6] pt-3 text-xs font-bold text-[#173F36]">
              <span>Buka Data Guru</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 2: Presensi Siswa */}
          <Link
            href="/dashboard/presensi"
            className="group flex flex-col justify-between rounded-2xl border border-[#E4E8E6] bg-white p-5 transition-all hover:border-[#173F36] hover:shadow-md"
          >
            <div>
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-[#E9F0EE] text-[#173F36] transition-colors group-hover:bg-[#173F36] group-hover:text-white">
                <UserCheck className="size-5" />
              </div>
              <h3 className="text-base font-bold text-[#173F36]">Presensi Kelas & Harian</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#6E7A76]">
                Pencatatan absensi rombel, verifikasi dispensasi lomba, input surat dokter, dan
                broadcast WhatsApp wali murid.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[#E4E8E6] pt-3 text-xs font-bold text-[#173F36]">
              <span>Buka Presensi</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 3: Kedisiplinan Siswa */}
          <Link
            href="/dashboard/kedisiplinan"
            className="group flex flex-col justify-between rounded-2xl border border-[#E4E8E6] bg-white p-5 transition-all hover:border-[#173F36] hover:shadow-md"
          >
            <div>
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-[#E9F0EE] text-[#173F36] transition-colors group-hover:bg-[#173F36] group-hover:text-white">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="text-base font-bold text-[#173F36]">
                Kedisiplinan & Poin Pelanggaran
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#6E7A76]">
                Pencatatan pelanggaran, tata tertib, monitoring ambang sanksi (SP1 &gt;= 30 poin),
                dan konseling bimbingan (BK).
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[#E4E8E6] pt-3 text-xs font-bold text-[#173F36]">
              <span>Buka Kedisiplinan</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </div>

      {/* Operational Picket Feed Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E4E8E6] bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E4E8E6] bg-[#F8F9F8] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-[#E9F0EE] text-[#173F36]">
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
            className="flex items-center gap-1 text-xs font-bold text-[#173F36] hover:underline"
          >
            Kelola Jadwal Piket
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#E4E8E6] text-xs">
          <div className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-[#F8F9F8]">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#173F36] text-xs font-bold text-white">
                AS
              </div>
              <div>
                <span className="block font-bold text-[#111816]">Drs. Agus Subagyo, M.Pd.</span>
                <span className="text-[11px] text-[#6E7A76]">
                  Pos 01 Gerbang Selatan (Dropzone) • Kedisiplinan & Kerapian
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono font-semibold text-[#173F36]">06.24 WIB</span>
              <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Bertugas
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-[#F8F9F8]">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#173F36] text-xs font-bold text-white">
                BS
              </div>
              <div>
                <span className="block font-bold text-[#111816]">Drs. Bambang Sutrisno</span>
                <span className="text-[11px] text-[#6E7A76]">
                  Pos 02 Gerbang Utama & Parkir Guru • Koordinator Piket
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono font-semibold text-[#173F36]">06.28 WIB</span>
              <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Bertugas
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-[#F8F9F8]">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#173F36] text-xs font-bold text-white">
                RS
              </div>
              <div>
                <span className="block font-bold text-[#111816]">Ibu Ratna Suminar, S.Pd.</span>
                <span className="text-[11px] text-[#6E7A76]">
                  Pos 03 Ruang Piket & BK • Perizinan Masuk Terlambat
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono font-semibold text-[#173F36]">06.31 WIB</span>
              <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Bertugas
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
