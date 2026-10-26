'use client';

import { CalendarPlus, ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/api/client';
import {
  mapSessionError,
  sessionStatusLabel,
  useSessions,
  validateRange,
} from '@/lib/api/presensi-mapel';
import type { SessionFilter } from '@/lib/api/presensi-mapel';
import { MapelFilterBar, emptyMapelFilter } from './MapelFilterBar';
import type { MapelFilterValue } from './MapelFilterBar';

const PAGE_SIZE = 20;

const listErrorText = (error: unknown): string =>
  error instanceof ApiError ? mapSessionError(error, 'session') : 'Daftar sesi gagal dimuat.';

/**
 * Session list of GET /attendance-sessions: the month window plus the class ×
 * subject × teacher scope, one row per lesson meeting, paged 20 at a time.
 *
 * @param props - Callbacks for opening a session and creating a new one.
 * @param props.onOpenSession - Receives the session id to show in the detail panel.
 * @param props.onCreate - Opens the create-session modal.
 * @returns Session list card.
 */
export function SessionListPanel(props: {
  onOpenSession: (sessionId: string) => void;
  onCreate: () => void;
}) {
  const [filter, setFilter] = useState<MapelFilterValue>(emptyMapelFilter);
  const [status, setStatus] = useState('');
  const [offset, setOffset] = useState(0);

  const sessionsFilter: SessionFilter = {
    from: filter.from,
    to: filter.to,
    ...(filter.class_id === '' ? {} : { class_id: filter.class_id }),
    ...(filter.subject_id === '' ? {} : { subject_id: filter.subject_id }),
    ...(filter.teacher_id === '' ? {} : { teacher_id: filter.teacher_id }),
    ...(status === '' ? {} : { status }),
  };

  const sessionsQuery = useSessions(sessionsFilter, { limit: PAGE_SIZE, offset });
  const page = sessionsQuery.data;
  const rows = page?.data ?? [];
  const total = page?.total ?? 0;
  const lastOffset = Math.max(Math.ceil(total / PAGE_SIZE) - 1, 0) * PAGE_SIZE;
  // A disabled query never settles, so the reason is shown instead of a skeleton.
  const rangeError = validateRange(sessionsFilter);

  return (
    <div className="flex flex-col gap-4">
      <MapelFilterBar
        value={filter}
        onChange={(next) => {
          setFilter(next);
          setOffset(0);
        }}
        status={status}
        onStatusChange={(next) => {
          setStatus(next);
          setOffset(0);
        }}
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-border-control bg-surface-card p-4 shadow-xs sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-control pb-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-4 text-pine-deep" />
            <h2 className="text-sm font-bold text-pine-deep sm:text-base">Sesi Pembelajaran</h2>
          </div>
          <button
            type="button"
            onClick={props.onCreate}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-pine-deep px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-pine-hover"
          >
            <CalendarPlus className="size-4 text-amber-gold" />
            Buat Sesi
          </button>
        </div>

        {rangeError !== null && (
          <p className="py-8 text-center text-sm text-text-muted">{rangeError}</p>
        )}
        {sessionsQuery.isPending && rangeError === null && (
          <Skeleton className="h-40 w-full rounded-xl" />
        )}
        {sessionsQuery.isError && (
          <p className="text-sm text-rose-700">{listErrorText(sessionsQuery.error)}</p>
        )}
        {!sessionsQuery.isPending &&
          !sessionsQuery.isError &&
          rangeError === null &&
          rows.length === 0 && (
            <p className="py-8 text-center text-sm text-text-muted">
              Belum ada sesi pada rentang dan filter ini. Buat sesi dari tombol di atas, lalu isi
              absensinya.
            </p>
          )}

        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-[11px] font-bold tracking-wide text-text-muted uppercase">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">JP</th>
                  <th className="px-4 py-3">Mapel</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3">Guru</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Absensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-control">
                {rows.map((session) => (
                  <tr key={session.id}>
                    <td className="px-4 py-2.5 whitespace-nowrap text-text-primary">
                      {session.session_date}
                    </td>
                    <td className="px-4 py-2.5 text-text-primary">
                      {session.period_start === session.period_end
                        ? `JP ${session.period_start}`
                        : `JP ${session.period_start}–${session.period_end}`}
                    </td>
                    <td className="px-4 py-2.5 text-text-primary">{session.subject_name}</td>
                    <td className="px-4 py-2.5 text-text-primary">{session.class_name}</td>
                    <td className="px-4 py-2.5 text-text-primary">{session.teacher_name}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-text-primary">
                      {sessionStatusLabel(session.status)}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            props.onOpenSession(session.id);
                          }}
                          aria-label={`Isi absensi sesi ${session.subject_name} kelas ${session.class_name}`}
                          className="cursor-pointer rounded-xl border border-border-control bg-surface-container-low px-3 py-1.5 text-[11px] font-bold text-pine-deep transition-colors hover:bg-pine-light"
                        >
                          {session.status === 'closed' ? 'Lihat' : 'Isi'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-border-control pt-3">
          <p className="text-[11px] font-semibold text-text-muted">
            Menampilkan {rows.length} dari {total} sesi
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={offset === 0 || sessionsQuery.isFetching}
              onClick={() => {
                setOffset((prev) => Math.max(prev - PAGE_SIZE, 0));
              }}
              className="flex cursor-pointer items-center gap-1 rounded-xl border border-border-control bg-surface-card px-3 py-1.5 text-xs font-bold text-pine-deep transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="size-3.5" />
              Sebelumnya
            </button>
            <button
              type="button"
              disabled={offset >= lastOffset || sessionsQuery.isFetching}
              onClick={() => {
                setOffset((prev) => Math.min(prev + PAGE_SIZE, lastOffset));
              }}
              className="flex cursor-pointer items-center gap-1 rounded-xl border border-border-control bg-surface-card px-3 py-1.5 text-xs font-bold text-pine-deep transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
            >
              Berikutnya
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
