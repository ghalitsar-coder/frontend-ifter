import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, apiPost, apiPut } from '@/lib/api/client';
import type { DataList, DutyAssignment } from '@/lib/api/dto';

// ---------------------------------------------------------------------------
// Duty (piket) module hooks + mappers.
// Backend contract (Go/Gin, attendance + dutyrotation domains):
//   GET  /duty-assignments?teacher_id&weekday&date -> { data: DutyAssignment[] }   (admin)
//   POST /duty-assignments { teacher_id, weekday, start_date, end_date? } -> 201 bare DutyAssignment (admin)
//   PUT  /duty-assignments/:id/end { end_date } -> 200 bare DutyAssignment (admin)
//   GET  /duty-rotations?date=&weekday= -> { data: DutyRotation[] } (admin|teacher|duty_teacher)
//   POST /duty-rotations { duty_assignment_id, substitute_teacher_id, date, reason }
//        -> 201 { duty_rotation: DutyRotation } (admin|teacher|duty_teacher)
//   PATCH /duty-rotations/:id/cancel { reason? } -> 200 { duty_rotation } (same roles)
//   POST /uniform-reports { for_date, teacher_id, scope, target_student_id?, note? }
//        -> 201 { uniform_report: UniformReport } (admin|staff_tu|duty_teacher)
//   GET  /uniform-reports?date&teacher_id -> { data: UniformReport[] } (same roles)
// NOTE: the wave-2 brief named "POST/DELETE /duty-assignments/:id/substitutions";
// the real backend (internal/dutyrotation, register_duty_rotation.go) exposes the
// substitution surface as POST /duty-rotations + PATCH /duty-rotations/:id/cancel,
// and GET /duty-assignments does NOT embed substitutions[] — substitutions are
// read separately via GET /duty-rotations?date= and joined client-side.
// `weekday` is ISO-8601 day-of-week: 1 = Senin ... 7 = Ahad (backend uses
// Postgres EXTRACT(ISODOW FROM date)), which differs from JS Date.getDay()
// where 0 = Sunday — hence the explicit helpers below.
// ---------------------------------------------------------------------------

/** DutyRotation mirrors dutyrotation.RotationItem (internal/dutyrotation/types.go). */
export type DutyRotation = {
  id: string;
  duty_assignment_id: string;
  rotation_date: string;
  weekday: number;
  original_teacher_id: string;
  original_teacher_name: string;
  substitute_teacher_id: string;
  substitute_teacher_name: string;
  status: string; // 'substituted' | 'cancelled'
  reason: string;
  created_at: string;
};

/** UniformReport mirrors dutyrotation.UniformItem (internal/dutyrotation/uniforms.go). */
export type UniformReport = {
  id: string;
  for_date: string;
  teacher_id: string;
  scope: string; // 'student' | 'teacher'
  target_student_id: string | null;
  note: string | null;
  created_at: string;
};

/** Module-scoped query keys (extends the `['<module>', ...]` convention). */
export const dutyKeys = {
  root: ['piket', 'duty-assignments'] as const,
  list: (query?: DutyAssignmentsQuery) => ['piket', 'duty-assignments', query ?? {}] as const,
};

export const rotationKeys = {
  root: ['piket', 'duty-rotations'] as const,
  list: (query?: DutyRotationsQuery) => ['piket', 'duty-rotations', query ?? {}] as const,
};

export const uniformKeys = {
  root: ['piket', 'uniform-reports'] as const,
  list: (query?: UniformReportsQuery) => ['piket', 'uniform-reports', query ?? {}] as const,
};

export type DutyAssignmentsQuery = {
  teacher_id?: string;
  weekday?: number;
  date?: string;
};

export type CreateDutyAssignmentInput = {
  teacher_id: string;
  weekday: number;
  start_date: string;
  end_date?: string;
};

export type EndDutyAssignmentInput = {
  id: string;
  end_date: string;
};

/**
 * Strips an empty-string `end_date` so it is omitted from the JSON body
 * (the backend treats a missing end_date as "assignment still open").
 * @param input - Raw form values for POST /duty-assignments.
 * @returns Payload safe to send to the create endpoint.
 */
export function toCreateDutyPayload(input: CreateDutyAssignmentInput): CreateDutyAssignmentInput {
  const { end_date: endDate, ...rest } = input;
  return endDate === undefined || endDate === '' ? rest : { ...input, end_date: endDate };
}

/**
 * GET /duty-assignments options — full duty roster, filterable by teacher,
 * ISO weekday, or an active date.
 * @param query - Optional `teacher_id` / `weekday` / `date` filters.
 * @returns TanStack Query options resolving to `DutyAssignment[]`.
 */
export const dutyAssignmentsOptions = (query?: DutyAssignmentsQuery) =>
  queryOptions({
    queryKey: dutyKeys.list(query),
    queryFn: async () => {
      const result = await apiGet<DataList<DutyAssignment>>('/duty-assignments', { ...query });
      return result.data;
    },
  });

/**
 * GET /duty-assignments → duty roster list (admin role required by backend).
 * @param query - Optional `teacher_id` / `weekday` / `date` filters.
 * @returns React Query result with `DutyAssignment[]`.
 */
export const useDutyAssignments = (query?: DutyAssignmentsQuery) =>
  useQuery(dutyAssignmentsOptions(query));

/**
 * POST /duty-assignments mutation — assign a teacher to gate duty for one
 * weekday within a date range. Invalidates every duty-assignments query.
 * @returns React Query mutation for `CreateDutyAssignmentInput`.
 */
export const useCreateDutyAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDutyAssignmentInput) =>
      await apiPost<DutyAssignment>('/duty-assignments', toCreateDutyPayload(input)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dutyKeys.root });
    },
  });
};

/**
 * PUT /duty-assignments/:id/end mutation — closes an open assignment by
 * stamping its end_date. Invalidates every duty-assignments query.
 * @returns React Query mutation for `EndDutyAssignmentInput`.
 */
export const useEndDutyAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: EndDutyAssignmentInput) =>
      await apiPut<DutyAssignment>(`/duty-assignments/${input.id}/end`, {
        end_date: input.end_date,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dutyKeys.root });
    },
  });
};

// ---------------------------------------------------------------------------
// Pure helpers (unit-tested in piket.test.ts)
// ---------------------------------------------------------------------------

/** ISO weekday labels as used by the backend (1 = Senin ... 7 = Ahad). */
export const DUTY_WEEKDAY_LABELS: Record<number, string> = {
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
  7: 'Ahad',
};

/**
 * Converts a `YYYY-MM-DD` calendar date to the backend ISO weekday number
 * (1 = Senin ... 7 = Ahad), matching Postgres EXTRACT(ISODOW).
 * @param date - Local calendar date string in YYYY-MM-DD form.
 * @returns ISO weekday, or 0 for an unparseable date.
 */
export function isoWeekdayFromDate(date: string): number {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return 0;
  }
  const jsDay = parsed.getDay();
  return jsDay === 0 ? 7 : jsDay;
}

/**
 * Today's local date as the `YYYY-MM-DD` string the API expects everywhere.
 * @returns Current date in ISO date form.
 */
export function todayIsoDate(): string {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Whether a duty assignment covers the given date: weekday matches, the
 * start_date has begun and the assignment has no end_date yet (or it is
 * still in effect on that date).
 * @param assignment - One duty roster row.
 * @param date - `YYYY-MM-DD` date to test.
 * @returns True when the teacher is on duty on that date.
 */
export function isDutyActiveOn(assignment: DutyAssignment, date: string): boolean {
  if (assignment.weekday !== isoWeekdayFromDate(date)) {
    return false;
  }
  if (assignment.start_date > date) {
    return false;
  }
  return (
    assignment.end_date === undefined || assignment.end_date === '' || date <= assignment.end_date
  );
}

/**
 * Maps roster rows to the display names of teachers on duty on a date —
 * feeds the shift header's on-duty officers line.
 * @param assignments - Duty roster rows.
 * @param date - `YYYY-MM-DD` date to filter by.
 * @returns Teacher names in roster order.
 */
export function onDutyTeacherNames(assignments: DutyAssignment[], date: string): string[] {
  return assignments
    .filter((assignment) => isDutyActiveOn(assignment, date))
    .map((assignment) => assignment.teacher_name);
}

export type WeekdayDutyGroup = {
  weekday: number;
  label: string;
  assignments: DutyAssignment[];
};

/**
 * Groups roster rows by ISO weekday (1..7, only non-empty days kept),
 * each day sorted by start_date — the duty roster panel layout.
 * @param assignments - Duty roster rows.
 * @returns Weekday groups in ascending weekday order.
 */
export function groupDutyAssignmentsByWeekday(assignments: DutyAssignment[]): WeekdayDutyGroup[] {
  const groups: WeekdayDutyGroup[] = [];
  for (let weekday = 1; weekday <= 7; weekday += 1) {
    const items = assignments
      .filter((assignment) => assignment.weekday === weekday)
      .toSorted((a, b) => a.start_date.localeCompare(b.start_date));
    if (items.length > 0) {
      groups.push({
        weekday,
        label: DUTY_WEEKDAY_LABELS[weekday] ?? String(weekday),
        assignments: items,
      });
    }
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Duty rotations (substitutions) — GET/POST /duty-rotations,
// PATCH /duty-rotations/:id/cancel. Envelope: single resources are wrapped
// under `duty_rotation` (docs/API_ADDENDUM.md §6.3).
// ---------------------------------------------------------------------------

export type DutyRotationsQuery = {
  date?: string;
  weekday?: number;
};

export type CreateDutyRotationInput = {
  duty_assignment_id: string;
  substitute_teacher_id: string;
  date: string;
  reason: string;
};

export type CancelDutyRotationInput = {
  id: string;
  reason?: string;
};

/**
 * Normalises the POST /duty-rotations body: trims ids/date/reason (the
 * backend rejects a blank reason with 400).
 * @param input - Raw picker values.
 * @returns Payload ready to send.
 */
export function toCreateRotationPayload(input: CreateDutyRotationInput): CreateDutyRotationInput {
  return {
    duty_assignment_id: input.duty_assignment_id.trim(),
    substitute_teacher_id: input.substitute_teacher_id.trim(),
    date: input.date.trim(),
    reason: input.reason.trim(),
  };
}

/**
 * GET /duty-rotations options — substitution rows for a date and/or weekday.
 * @param query - Optional `date` (YYYY-MM-DD) / `weekday` (1..7) filters.
 * @returns TanStack Query options resolving to `DutyRotation[]`.
 */
export const dutyRotationsOptions = (query?: DutyRotationsQuery) =>
  queryOptions({
    queryKey: rotationKeys.list(query),
    queryFn: async () => {
      const result = await apiGet<DataList<DutyRotation>>('/duty-rotations', { ...query });
      return result.data;
    },
  });

/**
 * GET /duty-rotations → substitution list (admin|teacher|duty_teacher; the
 * backend scopes rows server-side to rows relevant to non-admin actors).
 * @param query - Optional `date` / `weekday` filters.
 * @returns React Query result with `DutyRotation[]`.
 */
export const useDutyRotations = (query?: DutyRotationsQuery) =>
  useQuery(dutyRotationsOptions(query));

/**
 * POST /duty-rotations mutation — register one substitution. Invalidates all
 * rotation lists AND the duty roster (the roster renders substitution badges).
 * @returns React Query mutation for `CreateDutyRotationInput`.
 */
export const useCreateDutyRotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDutyRotationInput) => {
      const result = await apiPost<{ duty_rotation: DutyRotation }>(
        '/duty-rotations',
        toCreateRotationPayload(input),
      );
      return result.duty_rotation;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: rotationKeys.root }),
        queryClient.invalidateQueries({ queryKey: dutyKeys.root }),
      ]);
    },
  });
};

/**
 * PATCH /duty-rotations/:id/cancel mutation — cancels a substitution (the real
 * backend has no DELETE /duty-assignments/:id/substitutions; cancellation is
 * an audited PATCH with an optional reason). An empty reason keeps the stored one.
 * @returns React Query mutation for `CancelDutyRotationInput`.
 */
export const useCancelDutyRotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CancelDutyRotationInput) => {
      const result = await apiPatch<{ duty_rotation: DutyRotation }>(
        `/duty-rotations/${input.id}/cancel`,
        { reason: input.reason?.trim() ?? '' },
      );
      return result.duty_rotation;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: rotationKeys.root }),
        queryClient.invalidateQueries({ queryKey: dutyKeys.root }),
      ]);
    },
  });
};

/**
 * Picks the still-active substitutions of one roster row on one date —
 * cancelled rows never appear on the roster badges.
 * @param rotations - Rotation rows (any date).
 * @param assignmentId - Duty assignment id to match.
 * @param date - `YYYY-MM-DD` rotation date to match.
 * @returns Active (`status === 'substituted'`) rotations for that assignment/date pair.
 */
export function activeSubstitutionsForAssignment(
  rotations: DutyRotation[],
  assignmentId: string,
  date: string,
): DutyRotation[] {
  return rotations.filter(
    (rotation) =>
      rotation.duty_assignment_id === assignmentId &&
      rotation.rotation_date === date &&
      rotation.status === 'substituted',
  );
}

/**
 * Roster rows a teacher may be substituted for on a date: assignment active on
 * that date (weekday + start/end window) and not already substituted.
 * @param assignments - Duty roster rows.
 * @param rotations - Rotation rows for the date.
 * @param date - `YYYY-MM-DD` date to check.
 * @returns Eligible roster rows for the substitution picker.
 */
export function substitutableAssignmentsOn(
  assignments: DutyAssignment[],
  rotations: DutyRotation[],
  date: string,
): DutyAssignment[] {
  return assignments.filter(
    (assignment) =>
      isDutyActiveOn(assignment, date) &&
      activeSubstitutionsForAssignment(rotations, assignment.id, date).length === 0,
  );
}

// ---------------------------------------------------------------------------
// Uniform reports — POST/GET /uniform-reports (admin|staff_tu|duty_teacher).
// ---------------------------------------------------------------------------

export type UniformReportsQuery = {
  date?: string;
  teacher_id?: string;
};

export type CreateUniformReportInput = {
  for_date: string;
  teacher_id: string;
  scope: string; // 'student' | 'teacher'
  target_student_id?: string;
  note?: string;
};

/**
 * Normalises the POST /uniform-reports body: trims fields and omits the
 * optional empty strings so they are absent from the JSON (backend treats a
 * missing target_student_id/note as "none"). `target_student_id` is dropped
 * for teacher-scope notes, mirroring the migration-000011 CHECK.
 * @param input - Raw form values.
 * @returns Payload ready to send.
 */
export function toCreateUniformPayload(input: CreateUniformReportInput): Record<string, string> {
  const payload: Record<string, string> = {
    for_date: input.for_date.trim(),
    teacher_id: input.teacher_id.trim(),
    scope: input.scope.trim(),
  };
  const target = input.target_student_id?.trim() ?? '';
  if (target !== '' && input.scope !== 'teacher') {
    payload.target_student_id = target;
  }
  const note = input.note?.trim() ?? '';
  if (note !== '') {
    payload.note = note;
  }
  return payload;
}

/**
 * Composes the free-text `note` from the (still mock) uniform-infraction
 * catalog plus the operator note. The backend caps notes at 500 runes, so the
 * result is truncated by code point.
 * @param infractionLabels - Selected catalog item labels (may be empty).
 * @param note - Raw free-text note.
 * @returns Combined, ≤500-character note.
 */
/**
 * Split a string into code points (not UTF-16 units) for the 500-rune
 * backend cap — code-point iteration is the deliberate intent here.
 * @param value - Input string.
 * @returns One entry per Unicode code point.
 */
function toCodePoints(value: string): string[] {
  // oxlint-disable-next-line typescript/no-misused-spread -- code-point splitting is the intent
  return [...value];
}

export function buildUniformNote(infractionLabels: string[], note: string): string {
  const head =
    infractionLabels.length === 0 ? '' : `Pelanggaran seragam: ${infractionLabels.join(', ')}`;
  const tail = note.trim();
  let combined = tail;
  if (head !== '' && tail !== '') {
    combined = `${head}. Catatan: ${tail}`;
  } else if (head !== '') {
    combined = head;
  }
  return toCodePoints(combined).slice(0, 500).join('');
}

/**
 * GET /uniform-reports options — uniform notes for a date and/or teacher.
 * @param query - Optional `date` (matches for_date) / `teacher_id` filters.
 * @returns TanStack Query options resolving to `UniformReport[]`.
 */
export const uniformReportsOptions = (query?: UniformReportsQuery) =>
  queryOptions({
    queryKey: uniformKeys.list(query),
    queryFn: async () => {
      const result = await apiGet<DataList<UniformReport>>('/uniform-reports', { ...query });
      return result.data;
    },
  });

/**
 * GET /uniform-reports → existing uniform notes (admin|staff_tu|duty_teacher).
 * @param query - Optional `date` / `teacher_id` filters.
 * @returns React Query result with `UniformReport[]`.
 */
export const useUniformReports = (query?: UniformReportsQuery) =>
  useQuery(uniformReportsOptions(query));

/**
 * POST /uniform-reports mutation — records one uniform note.
 * Invalidates every uniform-reports query.
 * @returns React Query mutation for `CreateUniformReportInput`.
 */
export const useCreateUniformReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUniformReportInput) => {
      const result = await apiPost<{ uniform_report: UniformReport }>(
        '/uniform-reports',
        toCreateUniformPayload(input),
      );
      return result.uniform_report;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: uniformKeys.root });
    },
  });
};
