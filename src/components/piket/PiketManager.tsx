'use client';

import { CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { PiketActiveCompensation } from '@/components/piket/PiketActiveCompensation';
import { PiketDutyRoster } from '@/components/piket/PiketDutyRoster';
import { PiketHeader } from '@/components/piket/PiketHeader';
import { PiketLiveTapStream } from '@/components/piket/PiketLiveTapStream';
import { PiketManualTapModal } from '@/components/piket/PiketManualTapModal';
import { PiketMetrics } from '@/components/piket/PiketMetrics';
import { PiketRotationModal } from '@/components/piket/PiketRotationModal';
import { PiketUniformForm } from '@/components/piket/PiketUniformForm';
import {
  filterTapLogs,
  INITIAL_ACTIVE_COMPENSATIONS,
  INITIAL_GATE_SHIFT,
  INITIAL_PIKET_METRICS,
  INITIAL_RFID_TAP_LOGS,
} from '@/data/mockPiket';
import { onDutyTeacherNames, todayIsoDate, useDutyAssignments } from '@/lib/api/piket';
import type {
  ActiveCompensation,
  GateFilterOptions,
  GateShiftInfo,
  PiketMetrics as PiketMetricsType,
  RfidTapLog,
  TapStatus,
} from '@/types/piket';
import type { RotationSubmission } from '@/types/teacherRotation';

/**
 * Gate Duty & RFID Attendance Main Manager Component.
 * @returns Rendered PiketManager component.
 */
export function PiketManager() {
  const t = useTranslations('PiketPage');

  const [isGateOpen, setIsGateOpen] = useState(INITIAL_GATE_SHIFT.isGateOpen);
  // shortcut: no backend endpoint for RFID tap stream / gate telemetry /
  // compensation tickets — tap logs, metrics and compensations stay mock.
  const [metrics, setMetrics] = useState<PiketMetricsType>(INITIAL_PIKET_METRICS);
  const [logs, setLogs] = useState<RfidTapLog[]>(INITIAL_RFID_TAP_LOGS);
  const [compensations, setCompensations] = useState<ActiveCompensation[]>(
    INITIAL_ACTIVE_COMPENSATIONS,
  );
  const [filterOptions, setFilterOptions] = useState<GateFilterOptions>({
    searchKeyword: '',
    classFilter: 'all',
    statusFilter: 'all',
  });
  const [isManualTapOpen, setIsManualTapOpen] = useState(false);
  const [isRotationOpen, setIsRotationOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('07:07:42 WIB');
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);

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

  const handleSimulateTap = (payload: {
    nis: string;
    studentName: string;
    className: string;
    photoUrl: string;
    readerName: string;
    status: TapStatus;
  }) => {
    const isLate = payload.status === 'late';
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;

    const newLog: RfidTapLog = {
      id: `tap-${Date.now()}`,
      nis: payload.nis,
      studentName: payload.studentName,
      className: payload.className,
      photoUrl: payload.photoUrl,
      tapTime: timeStr,
      status: payload.status,
      readerId: 'reader-sim',
      readerName: payload.readerName,
      delayMinutes: isLate ? 6 : 0,
      pointPenalty: isLate ? 2 : 0,
      compensationTask: isLate ? 'Piket Gerbang & Refleksi' : undefined,
      isUniformComplete: true,
    };

    setLogs((prev) => [newLog, ...prev]);

    setMetrics((prev) => ({
      ...prev,
      totalPresent: prev.totalPresent + 1,
      onTimeCount: isLate ? prev.onTimeCount : prev.onTimeCount + 1,
      lateCount: isLate ? prev.lateCount + 1 : prev.lateCount,
    }));

    showToast(
      isLate ? `Tap Terlambat: ${payload.studentName}` : `Tap Berhasil: ${payload.studentName}`,
      isLate
        ? 'Siswa terdeteksi hadir melewati batas waktu 07:00 WIB. Tiket piket diterbitkan.'
        : 'Kehadiran tepat waktu berhasil diverifikasi oleh reader RFID.',
    );
  };

  // shortcut: no backend endpoint for the gate uniform-infraction flow, keep mock.
  const handleUniformSubmit = (_data: {
    studentName: string;
    infractionIds: string[];
    totalPoints: number;
    notes: string;
  }) => {
    setMetrics((prev) => ({
      ...prev,
      uniformHoldCount: prev.uniformHoldCount + 1,
    }));

    showToast(t('toast_infraction_saved_title'), t('toast_infraction_saved_desc'));
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

  // shortcut: no backend endpoint for substitute-rotation eligibility/SK decrees
  // (real duty assignment goes through PiketDutyRoster -> POST /duty-assignments), keep mock.
  const handleRotationConfirm = (submission: RotationSubmission) => {
    setIsRotationOpen(false);
    showToast(
      t('toast_rotation_title'),
      t('toast_rotation_desc', { name: submission.teacher.name }),
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
            currentTime={currentTime}
            filterOptions={filterOptions}
            logs={filteredLogs}
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
          <PiketUniformForm onSubmit={handleUniformSubmit} />

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
          onConfirm={handleRotationConfirm}
        />
      )}

      {/* Floating Interactive Toast */}
      {toast && (
        <div className="text-on-primary fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-xl bg-pine-deep px-5 py-4 shadow-2xl transition-all">
          <CheckCircle2 className="size-5 text-amber-gold" />
          <div>
            <p className="text-xs font-bold">{toast.title}</p>
            <p className="font-caption text-tertiary-fixed-dim text-[11px]">{toast.desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}
