'use client';

import { useMasterGuruTeachers } from '@/lib/api/master-guru';
import { useMasterKelasList } from '@/lib/api/master-kelas';
import { defaultMonthRange, useSubjects } from '@/lib/api/presensi-mapel';

const labelClass = 'flex flex-col gap-1 text-[11px] font-semibold text-text-muted';
const controlClass =
  'h-9 min-w-0 rounded-xl border border-border-control bg-surface-card px-2 text-xs font-semibold text-pine-deep outline-none focus-visible:ring-2 focus-visible:ring-pine-deep';
const dateClass =
  'h-9 rounded-xl border border-border-control bg-surface-card px-2 text-xs font-semibold text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-pine-deep';

/** The date-and-scope filters shared by the session list and the recap. */
export type MapelFilterValue = {
  from: string;
  to: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
};

/**
 * Empty filter set, the month-to-date window the backend accepts by default.
 * @returns Filter values with no class/subject/teacher picked.
 */
export const emptyMapelFilter = (): MapelFilterValue => ({
  ...defaultMonthRange(),
  class_id: '',
  subject_id: '',
  teacher_id: '',
});

/**
 * The class × subject × teacher scope every subject-attendance read accepts.
 * Catalog lists are best-effort: a role without master-data read simply gets
 * the "Semua" option only, and the server still scopes its rows.
 *
 * @param props - Current filter values, change callback, optional status picker.
 * @returns Filter card.
 */
export function MapelFilterBar(props: {
  value: MapelFilterValue;
  onChange: (next: MapelFilterValue) => void;
  status?: string;
  onStatusChange?: (status: string) => void;
}) {
  const classesQuery = useMasterKelasList();
  const subjectsQuery = useSubjects({});
  const teachersQuery = useMasterGuruTeachers();
  const classes = classesQuery.data?.data ?? [];
  const subjects = subjectsQuery.data ?? [];
  const teachers = teachersQuery.data?.data ?? [];
  const patch = (part: Partial<MapelFilterValue>) => {
    props.onChange({ ...props.value, ...part });
  };

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border-control bg-surface-card p-4 shadow-xs">
      <label className={labelClass}>
        Dari tanggal
        <input
          type="date"
          value={props.value.from}
          onChange={(event) => {
            patch({ from: event.target.value });
          }}
          className={dateClass}
        />
      </label>
      <label className={labelClass}>
        Sampai tanggal
        <input
          type="date"
          value={props.value.to}
          onChange={(event) => {
            patch({ to: event.target.value });
          }}
          className={dateClass}
        />
      </label>
      <label className={labelClass}>
        Kelas
        <select
          value={props.value.class_id}
          onChange={(event) => {
            patch({ class_id: event.target.value });
          }}
          className={`${controlClass} flex-1`}
        >
          <option value="">Semua kelas</option>
          {classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Mapel
        <select
          value={props.value.subject_id}
          onChange={(event) => {
            patch({ subject_id: event.target.value });
          }}
          className={`${controlClass} flex-1`}
        >
          <option value="">Semua mapel</option>
          {subjects.map((item) => (
            <option key={item.id} value={item.id}>
              {item.code} — {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Guru
        <select
          value={props.value.teacher_id}
          onChange={(event) => {
            patch({ teacher_id: event.target.value });
          }}
          className={`${controlClass} flex-1`}
        >
          <option value="">Semua guru</option>
          {teachers.map((item) => (
            <option key={item.id} value={item.id}>
              {item.full_name}
            </option>
          ))}
        </select>
      </label>
      {props.onStatusChange !== undefined && (
        <label className={labelClass}>
          Status sesi
          <select
            value={props.status ?? ''}
            onChange={(event) => {
              props.onStatusChange?.(event.target.value);
            }}
            className={controlClass}
          >
            <option value="">Semua status</option>
            <option value="open">Berlangsung</option>
            <option value="closed">Ditutup</option>
          </select>
        </label>
      )}
      <button
        type="button"
        onClick={() => {
          props.onChange({ ...props.value, ...defaultMonthRange() });
        }}
        className="h-9 cursor-pointer rounded-xl border border-border-control bg-surface-container-low px-3 text-xs font-bold text-pine-deep transition-colors hover:bg-pine-light"
      >
        Bulan berjalan
      </button>
    </div>
  );
}
