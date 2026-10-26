/**
 * Types and interfaces for Gate Duty & RFID Monitoring module.
 */

export type TapStatus = 'on_time' | 'late' | 'uniform_hold' | 'unknown_card';

export type GateShiftInfo = {
  shiftName: string;
  timeRange: string;
  gateName: string;
  onDutyTeachers: string[];
  isGateOpen: boolean;
};

export type PiketMetrics = {
  totalPresent: number;
  totalEnrolled: number;
  onTimeCount: number;
  lateCount: number;
  uniformHoldCount: number;
  activeReadersCount: number;
  readerLatencySec: number;
};

export type RfidTapLog = {
  id: string;
  nis: string;
  studentName: string;
  className: string;
  photoUrl?: string;
  tapTime: string;
  status: TapStatus;
  readerId: string;
  readerName: string;
  /** Tap source; `manual` rows are simulated by the duty officer. */
  origin: 'device' | 'manual';
  /** Raw card uid as reported by the reader. */
  cardUid?: string;
  delayMinutes: number;
  pointPenalty: number;
  compensationTask?: string;
  isUniformComplete: boolean;
};

export type UniformInfractionItem = {
  id: string;
  label: string;
  points: number;
  defaultChecked?: boolean;
};

export type ActiveCompensation = {
  id: string;
  studentName: string;
  initials: string;
  className: string;
  area: string;
  areaIcon: 'park' | 'local_library' | 'cleaning_services' | 'menu_book';
  remainingMinutes: number;
  isCompleted: boolean;
};

export type GateFilterOptions = {
  searchKeyword: string;
  readerFilter: string;
  statusFilter: 'all' | TapStatus;
};
