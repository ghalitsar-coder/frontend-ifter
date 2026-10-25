'use client';

import { Loader2, Users, X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Class } from '@/lib/api/dto';
import { studentStatusLabel, useMasterKelasStudents } from '@/lib/api/master-kelas';

/**
 * Read-only roster for one class (GET /classes/:id/students).
 *
 * @param props - Modal inputs and callbacks.
 * @param props.classRecord - Class whose roster is shown.
 * @param props.onClose - Closes the modal.
 * @returns Modal overlay.
 */
export function ClassStudentsModal(props: { classRecord: Class; onClose: () => void }) {
  const studentsQuery = useMasterKelasStudents(props.classRecord.id);
  const students = studentsQuery.data ?? [];

  const renderContent = (): ReactNode => {
    if (studentsQuery.isLoading) {
      return (
        <div className="text-text-muted flex items-center justify-center gap-2 p-10 text-sm">
          <Loader2 className="size-4 animate-spin" /> Memuat siswa…
        </div>
      );
    }
    if (studentsQuery.isError) {
      return (
        <div className="p-10 text-center text-sm text-rose-700">
          Gagal memuat daftar siswa kelas ini.
        </div>
      );
    }
    if (students.length === 0) {
      return (
        <div className="text-text-muted p-10 text-center text-sm">
          Belum ada siswa yang terdaftar di kelas ini.
        </div>
      );
    }
    return (
      <table className="w-full border-collapse text-left text-sm">
        <thead className="sticky top-0 bg-pine-light/80 text-pine-deep">
          <tr className="border-b border-border-control">
            <th scope="col" className="p-3 font-semibold">
              No
            </th>
            <th scope="col" className="p-3 font-semibold">
              NIS
            </th>
            <th scope="col" className="p-3 font-semibold">
              Nama Siswa
            </th>
            <th scope="col" className="p-3 font-semibold">
              Mulai
            </th>
            <th scope="col" className="p-3 font-semibold">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {students.map((student, index) => (
            <tr key={student.id} className="hover:bg-surface-container-low/60">
              <td className="text-text-muted p-3">{index + 1}</td>
              <td className="text-text-primary p-3 font-mono text-xs">{student.student_number}</td>
              <td className="text-text-primary p-3 font-semibold">{student.full_name}</td>
              <td className="text-text-muted p-3 text-xs">{student.enrollment_start}</td>
              <td className="p-3">
                <span className="text-text-primary inline-flex rounded-full border border-border-control bg-surface-container-low px-2 py-0.5 text-[11px] font-semibold">
                  {studentStatusLabel(student.status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="class-students-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-pine-deep/60 p-3 backdrop-blur-md sm:p-6"
    >
      <div className="bg-surface-card flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-pine-deep via-amber-gold to-pine-deep" />
        <div className="flex items-start justify-between gap-4 border-b border-border-control px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pine-light text-pine-deep">
              <Users className="size-5" />
            </span>
            <div>
              <h2 id="class-students-title" className="text-lg font-bold text-pine-deep">
                Siswa Kelas {props.classRecord.name}
              </h2>
              <p className="text-text-muted text-xs">
                {studentsQuery.isLoading
                  ? 'Memuat daftar siswa…'
                  : `${students.length} siswa terdaftar`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            aria-label="Tutup"
            className="text-text-muted hover:bg-surface-container hover:text-text-primary flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-surface-container-low transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="overflow-y-auto">{renderContent()}</div>
      </div>
    </div>
  );
}
