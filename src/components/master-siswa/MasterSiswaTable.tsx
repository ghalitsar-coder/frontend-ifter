import { ChevronLeft, ChevronRight, Eye, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { StudentProfile } from '@/types/masterSiswa';

const attendanceTones = {
  high: { badge: 'bg-emerald-100 text-emerald-800', bar: 'bg-pine-deep' },
  mid: { badge: 'bg-amber-100 text-amber-800', bar: 'bg-amber-gold' },
  low: { badge: 'bg-rose-100 text-rose-800', bar: 'bg-rose-600' },
} as const;

type AttendanceTone = keyof typeof attendanceTones;

/**
 * Buckets a semester attendance rate into a color tone.
 * @param rate - Attendance percentage (0-100).
 * @returns The tone bucket for the rate.
 */
function attendanceToneFor(rate: number): AttendanceTone {
  if (rate >= 95) {
    return 'high';
  }
  if (rate >= 90) {
    return 'mid';
  }
  return 'low';
}

const statusBadgeClasses = {
  active: 'border border-emerald-300 bg-emerald-100 text-emerald-900',
  mutation: 'border border-amber-300 bg-amber-100 text-amber-900',
  alumni: 'border border-gray-300 bg-gray-100 text-gray-800',
} as const;

/**
 * Pill showing accumulated discipline points with stage coloring.
 * @param props - Points bucket inputs.
 * @param props.points - Accumulated discipline points.
 * @param props.stage - Optional escalation stage label.
 * @returns Badge JSX element.
 */
function DisciplineBadge(props: { points: number; stage?: string }) {
  const t = useTranslations('MasterSiswaPage');
  if (props.points === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
        <span className="size-1.5 rounded-full bg-emerald-600" />0 {t('unit_points')}
      </span>
    );
  }
  const critical = props.points > 40;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${
        critical
          ? 'border-rose-200 bg-rose-50 font-bold text-rose-700'
          : 'border-amber-200 bg-amber-50 font-semibold text-amber-800'
      }`}
    >
      <span className={`size-1.5 rounded-full ${critical ? 'bg-rose-600' : 'bg-amber-600'}`} />
      {props.points} {t('unit_points')} {props.stage ? `(${props.stage})` : ''}
    </span>
  );
}

/**
 * Data table rendering student records with selection, sorting, and action triggers.
 *
 * @param props - Component properties.
 * @returns Table component.
 */
export function MasterSiswaTable(props: {
  students: StudentProfile[];
  isLoading?: boolean;
  selectedStudentIds: string[];
  onToggleSelectAll: () => void;
  onToggleSelectStudent: (id: string) => void;
  onViewStudent: (student: StudentProfile) => void;
  onEditStudent: (student: StudentProfile) => void;
  canManageAccount?: boolean;
  onManageAccount?: (student: StudentProfile) => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalFilteredCount: number;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations('MasterSiswaPage');
  const statusBadgeLabels = {
    active: t('status_badge_active'),
    mutation: t('status_badge_mutation'),
    alumni: t('status_badge_alumni'),
  } as const;

  const isAllSelected =
    props.students.length > 0 &&
    props.students.every((s) => props.selectedStudentIds.includes(s.id));

  const startRecord = (props.currentPage - 1) * props.pageSize + 1;
  const endRecord = Math.min(props.currentPage * props.pageSize, props.totalFilteredCount);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border-control bg-surface-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border-control bg-pine-light/50 font-semibold text-pine-deep">
              <th scope="col" className="w-12 p-4 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={props.onToggleSelectAll}
                  aria-label={t('th_select_all')}
                  className="size-4 cursor-pointer rounded border-border-control text-pine-deep accent-pine-deep focus:ring-pine-deep"
                />
              </th>
              <th scope="col" className="hidden p-4 whitespace-nowrap md:table-cell">
                {t('th_nis_photo')}
              </th>
              <th scope="col" className="p-4 whitespace-nowrap">
                {t('th_name_nisn')}
              </th>
              <th scope="col" className="p-4 whitespace-nowrap">
                {t('th_class')}
              </th>
              <th scope="col" className="hidden p-4 whitespace-nowrap md:table-cell">
                {t('th_homeroom')}
              </th>
              <th scope="col" className="p-4 whitespace-nowrap">
                {t('th_attendance')}
              </th>
              <th scope="col" className="hidden p-4 whitespace-nowrap md:table-cell">
                {t('th_discipline_points')}
              </th>
              <th scope="col" className="hidden p-4 whitespace-nowrap md:table-cell">
                {t('th_status')}
              </th>
              <th scope="col" className="p-4 text-center whitespace-nowrap">
                {t('th_actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-text-primary">
            {props.students.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-text-muted">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <User className="size-8 text-text-muted/60" />
                    <p className="text-sm font-semibold">
                      {/* shortcut: no loading locale key in MasterSiswaPage namespace */}
                      {props.isLoading === true
                        ? 'Memuat data siswa...'
                        : t('empty_students_title')}
                    </p>
                    {!props.isLoading && (
                      <p className="text-xs text-text-muted">{t('empty_students_desc')}</p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              props.students.map((student) => {
                const isSelected = props.selectedStudentIds.includes(student.id);

                return (
                  <tr
                    key={student.id}
                    className={`group transition-colors hover:bg-surface-container-low/60 ${
                      isSelected ? 'bg-amber-surface/30' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          props.onToggleSelectStudent(student.id);
                        }}
                        aria-label={t('aria_select_student', { name: student.name })}
                        className="size-4 cursor-pointer rounded border-border-control text-pine-deep accent-pine-deep focus:ring-pine-deep"
                      />
                    </td>

                    {/* NIS & Photo */}
                    {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label -- table cell groups the row's avatar, name and action controls */}
                    <td className="hidden p-4 md:table-cell">
                      <div className="flex items-center gap-3">
                        <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-control bg-pine-light text-xs font-bold text-pine-deep">
                          {student.avatarUrl ? (
                            <Image
                              src={student.avatarUrl}
                              alt={student.name}
                              width={40}
                              height={40}
                              unoptimized
                              className="size-full object-cover"
                            />
                          ) : (
                            <span>
                              {student.name
                                .split(' ')
                                .slice(0, 2)
                                .map((w) => w[0])
                                .join('')}
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="block font-mono text-[11px] font-semibold text-text-muted">
                            NIS
                          </span>
                          <span className="font-mono text-sm font-semibold text-text-primary">
                            {student.nis}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Name & NISN */}
                    {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label -- table cell groups the row's avatar, name and action controls */}
                    <td className="p-4">
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            props.onViewStudent(student);
                          }}
                          className="block cursor-pointer text-left font-bold text-pine-deep hover:underline"
                        >
                          {student.name}
                        </button>
                        <p className="font-mono text-xs text-text-muted">NISN: {student.nisn}</p>
                      </div>
                    </td>

                    {/* Class */}
                    <td className="p-4">
                      <span className="inline-flex items-center rounded-lg border border-pine-deep/10 bg-pine-light px-2.5 py-1 text-xs font-bold text-pine-deep">
                        {student.className}
                      </span>
                    </td>

                    {/* Homeroom */}
                    <td className="hidden p-4 text-sm font-medium text-text-muted md:table-cell">
                      {student.homeroomTeacher}
                    </td>

                    {/* Attendance */}
                    {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label -- table cell groups the row's avatar, name and action controls */}
                    <td className="p-4">
                      <div className="flex w-32 flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-pine-deep">
                            {student.semesterAttendanceRate}%
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${attendanceTones[attendanceToneFor(student.semesterAttendanceRate)].badge}`}
                          >
                            {student.attendanceCategory}
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                          <div
                            className={`h-1.5 rounded-full ${attendanceTones[attendanceToneFor(student.semesterAttendanceRate)].bar}`}
                            style={{ width: `${student.semesterAttendanceRate}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Discipline points */}
                    <td className="hidden p-4 md:table-cell">
                      <DisciplineBadge
                        points={student.disciplinePoints}
                        stage={student.disciplineStage}
                      />
                    </td>

                    {/* Status */}
                    <td className="hidden p-4 md:table-cell">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClasses[student.status]}`}
                      >
                        {statusBadgeLabels[student.status]}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            props.onViewStudent(student);
                          }}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-pine-deep/20 px-2.5 py-1.5 text-xs font-semibold text-pine-deep transition-colors hover:bg-pine-light"
                          title={t('btn_view_profile')}
                        >
                          <Eye className="size-3" />
                          <span>{t('btn_profile')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            props.onEditStudent(student);
                          }}
                          className="cursor-pointer rounded-md border border-border-control px-2.5 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:bg-surface-container hover:text-text-primary"
                          title={t('btn_edit_data')}
                        >
                          {t('btn_edit')}
                        </button>
                        {props.canManageAccount === true && props.onManageAccount !== undefined && (
                          <button
                            type="button"
                            onClick={() => {
                              props.onManageAccount?.(student);
                            }}
                            className="cursor-pointer rounded-md border border-border-control px-2.5 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:bg-surface-container hover:text-text-primary"
                            title="Kelola akun login siswa"
                          >
                            Akun
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col items-center justify-between gap-4 border-t border-border-control bg-canvas-base/50 px-6 py-4 sm:flex-row">
        <p className="text-sm text-text-muted">
          {t('pagination_showing', {
            start: startRecord,
            end: endRecord,
            total: props.totalFilteredCount,
          })}
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={props.currentPage <= 1}
            onClick={() => {
              props.onPageChange(props.currentPage - 1);
            }}
            aria-label={t('pagination_prev')}
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border-control text-text-muted transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>

          {Array.from({ length: props.totalPages }, (_, i) => i + 1).map((p) => {
            const isActive = p === props.currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  props.onPageChange(p);
                }}
                className={`flex size-8 cursor-pointer items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-pine-deep text-white shadow-xs'
                    : 'border border-border-control text-text-primary hover:bg-surface-container'
                }`}
              >
                {p}
              </button>
            );
          })}

          <button
            type="button"
            disabled={props.currentPage >= props.totalPages}
            onClick={() => {
              props.onPageChange(props.currentPage + 1);
            }}
            aria-label={t('pagination_next')}
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border-control text-text-primary transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
