import { Filter, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CalendarDayInfo, DayAttendanceStatus, StudentMatrixRow } from '@/types/rekap';

function renderStatusBadge(status: DayAttendanceStatus | undefined) {
  if (status === undefined) {
    return <span className="font-caption text-text-muted text-[10px]">-</span>;
  }
  switch (status) {
    case 'H': {
      return (
        <span className="bg-status-present font-caption inline-flex size-6 items-center justify-center rounded text-xs font-semibold text-pine-deep">
          H
        </span>
      );
    }
    case 'T': {
      return (
        <span className="bg-secondary-fixed font-caption inline-flex size-6 items-center justify-center rounded text-xs font-semibold text-[#78350F]">
          T
        </span>
      );
    }
    case 'S': {
      return (
        <span className="bg-status-permission font-caption inline-flex size-6 items-center justify-center rounded text-xs font-semibold text-[#1E3A8A]">
          S
        </span>
      );
    }
    case 'I': {
      return (
        <span className="bg-status-active/40 font-caption inline-flex size-6 items-center justify-center rounded text-xs font-semibold text-[#581C87]">
          I
        </span>
      );
    }
    case 'A': {
      return (
        <span className="bg-status-absent font-caption text-error inline-flex size-6 items-center justify-center rounded text-xs font-bold">
          A
        </span>
      );
    }
    case 'L': {
      return <span className="font-caption text-text-muted text-[10px]">-</span>;
    }
    default: {
      return <span className="font-caption text-text-muted text-[10px]">-</span>;
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
    <section className="bg-surface-card flex flex-col overflow-hidden rounded-2xl shadow-xs">
      {/* Table Header Filter & Info Bar */}
      <div className="bg-canvas-base flex flex-col items-start justify-between gap-4 border-b border-border-subtle p-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-text-primary text-sm font-bold sm:text-base">
            {t('matrix_title')}
          </span>
          <span className="bg-surface-card font-caption text-text-muted rounded-full px-2.5 py-0.5 text-xs font-medium shadow-xs">
            {t('matrix_total_students', { count: props.students.length })}
          </span>
          <span className="font-caption text-text-muted hidden items-center gap-1 text-[11px] md:inline-flex">
            <span className="bg-surface-container size-2 rounded" />
            {t('matrix_weekend_note')}
          </span>
          <span className="font-caption text-text-muted hidden items-center gap-1 text-[11px] md:inline-flex">
            <span className="size-2 rounded bg-amber-surface" />
            {t('matrix_eval_note')}
          </span>
        </div>

        {/* Search & Status Quick Filter */}
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="text-text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <input
              className="bg-surface-card text-text-primary placeholder:text-text-muted h-9 w-full rounded-xl pr-3 pl-9 text-xs shadow-xs focus:ring-2 focus:ring-pine-deep/15 focus:outline-none"
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
              className="bg-surface-card h-9 cursor-pointer appearance-none rounded-xl pr-7 pl-3 text-xs font-medium text-pine-deep shadow-xs focus:outline-none"
              value={props.statusFilter}
              onChange={(e) => {
                props.onStatusFilterChange(
                  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- value comes from the controlled <option> list below
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
        <table className="w-full border-collapse text-left text-xs whitespace-nowrap">
          <thead className="text-text-primary sticky top-0 z-30 bg-surface-container-low font-semibold shadow-xs">
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
              <th className="w-12 px-2 py-3.5 text-center font-bold" scope="col">
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
                  <div className="font-caption text-text-muted text-[9px] font-normal">
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
                className="text-error sticky right-[180px] z-40 w-10 bg-surface-container-low px-2 py-3.5 text-center font-bold"
                scope="col"
                title="Alpa (A)"
              >
                A
              </th>
              <th
                className="text-text-primary sticky right-[115px] z-40 w-16 bg-surface-container-low px-3 py-3.5 text-center font-bold"
                scope="col"
              >
                {t('col_percentage')}
              </th>
              <th
                className="text-text-primary sticky right-0 z-40 w-28 bg-surface-container-low px-4 py-3.5 text-center font-bold"
                scope="col"
              >
                {t('col_rapor_status')}
              </th>
            </tr>
          </thead>

          <tbody className="text-text-primary divide-y divide-border-subtle/60">
            {props.students.map((student, idx) => (
              <tr
                key={student.id}
                className="group hover:bg-canvas-base/80 cursor-pointer transition-colors"
                onClick={() => {
                  props.onSelectStudent(student);
                }}
              >
                {/* Sticky Left Cells */}
                <td className="bg-surface-card text-text-muted group-hover:bg-canvas-base sticky left-0 z-20 px-3 py-3 text-center font-medium">
                  {idx + 1}
                </td>
                <td className="bg-surface-card text-text-muted group-hover:bg-canvas-base sticky left-12 z-20 px-3 py-3 font-mono text-[11px]">
                  {student.nis}
                </td>
                {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label -- table cell groups the row's avatar, name and action controls */}
                <td className="bg-surface-card text-text-primary group-hover:bg-canvas-base sticky left-40 z-20 px-4 py-3 font-semibold shadow-[4px_0_12px_rgba(0,0,0,0.03)]">
                  <div className="flex items-center gap-2">
                    <span className="font-caption flex size-6 shrink-0 items-center justify-center rounded-full bg-pine-light text-[10px] font-bold text-pine-deep">
                      {student.initials}
                    </span>
                    <span className="truncate">{student.name}</span>
                  </div>
                </td>
                <td className="text-text-muted px-2 py-3 text-center">{student.gender}</td>

                {/* Day Cells (1..31) */}
                {props.days.map((d) => (
                  <td
                    key={d.dayNumber}
                    className={`p-1 text-center ${d.isWeekend ? 'bg-surface-container/60' : ''}`}
                  >
                    {renderStatusBadge(student.attendanceByDay[d.dayNumber])}
                  </td>
                ))}

                {/* Sticky Right Cells (Aggregates) */}
                <td className="bg-surface-card group-hover:bg-canvas-base sticky right-[340px] z-20 px-2 py-3 text-center font-bold text-pine-deep shadow-[-4px_0_12px_rgba(0,0,0,0.03)]">
                  {student.totalHadir}
                </td>
                <td className="bg-surface-card group-hover:bg-canvas-base sticky right-[300px] z-20 px-2 py-3 text-center font-bold text-[#78350F]">
                  {student.totalTerlambat}
                </td>
                <td className="bg-surface-card group-hover:bg-canvas-base sticky right-[260px] z-20 px-2 py-3 text-center font-bold text-[#1E3A8A]">
                  {student.totalSakit}
                </td>
                <td className="bg-surface-card text-text-muted group-hover:bg-canvas-base sticky right-[220px] z-20 px-2 py-3 text-center font-medium">
                  {student.totalIzin}
                </td>
                <td className="bg-surface-card text-error group-hover:bg-canvas-base sticky right-[180px] z-20 px-2 py-3 text-center font-medium">
                  {student.totalAlpa}
                </td>
                <td className="bg-surface-card text-text-primary group-hover:bg-canvas-base sticky right-[115px] z-20 px-3 py-3 text-center font-bold">
                  {student.percentage}%
                </td>
                <td className="bg-surface-card group-hover:bg-canvas-base sticky right-0 z-20 px-3 py-3 text-center">
                  {student.raporStatus === 'safe' && (
                    <span className="bg-status-present/60 font-caption inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-pine-deep">
                      {t('status_safe')}
                    </span>
                  )}
                  {student.raporStatus === 'warning' && (
                    <span className="font-caption inline-flex items-center rounded-full bg-amber-surface px-2.5 py-0.5 text-[11px] font-semibold text-amber-dark">
                      {t('status_warning')}
                    </span>
                  )}
                  {student.raporStatus === 'critical' && (
                    <span className="bg-status-absent/60 font-caption text-error inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
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
