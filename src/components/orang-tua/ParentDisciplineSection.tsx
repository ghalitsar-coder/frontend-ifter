'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatIncidentDate, formatIncidentTime } from '@/lib/api/kedisiplinan';
import type { DateRangeParams } from '@/lib/api/murid';
import {
  PARENT_PAGE_SIZE,
  disciplineStatusLabel,
  portalErrorMessage,
  useParentDiscipline,
  useParentDisciplineSummary,
  validateDateRange,
} from '@/lib/api/parent';

/**
 * Discipline overview of one linked child: the points aggregate with its
 * sanction tier (GET /parent/children/:id/discipline-summary) and the paged
 * record list (GET /parent/children/:id/discipline).
 *
 * @param props - Section inputs.
 * @param props.childId - Selected linked student id.
 * @param props.range - `from`/`to` picked in the portal header.
 * @returns Discipline cards element.
 */
export function ParentDisciplineSection(props: { childId: string; range: DateRangeParams }) {
  const [offset, setOffset] = useState(0);
  const rangeError = validateDateRange(props.range);
  const summary = useParentDisciplineSummary(props.childId, props.range);
  const list = useParentDiscipline(props.childId, props.range, {
    limit: PARENT_PAGE_SIZE,
    offset,
  });
  const rows = list.data?.data ?? [];
  const total = list.data?.total ?? 0;
  const lastOffset = Math.max(Math.ceil(total / PARENT_PAGE_SIZE) - 1, 0) * PARENT_PAGE_SIZE;

  if (rangeError !== null) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-rose-700">{rangeError}</CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ringkasan Poin</CardTitle>
          <CardDescription>
            Poin terkumpul pada rentang {props.range.from} sampai {props.range.to}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary.isPending && <Skeleton className="h-20 w-full rounded-xl" />}
          {summary.isError && (
            <p className="text-sm text-rose-700">
              {portalErrorMessage(summary.error, 'Ringkasan kedisiplinan gagal dimuat.')}
            </p>
          )}
          {summary.data !== undefined && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3">
                <div className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-center">
                  <p className="text-[11px] font-semibold tracking-wide text-amber-800">
                    Total Poin
                  </p>
                  <p className="text-2xl font-extrabold text-pine-deep">
                    {summary.data.total_points}
                  </p>
                </div>
                <div className="rounded-xl border border-border-control bg-surface-container-low px-4 py-3 text-center">
                  <p className="text-[11px] font-semibold tracking-wide text-text-muted">
                    Jumlah Catatan
                  </p>
                  <p className="text-2xl font-extrabold text-pine-deep">
                    {summary.data.total_records}
                  </p>
                </div>
                {summary.data.current_level !== null && (
                  <div className="rounded-xl border border-border-control bg-surface-container-low px-4 py-3">
                    <p className="text-[11px] font-semibold tracking-wide text-text-muted">
                      Tingkat Sanksi
                    </p>
                    <p className="text-sm font-bold text-pine-deep">
                      {summary.data.current_level.level ?? 'Belum ada tingkatan'}
                    </p>
                    <p className="text-xs text-text-muted">{summary.data.current_level.action}</p>
                  </div>
                )}
              </div>

              {summary.data.categories.length > 0 ? (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {summary.data.categories.map((category) => (
                    <li
                      key={category.category_id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border-control bg-surface-card px-3 py-2 text-xs"
                    >
                      <span className="font-semibold text-text-primary">
                        {category.category_name}
                      </span>
                      <span className="text-text-muted">
                        {category.count}× · {category.points} poin
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-muted">
                  Belum ada catatan kedisiplinan pada rentang ini.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Riwayat Catatan</CardTitle>
          <CardDescription>{total} catatan tertulis.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {list.isPending && <Skeleton className="mx-6 my-6 h-32 w-[calc(100%-3rem)] rounded-xl" />}
          {list.isError && (
            <p className="px-6 py-6 text-sm text-rose-700">
              {portalErrorMessage(list.error, 'Daftar catatan gagal dimuat.')}
            </p>
          )}
          {rows.length > 0 && (
            <>
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low text-[11px] font-bold tracking-wide text-text-muted uppercase">
                  <tr>
                    <th className="px-6 py-3">Waktu</th>
                    <th className="px-3 py-3">Kategori</th>
                    <th className="px-3 py-3">Poin</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-6 py-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-control">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-6 py-2.5 whitespace-nowrap text-text-primary">
                        <p className="font-semibold">{formatIncidentDate(row.occurred_at)}</p>
                        <p className="font-mono text-[11px] text-text-muted">
                          {formatIncidentTime(row.occurred_at)}
                        </p>
                      </td>
                      <td className="px-3 py-2.5 text-text-primary">{row.category_name}</td>
                      <td className="px-3 py-2.5 font-bold text-rose-700">+{row.points}</td>
                      <td className="px-3 py-2.5 text-text-primary">
                        {disciplineStatusLabel(row.status)}
                      </td>
                      <td className="px-6 py-2.5 text-text-muted">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between gap-3 border-t border-border-control px-6 py-3">
                <p className="text-[11px] font-semibold text-text-muted">
                  Menampilkan {offset + 1}–{offset + rows.length} dari {total} catatan
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={offset === 0 || list.isFetching}
                    onClick={() => {
                      setOffset((prev) => Math.max(prev - PARENT_PAGE_SIZE, 0));
                    }}
                    className="cursor-pointer rounded-xl border border-border-control bg-surface-card px-3 py-1.5 text-xs font-bold text-pine-deep transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>
                  <button
                    type="button"
                    disabled={offset >= lastOffset || list.isFetching}
                    onClick={() => {
                      setOffset((prev) => Math.min(prev + PARENT_PAGE_SIZE, lastOffset));
                    }}
                    className="cursor-pointer rounded-xl border border-border-control bg-surface-card px-3 py-1.5 text-xs font-bold text-pine-deep transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
