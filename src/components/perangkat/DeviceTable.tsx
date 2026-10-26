'use client';

import { Cpu, KeyRound, Loader2, Pencil, Power, PowerOff } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Device } from '@/lib/api/perangkat';
import { deviceStatusLabel, deviceTypeLabel, lastSeenLabel } from '@/lib/api/perangkat';

const statusBadgeClass = (isActive: boolean): string =>
  isActive
    ? 'border-emerald-300 bg-emerald-100 text-emerald-900'
    : 'border-amber-300 bg-amber-100 text-amber-900';

const statusDotClass = (isActive: boolean): string =>
  isActive ? 'bg-emerald-600' : 'bg-amber-600';

const toggleButtonClass = (isActive: boolean): string =>
  isActive
    ? 'text-text-muted hover:bg-amber-50 hover:text-amber-700'
    : 'text-amber-700 hover:bg-emerald-50 hover:text-emerald-700';

/**
 * Device table with loading / error / empty states and admin row actions.
 *
 * @param props - Table data, state, and action callbacks.
 * @param props.devices - Device records.
 * @param props.isLoading - Shows the loading row.
 * @param props.errorMessage - Shows an error row when non-null.
 * @param props.canManage - Whether write actions are rendered.
 * @param props.onEdit - Opens the edit modal.
 * @param props.onToggleStatus - Opens the activate/deactivate confirmation.
 * @param props.onRotateToken - Opens the ingest-token rotation confirmation.
 * @returns Table element.
 */
export function DeviceTable(props: {
  devices: Device[];
  isLoading: boolean;
  errorMessage: string | null;
  canManage: boolean;
  onEdit: (device: Device) => void;
  onToggleStatus: (device: Device) => void;
  onRotateToken: (device: Device) => void;
}) {
  const renderBody = (): ReactNode => {
    if (props.isLoading) {
      return (
        <tr>
          <td colSpan={6} className="p-10 text-center text-text-muted">
            <span className="inline-flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" /> Memuat data perangkat…
            </span>
          </td>
        </tr>
      );
    }
    if (props.errorMessage !== null) {
      return (
        <tr>
          <td colSpan={6} className="p-10 text-center text-sm text-rose-700">
            {props.errorMessage}
          </td>
        </tr>
      );
    }
    if (props.devices.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="p-10 text-center text-text-muted">
            <div className="flex flex-col items-center gap-2">
              <Cpu className="size-8 text-text-muted/60" />
              <p className="text-sm font-semibold">Belum ada perangkat pada filter ini.</p>
              <p className="text-xs">Ubah filter atau tambahkan perangkat baru untuk memulai.</p>
            </div>
          </td>
        </tr>
      );
    }
    return props.devices.map((device) => {
      const isActive = device.status === 'active';
      return (
        <tr key={device.id} className="group transition-colors hover:bg-surface-container-low/60">
          {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label -- table cell, not a control */}
          <td className="p-3.5">
            <div className="flex flex-col">
              <span className="font-bold text-text-primary">{device.name}</span>
              <span className="text-[11px] text-text-muted">
                {device.location?.trim() === '' ||
                device.location === undefined ||
                device.location === null
                  ? 'Lokasi belum diisi'
                  : device.location}
              </span>
            </div>
          </td>
          <td className="p-3.5">
            <span className="inline-flex rounded-lg bg-surface-container-low px-2 py-0.5 font-mono text-[11px] font-semibold text-pine-deep">
              {device.identifier}
            </span>
          </td>
          <td className="p-3.5 text-xs font-medium text-text-primary">
            {deviceTypeLabel(device.device_type)}
          </td>
          <td className="p-3.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusBadgeClass(isActive)}`}
            >
              <span className={`size-1.5 rounded-full ${statusDotClass(isActive)}`} />
              {deviceStatusLabel(device.status)}
            </span>
          </td>
          <td className="p-3.5 text-xs font-medium text-text-primary">
            {lastSeenLabel(device.last_seen_at)}
          </td>
          <td className="p-3.5">
            <div className="flex items-center justify-center gap-1.5">
              {props.canManage && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      props.onEdit(device);
                    }}
                    title="Edit perangkat"
                    aria-label={`Edit perangkat ${device.name}`}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-lg bg-surface-container-low text-text-muted transition-colors hover:bg-surface-container hover:text-pine-deep"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      props.onToggleStatus(device);
                    }}
                    title={isActive ? 'Nonaktifkan perangkat' : 'Aktifkan perangkat'}
                    aria-label={`${isActive ? 'Nonaktifkan' : 'Aktifkan'} perangkat ${device.name}`}
                    className={`flex size-8 cursor-pointer items-center justify-center rounded-lg bg-surface-container-low transition-colors ${toggleButtonClass(isActive)}`}
                  >
                    {isActive ? <PowerOff className="size-4" /> : <Power className="size-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      props.onRotateToken(device);
                    }}
                    title="Rotasi token ingest"
                    aria-label={`Rotasi token ingest perangkat ${device.name}`}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-lg bg-surface-container-low text-text-muted transition-colors hover:bg-surface-container hover:text-pine-deep"
                  >
                    <KeyRound className="size-4" />
                  </button>
                </>
              )}
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border-control bg-pine-light/50 font-semibold text-pine-deep">
            <th scope="col" className="p-3.5 whitespace-nowrap">
              Perangkat
            </th>
            <th scope="col" className="p-3.5 whitespace-nowrap">
              Identifier
            </th>
            <th scope="col" className="p-3.5 whitespace-nowrap">
              Tipe
            </th>
            <th scope="col" className="p-3.5 whitespace-nowrap">
              Status
            </th>
            <th scope="col" className="p-3.5 whitespace-nowrap">
              Terakhir terlihat
            </th>
            <th scope="col" className="p-3.5 text-center whitespace-nowrap">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle text-text-primary">{renderBody()}</tbody>
      </table>
    </div>
  );
}
