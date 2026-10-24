import { ClipboardList, UserRoundSearch, X } from 'lucide-react';
import { useState } from 'react';
import { ApiError } from '@/lib/api/client';
import type { IncidentDisplayStatus } from '@/lib/api/kedisiplinan';
import {
  displayStatusToRecordParam,
  formatIncidentDate,
  formatIncidentTime,
  recordStatusToDisplay,
  useAddDisciplineFollowup,
  useDisciplineRecordDetail,
  useStudentDisciplineProfile,
} from '@/lib/api/kedisiplinan';

/** Backend statuses the staff UI may move a record to via followups. */
const FOLLOWUP_STATUS_OPTIONS: { value: IncidentDisplayStatus; label: string }[] = [
  { value: 'baru', label: 'Baru Dicatat' },
  { value: 'tinjau', label: 'Dalam Peninjauan' },
  { value: 'tindak', label: 'Tindak Lanjut BK' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'dibatalkan', label: 'Dibatalkan (butuh catatan)' },
];

/**
 * Modal showing one violation record (GET /discipline/records/:id), its
 * followup history, the per-student summary (GET /discipline/students/:id)
 * and a status-update form (POST /discipline/records/:id/followups).
 *
 * @param props - Component properties.
 * @returns Rendered record detail dialog.
 */
export function DisciplineRecordDetailModal(props: {
  recordId: string;
  onClose: () => void;
  onToast: (msg: string) => void;
}) {
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');

  const detail = useDisciplineRecordDetail(props.recordId);
  const profile = useStudentDisciplineProfile(detail.data?.student_id ?? '');
  const followup = useAddDisciplineFollowup(props.recordId);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    followup.mutate(
      {
        status: displayStatusToRecordParam(status) ?? status,
        notes: notes.trim() === '' ? undefined : notes.trim(),
      },
      {
        onSuccess: () => {
          props.onToast('Status pelanggaran diperbarui.');
          props.onClose();
        },
        onError: (err) => {
          props.onToast(err instanceof ApiError ? err.message : 'Gagal memperbarui status.');
        },
      },
    );
  };

  const record = detail.data;

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/50 p-4 backdrop-blur-xs duration-150 fade-in">
      <div className="w-full max-w-2xl animate-in overflow-hidden rounded-2xl border border-border bg-card shadow-2xl duration-150 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-container-low p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-pine-deep text-amber-gold shadow-xs">
              <ClipboardList className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Detail &amp; Tindak Lanjut</h3>
              <p className="text-xs text-muted-foreground">
                {record === undefined
                  ? 'Memuat data…'
                  : `${record.student_name} • Kelas ${record.class_name} (NIS: ${record.student_number})`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            aria-label="Tutup detail"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5 text-xs">
          {detail.isError ? (
            <p className="text-red-700">
              {detail.error instanceof ApiError
                ? detail.error.message
                : 'Gagal memuat detail pelanggaran.'}
            </p>
          ) : null}

          {record === undefined ? null : (
            <>
              {/* Record summary */}
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface-container-low p-3 sm:grid-cols-4">
                <div>
                  <p className="text-[11px] text-muted-foreground">Tanggal</p>
                  <p className="font-bold text-foreground">
                    {formatIncidentDate(record.occurred_at)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatIncidentTime(record.occurred_at)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Kategori</p>
                  <p className="font-bold text-foreground">{record.category_name}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Poin</p>
                  <p className="font-bold text-foreground">+{record.points}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Status</p>
                  <p className="font-bold text-foreground capitalize">
                    {recordStatusToDisplay(record.status)}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-4">
                  <p className="text-[11px] text-muted-foreground">Deskripsi</p>
                  <p className="font-medium text-foreground">{record.description}</p>
                </div>
                <div className="col-span-2 sm:col-span-4">
                  <p className="text-[11px] text-muted-foreground">Pencatat</p>
                  <p className="font-medium text-foreground">{record.recorded_by_name}</p>
                </div>
              </div>

              {/* Per-student summary (GET /discipline/students/:id) */}
              <div className="space-y-2 rounded-xl border border-border p-3">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-pine-deep uppercase">
                  <UserRoundSearch className="size-4" />
                  <span>Rekam Pembinaan Siswa</span>
                </div>
                {profile.data === undefined ? (
                  <p className="text-[11px] text-muted-foreground">Memuat ringkasan siswa…</p>
                ) : (
                  <>
                    <p className="font-semibold text-foreground">
                      Total {profile.data.total_points} poin dari {profile.data.total_records}{' '}
                      pelanggaran
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.data.categories.map((item) => (
                        <span
                          key={item.category_id}
                          className="rounded-lg border border-border bg-surface-container-low px-2 py-0.5 text-[11px] text-foreground"
                        >
                          {item.category_name}: {item.count}x ({item.points} poin)
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Followup history */}
              <div className="space-y-2">
                <p className="text-xs font-bold tracking-wider text-foreground uppercase">
                  Riwayat Tindak Lanjut
                </p>
                {record.followups.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground">Belum ada tindak lanjut.</p>
                ) : (
                  <ol className="space-y-2">
                    {record.followups.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-xl border border-border bg-surface-container-low p-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground capitalize">
                            {recordStatusToDisplay(item.status)}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {formatIncidentDate(item.created_at)} • {item.updated_by_name}
                          </span>
                        </div>
                        {item.notes === undefined || item.notes === '' ? null : (
                          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                            {item.notes}
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {/* Status update form (POST /:id/followups) */}
              <form
                onSubmit={handleSubmit}
                className="space-y-3 rounded-xl border border-border p-3"
              >
                <p className="text-xs font-bold tracking-wider text-foreground uppercase">
                  Ubah Status
                </p>
                <select
                  required
                  aria-label="Status tindak lanjut"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                  }}
                  className="w-full rounded-xl border border-border bg-surface-container-low p-2.5 text-xs text-foreground focus:border-pine-deep focus:outline-hidden"
                >
                  <option value="">— Pilih status baru —</option>
                  {FOLLOWUP_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <textarea
                  rows={2}
                  aria-label="Catatan tindak lanjut"
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                  }}
                  placeholder="Catatan (wajib untuk pembatalan)"
                  className="w-full rounded-xl border border-border bg-surface-container-low p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-pine-deep focus:outline-hidden"
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={props.onClose}
                    className="rounded-xl border border-border bg-background px-4 py-2 font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    disabled={followup.isPending}
                    className="rounded-xl bg-pine-deep px-5 py-2 font-bold text-white shadow-xs transition-colors hover:bg-pine-hover disabled:opacity-60"
                  >
                    {followup.isPending ? 'Menyimpan…' : 'Simpan Tindak Lanjut'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
