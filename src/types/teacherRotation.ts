/**
 * Types for teacher rotation and substitute assignment.
 */

export type RotationMode = 'homeroom' | 'gate';

export type RotationFilter = 'all' | 'low' | 'subject';

export type RotationCandidateTag = 'recommended' | 'capacity' | 'available';

export type RotationCandidateTone = 'mint' | 'blue' | 'sand';

export type RotationCapacityNote = 'remaining' | 'medium' | 'flexible';

export type RotationCandidate = {
  id: string;
  initials: string;
  name: string;
  nip: string;
  subject: string;
  currentJp: number;
  maxJp: number;
  tone: RotationCandidateTone;
  tag: RotationCandidateTag;
  capacityNote: RotationCapacityNote;
  remainingJp?: number;
  lowLoad: boolean;
  sameSubjectGroup: boolean;
  hasClassEightExperience: boolean;
};

export type RotationCurrentTeacher = {
  initials: string;
  name: string;
  nip: string;
  subject: string;
  currentJp: number;
  maxJp: number;
  homeroom: string;
  homeroomStudents: number;
};

export type RotationIneligibleReason = 'full_load' | 'schedule_conflict';

export type RotationIneligible = {
  id: string;
  name: string;
  subject: string;
  reason: RotationIneligibleReason;
  loadJp?: number;
};

export type RotationAssignmentType = 'temporary' | 'permanent';

export type RotationSubmission = {
  mode: RotationMode;
  teacher: RotationCandidate;
  effectiveDate: string;
  assignmentType: RotationAssignmentType;
  decreeNumber: string;
};
