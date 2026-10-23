'use client';

import {
  BadgeCheck,
  CalendarDays,
  CalendarSync,
  Check,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Hourglass,
  Info,
  Search,
  ShieldCheck,
  UserRoundCog,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  filterRotationCandidates,
  mockRotationCandidates,
  mockRotationCurrentTeacher,
  mockRotationIneligible,
} from '@/data/mockTeacherRotation';
import type {
  RotationAssignmentType,
  RotationCandidate,
  RotationCandidateTone,
  RotationFilter,
  RotationMode,
  RotationSubmission,
} from '@/types/teacherRotation';

const avatarToneClasses: Record<RotationCandidateTone, string> = {
  mint: 'bg-pine-light text-pine-deep',
  blue: 'bg-pastel-blue/70 text-foreground',
  sand: 'bg-surface-container-high text-foreground',
};

const candidateTagClasses = {
  recommended: 'bg-pine-light text-pine-deep',
  capacity: 'bg-surface-container-high text-muted-foreground',
  available: 'bg-surface-container-low text-muted-foreground',
};

const modeCardTone = (isActive: boolean) => (isActive ? 'bg-white shadow-sm' : 'hover:bg-white/60');

const modeIconTone = (isActive: boolean) =>
  isActive ? 'bg-pine-deep text-amber-gold' : 'bg-surface-container-low text-muted-foreground';

const statusChipTone = (isActive: boolean) =>
  isActive
    ? 'bg-pine-light font-semibold text-pine-deep'
    : 'bg-surface-container-high text-muted-foreground';

const filterChipTone = (isActive: boolean, isAmber = false) => {
  if (isActive) {
    return 'bg-pine-deep font-semibold text-white';
  }

  return isAmber
    ? 'bg-amber-surface font-semibold text-amber-dark hover:bg-amber-gold/20'
    : 'bg-surface-container-low font-medium text-foreground hover:bg-surface-container-high';
};

const segmentTone = (isActive: boolean) =>
  isActive
    ? 'bg-white font-bold text-pine-deep shadow-sm'
    : 'font-medium text-muted-foreground hover:text-foreground';

/**
 * Eligible substitute card with workload and conflict indicators.
 *
 * @param props - Candidate, selection state, and select handler.
 * @returns Candidate selector card.
 */
function RotationCandidateCard(props: {
  candidate: RotationCandidate;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const t = useTranslations('PiketPage');
  let tagLabel = t('rot_tag_available');
  let capacityNote = t('rot_note_flexible');

  if (props.candidate.tag === 'recommended') {
    tagLabel = t('rot_tag_recommended');
  } else if (props.candidate.tag === 'capacity') {
    tagLabel = t('rot_tag_capacity');
  }

  if (props.candidate.capacityNote === 'remaining') {
    capacityNote = t('rot_note_remaining', {
      count: props.candidate.remainingJp ?? 0,
    });
  } else if (props.candidate.capacityNote === 'medium') {
    capacityNote = t('rot_note_medium');
  }

  const inputId = `rotation-candidate-${props.candidate.id}`;

  return (
    <label
      htmlFor={inputId}
      aria-label={props.candidate.name}
      className={`block cursor-pointer rounded-2xl p-4 transition-all ${
        props.isSelected
          ? 'bg-white shadow-sm ring-2 ring-pine-deep'
          : 'bg-surface-container-low hover:bg-white hover:shadow-sm'
      }`}
    >
      <input
        id={inputId}
        type="radio"
        name="rotation_candidate"
        value={props.candidate.id}
        checked={props.isSelected}
        onChange={props.onSelect}
        className="sr-only"
      />

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3 sm:items-center sm:gap-4">
          <span
            className={`mt-1 flex size-5 shrink-0 items-center justify-center rounded-full shadow-sm sm:mt-0 ${
              props.isSelected ? 'bg-pine-deep text-white' : 'bg-white text-transparent'
            }`}
          >
            <Check className="size-3.5" />
          </span>

          <span
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-sm ${
              avatarToneClasses[props.candidate.tone]
            }`}
          >
            {props.candidate.initials}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-foreground">{props.candidate.name}</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                  candidateTagClasses[props.candidate.tag]
                }`}
              >
                {props.candidate.tag === 'recommended' && <BadgeCheck className="size-3" />}
                {tagLabel}
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
              <span className="font-mono text-foreground">NIP: {props.candidate.nip}</span>
              <span>•</span>
              <span className="font-medium text-foreground">{props.candidate.subject}</span>
              {props.candidate.hasClassEightExperience && (
                <>
                  <span>•</span>
                  <span>{t('rot_experience_class8')}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pl-8 sm:pl-0">
          <div className="flex flex-col text-left sm:text-right">
            <div className="flex items-center gap-1.5 sm:justify-end">
              <span
                className={`size-2 rounded-full ${
                  props.isSelected ? 'bg-pine-deep' : 'bg-border-control'
                }`}
              />
              <span
                className={`text-[11px] font-bold ${
                  props.isSelected ? 'text-pine-deep' : 'text-foreground'
                }`}
              >
                {props.candidate.currentJp} JP / {props.candidate.maxJp} JP
              </span>
            </div>
            <span className="text-[10px] whitespace-nowrap text-muted-foreground">
              {capacityNote}
            </span>
          </div>
          <span
            className={`rounded-xl px-2.5 py-1.5 text-[10px] font-semibold whitespace-nowrap ${
              props.isSelected
                ? 'bg-pine-light text-pine-deep'
                : 'bg-surface-container-high text-muted-foreground'
            }`}
          >
            {t('rot_zero_conflict')}
          </span>
        </div>
      </div>
    </label>
  );
}

/**
 * Substitute teacher rotation modal with eligibility filters and handover setup.
 *
 * @param props - Close and confirm handlers.
 * @returns Teacher rotation modal.
 */
export function PiketRotationModal(props: {
  onClose: () => void;
  onConfirm: (submission: RotationSubmission) => void;
}) {
  const t = useTranslations('PiketPage');
  const [mode, setMode] = useState<RotationMode>('homeroom');
  const [selectedId, setSelectedId] = useState(mockRotationCandidates[0]?.id ?? '');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<RotationFilter>('all');
  const [effectiveDate, setEffectiveDate] = useState('2026-11-02');
  const [assignmentType, setAssignmentType] = useState<RotationAssignmentType>('temporary');
  const [decreeNumber, setDecreeNumber] = useState('421.3/SK-ROTASI/SMP1/XI/2026');

  const current = mockRotationCurrentTeacher;
  const visibleCandidates = filterRotationCandidates(mockRotationCandidates, query, filter);
  const selectedCandidate = mockRotationCandidates.find((candidate) => candidate.id === selectedId);
  const recommendedCount = mockRotationCandidates.length;
  const totalTeacherCount = mockRotationCandidates.length + mockRotationIneligible.length;
  const canConfirm = selectedCandidate !== undefined && decreeNumber.trim().length > 0;

  const selectedName = selectedCandidate?.name ?? mockRotationCandidates[0]?.name ?? '';
  const checklist = [
    {
      title: t('rot_check_transfer_title'),
      description: t('rot_check_transfer_desc', { name: selectedName }),
    },
    {
      title: t('rot_check_wa_title'),
      description: t('rot_check_wa_desc', { from: current.name, to: selectedName }),
    },
    {
      title: t('rot_check_bast_title'),
      description: t('rot_check_bast_desc'),
    },
  ];

  const handleConfirm = () => {
    if (!selectedCandidate) {
      return;
    }

    props.onConfirm({
      mode,
      teacher: selectedCandidate,
      effectiveDate,
      assignmentType,
      decreeNumber,
    });
  };

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is already scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="rotation-modal-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-pine-deep/70 p-3 backdrop-blur-md sm:items-center sm:p-6"
    >
      <div className="relative my-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-pine-deep via-amber-gold to-pine-deep" />

        <div className="bg-surface-container-low px-5 pt-5 pb-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-pine-light px-2.5 py-1 text-[9px] font-bold tracking-wider text-pine-deep uppercase">
                {t('rot_badge_group')}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-surface px-2.5 py-1 text-[10px] font-semibold text-amber-dark">
                <span className="size-1.5 rounded-full bg-amber-gold" />
                {t('rot_badge_context')}
              </span>
            </div>
            <button
              type="button"
              aria-label={t('rot_close')}
              onClick={props.onClose}
              className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-white text-muted-foreground shadow-sm transition-colors hover:bg-surface-container-high hover:text-pine-deep"
            >
              <X className="size-4" />
            </button>
          </div>

          <h2
            id="rotation-modal-title"
            className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            {t('rot_title')}
          </h2>
          <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
            {t('rot_subtitle')}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-1.5 rounded-xl bg-surface-container-high p-1.5 md:grid-cols-2">
            <button
              type="button"
              aria-pressed={mode === 'homeroom'}
              onClick={() => {
                setMode('homeroom');
              }}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${modeCardTone(
                mode === 'homeroom',
              )}`}
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${modeIconTone(
                  mode === 'homeroom',
                )}`}
              >
                <UserRoundCog className="size-4" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="flex items-center gap-1.5 truncate text-[11px] font-semibold text-pine-deep">
                  {t('rot_mode_homeroom_title')}
                  {mode === 'homeroom' && <span className="size-2 rounded-full bg-amber-gold" />}
                </span>
                <span className="truncate text-[10px] text-muted-foreground">
                  {t('rot_mode_homeroom_desc')}
                </span>
              </span>
            </button>

            <button
              type="button"
              aria-pressed={mode === 'gate'}
              onClick={() => {
                setMode('gate');
              }}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${modeCardTone(
                mode === 'gate',
              )}`}
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${modeIconTone(
                  mode === 'gate',
                )}`}
              >
                <CalendarSync className="size-4" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="flex items-center gap-1.5 truncate text-[11px] font-semibold text-pine-deep">
                  {t('rot_mode_gate_title')}
                  {mode === 'gate' && <span className="size-2 rounded-full bg-amber-gold" />}
                </span>
                <span className="truncate text-[10px] text-muted-foreground">
                  {t('rot_mode_gate_desc')}
                </span>
              </span>
            </button>
          </div>
        </div>

        <div className="max-h-[calc(85vh-200px)] space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-4">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex items-start gap-4 sm:items-center">
                <div className="relative shrink-0">
                  <div className="flex size-13 items-center justify-center rounded-2xl bg-pine-deep text-sm font-bold text-pine-light shadow-md sm:size-14">
                    {current.initials}
                  </div>
                  <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-amber-gold text-pine-deep shadow-sm">
                    <Hourglass className="size-3" />
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
                      {t('rot_current_label')}
                    </span>
                    <span className="rounded-full bg-error-container px-2 py-0.5 text-[9px] font-semibold text-red-700">
                      {t('rot_current_reason')}
                    </span>
                  </div>
                  <h3 className="mt-0.5 text-xs font-bold text-foreground sm:text-sm">
                    {current.name}
                  </h3>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
                    <span className="font-mono">NIP: {current.nip}</span>
                    <span>•</span>
                    <span>{current.subject}</span>
                    <span>•</span>
                    <span className="font-semibold text-pine-deep">
                      {t('rot_current_load', { count: current.currentJp })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-1 border-t border-border-subtle pt-2 md:items-end md:border-t-0 md:pt-0">
                <span className="text-[10px] text-muted-foreground">{t('rot_status_label')}</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`rounded px-2 py-1 text-[10px] ${statusChipTone(
                      mode === 'homeroom',
                    )}`}
                  >
                    {t('rot_status_homeroom', { count: current.homeroomStudents })}
                  </span>
                  <span
                    className={`rounded px-2 py-1 text-[10px] ${statusChipTone(mode === 'gate')}`}
                  >
                    {t('rot_status_gate')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
              <div>
                <h3 className="flex flex-wrap items-center gap-2 text-xs font-bold text-foreground">
                  {t('rot_candidates_title')}
                  <span className="rounded-full bg-pine-light px-2 py-0.5 text-[9px] font-semibold text-pine-deep">
                    {t('rot_candidates_badge')}
                  </span>
                </h3>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {t('rot_candidates_desc')}
                </p>
              </div>
              <div className="hidden shrink-0 text-right sm:block">
                <span className="text-[11px] font-semibold text-pine-deep">
                  {t('rot_recommended_count', { count: recommendedCount })}
                </span>
                <span className="block text-[10px] text-muted-foreground">
                  {t('rot_total_teachers', { count: totalTeacherCount })}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                  }}
                  placeholder={t('rot_search_placeholder')}
                  className="h-10 w-full rounded-xl bg-surface-container-low pr-3 pl-9 text-[11px] text-foreground transition-all placeholder:text-muted-foreground focus:bg-white focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setFilter('all');
                  }}
                  className={`shrink-0 cursor-pointer rounded-xl px-3 py-2 text-[10px] whitespace-nowrap transition-colors ${filterChipTone(
                    filter === 'all',
                  )}`}
                >
                  {t('rot_filter_all', { count: totalTeacherCount })}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilter('low');
                  }}
                  className={`shrink-0 cursor-pointer rounded-xl px-3 py-2 text-[10px] whitespace-nowrap transition-colors ${filterChipTone(
                    filter === 'low',
                  )}`}
                >
                  {t('rot_filter_low')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilter('subject');
                  }}
                  className={`shrink-0 cursor-pointer rounded-xl px-3 py-2 text-[10px] whitespace-nowrap transition-colors ${filterChipTone(
                    filter === 'subject',
                    true,
                  )}`}
                >
                  {t('rot_filter_subject')}
                </button>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              {visibleCandidates.map((candidate) => (
                <RotationCandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  isSelected={candidate.id === selectedId}
                  onSelect={() => {
                    setSelectedId(candidate.id);
                  }}
                />
              ))}

              {visibleCandidates.length === 0 && (
                <p className="rounded-xl bg-surface-container-low p-4 text-center text-[10px] text-muted-foreground">
                  {t('rot_no_candidates')}
                </p>
              )}
            </div>

            <details className="group rounded-xl bg-surface-container-low p-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-[10px] font-medium text-foreground">
                <span className="flex items-center gap-1.5">
                  <Info className="size-4 shrink-0 text-amber-dark" />
                  {t('rot_ineligible_summary', { count: mockRotationIneligible.length })}
                </span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-2 space-y-1 border-t border-border-subtle pt-2">
                {mockRotationIneligible.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex flex-wrap items-center justify-between gap-1 py-1 text-[10px]"
                  >
                    <span className="text-foreground">
                      {teacher.name} ({teacher.subject})
                    </span>
                    <span className="font-medium text-red-600">
                      {teacher.reason === 'full_load'
                        ? t('rot_ineligible_full', { count: teacher.loadJp ?? 0 })
                        : t('rot_ineligible_conflict')}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          </div>

          <div className="space-y-4 rounded-2xl bg-surface-container-low p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="flex items-center gap-2 text-xs font-bold text-pine-deep">
                <ClipboardCheck className="size-4 text-amber-gold" />
                {t('rot_params_title')}
              </h4>
              <span className="hidden text-[10px] text-muted-foreground sm:block">
                {t('rot_params_stage')}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="rotation-effective-date"
                  className="text-[10px] font-semibold text-foreground"
                >
                  {t('rot_effective_date')} <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-pine-deep" />
                  <input
                    id="rotation-effective-date"
                    type="date"
                    value={effectiveDate}
                    onChange={(event) => {
                      setEffectiveDate(event.target.value);
                    }}
                    className="h-11 w-full min-w-0 rounded-xl bg-white pr-3 pl-10 text-[11px] font-semibold text-foreground shadow-sm focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{t('rot_effective_hint')}</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold text-foreground">
                  {t('rot_assignment_type')} <span className="text-red-600">*</span>
                </span>
                <div className="grid h-11 grid-cols-2 gap-2 rounded-xl bg-surface-container-high p-1">
                  <button
                    type="button"
                    aria-pressed={assignmentType === 'temporary'}
                    onClick={() => {
                      setAssignmentType('temporary');
                    }}
                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg text-[10px] transition-all ${segmentTone(
                      assignmentType === 'temporary',
                    )}`}
                  >
                    {assignmentType === 'temporary' && (
                      <span className="size-1.5 rounded-full bg-amber-gold" />
                    )}
                    {t('rot_type_temporary')}
                  </button>
                  <button
                    type="button"
                    aria-pressed={assignmentType === 'permanent'}
                    onClick={() => {
                      setAssignmentType('permanent');
                    }}
                    className={`flex cursor-pointer items-center justify-center rounded-lg text-[10px] transition-all ${segmentTone(
                      assignmentType === 'permanent',
                    )}`}
                  >
                    {t('rot_type_permanent')}
                  </button>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {assignmentType === 'temporary'
                    ? t('rot_type_hint_temporary')
                    : t('rot_type_hint_permanent')}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="rotation-decree"
                className="flex items-center justify-between gap-2 text-[10px] font-semibold text-foreground"
              >
                <span>{t('rot_decree_label')}</span>
                <span className="text-[10px] font-normal text-muted-foreground">
                  {t('rot_decree_hint')}
                </span>
              </label>
              <div className="relative">
                <FileText className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="rotation-decree"
                  type="text"
                  value={decreeNumber}
                  onChange={(event) => {
                    setDecreeNumber(event.target.value);
                  }}
                  placeholder={t('rot_decree_placeholder')}
                  className="h-11 w-full rounded-xl bg-white pr-4 pl-10 font-mono text-[11px] text-foreground shadow-sm focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <span className="block text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
                {t('rot_integrity_label')}
              </span>
              {checklist.map((item, index) => (
                <label
                  key={item.title}
                  htmlFor={`rotation-check-${index}`}
                  aria-label={item.title}
                  className="flex cursor-pointer items-start gap-3 rounded-xl bg-white p-2.5 shadow-xs transition-colors hover:bg-surface-container-low"
                >
                  <input
                    id={`rotation-check-${index}`}
                    type="checkbox"
                    defaultChecked
                    className="mt-0.5 size-3.5 shrink-0 cursor-pointer rounded accent-pine-deep"
                  />
                  <span>
                    <span className="block text-[10px] font-semibold text-foreground">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-[10px] leading-relaxed text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 bg-surface-container-low px-5 py-4 sm:flex-row sm:px-6">
          <div className="flex max-w-sm items-center gap-2 text-[10px] leading-tight text-muted-foreground">
            <ShieldCheck className="size-5 shrink-0 text-pine-deep" />
            <p>{t('rot_verified_note')}</p>
          </div>
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <button
              type="button"
              onClick={props.onClose}
              className="h-10 cursor-pointer rounded-xl bg-white px-4 text-[11px] font-semibold text-foreground shadow-sm transition-colors hover:bg-surface-container-high"
            >
              {t('rot_btn_cancel')}
            </button>
            <button
              type="button"
              disabled={!canConfirm}
              onClick={handleConfirm}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-pine-deep px-4 text-[11px] font-semibold text-white shadow-md transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              <BadgeCheck className="size-4" />
              {t('rot_btn_confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
