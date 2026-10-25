'use client';

import { ArrowRightLeft, BadgeCheck, CalendarDays, X } from 'lucide-react';
import { useState } from 'react';
import { ApiError } from '@/lib/api/client';
import {
  DUTY_WEEKDAY_LABELS,
  isoWeekdayFromDate,
  substitutableAssignmentsOn,
  todayIsoDate,
  useCancelDutyRotation,
  useCreateDutyRotation,
  useDutyAssignments,
  useDutyRotations,
} from '@/lib/api/piket';
import type { DutyRotation } from '@/lib/api/piket';
import { useTeacherOptions } from '@/lib/api/queries';

/**
 * Friendly text for a query/mutation error.
 * @param error - Raw thrown value.
 * @param fallback - Indonesian fallback sentence.
 * @returns Message text.
 */
function errorMessageOf(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

/**
 * Existing-substitution list for the selected date, with cancel action.
 * @param props - Rotations query state plus the cancel handler.
 * @returns List section element.
 */
function RotationListSection(props: {
  date: string;
  rotations: DutyRotation[];
  isPending: boolean;
  isError: boolean;
  error: unknown;
  cancelPending: boolean;
  onCancel: (rotationId: string, substituteName: string) => void;
}) {
  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 text-xs font-bold text-foreground">
        <ArrowRightLeft className="size-4 text-pine-deep" />
        Substitusi pada {props.date}
      </h3>
      {props.isPending && <p className="text-[10px] text-muted-foreground">Memuat substitusi...</p>}
      {props.isError && (
        <p className="rounded-xl bg-red-500/10 p-3 text-[11px] font-medium text-red-700">
          {errorMessageOf(props.error, 'Gagal memuat daftar substitusi.')}
        </p>
      )}
      {!props.isPending && !props.isError && props.rotations.length === 0 && (
        <p className="rounded-xl bg-surface-container-low p-3 text-center text-[10px] text-muted-foreground">
          Belum ada substitusi pada tanggal ini.
        </p>
      )}
      {props.rotations.map((rotation) => (
        <div
          key={rotation.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-container-low p-3"
        >
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-foreground">
              {rotation.original_teacher_name}
              <span className="mx-1.5 text-muted-foreground">→</span>
              {rotation.substitute_teacher_name}
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {rotation.reason}
              <span className="ml-1.5 rounded-md bg-surface-container-high px-1.5 py-0.5 font-semibold">
                {rotation.status === 'substituted' ? 'Aktif' : 'Dibatalkan'}
              </span>
            </p>
          </div>
          {rotation.status === 'substituted' && (
            <button
              type="button"
              aria-label={`Batalkan substitusi ${rotation.substitute_teacher_name}`}
              disabled={props.cancelPending}
              onClick={() => {
                props.onCancel(rotation.id, rotation.substitute_teacher_name);
              }}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[10px] font-semibold text-red-600 shadow-xs transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="size-3.5" />
              Batalkan
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Duty-substitution modal wired to the real backend rotation surface
 * (internal/dutyrotation, docs/API_ADDENDUM.md §6.3):
 *   POST  /duty-rotations           — register a substitute for one roster row
 *   GET   /duty-rotations?date      — list the date's substitutions
 *   PATCH /duty-rotations/:id/cancel — cancel one (the backend has no
 *        DELETE /duty-assignments/:id/substitutions; cancellation is a PATCH).
 * The wave-2 "eligibility / JP workload / SK decree" mocks were dropped: the
 * backend validates server-side (active teacher, weekday + assignment window,
 * duplicate triple → 409) and stores only assignment, substitute, date, reason.
 * Domain labels are hard-coded Indonesian (no new locale keys allowed).
 * @param props - Close handler and the manager's toast emitter.
 * @returns Substitution modal.
 */
export function PiketRotationModal(props: {
  onClose: () => void;
  onToast: (title: string, desc: string) => void;
}) {
  const [date, setDate] = useState(todayIsoDate());
  const [assignmentId, setAssignmentId] = useState('');
  const [substituteId, setSubstituteId] = useState('');
  const [reason, setReason] = useState('');

  const assignmentsQuery = useDutyAssignments();
  const rotationsQuery = useDutyRotations({ date });
  const teachersQuery = useTeacherOptions({ status: 'active', limit: 100 });
  const createRotation = useCreateDutyRotation();
  const cancelRotation = useCancelDutyRotation();

  // Roster rows on duty that day and not yet substituted — the backend also
  // rejects dates outside the assignment window or with a wrong ISO weekday.
  const candidates =
    assignmentsQuery.data === undefined || rotationsQuery.data === undefined
      ? []
      : substitutableAssignmentsOn(assignmentsQuery.data, rotationsQuery.data, date);
  const selectedAssignment = candidates.find((assignment) => assignment.id === assignmentId);
  const canSubmit =
    assignmentId !== '' && substituteId !== '' && reason.trim() !== '' && !createRotation.isPending;

  const handleConfirm = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedAssignment || substituteId === '' || reason.trim() === '') {
      return;
    }

    createRotation.mutate(
      {
        duty_assignment_id: selectedAssignment.id,
        substitute_teacher_id: substituteId,
        date,
        reason,
      },
      {
        onSuccess: (rotation) => {
          props.onToast(
            'Substitusi Piket Tercatat',
            `${rotation.substitute_teacher_name} menggantikan ${rotation.original_teacher_name} pada ${rotation.rotation_date}.`,
          );
          setSubstituteId('');
          setReason('');
        },
        onError: (error) => {
          props.onToast(
            'Substitusi Piket Gagal',
            errorMessageOf(error, 'Terjadi kesalahan pada server.'),
          );
        },
      },
    );
  };

  const handleCancel = (rotationId: string, substituteName: string) => {
    cancelRotation.mutate(
      { id: rotationId },
      {
        onSuccess: () => {
          props.onToast(
            'Substitusi Dibatalkan',
            `Penugasan pengganti ${substituteName} dibatalkan dan dikembalikan ke guru asal.`,
          );
        },
        onError: (error) => {
          props.onToast(
            'Gagal Membatalkan Substitusi',
            errorMessageOf(error, 'Terjadi kesalahan pada server.'),
          );
        },
      },
    );
  };

  const rotations = rotationsQuery.data ?? [];

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is already scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="rotation-modal-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-pine-deep/70 p-3 backdrop-blur-md sm:items-center sm:p-6"
    >
      <div className="relative my-auto flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-pine-deep via-amber-gold to-pine-deep" />

        <div className="bg-surface-container-low px-5 pt-5 pb-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-pine-light px-2.5 py-1 text-[9px] font-bold tracking-wider text-pine-deep uppercase">
              Guru Piket
            </span>
            <button
              type="button"
              aria-label="Tutup modal substitusi"
              onClick={props.onClose}
              className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-white text-muted-foreground shadow-sm transition-colors hover:bg-surface-container-high hover:text-pine-deep"
            >
              <X className="size-4" />
            </button>
          </div>

          <h2
            id="rotation-modal-title"
            className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            Substitusi Guru Piket
          </h2>
          <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
            Tunjuk guru pengganti untuk penugasan piket pada satu tanggal. Backend memvalidasi hari
            (ISO 1 = Senin s.d. 7 = Ahad), rentang penugasan, dan status guru pengganti; setiap
            perubahan tercatat di audit log.
          </p>
        </div>

        <div className="max-h-[calc(85vh-180px)] space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <form
            className="space-y-4 rounded-2xl bg-surface-container-low p-4"
            onSubmit={handleConfirm}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="rotation-date"
                  className="text-[10px] font-semibold text-foreground"
                >
                  Tanggal Substitusi <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-pine-deep" />
                  <input
                    id="rotation-date"
                    type="date"
                    value={date}
                    onChange={(event) => {
                      setDate(event.target.value);
                      setAssignmentId('');
                    }}
                    className="h-11 w-full min-w-0 rounded-xl bg-white pr-3 pl-10 text-[11px] font-semibold text-foreground shadow-sm focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  Hari terpilih: {DUTY_WEEKDAY_LABELS[isoWeekdayFromDate(date)] ?? '—'}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="rotation-assignment-select"
                  className="text-[10px] font-semibold text-foreground"
                >
                  Guru Piket yang Digantikan <span className="text-red-600">*</span>
                </label>
                <select
                  id="rotation-assignment-select"
                  value={assignmentId}
                  onChange={(event) => {
                    setAssignmentId(event.target.value);
                  }}
                  className="h-11 w-full min-w-0 rounded-xl bg-white px-3 text-[11px] font-semibold text-foreground shadow-sm focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
                >
                  <option value="">
                    {assignmentsQuery.isPending ? 'Memuat jadwal...' : '— Pilih penugasan —'}
                  </option>
                  {candidates.map((assignment) => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.teacher_name} (sejak {assignment.start_date})
                    </option>
                  ))}
                </select>
                {candidates.length === 0 && !assignmentsQuery.isPending && (
                  <span className="text-[10px] text-muted-foreground">
                    Tidak ada penugasan aktif pada tanggal ini yang belum disubstitusi.
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="rotation-substitute-select"
                className="text-[10px] font-semibold text-foreground"
              >
                Guru Pengganti <span className="text-red-600">*</span>
              </label>
              <select
                id="rotation-substitute-select"
                value={substituteId}
                onChange={(event) => {
                  setSubstituteId(event.target.value);
                }}
                className="h-11 w-full min-w-0 rounded-xl bg-white px-3 text-[11px] font-semibold text-foreground shadow-sm focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
              >
                <option value="">
                  {teachersQuery.isPending ? 'Memuat guru...' : '— Pilih guru —'}
                </option>
                {(teachersQuery.data ?? [])
                  .filter((teacher) => teacher.id !== selectedAssignment?.teacher_id)
                  .map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name}
                      {teacher.employee_number === undefined
                        ? ''
                        : ` (NIP ${teacher.employee_number})`}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="rotation-reason"
                className="text-[10px] font-semibold text-foreground"
              >
                Alasan Substitusi <span className="text-red-600">*</span>
              </label>
              <textarea
                id="rotation-reason"
                rows={2}
                maxLength={500}
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                }}
                placeholder="Contoh: sakit, tugas dinas luar, pelatihan kurikuler"
                className="w-full resize-none rounded-xl bg-white p-3 text-[11px] text-foreground shadow-sm focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
              />
            </div>

            {assignmentsQuery.isError && (
              <p className="rounded-xl bg-red-500/10 p-3 text-[11px] font-medium text-red-700">
                {errorMessageOf(assignmentsQuery.error, 'Gagal memuat jadwal piket.')}
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-pine-deep px-4 text-[11px] font-semibold text-white shadow-md transition-colors hover:bg-pine-deep/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <BadgeCheck className="size-4" />
              <span>{createRotation.isPending ? 'Menyimpan...' : 'Simpan Substitusi'}</span>
            </button>
          </form>

          <RotationListSection
            date={date}
            rotations={rotations}
            isPending={rotationsQuery.isPending}
            isError={rotationsQuery.isError}
            error={rotationsQuery.error}
            cancelPending={cancelRotation.isPending}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
