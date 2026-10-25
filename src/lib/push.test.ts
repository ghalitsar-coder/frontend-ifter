import { describe, expect, it } from 'vitest';
import { isPushSupported, urlBase64ToUint8Array } from '@/lib/push';

describe('push helpers', () => {
  it('decodes URL-safe base64 VAPID keys', () => {
    expect([...urlBase64ToUint8Array('AQID')]).toStrictEqual([1, 2, 3]);
    expect([...urlBase64ToUint8Array('-_8')]).toStrictEqual([251, 255]);
  });

  it('reports push support as unavailable outside a browser', () => {
    expect(isPushSupported()).toBeFalsy();
  });
});
