import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut } from '@/lib/api/client';
import type { DataList, DutyAssignment } from '@/lib/api/dto';

// ---------------------------------------------------------------------------
// Duty (piket) module hooks + mappers.
// Backend contract (Go/Gin, attendance domain, ALL admin-only):
//   GET  /duty-assignments?teacher_id&weekday&date -> { data: DutyAssignment[] }
//   POST /duty-assignments { teacher_id, weekday, start_date, end_date? } -> 201 bare DutyAssignment
//   PUT  /duty-assignments/:id/end { end_date } -> 200 bare DutyAssignment
// `weekday` is ISO-8601 day-of-week: 1 = Senin ... 7 = Ahad (backend uses
// Postgres EXTRACT(ISODOW FROM date)), which differs from JS Date.getDay()
// where 0 = Sunday — hence the explicit helpers below.
// ---------------------------------------------------------------------------

/** Module-scoped query keys (extends the `['<module>', ...]` convention). */
export const dutyKeys = {
  root: ['piket', 'duty-assignments'] as const,
  list: (query?: DutyAssignmentsQuery) => ['piket', 'duty-assignments', query ?? {}] as const,
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
