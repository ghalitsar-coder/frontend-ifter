'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/libs/I18nNavigation';
import type { ClassRecord } from '@/services/presensiApi';

/**
 * Breadcrumb row with the live session pill and the class switcher.
 *
 * @param props - Recorded share of the roster plus the classes the teacher may open.
 * @returns Session navigation row.
 */
export function PresensiSessionBar(props: {
  progressPercent: number;
  classes: ClassRecord[];
  classId: number;
  onClassChange: (classId: number) => void;
}) {
  const t = useTranslations('PresensiPage');

  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div className="flex items-center gap-2">
        <Link
          className="group inline-flex items-center gap-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:text-on-surface"
          href="/dashboard"
        >
          <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-0.5">
            arrow_back
          </span>
          <span>{t('back_to_classes')}</span>
        </Link>
        <span className="text-border-control">/</span>
        <span className="font-caption text-caption text-text-muted">{t('breadcrumb_current')}</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-status-present bg-pine-light px-3 py-1 font-caption text-caption font-semibold text-pine-deep">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-pine-deep" />
          {t('session_active_progress', { percent: props.progressPercent })}
        </span>
        <label className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-surface px-3.5 py-2 font-label-md text-label-md text-on-surface shadow-sm transition-colors hover:bg-hover-row">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
            school
          </span>
          <span className="text-on-surface-variant">{t('class_prefix')}</span>
          <select
            aria-label={t('class_picker_label')}
            className="cursor-pointer appearance-none bg-transparent font-label-md text-label-md font-semibold text-on-surface focus:outline-none"
            onChange={(event) => {
              props.onClassChange(Number(event.target.value));
            }}
            value={props.classId}
          >
            {props.classes.map((record) => (
              <option key={record.id} value={record.id}>
                {record.nama_kelas}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined text-[16px] text-text-muted">expand_more</span>
        </label>
      </div>
    </div>
  );
}
