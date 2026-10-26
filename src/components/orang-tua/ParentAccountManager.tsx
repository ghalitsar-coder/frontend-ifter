'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { AttendanceConfirmDialog } from '@/components/presensi/AttendanceConfirmDialog';
import type { ConfirmRequest } from '@/components/presensi/AttendanceConfirmDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ApiError } from '@/lib/api/client';
import type { CredentialIssue, UserSummary } from '@/lib/api/dto';
import {
  statusLabel,
  useCreateParentAccount,
  useResetParentCredential,
  useUserList,
  useUserRoles,
} from '@/lib/api/parent';
import type { UserListParams } from '@/lib/api/parent';
import { can, ROLE_PARENT } from '@/lib/api/rbac';
import { ParentAccountCreateModal } from './ParentAccountCreateModal';
import { ParentAccountTable } from './ParentAccountTable';
import { ParentChildrenModal } from './ParentChildrenModal';
import { ParentInviteTokenModal } from './ParentInviteTokenModal';

const ADMIN_PAGE_SIZE = 20;

const STATUS_FILTERS = ['all', 'pending', 'active', 'inactive', 'locked'] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];

type TokenShown = { accountName: string; credential: CredentialIssue };

const errorText = (error: unknown): string =>
  error instanceof ApiError ? error.message : 'Terjadi kesalahan tak terduga.';

/**
 * Maps a `<select>` value onto the known status filters, ignoring anything else.
 * @param value - Raw `event.target.value`.
 * @returns Matching filter, or `all` for an unknown value.
 */
const statusFilterOf = (value: string): StatusFilter =>
  STATUS_FILTERS.find((entry) => entry === value) ?? 'all';

/**
 * Admin parent-account workspace (`/dashboard/akun-orang-tua`): list the login
 * accounts, create parent accounts with a one-time activation token, reset
 * credentials, and link children. Write controls are hidden for other roles;
 * the backend enforces the same admin-only groups.
 *
 * @returns Account management JSX.
 */
export function ParentAccountManager() {
  const { roles } = useAuth();
  const isAdmin = can(roles, 'admin');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [onlyParents, setOnlyParents] = useState(false);
  const [offset, setOffset] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [childrenUser, setChildrenUser] = useState<UserSummary | null>(null);
  const [pendingReset, setPendingReset] = useState<UserSummary | null>(null);
  const [tokenShown, setTokenShown] = useState<TokenShown | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const listParams: UserListParams = {
    limit: ADMIN_PAGE_SIZE,
    offset,
    ...(statusFilter === 'all' ? {} : { status: statusFilter }),
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const listQuery = useUserList(listParams, isAdmin);
  const rows = listQuery.data?.data ?? [];
  const total = listQuery.data?.total ?? 0;
  const rolesMap = useUserRoles(rows.map((row) => row.id));
  const visibleRows = onlyParents
    ? rows.filter((row) => (rolesMap.data?.[row.id] ?? []).includes(ROLE_PARENT))
    : rows;

  const createMutation = useCreateParentAccount();
  const resetMutation = useResetParentCredential();

  const confirmReset = () => {
    if (pendingReset === null || resetMutation.isPending) {
      return;
    }
    const user = pendingReset;
    resetMutation.mutate(user.id, {
      onSuccess: (credential) => {
        setPendingReset(null);
        setTokenShown({ accountName: user.full_name, credential });
      },
      onError: (error) => {
        setPendingReset(null);
        showToast(errorText(error));
      },
    });
  };

  const confirmRequest: ConfirmRequest | null =
    pendingReset === null
      ? null
      : {
          message: `Terbitkan token akses baru untuk ${pendingReset.full_name}? Token lama berhenti bekerja dan orang tua harus masuk ulang dengan token baru.`,
          confirmLabel: 'Terbitkan Token',
          onConfirm: confirmReset,
        };

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Halaman ini hanya terbuka untuk administrator. Hubungi admin sekolah untuk membuat atau
          menautkan akun orang tua.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="flex size-2 animate-pulse rounded-full bg-emerald-600" />
            <span className="font-mono text-xs font-semibold tracking-wider text-pine-deep uppercase">
              Konfigurasi Sistem • Akun
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-pine-deep sm:text-3xl">
            Akun Orang Tua
          </h1>
          <p className="text-sm text-text-muted">
            Buat akun portal, terbitkan token akses, dan tautkan akun ke data siswa.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setCreateOpen(true);
          }}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-pine-deep px-4 py-2 text-xs font-bold tracking-wide text-white shadow-sm transition-colors hover:bg-pine-hover sm:text-sm"
        >
          <Plus className="size-4 text-amber-gold" />
          <span>Buat Akun Orang Tua</span>
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border-control bg-surface-card p-4 shadow-xs">
        <label className="flex flex-col gap-1 text-[11px] font-semibold text-text-muted">
          Status akun
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(statusFilterOf(event.target.value));
              setOffset(0);
            }}
            className="h-9 cursor-pointer rounded-xl border border-border-control bg-surface-card px-2 text-xs font-bold text-pine-deep focus:outline-none"
          >
            {STATUS_FILTERS.map((value) => (
              <option key={value} value={value}>
                {value === 'all' ? 'Semua status' : statusLabel(value)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-pine-deep">
          <input
            type="checkbox"
            checked={onlyParents}
            onChange={(event) => {
              setOnlyParents(event.target.checked);
            }}
            className="size-4 cursor-pointer accent-pine-deep"
          />
          Hanya akun orang tua
          {/* GET /users returns no roles, so the role check only sees this page. */}
          <span className="font-semibold text-text-muted">(halaman ini)</span>
        </label>

        <p className="ml-auto text-[11px] font-semibold text-text-muted">
          {total} akun dengan filter status ini
        </p>
      </div>

      <ParentAccountTable
        rows={visibleRows}
        roleCodesByUser={rolesMap.data ?? {}}
        isPending={listQuery.isPending}
        isError={listQuery.isError}
        errorText={errorText(listQuery.error)}
        total={total}
        pageSize={ADMIN_PAGE_SIZE}
        offset={offset}
        isFetching={listQuery.isFetching}
        onOffsetChange={setOffset}
        onManageChildren={(user) => {
          setChildrenUser(user);
        }}
        onIssueToken={(user) => {
          setPendingReset(user);
        }}
      />

      {createOpen && (
        <ParentAccountCreateModal
          onClose={() => {
            setCreateOpen(false);
          }}
          onCreated={(accountName, credential) => {
            setCreateOpen(false);
            setTokenShown({ accountName, credential });
            showToast(`Akun ${accountName} dibuat.`);
          }}
        />
      )}

      {childrenUser !== null && (
        <ParentChildrenModal
          key={childrenUser.id}
          userId={childrenUser.id}
          accountName={childrenUser.full_name}
          onClose={() => {
            setChildrenUser(null);
          }}
          onSaved={(message) => {
            setChildrenUser(null);
            showToast(message);
          }}
        />
      )}

      {tokenShown !== null && (
        <ParentInviteTokenModal
          accountName={tokenShown.accountName}
          credential={tokenShown.credential}
          onClose={() => {
            setTokenShown(null);
            // Drop the plaintext token from the mutation caches too.
            createMutation.reset();
            resetMutation.reset();
          }}
        />
      )}

      <AttendanceConfirmDialog
        request={confirmRequest}
        onCancel={() => {
          setPendingReset(null);
        }}
      />

      {toast !== null && (
        <output className="fixed right-4 bottom-4 z-[60] max-w-sm rounded-xl bg-pine-deep px-4 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </output>
      )}
    </div>
  );
}
