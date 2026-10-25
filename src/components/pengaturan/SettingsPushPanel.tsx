'use client';

import { Bell, BellRing, Send, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { ApiError } from '@/lib/api/client';
import {
  isPushDisabled,
  useCreatePushSubscription,
  useDeletePushSubscription,
  usePushConfig,
  usePushSubscriptions,
  useSendPushTest,
} from '@/lib/api/push';
import type { PushSubscriptionRecord } from '@/lib/api/push';
import { can } from '@/lib/api/rbac';
import { isPushSupported, urlBase64ToUint8Array } from '@/lib/push';

const PUSH_DISABLED_TEXT =
  'Server push belum aktif. Hubungi operator backend untuk mengaktifkan notifikasi.';

const errorText = (error: unknown): string => {
  if (isPushDisabled(error)) {
    return PUSH_DISABLED_TEXT;
  }
  return error instanceof ApiError ? error.message : 'Terjadi kesalahan tak terduga.';
};

const toBase64Url = (buffer: ArrayBuffer): string =>
  btoa(String.fromCodePoint(...new Uint8Array(buffer)))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');

const configStatus = (
  enabled: boolean | undefined,
  isLoading: boolean,
): { label: string; dotClass: string } => {
  if (isLoading) {
    return { label: 'Memeriksa server…', dotClass: 'bg-amber-500' };
  }
  if (enabled === true) {
    return { label: 'Server aktif', dotClass: 'bg-emerald-600' };
  }
  return { label: 'Server nonaktif', dotClass: 'bg-amber-500' };
};

const configErrorTextOf = (query: { isError: boolean; error: unknown }): string | null => {
  if (!query.isError) {
    return null;
  }
  return isPushDisabled(query.error) ? PUSH_DISABLED_TEXT : errorText(query.error);
};

const deviceLabel = (record: PushSubscriptionRecord): string =>
  record.user_agent === undefined || record.user_agent === null || record.user_agent === ''
    ? 'Perangkat tanpa label'
    : record.user_agent;

const sameKey = (existing: ArrayBuffer, expected: Uint8Array<ArrayBuffer>): boolean => {
  const current = new Uint8Array(existing);
  return (
    current.length === expected.length && current.every((byte, index) => byte === expected[index])
  );
};

const registeredAt = (value: string): string => {
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
 * Subscribes this browser to web push and extracts the keys the backend stores.
 * @param publicKey - VAPID public key from GET /push/config.
 * @returns Endpoint and key material for POST /push/subscriptions.
 */
const subscribeBrowser = async (
  publicKey: string,
): Promise<{ endpoint: string; p256dh: string; auth: string }> => {
  if (!isPushSupported()) {
    throw new Error(
      'Browser ini tidak mendukung notifikasi push (butuh HTTPS dan browser modern).',
    );
  }
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Izin notifikasi ditolak. Aktifkan izin di pengaturan browser.');
  }

  const applicationServerKey = urlBase64ToUint8Array(publicKey);
  const registration = await navigator.serviceWorker.register('/sw.js');
  let subscription = await registration.pushManager.getSubscription();
  if (subscription !== null) {
    const currentKey = subscription.options.applicationServerKey;
    if (currentKey === null || !sameKey(currentKey, applicationServerKey)) {
      // VAPID key rotated: the old endpoint cannot receive our pushes anymore.
      await subscription.unsubscribe();
      subscription = null;
    }
  }
  subscription ??= await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  const p256dh = subscription.getKey('p256dh');
  const auth = subscription.getKey('auth');
  if (p256dh === null || auth === null) {
    throw new Error('Kunci langganan browser tidak lengkap.');
  }

  return {
    endpoint: subscription.endpoint,
    p256dh: toBase64Url(p256dh),
    auth: toBase64Url(auth),
  };
};

/**
 * Drops this browser's subscription when it matches the revoked backend record.
 * @param endpoint - Endpoint of the deleted subscription.
 */
const releaseBrowserSubscription = async (endpoint: string): Promise<void> => {
  if (!isPushSupported()) {
    return;
  }
  try {
    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    const current = await registration?.pushManager.getSubscription();
    if (current?.endpoint === endpoint) {
      await current.unsubscribe();
    }
  } catch {
    // The backend record is already removed; a stale browser subscription stops delivering.
  }
};

/**
 * Web push controls: server capability, per-browser subscription, registered
 * devices, and an admin test notification.
 *
 * @returns Push notification panel.
 */
export function SettingsPushPanel() {
  const { roles } = useAuth();
  const canManage = can(roles, 'admin');
  const [toast, setToast] = useState<string | null>(null);
  const [isEnabling, setIsEnabling] = useState(false);

  const configQuery = usePushConfig();
  const subscriptionsQuery = usePushSubscriptions();
  const createSubscription = useCreatePushSubscription();
  const deleteSubscription = useDeletePushSubscription();
  const sendTest = useSendPushTest();

  const config = configQuery.data;
  const subscriptions = subscriptionsQuery.data ?? [];

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => {
      setToast(null);
    }, 3600);
  };

  const enableForThisDevice = async () => {
    if (config === undefined || isEnabling) {
      return;
    }
    setIsEnabling(true);
    try {
      const keys = await subscribeBrowser(config.public_key);
      if (subscriptions.some((record) => record.endpoint === keys.endpoint)) {
        showToast('Perangkat ini sudah terdaftar.');
        return;
      }
      await createSubscription.mutateAsync({ ...keys, user_agent: navigator.userAgent });
      showToast('Perangkat ini akan menerima notifikasi push.');
    } catch (error) {
      showToast(errorText(error));
    } finally {
      setIsEnabling(false);
    }
  };

  const revoke = (record: PushSubscriptionRecord) => {
    deleteSubscription.mutate(record.id, {
      onSuccess: () => {
        void releaseBrowserSubscription(record.endpoint);
        showToast('Perangkat tidak lagi menerima notifikasi.');
      },
      onError: (error) => {
        showToast(errorText(error));
      },
    });
  };

  const sendTestNotification = () => {
    sendTest.mutate(
      {
        title: 'Uji notifikasi Attendly',
        body: 'Ini notifikasi uji dari pengaturan sekolah.',
      },
      {
        onSuccess: (result) => {
          showToast(
            `Notifikasi terkirim ke ${result.sent} perangkat${
              result.failed > 0 ? `, ${result.failed} gagal.` : '.'
            }`,
          );
        },
        onError: (error) => {
          showToast(errorText(error));
        },
      },
    );
  };

  const configErrorText = configErrorTextOf(configQuery);
  const status = configStatus(config?.enabled, configQuery.isLoading);

  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-pine-light bg-pine-light/50 p-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pine-deep text-amber-gold">
            <BellRing className="size-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-pine-deep">Notifikasi Web Push</p>
            <p className="text-[11px] text-muted-foreground">
              Terima notifikasi absensi langsung di browser perangkat ini.
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-card px-2 py-0.5 text-[10px] font-bold text-pine-deep">
              <span className={`size-1.5 rounded-full ${status.dotClass}`} />
              {status.label}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            void enableForThisDevice();
          }}
          disabled={isEnabling || config?.enabled !== true}
          className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-pine-deep px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Bell className="size-4 text-amber-gold" />
          <span>{isEnabling ? 'Menghubungkan…' : 'Aktifkan di perangkat ini'}</span>
        </button>
      </div>

      {configErrorText !== null && (
        <p className="rounded-xl border border-amber-gold/40 bg-amber-surface px-3 py-2 text-[11px] font-semibold text-amber-dark">
          {configErrorText}
        </p>
      )}

      <div className="rounded-2xl border border-border-control bg-card p-5 shadow-xs">
        <div className="mb-3 flex items-center gap-2">
          <Smartphone className="size-4 text-pine-deep" />
          <h3 className="text-xs font-bold text-pine-deep">Perangkat terdaftar</h3>
          <span className="rounded-full bg-surface-container-low px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
            {subscriptions.length}
          </span>
        </div>

        {subscriptionsQuery.isLoading && (
          <p className="text-[11px] text-muted-foreground">Memuat perangkat…</p>
        )}

        {subscriptionsQuery.isError && (
          <p className="text-[11px] font-semibold text-red-600">
            {errorText(subscriptionsQuery.error)}
          </p>
        )}

        {!subscriptionsQuery.isLoading &&
          !subscriptionsQuery.isError &&
          subscriptions.length === 0 && (
            <p className="text-[11px] text-muted-foreground">Belum ada perangkat terdaftar.</p>
          )}

        <ul className="divide-y divide-border-subtle">
          {subscriptions.map((record) => (
            <li key={record.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold text-foreground">
                  {deviceLabel(record)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Terdaftar {registeredAt(record.created_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  revoke(record);
                }}
                disabled={deleteSubscription.isPending}
                className="shrink-0 cursor-pointer rounded-lg border border-border-control px-2.5 py-1.5 text-[11px] font-semibold text-pine-deep transition-colors hover:bg-pine-light disabled:cursor-not-allowed disabled:opacity-50"
              >
                Putuskan
              </button>
            </li>
          ))}
        </ul>
      </div>

      {canManage && (
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border-control bg-card p-5 shadow-xs sm:flex-row sm:items-center">
          <div>
            <h3 className="text-xs font-bold text-pine-deep">Notifikasi uji (admin)</h3>
            <p className="text-[10px] text-muted-foreground">
              Kirim notifikasi percobaan ke seluruh perangkat terdaftar.
            </p>
          </div>
          <button
            type="button"
            onClick={sendTestNotification}
            disabled={sendTest.isPending}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-border-control px-2.5 py-1.5 text-[11px] font-semibold text-pine-deep transition-colors hover:bg-pine-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="size-3" />
            <span>{sendTest.isPending ? 'Mengirim…' : 'Kirim notifikasi uji'}</span>
          </button>
        </div>
      )}

      {toast !== null && (
        <output className="fixed right-4 bottom-4 z-[60] max-w-sm rounded-xl bg-pine-deep px-4 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </output>
      )}
    </section>
  );
}
