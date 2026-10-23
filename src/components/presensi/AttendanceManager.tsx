'use client';

import { CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { AttendanceDocumentModal } from '@/components/presensi/AttendanceDocumentModal';
import { AttendanceHeader } from '@/components/presensi/AttendanceHeader';
import { AttendanceMetrics } from '@/components/presensi/AttendanceMetrics';
import { AttendanceNotificationDispatch } from '@/components/presensi/AttendanceNotificationDispatch';
import { AttendanceProgressBar } from '@/components/presensi/AttendanceProgressBar';
import { AttendanceRosterTable } from '@/components/presensi/AttendanceRosterTable';
import { AttendanceTeacherJournal } from '@/components/presensi/AttendanceTeacherJournal';
import { AttendanceToolbar } from '@/components/presensi/AttendanceToolbar';
import { INITIAL_STUDENT_ROSTER } from '@/data/mockAttendance';
import type {
  AttendanceFilter,
  AttendanceStatus,
  DocumentPreviewData,
  StudentAttendanceRecord,
} from '@/types/attendance';

/**
 * Main interactive Attendance Manager coordinating student roster, filters, and actions.
 *
 * @param props - Component properties.
 * @returns Complete attendance interactive workspace.
 */
export function AttendanceManager(props: { initialStudents?: StudentAttendanceRecord[] }) {
  const t = useTranslations('AttendancePage');

  const [students, setStudents] = useState<StudentAttendanceRecord[]>(
    props.initialStudents || INITIAL_STUDENT_ROSTER,
  );
  const [activeFilter, setActiveFilter] = useState<AttendanceFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [journalNotes, setJournalNotes] = useState<string>(
    'Materi teks narasi bab 3 berjalan kondusif. Evaluasi penugasan kelompok telah diselesaikan oleh 7 kelompok. Siswa Dimas Saputra (Izin lomba FLS2N) diberikan modul susulan via Google Classroom.',
  );
  const [sendWhatsApp, setSendWhatsApp] = useState<boolean>(true);
  const [escalateBk, setEscalateBk] = useState<boolean>(true);
  const [syncDapodik, setSyncDapodik] = useState<boolean>(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentPreviewData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trigger toast with auto-clear
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Status updates
  const handleStatusChange = (id: string, newStatus: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) {
          return s;
        }
        return {
          ...s,
          status: newStatus,
          timestamp: 'Baru saja',
          source: 'Diperbarui Manual',
        };
      }),
    );
  };

  // Bulk set all present
  const handleMarkAllPresent = () => {
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        status: 'hadir',
        timestamp: '07:15 WIB',
        source: 'Set Semua Hadir',
      })),
    );
    triggerToast(t('toast_all_present'));
  };

  const handleDownloadPdf = () => {
    triggerToast(t('toast_pdf_generating'));
  };

  const handleSubmit = () => {
    triggerToast(t('toast_submitted'));
  };

  const handleAttachPhoto = () => {
    triggerToast('Fitur kamera/lampiran foto KBM siap digunakan.');
  };

  // Filter calculations
  let hadirCount = 0;
  let sakitCount = 0;
  let izinCount = 0;
  let alpaCount = 0;

  for (const s of students) {
    if (s.status === 'hadir') {
      hadirCount++;
    } else if (s.status === 'sakit') {
      sakitCount++;
    } else if (s.status === 'izin') {
      izinCount++;
    } else if (s.status === 'alpa') {
      alpaCount++;
    }
  }

  const query = searchQuery.trim().toLowerCase();
  const filteredStudents = students.filter((s) => {
    const matchesFilter = activeFilter === 'all' || s.status === activeFilter;
    const matchesQuery =
      query === '' || s.name.toLowerCase().includes(query) || s.nisn.toLowerCase().includes(query);
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="flex w-full flex-col pb-10">
      {/* Page Header */}
      <AttendanceHeader />

      {/* Bento Metric Cards */}
      <AttendanceMetrics
        total={students.length}
        hadir={hadirCount}
        sakit={sakitCount}
        izin={izinCount}
        alpa={alpaCount}
      />

      {/* Segmented Progress Gauge */}
      <AttendanceProgressBar
        total={students.length}
        hadir={hadirCount}
        sakit={sakitCount}
        izin={izinCount}
        alpa={alpaCount}
      />

      {/* Filter and Action Toolbar */}
      <AttendanceToolbar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        counts={{
          all: students.length,
          hadir: hadirCount,
          sakit: sakitCount,
          izin: izinCount,
          alpa: alpaCount,
        }}
        onMarkAllPresent={handleMarkAllPresent}
        onDownloadPdf={handleDownloadPdf}
        onSubmit={handleSubmit}
      />

      {/* Roster Table */}
      <AttendanceRosterTable
        students={filteredStudents}
        onStatusChange={handleStatusChange}
        onPreviewDoc={setPreviewDoc}
        totalCount={students.length}
      />

      {/* Bottom Bento: Teacher Journal & Notifications */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <AttendanceTeacherJournal
            notes={journalNotes}
            onNotesChange={setJournalNotes}
            onAttachPhoto={handleAttachPhoto}
          />
        </div>
        <div className="lg:col-span-5">
          <AttendanceNotificationDispatch
            sendWhatsApp={sendWhatsApp}
            onSendWhatsAppChange={setSendWhatsApp}
            escalateBk={escalateBk}
            onEscalateBkChange={setEscalateBk}
            syncDapodik={syncDapodik}
            onSyncDapodikChange={setSyncDapodik}
          />
        </div>
      </section>

      {/* Document Preview Modal */}
      <AttendanceDocumentModal
        preview={previewDoc}
        onClose={() => {
          setPreviewDoc(null);
        }}
        onDownload={() => {
          setPreviewDoc(null);
          triggerToast('Mengunduh salinan berkas resmi...');
        }}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed right-6 bottom-6 z-50 flex animate-in items-center gap-2.5 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background shadow-xl duration-200 slide-in-from-bottom-5 fade-in">
          <CheckCircle2 className="size-4 text-pastel-mint" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
