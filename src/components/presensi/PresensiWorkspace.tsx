'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';
import { MaterialIcon } from '@/components/landing/MaterialIcon';
import { PresensiClassHero } from '@/components/presensi/PresensiClassHero';
import { PresensiDispensationModal } from '@/components/presensi/PresensiDispensationModal';
import { isUnauthorized, presensiErrorKey } from '@/components/presensi/presensiErrors';
import { PresensiMetricGrid } from '@/components/presensi/PresensiMetricGrid';
import { PresensiNotice } from '@/components/presensi/PresensiNotice';
import { PresensiProgressBarRow } from '@/components/presensi/PresensiProgressBarRow';
import { PresensiRosterList } from '@/components/presensi/PresensiRosterList';
import type { PresensiRosterEntry } from '@/components/presensi/PresensiRosterList';
import { PresensiRosterToolbar } from '@/components/presensi/PresensiRosterToolbar';
import type { PresensiSortOption } from '@/components/presensi/PresensiRosterToolbar';
import { PresensiSaveBar } from '@/components/presensi/PresensiSaveBar';
import { PresensiSessionBanner } from '@/components/presensi/PresensiSessionBanner';
import { PresensiSessionBar } from '@/components/presensi/PresensiSessionBar';
import { countPresensiStatuses, presensiPercent } from '@/components/presensi/presensiStatusStyles';
import { PresensiSupportCards } from '@/components/presensi/PresensiSupportCards';
import { PresensiToast } from '@/components/presensi/PresensiToast';
import { Env } from '@/libs/Env';
import {
  AUTH_QUERY_KEY,
  createSession,
  getClasses,
  getSession,
  recordAttendances,
  toAttendanceInputs,
  toPresensiStudent,
} from '@/services/presensiApi';
import type { AttendanceInput, SessionDetail } from '@/services/presensiApi';
import type { PresensiFilter, PresensiStatus, PresensiStudent } from '@/types/presensi';

const ROSTER_PAGE_SIZE = 10;
const TOAST_DURATION_MS = 3500;
const CLASSES_QUERY_KEY = ['presensi', 'classes'] as const;
const SESSION_QUERY_KEY = ['presensi', 'session'] as const;

/**
 * Keep roster rows that match the active status filter and search text.
 *
 * @param entries - Numbered roster entries.
 * @param filter - Selected status filter chip.
 * @param query - Lower-cased search text.
 * @returns Matching entries in class-number order.
 */
function filterEntries(
  entries: PresensiRosterEntry[],
  filter: PresensiFilter,
  query: string,
): PresensiRosterEntry[] {
  return entries.filter((entry) => {
    const matchesStatus =
      filter === 'all' ||
      (filter === 'unrecorded' && entry.student.status === 'none') ||
      entry.student.status === filter;
    const haystack = `${entry.student.name.toLowerCase()} ${entry.student.nisn}`;

    return matchesStatus && (query === '' || haystack.includes(query));
  });
}

/**
 * Apply the selected sort order to the filtered entries.
 *
 * @param entries - Already filtered entries.
 * @param sortOption - Selected sort control value.
 * @returns Sorted copy of the entries.
 */
function sortEntries(entries: PresensiRosterEntry[], sortOption: PresensiSortOption) {
  if (sortOption === 'unrecorded') {
    return entries.toSorted((left, right) => {
      const leftPending = left.student.status === 'none' ? 0 : 1;
      const rightPending = right.student.status === 'none' ? 0 : 1;

      return leftPending - rightPending || left.ordinal - right.ordinal;
    });
  }

  if (sortOption === 'abjad') {
    return entries.toSorted((left, right) => left.student.name.localeCompare(right.student.name));
  }

  if (sortOption === 'nisn') {
    return entries.toSorted((left, right) => left.student.nisn.localeCompare(right.student.nisn));
  }

  return entries.toSorted((left, right) => left.ordinal - right.ordinal);
}

/**
 * Open the session of one class on one date. POST /v1/attendance-sessions is idempotent: it returns
 * the session that already matches class and date, so create-then-read always lands on the saved one.
 *
 * @param input - Chosen class id and tanggal as YYYY-MM-DD.
 * @returns The session with its roster and saved statuses.
 * @throws {PresensiApiError} When the backend call fails.
 */
async function openSession(input: { classId: number; tanggal: string }): Promise<SessionDetail> {
  const session = await createSession({ class_id: input.classId, tanggal: input.tanggal });

  return await getSession(session.id);
}

/**
 * Collect the statuses the server already holds for a roster, keyed by student id. Used as the
 * pre-test baseline the demo reset restores to.
 *
 * @param attendances - Roster rows of a session detail.
 * @returns Map of student id to its saved status, skipping students not yet recorded.
 */
function collectSavedStatuses(attendances: SessionDetail['attendances']) {
  const statuses: Record<string, Exclude<PresensiStatus, 'none'>> = {};

  for (const attendance of attendances) {
    if (attendance.status !== null) {
      statuses[String(attendance.student_id)] = attendance.status;
    }
  }

  return statuses;
}

/**
 * Interactive Attendly daily attendance workspace, read from and written to the Go backend. Status
 * edits stay local until the teacher saves, so one screen rebuilds the roster from the session
 * detail plus the pending edits.
 *
 * @returns Full attendance page body.
 */
export function PresensiWorkspace() {
  const t = useTranslations('PresensiPage');
  const queryClient = useQueryClient();
  const demoMode = Env.NEXT_PUBLIC_DEMO_MODE === 'true';
  // shortcut: demo-only reset restores the statuses the server held when this session first loaded;
  // PUT cannot unset a row, so students that were blank at load stay marked once saved.
  const snapshotRef = useRef<{
    key: string;
    statuses: Record<string, Exclude<PresensiStatus, 'none'>>;
  } | null>(null);
  // shortcut: id 0 never leaves the browser — every read stays disabled until a class is picked.
  const [classId, setClassId] = useState(0);
  const [tanggal, setTanggal] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [overrides, setOverrides] = useState<Record<string, Exclude<PresensiStatus, 'none'>>>({});
  const [activeFilter, setActiveFilter] = useState<PresensiFilter>('all');
  const [sortOption, setSortOption] = useState<PresensiSortOption>('nomor');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ title: string; description: string } | null>(null);
  const [noteRequest, setNoteRequest] = useState<{
    student: PresensiStudent;
    ordinal: number;
  } | null>(null);

  const presentToast = (title: string, description: string) => {
    setToast({ title, description });
    setTimeout(() => {
      setToast(null);
    }, TOAST_DURATION_MS);
  };

  // A 401 means the passthrough already dropped the cookie, so only the sign-in gate is re-read.
  const guard = async <loaded,>(read: Promise<loaded>): Promise<loaded> => {
    try {
      return await read;
    } catch (error) {
      if (isUnauthorized(error)) {
        void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      }

      throw error;
    }
  };

  const handleClassChange = (nextClassId: number) => {
    setClassId(nextClassId);
    setOverrides({});
    setPage(1);
  };

  const classes = useQuery({
    queryFn: async () => await guard(getClasses()),
    queryKey: CLASSES_QUERY_KEY,
  });
  const selectedClassId = classId === 0 ? (classes.data?.[0]?.id ?? 0) : classId;

  const session = useQuery({
    enabled: selectedClassId > 0,
    queryFn: async () => {
      const detail = await guard(openSession({ classId: selectedClassId, tanggal }));
      const snapshotKey = `${selectedClassId}:${tanggal}`;

      if (demoMode && snapshotRef.current?.key !== snapshotKey) {
        snapshotRef.current = {
          key: snapshotKey,
          statuses: collectSavedStatuses(detail.attendances),
        };
      }

      return detail;
    },
    queryKey: [...SESSION_QUERY_KEY, selectedClassId, tanggal],
  });

  const save = useMutation({
    mutationFn: async (input: { attendances: AttendanceInput[]; sessionId: number }) =>
      await guard(recordAttendances(input.sessionId, input.attendances)),
    onError: (error) => {
      // A rejected save can mean the session moved on (locked, roster changed), so re-read it.
      void queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
      presentToast(t('toast_failed_title'), t(presensiErrorKey(error)));
    },
    onSuccess: () => {
      setOverrides({});
      void queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
      presentToast(t('toast_draft_title'), t('toast_draft_description'));
    },
  });

  const roster = useMemo(
    () => (session.data?.attendances ?? []).map(toPresensiStudent),
    [session.data],
  );
  const students = useMemo(
    () =>
      roster.map((student) => {
        const override = overrides[student.id];

        return override === undefined ? student : { ...student, status: override };
      }),
    [overrides, roster],
  );

  if (classes.isPending) {
    return <PresensiNotice state="loading" text={t('loading_classes')} />;
  }

  if (classes.error !== null) {
    return (
      <PresensiNotice
        state="error"
        text={t('load_failed', { reason: t(presensiErrorKey(classes.error)) })}
      />
    );
  }

  if (session.error !== null) {
    // The class switcher stays mounted so a forbidden or missing session is not a dead end.
    return (
      <div className="flex w-full flex-col">
        <div className="flex w-full flex-col gap-space-lg">
          <PresensiSessionBar
            classes={classes.data}
            classId={selectedClassId}
            onClassChange={handleClassChange}
            progressPercent={0}
          />
          <PresensiNotice
            state="error"
            text={t('load_failed', { reason: t(presensiErrorKey(session.error)) })}
          />
        </div>
      </div>
    );
  }

  // No class means no session to wait for, so this check has to come before the loading notice.
  const activeClass = classes.data.find((record) => record.id === selectedClassId);

  if (activeClass === undefined) {
    return <PresensiNotice state="empty" text={t('classes_empty')} />;
  }

  if (session.data === undefined) {
    return <PresensiNotice state="loading" text={t('loading_session')} />;
  }

  const counts = countPresensiStatuses(students);
  const progressPercent = Math.round(Number(presensiPercent(counts.recorded, counts.total)));
  const locked = session.data.session.is_locked;
  const unrecordedIds = students
    .filter((student) => student.status === 'none')
    .map((student) => student.id);

  const entries = sortEntries(
    filterEntries(
      students.map((student, index) => ({ student, ordinal: index + 1 })),
      activeFilter,
      searchQuery.toLowerCase().trim(),
    ),
    sortOption,
  );
  const pageCount = Math.max(1, Math.ceil(entries.length / ROSTER_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleEntries = entries.slice(
    (currentPage - 1) * ROSTER_PAGE_SIZE,
    currentPage * ROSTER_PAGE_SIZE,
  );

  const handleTanggalChange = (nextTanggal: string) => {
    // Clearing the native date field would send an empty tanggal the backend rejects outright.
    if (nextTanggal === '') {
      return;
    }

    setTanggal(nextTanggal);
    setOverrides({});
    setPage(1);
  };

  const handleStatusChange = (id: string, status: Exclude<PresensiStatus, 'none'>) => {
    setOverrides((current) => ({ ...current, [id]: status }));
  };

  const handleMarkRemainingPresent = () => {
    setOverrides((current) => ({
      ...current,
      ...Object.fromEntries(unrecordedIds.map((id) => [id, 'hadir' as const])),
    }));
    presentToast(
      t('toast_marked_title'),
      t('toast_marked_description', { count: unrecordedIds.length }),
    );
  };

  const handleSaveDraft = () => {
    const attendances = toAttendanceInputs(students);

    if (attendances.length === 0) {
      presentToast(t('toast_nothing_title'), t('toast_nothing_description'));
      return;
    }

    save.mutate({ attendances, sessionId: session.data.session.id });
  };

  const handleMarkRemainingAndSave = () => {
    const marked = students.map((student) =>
      student.status === 'none' ? { ...student, status: 'hadir' as const } : student,
    );

    setOverrides((current) => ({
      ...current,
      ...Object.fromEntries(
        students
          .filter((student) => student.status === 'none')
          .map((student) => [student.id, 'hadir' as const]),
      ),
    }));
    save.mutate({ attendances: toAttendanceInputs(marked), sessionId: session.data.session.id });
  };

  const handleFocusUnrecorded = () => {
    setActiveFilter('unrecorded');
    setPage(1);
    document
      .querySelector('#presensi-roster')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDemoReset = () => {
    const snapshot = snapshotRef.current;

    setOverrides({});

    if (snapshot === null) {
      return;
    }

    const rows = Object.entries(snapshot.statuses).map(([id, status]) => ({
      keterangan: null,
      status,
      student_id: Number(id),
    }));

    if (rows.length === 0) {
      void queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
      presentToast(t('demo_reset_label'), t('demo_reset_empty_description'));
      return;
    }

    save.mutate({ attendances: rows, sessionId: session.data.session.id });
  };

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-col gap-space-lg">
        {demoMode ? (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-amber-gold bg-amber-surface px-4 py-2.5">
            <span className="font-caption text-caption text-amber-dark">{t('demo_mode_hint')}</span>
            <button
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-gold bg-surface-card px-3 py-1.5 font-label-md text-label-md font-semibold text-amber-dark transition-all hover:bg-amber-gold/20 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
              disabled={save.isPending}
              onClick={handleDemoReset}
              type="button"
            >
              <MaterialIcon className="text-[16px]" name="restart_alt" />
              <span>{t('demo_reset_label')}</span>
            </button>
          </div>
        ) : null}
        <PresensiSessionBar
          classes={classes.data}
          classId={selectedClassId}
          onClassChange={handleClassChange}
          progressPercent={progressPercent}
        />
        <PresensiClassHero
          locked={locked}
          namaKelas={activeClass.nama_kelas}
          onMarkRemainingPresent={handleMarkRemainingPresent}
          onTanggalChange={handleTanggalChange}
          progressPercent={progressPercent}
          recorded={counts.recorded}
          tanggal={tanggal}
          total={counts.total}
          waliKelas={activeClass.wali_kelas}
        />
        {locked ? (
          <PresensiNotice state="locked" text={t('locked_notice')} />
        ) : (
          <PresensiSessionBanner
            onFocusUnrecorded={handleFocusUnrecorded}
            onMarkRemainingPresent={handleMarkRemainingPresent}
            progressPercent={progressPercent}
            recorded={counts.recorded}
            total={counts.total}
            unrecorded={counts.unrecorded}
          />
        )}
        <PresensiMetricGrid counts={counts} onFilterUnrecorded={handleFocusUnrecorded} />
        <PresensiProgressBarRow counts={counts} />
        <PresensiRosterToolbar
          activeFilter={activeFilter}
          counts={counts}
          onFilterChange={(filter) => {
            setActiveFilter(filter);
          }}
          onSearchChange={(query) => {
            setSearchQuery(query);
          }}
          onSortChange={setSortOption}
          searchQuery={searchQuery}
          sortOption={sortOption}
        />
        <div id="presensi-roster">
          <PresensiRosterList
            disabled={locked}
            entries={visibleEntries}
            onPageChange={setPage}
            onOpenNote={(student, ordinal) => {
              setNoteRequest({ ordinal, student });
            }}
            onStatusChange={handleStatusChange}
            page={currentPage}
            pageCount={pageCount}
            rosterTotal={counts.total}
            visibleCount={visibleEntries.length}
          />
        </div>
        <PresensiSupportCards unrecorded={counts.unrecorded} />
      </div>

      {!locked && (
        <PresensiSaveBar
          disabled={counts.recorded === 0 || save.isPending}
          onMarkRemainingAndSave={handleMarkRemainingAndSave}
          onSaveDraft={handleSaveDraft}
          recorded={counts.recorded}
          saving={save.isPending}
          total={counts.total}
          unrecorded={counts.unrecorded}
        />
      )}

      <PresensiToast
        description={toast?.description ?? ''}
        title={toast?.title ?? ''}
        visible={toast !== null}
      />

      {noteRequest !== null && (
        <PresensiDispensationModal
          onClose={() => {
            setNoteRequest(null);
          }}
          ordinal={noteRequest.ordinal}
          student={noteRequest.student}
        />
      )}
    </div>
  );
}
