'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { DateRangeParams } from '@/lib/api/murid';
import { attendanceStatusLabel } from '@/lib/api/murid';
import {
  PARENT_PAGE_SIZE,
  formatCheckInTime,
  portalErrorMessage,
  useParentAttendance,
  useParentAttendanceSummary,
  validateDateRange,
} from '@/lib/api/parent';

const SUMMARY_TILES: { key: 'present' | 'late' | 'sick' | 'excused' | 'absent'; label: string }[] =
  [
    { key: 'present', label: 'Hadir' },
    { key: 'late', label: 'Terlambat' },
    { key: 'sick', label: 'Sakit' },
    { key: 'excused', label: 'Izin' },
    { key: 'absent', label: 'Alpa' },
  ];

/**
 * Daily attendance of one linked child: per-status totals plus the paged
 * day-by-day table (GET /parent/children/:id/attendance-summary and
 * GET /parent/children/:id/attendance). Nothing is requested until both the
 * child and a valid date range are set.
 *
 * @param props - Section inputs.
 * @param props.childId - Selected linked student id.
 * @param props.range - `from`/`to` picked in the portal header.
 * @returns Attendance card element.
 */
export function ParentAttendanceSection(props: { childId: string; range: DateRangeParams }) {
  const [offset, setOffset] = useState(0);
  const rangeError = validateDateRange(props.range);
  const summary = useParentAttendanceSummary(props.childId, props.range);
  const list = useParentAttendance(props.childId, props.range, {
    limit: PARENT_PAGE_SIZE,
    offset,
  });
  const totals = summary.data?.totals;
  const rows = list.data?.data ?? [];
  const total = list.data?.total ?? 0;
  const lastOffset = Math.max(Math.ceil(total / PARENT_PAGE_SIZE) - 1, 0) * PARENT_PAGE_SIZE;

  if (rangeError !== null) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-rose-700">{rangeError}</CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rekap Kehadiran</CardTitle>
          <CardDescription>
            {summary.data === undefined
              ? 'Memuat rentang periode…'
              : `${summary.data.from} sampai ${summary.data.to}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary.isPending && <Skeleton className="h-20 w-full rounded-xl" />}
          {summary.isError && (
            <p className="text-sm text-rose-700">
              {portalErrorMessage(summary.error, 'Rekap kehadiran gagal dimuat.')}
            </p>
          )}
          {totals !== undefined && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {SUMMARY_TILES.map((tile) => (
                <div
                  key={tile.key}
                  className="rounded-xl border border-border-control bg-surface-container-low p-3 text-center"
                >
                  <p className="text-[11px] font-semibold tracking-wide text-text-muted">
                    {tile.label}
                  </p>
                  <p className="text-xl font-extrabold text-pine-deep">{totals[tile.key]}</p>
                </div>
              ))}
              <div className="rounded-xl border border-amber-300/60 bg-amber-50 p-3 text-center">
                <p className="text-[11px] font-semibold tracking-wide text-amber-800">Kehadiran</p>
                <p className="text-xl font-extrabold text-pine-deep">
                  {totals.attendance_percentage.toLocaleString('id-ID')}%
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detail Harian</CardTitle>
          <CardDescription>{total} hari tercatat pada rentang ini.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {list.isPending && <Skeleton className="mx-6 my-6 h-32 w-[calc(100%-3rem)] rounded-xl" />}
          {list.isError && (
            <p className="px-6 py-6 text-sm text-rose-700">
              {portalErrorMessage(list.error, 'Daftar kehadiran gagal dimuat.')}
            </p>
          )}
          {list.data !== undefined && rows.length === 0 && (
            <p className="px-6 py-6 text-sm text-text-muted">
              Belum ada catatan kehadiran pada rentang ini.
            </p>
          )}
          {rows.length > 0 && (
            <>
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low text-[11px] font-bold tracking-wide text-text-muted uppercase">
                  <tr>
                    <th className="px-6 py-3">Tanggal</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Jam Masuk</th>
                    <th className="px-6 py-3">Kelas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-control">
                  {rows.map((row) => (
                    <tr key={`${row.date}-${row.class_id}`}>
                      <td className="px-6 py-2.5 font-semibold text-text-primary">{row.date}</td>
                      <td className="px-3 py-2.5 text-text-primary">
                        {attendanceStatusLabel(row.status)}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-text-primary">
                        {formatCheckInTime(row.check_in_time)}
                      </td>
                      <td className="px-6 py-2.5 text-text-muted">
                        {row.class_name === '' ? '—' : row.class_name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between gap-3 border-t border-border-control px-6 py-3">
                <p className="text-[11px] font-semibold text-text-muted">
                  Menampilkan {offset + 1}–{offset + rows.length} dari {total} hari
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={offset === 0 || list.isFetching}
                    onClick={() => {
                      setOffset((prev) => Math.max(prev - PARENT_PAGE_SIZE, 0));
                    }}
                    className="cursor-pointer rounded-xl border border-border-control bg-surface-card px-3 py-1.5 text-xs font-bold text-pine-deep transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>
                  <button
                    type="button"
                    disabled={offset >= lastOffset || list.isFetching}
                    onClick={() => {
                      setOffset((prev) => Math.min(prev + PARENT_PAGE_SIZE, lastOffset));
                    }}
                    className="cursor-pointer rounded-xl border border-border-control bg-surface-card px-3 py-1.5 text-xs font-bold text-pine-deep transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
