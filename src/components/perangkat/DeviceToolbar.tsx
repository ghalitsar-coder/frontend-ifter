'use client';

import { ChevronDown, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';
import type { DeviceStatus, DeviceType } from '@/lib/api/perangkat';
import { deviceTypeOptions } from '@/lib/api/perangkat';

const selectClass =
  'bg-surface-card text-text-primary h-9 cursor-pointer appearance-none rounded-xl border border-border-control pr-8 pl-3.5 text-xs font-medium shadow-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm';

const parseStatus = (value: string): 'all' | DeviceStatus => {
  if (value === 'active' || value === 'inactive') {
    return value;
  }
  return 'all';
};

const parseType = (value: string): 'all' | DeviceType => {
  const match = deviceTypeOptions.find((type) => type.value === value);
  return match?.value ?? 'all';
};

/**
 * Small labelled select wrapper for the filter bar.
 * @param props - Select value, change handler, aria label, and options.
 * @returns Styled select with a chevron.
 */
function FilterSelect(props: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={props.value}
        onChange={(event) => {
          props.onChange(event.target.value);
        }}
        aria-label={props.ariaLabel}
        className={selectClass}
      >
        {props.children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-text-muted" />
    </div>
  );
}

/**
 * Filter toolbar for the device registry (status and type).
 *
 * @param props - Filter values and callbacks.
 * @param props.statusFilter - Selected status or `all`.
 * @param props.typeFilter - Selected device type or `all`.
 * @param props.hasActiveFilters - Whether the reset button is shown.
 * @param props.shownCount - Number of rendered devices.
 * @param props.onStatusChange - Status change handler.
 * @param props.onTypeChange - Device type change handler.
 * @param props.onReset - Resets every filter.
 * @returns Filter toolbar.
 */
export function DeviceToolbar(props: {
  statusFilter: 'all' | DeviceStatus;
  typeFilter: 'all' | DeviceType;
  hasActiveFilters: boolean;
  shownCount: number;
  onStatusChange: (value: 'all' | DeviceStatus) => void;
  onTypeChange: (value: 'all' | DeviceType) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border-control bg-surface-card p-4 shadow-xs sm:p-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <FilterSelect
          value={props.statusFilter}
          onChange={(value) => {
            props.onStatusChange(parseStatus(value));
          }}
          ariaLabel="Filter status perangkat"
        >
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </FilterSelect>

        <FilterSelect
          value={props.typeFilter}
          onChange={(value) => {
            props.onTypeChange(parseType(value));
          }}
          ariaLabel="Filter tipe perangkat"
        >
          <option value="all">Semua Tipe</option>
          {deviceTypeOptions.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </FilterSelect>

        {props.hasActiveFilters && (
          <button
            type="button"
            onClick={props.onReset}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:text-text-primary"
          >
            <RefreshCw className="size-3.5" />
            Reset filter
          </button>
        )}

        <span className="ml-auto text-xs text-text-muted">
          Menampilkan {props.shownCount} perangkat
        </span>
      </div>
    </div>
  );
}
