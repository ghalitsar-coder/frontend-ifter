import { CheckCircle2, Info, LogOut, MapPin, ScanFace } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { TeacherAttendance } from '@/types/teacherPresence';

/**
 * Daily gate attendance summary with location and biometric verification tiles.
 *
 * @param props - Teacher profile, attendance record, and modal hooks.
 * @returns Attendance card.
 */
export function TeacherAttendanceCard(props: {
  attendance: TeacherAttendance;
  onShowReceipt: () => void;
  onVerifyLocation: () => void;
  onCheckout: () => void;
}) {
  const t = useTranslations('TeacherPresencePage');

  return (
    <section className="rounded-2xl border border-border-subtle bg-card p-5 shadow-xs">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full border-4 border-pine-light bg-pine-deep text-sm font-bold text-amber-gold">
            SR
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-foreground sm:text-base">
                {t('attendance_title')}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-pine-light px-2.5 py-0.5 text-[11px] font-bold text-pine-deep">
                <CheckCircle2 className="size-3" />
                {t('status_on_time')}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t('checked_in_note', { time: props.attendance.checkInTime })}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={props.onShowReceipt}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface-container-low text-muted-foreground transition-colors hover:bg-pine-light hover:text-pine-deep"
          aria-label={t('btn_receipt')}
        >
          <Info className="size-4" />
        </button>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={props.onVerifyLocation}
          className="flex cursor-pointer items-center gap-3 rounded-xl bg-surface-container-low p-3.5 text-left transition-colors hover:bg-pine-light/70"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pine-light text-pine-deep">
            <MapPin className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">{t('geo_verified')}</p>
            <p className="truncate text-xs font-semibold text-foreground">
              {t('geo_distance', {
                distance: props.attendance.distanceMeters,
                gate: props.attendance.gateName,
              })}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-3 rounded-xl bg-surface-container-low p-3.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pine-light text-pine-deep">
            <ScanFace className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">{t('biometric_title')}</p>
            <p className="truncate text-xs font-semibold text-foreground">
              {t('biometric_match', { match: props.attendance.biometricMatch })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={props.onShowReceipt}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-pine-light px-4 py-3 text-xs font-bold text-pine-deep transition-colors hover:bg-pine-light/70 sm:text-sm"
        >
          <CheckCircle2 className="size-4" />
          <span>{t('btn_checked_in', { time: props.attendance.checkInTime })}</span>
        </button>

        <button
          type="button"
          onClick={props.onCheckout}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border-control bg-card px-4 py-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-pine-deep sm:text-sm"
        >
          <LogOut className="size-4" />
          <span>{t('btn_checkout', { time: props.attendance.checkoutWindow })}</span>
        </button>
      </div>
    </section>
  );
}
