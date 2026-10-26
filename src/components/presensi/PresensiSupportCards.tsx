'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link } from '@/libs/I18nNavigation';

const BENTO_SHELL =
  'flex flex-col justify-between rounded-2xl border-[1.5px] border-border-control bg-surface p-6 shadow-sm transition-all duration-300 hover:shadow-md';

/**
 * Supplementary bento row: teacher journal, notification dispatch, and session guide.
 *
 * @param props - Remaining unrecorded students for the guide card.
 * @returns Three-card bento grid.
 */
export function PresensiSupportCards(props: { unrecorded: number }) {
  const t = useTranslations('PresensiPage');
  const [journalNote, setJournalNote] = useState(t('journal_default'));
  const [notifyAbsentParent, setNotifyAbsentParent] = useState(true);
  const [copyToCounselorGroup, setCopyToCounselorGroup] = useState(true);

  return (
    <div className="grid grid-cols-1 gap-space-md pt-2 pb-28 md:grid-cols-3">
      <div className={BENTO_SHELL}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pine-deep text-white">
                <span className="material-symbols-outlined text-[18px]">sticky_note_2</span>
              </div>
              <span className="font-headline-sm text-headline-sm font-bold text-pine-deep">
                {t('journal_title')}
              </span>
            </div>
            <span className="rounded-full bg-pine-light px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-pine-deep uppercase">
              {t('journal_badge')}
            </span>
          </div>
          <p className="mt-1 font-caption text-caption text-text-muted">{t('journal_hint')}</p>
        </div>
        <textarea
          className="mt-4 h-24 w-full resize-none rounded-xl border-[1.5px] border-border-control bg-canvas-base p-3 font-label-md text-label-md text-on-surface transition-all placeholder:text-text-placeholder focus:outline-none"
          onChange={(event) => {
            setJournalNote(event.target.value);
          }}
          placeholder={t('journal_placeholder')}
          value={journalNote}
        />
      </div>

      <div className={BENTO_SHELL}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-gold text-[#5B4300]">
                <span className="material-symbols-outlined text-[18px]">notifications_active</span>
              </div>
              <span className="font-headline-sm text-headline-sm font-bold text-pine-deep">
                {t('notify_title')}
              </span>
            </div>
            <span className="rounded-full bg-pine-light px-2 py-0.5 text-[11px] font-bold tracking-wider text-pine-deep uppercase">
              {t('notify_badge')}
            </span>
          </div>
          <p className="mt-1 font-caption text-caption text-text-muted">{t('notify_hint')}</p>
        </div>
        <div className="mt-4 flex flex-col gap-3.5">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border-subtle p-2.5 transition-colors hover:bg-canvas-base">
            <input
              className="h-4 w-4 cursor-pointer rounded accent-pine-deep"
              checked={notifyAbsentParent}
              onChange={(event) => {
                setNotifyAbsentParent(event.target.checked);
              }}
              type="checkbox"
            />
            <span className="font-label-md text-label-md font-medium text-on-surface">
              {t('notify_parent_option')}
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border-subtle p-2.5 transition-colors hover:bg-canvas-base">
            <input
              className="h-4 w-4 cursor-pointer rounded accent-pine-deep"
              checked={copyToCounselorGroup}
              onChange={(event) => {
                setCopyToCounselorGroup(event.target.checked);
              }}
              type="checkbox"
            />
            <span className="font-label-md text-label-md font-medium text-on-surface">
              {t('notify_counselor_option')}
            </span>
          </label>
        </div>
      </div>

      <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border-[1.5px] border-amber-gold bg-[linear-gradient(145deg,#FDF8ED_0%,#FAF0DA_100%)] p-6 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="pointer-events-none absolute right-[-1.5rem] bottom-[-1.5rem] h-24 w-24 rounded-full bg-amber-gold/20 transition-transform group-hover:scale-110" />
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-dark" />
            <span className="font-eyebrow text-eyebrow font-bold tracking-wider text-amber-dark uppercase">
              {t('guide_eyebrow')}
            </span>
          </div>
          <h4 className="font-headline-sm text-headline-sm font-bold tracking-tight text-pine-deep">
            {t('guide_title', { count: props.unrecorded })}
          </h4>
          <p className="font-caption text-caption leading-relaxed text-[#5B4300]">
            {t('guide_description', { count: props.unrecorded })}
          </p>
        </div>
        <div className="relative z-10 mt-4 pt-2">
          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-pine-deep px-3 py-1.5 font-label-md text-label-md font-bold text-surface transition-colors duration-200 group-hover:translate-x-1"
            href="/dashboard/presensi"
          >
            <span>{t('guide_action')}</span>
            <span className="material-symbols-outlined text-[16px] text-amber-gold">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
