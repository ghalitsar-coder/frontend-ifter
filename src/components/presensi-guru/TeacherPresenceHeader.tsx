import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { TeacherAttendance, TeacherProfile } from '@/types/teacherPresence';

/**
 * Portal strip, teacher greeting, and live server clock.
 *
 * @param props - Teacher profile and attendance policy.
 * @returns Header section.
 */
export function TeacherPresenceHeader(props: {
  profile: TeacherProfile;
  attendance: TeacherAttendance;
}) {
  const t = useTranslations('TeacherPresencePage');

  return (
    <div className="mb-8">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border-control bg-card px-3 py-1 text-[11px] font-semibold text-pine-deep">
          <span className="size-1.5 rounded-full bg-emerald-600" />
          {t('gate_open_badge')}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1 text-[11px] font-medium text-muted-foreground">
          {t('late_limit', { time: props.attendance.lateLimit })}
        </span>
      </div>

      <p className="mb-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        {props.profile.school} · {props.profile.academicYear}
      </p>

      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-[2.15rem]">
            {t('greeting', { name: props.profile.name })}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            NIP: {props.profile.nip} · {props.profile.role}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start rounded-2xl border border-border-subtle bg-card px-4 py-3 shadow-xs xl:self-auto">
          <div className="flex size-11 items-center justify-center rounded-xl bg-pine-deep text-amber-gold">
            <Clock className="size-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold tracking-tight text-foreground tabular-nums sm:text-[2rem]">
                {props.profile.serverTime}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground">WIB</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {props.profile.serverDate} · {props.profile.week}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
