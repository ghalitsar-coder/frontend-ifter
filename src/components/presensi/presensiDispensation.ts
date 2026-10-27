import type { DispensationState } from '@/types/presensi';

/**
 * Shell geometry the Stitch export uses per state: `record` is the editable
 * detail view, `upload` the document flow, `register` the ratified record.
 */
export type DispensationLayout = 'record' | 'register' | 'upload';

/**
 * Absence category the teacher files the dispensation under.
 */
export type DispensationCategory = 'izin' | 'sakit';

/**
 * Values collected by the upload form.
 */
export type DispensationDraft = {
  category: DispensationCategory;
  document: File | null;
  endDate: string;
  startDate: string;
};

/**
 * Rule the filled form breaks, keyed to the message the error screen shows.
 */
export type DispensationIssue = 'end_before_start' | 'file_too_large';

/**
 * Action that can move the dispensation modal to another state.
 */
export type DispensationEvent =
  | { type: 'submit'; draft: DispensationDraft }
  | { type: 'uploadCancelled' }
  | { type: 'verified' }
  | { type: 'ratified' };

/**
 * Rejection threshold the dropzone caption promises: PDF, JPG, PNG at 5 MB.
 */
export const DISPENSATION_FILE_MAX_BYTES = 5 * 1024 * 1024;

/**
 * Bytes the upload reader hands over per step, fixed so the progress bar advances
 * the same number of times in every browser.
 */
const READ_SLICE_BYTES = 64 * 1024;

/**
 * Empty draft, matching the initial upload screen where dates and file are blank.
 */
export const EMPTY_DISPENSATION_DRAFT: DispensationDraft = {
  category: 'izin',
  document: null,
  endDate: '',
  startDate: '',
};

export const DISPENSATION_LAYOUT = {
  approved: 'register',
  detail: 'record',
  error: 'upload',
  initial: 'upload',
  uploading: 'upload',
  verified: 'upload',
} as const satisfies Record<DispensationState, DispensationLayout>;

/**
 * Lists the rules the draft breaks. Missing input is not an issue: it leaves the
 * primary action disabled instead of failing the form.
 *
 * @param draft - Current form values.
 * @returns Broken rules, in the order the error screen reports them.
 */
export function listDispensationIssues(draft: DispensationDraft): DispensationIssue[] {
  const issues: DispensationIssue[] = [];

  if (draft.document && draft.document.size > DISPENSATION_FILE_MAX_BYTES) {
    issues.push('file_too_large');
  }

  if (draft.startDate !== '' && draft.endDate !== '' && draft.endDate < draft.startDate) {
    issues.push('end_before_start');
  }

  return issues;
}

/**
 * Checks the required dispensation inputs, independent of the modal state.
 *
 * @param draft - Current form values.
 * @returns True when a document and both dates are present.
 */
export function isDispensationFormComplete(draft: DispensationDraft): boolean {
  return draft.document !== null && draft.startDate !== '' && draft.endDate !== '';
}

/**
 * Applies one upload-flow transition; states outside the flow keep their value.
 *
 * @param state - Current modal state.
 * @param event - Action the teacher took.
 * @returns The next modal state.
 */
export function nextDispensationState(
  state: DispensationState,
  event: DispensationEvent,
): DispensationState {
  switch (event.type) {
    case 'submit': {
      if (state !== 'initial' && state !== 'error') {
        return state;
      }

      const { draft } = event;

      if (listDispensationIssues(draft).length > 0) {
        return 'error';
      }

      return isDispensationFormComplete(draft) ? 'uploading' : state;
    }
    case 'uploadCancelled': {
      return state === 'uploading' ? 'initial' : state;
    }
    case 'verified': {
      return state === 'uploading' ? 'verified' : state;
    }
    case 'ratified': {
      return state === 'detail' || state === 'verified' ? 'approved' : state;
    }
    default: {
      return state;
    }
  }
}

/**
 * Reports whether the upload form's primary action can fire. A complete form is
 * submittable from the empty screen even when it breaks a rule, because
 * submitting it is what opens the error screen; once there, the action stays off
 * until the violations are repaired.
 *
 * @param state - Current modal state.
 * @param draft - Current form values.
 * @returns True when a submission moves the flow forward.
 */
export function isDispensationUploadReady(
  state: DispensationState,
  draft: DispensationDraft,
): boolean {
  if (state === 'initial') {
    return isDispensationFormComplete(draft);
  }

  if (state === 'error') {
    return isDispensationFormComplete(draft) && listDispensationIssues(draft).length === 0;
  }

  return false;
}

/**
 * Formats a byte count in megabytes to one decimal, the caption the upload
 * screens use for both the limit and a rejected file's size.
 *
 * @param bytes - Size of the chosen document.
 * @returns The value part of a "6.8 MB" caption.
 */
export function formatMegabytes(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

/**
 * Reads a chosen document slice by slice, reporting how far it got. This is the
 * only real work the upload screen can do without a backend: it measures the file
 * being handed over, not a server that has not been built yet. Slices are fixed
 * size so the progress bar advances the same way on every browser.
 *
 * @param options - File to read, progress sink in percent, cancel signal, and an
 * optional pause between slices so a local read is slow enough to be watched.
 * @returns Whether the read finished or was cancelled.
 */
export async function readDispensationDocument(options: {
  chunkPaceMs?: number;
  file: File;
  onProgress: (percent: number) => void;
  signal: AbortSignal;
}): Promise<'cancelled' | 'done'> {
  const { chunkPaceMs = 0, file, onProgress, signal } = options;
  let bytesRead = 0;

  while (bytesRead < file.size) {
    if (signal.aborted) {
      return 'cancelled';
    }

    // eslint-disable-next-line no-await-in-loop -- slices must finish in order so progress matches real throughput
    const slice = await file.slice(bytesRead, bytesRead + READ_SLICE_BYTES).arrayBuffer();
    bytesRead += slice.byteLength;
    onProgress(Math.min(99, Math.round((bytesRead / file.size) * 100)));

    if (chunkPaceMs > 0) {
      const { promise, resolve } = Promise.withResolvers();
      setTimeout(resolve, chunkPaceMs);
      // eslint-disable-next-line no-await-in-loop -- the paced pause is what makes the progress bar observable
      await promise;
    }
  }

  onProgress(100);
  return 'done';
}
