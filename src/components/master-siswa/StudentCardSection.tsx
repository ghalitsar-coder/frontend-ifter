'use client';

import { Loader2, ScanBarcode, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { ApiError } from '@/lib/api/client';
import { can } from '@/lib/api/rbac';
import { normalizeCardUid, useSetStudentCard, useStudentCard } from '@/lib/api/student-card';

const cardErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return 'Kartu sudah terpasang pada siswa lain. Lepas dari siswa tersebut dulu.';
    }
    if (error.status === 404) {
      return 'Siswa tidak ditemukan.';
    }
    return error.message;
  }
  return 'Gagal menyimpan kartu.';
};

/**
 * RFID card binding editor for one student, shown inside the quick detail modal.
 * Self-gates on the master_data capability and never renders for other roles.
 *
 * @param props - Section inputs.
 * @param props.studentId - Student whose card binding is edited.
 * @param props.studentName - Student name, for the confirmations.
 * @returns Section element, or null when the role may not manage cards.
 */
export function StudentCardSection(props: { studentId: string; studentName: string }) {
  const { roles } = useAuth();
  const canManage = can(roles, 'master_data');
  const cardQuery = useStudentCard(props.studentId, canManage);
  const setCardMutation = useSetStudentCard();

  const [draft, setDraft] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  if (!canManage) {
    return null;
  }

  const currentUid = cardQuery.data?.card_uid ?? null;
  const trimmedDraft = normalizeCardUid(draft ?? '');
  const inFlight = setCardMutation.isPending;

  const handleSave = () => {
    if (trimmedDraft === null || inFlight) {
      setFeedback('UID kartu wajib diisi.');
      return;
    }
    setCardMutation.mutate(
      { studentId: props.studentId, cardUid: trimmedDraft },
      {
        onSuccess: (card) => {
          setDraft(null);
          setConfirmRemove(false);
          setFeedback(
            card.card_uid === null ? 'Kartu dilepas.' : `Kartu ${card.card_uid} tersimpan.`,
          );
        },
        onError: (error) => {
          setFeedback(cardErrorMessage(error));
        },
      },
    );
  };

  const handleRemove = () => {
    if (inFlight) {
      return;
    }
    setCardMutation.mutate(
      { studentId: props.studentId, cardUid: null },
      {
        onSuccess: () => {
          setDraft(null);
          setConfirmRemove(false);
          setFeedback('Kartu dilepas dari siswa ini.');
        },
        onError: (error) => {
          setFeedback(cardErrorMessage(error));
        },
      },
    );
  };

  return (
    <section className="flex flex-col gap-2 rounded-2xl border border-border-control bg-surface-container-low/70 p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-lg bg-pine-light text-pine-deep">
          <ScanBarcode className="size-3.5" />
        </span>
        <span className="text-[11px] font-bold tracking-wider text-pine-deep uppercase">
          Kartu RFID Siswa
        </span>
      </div>

      {cardQuery.isLoading && (
        <p className="flex items-center gap-1.5 text-xs text-text-muted">
          <Loader2 className="size-3.5 animate-spin" /> Memuat data kartu...
        </p>
      )}
      {cardQuery.isError && (
        <p className="text-xs text-rose-600">{cardErrorMessage(cardQuery.error)}</p>
      )}

      {!cardQuery.isLoading && !cardQuery.isError && (
        <>
          <p className="text-xs text-text-primary">
            Kartu saat ini:{' '}
            <span className="font-mono font-bold text-pine-deep">
              {currentUid ?? 'belum memasang kartu'}
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={draft ?? ''}
              onChange={(event) => {
                setDraft(event.target.value);
                setFeedback(null);
                setConfirmRemove(false);
              }}
              maxLength={64}
              placeholder="UID kartu, mis. 04A2B9C1"
              aria-label={`UID kartu untuk ${props.studentName}`}
              className="h-9 min-w-0 flex-1 rounded-xl border border-border-control bg-surface-card px-3 font-mono text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
            />
            {draft !== null && trimmedDraft !== null && trimmedDraft !== currentUid && (
              <button
                type="button"
                onClick={handleSave}
                disabled={inFlight}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-pine-deep px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-pine-hover disabled:opacity-60"
              >
                {inFlight && <Loader2 className="size-3.5 animate-spin" />}
                {currentUid === null ? 'Pasang Kartu' : 'Ganti Kartu'}
              </button>
            )}
            {currentUid !== null &&
              (confirmRemove ? (
                <div className="flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-2 py-1">
                  <span className="text-[11px] font-medium text-rose-800">Lepas kartu?</span>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="cursor-pointer rounded-lg bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white"
                  >
                    Lepas
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmRemove(false);
                    }}
                    className="cursor-pointer rounded-lg border border-rose-300 bg-white px-2 py-0.5 text-[11px] font-bold text-rose-700"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmRemove(true);
                  }}
                  aria-label={`Lepas kartu ${props.studentName}`}
                  title="Lepas kartu"
                  className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-border-control bg-surface-card text-text-muted transition-colors hover:bg-rose-50 hover:text-rose-700"
                >
                  <Trash2 className="size-4" />
                </button>
              ))}
          </div>

          {feedback !== null && (
            <output className="block text-[11px] font-medium text-text-primary">{feedback}</output>
          )}
        </>
      )}
    </section>
  );
}
