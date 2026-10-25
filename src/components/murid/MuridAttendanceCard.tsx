'use client';

import { CalendarDays } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { lastNDaysRange, useMyAttendanceSummary } from '@/lib/api/murid';

// Computed once per page load: the portal always opens on the trailing 30 days.
const ATTENDANCE_RANGE = lastNDaysRange(30);

const SUMMARY_TILES: { key: 'present' | 'late' | 'sick' | 'excused' | 'absent'; label: string }[] =
  [
    { key: 'present', label: 'Hadir' },
    { key: 'late', label: 'Terlambat' },
    { key: 'sick', label: 'Sakit' },
    { key: 'excused', label: 'Izin' },
    { key: 'absent', label: 'Alpa' },
  ];

const formatDateId = (value: string): string =>
  new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(value),
  );

/**
 * Rekap presensi card — GET /my/attendance-summary for the last 30 days,
 * rendered as five status tiles plus the attendance percentage.
 * @returns The card element.
 */
export function MuridAttendanceCard() {
  const summary = useMyAttendanceSummary(ATTENDANCE_RANGE);
  const totals = summary.data?.totals;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="size-4 text-[#173F36]" />
          Rekap Presensi 30 Hari Terakhir
        </CardTitle>
        <CardDescription>
          {summary.data === undefined
            ? 'Memuat rentang periode…'
            : `${formatDateId(summary.data.from)} – ${formatDateId(summary.data.to)}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {summary.isPending && <Skeleton className="h-20 w-full rounded-xl" />}
        {summary.isError && (
          <p className="text-sm text-red-600">Rekap presensi gagal dimuat. Coba muat ulang.</p>
        )}
        {totals === undefined && !summary.isPending && !summary.isError && (
          <p className="text-sm text-[#6E7A76]">Belum ada data presensi pada periode ini.</p>
        )}
        {totals !== undefined && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {SUMMARY_TILES.map((tile) => (
              <div
                key={tile.key}
                className="rounded-xl border border-[#E4E8E6] bg-[#F8F9F8] p-3 text-center"
              >
                <p className="text-[11px] font-semibold tracking-wide text-[#6E7A76]">
                  {tile.label}
                </p>
                <p className="text-xl font-extrabold text-[#173F36]">{totals[tile.key]}</p>
              </div>
            ))}
            <div className="rounded-xl border border-[#F2C96C]/50 bg-[#FDF8ED] p-3 text-center">
              <p className="text-[11px] font-semibold tracking-wide text-[#785a00]">Kehadiran</p>
              <p className="text-xl font-extrabold text-[#173F36]">
                {totals.attendance_percentage.toLocaleString('id-ID')}%
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
