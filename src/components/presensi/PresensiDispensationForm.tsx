'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { PresensiStudent } from '@/types/presensi';

const RADIO_OPTION_BASE =
  'relative flex cursor-pointer items-center gap-space-sm rounded-xl p-3 shadow-sm transition-all';

/**
 * Scrollable body of the absence-note dialog: identity, category, dates, files, and notes.
 *
 * @param props - Student the note belongs to and its class number.
 * @returns Dialog body sections.
 */
export function PresensiDispensationForm(props: { student: PresensiStudent; ordinal: number }) {
  const t = useTranslations('PresensiPage');
  const [category, setCategory] = useState<'sakit' | 'izin'>('izin');
  const [subCategory, setSubCategory] = useState(0);
  const [detail, setDetail] = useState(t('form_detail_default'));
  const [sessionScope, setSessionScope] = useState(0);
  const [notifyParent, setNotifyParent] = useState(true);
  const [syncJournal, setSyncJournal] = useState(true);
  const subCategories = [
    { titleKey: 'sub_category_competition', hintKey: 'sub_category_competition_hint' },
    { titleKey: 'sub_category_family', hintKey: 'sub_category_family_hint' },
    { titleKey: 'sub_category_organization', hintKey: 'sub_category_organization_hint' },
  ] as const;
  const sessionScopes = [
    { titleKey: 'scope_full_day', hintKey: 'scope_full_day_hint' },
    { titleKey: 'scope_partial', hintKey: 'scope_partial_hint' },
  ] as const;

  return (
    <div className="flex-1 space-y-space-lg overflow-y-auto px-space-xl py-space-md">
      <div className="flex flex-col justify-between gap-space-md rounded-xl bg-canvas-base p-space-md shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-space-md">
          <div className="relative shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pine-deep font-headline-sm text-headline-sm font-semibold tracking-tight text-surface shadow-inner">
              {props.student.initials}
            </div>
            <span className="absolute right-[-0.25rem] bottom-[-0.25rem] flex h-5 w-5 items-center justify-center rounded-full bg-amber-gold shadow-sm">
              <span className="material-symbols-outlined text-[12px] font-bold text-pine-deep">
                verified
              </span>
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-space-sm">
              <h3 className="font-label-md text-label-md font-semibold text-text-primary">
                {t('form_student_name', {
                  ordinal: String(props.ordinal).padStart(2, '0'),
                  name: props.student.name,
                })}
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-pine-light px-2 py-0.5 font-caption text-caption font-semibold text-pine-deep">
                <span className="h-1.5 w-1.5 rounded-full bg-pine-deep" />
                {t('form_official_dispensation')}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-space-md gap-y-0.5 font-caption text-caption text-text-muted">
              <span>
                {t('form_nisn_label')}{' '}
                <span className="font-mono text-text-primary">{props.student.nisn}</span>
              </span>
              <span className="text-outline-variant">•</span>
              <span>{t('form_guardian')}</span>
            </div>
          </div>
        </div>
        <div className="hidden items-center gap-space-xs rounded-lg bg-surface-card px-space-sm py-1.5 text-right shadow-sm md:flex">
          <span className="material-symbols-outlined text-[18px] text-amber-dark">co_present</span>
          <div className="text-left">
            <p className="font-caption text-caption leading-tight text-text-muted">
              {t('form_supervisor_label')}
            </p>
            <p className="font-caption text-caption leading-tight font-semibold text-text-primary">
              {t('form_supervisor_name')}
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-space-xs block font-eyebrow text-eyebrow tracking-wider text-text-muted uppercase">
          {t('form_category_label')}
        </label>
        <div className="grid grid-cols-2 gap-space-sm rounded-xl bg-surface-container p-1">
          <button
            className={`flex items-center justify-center gap-space-sm rounded-lg px-space-md py-2 font-label-md text-label-md transition-all ${
              category === 'sakit'
                ? 'bg-pine-deep font-semibold text-surface shadow-sm'
                : 'text-text-muted hover:bg-surface-card/60 hover:text-text-primary'
            }`}
            onClick={() => {
              setCategory('sakit');
            }}
            type="button"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${category === 'sakit' ? 'text-amber-gold' : ''}`}
            >
              medical_services
            </span>
            <span>{t('form_category_sick')}</span>
          </button>
          <button
            className={`flex items-center justify-center gap-space-sm rounded-lg px-space-md py-2 font-label-md text-label-md transition-all ${
              category === 'izin'
                ? 'bg-pine-deep font-semibold text-surface shadow-sm'
                : 'text-text-muted hover:bg-surface-card/60 hover:text-text-primary'
            }`}
            onClick={() => {
              setCategory('izin');
            }}
            type="button"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${category === 'izin' ? 'text-amber-gold' : ''}`}
            >
              workspace_premium
            </span>
            <span>{t('form_category_dispensation')}</span>
          </button>
        </div>
      </div>

      <div className="space-y-space-xs">
        <label className="block font-label-md text-label-md font-semibold text-text-primary">
          {t('form_sub_category_label')} <span className="text-error">*</span>
        </label>
        <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-3">
          {subCategories.map((option, index) => (
            <label
              className={`${RADIO_OPTION_BASE} ${
                subCategory === index ? 'bg-amber-surface' : 'bg-surface-card hover:bg-canvas-base'
              }`}
              key={option.titleKey}
            >
              <input
                checked={subCategory === index}
                className="h-4 w-4 text-pine-deep accent-pine-deep"
                name="sub_category"
                onChange={() => {
                  setSubCategory(index);
                }}
                type="radio"
              />
              <div className="min-w-0">
                <span
                  className={`block font-label-md text-label-md leading-tight font-semibold ${
                    subCategory === index ? 'text-amber-dark' : 'text-text-primary'
                  }`}
                >
                  {t(option.titleKey)}
                </span>
                <span className="font-caption text-caption leading-tight text-text-muted">
                  {t(option.hintKey)}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-space-xs">
        <label className="block font-label-md text-label-md font-semibold text-text-primary">
          {t('form_detail_label')} <span className="text-error">*</span>
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute top-1/2 left-3.5 -translate-y-1/2 text-[20px] text-text-muted">
            emoji_events
          </span>
          <input
            className="w-full rounded-xl bg-surface-card py-2.5 pr-4 pl-11 font-body-md text-body-md text-text-primary shadow-sm transition-all focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
            onChange={(event) => {
              setDetail(event.target.value);
            }}
            type="text"
            value={detail}
          />
        </div>
      </div>

      <div className="space-y-space-xs">
        <div className="flex items-center justify-between">
          <label className="block font-label-md text-label-md font-semibold text-text-primary">
            {t('form_period_label')} <span className="text-error">*</span>
          </label>
          <span className="rounded-full bg-amber-surface px-2 py-0.5 font-caption text-caption font-semibold text-amber-dark">
            {t('form_period_duration')}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
          <div className="flex items-center gap-space-sm rounded-xl bg-surface-card p-space-sm shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container text-pine-deep">
              <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-caption text-caption text-text-muted">{t('form_start_date')}</p>
              <p className="truncate font-label-md text-label-md font-semibold text-text-primary">
                {t('form_start_date_value')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-sm rounded-xl bg-surface-card p-space-sm shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container text-pine-deep">
              <span className="material-symbols-outlined text-[20px]">event_repeat</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-caption text-caption text-text-muted">{t('form_end_date')}</p>
              <p className="truncate font-label-md text-label-md font-semibold text-text-primary">
                {t('form_end_date_value')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-space-xs">
        <label className="block font-label-md text-label-md font-semibold text-text-primary">
          {t('form_scope_label')}
        </label>
        <div className="flex flex-col gap-space-sm sm:flex-row">
          {sessionScopes.map((scope, index) => (
            <label
              className="flex flex-1 cursor-pointer items-center gap-space-sm rounded-xl bg-surface-card p-3 shadow-sm transition-all hover:bg-canvas-base"
              key={scope.titleKey}
            >
              <input
                checked={sessionScope === index}
                className="h-4 w-4 text-pine-deep accent-pine-deep"
                name="session_scope"
                onChange={() => {
                  setSessionScope(index);
                }}
                type="radio"
              />
              <div>
                <p className="font-label-md text-label-md font-semibold text-text-primary">
                  {t(scope.titleKey)}
                </p>
                <p className="font-caption text-caption text-text-muted">{t(scope.hintKey)}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-space-xs">
        <div className="flex items-center justify-between">
          <label className="block font-label-md text-label-md font-semibold text-text-primary">
            {t('form_file_label')}
          </label>
          <span className="font-caption text-caption text-text-muted">{t('form_file_format')}</span>
        </div>
        <div className="flex items-center justify-between gap-space-md rounded-xl bg-surface-card p-space-md shadow-sm">
          <div className="flex min-w-0 items-center gap-space-md">
            <div className="text-error flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-error-container shadow-sm">
              <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-space-xs">
                <p className="max-w-[260px] truncate font-label-md text-label-md font-semibold text-text-primary sm:max-w-md">
                  {t('form_file_name')}
                </p>
                <span className="hidden items-center gap-0.5 rounded-full bg-pine-light px-2 py-0.5 font-caption text-caption font-semibold text-pine-deep sm:inline-flex">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  {t('form_file_verified')}
                </span>
              </div>
              <p className="font-caption text-caption text-text-muted">{t('form_file_meta')}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-space-xs">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-container hover:text-pine-deep"
              title={t('form_file_view')}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">visibility</span>
            </button>
            <button
              className="hover:text-error flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-error-container"
              title={t('form_file_remove')}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">delete_outline</span>
            </button>
          </div>
        </div>
        <div className="cursor-pointer rounded-xl bg-canvas-base p-space-md text-center shadow-sm transition-colors hover:bg-surface-container">
          <div className="flex items-center justify-center gap-space-sm text-text-muted">
            <span className="material-symbols-outlined text-[20px] text-pine-deep">
              cloud_upload
            </span>
            <p className="font-caption text-caption">
              {t.rich('form_file_replace', {
                browse: (chunks) => (
                  <span className="font-semibold text-pine-deep underline">{chunks}</span>
                ),
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-space-xs">
        <label className="block font-label-md text-label-md font-semibold text-text-primary">
          {t('form_disposition_label')}
        </label>
        <textarea
          className="w-full resize-none rounded-xl bg-surface-card p-space-md font-body-md text-body-md leading-relaxed text-text-primary shadow-sm transition-all focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
          defaultValue={t('form_disposition_default')}
          rows={3}
        />
      </div>

      <div className="space-y-space-sm rounded-xl bg-surface-container-low p-space-md shadow-sm">
        <label className="flex cursor-pointer items-start gap-space-sm select-none">
          <input
            checked={notifyParent}
            className="mt-0.5 h-4 w-4 rounded text-pine-deep accent-pine-deep"
            onChange={(event) => {
              setNotifyParent(event.target.checked);
            }}
            type="checkbox"
          />
          <div className="min-w-0">
            <span className="block font-label-md text-label-md font-semibold text-text-primary">
              {t('form_notify_parent')}
            </span>
            <span className="font-caption text-caption text-text-muted">
              {t.rich('form_notify_parent_hint', {
                phone: (chunks) => <span className="font-mono">{chunks}</span>,
              })}
            </span>
          </div>
        </label>
        <label className="flex cursor-pointer items-start gap-space-sm select-none">
          <input
            checked={syncJournal}
            className="mt-0.5 h-4 w-4 rounded text-pine-deep accent-pine-deep"
            onChange={(event) => {
              setSyncJournal(event.target.checked);
            }}
            type="checkbox"
          />
          <div className="min-w-0">
            <span className="block font-label-md text-label-md font-semibold text-text-primary">
              {t('form_sync_journal')}
            </span>
            <span className="font-caption text-caption text-text-muted">
              {t('form_sync_journal_hint')}
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}
