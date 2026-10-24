/**
 * Attendance status shown on the Attendly daily attendance screen.
 */
export type PresensiStatus = 'hadir' | 'sakit' | 'izin' | 'alpa' | 'none';

/**
 * Filter chips available on the attendance roster.
 */
export type PresensiFilter = 'all' | 'unrecorded' | Exclude<PresensiStatus, 'none'>;

/**
 * Single student row on the attendance roster.
 */
export type PresensiStudent = {
  id: string;
  name: string;
  nisn: string;
  initials: string;
  status: PresensiStatus;
  /** Free-text reason the teacher saved with the status, the backend `keterangan`. */
  note?: string;
  hasDocument?: boolean;
};

/**
 * Modal state for the dispensation and competition permit flow.
 *
 * `detail` is the editable view of an already-saved record; the other states are the upload flow.
 */
export type DispensationState =
  | 'detail'
  | 'initial'
  | 'uploading'
  | 'error'
  | 'verified'
  | 'approved';
