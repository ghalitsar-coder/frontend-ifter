'use client';

import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Clock,
  DoorOpen,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '@/components/auth/AuthProvider';
import { ApiError } from '@/lib/api/client';
import type { AttendanceKpi } from '@/lib/api/dashboard';
import {
  attendanceKpi,
  formatAuditStamp,
  formatClockWib,
  formatSchoolDate,
  formatWeekdayShort,
  initialsOf,
  localTodayIso,
  roleLabel,
  useDashboard,
  useDutyAssignments,
} from '@/lib/api/dashboard';
import type {
  ApiUser,
  DashboardAttendance,
  DashboardData,
  DashboardDiscipline,
  DashboardLateStudent,
  DashboardTrendPoint,
  DashboardUnrecordedStudent,
  DutyAssignment,
} from '@/lib/api/dto';
import { useClassList } from '@/lib/api/queries';
import { Link } from '@/libs/I18nNavigation';

const DASH = '—';

const TREND_SERIES = [
  { key: 'present', label: 'Hadir', color: '#173F36' },
  { key: 'late', label: 'Terlambat', color: '#F2C96C' },
  { key: 'sick', label: 'Sakit', color: '#60A5FA' },
  { key: 'excused', label: 'Izin', color: '#94A3B8' },
  { key: 'absent', label: 'Alpa', color: '#DC2626' },
] as const;

// ---------------------------------------------------------------------------
// Text mappers (Doc: map raw DTO blocks into the Indonesian card copy; plain
// functions keep the render tree under the lint complexity budget.)
// ---------------------------------------------------------------------------
const attendanceSubText = (attendance: DashboardAttendance | undefined): string => {
  if (attendance === undefined) {
    return 'Memuat data kehadiran…';
  }
  return `${attendance.present} dari ${attendance.total_students} siswa hadir tepat waktu, ${attendance.late} terlambat, ${attendance.unrecorded} belum tercatat.`;
};

const disciplineSubText = (discipline: DashboardDiscipline | undefined): string => {
  if (discipline === undefined) {
    return 'Memuat data kedisiplinan…';
  }
  return `${discipline.records_month} catatan bulan ini • ${discipline.points_month} poin terakumulasi • ${discipline.new_records} rekaman baru.`;
};

const staffSubText = (data: DashboardData | undefined): string => {
  if (data?.active_students === undefined) {
    return 'Detail jumlah pendidik & siswa aktif tersedia untuk peran admin.';
  }
  return `${data.active_students} siswa aktif terdaftar pada sistem.`;
};

const dutySubText = (isAdmin: boolean, duties: DutyAssignment[]): string => {
  if (isAdmin) {
    if (duties.length > 0) {
      return duties.map((duty) => duty.teacher_name).join(', ');
    }
    return 'Tidak ada penugasan piket aktif pada tanggal ini.';
  }
  return 'Monitoring piket gerbang tersedia untuk peran admin.';
};

const dutyPeriodText = (duty: DutyAssignment): string => {
  if (duty.end_date === undefined) {
    return `Penugasan piket sejak ${formatSchoolDate(duty.start_date)}`;
  }
  return `Penugasan piket ${formatSchoolDate(duty.start_date)} s.d. ${formatSchoolDate(duty.end_date)}`;
};

const greetingName = (user: ApiUser | null): string => {
  if (user === null) {
    return 'Administrator';
  }
  return user.full_name === '' ? user.username : user.full_name;
};

const dashboardErrorMessage = (error: unknown): string =>
  error instanceof ApiError ? error.message : 'Gagal memuat data dashboard.';

// ---------------------------------------------------------------------------
// Section components
// ---------------------------------------------------------------------------

/**
 * Class picker for the dashboard date filter. Rendered only for admins
 * because GET /classes is an admin endpoint; teachers are already scoped
 * server-side by their own role.
 *
 * @param props - Controlled `value` + `onChange` for the selected class id.
 * @returns Styled select element, or null while classes are still loading.
 */
function DashboardClassFilter(props: { value: string; onChange: (value: string) => void }) {
  const classesQuery = useClassList({ status: 'active' });

  if (classesQuery.data === undefined) {
    return null;
  }

  return (
    <select
      aria-label="Filter rombel"
      className="rounded-xl border border-[#E4E8E6] bg-white px-3 py-2 text-xs font-semibold text-[#173F36] shadow-xs outline-none focus:border-[#173F36]"
      value={props.value}
      onChange={(event) => {
        props.onChange(event.target.value);
      }}
    >
      <option value="">Semua Rombel</option>
      {classesQuery.data.map((cls) => (
        <option key={cls.id} value={cls.id}>
          {cls.name}
        </option>
      ))}
    </select>
  );
}

/**
 * Four bento KPI cards fed by GET /dashboard (+ the admin duty roster).
 *
 * @param props - Raw dashboard data, derived attendance KPI, duty list, flags.
 * @returns KPI card grid.
 */
function DashboardKpiGrid(props: {
  data: DashboardData | undefined;
  kpi: AttendanceKpi | null;
  duties: DutyAssignment[];
  isAdmin: boolean;
}) {
  const { attendance, discipline } = props.data ?? {};
  const percent = props.kpi === null ? DASH : `${props.kpi.percent.toFixed(1)}%`;

  return (
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
          <span className="text-3xl font-extrabold text-[#173F36]">{percent}</span>
          {props.kpi !== null && props.kpi.delta !== null ? (
            <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-700">
              {props.kpi.delta >= 0 ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {props.kpi.delta >= 0 ? '+' : ''}
              {props.kpi.delta.toFixed(1)}%
            </span>
          ) : null}
        </div>
        <p className="text-[11px] text-[#6E7A76]">{attendanceSubText(attendance)}</p>
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
          <span className="text-3xl font-extrabold text-[#F2C96C]">
            {props.data?.active_teachers ?? DASH}
          </span>
          {props.data?.active_teachers === undefined ? null : (
            <span className="text-xs font-medium text-emerald-100">Pendidik Aktif</span>
          )}
        </div>
        <p className="text-[11px] text-emerald-100/80">{staffSubText(props.data)}</p>
        {/* shortcut: no backend breakdown of tetap/honorer/staf TU — server counts stay aggregate */}
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
          <span className="text-3xl font-extrabold text-[#785a00]">
            {props.isAdmin ? props.duties.length : DASH}
          </span>
          {props.isAdmin ? (
            <span className="text-xs font-bold text-[#785a00]">
              {props.duties.length > 0 ? 'Bertugas' : 'Belum Ditugaskan'}
            </span>
          ) : null}
        </div>
        <p className="text-[11px] text-[#785a00]/80">{dutySubText(props.isAdmin, props.duties)}</p>
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
          <span className="text-3xl font-extrabold text-[#173F36]">
            {discipline?.records_today ?? DASH}
          </span>
          <span className="text-xs font-semibold text-amber-700">Insiden Hari Ini</span>
        </div>
        <p className="text-[11px] text-[#6E7A76]">{disciplineSubText(discipline)}</p>
      </div>
    </div>
  );
}

/**
 * Stacked 7-day attendance trend chart (recharts), fed by the `trend` block
 * of GET /dashboard.
 *
 * @param props - Raw trend array + pending flag for the loading copy.
 * @returns Trend card element.
 */
function DashboardTrendCard(props: { trend: DashboardTrendPoint[]; isPending: boolean }) {
  const points = props.trend.map((point) => ({
    label: formatWeekdayShort(point.date),
    present: point.present,
    late: point.late,
    sick: point.sick,
    excused: point.excused,
    absent: point.absent,
  }));

  return (
    <div className="rounded-2xl border border-[#E4E8E6] bg-white p-5 shadow-xs lg:col-span-2">
      <h2 className="mb-1 text-base font-bold text-[#173F36]">Tren Kehadiran 7 Hari</h2>
      <p className="mb-4 text-[11px] text-[#6E7A76]">
        Presensi harian per status siswa, sumber GET /dashboard (blok trend).
      </p>
      {points.length === 0 ? (
        <p className="py-10 text-center text-xs text-[#6E7A76]">
          {props.isPending ? 'Memuat tren kehadiran…' : 'Belum ada data tren.'}
        </p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart data={points} margin={{ left: -22, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E8E6" vertical={false} />
              <XAxis
                axisLine={{ stroke: '#E4E8E6' }}
                dataKey="label"
                tick={{ fill: '#6E7A76', fontSize: 10 }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tick={{ fill: '#6E7A76', fontSize: 10 }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #E4E8E6', fontSize: 11 }}
              />
              <Legend
                formatter={(value) =>
                  TREND_SERIES.find((series) => series.key === value)?.label ?? String(value)
                }
                wrapperStyle={{ fontSize: 11 }}
              />
              {TREND_SERIES.map((series) => (
                <Area
                  dataKey={series.key}
                  fill={series.color}
                  fillOpacity={0.7}
                  key={series.key}
                  stackId="attendance"
                  stroke={series.color}
                  type="monotone"
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/**
 * "Terlambat Hari Ini" list from the `late_students` block.
 *
 * @param props - Late students for the selected date + pending flag.
 * @returns Compact list card.
 */
function DashboardLateCard(props: { students: DashboardLateStudent[]; isPending: boolean }) {
  return (
    <div className="rounded-2xl border border-[#E4E8E6] bg-white p-5 shadow-xs">
      <h2 className="mb-3 text-sm font-bold text-[#173F36]">
        Terlambat Hari Ini ({props.students.length})
      </h2>
      {props.students.length === 0 ? (
        <p className="text-[11px] text-[#6E7A76]">
          {props.isPending ? 'Memuat…' : 'Tidak ada siswa terlambat.'}
        </p>
      ) : (
        <ul className="space-y-2 text-xs">
          {props.students.slice(0, 5).map((student) => (
            <li className="flex items-center justify-between gap-2" key={student.student_id}>
              <div>
                <span className="block font-bold text-[#111816]">{student.student_name}</span>
                <span className="text-[11px] text-[#6E7A76]">{student.class_name}</span>
              </div>
              <span className="font-mono font-semibold text-[#785a00]">
                {formatClockWib(student.check_in_at)}
              </span>
            </li>
          ))}
          {props.students.length > 5 ? (
            <li className="text-[11px] text-[#6E7A76]">
              +{String(props.students.length - 5)} siswa lainnya
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}

/**
 * "Belum Tercatat" list from the `unrecorded_students` block.
 *
 * @param props - Students without a record for the selected date + pending flag.
 * @returns Compact list card.
 */
function DashboardUnrecordedCard(props: {
  students: DashboardUnrecordedStudent[];
  isPending: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#E4E8E6] bg-white p-5 shadow-xs">
      <h2 className="mb-3 text-sm font-bold text-[#173F36]">
        Belum Tercatat ({props.students.length})
      </h2>
      {props.students.length === 0 ? (
        <p className="text-[11px] text-[#6E7A76]">
          {props.isPending ? 'Memuat…' : 'Seluruh siswa sudah memiliki presensi.'}
        </p>
      ) : (
        <ul className="space-y-2 text-xs">
          {props.students.slice(0, 5).map((student) => (
            <li className="flex items-center justify-between gap-2" key={student.student_id}>
              <div>
                <span className="block font-bold text-[#111816]">{student.student_name}</span>
                <span className="text-[11px] text-[#6E7A76]">{student.class_name}</span>
              </div>
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-[#785a00]">
                Belum
              </span>
            </li>
          ))}
          {props.students.length > 5 ? (
            <li className="text-[11px] text-[#6E7A76]">
              +{String(props.students.length - 5)} siswa lainnya
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}

/**
 * Recent audit activity card. GET /dashboard only includes `recent_activity`
 * for admins, so a missing field renders nothing.
 *
 * @param props - Audit log rows from the dashboard payload.
 * @returns Activity table card.
 */
function DashboardActivityCard(props: { logs: NonNullable<DashboardData['recent_activity']> }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4E8E6] bg-white shadow-xs">
      <div className="border-b border-[#E4E8E6] bg-[#F8F9F8] px-5 py-4">
        <h3 className="text-sm font-bold text-[#173F36]">Aktivitas Sistem Terbaru</h3>
        <p className="text-[11px] text-[#6E7A76]">
          Log audit 10 aksi terakhir (GET /dashboard → recent_activity)
        </p>
      </div>
      <div className="divide-y divide-[#E4E8E6] text-xs">
        {props.logs.map((log) => (
          <div className="flex items-center justify-between gap-3 px-5 py-3" key={log.id}>
            <div className="min-w-0">
              <span className="block font-bold text-[#111816]">{log.actor_name}</span>
              <span className="text-[11px] text-[#6E7A76]">
                {log.action} • {log.entity_type}
                {log.reason === undefined || log.reason === '' ? '' : ` • ${log.reason}`}
              </span>
            </div>
            <span className="shrink-0 font-mono text-[11px] text-[#6E7A76]">
              {formatAuditStamp(log.created_at)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Gate-duty roster panel backed by GET /duty-assignments (admin-only route).
 *
 * @param props - Selected date, active assignments, pending flag.
 * @returns Duty feed table styled like the original picket log.
 */
function DashboardDutyFeedCard(props: {
  date: string;
  duties: DutyAssignment[];
  isPending: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4E8E6] bg-white shadow-xs">
      <div className="flex items-center justify-between border-b border-[#E4E8E6] bg-[#F8F9F8] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-[#E9F0EE] text-[#173F36]">
            <Clock className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#173F36]">
              Penugasan Piket Gerbang — {formatSchoolDate(props.date)}
            </h3>
            <p className="text-[11px] text-[#6E7A76]">
              Rotasi piket aktif pada tanggal terpilih (hari {formatWeekdayShort(props.date)})
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/piket"
          className="flex items-center gap-1 text-xs font-bold text-[#173F36] hover:underline"
        >
          Kelola Jadwal Piket
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-[#E4E8E6] text-xs">
        {props.duties.length === 0 ? (
          <div className="px-5 py-6 text-center text-[11px] text-[#6E7A76]">
            {props.isPending
              ? 'Memuat penugasan piket…'
              : 'Belum ada guru piket yang ditugaskan pada tanggal ini.'}
          </div>
        ) : (
          props.duties.map((duty) => (
            <div
              className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-[#F8F9F8]"
              key={duty.id}
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-[#173F36] text-xs font-bold text-white">
                  {initialsOf(duty.teacher_name)}
                </div>
                <div>
                  <span className="block font-bold text-[#111816]">{duty.teacher_name}</span>
                  <span className="text-[11px] text-[#6E7A76]">{dutyPeriodText(duty)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* shortcut: no backend duty check-in log endpoint, keep '—' for the clock */}
                <span className="font-mono font-semibold text-[#173F36]">—</span>
                <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Bertugas
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page shell
// ---------------------------------------------------------------------------

/**
 * Attendly Main Administrative Executive Overview Dashboard.
 * All numbers come from GET /dashboard (date + optional class scope); the
 * duty panel, class filter and audit feed render only for admin sessions.
 *
 * @returns Dashboard JSX element.
 */
export function AttendlyDashboardOverview() {
  const { user, roles } = useAuth();
  const userName = greetingName(user);
  const isAdmin = roles.includes('admin');

  const [date, setDate] = useState<string>(localTodayIso());
  const [classId, setClassId] = useState<string>('');

  const dashboardQuery = useDashboard({
    date,
    ...(classId === '' ? {} : { class_id: classId }),
  });
  const dutyQuery = useDutyAssignments(date, isAdmin);

  const { data } = dashboardQuery;
  const kpi = data === undefined ? null : attendanceKpi(data);
  const duties = dutyQuery.data ?? [];
  const recentActivity = data?.recent_activity;
  const errorMessage = dashboardErrorMessage(dashboardQuery.error);

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

        {/* Date Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl border border-[#E4E8E6] bg-white px-3.5 py-2 text-xs font-semibold text-[#173F36] shadow-xs">
            <Calendar className="size-4 text-[#785a00]" />
            <input
              aria-label="Tanggal ikhtisar"
              className="bg-transparent font-semibold text-[#173F36] outline-none"
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
              }}
            />
            <span className="size-1 rounded-full bg-[#173F36]" />
            <span className="text-[#6E7A76]">Akses: {roleLabel(data?.role)}</span>
          </div>
          {isAdmin ? <DashboardClassFilter value={classId} onChange={setClassId} /> : null}
        </div>
      </div>

      {dashboardQuery.isError ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5 text-xs font-semibold text-red-800">
          <span>{errorMessage}</span>
          <button
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 font-bold text-red-800 transition-colors hover:bg-red-100"
            type="button"
            onClick={() => {
              void dashboardQuery.refetch();
            }}
          >
            Coba Lagi
          </button>
        </div>
      ) : null}

      <DashboardKpiGrid data={data} duties={duties} isAdmin={isAdmin} kpi={kpi} />

      {/* Attendance Trend + Late/Unrecorded Lists */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DashboardTrendCard isPending={dashboardQuery.isPending} trend={data?.trend ?? []} />
        <div className="space-y-4">
          <DashboardLateCard
            isPending={dashboardQuery.isPending}
            students={data?.late_students ?? []}
          />
          <DashboardUnrecordedCard
            isPending={dashboardQuery.isPending}
            students={data?.unrecorded_students ?? []}
          />
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
                Kelola pendidik, penugasan wali kelas, jadwal piket gerbang, import Excel, dan akses
                sistem.
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

      {/* Recent Audit Activity — only present in the payload for admins */}
      {recentActivity === undefined || recentActivity.length === 0 ? null : (
        <DashboardActivityCard logs={recentActivity} />
      )}

      {/* Operational duty feed — admin only (GET /duty-assignments is admin-gated) */}
      {isAdmin ? (
        <DashboardDutyFeedCard date={date} duties={duties} isPending={dutyQuery.isPending} />
      ) : null}
    </div>
  );
}
