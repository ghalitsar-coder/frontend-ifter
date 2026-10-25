/**
 * Decodes a URL-safe base64 VAPID key into the byte array `subscribe` expects.
 * @param base64String - URL-safe base64 public key from the server.
 * @returns Subscription application server key.
 */
export const urlBase64ToUint8Array = (base64String: string): Uint8Array<ArrayBuffer> => {
  const padded = base64String
    .replaceAll('-', '+')
    .replaceAll('_', '/')
    .padEnd(Math.ceil(base64String.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.codePointAt(index) ?? 0;
  }
  return bytes;
};

/**
 * Whether this browser exposes the Web Push APIs. Push requires HTTPS.
 * @returns True when service worker, PushManager, and Notification exist.
 */
export const isPushSupported = (): boolean =>
  typeof window !== 'undefined' &&
  window.isSecureContext &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;
