'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { ClassFormModal } from '@/components/master-kelas/ClassFormModal';
import { ClassHomeroomModal } from '@/components/master-kelas/ClassHomeroomModal';
import { ClassStats } from '@/components/master-kelas/ClassStats';
import { ClassStudentsModal } from '@/components/master-kelas/ClassStudentsModal';
import { ClassTable } from '@/components/master-kelas/ClassTable';
import { ClassToolbar } from '@/components/master-kelas/ClassToolbar';
import { AttendanceConfirmDialog } from '@/components/presensi/AttendanceConfirmDialog';
import type { ConfirmRequest } from '@/components/presensi/AttendanceConfirmDialog';
import { ApiError } from '@/lib/api/client';
import type { Class } from '@/lib/api/dto';
import { mapClassToRow, useMasterKelasList, useUpdateClassStatus } from '@/lib/api/master-kelas';
import type { MasterKelasFilter, MasterKelasStatus } from '@/lib/api/master-kelas';
import { useAcademicYears } from '@/lib/api/queries';
import { can } from '@/lib/api/rbac';

type PendingStatus = { classRecord: Class; status: MasterKelasStatus };

type FormState = { mode: 'create' } | { mode: 'edit'; classRecord: Class };

const errorText = (error: unknown): string =>
  error instanceof ApiError ? error.message : 'Terjadi kesalahan tak terduga.';

const buildConfirmRequest = (
  pending: PendingStatus | null,
  onConfirm: () => void,
): ConfirmRequest | null => {
  if (pending === null) {
    return null;
  }
  const archived = pending.status === 'archived';
  return {
    message: archived
      ? `Arsipkan kelas ${pending.classRecord.name}? Kelas yang diarsipkan tidak dapat diberi wali kelas baru.`
      : `Aktifkan kembali kelas ${pending.classRecord.name}?`,
    confirmLabel: archived ? 'Arsipkan' : 'Aktifkan',
    onConfirm,
  };
};

/**
 * Class management workspace: filters (academic year, grade, status), class
 * table, create/edit modal, archive/reactivate actions, homeroom assignment
 * and a read-only roster modal. Write controls are gated by the `master_data`
 * capability; every role may read.
 *
 * @returns Class management page content.
 */
export function ClassManager() {
  const { roles } = useAuth();
  const canManage = can(roles, 'master_data');
  const [yearFilter, setYearFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | MasterKelasStatus>('all');
  const [formState, setFormState] = useState<FormState | null>(null);
  const [homeroomClass, setHomeroomClass] = useState<Class | null>(null);
  const [studentsClass, setStudentsClass] = useState<Class | null>(null);
  const [pendingStatus, setPendingStatus] = useState<PendingStatus | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const academicYearsQuery = useAcademicYears();
  const academicYears = academicYearsQuery.data ?? [];

  const filter: MasterKelasFilter = {
    ...(yearFilter === 'all' ? {} : { academic_year_id: yearFilter }),
    ...(gradeFilter === 'all' ? {} : { grade_level: Number(gradeFilter) }),
    ...(statusFilter === 'all' ? {} : { status: statusFilter }),
  };

  const listQuery = useMasterKelasList(filter);
  const entries = (listQuery.data?.data ?? []).map((classRecord) => ({
    classRecord,
    row: mapClassToRow(classRecord),
  }));
  const total = listQuery.data?.total ?? entries.length;
  const activeCount = entries.filter((entry) => entry.row.isActive).length;
  const archivedCount = entries.filter((entry) => !entry.row.isActive).length;
  const homeroomCount = entries.filter((entry) => entry.row.hasHomeroom).length;
  const hasActiveFilters = [yearFilter, gradeFilter, statusFilter].some((value) => value !== 'all');

  const statusMutation = useUpdateClassStatus();

  const confirmStatusChange = () => {
    if (pendingStatus === null || statusMutation.isPending) {
      return;
    }
    const { classRecord, status } = pendingStatus;
    statusMutation.mutate(
      { classId: classRecord.id, status },
      {
        onSuccess: () => {
          showToast(
            status === 'archived'
              ? `Kelas ${classRecord.name} diarsipkan.`
              : `Kelas ${classRecord.name} diaktifkan kembali.`,
          );
          setPendingStatus(null);
        },
        onError: (error) => {
          showToast(errorText(error));
        },
      },
    );
  };

  const resetFilters = () => {
    setYearFilter('all');
    setGradeFilter('all');
    setStatusFilter('all');
  };

  const toggleStatus = (classRecord: Class) => {
    setPendingStatus({
      classRecord,
      status: classRecord.status === 'active' ? 'archived' : 'active',
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="flex size-2 animate-pulse rounded-full bg-emerald-600" />
            <span className="font-mono text-xs font-semibold tracking-wider text-pine-deep uppercase">
              Master Data • FR-C04
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-pine-deep sm:text-3xl">
            Manajemen Kelas
          </h1>
          <p className="text-text-muted text-sm">
            Kelola rombel, tingkat, tahun ajaran, dan penugasan wali kelas.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => {
              setFormState({ mode: 'create' });
            }}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-pine-deep px-4 py-2 text-xs font-bold tracking-wide text-white shadow-sm transition-colors hover:bg-pine-hover sm:text-sm"
          >
            <Plus className="size-4 text-amber-gold" />
            <span>Tambah Kelas</span>
          </button>
        )}
      </div>

      <ClassStats
        total={total}
        activeCount={activeCount}
        archivedCount={archivedCount}
        homeroomCount={homeroomCount}
      />

      <ClassToolbar
        yearFilter={yearFilter}
        gradeFilter={gradeFilter}
        statusFilter={statusFilter}
        academicYears={academicYears}
        hasActiveFilters={hasActiveFilters}
        shownCount={entries.length}
        total={total}
        onYearChange={setYearFilter}
        onGradeChange={setGradeFilter}
        onStatusChange={setStatusFilter}
        onReset={resetFilters}
      />

      <div className="bg-surface-card flex flex-col gap-3 rounded-2xl border border-border-control p-4 shadow-xs sm:p-5">
        <ClassTable
          entries={entries}
          isLoading={listQuery.isLoading}
          errorMessage={listQuery.isError ? errorText(listQuery.error) : null}
          canManage={canManage}
          onViewStudents={setStudentsClass}
          onEdit={(classRecord) => {
            setFormState({ mode: 'edit', classRecord });
          }}
          onAssignHomeroom={setHomeroomClass}
          onToggleStatus={toggleStatus}
        />

        {total > entries.length && (
          <span className="text-text-muted text-[11px]">
            Hanya 100 kelas pertama yang dimuat. Persempit filter tahun ajaran atau tingkat.
          </span>
        )}
      </div>

      {formState !== null && (
        <ClassFormModal
          key={formState.mode === 'edit' ? formState.classRecord.id : 'create'}
          mode={formState.mode}
          {...(formState.mode === 'edit' ? { classRecord: formState.classRecord } : {})}
          academicYears={academicYears}
          onClose={() => {
            setFormState(null);
          }}
          onSaved={(message) => {
            setFormState(null);
            showToast(message);
          }}
        />
      )}

      {homeroomClass !== null && (
        <ClassHomeroomModal
          classRecord={homeroomClass}
          onClose={() => {
            setHomeroomClass(null);
          }}
          onSaved={(message) => {
            setHomeroomClass(null);
            showToast(message);
          }}
        />
      )}

      {studentsClass !== null && (
        <ClassStudentsModal
          classRecord={studentsClass}
          onClose={() => {
            setStudentsClass(null);
          }}
        />
      )}

      <AttendanceConfirmDialog
        request={buildConfirmRequest(pendingStatus, confirmStatusChange)}
        onCancel={() => {
          setPendingStatus(null);
        }}
      />

      {toast !== null && (
        <output className="fixed right-4 bottom-4 z-[60] max-w-sm rounded-xl bg-pine-deep px-4 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </output>
      )}
    </div>
  );
}
