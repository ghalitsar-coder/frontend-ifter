'use client';

import { CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  filterMatrixRows,
  generateCsvExport,
  MOCK_REKAP_SUMMARY,
  MOCK_STUDENT_MATRIX_ROWS,
  OCTOBER_2026_DAYS,
} from '@/data/mockRekap';
import type { BroadcastTargetType, StudentMatrixRow } from '@/types/rekap';
import { RekapAttendanceMatrix } from './RekapAttendanceMatrix';
import { RekapHeader } from './RekapHeader';
import { RekapStatusLegend } from './RekapStatusLegend';
import { RekapSummaryBento } from './RekapSummaryBento';
import { RekapWhatsAppBroadcastModal } from './RekapWhatsAppBroadcastModal';

/**
 * Main Coordinator for Monthly Attendance Matrix & WhatsApp Broadcast Module.
 * @returns Rendered Rekap Manager.
 */
export function RekapManager() {
  const t = useTranslations('RekapPage');

  const [selectedClass, setSelectedClass] = useState('Kelas VIII A');
  const [selectedPeriod, setSelectedPeriod] = useState('Oktober 2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'safe' | 'warning' | 'critical'
  >('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentMatrixRow | null>(
    null,
  );
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredStudents = filterMatrixRows(
    MOCK_STUDENT_MATRIX_ROWS,
    searchQuery,
    statusFilter,
  );

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleExportExcel = () => {
    const csvContent = generateCsvExport(filteredStudents, OCTOBER_2026_DAYS);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Attendly_Rekap_${selectedClass.replace(/\s+/g, '_')}_${selectedPeriod.replace(/\s+/g, '_')}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    triggerToast(t('modal_wa_export_toast'));
  };

  const handleSendBroadcast = (payload: {
    targetType: BroadcastTargetType;
    count: number;
  }) => {
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
        selectedClass={selectedClass}
        selectedPeriod={selectedPeriod}
        onClassChange={(cls) => {
          setSelectedClass(cls);
        }}
        onExportExcel={handleExportExcel}
        onOpenBroadcastModal={() => {
          setIsBroadcastModalOpen(true);
        }}
        onPeriodChange={(prd) => {
          setSelectedPeriod(prd);
        }}
      />

      {/* 2. Summary Bento Cards (6 Telemetry Tiles) */}
      <RekapSummaryBento metrics={MOCK_REKAP_SUMMARY} />

      {/* 3. Status Code Indicator Legend */}
      <RekapStatusLegend />

      {/* 4. Horizontal Scrollable Matrix Table */}
      <RekapAttendanceMatrix
        days={OCTOBER_2026_DAYS}
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
        className={selectedClass}
        isOpen={isBroadcastModalOpen}
        period={selectedPeriod}
        selectedStudent={selectedStudent}
        students={MOCK_STUDENT_MATRIX_ROWS}
        onClose={() => {
          setIsBroadcastModalOpen(false);
        }}
        onSendBroadcast={handleSendBroadcast}
        onSendTest={handleSendTest}
      />

      {/* Floating Interactive Toast */}
      {toastMessage && (
        <div className="fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-2xl bg-pine-deep px-5 py-3.5 text-on-primary shadow-2xl transition-all">
          <CheckCircle2 className="size-5 text-amber-gold" />
          <span className="font-caption text-xs font-semibold">
            {toastMessage}
          </span>
        </div>
      )}
    </div>
  );
}
