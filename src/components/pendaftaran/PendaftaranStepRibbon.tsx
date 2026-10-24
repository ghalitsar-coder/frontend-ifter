'use client';

import { useTranslations } from 'next-intl';
import type { PendaftaranStep } from '@/components/pendaftaran/pendaftaranState';

const RIBBON_STEPS = [
  { labelKey: 'step_1_label', numeral: '1' },
  { labelKey: 'step_2_label', numeral: '2' },
  { labelKey: 'step_3_label', numeral: '3' },
] as const;

/**
 * Position of a wizard step inside the three-card ribbon; `selesai` sits past the last card so all
 * three read as done.
 */
const RIBBON_INDEX: Record<PendaftaranStep, number> = {
  dokumen: 1,
  identitas: 0,
  otp: 2,
  selesai: 3,
};

const CARD_BASE = 'flex items-center gap-space-md p-space-sm rounded-lg transition-all';

const NUMERAL_BASE = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full';

const NUMERAL_TONE = {
  active: 'bg-amber-gold font-headline-sm text-headline-sm font-bold text-primary',
  done: 'bg-status-present font-headline-sm text-headline-sm font-bold text-pine-deep',
  idle: 'bg-surface-container-high font-label-md text-label-md font-semibold text-text-muted',
} as const;

/**
 * Pick the numeral badge style for one ribbon card.
 *
 * @param isActive - Whether this card is the step the wizard is on.
 * @param isDone - Whether the step was already completed.
 * @returns Tailwind classes for the badge.
 */
function numeralTone(isActive: boolean, isDone: boolean) {
  if (isActive) {
    return NUMERAL_TONE.active;
  }

  return isDone ? NUMERAL_TONE.done : NUMERAL_TONE.idle;
}

/**
 * Horizontal three-card progress ribbon above the registration wizard, carrying the "needs
 * correction" badge while step one still has failing fields.
 *
 * @param props - Current wizard step and how many fields of step one need correction.
 * @returns Ribbon of three step cards.
 */
export function PendaftaranStepRibbon(props: { issueCount: number; step: PendaftaranStep }) {
  const t = useTranslations('PendaftaranPage');
  const active = RIBBON_INDEX[props.step];

  return (
    <div className="mb-space-2xl w-full rounded-xl bg-surface-card p-space-md shadow-sm">
      <ol
        aria-label={t('step_ribbon_label')}
        className="m-0 grid list-none gap-space-md p-0 md:grid-cols-3"
      >
        {RIBBON_STEPS.map((entry, index) => {
          const isDone = index < active;
          const isActive = index === active;
          const needsCorrection = index === 0 && props.issueCount > 0;

          return (
            <li
              aria-current={isActive ? 'step' : undefined}
              className={`${CARD_BASE} ${
                isActive
                  ? 'bg-pine-deep text-on-primary shadow-sm'
                  : 'bg-surface-container text-text-muted'
              }`}
              key={entry.numeral}
            >
              <div
                aria-hidden="true"
                className={`${NUMERAL_BASE} ${numeralTone(isActive, isDone)}`}
              >
                {isDone ? (
                  <span className="material-symbols-outlined text-[22px]">check</span>
                ) : (
                  entry.numeral
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span
                  className={`block font-eyebrow text-eyebrow uppercase ${
                    isActive ? 'text-amber-gold' : 'text-text-muted'
                  }`}
                >
                  {isActive
                    ? t('step_of_three', { current: entry.numeral })
                    : t('step_number', { current: entry.numeral })}
                </span>
                <p
                  className={`truncate font-label-md text-label-md ${
                    isActive ? 'font-semibold text-on-primary' : 'font-medium text-text-primary'
                  }`}
                >
                  {t(entry.labelKey)}
                </p>
                {needsCorrection && (
                  <p className="mt-0.5 font-caption text-caption text-error">
                    {t('step_issues_count', { count: props.issueCount })}
                  </p>
                )}
              </div>
              {needsCorrection && (
                <span className="shrink-0 rounded bg-error px-1.5 py-0.5 text-[10px] font-bold text-on-error">
                  {t('step_needs_correction')}
                </span>
              )}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined ml-auto hidden text-amber-gold sm:inline-block"
                >
                  arrow_forward
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
