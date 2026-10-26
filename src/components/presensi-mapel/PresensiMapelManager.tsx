'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { can } from '@/lib/api/rbac';
import { SessionCreateModal } from './SessionCreateModal';
import { SessionDetailPanel } from './SessionDetailPanel';
import { SessionListPanel } from './SessionListPanel';
import { SubjectAttendanceReport } from './SubjectAttendanceReport';

const TABS = [
  { key: 'sesi', label: 'Sesi' },
  { key: 'rekap', label: 'Rekap' },
] as const;

type MapelTab = (typeof TABS)[number]['key'];

const tabClass = (isActive: boolean): string =>
  `cursor-pointer rounded-xl px-3 py-2 text-xs font-bold tracking-wide transition-colors sm:text-sm ${
    isActive
      ? 'bg-pine-deep text-white shadow-xs'
      : 'bg-surface-container-low text-text-muted hover:bg-pine-light hover:text-pine-deep'
  }`;

/**
 * Subject-attendance workspace (`/dashboard/presensi-mapel`). The Sesi tab is
 * the recording surface and only opens for the attendance-ops roles; Rekap is
 * the report read and is the default for principal and staff TU, who can only
 * read. A selected session replaces the list with its roster.
 *
 * @returns Subject-attendance workspace JSX.
 */
export function PresensiMapelManager() {
  const { roles } = useAuth();
  const canRecord = can(roles, 'attendance_ops');
  const canRecap = can(roles, 'reports_read');
  const [tab, setTab] = useState<MapelTab>(canRecord ? 'sesi' : 'rekap');
  const [sessionId, setSessionId] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const visibleTabs = TABS.filter((item) => (item.key === 'sesi' ? canRecord : canRecap));

  if (visibleTabs.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Absensi per mata pelajaran hanya terbuka untuk guru yang mencatat kehadiran, atau untuk
          peran dengan akses laporan.
        </AlertDescription>
      </Alert>
    );
  }

  const activeTab = visibleTabs.some((item) => item.key === tab)
    ? tab
    : (visibleTabs[0]?.key ?? 'rekap');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs font-semibold tracking-wider text-pine-deep uppercase">
          Absensi Pembelajaran
        </span>
        <h1 className="text-2xl font-black tracking-tight text-pine-deep sm:text-3xl">
          Presensi Mata Pelajaran
        </h1>
        <p className="text-sm text-text-muted">
          Catat kehadiran per jam pelajaran, lalu rekap per penugasan guru, mapel, dan kelas.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {visibleTabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setTab(item.key);
              setSessionId('');
            }}
            aria-pressed={activeTab === item.key}
            className={tabClass(activeTab === item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {activeTab === 'sesi' &&
        (sessionId === '' ? (
          <SessionListPanel
            key="sesi-list"
            onOpenSession={(id) => {
              setSessionId(id);
            }}
            onCreate={() => {
              setCreateOpen(true);
            }}
          />
        ) : (
          <SessionDetailPanel
            key={sessionId}
            sessionId={sessionId}
            onBack={() => {
              setSessionId('');
            }}
            onSaved={(message) => {
              showToast(message);
            }}
          />
        ))}

      {activeTab === 'rekap' && <SubjectAttendanceReport key="rekap" />}

      {createOpen && (
        <SessionCreateModal
          onClose={() => {
            setCreateOpen(false);
          }}
          onCreated={(message, createdId) => {
            setCreateOpen(false);
            showToast(message);
            setSessionId(createdId);
          }}
        />
      )}

      {toast !== null && (
        <output className="fixed right-4 bottom-4 z-[60] max-w-sm rounded-xl bg-pine-deep px-4 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </output>
      )}
    </div>
  );
}
