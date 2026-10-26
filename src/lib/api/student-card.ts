import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '@/lib/api/client';

/** RFID card bound to a student, from GET/PUT /students/:id/card. */
export type StudentCard = {
  student_id: string;
  card_uid: string | null;
};

export const studentCardKeys = {
  root: ['master-siswa'] as const,
  card: (studentId: string) => ['master-siswa', 'card', studentId] as const,
};

/**
 * Normalizes a card uid for the backend: trimmed, uppercased, blank to null.
 * @param value - Raw scanner/keyboard input.
 * @returns Normalized uid or null when clearing the binding.
 */
export const normalizeCardUid = (value?: string | null): string | null => {
  const trimmed = value?.trim().toUpperCase() ?? '';
  return trimmed === '' ? null : trimmed;
};

/**
 * GET /students/:id/card.
 * @param studentId - Student id.
 * @returns Current card binding.
 */
export const fetchStudentCard = async (studentId: string): Promise<StudentCard> => {
  const result = await apiGet<{ student_card: StudentCard }>(
    `/students/${encodeURIComponent(studentId)}/card`,
  );
  return result.student_card;
};

/**
 * PUT /students/:id/card. The backend keeps card uids unique across students.
 * @param studentId - Student id.
 * @param cardUid - New uid, or null to clear the binding.
 * @returns Updated card binding.
 */
export const setStudentCard = async (
  studentId: string,
  cardUid: string | null,
): Promise<StudentCard> => {
  const result = await apiPut<{ student_card: StudentCard }>(
    `/students/${encodeURIComponent(studentId)}/card`,
    { card_uid: normalizeCardUid(cardUid) ?? '' },
  );
  return result.student_card;
};

export const studentCardOptions = (studentId: string) =>
  queryOptions({
    queryKey: studentCardKeys.card(studentId),
    queryFn: async () => await fetchStudentCard(studentId),
  });

/**
 * GET /students/:id/card → current binding.
 * @param studentId - Student id.
 * @param enabled - Skip the request until a student is selected.
 * @returns React Query result with `StudentCard`.
 */
export const useStudentCard = (studentId: string, enabled = true) =>
  useQuery({ ...studentCardOptions(studentId), enabled: enabled && studentId !== '' });

/**
 * PUT /students/:id/card.
 * @returns Mutation over `{ studentId, cardUid }`.
 */
export const useSetStudentCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, cardUid }: { studentId: string; cardUid: string | null }) =>
      await setStudentCard(studentId, cardUid),
    onSuccess: (card) => {
      queryClient.setQueryData(studentCardKeys.card(card.student_id), card);
    },
  });
};
