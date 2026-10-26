'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  dispensationDateLabel,
  dispensationStatusLabel,
  dispensationTypeLabel,
} from '@/lib/api/murid';
import { PARENT_PAGE_SIZE, portalErrorMessage, useParentDispensations } from '@/lib/api/parent';

/**
 * Dispensation list of one linked child (GET /parent/children/:id/dispensations).
 * The backend read has no date filter, so only paging is offered here.
 *
 * @param props - Section inputs.
 * @param props.childId - Selected linked student id.
 * @returns Dispensation table element.
 */
export function ParentDispensationSection(props: { childId: string }) {
  const [offset, setOffset] = useState(0);
  const list = useParentDispensations(props.childId, { limit: PARENT_PAGE_SIZE, offset });
  const rows = list.data?.data ?? [];
  const total = list.data?.total ?? 0;
  const lastOffset = Math.max(Math.ceil(total / PARENT_PAGE_SIZE) - 1, 0) * PARENT_PAGE_SIZE;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Riwayat Dispensasi</CardTitle>
        <CardDescription>
          Sakit, izin, dan dispensasi lainnya yang tercatat untuk ananda ({total} data).
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        {list.isPending && <Skeleton className="mx-6 my-6 h-32 w-[calc(100%-3rem)] rounded-xl" />}
        {list.isError && (
          <p className="px-6 py-6 text-sm text-rose-700">
            {portalErrorMessage(list.error, 'Daftar dispensasi gagal dimuat.')}
          </p>
        )}
        {!list.isPending && !list.isError && rows.length === 0 && (
          <p className="px-6 py-6 text-sm text-text-muted">
            Belum ada dispensasi yang tercatat untuk ananda.
          </p>
        )}
        {rows.length > 0 && (
          <>
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-[11px] font-bold tracking-wide text-text-muted uppercase">
                <tr>
                  <th className="px-6 py-3">Tipe</th>
                  <th className="px-3 py-3">Tanggal</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-6 py-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-control">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-6 py-2.5 font-semibold whitespace-nowrap text-text-primary">
                      {dispensationTypeLabel(row.type)}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-text-primary">
                      {dispensationDateLabel(row)}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-text-primary">
                      {dispensationStatusLabel(row.status)}
                    </td>
                    <td className="px-6 py-2.5 text-text-muted">
                      <p>{row.reason}</p>
                      {row.note !== null && row.note !== '' && (
                        <p className="mt-1 text-[11px] text-text-muted italic">
                          Catatan: {row.note}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between gap-3 border-t border-border-control px-6 py-3">
              <p className="text-[11px] font-semibold text-text-muted">
                Menampilkan {offset + 1}–{offset + rows.length} dari {total} dispensasi
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
  );
}
