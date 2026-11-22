import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import type { StaffQrSession } from '@/services/presensiApi';

const activePath = '**/api/backend/v1/staff/qr-sessions/active';
const codePath = '**/api/backend/v1/staff/qr-sessions/42/code';
const image = `data:image/png;base64,${readFileSync('tests/fixtures/attendance-qr.png').toString('base64')}`;
const session: StaffQrSession = {
  id: 42,
  tanggal: '2026-11-19',
  tipe_sesi: 'pulang',
  jam_buka: '10:15:00',
  jam_tutup: '23:59:00',
  rotasi_detik: 30,
  status: 'aktif',
  created_at: '2026-11-19T10:00:00+07:00',
};

test.describe('Staff QR session', () => {
  test.beforeEach(async ({ context, baseURL }) => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64url');
    const claims = Buffer.from(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600, roles: ['tu'], school_id: 1 }),
    ).toString('base64url');
    await context.addCookies([
      {
        name: 'ifter_token',
        value: `${header}.${claims}.test-signature`,
        httpOnly: true,
        url: baseURL ?? 'http://localhost:3008',
      },
    ]);
  });

  for (const width of [390, 1440]) {
    test(`restores the session and fetches a fresh code after refresh at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      let active: StaffQrSession | null = null;
      let creations = 0;
      let codes = 0;
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.route(activePath, async (route) => {
        await route.fulfill({ json: { data: active } });
      });
      await page.route('**/api/backend/v1/staff/qr-sessions', async (route) => {
        creations += 1;
        active = session;
        await route.fulfill({ status: 201, json: { data: session } });
      });
      await page.route(codePath, async (route) => {
        codes += 1;
        await route.fulfill({
          json: {
            data: {
              session_id: 42,
              payload: `signed-${codes}`,
              image_png: image,
              valid_until: new Date(Date.now() + 60_000).toISOString(),
            },
          },
        });
      });
      await page.goto('/dashboard/qr?role=tu');
      await page.getByRole('button', { name: 'Check-out', exact: true }).click();
      await page.getByRole('button', { name: 'Create QR session', exact: true }).click();
      await expect(
        page.getByRole('img', { name: 'Rotating staff attendance QR code' }),
      ).toBeVisible();
      const previousCodes = codes;
      await page.reload();
      await expect(
        page.getByRole('img', { name: 'Rotating staff attendance QR code' }),
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'Check-out', exact: true })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await expect(page.locator('input[type="date"]')).toHaveValue('2026-11-19');
      await expect(page.locator('input[type="time"]').nth(0)).toHaveValue('10:15');
      await expect(page.locator('input[type="time"]').nth(1)).toHaveValue('23:59');
      await expect(
        page.getByRole('button', { name: 'Create QR session', exact: true }),
      ).toBeDisabled();
      expect(creations).toBe(1);
      expect(codes).toBeGreaterThan(previousCodes);
      expect(errors).toStrictEqual([]);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBeTruthy();
      await page.screenshot({ path: `test-results/qr-restored-${width}.png`, fullPage: true });
    });
  }

  test('keeps a closed session closed after refresh', async ({ page }) => {
    let active: StaffQrSession | null = session;
    await page.route(activePath, async (route) => {
      await route.fulfill({ json: { data: active } });
    });
    await page.route(codePath, async (route) => {
      await route.fulfill({
        json: {
          data: {
            session_id: 42,
            image_png: image,
            payload: 'signed',
            valid_until: new Date(Date.now() + 60_000).toISOString(),
          },
        },
      });
    });
    await page.route('**/api/backend/v1/staff/qr-sessions/42/close', async (route) => {
      active = null;
      await route.fulfill({ json: { data: { id: 42, status: 'selesai' } } });
    });
    await page.goto('/dashboard/qr?role=tu');
    await expect(
      page.getByRole('img', { name: 'Rotating staff attendance QR code' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Close session', exact: true }).click();
    await page.reload();
    await expect(page.getByText('Ready to take staff attendance?')).toBeVisible();
    await expect(page.getByRole('img', { name: 'Rotating staff attendance QR code' })).toHaveCount(
      0,
    );
  });

  test('retries session loading without creating a duplicate', async ({ page }) => {
    let available = false;
    await page.route(activePath, async (route) => {
      await route.fulfill(
        available
          ? { json: { data: null } }
          : {
              status: 503,
              json: { error: { code: 'unreachable', message: 'backend unavailable' } },
            },
      );
    });
    await page.goto('/dashboard/qr?role=tu');
    await expect(page.getByText('Sesi absensi belum dapat dimuat.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create QR session', exact: true })).toHaveCount(
      0,
    );
    available = true;
    await page.getByRole('button', { name: 'Muat ulang sesi' }).click();
    await expect(page.getByText('Ready to take staff attendance?')).toBeVisible();
  });
});
