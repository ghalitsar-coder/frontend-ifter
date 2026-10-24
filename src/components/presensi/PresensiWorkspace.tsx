'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
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
 * Interactive Attendly daily attendance workspace, read from and written to the Go backend. Status
 * edits stay local until the teacher saves, so one screen rebuilds the roster from the session
 * detail plus the pending edits.
 *
 * @returns Full attendance page body.
 */
export function PresensiWorkspace() {
  const t = useTranslations('PresensiPage');
  const queryClient = useQueryClient();
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

  const classes = useQuery({
    queryFn: async () => await guard(getClasses()),
    queryKey: CLASSES_QUERY_KEY,
  });
  const selectedClassId = classId === 0 ? (classes.data?.[0]?.id ?? 0) : classId;

  const session = useQuery({
    enabled: selectedClassId > 0,
    queryFn: async () => await guard(openSession({ classId: selectedClassId, tanggal })),
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
    return (
      <PresensiNotice
        state="error"
        text={t('load_failed', { reason: t(presensiErrorKey(session.error)) })}
      />
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

  const handleClassChange = (nextClassId: number) => {
    setClassId(nextClassId);
    setOverrides({});
    setPage(1);
  };

  const handleTanggalChange = (nextTanggal: string) => {
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

  const handleFocusUnrecorded = () => {
    setActiveFilter('unrecorded');
    setPage(1);
    document
      .querySelector('#presensi-roster')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex w-full flex-col">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-space-lg px-margin py-space-xl">
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
          onMarkRemainingPresent={handleMarkRemainingPresent}
          onSaveDraft={handleSaveDraft}
          recorded={counts.recorded}
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
