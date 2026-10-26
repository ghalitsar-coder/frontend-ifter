'use client';

import { useTranslations } from 'next-intl';

/**
 * Pine editorial panel on the left of the login screen: brand claim, today's attendance snapshot
 * and the identity anchor that closes the column.
 *
 * @returns Decorative showcase column.
 */
export function PresensiLoginAside() {
  const t = useTranslations('PresensiPage');

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-pine-deep p-space-xl shadow-xl sm:p-space-2xl md:min-h-[580px] lg:col-span-5">
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-pine-hover/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-10 h-72 w-72 rounded-full bg-amber-gold/15 blur-2xl" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/60" />

      <div className="relative z-10 flex items-center justify-between">
        <span className="inline-flex items-center gap-space-xs rounded-full bg-white/10 px-space-sm py-1 backdrop-blur-md">
          <span className="size-2 animate-pulse rounded-full bg-amber-gold" />
          <span className="font-eyebrow text-eyebrow tracking-wider text-amber-gold uppercase">
            {t('login_eyebrow')}
          </span>
        </span>
        <span className="font-caption text-caption tracking-wide text-primary-fixed-dim">
          {t('login_date_stamp')}
        </span>
      </div>

      <div className="relative z-10 my-space-xl">
        <span className="material-symbols-outlined mb-space-sm text-4xl text-amber-gold opacity-90">
          format_quote
        </span>
        <h2 className="font-headline-lg text-headline-lg leading-tight tracking-tight text-white">
          {t('login_quote_lead')}
          <br />
          <span className="font-serif text-amber-gold italic">{t('login_quote_accent')}</span>
        </h2>
        <p className="mt-space-sm max-w-sm font-body-md text-body-md text-primary-fixed-dim/90">
          {t('login_quote_body')}
        </p>

        <div className="mt-space-xl rounded-xl bg-surface-container-lowest/10 p-space-md shadow-sm backdrop-blur-md">
          <div className="mb-space-xs flex items-center justify-between">
            <span className="flex items-center gap-space-xs font-label-md text-label-md font-medium text-white">
              <span className="material-symbols-outlined text-[18px] text-amber-gold">
                insights
              </span>
              {t('login_metric_title')}
            </span>
            <span className="inline-flex items-center rounded-full bg-status-present px-2 py-0.5 font-caption text-caption text-text-primary">
              {t('login_metric_badge')}
            </span>
          </div>
          <div className="mt-space-xs grid grid-cols-3 gap-space-xs bg-white/5 pt-space-xs">
            {(
              [
                ['login_metric_classes', 'login_metric_classes_value', 'text-white'],
                ['login_metric_students', 'login_metric_students_value', 'text-white'],
                ['login_metric_excused', 'login_metric_excused_value', 'text-amber-gold'],
              ] as const
            ).map(([labelKey, valueKey, valueClass]) => (
              <div key={labelKey} className="flex flex-col">
                <span className="font-caption text-caption text-primary-fixed-dim">
                  {t(labelKey)}
                </span>
                <span className={`font-headline-sm text-headline-sm font-semibold ${valueClass}`}>
                  {t(valueKey)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-space-md rounded-lg bg-white/5 p-space-sm">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-pine-hover font-label-md text-label-md font-semibold text-primary-fixed-dim">
          {t('login_persona_initials')}
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-label-md text-label-md font-semibold text-white">
            {t('login_persona_name')}
          </span>
          <span className="truncate font-caption text-caption text-primary-fixed-dim">
            {t('login_persona_role')}
          </span>
        </div>
      </div>
    </div>
  );
}
