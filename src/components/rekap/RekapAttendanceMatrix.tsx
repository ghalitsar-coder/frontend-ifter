import { Filter, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CalendarDayInfo, DayAttendanceStatus, StudentMatrixRow } from '@/types/rekap';

function renderStatusBadge(status: DayAttendanceStatus | undefined) {
  switch (status) {
    case 'H': {
      return (
        <span className="inline-flex size-6 items-center justify-center rounded bg-status-present font-caption text-xs font-semibold text-pine-deep">
          H
        </span>
      );
    }
    case 'T': {
      return (
        <span className="inline-flex size-6 items-center justify-center rounded bg-secondary-fixed font-caption text-xs font-semibold text-[#78350F]">
          T
        </span>
      );
    }
    case 'S': {
      return (
        <span className="inline-flex size-6 items-center justify-center rounded bg-status-permission font-caption text-xs font-semibold text-[#1E3A8A]">
          S
        </span>
      );
    }
    case 'I': {
      return (
        <span className="inline-flex size-6 items-center justify-center rounded bg-status-active/40 font-caption text-xs font-semibold text-[#581C87]">
          I
        </span>
      );
    }
    case 'A': {
      return (
        <span className="inline-flex size-6 items-center justify-center rounded bg-status-absent font-caption text-xs font-bold text-error">
          A
        </span>
      );
    }
    case 'L': {
      return <span className="font-caption text-[10px] text-text-muted">-</span>;
    }
    default: {
      return <span className="font-caption text-[10px] text-text-muted">-</span>;
    }
  }
}

/**
 * Scrollable Horizontal Attendance Matrix Grid with Sticky Headers & Aggregates.
 * @param props - Component properties.
 * @returns Rendered Attendance Matrix component.
 */
export function RekapAttendanceMatrix(props: {
  days: CalendarDayInfo[];
  students: StudentMatrixRow[];
  searchQuery: string;
  statusFilter: 'all' | 'safe' | 'warning' | 'critical';
  onSearchChange: (search: string) => void;
  onStatusFilterChange: (status: 'all' | 'safe' | 'warning' | 'critical') => void;
  onSelectStudent: (student: StudentMatrixRow) => void;
}) {
  const t = useTranslations('RekapPage');

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl bg-surface-card shadow-xs">
      {/* Table Header Filter & Info Bar */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-border-subtle bg-canvas-base p-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-text-primary sm:text-base">
            {t('matrix_title')}
          </span>
          <span className="rounded-full bg-surface-card px-2.5 py-0.5 font-caption text-xs font-medium text-text-muted shadow-xs">
            {t('matrix_total_students', { count: props.students.length })}
          </span>
          <span className="hidden items-center gap-1 font-caption text-[11px] text-text-muted md:inline-flex">
            <span className="size-2 rounded bg-surface-container" />
            {t('matrix_weekend_note')}
          </span>
          <span className="hidden items-center gap-1 font-caption text-[11px] text-text-muted md:inline-flex">
            <span className="size-2 rounded bg-amber-surface" />
            {t('matrix_eval_note')}
          </span>
        </div>

        {/* Search & Status Quick Filter */}
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
            <input
              className="h-9 w-full rounded-xl bg-surface-card pr-3 pl-9 text-xs text-text-primary placeholder:text-text-muted shadow-xs focus:outline-none focus:ring-2 focus:ring-pine-deep/15"
              placeholder={t('search_placeholder')}
              type="search"
              value={props.searchQuery}
              onChange={(e) => {
                props.onSearchChange(e.target.value);
              }}
            />
          </div>

          <div className="relative">
            <select
              aria-label={t('filter_all_status')}
              className="h-9 cursor-pointer appearance-none rounded-xl bg-surface-card pr-7 pl-3 text-xs font-medium text-pine-deep shadow-xs focus:outline-none"
              value={props.statusFilter}
              onChange={(e) => {
                props.onStatusFilterChange(
                  e.target.value as 'all' | 'safe' | 'warning' | 'critical',
                );
              }}
            >
              <option value="all">{t('filter_all_status')}</option>
              <option value="safe">{t('filter_safe')}</option>
              <option value="warning">{t('filter_warning')}</option>
              <option value="critical">{t('filter_critical')}</option>
            </select>
            <Filter className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-pine-deep" />
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Table */}
      <div className="relative max-h-[640px] w-full overflow-x-auto scroll-smooth">
        <table className="w-full border-collapse text-left whitespace-nowrap text-xs">
          <thead className="sticky top-0 z-30 bg-surface-container-low font-semibold text-text-primary shadow-xs">
            <tr>
              {/* Sticky Left Headers */}
              <th
                className="sticky left-0 z-40 w-12 bg-surface-container-low px-3 py-3.5 text-center font-bold"
                scope="col"
              >
                {t('col_no')}
              </th>
              <th
                className="sticky left-12 z-40 w-28 bg-surface-container-low px-3 py-3.5 font-bold"
                scope="col"
              >
                {t('col_nis')}
              </th>
              <th
                className="sticky left-40 z-40 min-w-[200px] bg-surface-container-low px-4 py-3.5 font-bold shadow-[4px_0_12px_rgba(0,0,0,0.03)]"
                scope="col"
              >
                {t('col_student_name')}
              </th>
              <th
                className="w-12 px-2 py-3.5 text-center font-bold"
                scope="col"
              >
                {t('col_gender')}
              </th>

              {/* Day Columns (1..31) */}
              {props.days.map((d) => (
                <th
                  key={d.dayNumber}
                  className={`min-w-[32px] px-1 py-3 text-center text-[11px] ${
                    d.isWeekend ? 'bg-surface-container text-text-muted' : ''
                  }`}
                  scope="col"
                >
                  {d.dayNumber}
                  <div className="font-caption text-[9px] font-normal text-text-muted">
                    {d.dayNameShort}
                  </div>
                </th>
              ))}

              {/* Sticky Right Aggregates */}
              <th
                className="sticky right-[340px] z-40 w-10 bg-surface-container-low px-2 py-3.5 text-center font-bold text-pine-deep shadow-[-4px_0_12px_rgba(0,0,0,0.03)]"
                scope="col"
                title="Hadir (H)"
              >
                H
              </th>
              <th
                className="sticky right-[300px] z-40 w-10 bg-surface-container-low px-2 py-3.5 text-center font-bold text-[#78350F]"
                scope="col"
                title="Terlambat (T)"
              >
                T
              </th>
              <th
                className="sticky right-[260px] z-40 w-10 bg-surface-container-low px-2 py-3.5 text-center font-bold text-[#1E3A8A]"
                scope="col"
                title="Sakit (S)"
              >
                S
              </th>
              <th
                className="sticky right-[220px] z-40 w-10 bg-surface-container-low px-2 py-3.5 text-center font-bold text-[#581C87]"
                scope="col"
                title="Izin (I)"
              >
                I
              </th>
              <th
                className="sticky right-[180px] z-40 w-10 bg-surface-container-low px-2 py-3.5 text-center font-bold text-error"
                scope="col"
                title="Alpa (A)"
              >
                A
              </th>
              <th
                className="sticky right-[115px] z-40 w-16 bg-surface-container-low px-3 py-3.5 text-center font-bold text-text-primary"
                scope="col"
              >
                {t('col_percentage')}
              </th>
              <th
                className="sticky right-0 z-40 w-28 bg-surface-container-low px-4 py-3.5 text-center font-bold text-text-primary"
                scope="col"
              >
                {t('col_rapor_status')}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border-subtle/60 text-text-primary">
            {props.students.map((student, idx) => (
              <tr
                key={student.id}
                className="group cursor-pointer transition-colors hover:bg-canvas-base/80"
                onClick={() => {
                  props.onSelectStudent(student);
                }}
              >
                {/* Sticky Left Cells */}
                <td className="sticky left-0 z-20 bg-surface-card px-3 py-3 text-center font-medium text-text-muted group-hover:bg-canvas-base">
                  {idx + 1}
                </td>
                <td className="sticky left-12 z-20 bg-surface-card px-3 py-3 font-mono text-[11px] text-text-muted group-hover:bg-canvas-base">
                  {student.nis}
                </td>
                <td className="sticky left-40 z-20 bg-surface-card px-4 py-3 font-semibold text-text-primary shadow-[4px_0_12px_rgba(0,0,0,0.03)] group-hover:bg-canvas-base">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-pine-light font-caption text-[10px] font-bold text-pine-deep">
                      {student.initials}
                    </span>
                    <span className="truncate">{student.name}</span>
                  </div>
                </td>
                <td className="px-2 py-3 text-center text-text-muted">
                  {student.gender}
                </td>

                {/* Day Cells (1..31) */}
                {props.days.map((d) => (
                  <td
                    key={d.dayNumber}
                    className={`p-1 text-center ${
                      d.isWeekend ? 'bg-surface-container/60' : ''
                    }`}
                  >
                    {renderStatusBadge(student.attendanceByDay[d.dayNumber])}
                  </td>
                ))}

                {/* Sticky Right Cells (Aggregates) */}
                <td className="sticky right-[340px] z-20 bg-surface-card px-2 py-3 text-center font-bold text-pine-deep shadow-[-4px_0_12px_rgba(0,0,0,0.03)] group-hover:bg-canvas-base">
                  {student.totalHadir}
                </td>
                <td className="sticky right-[300px] z-20 bg-surface-card px-2 py-3 text-center font-bold text-[#78350F] group-hover:bg-canvas-base">
                  {student.totalTerlambat}
                </td>
                <td className="sticky right-[260px] z-20 bg-surface-card px-2 py-3 text-center font-bold text-[#1E3A8A] group-hover:bg-canvas-base">
                  {student.totalSakit}
                </td>
                <td className="sticky right-[220px] z-20 bg-surface-card px-2 py-3 text-center font-medium text-text-muted group-hover:bg-canvas-base">
                  {student.totalIzin}
                </td>
                <td className="sticky right-[180px] z-20 bg-surface-card px-2 py-3 text-center font-medium text-error group-hover:bg-canvas-base">
                  {student.totalAlpa}
                </td>
                <td className="sticky right-[115px] z-20 bg-surface-card px-3 py-3 text-center font-bold text-text-primary group-hover:bg-canvas-base">
                  {student.percentage}%
                </td>
                <td className="sticky right-0 z-20 bg-surface-card px-3 py-3 text-center group-hover:bg-canvas-base">
                  {student.raporStatus === 'safe' && (
                    <span className="inline-flex items-center rounded-full bg-status-present/60 px-2.5 py-0.5 font-caption text-[11px] font-semibold text-pine-deep">
                      {t('status_safe')}
                    </span>
                  )}
                  {student.raporStatus === 'warning' && (
                    <span className="inline-flex items-center rounded-full bg-amber-surface px-2.5 py-0.5 font-caption text-[11px] font-semibold text-amber-dark">
                      {t('status_warning')}
                    </span>
                  )}
                  {student.raporStatus === 'critical' && (
                    <span className="inline-flex items-center rounded-full bg-status-absent/60 px-2.5 py-0.5 font-caption text-[11px] font-semibold text-error">
                      {t('status_critical')}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
