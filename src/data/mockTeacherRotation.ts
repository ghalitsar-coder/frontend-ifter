import type {
  RotationCandidate,
  RotationCurrentTeacher,
  RotationFilter,
  RotationIneligible,
} from '@/types/teacherRotation';

/**
 * Teacher whose homeroom or gate duty is being transferred.
 */
export const mockRotationCurrentTeacher: RotationCurrentTeacher = {
  initials: 'AS',
  name: 'Drs. Agus Subagyo, M.Pd',
  nip: '19740512 199903 1 002',
  subject: 'Bahasa Indonesia',
  currentJp: 26,
  maxJp: 28,
  homeroom: 'VIII A',
  homeroomStudents: 32,
};

/**
 * Eligible substitute teachers with workload and subject metadata.
 */
export const mockRotationCandidates: RotationCandidate[] = [
  {
    id: 'HW',
    initials: 'HW',
    name: 'Hendra Wijaya, S.Pd',
    nip: '19820815 200801 1 011',
    subject: 'Pendidikan Pancasila & PKn',
    currentJp: 20,
    maxJp: 28,
    tone: 'mint',
    tag: 'recommended',
    capacityNote: 'remaining',
    remainingJp: 8,
    lowLoad: true,
    sameSubjectGroup: false,
    hasClassEightExperience: true,
  },
  {
    id: 'SW',
    initials: 'SW',
    name: 'Siti Wahyuni, M.Pd',
    nip: '19851120 201001 2 018',
    subject: 'Bahasa Inggris',
    currentJp: 24,
    maxJp: 28,
    tone: 'blue',
    tag: 'capacity',
    capacityNote: 'remaining',
    remainingJp: 4,
    lowLoad: false,
    sameSubjectGroup: true,
    hasClassEightExperience: false,
  },
  {
    id: 'RF',
    initials: 'RF',
    name: 'Rahmat Fauzi, S.Si',
    nip: '19900314 201502 1 004',
    subject: 'Matematika',
    currentJp: 22,
    maxJp: 28,
    tone: 'sand',
    tag: 'available',
    capacityNote: 'flexible',
    remainingJp: 6,
    lowLoad: true,
    sameSubjectGroup: false,
    hasClassEightExperience: false,
  },
];

/**
 * Teachers blocked by workload or class schedule conflicts.
 */
export const mockRotationIneligible: RotationIneligible[] = [
  {
    id: 'NJ',
    name: 'Dra. Hj. Nurjanah',
    subject: 'B. Sunda',
    reason: 'full_load',
    loadJp: 30,
  },
  {
    id: 'BS',
    name: 'Bambang Setyo, S.Pd',
    subject: 'PJOK',
    reason: 'schedule_conflict',
  },
  {
    id: 'DK',
    name: 'Dewi Kartika, S.Pd',
    subject: 'IPA',
    reason: 'full_load',
    loadJp: 29,
  },
  {
    id: 'AF',
    name: 'Ahmad Fauzi, M.Pd',
    subject: 'IPS',
    reason: 'schedule_conflict',
  },
  {
    id: 'RS',
    name: 'Ratna Sari, S.Pd',
    subject: 'Seni Budaya',
    reason: 'full_load',
    loadJp: 29,
  },
];

/**
 * Filter eligible substitutes by keyword and workload category.
 *
 * @param candidates - Eligible teacher pool.
 * @param query - Name, NIP, or subject keyword.
 * @param filter - Workload category.
 * @returns Matching candidates.
 */
export function filterRotationCandidates(
  candidates: RotationCandidate[],
  query: string,
  filter: RotationFilter,
) {
  const keyword = query.trim().toLowerCase();

  return candidates.filter((candidate) => {
    const matchesQuery =
      keyword.length === 0 ||
      [candidate.name, candidate.nip, candidate.subject].some((value) =>
        value.toLowerCase().includes(keyword),
      );

    const matchesFilter =
      filter === 'all' ||
      (filter === 'low' && candidate.lowLoad) ||
      (filter === 'subject' && candidate.sameSubjectGroup);

    return matchesQuery && matchesFilter;
  });
}
