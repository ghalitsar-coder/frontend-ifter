'use client';

import { KeyRound, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserSummary } from '@/lib/api/dto';
import { statusLabel, userRoleLabel } from '@/lib/api/parent';

const emailOf = (user: UserSummary): string =>
  user.email === undefined || user.email === '' ? '—' : user.email;

const roleText = (codes: string[] | undefined): string =>
  codes === undefined || codes.length === 0 ? '—' : codes.map(userRoleLabel).join(', ');

/**
 * Account table of the admin parent-account page: one row per login account
 * with its resolved roles and the two write actions, plus paging controls.
 *
 * @param props - Page rows, resolved role codes, query state, and action hooks.
 * @returns Table card JSX.
 */
export function ParentAccountTable(props: {
  rows: UserSummary[];
  roleCodesByUser: Record<string, string[]>;
  isPending: boolean;
  isError: boolean;
  errorText: string;
  total: number;
  pageSize: number;
  offset: number;
  isFetching: boolean;
  onOffsetChange: (offset: number) => void;
  onManageChildren: (user: UserSummary) => void;
  onIssueToken: (user: UserSummary) => void;
}) {
  const lastOffset = Math.max(Math.ceil(props.total / props.pageSize) - 1, 0) * props.pageSize;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border-control bg-surface-card p-4 shadow-xs sm:p-5">
      {props.isPending && <Skeleton className="h-40 w-full rounded-xl" />}
      {props.isError && <p className="text-sm text-rose-700">{props.errorText}</p>}
      {!props.isPending && !props.isError && props.rows.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Users className="size-8 text-text-muted/60" />
          <p className="text-sm font-semibold text-text-muted">Tidak ada akun pada halaman ini.</p>
        </div>
      )}
      {props.rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-[11px] font-bold tracking-wide text-text-muted uppercase">
              <tr>
                <th className="px-4 py-3">Akun</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Peran</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-control">
              {props.rows.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-2.5">
                    <p className="font-semibold text-text-primary">{user.full_name}</p>
                    <p className="font-mono text-[11px] text-text-muted">{user.username}</p>
                  </td>
                  <td className="px-4 py-2.5 text-text-muted">{emailOf(user)}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-text-primary">
                    {statusLabel(user.status)}
                  </td>
                  <td className="px-4 py-2.5 text-text-primary">
                    {roleText(props.roleCodesByUser[user.id])}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          props.onManageChildren(user);
                        }}
                        aria-label={`Kelola anak ${user.full_name}`}
                        className="flex size-9 cursor-pointer items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-pine-light hover:text-pine-deep"
                      >
                        <Users className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          props.onIssueToken(user);
                        }}
                        aria-label={`Terbitkan token akses ${user.full_name}`}
                        className="flex size-9 cursor-pointer items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-amber-50 hover:text-amber-700"
                      >
                        <KeyRound className="size-4" />
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
          Menampilkan {props.rows.length} dari {props.total} akun
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={props.offset === 0 || props.isFetching}
            onClick={() => {
              props.onOffsetChange(Math.max(props.offset - props.pageSize, 0));
            }}
            className="cursor-pointer rounded-xl border border-border-control bg-surface-card px-3 py-1.5 text-xs font-bold text-pine-deep transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sebelumnya
          </button>
          <button
            type="button"
            disabled={props.offset >= lastOffset || props.isFetching}
            onClick={() => {
              props.onOffsetChange(Math.min(props.offset + props.pageSize, lastOffset));
            }}
            className="cursor-pointer rounded-xl border border-border-control bg-surface-card px-3 py-1.5 text-xs font-bold text-pine-deep transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
}
