'use client';

import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { AttendanceConfirmDialog } from '@/components/presensi/AttendanceConfirmDialog';
import type { ConfirmRequest } from '@/components/presensi/AttendanceConfirmDialog';
import { AttendanceDocumentModal } from '@/components/presensi/AttendanceDocumentModal';
import { AttendanceHeader } from '@/components/presensi/AttendanceHeader';
import { AttendanceMetrics } from '@/components/presensi/AttendanceMetrics';
import { AttendanceNotificationDispatch } from '@/components/presensi/AttendanceNotificationDispatch';
import { AttendanceProgressBar } from '@/components/presensi/AttendanceProgressBar';
import { AttendanceRosterTable } from '@/components/presensi/AttendanceRosterTable';
import { AttendanceSessionBar } from '@/components/presensi/AttendanceSessionBar';
import { AttendanceTeacherJournal } from '@/components/presensi/AttendanceTeacherJournal';
import { AttendanceToolbar } from '@/components/presensi/AttendanceToolbar';
import { ApiError } from '@/lib/api/client';
import {
  applyDrafts,
  backendStatusByStudent,
  collectDrafts,
  downloadAttendanceExport,
  mapRosterStudent,
  pickDefaultClass,
  todayIso,
  useBulkSave,
  useCloseDay,
  useRoster,
} from '@/lib/api/presensi';
import type { BulkDraft, DraftOverlay } from '@/lib/api/presensi';
import { useClassList } from '@/lib/api/queries';
import type {
  AttendanceFilter,
  AttendanceStatus,
  DocumentPreviewData,
  StudentAttendanceRecord,
} from '@/types/attendance';

const formatLongDate = (iso: string): string => {
  const parsed = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return iso;
  }
  return parsed.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const apiErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof ApiError ? error.message : fallback;

const countStatuses = (rows: StudentAttendanceRecord[]): Record<AttendanceStatus, number> => {
  const counts: Record<AttendanceStatus, number> = { hadir: 0, sakit: 0, izin: 0, alpa: 0 };
  for (const row of rows) {
    counts[row.status] += 1;
  }
  return counts;
};

/**
 * Main interactive Attendance Manager backed by the real attendance API:
 * date + class pickers drive GET /attendance/roster, edits are staged as local
 * drafts and pushed via POST /attendance/bulk, the day is finalized with
 * POST /attendance/close. Bulk changes require an explicit confirmation step
 * (FR-E03) rendered through AttendanceConfirmDialog.
 *
 * @returns Complete attendance interactive workspace.
 */
export function AttendanceManager() {
  const t = useTranslations('AttendancePage');

  const [date, setDate] = useState<string>(todayIso());
  const [classId, setClassId] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<AttendanceFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Local edits not yet pushed to the API, keyed by student id.
  const [drafts, setDrafts] = useState<Record<string, DraftOverlay>>({});
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);
  // shortcut: no backend endpoint, keep mock (journal text + notification prefs are UI-only state)
  const [journalNotes, setJournalNotes] = useState<string>(
    'Materi teks narasi bab 3 berjalan kondusif. Evaluasi penugasan kelompok telah diselesaikan oleh 7 kelompok. Siswa Dimas Saputra (Izin lomba FLS2N) diberikan modul susulan via Google Classroom.',
  );
  const [sendWhatsApp, setSendWhatsApp] = useState<boolean>(true);
  const [escalateBk, setEscalateBk] = useState<boolean>(true);
  const [syncDapodik, setSyncDapodik] = useState<boolean>(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentPreviewData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const classesQuery = useClassList({ status: 'active' });
  const selectedClassId =
    classId === '' ? (pickDefaultClass(classesQuery.data)?.id ?? '') : classId;

  const rosterQuery = useRoster({ class_id: selectedClassId, date });
  const bulkSave = useBulkSave({ class_id: selectedClassId, date });
  const closeDay = useCloseDay({ class_id: selectedClassId, date });

  const roster = rosterQuery.data;
  const baseRows = roster === undefined ? [] : roster.students.map(mapRosterStudent);
  const originals = backendStatusByStudent(roster?.students ?? []);
  const students = applyDrafts(baseRows, drafts);
  const closure = roster?.closure;
  const isClosed = closure !== undefined;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const upsertDraft = (id: string, patch: Partial<Omit<DraftOverlay, 'timestamp' | 'source'>>) => {
    const base = students.find((s) => s.id === id);
    if (base === undefined) {
      return;
    }
    const current = drafts[id] ?? {
      status: base.status,
      notes: base.notes,
      timestamp: base.timestamp,
      source: base.source,
    };
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...current,
        ...patch,
        timestamp: 'Baru saja',
        source: 'Diperbarui Manual (belum disimpan)',
      },
    }));
  };

  const handleStatusChange = (id: string, newStatus: AttendanceStatus) => {
    if (isClosed) {
      triggerToast('Absensi hari ini sudah ditutup dan tidak dapat diubah.');
      return;
    }
    upsertDraft(id, { status: newStatus });
  };

  const handleNotesChange = (id: string, notes: string) => {
    if (isClosed) {
      return;
    }
    upsertDraft(id, { notes });
  };

  const applyAllPresent = () => {
    setDrafts((prev) => {
      const next = { ...prev };
      for (const s of students) {
        const current = next[s.id] ?? {
          status: s.status,
          notes: s.notes,
          timestamp: s.timestamp,
          source: s.source,
        };
        next[s.id] = {
          ...current,
          status: 'hadir',
          timestamp: 'Baru saja',
          source: 'Set Semua Hadir (belum disimpan)',
        };
      }
      return next;
    });
    triggerToast(t('toast_all_present'));
  };

  // Bulk mark-all-present with explicit confirmation (FR-E03).
  const handleMarkAllPresent = () => {
    if (isClosed || students.length === 0) {
      return;
    }
    setConfirmRequest({
      message:
        'Yakin menandai SEMUA siswa HADIR? Perubahan baru tersimpan setelah tombol "Simpan & Kirim" ditekan.',
      confirmLabel: 'Tandai Hadir',
      onConfirm: () => {
        setConfirmRequest(null);
        applyAllPresent();
      },
    });
  };

  const pushSave = (dirty: BulkDraft[]) => {
    bulkSave.mutate(dirty, {
      onSuccess: () => {
        setDrafts({});
        triggerToast('Perubahan absensi berhasil disimpan.');
      },
      onError: (error) => {
        triggerToast(apiErrorMessage(error, 'Gagal menyimpan absensi.'));
      },
    });
  };

  // Save only the dirty rows via POST /attendance/bulk, after confirmation.
  const handleSubmit = () => {
    const dirty = collectDrafts(drafts, originals);
    if (dirty.length === 0) {
      triggerToast('Tidak ada perubahan yang perlu disimpan.');
      return;
    }
    setConfirmRequest({
      message: `Simpan ${dirty.length} perubahan absensi ke server?`,
      confirmLabel: 'Simpan Sekarang',
      onConfirm: () => {
        setConfirmRequest(null);
        pushSave(dirty);
      },
    });
  };

  const handleCloseDay = () => {
    if (isClosed) {
      return;
    }
    setConfirmRequest({
      message:
        'Tutup absensi hari ini? Siswa yang belum tercatat akan otomatis ditandai Alpha dan data terkunci.',
      confirmLabel: 'Tutup Absensi',
      onConfirm: () => {
        setConfirmRequest(null);
        closeDay.mutate(undefined, {
          onSuccess: () => {
            setDrafts({});
            triggerToast(t('toast_submitted'));
          },
          onError: (error) => {
            triggerToast(apiErrorMessage(error, 'Gagal menutup absensi.'));
          },
        });
      },
    });
  };

  const handleDownloadPdf = async () => {
    triggerToast(t('toast_pdf_generating'));
    try {
      const { blob, filename } = await downloadAttendanceExport({
        class_id: selectedClassId,
        date,
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename ?? `absensi-${date}.xlsx`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      triggerToast(apiErrorMessage(error, 'Gagal mengunduh berkas absensi.'));
    }
  };

  const handleClassChange = (value: string) => {
    setClassId(value);
    setDrafts({});
  };

  const handleDateChange = (value: string) => {
    setDate(value);
    setDrafts({});
  };

  const counts = countStatuses(students);
  const query = searchQuery.trim().toLowerCase();
  const filteredStudents = students.filter((s) => {
    const matchesFilter = activeFilter === 'all' || s.status === activeFilter;
    const matchesQuery =
      query === '' || s.name.toLowerCase().includes(query) || s.nisn.toLowerCase().includes(query);
    return matchesFilter && matchesQuery;
  });

  const isLoading = rosterQuery.isPending && classesQuery.isPending;
  const isError = !isLoading && rosterQuery.isError;
  const dirtyCount = Object.keys(drafts).length;

  return (
    <div className="flex w-full flex-col pb-10">
      <AttendanceHeader dateText={formatLongDate(date)} />

      <AttendanceSessionBar
        date={date}
        onDateChange={handleDateChange}
        classes={classesQuery.data}
        classesLoading={classesQuery.isPending}
        classId={selectedClassId}
        onClassChange={handleClassChange}
        summary={roster?.summary}
        closedByName={closure?.closed_by_name}
        dirtyCount={dirtyCount}
      />

      {isLoading && (
        <div className="mb-6 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-xs">
          <span>Memuat data absensi kelas...</span>
        </div>
      )}

      {isError && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-border bg-card p-6 text-sm text-destructive shadow-xs">
          <AlertTriangle className="size-4" />
          <span>{apiErrorMessage(rosterQuery.error, 'Gagal memuat data absensi.')}</span>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <AttendanceMetrics
            total={students.length}
            hadir={counts.hadir}
            sakit={counts.sakit}
            izin={counts.izin}
            alpa={counts.alpa}
          />

          <AttendanceProgressBar
            total={students.length}
            hadir={counts.hadir}
            sakit={counts.sakit}
            izin={counts.izin}
            alpa={counts.alpa}
          />

          <AttendanceToolbar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            counts={{
              all: students.length,
              hadir: counts.hadir,
              sakit: counts.sakit,
              izin: counts.izin,
              alpa: counts.alpa,
            }}
            onMarkAllPresent={handleMarkAllPresent}
            onDownloadPdf={() => {
              void handleDownloadPdf();
            }}
            onSubmit={handleSubmit}
            onCloseDay={handleCloseDay}
            saving={bulkSave.isPending || closeDay.isPending}
            readOnly={isClosed}
          />

          <AttendanceRosterTable
            students={filteredStudents}
            onStatusChange={handleStatusChange}
            onNotesChange={handleNotesChange}
            onPreviewDoc={setPreviewDoc}
            totalCount={students.length}
            readOnly={isClosed}
          />
        </>
      )}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <AttendanceTeacherJournal
            notes={journalNotes}
            onNotesChange={setJournalNotes}
            onAttachPhoto={() => {
              // shortcut: no backend endpoint, keep mock (camera/photo attachment)
              triggerToast('Fitur kamera/lampiran foto KBM siap digunakan.');
            }}
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

      <AttendanceConfirmDialog
        request={confirmRequest}
        onCancel={() => {
          setConfirmRequest(null);
        }}
      />

      {toastMessage && (
        <div className="fixed right-6 bottom-6 z-50 flex animate-in items-center gap-2.5 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background shadow-xl duration-200 slide-in-from-bottom-5 fade-in">
          <CheckCircle2 className="size-4 text-pastel-mint" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
