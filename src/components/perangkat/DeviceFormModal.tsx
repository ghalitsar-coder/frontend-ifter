'use client';

import { Cpu, Loader2, X } from 'lucide-react';
import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { ApiError } from '@/lib/api/client';
import type { Device, DeviceType } from '@/lib/api/perangkat';
import {
  buildDevicePayload,
  deviceTypeOptions,
  useCreateDevice,
  useUpdateDevice,
} from '@/lib/api/perangkat';

type FormValues = {
  name: string;
  identifier: string;
  deviceType: DeviceType;
  location: string;
  notes: string;
};

const initialValues = (device: Device | undefined): FormValues => ({
  name: device?.name ?? '',
  identifier: device?.identifier ?? '',
  deviceType: device?.device_type ?? 'rfid_reader',
  location: device?.location ?? '',
  notes: device?.notes ?? '',
});

const errorText = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.status === 409
      ? 'Identifier sudah dipakai perangkat lain. Gunakan identifier berbeda.'
      : error.message;
  }
  return 'Terjadi kesalahan tak terduga.';
};

/**
 * Create/edit modal for a device (name, identifier, type, location, notes).
 *
 * @param props - Modal inputs and callbacks.
 * @param props.mode - Whether the form creates or edits a device.
 * @param props.device - Source device record when editing.
 * @param props.onClose - Closes the modal.
 * @param props.onSaved - Receives the toast message, plus the one-time ingest token and device name on create.
 * @returns Modal overlay.
 */
export function DeviceFormModal(props: {
  mode: 'create' | 'edit';
  device?: Device;
  onClose: () => void;
  onSaved: (message: string, ingestToken?: string, deviceName?: string) => void;
}) {
  const initial = initialValues(props.device);
  const [name, setName] = useState(initial.name);
  const [identifier, setIdentifier] = useState(initial.identifier);
  const [deviceType, setDeviceType] = useState<DeviceType>(initial.deviceType);
  const [location, setLocation] = useState(initial.location);
  const [notes, setNotes] = useState(initial.notes);
  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreateDevice();
  const updateMutation = useUpdateDevice();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isEdit = props.mode === 'edit' && props.device !== undefined;

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const payload = buildDevicePayload({ name, identifier, deviceType, location, notes });
      if (props.mode === 'edit' && props.device !== undefined) {
        updateMutation.mutate(
          { deviceId: props.device.id, ...payload },
          {
            onSuccess: () => {
              props.onSaved(`Perangkat ${payload.name} berhasil diperbarui.`);
            },
            onError: (mutationError) => {
              setError(errorText(mutationError));
            },
          },
        );
        return;
      }
      createMutation.mutate(payload, {
        onSuccess: (result) => {
          props.onSaved(
            `Perangkat ${payload.name} berhasil ditambahkan.`,
            result.ingest_token,
            payload.name,
          );
        },
        onError: (mutationError) => {
          setError(errorText(mutationError));
        },
      });
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : 'Data tidak valid.');
    }
  };

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="device-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-pine-deep/60 p-3 backdrop-blur-md sm:p-6"
    >
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-surface-card shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-pine-deep via-amber-gold to-pine-deep" />
        <div className="flex items-start justify-between gap-4 border-b border-border-control px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pine-light text-pine-deep">
              <Cpu className="size-5" />
            </span>
            <div>
              <h2 id="device-form-title" className="text-lg font-bold text-pine-deep">
                {isEdit ? 'Edit Perangkat' : 'Tambah Perangkat'}
              </h2>
              <p className="text-xs text-text-muted">
                {isEdit
                  ? 'Perbarui identitas dan penempatan perangkat.'
                  : 'Daftarkan pembaca RFID, gerbang, atau tablet baru.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            aria-label="Tutup"
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-surface-container-low text-text-muted transition-colors hover:bg-surface-container hover:text-text-primary"
          >
            <X className="size-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-6"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="device-name" className="text-xs font-semibold text-text-primary">
              Nama Perangkat <span className="text-rose-600">*</span>
            </label>
            <input
              id="device-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
              }}
              maxLength={100}
              placeholder="Contoh: Reader Gerbang Utama"
              required
              className="h-10 w-full rounded-xl border border-border-control bg-surface-card px-3 text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="device-identifier"
                className="text-xs font-semibold text-text-primary"
              >
                Identifier <span className="text-rose-600">*</span>
              </label>
              <input
                id="device-identifier"
                type="text"
                value={identifier}
                onChange={(event) => {
                  setIdentifier(event.target.value);
                }}
                maxLength={64}
                placeholder="Contoh: RFID-GATE-01"
                required
                className="h-10 w-full rounded-xl border border-border-control bg-surface-card px-3 font-mono text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="device-type" className="text-xs font-semibold text-text-primary">
                Tipe <span className="text-rose-600">*</span>
              </label>
              <select
                id="device-type"
                value={deviceType}
                onChange={(event) => {
                  const selected = deviceTypeOptions.find(
                    (option) => option.value === event.target.value,
                  );
                  setDeviceType(selected?.value ?? 'other');
                }}
                className="h-10 w-full cursor-pointer rounded-xl border border-border-control bg-surface-card px-3 text-sm text-text-primary focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
              >
                {deviceTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="device-location" className="text-xs font-semibold text-text-primary">
              Lokasi <span className="font-normal text-text-muted">(opsional)</span>
            </label>
            <input
              id="device-location"
              type="text"
              value={location}
              onChange={(event) => {
                setLocation(event.target.value);
              }}
              maxLength={100}
              placeholder="Contoh: Gerbang depan"
              className="h-10 w-full rounded-xl border border-border-control bg-surface-card px-3 text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="device-notes" className="text-xs font-semibold text-text-primary">
              Catatan <span className="font-normal text-text-muted">(opsional)</span>
            </label>
            <textarea
              id="device-notes"
              value={notes}
              onChange={(event) => {
                setNotes(event.target.value);
              }}
              rows={3}
              maxLength={300}
              placeholder="Catatan teknis atau penanggung jawab perangkat."
              className="w-full resize-y rounded-xl border border-border-control bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
            />
          </div>

          {error !== null && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
            >
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={props.onClose}
              className="cursor-pointer rounded-xl border border-border-control bg-surface-card px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-container-low"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-pine-deep px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? 'Simpan Perubahan' : 'Tambah Perangkat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
