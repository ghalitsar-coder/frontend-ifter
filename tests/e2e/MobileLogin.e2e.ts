import { Buffer } from 'node:buffer';
import { networkInterfaces } from 'node:os';
import { expect, test } from '@playwright/test';

const addresses = Object.values(networkInterfaces()).flatMap(
  (entries) =>
    entries
      ?.filter((entry) => entry.family === 'IPv4' && !entry.internal)
      .map((entry) => entry.address) ?? [],
);
const lanAddress =
  addresses.find((address) => address.startsWith('192.168.')) ??
  addresses.find((address) => !address.startsWith('169.254.'));

function signInUrl(baseURL: string | undefined) {
  const url = new URL('/sign-in', baseURL ?? 'http://localhost:3008');
  if (lanAddress !== undefined) {
    url.hostname = lanAddress;
  }
  return url.toString();
}

function token(roles: readonly string[]) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64url');
  const claims = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600, school_id: 1, roles }),
  ).toString('base64url');
  return `${header}.${claims}.test-signature`;
}

test.describe('Mobile login over the local network', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  const accounts = [
    {
      name: 'teacher',
      tab: 'Guru Pengampu',
      roles: ['guru'],
      destination: '/dashboard/presensi',
      queryRole: 'guru',
    },
    {
      name: 'counseling staff',
      tab: 'Kesiswaan / BK',
      roles: ['kesiswaan'],
      destination: '/dashboard/kedisiplinan',
      queryRole: 'kesiswaan',
    },
    {
      name: 'school operator',
      tab: 'Admin / Staf Sekolah',
      roles: ['tu'],
      destination: '/dashboard/qr',
      queryRole: 'tu',
    },
    {
      name: 'administrator',
      tab: 'Admin / Staf Sekolah',
      roles: ['admin'],
      destination: '/dashboard/presensi',
      queryRole: null,
    },
  ] as const;

  for (const account of accounts) {
    test(`opens the ${account.name} dashboard after touch login`, async ({
      page,
      context,
      baseURL,
    }) => {
      const credentials = { username: 'mobile-login-test', password: 'mobile-test-password' };
      let loginRequests = 0;
      await page.route('**/api/auth/session', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({ json: { authenticated: true } });
          return;
        }
        loginRequests += 1;
        expect(route.request().method()).toBe('POST');
        expect(route.request().postDataJSON()).toStrictEqual(credentials);
        await route.fulfill({
          headers: {
            'Set-Cookie': `ifter_token=${token(account.roles)}; Path=/; HttpOnly; SameSite=Lax`,
          },
          json: {
            user_id: 1,
            username: credentials.username,
            nama: 'Test operator',
            roles: account.roles,
          },
        });
      });
      await page.route('**/api/backend/**', async (route) => {
        const activeSession = new URL(route.request().url()).pathname.endsWith(
          '/staff/qr-sessions/active',
        );
        await route.fulfill({ json: { data: activeSession ? null : [] } });
      });
      await page.goto(signInUrl(baseURL));
      const selectedTab = page.getByRole('tab', { name: account.tab, exact: true });
      await expect(selectedTab).toBeEnabled();
      await selectedTab.tap();
      await expect(selectedTab).toHaveAttribute('aria-selected', 'true');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBeTruthy();
      await page.locator('#username').fill(credentials.username);
      await page.locator('#password').fill(credentials.password);
      await page.locator('#login-form button[type="submit"]').tap();
      await page.waitForURL((url) => url.pathname === account.destination);
      expect(new URL(page.url()).searchParams.get('role')).toBe(account.queryRole);
      expect(loginRequests).toBe(1);
      const cookies = await context.cookies();
      const cookie = cookies.find((entry) => entry.name === 'ifter_token');
      expect(cookie?.httpOnly).toBeTruthy();
      expect(new URL(page.url()).searchParams.has('password')).toBeFalsy();
    });
  }

  test.describe('Unavailable JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('keeps credentials out of the URL when scripts cannot run', async ({ page, baseURL }) => {
      await page.goto(signInUrl(baseURL));
      await page.locator('#username').fill('fallback-test-user');
      await page.locator('#password').fill('fallback-test-password');
      const submission = page.waitForRequest(
        (request) => request.isNavigationRequest() && request.method() === 'POST',
      );
      await page.locator('#login-form button[type="submit"]').tap();
      const request = await submission;
      expect(new URL(request.url()).searchParams.has('password')).toBeFalsy();
      expect(new URL(request.url()).searchParams.has('username')).toBeFalsy();
    });
  });
});
