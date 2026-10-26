'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import type { DateRangeParams } from '@/lib/api/murid';
import { defaultMonthRange, portalErrorMessage, useParentChildren } from '@/lib/api/parent';
import { can } from '@/lib/api/rbac';
import { ParentAttendanceSection } from './ParentAttendanceSection';
import { ParentChildProfileSection } from './ParentChildProfileSection';
import { ParentDisciplineSection } from './ParentDisciplineSection';
import { ParentDispensationSection } from './ParentDispensationSection';

// Computed once at import so the default window is stable across renders.
const DEFAULT_RANGE = defaultMonthRange();

const TABS = [
  { key: 'kehadiran', label: 'Kehadiran' },
  { key: 'kedisiplinan', label: 'Kedisiplinan' },
  { key: 'dispensasi', label: 'Dispensasi' },
  { key: 'profil', label: 'Profil Anak' },
] as const;

type PortalTab = (typeof TABS)[number]['key'];

const tabClass = (isActive: boolean): string =>
  `cursor-pointer rounded-xl px-3 py-2 text-xs font-bold tracking-wide transition-colors sm:text-sm ${
    isActive
      ? 'bg-pine-deep text-white shadow-xs'
      : 'bg-surface-container-low text-text-muted hover:bg-pine-light hover:text-pine-deep'
  }`;

/**
 * Parent portal workspace (`/dashboard/orang-tua`) for the `parent` role: the
 * children linked to this login, then one tab per GET /parent/children/:id
 * read (attendance, discipline, dispensations, profile). No data loads before
 * a child is selected, and the staff dashboard stays unreachable for this role.
 *
 * @returns Portal JSX.
 */
export function ParentPortalManager() {
  const { roles } = useAuth();
  const childrenQuery = useParentChildren();
  const [childId, setChildId] = useState('');
  const [tab, setTab] = useState<PortalTab>('kehadiran');
  const [range, setRange] = useState<DateRangeParams>(DEFAULT_RANGE);

  if (!can(roles, 'parent_portal')) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Portal ini hanya terbuka untuk akun dengan peran orang tua. Masuk dengan akun orang tua
          yang sudah dibuatkan administrator.
        </AlertDescription>
      </Alert>
    );
  }

  const children = childrenQuery.data ?? [];
  // Revalidate the selection against the current link list so an unlinked child
  // never keeps firing queries with its old id.
  const isSelectedLinked = children.some((child) => child.student_id === childId);
  const selectedId = isSelectedLinked ? childId : (children[0]?.student_id ?? '');
  const selected = children.find((child) => child.student_id === selectedId);
  const showRange = tab === 'kehadiran' || tab === 'kedisiplinan';

  if (childrenQuery.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (childrenQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {portalErrorMessage(childrenQuery.error, 'Daftar anak gagal dimuat.')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs font-semibold tracking-wider text-pine-deep uppercase">
          Portal Orang Tua
        </span>
        <h1 className="text-2xl font-black tracking-tight text-pine-deep sm:text-3xl">
          Pantau Ananda
        </h1>
        <p className="text-sm text-text-muted">
          Rekap kehadiran, catatan kedisiplinan, dan dispensasi siswa yang tertaut ke akun ini.
        </p>
      </div>

      {children.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-control bg-surface-card p-6 text-sm text-text-muted">
          Belum ada siswa yang tertaut ke akun ini. Hubungi administrator atau bagian Tata Usaha
          sekolah agar akun Anda ditautkan ke data ananda.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-2xl border border-border-control bg-surface-card p-4 shadow-xs">
            <label className="flex flex-col gap-1.5 text-xs font-bold text-pine-deep sm:flex-row sm:items-center sm:gap-3">
              <span className="shrink-0">Anak</span>
              <select
                value={selectedId}
                onChange={(event) => {
                  setChildId(event.target.value);
                }}
                className="min-w-0 flex-1 rounded-xl border border-border-control bg-surface-card px-3 py-2 text-sm font-medium text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-pine-deep"
              >
                {children.map((child) => (
                  <option key={child.student_id} value={child.student_id}>
                    {child.full_name} — NIS {child.student_number}
                  </option>
                ))}
              </select>
            </label>

            {showRange && (
              <div className="flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1 text-[11px] font-semibold text-text-muted">
                  Dari tanggal
                  <input
                    type="date"
                    value={range.from}
                    onChange={(event) => {
                      setRange((prev) => ({ ...prev, from: event.target.value }));
                    }}
                    className="rounded-xl border border-border-control bg-surface-card px-3 py-2 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-pine-deep"
                  />
                </label>
                <label className="flex flex-col gap-1 text-[11px] font-semibold text-text-muted">
                  Sampai tanggal
                  <input
                    type="date"
                    value={range.to}
                    onChange={(event) => {
                      setRange((prev) => ({ ...prev, to: event.target.value }));
                    }}
                    className="rounded-xl border border-border-control bg-surface-card px-3 py-2 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-pine-deep"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRange(defaultMonthRange());
                  }}
                  className="cursor-pointer rounded-xl border border-border-control bg-surface-container-low px-3 py-2 text-xs font-bold text-pine-deep transition-colors hover:bg-pine-light"
                >
                  Bulan berjalan
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setTab(item.key);
                }}
                aria-pressed={tab === item.key}
                className={tabClass(tab === item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Remounting on child/range change resets each section's page offset. */}
          {tab === 'kehadiran' && (
            <ParentAttendanceSection
              key={`${selectedId}:${range.from}:${range.to}`}
              childId={selectedId}
              range={range}
            />
          )}

          {tab === 'kedisiplinan' && (
            <ParentDisciplineSection
              key={`${selectedId}:${range.from}:${range.to}`}
              childId={selectedId}
              range={range}
            />
          )}

          {tab === 'dispensasi' && (
            <ParentDispensationSection key={selectedId} childId={selectedId} />
          )}

          {tab === 'profil' && selected !== undefined && (
            <ParentChildProfileSection child={selected} />
          )}
        </>
      )}
    </div>
  );
}
