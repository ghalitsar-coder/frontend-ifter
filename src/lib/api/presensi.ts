import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, downloadFile } from '@/lib/api/client';
import type {
  AttendanceStatus as BackendStatus,
  BulkAttendanceInput,
  Class,
  CloseResult,
  Roster,
  RosterStudent,
} from '@/lib/api/dto';
import type { AttendanceStatus as UiStatus, StudentAttendanceRecord } from '@/types/attendance';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type RosterParams = {
  class_id: string;
  date: string;
};

/** A user edit not yet pushed to the API (only dirty rows are bulk-saved). */
export type BulkDraft = {
  studentId: string;
  status: UiStatus;
  notes: string;
  /** Server status before editing — used to preserve `late`. */
  originalStatus?: BackendStatus;
};

/** Draft overlay applied on top of API rows in the manager. */
export type DraftOverlay = {
  status: UiStatus;
  notes: string;
  timestamp: string;
  source: string;
};

// ---------------------------------------------------------------------------
// Status mapper (backend 5-state ⇄ UI 4-state)
// Doc comment: backend splits present into `present`/`late`; the UI shows both
// as 'hadir'. `late` is never lost: when the UI picks 'hadir' for a student
// whose original server record was `late`, the original status is preserved.
// ---------------------------------------------------------------------------
const UI_BY_BACKEND: Record<BackendStatus, UiStatus> = {
  present: 'hadir',
  late: 'hadir',
  sick: 'sakit',
  excused: 'izin',
  absent: 'alpa',
};

const BACKEND_BY_UI: Record<UiStatus, BackendStatus> = {
  hadir: 'present',
  sakit: 'sick',
  izin: 'excused',
  alpa: 'absent',
};

/**
 * Map a backend attendance status to the UI enum.
 * @param status - One of present/late/sick/excused/absent.
 * @returns UI status (`late` collapses into `hadir`).
 */
export const toUiStatus = (status: BackendStatus): UiStatus => UI_BY_BACKEND[status];

/**
 * Map a UI status back to the backend enum, preserving `late`.
 * @param status - UI status (hadir/sakit/izin/alpa).
 * @param original - The student's server status before editing, if any.
 * @returns Backend-compatible status.
 */
export const toBackendStatus = (status: UiStatus, original?: BackendStatus): BackendStatus => {
  if (status === 'hadir' && original === 'late') {
    return 'late';
  }
  return BACKEND_BY_UI[status];
};

// ---------------------------------------------------------------------------
// Roster → UI row mapper
// ---------------------------------------------------------------------------
const AVATAR_PALETTE = [
  'bg-pastel-mint',
  'bg-pastel-yellow',
  'bg-pastel-blue',
  'bg-pastel-lavender',
  'bg-pastel-red',
  'bg-surface-container-high',
];

const initialsOf = (fullName: string): string =>
  fullName
    .split(/\s+/u)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

const timeLabelOf = (iso?: string): string | null => {
  if (iso === undefined || iso === '') {
    return null;
  }
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return `${parsed.getHours().toString().padStart(2, '0')}:${parsed
    .getMinutes()
    .toString()
    .padStart(2, '0')} WIB`;
};

/**
 * Convert one API roster row into the UI `StudentAttendanceRecord` shape.
 * Doc comment: the roster DTO has no document/NISN fields, so `nisn` shows the
 * student number and attached-document fields stay empty (the document-modal
 * button simply never appears for API data). Rows without a server record are
 * displayed as 'alpa' but excluded from bulk saves until the user edits them.
 * @param row - Roster student from GET /attendance/roster.
 * @param index - Position in the roster (drives no. absent + avatar color).
 * @returns UI record consumed by the roster table.
 */
export const mapRosterStudent = (row: RosterStudent, index: number): StudentAttendanceRecord => {
  const { record } = row;
  const timestamp =
    record === undefined
      ? 'Belum Terdeteksi'
      : (timeLabelOf(record.check_in_at) ?? timeLabelOf(record.updated_at) ?? '—');
  return {
    id: row.student_id,
    name: row.full_name,
    nisn: row.student_number,
    absentNumber: index + 1,
    initials: initialsOf(row.full_name),
    avatarBg: AVATAR_PALETTE[index % AVATAR_PALETTE.length] ?? 'bg-surface-container-high',
    status: record === undefined ? 'alpa' : toUiStatus(record.status),
    timestamp,
    source: record === undefined ? 'Belum tercatat' : record.source || 'Rekaman Absensi',
    notes: record?.notes ?? '',
  };
};

/**
 * Merge API-mapped rows with local drafts into what the table renders.
 * @param baseRows - Mapped roster rows.
 * @param drafts - Draft overlay keyed by student id.
 * @returns Display rows with edits applied.
 */
export const applyDrafts = (
  baseRows: StudentAttendanceRecord[],
  drafts: Record<string, DraftOverlay>,
): StudentAttendanceRecord[] =>
  baseRows.map((row) => {
    const overlay = drafts[row.id];
    return overlay === undefined ? row : { ...row, ...overlay };
  });

/**
 * Server status per student for rows that already have a record (used to
 * preserve `late` when the user re-selects 'hadir').
 * @param students - Raw roster students from the API.
 * @returns Map of student id → backend status.
 */
export const backendStatusByStudent = (
  students: RosterStudent[],
): Record<string, BackendStatus> => {
  const map: Record<string, BackendStatus> = {};
  for (const row of students) {
    const { record } = row;
    if (record !== undefined) {
      map[row.student_id] = record.status;
    }
  }
  return map;
};

/**
 * Collect dirty rows for POST /attendance/bulk (students the user touched).
 * Unrecorded students that were never edited are excluded, so they stay
 * "unrecorded" server-side instead of being silently marked absent.
 * @param drafts - Draft overlay keyed by student id.
 * @param originals - Backend status map from `backendStatusByStudent`.
 * @returns Bulk drafts; empty when nothing changed.
 */
export const collectDrafts = (
  drafts: Record<string, DraftOverlay>,
  originals: Record<string, BackendStatus>,
): BulkDraft[] => {
  const result: BulkDraft[] = [];
  for (const [studentId, overlay] of Object.entries(drafts)) {
    result.push({
      studentId,
      status: overlay.status,
      notes: overlay.notes,
      originalStatus: originals[studentId],
    });
  }
  return result;
};

/**
 * Build the POST /attendance/bulk body from dirty drafts.
 * @param params - `class_id` / `date` context.
 * @param drafts - Dirty rows collected via `collectDrafts`.
 * @returns API payload; blank notes are omitted, `late` is preserved.
 */
export const toBulkInput = (params: RosterParams, drafts: BulkDraft[]): BulkAttendanceInput => ({
  class_id: params.class_id,
  date: params.date,
  records: drafts.map((d) => {
    const notes = d.notes.trim();
    return {
      student_id: d.studentId,
      status: toBackendStatus(d.status, d.originalStatus),
      ...(notes === '' ? {} : { notes }),
    };
  }),
});

// ---------------------------------------------------------------------------
// Query keys + hooks (module-scoped; foundation `queryKeys` stays untouched)
// ---------------------------------------------------------------------------
export const presensiKeys = {
  all: ['attendance'] as const,
  roster: (query: RosterParams) => ['attendance', 'roster', query] as const,
};

export const rosterOptions = (params: RosterParams) =>
  queryOptions({
    queryKey: presensiKeys.roster(params),
    queryFn: async () => await apiGet<Roster>('/attendance/roster', { ...params }),
    enabled: params.class_id !== '' && params.date !== '',
  });

/**
 * GET /attendance/roster → class roster with per-student records for one date.
 * @param params - `class_id` and ISO `date` (query disabled while either is empty).
 * @returns React Query result with the raw `Roster` DTO.
 */
export const useRoster = (params: RosterParams) => useQuery(rosterOptions(params));

/**
 * POST /attendance/bulk → save changed attendance rows; returns the fresh roster.
 * @param params - Current `class_id` / `date` context for the payload.
 * @returns Mutation over `BulkDraft[]` drafts (dirty rows only).
 */
export const useBulkSave = (params: RosterParams) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (drafts: BulkDraft[]): Promise<Roster> =>
      await apiPost<Roster>('/attendance/bulk', toBulkInput(params, drafts)),
    onSuccess: (freshRoster) => {
      // Bulk returns the fresh roster — seed the cache directly, then refetch.
      void queryClient.setQueryData(presensiKeys.roster(params), freshRoster);
      void queryClient.invalidateQueries({ queryKey: presensiKeys.roster(params) });
    },
  });
};

/**
 * POST /attendance/close → close the day for a class (fills remaining as absent).
 * @param params - Current `class_id` / `date` context.
 * @returns Mutation producing `{ closure, summary }`.
 */
export const useCloseDay = (params: RosterParams) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      await apiPost<CloseResult>('/attendance/close', {
        class_id: params.class_id,
        date: params.date,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: presensiKeys.roster(params) });
    },
  });
};

/**
 * GET /exports/attendance → XLSX download for the selected class/date.
 * @param params - `class_id` and ISO `date`.
 * @returns Blob + server filename for browser-side saving.
 */
export const downloadAttendanceExport = async (
  params: RosterParams,
): Promise<{ blob: Blob; filename: string | null }> =>
  await downloadFile('/exports/attendance', { ...params });

/**
 * First active class from the class list (fallback: first row).
 * @param classes - Classes from `useClassList`.
 * @returns Default selected class or undefined.
 */
export const pickDefaultClass = (classes: Class[] | undefined): Class | undefined => {
  if (classes === undefined || classes.length === 0) {
    return undefined;
  }
  return classes.find((c) => c.status === 'active') ?? classes[0];
};

/**
 * Local ISO date (YYYY-MM-DD) in the browser's timezone.
 * @returns Today's ISO date string.
 */
export const todayIso = (): string => {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};
