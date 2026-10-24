import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Edit,
  ExternalLink,
  FolderOpen,
  MessageCircle,
  PieChart,
  Radio,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { AttendanceSummaryItem, HistoryRecord } from '@/lib/api/dto';
import { mapHistoryToLogs, useStudentDetail, useStudentHistory } from '@/lib/api/master-siswa';
import type { DateRange, StudentRowMetrics } from '@/lib/api/master-siswa';
import type { StudentProfile } from '@/types/masterSiswa';

const TODAY_UI_STATUS: Record<string, string> = {
  present: 'Hadir',
  late: 'Terlambat',
  sick: 'Sakit',
  excused: 'Izin',
  absent: 'Alpa',
};

const STATUS_BADGE_KEYS: Record<
  StudentProfile['status'],
  'status_badge_active' | 'status_badge_mutation' | 'status_badge_alumni'
> = {
  active: 'status_badge_active',
  mutation: 'status_badge_mutation',
  alumni: 'status_badge_alumni',
};

/**
 * Label shown in the "today" pill for a attendance record.
 * @param record - Today's history row, undefined when nothing recorded.
 * @returns Indonesian status label.
 */
function todayStatusLabel(record: HistoryRecord | undefined): string {
  if (record === undefined) {
    return 'Belum tercatat';
  }
  return TODAY_UI_STATUS[record.status] ?? record.status;
}

/**
 * Meta line of the "today" pill (class + check-in time).
 * @param record - Today's history row, undefined when nothing recorded.
 * @returns Indonesian detail line.
 */
function todayMetaLine(record: HistoryRecord | undefined): string {
  if (record === undefined) {
    return 'Menunggu rekap kelas';
  }
  if (record.check_in_at === undefined) {
    return record.class_name;
  }
  const time = new Date(record.check_in_at).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${record.class_name} • ${time} WIB`;
}

/**
 * Days-breakdown recap for the stats bento from the attendance summary row.
 * @param summary - Attendance summary item for this student, optional.
 * @returns Pre-formatted Indonesian counts.
 */
function recapFromSummary(summary: AttendanceSummaryItem | undefined): {
  hadir: string;
  sakitIzin: string;
  alpa: string;
} {
  if (summary === undefined) {
    return { hadir: '0 Hari', sakitIzin: '0 / 0 Hari', alpa: '0 Hari' };
  }
  return {
    hadir: `${(summary.present + summary.late).toString()} Hari`,
    sakitIzin: `${summary.sick.toString()} / ${summary.excused.toString()} Hari`,
    alpa: `${summary.absent.toString()} Hari`,
  };
}

/**
 * Timeline rows: prefer the fetched history window, fall back to mock profile logs.
 * @param historyData - Rows from GET /attendance/history (undefined while loading).
 * @param recentLogs - Optional mock timeline kept on the UI profile.
 * @returns Timeline entries for rendering.
 */
function timelineFor(
  historyData: HistoryRecord[] | undefined,
  recentLogs: StudentProfile['recentLogs'],
): NonNullable<StudentProfile['recentLogs']> {
  if (historyData === undefined) {
    return recentLogs ?? [];
  }
  return mapHistoryToLogs(historyData);
}

/**
 * Color classes for a timeline log badge.
 * @param status - Mapped log status.
 * @returns Tailwind class string.
 */
function logBadgeClass(status: 'hadir' | 'sakit' | 'izin' | 'alpa'): string {
  if (status === 'hadir') {
    return 'border-pine-deep/20 bg-pine-light text-pine-deep';
  }
  if (status === 'izin') {
    return 'border-amber-gold bg-amber-surface text-amber-dark';
  }
  return 'border-rose-200 bg-rose-50 text-rose-800';
}

/**
 * Label for a timeline log badge.
 * @param status - Mapped log status.
 * @returns Indonesian label.
 */
function logBadgeLabel(status: 'hadir' | 'sakit' | 'izin' | 'alpa'): string {
  if (status === 'hadir') {
    return 'Hadir';
  }
  if (status === 'izin') {
    return 'Izin Resmi';
  }
  if (status === 'sakit') {
    return 'Sakit';
  }
  return 'Alpa';
}

/**
 * Editorial inspection modal offering comprehensive academic, attendance, and guardian intelligence.
 * Enrollments, per-day history and discipline stats come from the real API while open.
 *
 * @param props - Component properties.
 * @returns Modal component or null.
 */
export function MasterSiswaQuickDetailModal(props: {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile | null;
  metrics?: StudentRowMetrics;
  range: DateRange;
  onQuickStatusChange?: (student: StudentProfile) => void;
}) {
  const t = useTranslations('MasterSiswaPage');

  const studentId = props.student?.id ?? '';
  const today = new Date().toISOString().slice(0, 10);
  const detailQuery = useStudentDetail(studentId);
  const historyQuery = useStudentHistory(studentId, props.range, 5);
  const todayQuery = useStudentHistory(studentId, { from: today, to: today }, 1);

  if (!props.isOpen || !props.student) {
    return null;
  }

  const { student } = props;
  const summary = props.metrics?.summary;
  const discipline = props.metrics?.discipline;
  const timeline = timelineFor(historyQuery.data, student.recentLogs);
  const todayRecord = todayQuery.data?.[0];
  const enrollments = detailQuery.data === undefined ? [] : detailQuery.data.enrollments;
  const isLoadingEnrollments = detailQuery.data === undefined;
  const recap = recapFromSummary(summary);
  const initials = student.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is already scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-quick-detail-name"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-pine-deep/40 p-3 backdrop-blur-md sm:p-6"
    >
      <div className="bg-surface-card relative my-auto flex max-h-[92vh] w-full max-w-[720px] animate-in flex-col overflow-hidden rounded-3xl border border-border-control shadow-2xl duration-200 zoom-in-95 fade-in">
        {/* Top Warm Glow Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-pine-deep via-amber-gold to-pine-deep" />

        {/* Modal Header */}
        <div className="bg-surface-card relative border-b border-border-control px-6 pt-6 pb-4 sm:px-8">
          {/* Close button */}
          <button
            type="button"
            onClick={props.onClose}
            aria-label={t('btn_close')}
            className="hover:bg-surface-container text-text-muted absolute top-5 right-5 flex size-8 cursor-pointer items-center justify-center rounded-full bg-surface-container-low transition-colors hover:text-pine-deep"
          >
            <X className="size-4" />
          </button>

          {/* Student Identification Banner */}
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <div className="flex size-16 items-center justify-center overflow-hidden rounded-2xl border border-border-control bg-pine-deep text-xl font-black text-white shadow-md sm:size-20">
                {student.avatarUrl ? (
                  <Image
                    src={student.avatarUrl}
                    alt={student.name}
                    width={80}
                    height={80}
                    unoptimized
                    className="size-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <span className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border-2 border-white bg-amber-gold text-pine-deep shadow-xs">
                <Check className="size-3.5 stroke-[3]" />
              </span>
            </div>

            <div className="min-w-0 flex-1 pr-6 sm:pr-0">
              <div className="mb-1 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-pine-light px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-pine-deep uppercase">
                  {t(STATUS_BADGE_KEYS[student.status])}
                </span>
                <span className="text-text-muted text-xs">•</span>
                <span className="rounded-full border border-border-control bg-surface-container-low px-2.5 py-0.5 text-[11px] font-bold text-pine-deep">
                  {student.className}
                </span>
                <span className="text-text-muted text-xs">•</span>
                <span className="text-text-muted text-[11px] font-medium">
                  {t('label_absent_num', { num: student.absentNumber })}
                </span>
                {discipline !== undefined && (
                  <>
                    <span className="text-text-muted text-xs">•</span>
                    <span className="text-[11px] font-bold text-amber-dark">
                      Poin: {discipline.total_points} ({discipline.total_records} kasus)
                    </span>
                  </>
                )}
              </div>

              <h2
                id="modal-quick-detail-name"
                className="truncate text-lg font-bold tracking-tight text-pine-deep sm:text-2xl"
              >
                {student.name}
              </h2>

              <div className="text-text-muted mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-xs">
                <span>
                  NISN: <span className="font-semibold text-pine-deep">{student.nisn}</span>
                </span>
                <span>/</span>
                <span>
                  NIS: <span className="font-semibold text-pine-deep">{student.nis}</span>
                </span>
                {student.nik && (
                  <>
                    <span>/</span>
                    <span>
                      NIK: <span className="font-semibold text-pine-deep">{student.nik}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Today's Attendance Pill Banner (GET /attendance/history?from=today) */}
          <div className="mt-4 flex flex-col justify-between gap-2 rounded-2xl border border-pine-deep/15 bg-pine-light/60 px-4 py-2.5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span
                className={`size-2.5 rounded-full ${todayRecord === undefined ? 'bg-rose-500' : 'animate-pulse bg-pine-deep'}`}
              />
              <div className="flex items-center gap-1.5 text-xs font-semibold text-pine-deep">
                <span>{t('quick_today_status_label')}:</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-pine-deep/20 bg-white px-2.5 py-0.5 text-[11px] font-bold text-pine-deep shadow-2xs">
                  <CheckCircle2 className="size-3 text-pine-deep" />
                  <span>{todayStatusLabel(todayRecord)}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-pine-deep/80">
              <Radio className="size-3.5 text-pine-deep" />
              <span>{todayMetaLine(todayRecord)}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="max-h-[calc(85vh-220px)] space-y-5 overflow-y-auto bg-white px-6 py-5 sm:px-8">
          {/* Section 1: Key Stats Bento Cards */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-pine-deep uppercase">
                {t('quick_stats_title')}
              </span>
              <span className="text-text-muted text-[11px] font-medium">
                {t('quick_stats_semester')}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Bento 1: Attendance rate */}
              <div className="flex flex-col justify-between rounded-2xl border border-border-control bg-surface-container-low/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-xs font-medium">
                    {t('quick_stat_rate_title')}
                  </span>
                  <span className="flex size-6 items-center justify-center rounded-full bg-pine-light text-pine-deep">
                    <TrendingUp className="size-3.5" />
                  </span>
                </div>
                <div className="mt-2.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-pine-deep">
                      {student.semesterAttendanceRate}%
                    </span>
                    <span className="text-[11px] font-bold text-pine-deep">
                      {student.attendanceCategory}
                    </span>
                  </div>
                  <div className="bg-surface-container mt-2 h-1.5 w-full overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full bg-amber-gold transition-all duration-500"
                      style={{ width: `${student.semesterAttendanceRate}%` }}
                    />
                  </div>
                  <p className="text-text-muted mt-1.5 text-[10px]">
                    {t('quick_stat_target_minimum')}
                  </p>
                </div>
              </div>

              {/* Bento 2: Days Breakdown */}
              <div className="flex flex-col justify-between rounded-2xl border border-border-control bg-surface-container-low/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-xs font-medium">
                    {t('quick_stat_recap_title')}
                  </span>
                  <span className="flex size-6 items-center justify-center rounded-full bg-pine-light text-pine-deep">
                    <PieChart className="size-3.5" />
                  </span>
                </div>
                <div className="mt-2.5 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Hadir:</span>
                    <span className="rounded bg-pine-light px-1.5 py-0.5 text-[11px] font-bold text-pine-deep">
                      {recap.hadir}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Sakit / Izin:</span>
                    <span className="text-text-primary text-[11px] font-semibold">
                      {recap.sakitIzin}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Alpa:</span>
                    <span className="text-text-primary text-[11px] font-semibold">
                      {recap.alpa}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bento 3: Punctuality */}
              <div className="flex flex-col justify-between rounded-2xl border border-border-control bg-surface-container-low/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-xs font-medium">
                    {t('quick_stat_average_arrival')}
                  </span>
                  <span className="flex size-6 items-center justify-center rounded-full border border-amber-gold/40 bg-amber-surface text-amber-dark">
                    <Clock className="size-3.5" />
                  </span>
                </div>
                <div className="mt-2.5">
                  <div className="flex items-baseline gap-1">
                    {/* shortcut: no average-arrival aggregate endpoint, keep static display */}
                    <span className="text-xl font-bold text-pine-deep">06:58</span>
                    <span className="text-text-muted text-xs font-medium">WIB</span>
                  </div>
                  <div className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-amber-gold/50 bg-amber-surface px-2 py-0.5 text-[10px] font-bold text-amber-dark">
                    <span>★ {t('quick_stat_ranking_badge')}</span>
                  </div>
                  <p className="text-text-muted mt-1.5 text-[10px]">{t('quick_stat_bell_time')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Recent 5-Day Attendance Log Timeline */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-pine-deep uppercase">
                {t('quick_recent_logs_title')}
              </span>
              <span className="text-text-muted text-[11px]">{t('quick_recent_logs_subtitle')}</span>
            </div>

            <div className="bg-surface-card divide-y divide-border-subtle overflow-hidden rounded-2xl border border-border-control">
              {timeline.length === 0 && (
                <p className="text-text-muted p-4 text-center text-xs">
                  Belum ada catatan presensi pada rentang ini.
                </p>
              )}
              {timeline.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-center justify-between p-3 transition-colors ${
                    log.status === 'izin' ? 'bg-amber-surface/40' : 'hover:bg-pine-light/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-pine-light text-pine-deep">
                      <Check className="size-3.5 font-bold" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-pine-deep">{log.date}</p>
                      <p className="text-text-muted text-[10px]">
                        {log.method} {log.note ? `• ${log.note}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted font-mono text-[11px]">{log.time}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${logBadgeClass(log.status)}`}
                    >
                      {logBadgeLabel(log.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2b: Enrollment History (GET /students/:id → enrollments[]) */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-pine-deep uppercase">
                Riwayat Rombel
              </span>
              <span className="text-text-muted text-[11px]">{enrollments.length} enrollmen</span>
            </div>

            <div className="bg-surface-card divide-y divide-border-subtle overflow-hidden rounded-2xl border border-border-control">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between p-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-pine-light text-pine-deep">
                      <FolderOpen className="size-3.5" />
                    </span>
                    <div>
                      <p className="text-text-primary font-bold">{enrollment.class_name}</p>
                      <p className="text-text-muted text-[10px]">{enrollment.academic_year_name}</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-border-control bg-surface-container-low px-2 py-0.5 text-[10px] font-bold text-pine-deep">
                    {enrollment.end_date === undefined ? 'Aktif' : `Selesai ${enrollment.end_date}`}
                  </span>
                </div>
              ))}
              {isLoadingEnrollments && (
                <p className="text-text-muted p-4 text-center text-xs">Memuat riwayat kelas...</p>
              )}
            </div>
          </section>

          {/* Section 3: Guardian Details & Homeroom Notes */}
          <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {/* Guardian Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-border-control bg-surface-container-low/70 p-4">
              <div>
                <div className="mb-2.5 flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-lg bg-pine-light text-pine-deep">
                    <User className="size-3.5" />
                  </span>
                  <span className="text-[11px] font-bold tracking-wider text-pine-deep uppercase">
                    {t('quick_guardian_title')}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-text-muted block text-[11px]">
                      {t('quick_guardian_name_label')}:
                    </span>
                    <span className="font-bold text-pine-deep">{student.guardian.name}</span>
                    {student.guardian.relation !== '' && (
                      <span className="text-text-muted ml-1 text-[10px]">
                        ({student.guardian.relation})
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px]">
                      {t('quick_guardian_phone_label')}:
                    </span>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-pine-deep">
                        {student.guardian.phone}
                      </span>
                      <span className="py-0.2 rounded bg-emerald-100 px-1.5 text-[9px] font-bold text-emerald-800">
                        WA Ready
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px]">
                      {t('quick_guardian_address_label')}:
                    </span>
                    <span className="text-text-primary line-clamp-2 text-[11px]">
                      {student.guardian.address === '' ? '—' : student.guardian.address}
                    </span>
                  </div>
                </div>
              </div>

              {student.guardian.phone !== '' && (
                <a
                  href={`https://wa.me/${student.guardian.phone.replaceAll(/[^0-9]/gu, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3.5 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border-control bg-white px-3 py-2 text-xs font-bold text-pine-deep shadow-2xs transition-colors hover:bg-pine-light/40"
                >
                  <MessageCircle className="size-3.5" />
                  <span>{t('btn_contact_guardian_wa')}</span>
                  <ExternalLink className="text-text-muted size-3" />
                </a>
              )}
            </div>

            {/* Homeroom Notes Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-amber-gold/40 bg-amber-surface/50 p-4">
              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-lg border border-amber-gold/40 bg-amber-surface text-amber-dark">
                      <Edit className="size-3.5" />
                    </span>
                    <span className="text-[11px] font-bold tracking-wider text-pine-deep uppercase">
                      {t('quick_homeroom_notes_title')}
                    </span>
                  </div>
                  <span className="rounded-full border border-amber-gold/60 bg-amber-surface px-2 py-0.5 text-[10px] font-bold text-amber-dark">
                    Aktif
                  </span>
                </div>
                <blockquote className="text-text-primary rounded-xl border border-amber-gold/30 bg-white p-3 text-xs leading-relaxed italic shadow-2xs">
                  &ldquo;{student.homeroomNotes ?? t('quick_homeroom_default_note')}&rdquo;
                </blockquote>
              </div>

              <div className="text-text-muted mt-3 flex items-center justify-between border-t border-amber-gold/20 pt-2 text-[10px]">
                <span>
                  Wali Kelas:{' '}
                  <span className="font-semibold text-pine-deep">{student.homeroomTeacher}</span>
                </span>
                <span>Semester Ganjil</span>
              </div>
            </div>
          </section>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex shrink-0 flex-col items-center justify-between gap-3 border-t border-border-control bg-surface-container-low px-6 py-3.5 sm:flex-row sm:px-8">
          <button
            type="button"
            onClick={() => {
              if (props.onQuickStatusChange) {
                props.onQuickStatusChange(student);
              }
            }}
            className="hover:bg-surface-container w-full cursor-pointer rounded-xl border border-border-control bg-white px-4 py-2 text-xs font-semibold text-pine-deep shadow-2xs transition-colors sm:w-auto sm:text-sm"
          >
            {t('btn_change_today_status')}
          </button>

          <div className="flex w-full items-center justify-end gap-2.5 sm:w-auto">
            <button
              type="button"
              onClick={props.onClose}
              className="text-text-muted cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold transition-colors hover:text-pine-deep sm:text-sm"
            >
              {t('btn_close')}
            </button>
            <button
              type="button"
              onClick={props.onClose}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-pine-deep px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-pine-hover sm:text-sm"
            >
              <span>{t('btn_full_profile')}</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
