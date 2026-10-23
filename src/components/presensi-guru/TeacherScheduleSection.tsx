import { ArrowRight, BookOpen, Clock, QrCode, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { countTeachingSessions, filterTeachingSessions } from '@/data/mockTeacherPresence';
import type { TeacherScheduleFilter, TeachingSession } from '@/types/teacherPresence';

const STATUS_BADGES: Record<string, string> = {
  selesai: 'bg-surface-container-low text-muted-foreground',
  berlangsung: 'bg-amber-gold/25 text-amber-dark',
  mendatang: 'bg-pastel-blue/50 text-pine-deep',
  sore: 'bg-amber-surface text-amber-dark border border-amber-gold/40',
};

/**
 * Teaching schedule with status filters and per-session classroom actions.
 *
 * @param props - Sessions, active filter, and action handlers.
 * @returns Schedule section.
 */
export function TeacherScheduleSection(props: {
  sessions: TeachingSession[];
  activeFilter: TeacherScheduleFilter;
  onFilterChange: (filter: TeacherScheduleFilter) => void;
  onOpenAttendance: () => void;
  onViewRekap: () => void;
  onOpenModule: () => void;
  onOpenMembers: () => void;
  onOpenQr: () => void;
}) {
  const t = useTranslations('TeacherPresencePage');
  const counts = countTeachingSessions(props.sessions);
  const visibleSessions = filterTeachingSessions(props.sessions, props.activeFilter);

  const filters: { id: TeacherScheduleFilter; countKey: keyof typeof counts }[] = [
    { id: 'all', countKey: 'all' },
    { id: 'ongoing', countKey: 'ongoing' },
    { id: 'done', countKey: 'done' },
    { id: 'upcoming', countKey: 'upcoming' },
  ];

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            {t('schedule_title')}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            {t('schedule_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-0.5 self-start rounded-xl border border-border-subtle bg-surface-container-low p-1 lg:self-auto">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => {
                props.onFilterChange(filter.id);
              }}
              className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-colors sm:text-xs ${
                props.activeFilter === filter.id
                  ? 'bg-pine-deep text-white shadow-sm'
                  : 'text-muted-foreground hover:text-pine-deep'
              }`}
            >
              {t(`filter_${filter.id}`)} ({counts[filter.countKey]})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {visibleSessions.map((session) => {
          const isOngoing = session.status === 'berlangsung';

          return (
            <article
              key={session.id}
              className={`flex flex-col rounded-2xl border bg-card p-4 shadow-xs ${
                isOngoing
                  ? 'border-amber-gold bg-amber-surface/40 ring-1 ring-amber-gold/30'
                  : 'border-border-subtle'
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                  <Clock className="size-3.5" />
                  {session.slot} ({session.time})
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold whitespace-nowrap ${STATUS_BADGES[session.status]}`}
                >
                  {t(`session_status_${session.status}`)}
                </span>
              </div>

              <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                {session.room}
              </p>
              <h3 className="mt-1 text-sm font-bold text-foreground">
                {session.className} · {session.subject}
              </h3>
              <p className="mt-2 flex-1 text-[11px] leading-relaxed text-muted-foreground">
                {session.topic}
              </p>

              <div className="mt-3 border-t border-border-subtle pt-3">
                {session.status === 'selesai' && (
                  <>
                    <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-surface-container-low px-2.5 py-2">
                      <span className="text-lg font-extrabold text-pine-deep">
                        {session.studentCount}
                      </span>
                      <div>
                        <p className="text-[10px] font-semibold text-foreground">
                          {t('attendance_count_label')}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {t('attendance_count_detail', {
                            present: session.presentCount ?? 0,
                            sick: session.sickCount ?? 0,
                            rate: session.attendanceRate ?? '0%',
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={props.onViewRekap}
                      className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border-control bg-card px-3 py-2 text-[11px] font-semibold text-foreground transition-colors hover:bg-surface-container-low"
                    >
                      <span>{t('btn_view_rekap')}</span>
                      <ArrowRight className="size-3.5" />
                    </button>
                  </>
                )}

                {isOngoing && (
                  <>
                    <div className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-amber-gold/50 bg-amber-surface px-2.5 py-2">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-dark">
                        <BookOpen className="size-3.5" />
                        {t('attendance_pending', { count: session.pendingCount ?? 0 })}
                      </span>
                      <span className="text-[10px] font-semibold text-amber-dark/80">
                        {t('attendance_remaining', { time: session.remaining ?? '' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={props.onOpenAttendance}
                        className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-pine-deep px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-pine-hover"
                      >
                        <Users className="size-3.5 text-amber-gold" />
                        {t('btn_open_attendance')}
                      </button>
                      <button
                        type="button"
                        onClick={props.onOpenQr}
                        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border-control bg-card text-pine-deep transition-colors hover:bg-pine-light"
                        aria-label={t('btn_scan_qr')}
                      >
                        <QrCode className="size-4" />
                      </button>
                    </div>
                  </>
                )}

                {session.status === 'mendatang' && (
                  <>
                    <p className="mb-2 flex items-center gap-1.5 rounded-lg bg-surface-container-low px-2.5 py-2 text-[10px] font-semibold text-muted-foreground">
                      <BookOpen className="size-3" />
                      {session.moduleNote}
                    </p>
                    <button
                      type="button"
                      onClick={props.onOpenModule}
                      className="w-full cursor-pointer rounded-lg border border-border-control bg-card px-3 py-2 text-[11px] font-semibold text-foreground transition-colors hover:bg-surface-container-low"
                    >
                      {t('btn_module_detail')}
                    </button>
                  </>
                )}

                {session.status === 'sore' && (
                  <>
                    <p className="mb-2 flex items-center gap-1.5 rounded-lg bg-surface-container-low px-2.5 py-2 text-[10px] font-semibold text-muted-foreground">
                      <Users className="size-3" />
                      {t('members_registered', { count: session.studentCount })}
                    </p>
                    <button
                      type="button"
                      onClick={props.onOpenMembers}
                      className="w-full cursor-pointer rounded-lg border border-border-control bg-card px-3 py-2 text-[11px] font-semibold text-foreground transition-colors hover:bg-surface-container-low"
                    >
                      {t('btn_member_list')}
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
