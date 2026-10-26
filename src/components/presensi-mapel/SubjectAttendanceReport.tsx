'use client';

import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { attendanceStatusLabel } from '@/lib/api/murid';
import {
  mapSessionError,
  percentageLabel,
  useSubjectReport,
  validateRange,
} from '@/lib/api/presensi-mapel';
import type { ReportFilter } from '@/lib/api/presensi-mapel';
import { MapelFilterBar, emptyMapelFilter } from './MapelFilterBar';
import type { MapelFilterValue } from './MapelFilterBar';

const COLUMNS = [
  { key: 'present', label: attendanceStatusLabel('present') },
  { key: 'late', label: attendanceStatusLabel('late') },
  { key: 'sick', label: attendanceStatusLabel('sick') },
  { key: 'excused', label: attendanceStatusLabel('excused') },
  { key: 'absent', label: attendanceStatusLabel('absent') },
] as const;

/**
 * Recap of GET /reports/subject-attendance: one row per teaching assignment
 * with the per-status counters and the attendance percentage of the range,
 * closed by the totals row the backend computes.
 *
 * @returns Recap card.
 */
export function SubjectAttendanceReport() {
  const [filter, setFilter] = useState<MapelFilterValue>(emptyMapelFilter);

  const reportFilter: ReportFilter = {
    from: filter.from,
    to: filter.to,
    ...(filter.class_id === '' ? {} : { class_id: filter.class_id }),
    ...(filter.subject_id === '' ? {} : { subject_id: filter.subject_id }),
    ...(filter.teacher_id === '' ? {} : { teacher_id: filter.teacher_id }),
  };

  const reportQuery = useSubjectReport(reportFilter);
  const report = reportQuery.data;
  const rows = report?.data ?? [];
  // A disabled query never settles, so the reason is shown instead of a skeleton.
  const rangeError = validateRange(reportFilter);

  return (
    <div className="flex flex-col gap-4">
      <MapelFilterBar
        value={filter}
        onChange={(next) => {
          setFilter(next);
        }}
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-border-control bg-surface-card p-4 shadow-xs sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-control pb-3">
          <h2 className="text-sm font-bold text-pine-deep sm:text-base">
            Rekap Kehadiran per Mapel
          </h2>
          {report !== undefined && (
            <p className="text-[11px] font-semibold text-text-muted">
              {report.from} s.d. {report.to} · {rows.length} penugasan
            </p>
          )}
        </div>

        {rangeError !== null && (
          <p className="py-8 text-center text-sm text-text-muted">{rangeError}</p>
        )}
        {reportQuery.isPending && rangeError === null && (
          <Skeleton className="h-40 w-full rounded-xl" />
        )}
        {reportQuery.isError && (
          <p className="text-sm text-rose-700">{mapSessionError(reportQuery.error, 'session')}</p>
        )}
        {!reportQuery.isPending &&
          !reportQuery.isError &&
          rangeError === null &&
          rows.length === 0 && (
            <p className="py-8 text-center text-sm text-text-muted">
              Belum ada sesi absensi pada rentang dan filter ini. Rekap menghitung sesi yang sudah
              memiliki record.
            </p>
          )}

        {rows.length > 0 && report !== undefined && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-[11px] font-bold tracking-wide text-text-muted uppercase">
                <tr>
                  <th className="px-4 py-3">Mapel</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3">Guru</th>
                  <th className="px-4 py-3 text-right">Sesi</th>
                  {COLUMNS.map((column) => (
                    <th key={column.key} className="px-3 py-3 text-right">
                      {column.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right">Rekap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-control">
                {rows.map((row) => (
                  <tr key={row.teaching_assignment_id}>
                    <td className="px-4 py-2.5 text-text-primary">
                      {row.subject_code} — {row.subject_name}
                    </td>
                    <td className="px-4 py-2.5 text-text-primary">{row.class_name}</td>
                    <td className="px-4 py-2.5 text-text-primary">{row.teacher_name}</td>
                    <td className="px-4 py-2.5 text-right text-text-primary">{row.sessions}</td>
                    {COLUMNS.map((column) => (
                      <td key={column.key} className="px-3 py-2.5 text-right text-text-primary">
                        {row[column.key]}
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-right font-bold text-pine-deep">
                      {percentageLabel(row.attendance_percentage)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-surface-container-low font-bold text-pine-deep">
                  <td className="px-4 py-3" colSpan={3}>
                    Total
                  </td>
                  <td className="px-4 py-3 text-right">{report.totals.sessions}</td>
                  {COLUMNS.map((column) => (
                    <td key={column.key} className="px-3 py-3 text-right">
                      {report.totals[column.key]}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    {percentageLabel(report.totals.attendance_percentage)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
