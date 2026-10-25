'use client';

import { CheckCircle2, Clock, MessageCircle, Scale, ShieldAlert, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { defaultSystemSettings } from '@/data/mockSettings';
import { ApiError } from '@/lib/api/client';
import {
  presencePolicyToSettings,
  settingsToPresencePolicy,
  useAttendanceSettings,
  useUpdateAttendanceSettings,
} from '@/lib/api/pengaturan';
import type { PresencePolicy, SettingsTab, SystemSettings } from '@/types/settings';
import { SettingsAcademicYearPanel } from './SettingsAcademicYearPanel';
import { SettingsGeofencePanel } from './SettingsGeofencePanel';
import { SettingsHeader } from './SettingsHeader';
import { SettingsHolidayPanel } from './SettingsHolidayPanel';
import { SettingsNotificationPanel } from './SettingsNotificationPanel';
import { SettingsPresencePanel } from './SettingsPresencePanel';
import { SettingsPushPanel } from './SettingsPushPanel';
import { SettingsSanctionsPanel } from './SettingsSanctionsPanel';

const TABS = [
  { id: 'presence', labelKey: 'tab_presence', icon: Clock },
  { id: 'sanctions', labelKey: 'tab_sanctions', icon: Scale },
  { id: 'notifications', labelKey: 'tab_notifications', icon: MessageCircle },
] as const satisfies { id: SettingsTab; labelKey: string; icon: typeof Clock }[];

// No 'toast_save_error' key exists in SettingsPage locales; backend messages
// are Indonesian domain content, the fallback matches that style.
const SAVE_ERROR_FALLBACK = 'Gagal menyimpan pengaturan, silakan coba lagi.';

/**
 * Coordinator for operational policy state, tabs, and save feedback.
 *
 * @returns Settings workspace.
 */
export function SettingsManager() {
  const t = useTranslations('SettingsPage');
  const [activeTab, setActiveTab] = useState<SettingsTab>('presence');
  const [settings, setSettings] = useState<SystemSettings>(defaultSystemSettings);
  const [savedSettings, setSavedSettings] = useState<SystemSettings>(defaultSystemSettings);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [presencePatch, setPresencePatch] = useState<Partial<PresencePolicy> | null>(null);
  const { data: serverSettings } = useAttendanceSettings();
  const updateAttendanceSettings = useUpdateAttendanceSettings();

  // The gate window is server-driven; local edits are kept as a sparse patch
  // so no effect-based state syncing is needed.
  const savedPresence: PresencePolicy =
    serverSettings === undefined
      ? defaultSystemSettings.presence
      : settingsToPresencePolicy(serverSettings);
  const presence: PresencePolicy = { ...savedPresence, ...presencePatch };

  const isDirty =
    presencePatch !== null || JSON.stringify(settings) !== JSON.stringify(savedSettings);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSave = () => {
    // shortcut: no backend endpoints for geofence/notification policies, keep mock
    if (serverSettings === undefined) {
      showToast(SAVE_ERROR_FALLBACK);

      return;
    }

    updateAttendanceSettings.mutate(presencePolicyToSettings(serverSettings, presence), {
      onSuccess: () => {
        setPresencePatch(null);
        setSavedSettings(settings);
        showToast(t('toast_saved'));
      },
      onError: (err) => {
        showToast(err instanceof ApiError ? err.message : SAVE_ERROR_FALLBACK);
      },
    });
  };

  const handleReset = () => {
    setSettings(defaultSystemSettings);
    setPresencePatch(defaultSystemSettings.presence);
    showToast(t('toast_reset'));
  };

  return (
    <div className="w-full">
      {toastMessage && (
        <div className="fixed right-6 bottom-6 z-50 flex animate-in items-center gap-3 rounded-xl border border-pine-hover bg-pine-deep px-4 py-3 text-white shadow-xl fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="size-5 shrink-0 text-amber-gold" />
          <span className="text-xs font-medium sm:text-sm">{toastMessage}</span>
          <button
            type="button"
            onClick={() => {
              setToastMessage(null);
            }}
            className="ml-2 cursor-pointer text-white/60 hover:text-white"
            aria-label={t('btn_close_notification')}
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <SettingsHeader isDirty={isDirty} onReset={handleReset} onSave={handleSave} />

      <div className="mb-5 flex scrollbar-none items-center gap-1.5 overflow-x-auto border-b border-border-subtle pb-0.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
              }}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors sm:text-sm ${
                isActive
                  ? 'border-pine-deep text-pine-deep'
                  : 'border-transparent text-muted-foreground hover:text-pine-deep'
              }`}
            >
              <Icon className="size-3.5" />
              <span>{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'presence' && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-gold/40 bg-amber-surface p-4">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-dark" />
            <div>
              <p className="text-xs font-bold text-amber-dark">{t('banner_title')}</p>
              <p className="text-[11px] leading-relaxed text-amber-dark/80">{t('banner_desc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <SettingsPresencePanel
              policy={presence}
              onChange={(patch) => {
                setPresencePatch((current) => ({ ...current, ...patch }));
              }}
            />
            <SettingsGeofencePanel
              policy={settings.geofence}
              onChange={(patch) => {
                setSettings((current) => ({
                  ...current,
                  geofence: { ...current.geofence, ...patch },
                }));
              }}
              onCalibrate={() => {
                showToast(t('toast_calibrated'));
              }}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <SettingsHolidayPanel />
            <SettingsAcademicYearPanel />
          </div>
        </div>
      )}

      {activeTab === 'sanctions' && <SettingsSanctionsPanel />}

      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <SettingsPushPanel />
          <SettingsNotificationPanel
            policy={settings.notifications}
            onChange={(patch) => {
              setSettings((current) => ({
                ...current,
                notifications: { ...current.notifications, ...patch },
              }));
            }}
            onSendExample={(kind) => {
              showToast(t('toast_example_sent', { kind: t(`template_${kind}`) }));
            }}
          />
        </div>
      )}
    </div>
  );
}
