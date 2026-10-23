'use client';

import {
  BookOpen,
  Check,
  Clock,
  LayoutDashboard,
  Lock,
  ReceiptText,
  ScanFace,
  ShieldCheck,
  Timer,
  Trophy,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import type {
  TeacherAttendance,
  TeacherPerformance,
  TeacherProfile,
  TeachingSession,
} from '@/types/teacherPresence';

const COUNTDOWN_SECONDS = 5;

/**
 * Success receipt modal shown after a verified gate check-in.
 *
 * @param props - Verified attendance payload and close handler.
 * @returns Full-screen confirmation modal.
 */
export function TeacherPresenceSuccessModal(props: {
  profile: TeacherProfile;
  attendance: TeacherAttendance;
  performance: TeacherPerformance;
  sessions: TeachingSession[];
  onClose: () => void;
  onViewReceipt: () => void;
}) {
  const t = useTranslations('TeacherPresencePage');
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
  const { onClose } = props;

  const totalHours = props.sessions.length * 2;
  const nearestSession = props.sessions.at(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((value) => value - 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (seconds <= 0) {
      onClose();
    }
  }, [seconds, onClose]);

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is already scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-presence-success-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-3 backdrop-blur-sm sm:p-6"
    >
      <div className="relative my-4 w-full max-w-2xl overflow-hidden rounded-3xl border border-border-subtle bg-card shadow-2xl sm:my-8">
        <div className="h-1.5 bg-gradient-to-r from-pine-deep via-amber-gold to-pine-deep" />

        <button
          type="button"
          onClick={props.onClose}
          className="absolute top-5 right-4 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full bg-surface-container-low text-muted-foreground transition-colors hover:bg-pine-light hover:text-pine-deep"
          aria-label={t('btn_close')}
        >
          <X className="size-4" />
        </button>

        <div className="px-5 pt-8 pb-5 text-center sm:px-9">
          <div className="relative mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-pine-deep text-amber-gold shadow-md">
            <BookOpen className="size-7" />
            <span className="absolute -right-1.5 -bottom-1.5 flex size-6 items-center justify-center rounded-full border-2 border-card bg-amber-gold text-pine-deep">
              <Check className="size-3.5" strokeWidth={3} />
            </span>
          </div>

          <span className="inline-flex rounded-full bg-pine-light px-3 py-1 text-[10px] font-bold tracking-[0.14em] text-pine-deep uppercase">
            {t('success_badge')}
          </span>

          <h2
            id="teacher-presence-success-title"
            className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-[2rem]"
          >
            {t('success_title')}
          </h2>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-surface px-3 py-1.5 text-[11px] font-semibold text-amber-dark">
              <Clock className="size-3.5" />
              {t('success_time_strip', {
                date: props.profile.serverDate,
                time: props.attendance.checkInTime,
              })}
              <span className="rounded-full bg-amber-gold px-2 py-0.5 text-[10px] font-bold text-pine-deep">
                {t('success_on_time_chip', { time: props.attendance.lateLimit })}
              </span>
            </span>
          </div>

          <p className="mx-auto mt-4 max-w-lg text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {t.rich('success_description', {
              name: props.profile.name,
              strong: (chunks) => <strong className="font-bold text-foreground">{chunks}</strong>,
            })}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
            <div className="rounded-2xl bg-surface-container-low p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <ShieldCheck className="size-4 text-pine-deep" />
                  {t('success_gps_title')}
                </span>
                <span className="rounded-full bg-pine-light px-2 py-0.5 text-[10px] font-bold text-pine-deep">
                  {t('success_valid')}
                </span>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
                <dt className="text-muted-foreground">{t('success_zone_label')}</dt>
                <dd className="font-semibold text-foreground">
                  {t('success_zone_value', { gate: props.attendance.gateName })}
                </dd>
                <dt className="text-muted-foreground">{t('success_distance_label')}</dt>
                <dd className="font-semibold text-foreground">
                  {t('success_distance_value', { distance: props.attendance.distanceMeters })}
                </dd>
                <dt className="text-muted-foreground">{t('success_accuracy_label')}</dt>
                <dd className="font-semibold text-foreground">{t('success_accuracy_value')}</dd>
              </dl>
            </div>

            <div className="rounded-2xl bg-surface-container-low p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <ScanFace className="size-4 text-pine-deep" />
                  {t('biometric_title')}
                </span>
                <span className="rounded-full bg-pine-light px-2 py-0.5 text-[10px] font-bold text-pine-deep">
                  {t('success_match', { match: props.attendance.biometricMatch })}
                </span>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
                <dt className="text-muted-foreground">{t('success_liveness_label')}</dt>
                <dd className="font-semibold text-foreground">{t('success_liveness_value')}</dd>
                <dt className="text-muted-foreground">{t('success_device_label')}</dt>
                <dd className="font-semibold text-foreground">{t('success_device_value')}</dd>
                <dt className="text-muted-foreground">{t('success_algo_label')}</dt>
                <dd className="font-semibold text-foreground">{t('success_algo_value')}</dd>
              </dl>
            </div>
          </div>

          <div className="relative mt-4 overflow-hidden rounded-2xl bg-pine-deep p-4 text-left text-white">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold">
                <BookOpen className="size-3.5 text-amber-gold" />
                {t('success_schedule_title')}
              </span>
              <span className="text-[10px] font-semibold text-amber-gold">
                {t('success_schedule_meta', { count: props.sessions.length, hours: totalHours })}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-emerald-100/70">{t('success_nearest_label')}</p>
                <p className="text-xs font-bold text-amber-gold sm:text-sm">
                  {nearestSession?.className} · {nearestSession?.subject}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-100/80">
                  <Clock className="size-3" />
                  {nearestSession?.time} · {nearestSession?.room}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-emerald-100/70">{t('success_performance_label')}</p>
                <p className="text-xs font-bold sm:text-sm">
                  {props.performance.presentDays} / {props.performance.workingDays}{' '}
                  {t('performance_days_unit')} ({props.performance.rate}%)
                </p>
                <p className="mt-0.5 text-[10px] text-emerald-100/80">
                  {t('success_permit_value', { count: props.performance.permitDays })}
                </p>
              </div>
            </div>

            <div className="absolute right-4 bottom-3 flex size-12 items-center justify-center rounded-full bg-white/5">
              <Trophy className="size-5 text-amber-gold" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={props.onClose}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-pine-deep px-4 py-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-pine-hover sm:text-sm"
            >
              <LayoutDashboard className="size-4 text-amber-gold" />
              {t('success_close_dashboard')}
            </button>
            <button
              type="button"
              onClick={props.onViewReceipt}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border-control bg-card px-4 py-3 text-xs font-bold text-foreground transition-colors hover:bg-surface-container-low sm:text-sm"
            >
              <ReceiptText className="size-4 text-muted-foreground" />
              {t('success_view_receipt')}
            </button>
          </div>

          <div className="mt-5 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Timer className="size-3" />
                {t('success_auto_close', { count: Math.max(seconds, 0) })}
              </span>
              <span>{t('success_sync_done')}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-surface-container-low">
              <div
                className="h-full rounded-full bg-amber-gold transition-all duration-1000 ease-linear"
                style={{ width: `${(Math.max(seconds, 0) / COUNTDOWN_SECONDS) * 100}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[9px] text-muted-foreground">
              <span className="font-mono">{t('success_transaction_id')}</span>
              <span className="inline-flex items-center gap-1">
                <Lock className="size-2.5" />
                {t('success_encryption')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
