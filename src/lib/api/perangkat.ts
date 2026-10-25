import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, apiPost, apiPut } from '@/lib/api/client';
import type { QueryParams } from '@/lib/api/client';
import type { DataList } from '@/lib/api/dto';

export type DeviceStatus = 'active' | 'inactive';

export type DeviceType = 'rfid_reader' | 'gate' | 'tablet' | 'other';

/** Device record returned by the registry endpoints. */
export type Device = {
  id: string;
  name: string;
  identifier: string;
  device_type: DeviceType;
  location?: string | null;
  notes?: string | null;
  status: DeviceStatus;
  last_seen_at?: string | null;
  created_at: string;
  updated_at: string;
};

/** GET /devices filters. */
export type DeviceFilter = {
  status?: DeviceStatus;
  type?: DeviceType;
};

/** Create/edit form draft. */
export type DeviceDraft = {
  name: string;
  identifier: string;
  deviceType: DeviceType;
  location?: string;
  notes?: string;
};

/** POST/PUT /devices body. */
export type DevicePayload = {
  name: string;
  identifier: string;
  device_type: DeviceType;
  location?: string;
  notes?: string;
};

export const deviceKeys = {
  root: ['perangkat'] as const,
  list: (filter?: DeviceFilter) => ['perangkat', 'devices', filter ?? {}] as const,
};

export const deviceTypeOptions = [
  { value: 'rfid_reader', label: 'Pembaca RFID' },
  { value: 'gate', label: 'Gerbang' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'other', label: 'Lainnya' },
] as const satisfies readonly { value: DeviceType; label: string }[];

/**
 * Human label for a device type.
 * @param type - Backend device type.
 * @returns Indonesian label; unknown values pass through.
 */
export const deviceTypeLabel = (type: string): string =>
  deviceTypeOptions.find((option) => option.value === type)?.label ?? type;

/**
 * Human label for a device status.
 * @param status - Backend status.
 * @returns Indonesian label; unknown values pass through.
 */
export const deviceStatusLabel = (status: string): string => {
  if (status === 'active') {
    return 'Aktif';
  }
  if (status === 'inactive') {
    return 'Nonaktif';
  }
  return status;
};

/**
 * Human label for the last tap time.
 * @param value - ISO timestamp or null when the device never reported.
 * @returns Formatted timestamp, or "Belum pernah".
 */
export const lastSeenLabel = (value?: string | null): string => {
  if (value === undefined || value === null || value.trim() === '') {
    return 'Belum pernah';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

/**
 * Builds the GET /devices query string.
 * @param filter - Status and type filters.
 * @returns Query params containing only the active filters.
 */
export const buildDeviceQuery = (filter?: DeviceFilter): QueryParams => ({
  ...(filter?.status === undefined ? {} : { status: filter.status }),
  ...(filter?.type === undefined ? {} : { type: filter.type }),
});

const optionalText = (value?: string): string | undefined => {
  const trimmed = value?.trim() ?? '';
  return trimmed === '' ? undefined : trimmed;
};

const requireText = (value: string, message: string): string => {
  const trimmed = value.trim();
  if (trimmed === '') {
    throw new Error(message);
  }
  return trimmed;
};

/**
 * Builds the POST/PUT /devices body from the form draft.
 * @param draft - Create/edit form values.
 * @returns Validated device payload.
 */
export const buildDevicePayload = (draft: DeviceDraft): DevicePayload => {
  const location = optionalText(draft.location);
  const notes = optionalText(draft.notes);

  return {
    name: requireText(draft.name, 'Nama perangkat wajib diisi.'),
    identifier: requireText(draft.identifier, 'Identifier perangkat wajib diisi.'),
    device_type: draft.deviceType,
    ...(location === undefined ? {} : { location }),
    ...(notes === undefined ? {} : { notes }),
  };
};

/**
 * GET /devices.
 * @param filter - Status and type filters.
 * @returns Device records.
 */
export const fetchDevices = async (filter?: DeviceFilter): Promise<Device[]> => {
  const result = await apiGet<DataList<Device>>('/devices', buildDeviceQuery(filter));
  return result.data;
};

/**
 * POST /devices.
 * @param payload - Create payload.
 * @returns Created device.
 */
export const createDevice = async (payload: DevicePayload): Promise<Device> => {
  const result = await apiPost<{ device: Device }>('/devices', payload);
  return result.device;
};

/**
 * PUT /devices/:id.
 * @param deviceId - Device id.
 * @param payload - Update payload.
 * @returns Updated device.
 */
export const updateDevice = async (deviceId: string, payload: DevicePayload): Promise<Device> => {
  const result = await apiPut<{ device: Device }>(
    `/devices/${encodeURIComponent(deviceId)}`,
    payload,
  );
  return result.device;
};

/**
 * PATCH /devices/:id/status.
 * @param deviceId - Device id.
 * @param status - Target status.
 * @returns Updated device.
 */
export const updateDeviceStatus = async (
  deviceId: string,
  status: DeviceStatus,
): Promise<Device> => {
  const result = await apiPatch<{ device: Device }>(
    `/devices/${encodeURIComponent(deviceId)}/status`,
    { status },
  );
  return result.device;
};

export const deviceListOptions = (filter?: DeviceFilter) =>
  queryOptions({
    queryKey: deviceKeys.list(filter),
    queryFn: async () => await fetchDevices(filter),
  });

/**
 * GET /devices → filtered device list.
 * @param filter - Status and type filters.
 * @param enabled - Skip the request until the caller is allowed to read devices.
 * @returns React Query result with `Device[]`.
 */
export const useDeviceList = (filter?: DeviceFilter, enabled = true) =>
  useQuery({ ...deviceListOptions(filter), enabled });

export type UpdateDeviceVariables = DevicePayload & { deviceId: string };

export type UpdateDeviceStatusVariables = { deviceId: string; status: DeviceStatus };

/**
 * POST /devices.
 * @returns Mutation over `DevicePayload`.
 */
export const useCreateDevice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: DevicePayload) => await createDevice(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deviceKeys.root });
    },
  });
};

/**
 * PUT /devices/:id.
 * @returns Mutation over `UpdateDeviceVariables`.
 */
export const useUpdateDevice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ deviceId, ...payload }: UpdateDeviceVariables) =>
      await updateDevice(deviceId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deviceKeys.root });
    },
  });
};

/**
 * PATCH /devices/:id/status.
 * @returns Mutation over `UpdateDeviceStatusVariables`.
 */
export const useUpdateDeviceStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ deviceId, status }: UpdateDeviceStatusVariables) =>
      await updateDeviceStatus(deviceId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deviceKeys.root });
    },
  });
};
