'use client';

import { Archive, GraduationCap, Loader2, Pencil, RotateCcw, UserCheck, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Class } from '@/lib/api/dto';
import type { ClassRow } from '@/lib/api/master-kelas';

export type ClassTableEntry = {
  classRecord: Class;
  row: ClassRow;
};

const initials = (name: string): string =>
  name
    .split(' ')
    .filter((part) => part !== '')
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();

const avatarClass = (hasHomeroom: boolean): string =>
  hasHomeroom ? 'bg-pine-deep/10 text-pine-deep' : 'bg-surface-container-high text-text-muted';

const homeroomTextClass = (hasHomeroom: boolean): string =>
  hasHomeroom ? 'text-text-primary' : 'text-text-muted italic';

const statusBadgeClass = (isActive: boolean): string =>
  isActive
    ? 'border-emerald-300 bg-emerald-100 text-emerald-900'
    : 'border-amber-300 bg-amber-100 text-amber-900';

const statusDotClass = (isActive: boolean): string =>
  isActive ? 'bg-emerald-600' : 'bg-amber-600';

const toggleButtonClass = (isActive: boolean): string =>
  isActive
    ? 'text-text-muted hover:bg-amber-50 hover:text-amber-700'
    : 'text-amber-700 hover:bg-emerald-50 hover:text-emerald-700';

/**
 * Class table with loading / error / empty states and row actions. Read-only
 * roles only get the roster button; write actions require `master_data`.
 *
 * @param props - Table data, state, and action callbacks.
 * @param props.entries - Class records paired with their mapped row.
 * @param props.isLoading - Shows the loading row.
 * @param props.errorMessage - Shows an error row when non-null.
 * @param props.canManage - Whether write actions are rendered.
 * @param props.onViewStudents - Opens the roster modal.
 * @param props.onEdit - Opens the edit modal.
 * @param props.onAssignHomeroom - Opens the homeroom modal.
 * @param props.onToggleStatus - Opens the archive/reactivate confirmation.
 * @returns Table element.
 */
export function ClassTable(props: {
  entries: ClassTableEntry[];
  isLoading: boolean;
  errorMessage: string | null;
  canManage: boolean;
  onViewStudents: (classRecord: Class) => void;
  onEdit: (classRecord: Class) => void;
  onAssignHomeroom: (classRecord: Class) => void;
  onToggleStatus: (classRecord: Class) => void;
}) {
  const renderBody = (): ReactNode => {
    if (props.isLoading) {
      return (
        <tr>
          <td colSpan={6} className="text-text-muted p-10 text-center">
            <span className="inline-flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" /> Memuat data kelas…
            </span>
          </td>
        </tr>
      );
    }
    if (props.errorMessage !== null) {
      return (
        <tr>
          <td colSpan={6} className="p-10 text-center text-sm text-rose-700">
            {props.errorMessage}
          </td>
        </tr>
      );
    }
    if (props.entries.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="text-text-muted p-10 text-center">
            <div className="flex flex-col items-center gap-2">
              <GraduationCap className="text-text-muted/60 size-8" />
              <p className="text-sm font-semibold">Belum ada kelas pada filter ini.</p>
              <p className="text-xs">Ubah filter atau tambahkan kelas baru untuk memulai.</p>
            </div>
          </td>
        </tr>
      );
    }
    return props.entries.map(({ classRecord, row }) => (
      <tr key={row.id} className="group transition-colors hover:bg-surface-container-low/60">
        <td className="p-3.5">
          <div className="flex flex-col">
            <span className="text-text-primary font-bold">{row.name}</span>
            {row.major !== '' && (
              <span className="text-text-muted text-[11px]">Jurusan {row.major}</span>
            )}
          </div>
        </td>
        <td className="p-3.5">
          <span className="inline-flex rounded-lg bg-pine-light px-2 py-0.5 text-xs font-bold text-pine-deep">
            {row.gradeLabel}
          </span>
        </td>
        <td className="text-text-primary p-3.5 text-xs font-medium">{row.academicYearName}</td>
        {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label -- table cell, not a control */}
        <td className="p-3.5">
          <div className="flex items-center gap-2.5">
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${avatarClass(row.hasHomeroom)}`}
            >
              {row.hasHomeroom ? initials(row.homeroomTeacherName) : '—'}
            </span>
            <span className={`text-xs font-medium ${homeroomTextClass(row.hasHomeroom)}`}>
              {row.homeroomTeacherName}
            </span>
          </div>
        </td>
        <td className="p-3.5">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusBadgeClass(row.isActive)}`}
          >
            <span className={`size-1.5 rounded-full ${statusDotClass(row.isActive)}`} />
            {row.statusLabel}
          </span>
        </td>
        <td className="p-3.5">
          <div className="flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                props.onViewStudents(classRecord);
              }}
              title="Lihat siswa"
              aria-label={`Lihat siswa kelas ${row.name}`}
              className="text-text-muted hover:bg-surface-container flex size-8 cursor-pointer items-center justify-center rounded-lg bg-surface-container-low transition-colors hover:text-pine-deep"
            >
              <Users className="size-4" />
            </button>

            {props.canManage && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    props.onEdit(classRecord);
                  }}
                  title="Edit kelas"
                  aria-label={`Edit kelas ${row.name}`}
                  className="text-text-muted hover:bg-surface-container flex size-8 cursor-pointer items-center justify-center rounded-lg bg-surface-container-low transition-colors hover:text-pine-deep"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    props.onAssignHomeroom(classRecord);
                  }}
                  disabled={!row.isActive}
                  title="Atur wali kelas"
                  aria-label={`Atur wali kelas ${row.name}`}
                  className="text-text-muted hover:bg-surface-container flex size-8 cursor-pointer items-center justify-center rounded-lg bg-surface-container-low transition-colors hover:text-pine-deep disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <UserCheck className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    props.onToggleStatus(classRecord);
                  }}
                  title={row.isActive ? 'Arsipkan kelas' : 'Aktifkan kelas'}
                  aria-label={`${row.isActive ? 'Arsipkan' : 'Aktifkan'} kelas ${row.name}`}
                  className={`flex size-8 cursor-pointer items-center justify-center rounded-lg bg-surface-container-low transition-colors ${toggleButtonClass(row.isActive)}`}
                >
                  {row.isActive ? <Archive className="size-4" /> : <RotateCcw className="size-4" />}
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border-control bg-pine-light/50 font-semibold text-pine-deep">
            <th scope="col" className="p-3.5 whitespace-nowrap">
              Nama Kelas
            </th>
            <th scope="col" className="p-3.5 whitespace-nowrap">
              Tingkat
            </th>
            <th scope="col" className="p-3.5 whitespace-nowrap">
              Tahun Ajaran
            </th>
            <th scope="col" className="p-3.5 whitespace-nowrap">
              Wali Kelas
            </th>
            <th scope="col" className="p-3.5 whitespace-nowrap">
              Status
            </th>
            <th scope="col" className="p-3.5 text-center whitespace-nowrap">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="text-text-primary divide-y divide-border-subtle">{renderBody()}</tbody>
      </table>
    </div>
  );
}
