// shortcut: no pushsubscriptionchange handler; re-subscribing needs the user's
// bearer token, so the settings panel re-registers on the next visit.

const DEFAULT_PATH = '/dashboard';

const safePath = (raw) => {
  if (typeof raw !== 'string' || raw === '') {
    return DEFAULT_PATH;
  }
  const url = new URL(raw, self.location.origin);
  if (url.origin !== self.location.origin) {
    return DEFAULT_PATH;
  }
  return `${url.pathname}${url.search}${url.hash}`;
};

const readPayload = (data) => {
  if (!data) {
    return {};
  }
  try {
    // oxlint-disable-next-line typescript/no-unsafe-return -- PushMessageData.json() is untyped in the DOM lib used here
    return data.json();
  } catch {
    return { body: data.text() };
  }
};

self.addEventListener('push', (event) => {
  const data = readPayload(event.data);
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Notifikasi Attendly', {
      body: data.body ?? '',
      icon: '/apple-touch-icon.png',
      data: { url: safePath(data.url) },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const path = safePath(event.notification.data?.url);
  const target = new URL(path, self.location.origin);
  event.waitUntil(
    (async () => {
      /** @type {{ url: string }[]} */
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const existing = clients.find((client) => {
        const current = new URL(client.url);
        return current.origin === target.origin && current.pathname === target.pathname;
      });
      if (existing && 'focus' in existing) {
        await existing.focus();
        return;
      }
      await self.clients.openWindow(path);
    })(),
  );
});
