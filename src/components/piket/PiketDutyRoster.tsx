'use client';

import { CalendarPlus, ClipboardList, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { ApiError } from '@/lib/api/client';
import {
  DUTY_WEEKDAY_LABELS,
  groupDutyAssignmentsByWeekday,
  isDutyActiveOn,
  isoWeekdayFromDate,
  todayIsoDate,
  useCreateDutyAssignment,
  useDutyAssignments,
  useEndDutyAssignment,
} from '@/lib/api/piket';
import { useTeacherOptions } from '@/lib/api/queries';

/**
 * Duty roster panel wired to the real backend:
 * GET /duty-assignments (roster), POST /duty-assignments (assign) and
 * PUT /duty-assignments/:id/end (end assignment). All three endpoints are
 * admin-only on the backend, so the whole panel renders only for admins.
 * Domain labels are hard-coded Indonesian (no new locale keys allowed).
 * @param props - `onToast` reuses the manager's floating toast feedback.
 * @returns Rendered duty roster card, or null for non-admin roles.
 */
export function PiketDutyRoster(props: { onToast: (title: string, desc: string) => void }) {
  const { roles } = useAuth();
  const assignmentsQuery = useDutyAssignments();
  const teachersQuery = useTeacherOptions({ status: 'active', limit: 100 });
  const createDuty = useCreateDutyAssignment();
  const endDuty = useEndDutyAssignment();

  const today = todayIsoDate();
  const [teacherId, setTeacherId] = useState('');
  const [weekday, setWeekday] = useState(() => isoWeekdayFromDate(todayIsoDate()));
  const [startDate, setStartDate] = useState(() => todayIsoDate());
  const [endDate, setEndDate] = useState('');

  if (!roles.includes('admin')) {
    return null;
  }

  const groups =
    assignmentsQuery.data === undefined ? [] : groupDutyAssignmentsByWeekday(assignmentsQuery.data);
  const canSubmit = teacherId !== '' && startDate !== '';

  const handleAssign = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    createDuty.mutate(
      { teacher_id: teacherId, weekday, start_date: startDate, end_date: endDate },
      {
        onSuccess: () => {
          props.onToast(
            'Penugasan Piket Disimpan',
            `Jadwal piket untuk guru terpilih (${DUTY_WEEKDAY_LABELS[weekday]}) berhasil dibuat.`,
          );
          setTeacherId('');
          setEndDate('');
        },
        onError: (error) => {
          props.onToast(
            'Penugasan Piket Gagal',
            error instanceof ApiError ? error.message : 'Terjadi kesalahan pada server.',
          );
        },
      },
    );
  };

  const handleEnd = (assignmentId: string, teacherName: string) => {
    endDuty.mutate(
      { id: assignmentId, end_date: today },
      {
        onSuccess: () => {
          props.onToast(
            'Tugas Piket Diakhiri',
            `Penugasan ${teacherName} ditutup efektif per ${today}.`,
          );
        },
        onError: (error) => {
          props.onToast(
            'Gagal Mengakhiri Tugas',
            error instanceof ApiError ? error.message : 'Terjadi kesalahan pada server.',
          );
        },
      },
    );
  };

  return (
    <div className="bg-surface-card rounded-2xl p-6 shadow-xs">
      <div className="flex flex-col justify-between gap-2 pb-4 sm:flex-row sm:items-center">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-pine-deep" />
            <h2 className="text-text-primary text-lg font-bold">Rotasi Guru Piket</h2>
          </div>
          <p className="font-caption text-text-muted text-xs">
            Daftar penugasan guru piket harian dari server (weekday ISO 1 = Senin s.d. 7 = Ahad).
          </p>
        </div>
        <span className="font-caption inline-flex w-fit items-center gap-1.5 rounded-full bg-pine-light px-2.5 py-1 text-xs font-semibold text-pine-deep">
          <ClipboardList className="size-3.5" />
          {assignmentsQuery.data === undefined
            ? 'Memuat...'
            : `${assignmentsQuery.data.length} penugasan`}
        </span>
      </div>

      {/* Roster list (GET /duty-assignments) */}
      {assignmentsQuery.isError && (
        <p className="text-error mb-4 rounded-xl bg-red-500/10 p-3 text-xs font-medium">
          {assignmentsQuery.error instanceof ApiError
            ? assignmentsQuery.error.message
            : 'Gagal memuat daftar penugasan piket.'}
        </p>
      )}

      {!assignmentsQuery.isError && (
        <div className="space-y-3 pb-5">
          {groups.length === 0 && !assignmentsQuery.isPending && (
            <p className="bg-canvas-base text-text-muted rounded-xl p-3 text-xs">
              Belum ada penugasan guru piket.
            </p>
          )}
          {groups.map((group) => (
            <div key={group.weekday} className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <span className="font-caption bg-canvas-base text-text-primary flex h-8 shrink-0 items-center justify-center rounded-lg px-3 text-xs font-bold sm:w-20">
                {group.label}
              </span>
              <div className="flex flex-wrap gap-2">
                {group.assignments.map((assignment) => {
                  const stillOpen = assignment.end_date === undefined || assignment.end_date === '';
                  const activeToday = isDutyActiveOn(assignment, today);

                  return (
                    <span
                      key={assignment.id}
                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold ${
                        activeToday
                          ? 'bg-pine-light text-pine-deep'
                          : 'bg-canvas-base text-text-muted'
                      }`}
                      title={`Mulai ${assignment.start_date}${assignment.end_date === undefined ? '' : ` s.d. ${assignment.end_date}`}`}
                    >
                      <UserRound className="size-3.5" />
                      <span>{assignment.teacher_name}</span>
                      <span className="font-caption text-[10px]">
                        {assignment.start_date}
                        {stillOpen ? '' : ` → ${assignment.end_date}`}
                      </span>
                      {stillOpen && (
                        <button
                          aria-label={`Akhiri penugasan ${assignment.teacher_name}`}
                          className="text-error flex size-5 cursor-pointer items-center justify-center rounded-full bg-white/70 shadow-xs transition-colors hover:bg-red-600 hover:text-white"
                          type="button"
                          onClick={() => {
                            handleEnd(assignment.id, assignment.teacher_name);
                          }}
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign form (POST /duty-assignments) */}
      <form
        className="grid grid-cols-1 gap-3 border-t border-border-subtle pt-4 md:grid-cols-5"
        onSubmit={handleAssign}
      >
        <div className="space-y-1 md:col-span-2">
          <label
            className="text-text-primary block text-[11px] font-semibold"
            htmlFor="duty-teacher-select"
          >
            Guru Piket
          </label>
          <select
            className="bg-canvas-base text-text-primary h-11 w-full rounded-xl px-3 text-xs font-medium shadow-inner focus:outline-none"
            id="duty-teacher-select"
            value={teacherId}
            onChange={(event) => {
              setTeacherId(event.target.value);
            }}
          >
            <option value="">
              {teachersQuery.isPending ? 'Memuat guru...' : '— Pilih guru —'}
            </option>
            {(teachersQuery.data ?? []).map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.full_name}
                {teacher.employee_number === undefined ? '' : ` (NIP ${teacher.employee_number})`}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label
            className="text-text-primary block text-[11px] font-semibold"
            htmlFor="duty-weekday-select"
          >
            Hari
          </label>
          <select
            className="bg-canvas-base text-text-primary h-11 w-full rounded-xl px-3 text-xs font-medium shadow-inner focus:outline-none"
            id="duty-weekday-select"
            value={weekday}
            onChange={(event) => {
              setWeekday(Number(event.target.value));
            }}
          >
            {Object.entries(DUTY_WEEKDAY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label
            className="text-text-primary block text-[11px] font-semibold"
            htmlFor="duty-start-date"
          >
            Mulai Tanggal
          </label>
          <input
            className="bg-canvas-base text-text-primary h-11 w-full rounded-xl px-3 text-xs font-medium shadow-inner focus:outline-none"
            id="duty-start-date"
            type="date"
            value={startDate}
            onChange={(event) => {
              setStartDate(event.target.value);
            }}
          />
        </div>

        <div className="space-y-1">
          <label
            className="text-text-primary block text-[11px] font-semibold"
            htmlFor="duty-end-date"
          >
            Berakhir (opsional)
          </label>
          <div className="flex gap-2">
            <input
              className="bg-canvas-base text-text-primary h-11 w-full rounded-xl px-3 text-xs font-medium shadow-inner focus:outline-none"
              id="duty-end-date"
              type="date"
              value={endDate}
              onChange={(event) => {
                setEndDate(event.target.value);
              }}
            />
            <button
              className="text-on-primary flex h-11 shrink-0 items-center gap-2 rounded-xl bg-pine-deep px-4 text-xs font-bold shadow-xs transition-all hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              disabled={!canSubmit || createDuty.isPending}
            >
              <CalendarPlus className="size-4" />
              <span>{createDuty.isPending ? 'Menyimpan...' : 'Tugaskan'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
