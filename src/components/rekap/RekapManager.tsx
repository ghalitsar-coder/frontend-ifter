'use client';

import { CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { useAcademicYears, useClassList, useStudentSearch } from '@/lib/api/queries';
import {
  buildCalendarDays,
  buildMatrixRows,
  buildSummaryMetrics,
  currentPeriodLabel,
  downloadRekapAttendance,
  downloadRekapAttendanceReport,
  filterMatrixRows,
  parsePeriod,
  periodRange,
  pickActiveAcademicYear,
  recentPeriodLabels,
  resolveClassId,
  saveBlobToDisk,
  shiftPeriodLabel,
  useRekapHistory,
  useRekapReport,
  useRekapSummary,
} from '@/lib/api/rekap';
import type { BroadcastTargetType, StudentMatrixRow } from '@/types/rekap';
import { RekapAttendanceMatrix } from './RekapAttendanceMatrix';
import { RekapHeader } from './RekapHeader';
import { RekapStatusLegend } from './RekapStatusLegend';
import { RekapSummaryBento } from './RekapSummaryBento';
import { RekapWhatsAppBroadcastModal } from './RekapWhatsAppBroadcastModal';

/**
 * Inline error strip shown when the summary query fails.
 * @param props - Carries the thrown error.
 * @returns Rendered banner.
 */
function RekapErrorBanner(props: { error: Error }) {
  return (
    <div className="bg-status-absent/40 font-caption text-error rounded-2xl px-4 py-3 text-xs font-semibold">
      {props.error instanceof ApiError ? props.error.message : 'Gagal memuat data rekap'}
    </div>
  );
}

/**
 * Main Coordinator for Monthly Attendance Matrix & WhatsApp Broadcast Module.
 * @returns Rendered Rekap Manager.
 */
export function RekapManager() {
  const t = useTranslations('RekapPage');

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(currentPeriodLabel);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'safe' | 'warning' | 'critical'>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentMatrixRow | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const yearsQuery = useAcademicYears();
  const activeYear = pickActiveAcademicYear(yearsQuery.data);
  const classesQuery = useClassList(
    activeYear === undefined
      ? { status: 'active' }
      : { academic_year_id: activeYear.id, status: 'active' },
  );
  const classes = classesQuery.data ?? [];
  const classId = resolveClassId(selectedClassId, classes);
  const selectedClass = classes.find((cls) => cls.id === classId);

  const { year, month } = parsePeriod(selectedPeriod);
  const { from, to } = periodRange(selectedPeriod);
  const days = buildCalendarDays(year, month);

  const summaryQuery = useRekapSummary({ class_id: classId, from, to });
  const historyQuery = useRekapHistory({ class_id: classId, from, to });
  // 3-month window so the delta tile can compare the two latest monthly buckets.
  const reportQuery = useRekapReport({
    class_id: classId,
    from: periodRange(shiftPeriodLabel(selectedPeriod, -2)).from,
    to,
    group_by: 'month',
  });
  const studentsQuery = useStudentSearch({ class_id: classId, limit: 100 });

  const matrixRows = buildMatrixRows({
    summary: summaryQuery.data,
    history: historyQuery.data,
    students: studentsQuery.data,
    days,
    className: selectedClass?.name ?? '',
    year,
    month,
  });
  const metrics = buildSummaryMetrics({
    summary: summaryQuery.data,
    effectiveDays: days.filter((day) => !day.isWeekend).length,
    report: reportQuery.data,
  });

  const filteredStudents = filterMatrixRows(matrixRows, searchQuery, statusFilter);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const runExport = async (
    task: Promise<{ blob: Blob; filename: string | null }>,
    fallbackFilename: string,
    fallbackMessage: string,
  ) => {
    try {
      const { blob, filename } = await task;
      saveBlobToDisk(blob, filename ?? fallbackFilename);
      triggerToast(t('modal_wa_export_toast'));
    } catch (error) {
      triggerToast(error instanceof ApiError ? error.message : fallbackMessage);
    }
  };

  const handleExportSummary = () => {
    void runExport(
      downloadRekapAttendance({ class_id: classId, from, to }),
      `Rekap_Absensi_${from}_${to}.xlsx`,
      'Gagal mengunduh rekap absensi',
    );
  };

  const handleExportReport = () => {
    void runExport(
      downloadRekapAttendanceReport({ class_id: classId, from, to, group_by: 'month' }),
      `Laporan_Absensi_${from}_${to}.xlsx`,
      'Gagal mengunduh laporan absensi',
    );
  };

  const handleSendBroadcast = (payload: { targetType: BroadcastTargetType; count: number }) => {
    triggerToast(t('modal_wa_sent_toast', { count: payload.count }));
  };

  const handleSendTest = () => {
    triggerToast(t('modal_wa_test_toast'));
  };

  const handleSelectStudent = (student: StudentMatrixRow) => {
    setSelectedStudent(student);
    setIsBroadcastModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Filters & Action CTAs */}
      <RekapHeader
        classes={classes.map((cls) => ({
          id: cls.id,
          name: cls.name,
          homeroomName: cls.homeroom_teacher_name,
        }))}
        onClassChange={(id) => {
          setSelectedClassId(id);
        }}
        onExportReport={handleExportReport}
        onExportSummary={handleExportSummary}
        onOpenBroadcastModal={() => {
          setIsBroadcastModalOpen(true);
        }}
        onPeriodChange={(prd) => {
          setSelectedPeriod(prd);
        }}
        periods={recentPeriodLabels(6)}
        selectedClassId={classId}
        selectedPeriod={selectedPeriod}
      />

      {summaryQuery.isError && <RekapErrorBanner error={summaryQuery.error} />}
      {summaryQuery.isPending && classId !== '' && (
        <div className="bg-surface-card font-caption text-text-muted rounded-2xl px-4 py-3 text-xs shadow-xs">
          Memuat data rekap…
        </div>
      )}

      {/* 2. Summary Bento Cards (6 Telemetry Tiles) */}
      <RekapSummaryBento metrics={metrics} />

      {/* 3. Status Code Indicator Legend */}
      <RekapStatusLegend />

      {/* 4. Horizontal Scrollable Matrix Table */}
      <RekapAttendanceMatrix
        days={days}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        students={filteredStudents}
        onSearchChange={(q) => {
          setSearchQuery(q);
        }}
        onSelectStudent={handleSelectStudent}
        onStatusFilterChange={(status) => {
          setStatusFilter(status);
        }}
      />

      {/* 5. WhatsApp Broadcast Modal */}
      <RekapWhatsAppBroadcastModal
        className={selectedClass?.name ?? ''}
        homeroomTeacher={selectedClass?.homeroom_teacher_name ?? '—'}
        isOpen={isBroadcastModalOpen}
        period={selectedPeriod}
        selectedStudent={selectedStudent}
        students={matrixRows}
        onClose={() => {
          setIsBroadcastModalOpen(false);
        }}
        onSendBroadcast={handleSendBroadcast}
        onSendTest={handleSendTest}
      />

      {/* Floating Interactive Toast */}
      {toastMessage && (
        <div className="text-on-primary fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-2xl bg-pine-deep px-5 py-3.5 shadow-2xl transition-all">
          <CheckCircle2 className="size-5 text-amber-gold" />
          <span className="font-caption text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
