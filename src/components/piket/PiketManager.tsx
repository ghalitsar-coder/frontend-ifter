'use client';

import { CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { PiketActiveCompensation } from '@/components/piket/PiketActiveCompensation';
import { PiketDutyRoster } from '@/components/piket/PiketDutyRoster';
import { PiketHeader } from '@/components/piket/PiketHeader';
import { PiketLiveTapStream } from '@/components/piket/PiketLiveTapStream';
import { PiketManualTapModal } from '@/components/piket/PiketManualTapModal';
import { PiketMetrics } from '@/components/piket/PiketMetrics';
import { PiketRotationModal } from '@/components/piket/PiketRotationModal';
import { PiketUniformForm } from '@/components/piket/PiketUniformForm';
import {
  INITIAL_ACTIVE_COMPENSATIONS,
  INITIAL_GATE_SHIFT,
  INITIAL_PIKET_METRICS,
} from '@/data/mockPiket';
import {
  dedupeTaps,
  filterTapLogs,
  isValidTimeZone,
  localDateInZone,
  mapTapToRfidLog,
  useDeviceTaps,
} from '@/lib/api/device-taps';
import type { TapPolicy } from '@/lib/api/device-taps';
import { settingsToPresencePolicy, useAttendanceSettings } from '@/lib/api/pengaturan';
import { onDutyTeacherNames, todayIsoDate, useDutyAssignments } from '@/lib/api/piket';
import { can } from '@/lib/api/rbac';
import type {
  ActiveCompensation,
  GateFilterOptions,
  GateShiftInfo,
  PiketMetrics as PiketMetricsType,
  RfidTapLog,
  TapStatus,
} from '@/types/piket';
import { SCHOOL_TIME_ZONE } from '@/utils/SchoolPeriod';

type ManualTapPayload = {
  nis: string;
  studentName: string;
  className: string;
  photoUrl: string;
  readerName: string;
  status: TapStatus;
};

/**
 * Builds a simulated tap row stamped in the school timezone so manual rows
 * agree with the polled device stream.
 * @param payload - Manual tap form values.
 * @param timeZone - School IANA timezone.
 * @returns Stream log for the manual tap.
 */
const buildManualTapLog = (payload: ManualTapPayload, timeZone: string): RfidTapLog => {
  const isLate = payload.status === 'late';
  const clock = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).format(new Date());

  return {
    id: `tap-${Date.now()}`,
    nis: payload.nis,
    studentName: payload.studentName,
    className: payload.className,
    photoUrl: payload.photoUrl,
    tapTime: `${clock} WIB`,
    status: payload.status,
    readerId: 'reader-sim',
    readerName: payload.readerName,
    origin: 'manual',
    delayMinutes: isLate ? 6 : 0,
    pointPenalty: isLate ? 2 : 0,
    compensationTask: isLate ? 'Piket Gerbang & Refleksi' : undefined,
    isUniformComplete: true,
  };
};

/**
 * Gate Duty & RFID Attendance Main Manager Component.
 * @returns Rendered PiketManager component.
 */
export function PiketManager() {
  const t = useTranslations('PiketPage');
  const { roles } = useAuth();

  const [isGateOpen, setIsGateOpen] = useState(INITIAL_GATE_SHIFT.isGateOpen);
  // shortcut: no backend endpoint for gate telemetry or compensation tickets —
  // gate toggle, uniform holds and compensations stay mock.
  const [uniformHoldCount, setUniformHoldCount] = useState(INITIAL_PIKET_METRICS.uniformHoldCount);
  const [manualLogs, setManualLogs] = useState<RfidTapLog[]>([]);
  const [compensations, setCompensations] = useState<ActiveCompensation[]>(
    INITIAL_ACTIVE_COMPENSATIONS,
  );
  const [filterOptions, setFilterOptions] = useState<GateFilterOptions>({
    searchKeyword: '',
    readerFilter: 'all',
    statusFilter: 'all',
  });
  const [isManualTapOpen, setIsManualTapOpen] = useState(false);
  const [isRotationOpen, setIsRotationOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('07:07:42 WIB');
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);

  // Real tap stream: GET /device-taps for today in the school timezone, polled
  // every 10 s. Roles without the device_taps capability never call the API.
  const canReadTaps = can(roles, 'device_taps');
  const settingsQuery = useAttendanceSettings();
  const presence =
    settingsQuery.data === undefined ? null : settingsToPresencePolicy(settingsQuery.data);
  const rawTimezone = presence?.timezone;
  // Backend settings.timezone is unvalidated; an invalid IANA name would throw inside Intl.
  const timezone =
    rawTimezone !== undefined && isValidTimeZone(rawTimezone) ? rawTimezone : SCHOOL_TIME_ZONE;
  const today = localDateInZone(new Date().toISOString(), timezone);
  const tapsQuery = useDeviceTaps({ from: today, to: today, limit: 200 }, canReadTaps);

  const deviceLogs: RfidTapLog[] =
    presence === null || tapsQuery.data === undefined
      ? []
      : dedupeTaps(tapsQuery.data).map((tap) => {
          const policy: TapPolicy = { timezone, onTimeUntil: presence.onTimeUntil };
          return mapTapToRfidLog(tap, policy);
        });
  const logs = [...manualLogs, ...deviceLogs];

  const readerNames = new Map<string, string>();
  for (const log of deviceLogs) {
    readerNames.set(log.readerId, log.readerName);
  }

  const metrics: PiketMetricsType = {
    totalPresent: logs.filter((log) => log.status !== 'unknown_card').length,
    totalEnrolled: INITIAL_PIKET_METRICS.totalEnrolled, // shortcut: no live enrollment endpoint yet
    onTimeCount: logs.filter((log) => log.status === 'on_time').length,
    lateCount: logs.filter((log) => log.status === 'late').length,
    uniformHoldCount,
    activeReadersCount: readerNames.size,
    readerLatencySec: INITIAL_PIKET_METRICS.readerLatencySec, // shortcut: no latency endpoint yet
  };

  // Real duty roster (GET /duty-assignments, admin-only). Non-admins receive a
  // 403 and the roster data stays undefined, so the header keeps the mock
  // on-duty names as a fallback.
  const dutyAssignmentsQuery = useDutyAssignments();
  const onDutyTeachers =
    dutyAssignmentsQuery.data === undefined
      ? INITIAL_GATE_SHIFT.onDutyTeachers
      : onDutyTeacherNames(dutyAssignmentsQuery.data, todayIsoDate());
  const shiftInfo: GateShiftInfo = {
    ...INITIAL_GATE_SHIFT,
    isGateOpen,
    onDutyTeachers,
  };

  // Clock tick simulator
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds} WIB`);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const showToast = (title: string, desc: string) => {
    setToast({ title, desc });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // shortcut: no backend endpoint for gate open/close or bell trigger, keep local-only toggle.
  const handleToggleGate = () => {
    const nextState = !isGateOpen;
    setIsGateOpen(nextState);
    if (nextState) {
      showToast(t('toast_gate_opened_title'), t('toast_gate_opened_desc'));
    } else {
      showToast(t('toast_gate_closed_title'), t('toast_gate_closed_desc'));
    }
  };

  const handleRingBell = () => {
    showToast(t('toast_bell_title'), t('toast_bell_desc'));
  };

  const handleFilterChange = (opts: Partial<GateFilterOptions>) => {
    setFilterOptions((prev) => ({ ...prev, ...opts }));
  };

  const handleSimulateTap = (payload: ManualTapPayload) => {
    const isLate = payload.status === 'late';
    setManualLogs((prev) => [buildManualTapLog(payload, timezone), ...prev]);

    showToast(
      isLate ? `Tap Terlambat: ${payload.studentName}` : `Tap Berhasil: ${payload.studentName}`,
      isLate
        ? 'Siswa terdeteksi hadir melewati batas waktu gerbang. Tiket piket diterbitkan.'
        : 'Kehadiran tepat waktu berhasil diverifikasi oleh guru piket.',
    );
  };

  // Uniform submissions go straight to POST /uniform-reports inside
  // PiketUniformForm; this callback only feeds the mock KPI counter.
  const handleUniformSubmit = (_data: {
    studentName: string;
    infractionIds: string[];
    totalPoints: number;
    notes: string;
  }) => {
    setUniformHoldCount((prev) => prev + 1);
  };

  const handleCompleteComp = (id: string) => {
    setCompensations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isCompleted: true, remainingMinutes: 0 } : c)),
    );
    showToast(t('toast_comp_complete_title'), t('toast_comp_complete_desc'));
  };

  const handlePrintPermit = (student: ActiveCompensation) => {
    showToast(
      `Surat Masuk: ${student.studentName}`,
      'Surat izin masuk kelas berhasil dicetak dan disahkan oleh guru piket.',
    );
  };

  const handlePrintRecap = () => {
    showToast(
      'Rekapitulasi Piket Gerbang',
      'Dokumen rekap kehadiran dan penertiban gerbang telah disiapkan untuk kepala sekolah.',
    );
  };

  const filteredLogs = filterTapLogs(logs, filterOptions);

  return (
    <div className="space-y-8">
      {/* Shift Header */}
      <PiketHeader
        shiftInfo={shiftInfo}
        onOpenRotation={() => {
          setIsRotationOpen(true);
        }}
        onRingBell={handleRingBell}
        onToggleGate={handleToggleGate}
      />

      {/* Duty Roster (GET/POST /duty-assignments, PUT /duty-assignments/:id/end) */}
      <PiketDutyRoster onToast={showToast} />

      {/* 5 KPI Telemetry Cards */}
      <PiketMetrics metrics={metrics} />

      {/* Main Split Grid (60% Live Stream / 40% Rapid Penalty & Comp) */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left Column (60%): Live Tap Stream */}
        <div className="lg:col-span-7">
          <PiketLiveTapStream
            canReadTaps={canReadTaps}
            currentTime={currentTime}
            filterOptions={filterOptions}
            isTapsLoading={canReadTaps && tapsQuery.isLoading}
            logs={filteredLogs}
            readerOptions={[...readerNames].map(([id, name]) => ({ id, name }))}
            totalCount={logs.length}
            onAssignComp={(student) => {
              showToast(
                `Tugaskan: ${student.studentName}`,
                'Siswa diarahkan ke pos piket untuk penugasan kompensasi kedisiplinan.',
              );
            }}
            onFilterChange={handleFilterChange}
            onOpenManualTap={() => {
              setIsManualTapOpen(true);
            }}
          />
        </div>

        {/* Right Column (40%): Rapid Uniform Form & Active Compensations */}
        <div className="space-y-6 lg:col-span-5">
          <PiketUniformForm onToast={showToast} onSubmit={handleUniformSubmit} />

          <PiketActiveCompensation
            compensations={compensations}
            onCompleteCompensation={handleCompleteComp}
            onPrintPermit={handlePrintPermit}
            onPrintRecap={handlePrintRecap}
          />
        </div>
      </div>

      {/* Simulator Modal */}
      <PiketManualTapModal
        isOpen={isManualTapOpen}
        onClose={() => {
          setIsManualTapOpen(false);
        }}
        onSimulateTap={handleSimulateTap}
      />

      {isRotationOpen && (
        <PiketRotationModal
          onClose={() => {
            setIsRotationOpen(false);
          }}
          onToast={showToast}
        />
      )}

      {/* Floating Interactive Toast */}
      {toast && (
        <div className="fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-xl bg-pine-deep px-5 py-4 text-on-primary shadow-2xl transition-all">
          <CheckCircle2 className="size-5 text-amber-gold" />
          <div>
            <p className="text-xs font-bold">{toast.title}</p>
            <p className="font-caption text-[11px] text-tertiary-fixed-dim">{toast.desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}
