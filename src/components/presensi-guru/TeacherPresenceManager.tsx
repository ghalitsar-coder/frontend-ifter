'use client';

import { CheckCircle2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  mockTeacherAttendance,
  mockTeacherDuty,
  mockTeacherHistory,
  mockTeacherPerformance,
  mockTeacherProfile,
  mockTeachingSessions,
} from '@/data/mockTeacherPresence';
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

/**
 * Coordinator for the teacher presence portal, schedule filters, and modals.
 *
 * @returns Teacher presence workspace.
 */
export function TeacherPresenceManager() {
  const t = useTranslations('TeacherPresencePage');
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<TeacherScheduleFilter>('all');
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
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

      <TeacherPresenceHeader profile={mockTeacherProfile} attendance={mockTeacherAttendance} />

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1.45fr_1fr]">
        <TeacherAttendanceCard
          attendance={mockTeacherAttendance}
          onShowReceipt={() => {
            setIsSuccessOpen(true);
          }}
          onVerifyLocation={() => {
            setIsWarningOpen(true);
          }}
          onCheckout={() => {
            showToast(t('toast_checkout_locked', { time: mockTeacherAttendance.checkoutWindow }));
          }}
        />
        <TeacherPerformanceCard performance={mockTeacherPerformance} duty={mockTeacherDuty} />
      </div>

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

      <TeacherJournalPanel
        onSaveJournal={(payload) => {
          showToast(t('toast_journal_saved', { className: payload.className }));
        }}
      />

      <TeacherHistoryTable
        rows={mockTeacherHistory}
        onDownload={() => {
          showToast(t('toast_history_downloaded'));
        }}
      />

      {isSuccessOpen && (
        <TeacherPresenceSuccessModal
          profile={mockTeacherProfile}
          attendance={mockTeacherAttendance}
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

      {isWarningOpen && (
        <TeacherLocationWarningModal
          distanceMeters={485}
          radiusMeters={50}
          accuracyMeters={6}
          latitude={-7.716382}
          longitude={110.355291}
          schoolName={mockTeacherProfile.school}
          onClose={() => {
            setIsWarningOpen(false);
          }}
          onRecalibrate={() => {
            setIsWarningOpen(false);
            setIsSuccessOpen(true);
          }}
          onRetry={() => {
            setIsWarningOpen(false);
            setIsSuccessOpen(true);
          }}
          onRequestDuty={() => {
            setIsWarningOpen(false);
            showToast(t('toast_duty_requested'));
          }}
        />
      )}
    </div>
  );
}
