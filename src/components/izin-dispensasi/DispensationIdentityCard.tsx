import { BadgeCheck, School, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { DispensationStudent } from '@/types/dispensation';

/**
 * Student identity summary with class, NISN, homeroom, and coach.
 *
 * @param props - Delegated student.
 * @returns Identity card.
 */
export function DispensationIdentityCard(props: { student: DispensationStudent }) {
  const t = useTranslations('DispensationPage');
  const initials = props.student.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');

  return (
    <section className="rounded-2xl border border-border-subtle bg-card p-4 shadow-xs sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          {t('identity_title')}
        </h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-pine-light px-2 py-0.5 text-[9px] font-bold text-pine-deep">
          <BadgeCheck className="size-3" />
          {t('identity_active')}
        </span>
      </div>

      <div className="mt-3 flex items-start gap-3">
        <div className="relative">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-pine-deep text-sm font-extrabold text-amber-gold">
            {initials}
          </span>
          <span className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full border-2 border-card bg-amber-gold text-pine-deep">
            <BadgeCheck className="size-2.5" strokeWidth={3} />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-extrabold tracking-tight text-foreground">
              {props.student.attendanceNumber} · {props.student.name}
            </h3>
            <span className="rounded-md border border-border-subtle bg-surface-container-low px-2 py-0.5 text-[10px] font-bold text-pine-deep">
              {props.student.className}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {t('identity_meta', {
              nisn: props.student.nisn,
              curriculum: props.student.curriculum,
              school: props.student.school,
            })}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <School className="size-3 text-pine-deep" />
              {t('identity_homeroom')}{' '}
              <strong className="font-semibold text-foreground">{props.student.homeroom}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="size-3 text-pine-deep" />
              {t('identity_coach')}{' '}
              <strong className="font-semibold text-foreground">{props.student.coach}</strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
