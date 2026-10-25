'use client';

import { CheckCircle2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  mockTeacherDuty,
  mockTeacherHistory,
  mockTeacherPerformance,
  mockTeacherProfile,
  mockTeachingSessions,
} from '@/data/mockTeacherPresence';
import {
  checkInToast,
  checkOutToast,
  getCurrentDevicePosition,
  isoDate,
  isoDateMinusDays,
  mapHistoryRow,
  mapTodayToAttendance,
  useTeacherCheckIn,
  useTeacherCheckOut,
  useTeacherGeofence,
  useTeacherPresenceHistory,
  useTeacherPresenceToday,
  verifyLocationFeedback,
} from '@/lib/api/presensi-guru';
import type { DevicePosition, GeofenceConfigDto } from '@/lib/api/presensi-guru';
import { useRouter } from '@/libs/I18nNavigation';
import type { TeacherScheduleFilter } from '@/types/teacherPresence';
import { TeacherAttendanceCard } from './TeacherAttendanceCard';
import { TeacherHistoryTable } from './TeacherHistoryTable';
import { TeacherJournalPanel } from './TeacherJournalPanel';
import { TeacherLocationWarningModal } from './TeacherLocationWarningModal';
import { TeacherPerformanceCard } from './TeacherPerformanceCard';
import { TeacherPresenceHeader } from './TeacherPresenceHeader';
import { TeacherPresenceSuccessModal } from './TeacherPresenceSuccessModal';
import { TeacherScheduleSection } from './TeacherScheduleSection';

/** Fallback radius when GET /geofence has not loaded (warning modal copy). */
const DEFAULT_SCHOOL_RADIUS_METERS = 50;

type LocationOutcome = {
  distanceMeters: number;
  fix: DevicePosition;
};

/**
 * Diagnostics shown by the geofence warning modal: server distance + radius
 * from the settings payload, GPS fix details from the device.
 *
 * @param outcome - Last rejected check result and its raw GPS fix.
 * @param geofence - GET /geofence payload (may be still loading).
 * @returns Props for `TeacherLocationWarningModal` minus the handlers.
 */
export function warningModalData(
  outcome: LocationOutcome | null,
  geofence: GeofenceConfigDto | undefined,
): {
  distanceMeters: number;
  radiusMeters: number;
  accuracyMeters: number;
  latitude: number;
  longitude: number;
} {
  return {
    distanceMeters: Math.round(outcome?.distanceMeters ?? 0),
    radiusMeters:
      geofence?.is_enabled === true ? geofence.radius_meters : DEFAULT_SCHOOL_RADIUS_METERS,
    accuracyMeters: Math.round(outcome?.fix.accuracy ?? 0),
    latitude: outcome?.fix.latitude ?? 0,
    longitude: outcome?.fix.longitude ?? 0,
  };
}

/**
 * Coordinator for the teacher presence portal, schedule filters, and modals.
 * Check-in/check-out/today/history/geofence come from the backend
 * (`/teacher-presence/*`, `/geofence`); schedule, journal, and performance
 * panels keep mock data (no backend endpoints).
 *
 * @returns Teacher presence workspace.
 */
export function TeacherPresenceManager() {
  const t = useTranslations('TeacherPresencePage');
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<TeacherScheduleFilter>('all');
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [warningOutcome, setWarningOutcome] = useState<LocationOutcome | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const todayQuery = useTeacherPresenceToday();
  const historyQuery = useTeacherPresenceHistory({
    from: isoDateMinusDays(isoDate(), 6),
    to: isoDate(),
    limit: 10,
  });
  const geofenceQuery = useTeacherGeofence();
  const checkIn = useTeacherCheckIn();
  const checkOut = useTeacherCheckOut();

  // GET /teacher-presence/today → UI attendance; on error (e.g. role without a
  // linked teacher profile) fall back to the neutral 'belum' state.
  const attendance = mapTodayToAttendance(todayQuery.data ?? null);
  const radiusMeters =
    geofenceQuery.data?.is_enabled === true
      ? geofenceQuery.data.radius_meters
      : DEFAULT_SCHOOL_RADIUS_METERS;

  // GET /teacher-presence/history (date-filtered); mock rows only while the
  // query has no data (loading or 403 for non-teacher accounts).
  const historyRows =
    historyQuery.data?.data.map((entry) => mapHistoryRow(entry, isoDate())) ?? mockTeacherHistory;

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleCheckIn = async () => {
    try {
      const fix = await getCurrentDevicePosition();
      const result = await checkIn.mutateAsync(fix);
      if (result.within_geofence) {
        setIsSuccessOpen(true);
        showToast(checkInToast(result, radiusMeters));
      } else {
        setWarningOutcome({ distanceMeters: result.distance_meters, fix });
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Check-in gagal. Coba lagi.');
    }
  };

  const handleCheckOut = async () => {
    if (!attendance.isCheckedIn) {
      showToast('Anda belum check-in hari ini.');
      return;
    }
    if (attendance.isCheckedOut === true) {
      showToast(t('toast_checkout_locked', { time: attendance.checkoutWindow }));
      return;
    }
    try {
      const fix = await getCurrentDevicePosition();
      const result = await checkOut.mutateAsync(fix);
      if (result.check_out_within_geofence) {
        showToast(checkOutToast(result, radiusMeters));
      } else {
        setWarningOutcome({ distanceMeters: result.check_out_distance_meters, fix });
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Check-out gagal. Coba lagi.');
    }
  };

  const handleVerifyLocation = () => {
    const feedback = verifyLocationFeedback(todayQuery.data ?? null, radiusMeters);
    if (feedback.kind === 'outside') {
      setWarningOutcome({
        distanceMeters: todayQuery.data?.distance_meters ?? 0,
        fix: {
          latitude: geofenceQuery.data?.latitude ?? 0,
          longitude: geofenceQuery.data?.longitude ?? 0,
          accuracy: 0,
        },
      });
      return;
    }
    showToast(feedback.message);
  };

  return (
    <div className="w-full">
      {toastMessage && (
        <div className="fixed right-6 bottom-6 z-50 flex animate-in items-center gap-3 rounded-xl border border-pine-hover bg-pine-deep px-4 py-3 text-white shadow-xl fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="size-5 shrink-0 text-amber-gold" />
          <span className="text-xs font-medium sm:text-sm">{toastMessage}</span>
          <button
            type="button"
            onClick={() => {
              setToastMessage(null);
            }}
            className="ml-2 cursor-pointer text-white/60 hover:text-white"
            aria-label={t('btn_close_notification')}
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <TeacherPresenceHeader profile={mockTeacherProfile} attendance={attendance} />

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1.45fr_1fr]">
        <TeacherAttendanceCard
          attendance={attendance}
          isSubmitting={checkIn.isPending || checkOut.isPending}
          onCheckIn={handleCheckIn}
          onShowReceipt={() => {
            setIsSuccessOpen(true);
          }}
          onVerifyLocation={handleVerifyLocation}
          onCheckout={handleCheckOut}
        />
        {/* shortcut: no backend endpoint for monthly performance/duty stats, keep mock */}
        <TeacherPerformanceCard performance={mockTeacherPerformance} duty={mockTeacherDuty} />
      </div>

      {/* shortcut: no backend endpoint for the daily teaching schedule, keep mock */}
      <TeacherScheduleSection
        sessions={mockTeachingSessions}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onOpenAttendance={() => {
          router.push('/dashboard/presensi');
        }}
        onViewRekap={() => {
          router.push('/dashboard/rekap');
        }}
        onOpenModule={() => {
          showToast(t('toast_module_opened'));
        }}
        onOpenMembers={() => {
          showToast(t('toast_members_opened'));
        }}
        onOpenQr={() => {
          showToast(t('toast_qr_opened'));
        }}
      />

      {/* shortcut: no backend endpoint for journal entries, keep mock save */}
      <TeacherJournalPanel
        onSaveJournal={(payload) => {
          showToast(t('toast_journal_saved', { className: payload.className }));
        }}
      />

      <TeacherHistoryTable
        rows={historyRows}
        onDownload={() => {
          // shortcut: no teacher-presence export endpoint, keep mock toast
          showToast(t('toast_history_downloaded'));
        }}
      />

      {isSuccessOpen && (
        <TeacherPresenceSuccessModal
          profile={mockTeacherProfile}
          attendance={attendance}
          performance={mockTeacherPerformance}
          sessions={mockTeachingSessions}
          onClose={() => {
            setIsSuccessOpen(false);
          }}
          onViewReceipt={() => {
            setIsSuccessOpen(false);
            showToast(t('toast_receipt_opened'));
          }}
        />
      )}

      {warningOutcome !== null && (
        <TeacherLocationWarningModal
          {...warningModalData(warningOutcome, geofenceQuery.data)}
          schoolName={mockTeacherProfile.school}
          onClose={() => {
            setWarningOutcome(null);
          }}
          onRecalibrate={() => {
            setWarningOutcome(null);
            void handleCheckIn();
          }}
          onRetry={() => {
            setWarningOutcome(null);
            void handleCheckIn();
          }}
          onRequestDuty={() => {
            setWarningOutcome(null);
            showToast(t('toast_duty_requested'));
          }}
        />
      )}
    </div>
  );
}
