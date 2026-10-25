'use client';

import { Archive, GraduationCap, UserCheck } from 'lucide-react';

/**
 * Metric cards summarising the filtered class list.
 *
 * @param props - Metric values.
 * @param props.total - Classes matching the active filters.
 * @param props.activeCount - Active classes.
 * @param props.archivedCount - Archived classes.
 * @param props.homeroomCount - Classes with an assigned homeroom teacher.
 * @returns Four-card metrics grid.
 */
export function ClassStats(props: {
  total: number;
  activeCount: number;
  archivedCount: number;
  homeroomCount: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <div className="bg-surface-card flex flex-col gap-1.5 rounded-2xl border border-border-control p-4 shadow-xs sm:p-5">
        <span className="text-text-muted flex items-center justify-between text-xs font-medium">
          Total Kelas
          <GraduationCap className="size-4 text-pine-deep" />
        </span>
        <p className="text-xl font-black tracking-tight text-pine-deep sm:text-2xl">
          {props.total}
        </p>
        <span className="text-text-muted text-[11px]">Sesuai filter aktif</span>
      </div>
      <div className="bg-surface-card flex flex-col gap-1.5 rounded-2xl border border-border-control p-4 shadow-xs sm:p-5">
        <span className="text-text-muted flex items-center justify-between text-xs font-medium">
          Kelas Aktif
          <span className="rounded bg-pine-light px-1.5 py-0.5 text-xs font-bold text-pine-deep">
            A
          </span>
        </span>
        <p className="text-xl font-black tracking-tight text-pine-deep sm:text-2xl">
          {props.activeCount}
        </p>
        <span className="text-text-muted text-[11px]">Dapat diberi wali kelas</span>
      </div>
      <div className="bg-surface-card flex flex-col gap-1.5 rounded-2xl border border-border-control p-4 shadow-xs sm:p-5">
        <span className="text-text-muted flex items-center justify-between text-xs font-medium">
          Diarsipkan
          <Archive className="size-4 text-amber-dark" />
        </span>
        <p className="text-xl font-black tracking-tight text-pine-deep sm:text-2xl">
          {props.archivedCount}
        </p>
        <span className="text-text-muted text-[11px]">Riwayat rombel lama</span>
      </div>
      <div className="bg-surface-card flex flex-col gap-1.5 rounded-2xl border border-border-control p-4 shadow-xs sm:p-5">
        <span className="text-text-muted flex items-center justify-between text-xs font-medium">
          Wali Kelas Terisi
          <UserCheck className="size-4 text-pine-deep" />
        </span>
        <p className="text-xl font-black tracking-tight text-pine-deep sm:text-2xl">
          {props.homeroomCount}
        </p>
        <span className="text-text-muted text-[11px]">Dari {props.total} kelas</span>
      </div>
    </div>
  );
}
