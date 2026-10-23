import { CheckCircle2, MessageCircle, ShieldCheck, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { DispensationStudent } from '@/types/dispensation';

/**
 * Dispensation policy recap and coach contact card.
 *
 * @param props - Student coach details and contact handler.
 * @returns Sidebar policy and contact cards.
 */
export function DispensationSidebar(props: {
  student: DispensationStudent;
  onContactCoach: () => void;
}) {
  const t = useTranslations('DispensationPage');
  const guidelines = [
    { title: t('guideline_presence_title'), body: t('guideline_presence_body') },
    { title: t('guideline_exam_title'), body: t('guideline_exam_body') },
    { title: t('guideline_sync_title'), body: t('guideline_sync_body') },
  ];

  return (
    <div className="space-y-3">
      <aside className="rounded-2xl bg-pine-deep p-4 text-white shadow-md">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-white/10 text-amber-gold">
            <ShieldCheck className="size-3.5" />
          </span>
          <h2 className="text-xs font-extrabold tracking-tight">{t('guidelines_title')}</h2>
        </div>
        <p className="mt-1.5 text-[9px] leading-relaxed text-emerald-100/70">
          {t('guidelines_desc')}
        </p>

        <ul className="mt-3 space-y-2.5">
          {guidelines.map((guideline) => (
            <li key={guideline.title} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-amber-gold" />
              <p className="text-[9.5px] leading-relaxed text-emerald-50/80">
                <span className="font-bold text-white">{guideline.title}</span> {guideline.body}
              </p>
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex items-center gap-2.5 rounded-2xl border border-border-subtle bg-card p-3 shadow-xs">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-pine-deep">
          <UserRound className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-bold text-foreground">{props.student.coach}</p>
          <p className="text-[9px] text-muted-foreground">
            {t('coach_role', { phone: props.student.coachPhone })}
          </p>
        </div>
        <button
          type="button"
          onClick={props.onContactCoach}
          aria-label={t('coach_contact', { name: props.student.coach })}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-pine-light text-pine-deep transition-colors hover:bg-pine-deep hover:text-white"
        >
          <MessageCircle className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
