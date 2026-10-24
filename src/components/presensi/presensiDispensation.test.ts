import { describe, expect, it } from 'vitest';
import {
  DISPENSATION_FILE_MAX_BYTES,
  DISPENSATION_LAYOUT,
  EMPTY_DISPENSATION_DRAFT,
  formatMegabytes,
  isDispensationFormComplete,
  isDispensationUploadReady,
  listDispensationIssues,
  nextDispensationState,
  readDispensationDocument,
} from '@/components/presensi/presensiDispensation';
import type { DispensationDraft } from '@/components/presensi/presensiDispensation';
import type { DispensationState } from '@/types/presensi';

const VALID_RANGE = { endDate: '2026-10-09', startDate: '2026-10-07' };

function fileOfMegabytes(megabytes: number): File {
  return new File([new Uint8Array(megabytes * 1024 * 1024)], 'Surat_Tugas_OSN.pdf');
}

function draftWith(values: Partial<DispensationDraft>): DispensationDraft {
  return { ...EMPTY_DISPENSATION_DRAFT, ...VALID_RANGE, ...values };
}

function submitWith(values: Partial<DispensationDraft>) {
  return { draft: draftWith(values), type: 'submit' } as const;
}

describe(nextDispensationState, () => {
  it('moves to uploading when an accepted file is submitted', () => {
    expect(nextDispensationState('initial', submitWith({ document: fileOfMegabytes(2.4) }))).toBe(
      'uploading',
    );
  });

  it('moves to error when the file exceeds the size limit', () => {
    expect(nextDispensationState('initial', submitWith({ document: fileOfMegabytes(6.8) }))).toBe(
      'error',
    );
  });

  it('accepts a file at exactly the size limit', () => {
    expect(nextDispensationState('initial', submitWith({ document: fileOfMegabytes(5) }))).toBe(
      'uploading',
    );
  });

  it('retries from error back into uploading with a smaller file', () => {
    expect(nextDispensationState('error', submitWith({ document: fileOfMegabytes(1.2) }))).toBe(
      'uploading',
    );
  });

  it('keeps the error state when the replacement file is still oversized', () => {
    expect(nextDispensationState('error', submitWith({ document: fileOfMegabytes(9) }))).toBe(
      'error',
    );
  });

  it('moves to error when the end date precedes the start date', () => {
    expect(
      nextDispensationState(
        'initial',
        submitWith({
          document: fileOfMegabytes(1.2),
          endDate: '2026-10-06',
          startDate: '2026-10-07',
        }),
      ),
    ).toBe('error');
  });

  it('walks the upload flow through verification and ratification', () => {
    const flow = ['uploading', 'verified', 'approved'] satisfies DispensationState[];
    const verified = nextDispensationState('uploading', { type: 'verified' });
    const ratified = nextDispensationState(verified, { type: 'ratified' });

    expect([verified, ratified]).toStrictEqual(flow.slice(1));
  });

  it('returns to the empty form when an upload is cancelled', () => {
    expect(nextDispensationState('uploading', { type: 'uploadCancelled' })).toBe('initial');
  });

  it('leaves terminal states untouched by an upload event', () => {
    expect(nextDispensationState('approved', { type: 'verified' })).toBe('approved');
    expect(nextDispensationState('verified', { type: 'uploadCancelled' })).toBe('verified');
  });

  it('leaves the record editor outside the upload machine', () => {
    expect(nextDispensationState('detail', submitWith({ document: fileOfMegabytes(1) }))).toBe(
      'detail',
    );
  });

  it('opens the register from the record editor and ignores it elsewhere', () => {
    expect(nextDispensationState('detail', { type: 'ratified' })).toBe('approved');
    expect(nextDispensationState('initial', { type: 'ratified' })).toBe('initial');
  });
});

describe(listDispensationIssues, () => {
  it('reports the rejected file before the broken date range', () => {
    expect(
      listDispensationIssues(
        draftWith({
          document: fileOfMegabytes(6.8),
          endDate: '2026-10-06',
          startDate: '2026-10-07',
        }),
      ),
    ).toStrictEqual(['file_too_large', 'end_before_start']);
  });

  it('reports nothing for a complete draft that breaks no rule', () => {
    expect(listDispensationIssues(draftWith({ document: fileOfMegabytes(1.8) }))).toStrictEqual([]);
  });

  it('treats missing input as unfinished rather than invalid', () => {
    expect(listDispensationIssues(EMPTY_DISPENSATION_DRAFT)).toStrictEqual([]);
  });

  it('compares dates only once both of them are filled in', () => {
    expect(
      listDispensationIssues(draftWith({ document: fileOfMegabytes(1), endDate: '' })),
    ).toStrictEqual([]);
  });
});

describe(isDispensationFormComplete, () => {
  it('blocks submit while the empty draft is missing a document and both dates', () => {
    expect(isDispensationFormComplete(EMPTY_DISPENSATION_DRAFT)).toBeFalsy();
  });

  it('accepts a draft with a document and a full date range', () => {
    expect(isDispensationFormComplete(draftWith({ document: fileOfMegabytes(1.8) }))).toBeTruthy();
  });

  it('still blocks a dated draft whose upload was cancelled', () => {
    expect(isDispensationFormComplete(draftWith({ document: null }))).toBeFalsy();
  });
});

describe(isDispensationUploadReady, () => {
  it('keeps the action blocked while the empty form is unfinished', () => {
    expect(isDispensationUploadReady('initial', EMPTY_DISPENSATION_DRAFT)).toBeFalsy();
  });

  it('enables the action once a compliant document and both dates are present', () => {
    expect(
      isDispensationUploadReady('initial', draftWith({ document: fileOfMegabytes(2.4) })),
    ).toBeTruthy();
  });

  it('lets a complete but broken form submit from the empty screen', () => {
    expect(
      isDispensationUploadReady('initial', draftWith({ document: fileOfMegabytes(6.8) })),
    ).toBeTruthy();
  });

  it('blocks the action in the error screen until the violation is replaced', () => {
    expect(isDispensationUploadReady('error', draftWith({ document: fileOfMegabytes(6.8) }))).toBeFalsy();
    expect(isDispensationUploadReady('error', draftWith({ document: fileOfMegabytes(1.2) }))).toBeTruthy();
  });

  it('leaves the action out of the progress and verified states', () => {
    const complete = draftWith({ document: fileOfMegabytes(1.2) });
    expect(isDispensationUploadReady('uploading', complete)).toBeFalsy();
    expect(isDispensationUploadReady('verified', complete)).toBeFalsy();
  });

  it('pins the size limit to the 5 MB the dropzone caption promises', () => {
    expect(DISPENSATION_FILE_MAX_BYTES).toBe(5 * 1024 * 1024);
  });
});

describe('dispensation layout state map', () => {
  it('maps every state to the shell the mock exports it in', () => {
    expect(DISPENSATION_LAYOUT).toStrictEqual({
      approved: 'register',
      detail: 'record',
      error: 'upload',
      initial: 'upload',
      uploading: 'upload',
      verified: 'upload',
    });
  });
});

describe(formatMegabytes, () => {
  it('captions sizes with one decimal, as the error banner reads them', () => {
    expect(formatMegabytes(fileOfMegabytes(6.8).size)).toBe('6.8');
    expect(formatMegabytes(DISPENSATION_FILE_MAX_BYTES)).toBe('5.0');
  });
});

describe(readDispensationDocument, () => {
  it('reads the whole document and finishes at one hundred percent', async () => {
    const percents: number[] = [];

    const outcome = await readDispensationDocument({
      file: fileOfMegabytes(1.8),
      onProgress: (percent) => percents.push(percent),
      signal: new AbortController().signal,
    });

    expect(outcome).toBe('done');
    expect(percents.at(-1)).toBe(100);
    expect(percents.slice(0, -1).every((percent) => percent <= 99)).toBeTruthy();
  });

  it('stops reading when the teacher cancels partway through the document', async () => {
    const controller = new AbortController();
    const percents: number[] = [];

    const outcome = await readDispensationDocument({
      chunkPaceMs: 1,
      file: fileOfMegabytes(1.8),
      onProgress: (percent) => {
        percents.push(percent);
        if (percents.length === 3) {
          controller.abort();
        }
      },
      signal: controller.signal,
    });

    expect(outcome).toBe('cancelled');
    expect(percents).toHaveLength(3);
  });

  it('stops reading when the upload is cancelled before it starts', async () => {
    const controller = new AbortController();
    controller.abort();
    const percents: number[] = [];

    const outcome = await readDispensationDocument({
      file: fileOfMegabytes(1.8),
      onProgress: (percent) => percents.push(percent),
      signal: controller.signal,
    });

    expect(outcome).toBe('cancelled');
    expect(percents).toStrictEqual([]);
  });
});
