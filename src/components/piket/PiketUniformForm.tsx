'use client';

import { Award, ClipboardList, Flag, Send, UserSearch } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { calculateInfractionPoints, UNIFORM_INFRACTIONS_CATALOG } from '@/data/mockPiket';
import { ApiError } from '@/lib/api/client';
import type { Student } from '@/lib/api/dto';
import {
  buildUniformNote,
  todayIsoDate,
  useCreateUniformReport,
  useUniformReports,
} from '@/lib/api/piket';
import type { UniformReport } from '@/lib/api/piket';
import { useStudentSearch, useTeacherOptions } from '@/lib/api/queries';

/**
 * Friendly text for a query/mutation error.
 * @param error - Raw thrown value.
 * @param fallback - Indonesian fallback sentence.
 * @returns Message text.
 */
function uniformErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

/**
 * Searchable list of active students used as the report target.
 * @param props - Search query state and the selection handler.
 * @returns Picker list element.
 */
function UniformStudentPicker(props: {
  students: Student[] | undefined;
  isPending: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="max-h-36 space-y-1 overflow-y-auto">
      {props.isPending && <p className="text-text-muted text-xs">Memuat data siswa...</p>}
      {props.students?.length === 0 && (
        <p className="text-text-muted text-xs">Siswa tidak ditemukan.</p>
      )}
      {(props.students ?? []).map((student) => (
        <button
          key={student.id}
          type="button"
          onClick={() => {
            props.onSelect(student.id);
          }}
          className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
            props.selectedId === student.id
              ? 'bg-pine-light font-semibold text-pine-deep'
              : 'bg-canvas-base text-text-primary hover:bg-pine-light/40'
          }`}
        >
          <span>
            {student.full_name}
            <span className="text-text-muted ml-2 font-mono">{student.student_number}</span>
          </span>
          {student.current_class === undefined ? null : (
            <span className="text-text-muted">{student.current_class.name}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/**
 * One existing uniform report card for the day list.
 * @param props - Report plus the resolved teacher/student names.
 * @returns Report card element.
 */
function UniformReportCard(props: {
  report: UniformReport;
  teacherName: string;
  targetLabel: string;
}) {
  return (
    <div className="bg-canvas-base rounded-xl p-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-1">
        <span className="text-text-primary font-semibold">
          {props.report.scope === 'student' ? 'Siswa' : 'Guru'}: {props.targetLabel}
        </span>
        <span className="text-text-muted">oleh {props.teacherName}</span>
      </div>
      <p className="text-text-muted mt-1">{props.report.note ?? '(tanpa catatan)'}</p>
    </div>
  );
}

/**
 * Day list of existing uniform reports (GET /uniform-reports?date).
 * @param props - Query state, the date caption and resolvers for display names.
 * @returns Reports section element.
 */
function UniformReportsSection(props: {
  date: string;
  reports: UniformReport[];
  isPending: boolean;
  isError: boolean;
  error: unknown;
  teacherNameFor: (teacherId: string) => string;
  targetLabelFor: (report: UniformReport) => string;
}) {
  return (
    <div className="mt-5 space-y-2 border-t border-border-subtle pt-4">
      <h3 className="text-text-primary flex items-center gap-2 text-xs font-bold">
        <ClipboardList className="size-4 text-pine-deep" />
        Laporan seragam {props.date}
      </h3>
      {props.isPending && <p className="text-text-muted text-xs">Memuat laporan...</p>}
      {props.isError && (
        <p className="text-error rounded-xl bg-red-500/10 p-3 text-xs font-medium">
          {uniformErrorMessage(props.error, 'Gagal memuat laporan seragam.')}
        </p>
      )}
      {!props.isPending && !props.isError && props.reports.length === 0 && (
        <p className="bg-canvas-base text-text-muted rounded-xl p-3 text-xs">
          Belum ada catatan seragam pada tanggal ini.
        </p>
      )}
      {props.reports.map((report) => (
        <UniformReportCard
          key={report.id}
          report={report}
          teacherName={props.teacherNameFor(report.teacher_id)}
          targetLabel={props.targetLabelFor(report)}
        />
      ))}
    </div>
  );
}

/**
 * Rapid uniform-note form wired to the real duty-rotation surface:
 * POST /uniform-reports { for_date, teacher_id, scope, target_student_id?, note? }
 * and GET /uniform-reports?date for the day's existing notes
 * (roles admin|staff_tu|duty_teacher per register_duty_rotation.go).
 * The uniform-infraction catalog stays mock — there is no backend catalog
 * endpoint — so the selected items are folded into the free-text `note`
 * (server cap: 500 chars). Domain labels are hard-coded Indonesian.
 * @param props - Component properties.
 * @returns Rendered rapid uniform form component.
 */
export function PiketUniformForm(props: {
  onSubmit: (data: {
    studentName: string;
    infractionIds: string[];
    totalPoints: number;
    notes: string;
  }) => void;
  onToast: (title: string, desc: string) => void;
}) {
  const t = useTranslations('PiketPage');
  const { roles } = useAuth();

  const [forDate, setForDate] = useState(todayIsoDate());
  const [teacherId, setTeacherId] = useState('');
  const [scope, setScope] = useState<'student' | 'teacher'>('student');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentId, setStudentId] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const teachersQuery = useTeacherOptions({ status: 'active', limit: 100 });
  const studentsQuery = useStudentSearch({
    search: studentSearch === '' ? undefined : studentSearch,
    status: 'active',
    limit: 20,
  });
  const reportsQuery = useUniformReports({ date: forDate });
  const createUniform = useCreateUniformReport();

  // POST/GET /uniform-reports are limited to admin|staff_tu|duty_teacher.
  const canReport =
    (roles as readonly string[]).includes('admin') ||
    (roles as readonly string[]).includes('staff_tu') ||
    (roles as readonly string[]).includes('duty_teacher');

  const totalPoints = calculateInfractionPoints(selectedIds, UNIFORM_INFRACTIONS_CATALOG);
  const teacherName =
    teachersQuery.data?.find((teacher) => teacher.id === teacherId)?.full_name ?? 'Guru terpilih';
  const studentName =
    studentsQuery.data?.find((student) => student.id === studentId)?.full_name ?? '';
  const canSubmit =
    teacherId !== '' &&
    (scope === 'teacher' || studentId !== '') &&
    notes.trim() !== '' &&
    !createUniform.isPending;

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) {
      return;
    }

    const infractionLabels = UNIFORM_INFRACTIONS_CATALOG.filter((item) =>
      selectedIds.includes(item.id),
    ).map((item) => item.label);
    const note = buildUniformNote(infractionLabels, notes);

    createUniform.mutate(
      {
        for_date: forDate,
        teacher_id: teacherId,
        scope,
        target_student_id: scope === 'student' ? studentId : undefined,
        note,
      },
      {
        onSuccess: (report) => {
          props.onSubmit({
            studentName: studentName === '' ? teacherName : studentName,
            infractionIds: selectedIds,
            totalPoints,
            notes: report.note ?? note,
          });
          props.onToast(
            'Laporan Seragam Tersimpan',
            `Catatan seragam ${report.for_date} berhasil dikirim ke server.`,
          );
          setSelectedIds([]);
          setNotes('');
        },
        onError: (error) => {
          props.onToast(
            'Laporan Seragam Gagal',
            uniformErrorMessage(error, 'Terjadi kesalahan pada server.'),
          );
        },
      },
    );
  };

  const reports = reportsQuery.data ?? [];

  if (!canReport) {
    return null;
  }

  return (
    <div className="bg-surface-card rounded-2xl p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4">
        <div className="space-y-0.5">
          <h2 className="text-text-primary text-lg font-bold">{t('form_title')}</h2>
          <p className="font-caption text-text-muted text-xs">
            Catatan pelanggaran seragam dikirim ke POST /uniform-reports; daftar harian dibaca dari
            GET /uniform-reports?date.
          </p>
        </div>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-surface text-amber-dark">
          <Flag className="size-4.5" />
        </span>
      </div>

      <form className="space-y-4 pt-1" onSubmit={handleSubmit}>
        {/* Date + reporting duty teacher */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              className="text-text-primary block text-xs font-semibold"
              htmlFor="uniform-for-date"
            >
              Tanggal Laporan
            </label>
            <input
              className="bg-canvas-base text-text-primary h-11 w-full rounded-xl px-3 text-xs font-medium shadow-inner focus:outline-none"
              id="uniform-for-date"
              type="date"
              value={forDate}
              onChange={(e) => {
                setForDate(e.target.value);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <label
              className="text-text-primary block text-xs font-semibold"
              htmlFor="uniform-teacher-select"
            >
              Guru Piket Pelapor
            </label>
            <select
              className="bg-canvas-base text-text-primary h-11 w-full rounded-xl px-3 text-xs font-medium shadow-inner focus:outline-none"
              id="uniform-teacher-select"
              value={teacherId}
              onChange={(e) => {
                setTeacherId(e.target.value);
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
        </div>

        {/* Scope segment (student | teacher — backend enum) */}
        <div className="space-y-1.5">
          <span className="text-text-primary block text-xs font-semibold">Lingkup Laporan</span>
          <div className="bg-canvas-base grid h-11 grid-cols-2 gap-1 rounded-xl p-1">
            {(['student', 'teacher'] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={scope === option}
                onClick={() => {
                  setScope(option);
                }}
                className={`cursor-pointer rounded-lg text-xs font-semibold transition-colors ${
                  scope === option
                    ? 'bg-pine-deep text-white shadow-sm'
                    : 'text-text-muted hover:text-foreground'
                }`}
              >
                {option === 'student' ? 'Siswa' : 'Guru'}
              </button>
            ))}
          </div>
        </div>

        {/* Target student picker (only for scope=student) */}
        {scope === 'student' && (
          <>
            <div className="space-y-1.5">
              <label
                className="text-text-primary block text-xs font-semibold"
                htmlFor="siswa-search"
              >
                {t('form_student_label')}
              </label>
              <div className="relative">
                <UserSearch className="text-text-muted absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2" />
                <input
                  className="bg-canvas-base text-text-primary h-11 w-full rounded-xl pr-4 pl-10 text-xs font-medium shadow-inner focus:outline-none"
                  id="siswa-search"
                  placeholder={t('form_student_placeholder')}
                  type="search"
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setStudentId('');
                  }}
                />
              </div>
            </div>
            <UniformStudentPicker
              students={studentsQuery.data}
              isPending={studentsQuery.isPending}
              selectedId={studentId}
              onSelect={(id) => {
                setStudentId(id);
              }}
            />
          </>
        )}

        {/* Infraction Items Checklist — shortcut: endpoint missing in backend wave2 (no uniform
            catalog API), keep mock; selections are folded into the note text. */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-text-primary text-xs font-semibold">
              {t('form_infraction_title')}
            </span>
            <span className="font-caption text-text-muted text-xs">
              {t('form_infraction_desc')}
            </span>
          </div>

          <div className="space-y-2">
            {UNIFORM_INFRACTIONS_CATALOG.map((item) => {
              const isChecked = selectedIds.includes(item.id);

              return (
                <label
                  key={item.id}
                  className="bg-canvas-base flex cursor-pointer items-center justify-between rounded-xl p-3 transition-colors hover:bg-pine-light/40"
                >
                  <div className="flex items-center gap-3">
                    <input
                      checked={isChecked}
                      className="size-4.5 rounded text-pine-deep accent-pine-deep"
                      type="checkbox"
                      onChange={() => {
                        handleToggle(item.id);
                      }}
                    />
                    <span className="text-text-primary text-xs">{item.label}</span>
                  </div>
                  <span
                    className={`font-caption rounded-md px-2 py-0.5 text-xs font-bold ${
                      isChecked
                        ? 'bg-amber-surface text-amber-dark'
                        : 'text-text-muted bg-surface-container-low'
                    }`}
                  >
                    +{item.points} Poin
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Total Calculation Banner */}
        <div className="flex items-center justify-between rounded-xl bg-amber-surface p-3.5 text-amber-dark">
          <div className="flex items-center gap-2">
            <Award className="size-5" />
            <span className="text-xs font-bold">{t('form_total_label')}</span>
          </div>
          <span className="text-base font-bold text-amber-dark">+{totalPoints} Poin</span>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-text-primary block text-xs font-semibold" htmlFor="catatan-piket">
            {t('form_notes_label')}
          </label>
          <textarea
            className="bg-canvas-base text-text-primary focus:bg-surface-card w-full resize-none rounded-xl p-3 text-xs shadow-inner focus:outline-none"
            id="catatan-piket"
            placeholder={t('form_notes_placeholder')}
            rows={2}
            maxLength={500}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
            }}
          />
          <span className="font-caption text-text-muted block text-right text-[10px]">
            {notes.length}/500
          </span>
        </div>

        {/* Submit Button */}
        <button
          className="text-on-primary flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-pine-deep text-xs font-bold shadow-md transition-all hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-50"
          id="btn-submit-infraction"
          type="submit"
          disabled={!canSubmit}
        >
          <Send className="size-4" />
          <span>{createUniform.isPending ? 'Mengirim...' : t('btn_submit_infraction')}</span>
        </button>
      </form>

      {/* Existing reports for the selected date (GET /uniform-reports?date) */}
      <UniformReportsSection
        date={forDate}
        reports={reports}
        isPending={reportsQuery.isPending}
        isError={reportsQuery.isError}
        error={reportsQuery.error}
        teacherNameFor={(id) =>
          teachersQuery.data?.find((teacher) => teacher.id === id)?.full_name ??
          `Guru ${id.slice(0, 8)}…`
        }
        targetLabelFor={(report) => {
          if (report.target_student_id === null || report.target_student_id === undefined) {
            return '—';
          }
          const student = studentsQuery.data?.find((item) => item.id === report.target_student_id);
          return student?.full_name ?? `Siswa ${report.target_student_id.slice(0, 8)}…`;
        }}
      />
    </div>
  );
}
