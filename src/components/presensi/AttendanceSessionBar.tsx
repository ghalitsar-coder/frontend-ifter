import { Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Class, RosterSummary } from '@/lib/api/dto';

/**
 * Date + class pickers and recorded/unrecorded counters for the attendance
 * workspace (drives GET /attendance/roster via the manager's selected query).
 *
 * @param props - Selected date/class, available classes, and roster summary.
 * @returns Session bar section.
 */
export function AttendanceSessionBar(props: {
  date: string;
  onDateChange: (date: string) => void;
  classes: Class[] | undefined;
  classesLoading: boolean;
  classId: string;
  onClassChange: (classId: string) => void;
  summary: RosterSummary | undefined;
  closedByName: string | undefined;
  dirtyCount: number;
}) {
  const t = useTranslations('AttendancePage');
  const { summary, closedByName } = props;

  return (
    <section className="mb-6 flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs">
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        <span>{t('date_label')}</span>
        <input
          type="date"
          value={props.date}
          onChange={(e) => {
            props.onDateChange(e.target.value);
          }}
          className="h-10 rounded-xl border border-border/60 bg-surface-container-low px-3 text-sm text-foreground focus:bg-background focus:ring-1 focus:ring-ring focus:outline-none"
        />
      </label>
      <label className="flex min-w-44 flex-col gap-1 text-xs text-muted-foreground">
        <span>Kelas</span>
        <select
          value={props.classId}
          onChange={(e) => {
            props.onClassChange(e.target.value);
          }}
          className="h-10 rounded-xl border border-border/60 bg-surface-container-low px-3 text-sm text-foreground focus:bg-background focus:ring-1 focus:ring-ring focus:outline-none"
        >
          {props.classesLoading || props.classes === undefined ? (
            <option value={props.classId}>Memuat kelas...</option>
          ) : (
            props.classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))
          )}
        </select>
      </label>
      {summary !== undefined && (
        <div className="flex items-center gap-2 pb-2 text-xs text-muted-foreground">
          <span>
            Tercatat <span className="font-semibold text-foreground">{summary.recorded}</span> /{' '}
            {summary.total} siswa
          </span>
          <span aria-hidden="true">•</span>
          <span>
            Belum tercatat{' '}
            <span className="font-semibold text-foreground">{summary.unrecorded}</span>
          </span>
        </div>
      )}
      {closedByName !== undefined && (
        <div className="flex items-center gap-1.5 pb-2 text-xs font-medium text-amber-600">
          <Lock className="size-3.5" />
          <span>Hari ditutup oleh {closedByName}</span>
        </div>
      )}
      {props.dirtyCount > 0 && (
        <div className="flex items-center gap-1.5 pb-2 text-xs font-medium text-primary">
          <span>{props.dirtyCount} perubahan belum disimpan</span>
        </div>
      )}
    </section>
  );
}
