'use client';

import { useState } from 'react';
import {
  DISPENSATION_LAYOUT,
  EMPTY_DISPENSATION_DRAFT,
  nextDispensationState,
  readDispensationDocument,
} from '@/components/presensi/presensiDispensation';
import type { DispensationDraft } from '@/components/presensi/presensiDispensation';
import { PresensiDispensationRecord } from '@/components/presensi/PresensiDispensationRecord';
import { PresensiDispensationRegister } from '@/components/presensi/PresensiDispensationRegister';
import { PresensiDispensationUpload } from '@/components/presensi/PresensiDispensationUpload';
import { PresensiDispensationVerified } from '@/components/presensi/PresensiDispensationVerified';
import type { DispensationState, PresensiStudent } from '@/types/presensi';

const SHELL_CLASSES = {
  record: {
    backdrop: 'bg-primary/40',
    card: 'max-w-2xl max-h-[942px] rounded-2xl shadow-xl',
  },
  register: {
    backdrop: 'bg-pine-deep/40',
    card: 'max-w-[760px] rounded-[24px] shadow-[0_24px_64px_rgba(23,63,54,0.18)]',
  },
  upload: {
    backdrop: 'bg-black/45',
    card: 'max-w-[620px] rounded-3xl border border-border-subtle shadow-[0_20px_50px_rgba(0,0,0,0.16)]',
  },
} as const;

// shortcut: no backend yet, so the read is paced per chunk to keep the progress
// bar perceptible; drop the delay once a real upload endpoint exists.
const CHUNK_PACE_MS = 60;

/**
 * Absence note dialog for permission and official dispensation requests, picking
 * its shell from where the filing currently stands.
 *
 * @param props - Student context and close handler.
 * @returns Modal overlay for the dispensation flow.
 */
export function PresensiDispensationModal(props: {
  student: PresensiStudent;
  ordinal: number;
  onClose: () => void;
}) {
  const [state, setState] = useState<DispensationState>(
    props.student.hasDocument ? 'detail' : 'initial',
  );
  const [draft, setDraft] = useState<DispensationDraft>(EMPTY_DISPENSATION_DRAFT);
  const [abort, setAbort] = useState<AbortController | null>(null);
  const [percent, setPercent] = useState(0);
  const shell = SHELL_CLASSES[DISPENSATION_LAYOUT[state]];

  function upload() {
    const {document} = draft;
    const next = nextDispensationState(state, { draft, type: 'submit' });
    setState(next);

    if (next !== 'uploading' || !document) {
      return;
    }

    const controller = new AbortController();
    setAbort(controller);
    setPercent(0);
    void readDispensationDocument({
      chunkPaceMs: CHUNK_PACE_MS,
      file: document,
      onProgress: setPercent,
      signal: controller.signal,
    }).then((outcome) => {
      if (outcome === 'done') {
        setState(nextDispensationState('uploading', { type: 'verified' }));
      }
    });
  }

  function cancelUpload() {
    abort?.abort();
    setAbort(null);
    setState(nextDispensationState(state, { type: 'uploadCancelled' }));
  }

  function ratify() {
    setState(nextDispensationState(state, { type: 'ratified' }));
  }

  function body() {
    switch (state) {
      case 'detail': {
        return (
          <PresensiDispensationRecord
            onClose={props.onClose}
            onRatify={ratify}
            ordinal={props.ordinal}
            student={props.student}
          />
        );
      }
      case 'verified': {
        return (
          <PresensiDispensationVerified
            file={draft.document}
            onClose={props.onClose}
            ordinal={props.ordinal}
            student={props.student}
          />
        );
      }
      case 'approved': {
        return (
          <PresensiDispensationRegister
            file={draft.document}
            onClose={props.onClose}
            ordinal={props.ordinal}
            student={props.student}
          />
        );
      }
      default: {
        return (
          <PresensiDispensationUpload
            draft={draft}
            onCancelUpload={cancelUpload}
            onClose={props.onClose}
            onDraftChange={setDraft}
            onSubmit={upload}
            ordinal={props.ordinal}
            percent={percent}
            state={state}
            student={props.student}
          />
        );
      }
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-space-sm backdrop-blur-md sm:p-space-lg ${shell.backdrop}`}
    >
      <div
        aria-labelledby="dispensation-title"
        aria-modal="true"
        autoFocus
        className={`relative my-auto flex w-full flex-col overflow-hidden bg-surface-card text-on-surface transition-all duration-200 ${shell.card}`}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            props.onClose();
          }
        }}
        role="dialog"
        tabIndex={-1}
      >
        {body()}
      </div>
    </div>
  );
}
