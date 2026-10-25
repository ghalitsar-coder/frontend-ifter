'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { AttendanceConfirmDialog } from '@/components/presensi/AttendanceConfirmDialog';
import type { ConfirmRequest } from '@/components/presensi/AttendanceConfirmDialog';
import { ApiError } from '@/lib/api/client';
import type { Device, DeviceFilter, DeviceStatus, DeviceType } from '@/lib/api/perangkat';
import { useDeviceList, useUpdateDeviceStatus } from '@/lib/api/perangkat';
import { can } from '@/lib/api/rbac';
import { DeviceFormModal } from './DeviceFormModal';
import { DeviceTable } from './DeviceTable';
import { DeviceToolbar } from './DeviceToolbar';

type PendingStatus = { device: Device; status: DeviceStatus };

type FormState = { mode: 'create' } | { mode: 'edit'; device: Device };

const errorText = (error: unknown): string =>
  error instanceof ApiError ? error.message : 'Terjadi kesalahan tak terduga.';

const buildConfirmRequest = (
  pending: PendingStatus | null,
  onConfirm: () => void,
): ConfirmRequest | null => {
  if (pending === null) {
    return null;
  }
  const deactivating = pending.status === 'inactive';
  return {
    message: deactivating
      ? `Nonaktifkan perangkat ${pending.device.name}? Perangkat nonaktif tidak menerima tap RFID sampai diaktifkan kembali.`
      : `Aktifkan kembali perangkat ${pending.device.name}?`,
    confirmLabel: deactivating ? 'Nonaktifkan' : 'Aktifkan',
    onConfirm,
  };
};

/**
 * Device registry workspace: filters (status, type), device table,
 * create/edit modal, and activate/deactivate actions. The backend endpoints
 * are admin-only; write controls are hidden for other roles.
 *
 * @returns Device registry page content.
 */
export function DeviceManager() {
  const { roles } = useAuth();
  const canManage = can(roles, 'admin');
  const [statusFilter, setStatusFilter] = useState<'all' | DeviceStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | DeviceType>('all');
  const [formState, setFormState] = useState<FormState | null>(null);
  const [pendingStatus, setPendingStatus] = useState<PendingStatus | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const filter: DeviceFilter = {
    ...(statusFilter === 'all' ? {} : { status: statusFilter }),
    ...(typeFilter === 'all' ? {} : { type: typeFilter }),
  };

  const listQuery = useDeviceList(filter, canManage);
  const devices = listQuery.data ?? [];
  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all';
  const statusMutation = useUpdateDeviceStatus();

  const confirmStatusChange = () => {
    if (pendingStatus === null || statusMutation.isPending) {
      return;
    }
    const { device, status } = pendingStatus;
    statusMutation.mutate(
      { deviceId: device.id, status },
      {
        onSuccess: () => {
          showToast(
            status === 'inactive'
              ? `Perangkat ${device.name} dinonaktifkan.`
              : `Perangkat ${device.name} diaktifkan kembali.`,
          );
          setPendingStatus(null);
        },
        onError: (error) => {
          showToast(errorText(error));
        },
      },
    );
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
  };

  const toggleStatus = (device: Device) => {
    setPendingStatus({
      device,
      status: device.status === 'active' ? 'inactive' : 'active',
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="flex size-2 animate-pulse rounded-full bg-emerald-600" />
            <span className="font-mono text-xs font-semibold tracking-wider text-pine-deep uppercase">
              Konfigurasi Sistem • Perangkat
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-pine-deep sm:text-3xl">
            Registry Perangkat
          </h1>
          <p className="text-sm text-text-muted">
            Kelola pembaca RFID, gerbang, dan tablet yang terhubung ke sekolah.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => {
              setFormState({ mode: 'create' });
            }}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-pine-deep px-4 py-2 text-xs font-bold tracking-wide text-white shadow-sm transition-colors hover:bg-pine-hover sm:text-sm"
          >
            <Plus className="size-4 text-amber-gold" />
            <span>Tambah Perangkat</span>
          </button>
        )}
      </div>

      <DeviceToolbar
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        hasActiveFilters={hasActiveFilters}
        shownCount={devices.length}
        onStatusChange={setStatusFilter}
        onTypeChange={setTypeFilter}
        onReset={resetFilters}
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-border-control bg-surface-card p-4 shadow-xs sm:p-5">
        <DeviceTable
          devices={devices}
          isLoading={listQuery.isLoading}
          errorMessage={listQuery.isError ? errorText(listQuery.error) : null}
          canManage={canManage}
          onEdit={(device) => {
            setFormState({ mode: 'edit', device });
          }}
          onToggleStatus={toggleStatus}
        />
      </div>

      {formState !== null && (
        <DeviceFormModal
          key={formState.mode === 'edit' ? formState.device.id : 'create'}
          mode={formState.mode}
          {...(formState.mode === 'edit' ? { device: formState.device } : {})}
          onClose={() => {
            setFormState(null);
          }}
          onSaved={(message) => {
            setFormState(null);
            showToast(message);
          }}
        />
      )}

      <AttendanceConfirmDialog
        request={buildConfirmRequest(pendingStatus, confirmStatusChange)}
        onCancel={() => {
          setPendingStatus(null);
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
