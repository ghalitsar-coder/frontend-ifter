import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { expect, test } from '@playwright/test';

const fixture = 'tests/fixtures/attendance-qr.png';
const scanPath = '**/api/backend/v1/staff/attendance/scan';

function sessionToken(roles: string[]) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64url');
  const claims = Buffer.from(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + 3600,
      roles,
      school_id: 1,
    }),
  ).toString('base64url');
  return `${header}.${claims}.test-signature`;
}

test.describe('Teacher attendance', () => {
  test.describe.configure({ timeout: 90_000 });
  test('redirects anonymous visitors to sign-in', async ({ page }) => {
    await page.goto('/dashboard/absen');
    await expect(page).toHaveURL(/\/sign-in$/u);
  });

  test('redirects other staff roles to the dashboard', async ({ page, context }) => {
    await context.addCookies([
      {
        httpOnly: true,
        name: 'ifter_token',
        url: test.info().project.use.baseURL ?? 'http://localhost:3008',
        value: sessionToken(['tu']),
      },
    ]);
    await page.goto('/dashboard/absen');
    await expect(page).toHaveURL(/\/dashboard$/u);
  });

  test.describe('Signed-in teacher', () => {
    test.beforeEach(async ({ context }) => {
      await context.addCookies([
        {
          httpOnly: true,
          name: 'ifter_token',
          url: test.info().project.use.baseURL ?? 'http://localhost:3008',
          value: sessionToken(['guru']),
        },
      ]);
    });

    for (const width of [390, 1440]) {
      test(`records a QR image and shows check-out at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
          if (message.type() === 'error') {
            errors.push(message.text());
          }
        });
        let requests = 0;
        await page.route(scanPath, async (route) => {
          requests += 1;
          expect(route.request().method()).toBe('POST');
          expect(route.request().postDataJSON()).toStrictEqual({
            payload: 'ifter-attendance-test-payload',
          });
          await route.fulfill({
            json: {
              data: {
                staff_id: 1,
                status: 'pulang',
                tanggal: '2026-11-18',
                tipe_sesi: 'pulang',
                waktu_scan: '2026-11-18T15:30:00+07:00',
              },
            },
          });
        });
        await page.goto('/dashboard/absen?role=guru');
        await expect(page.getByRole('heading', { name: 'Scan QR code absensi' })).toBeVisible();
        const fileChooser = page.waitForEvent('filechooser');
        await page.getByRole('button', { name: 'Unggah gambar QR' }).click();
        const chooser = await fileChooser;
        await chooser.setFiles(fixture);
        const notification = page
          .getByRole('status')
          .filter({ hasText: 'Absensi pulang berhasil dicatat' });
        await expect(notification).toBeInViewport();
        await expect(page.getByText('Kehadiran berhasil dicatat')).toBeVisible();
        await expect(page.getByText('Pulang tercatat')).toBeVisible();
        expect(requests).toBe(1);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBeTruthy();
        expect(errors).toStrictEqual([]);
        await page.evaluate(() => {
          window.scrollTo(0, 0);
        });
        await page.screenshot({ path: `test-results/absen-${width}.png`, fullPage: true });
        await expect(notification).toHaveCount(0);
        await expect(page.getByText('Kehadiran berhasil dicatat')).toBeVisible();
      });
    }

    test('shows a late check-in under the French route', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.route(scanPath, async (route) => {
        await route.fulfill({
          json: {
            data: {
              staff_id: 1,
              status: 'terlambat',
              tanggal: '2026-11-18',
              tipe_sesi: 'masuk',
              waktu_scan: '2026-11-18T07:30:00+07:00',
            },
          },
        });
      });
      await page.goto('/fr/dashboard/absen?role=guru');
      await page.locator('#attendance-qr-image').setInputFiles(fixture);
      await expect(page.getByText('Kehadiran berhasil dicatat')).toBeVisible();
      await expect(page.getByRole('complementary').getByText('Hadir terlambat')).toBeVisible();
      const toast = page.getByRole('status').filter({ hasText: 'Hadir terlambat' });
      await expect(toast).toContainText('Masuk pukul 07.30 WIB');
      await expect(toast).toHaveClass(/bg-amber-surface/u);
      await expect(toast).toBeInViewport();
      await page.screenshot({ path: 'test-results/absen-terlambat-390.png', fullPage: true });
    });

    test('keeps image scanning available after camera denial', async ({ page }) => {
      await page.addInitScript(() => {
        navigator.mediaDevices.getUserMedia = async () =>
          await Promise.reject(new DOMException('', 'NotAllowedError'));
      });
      await page.goto('/dashboard/absen?role=guru');
      await page.getByRole('button', { name: 'Aktifkan kamera' }).click();
      await expect(
        page.getByText('Akses kamera ditolak. Izinkan kamera di pengaturan browser.'),
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'Unggah gambar QR' })).toBeEnabled();
    });

    for (const action of ['cancel', 'navigate']) {
      test(`releases a late camera grant after ${action}`, async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.addInitScript(() => {
          navigator.mediaDevices.getUserMedia = async () => {
            document.documentElement.dataset.cameraUserActivation = String(
              navigator.userActivation.isActive,
            );
            const pending = Promise.withResolvers<MediaStream>();
            window.addEventListener(
              'grant-test-camera',
              () => {
                const canvas = document.createElement('canvas');
                const stream = canvas.captureStream(1);
                pending.resolve(stream);
                window.setTimeout(() => {
                  document.documentElement.dataset.cameraReleased = String(
                    stream.getTracks().every((track) => track.readyState === 'ended'),
                  );
                }, 0);
              },
              { once: true },
            );
            return await pending.promise;
          };
        });
        await page.goto('/dashboard/absen?role=guru');
        await expect(page.locator('html')).not.toHaveAttribute('data-camera-user-activation');
        await page.getByRole('button', { name: 'Aktifkan kamera' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-camera-user-activation', 'true');
        await expect(
          page.getByText('Menunggu izin kamera. Pilih Izinkan pada permintaan browser.'),
        ).toBeVisible();
        await expect(page.getByRole('button', { name: 'Unggah gambar QR' })).toBeDisabled();
        if (action === 'cancel') {
          await page.getByRole('button', { name: 'Batalkan kamera' }).click();
          await expect(page.getByRole('button', { name: 'Aktifkan kamera' })).toBeEnabled();
        } else {
          await page.getByRole('button', { name: 'Buka navigasi', exact: true }).click();
          await page.locator('a[href*="/dashboard/presensi"]').first().click();
          await expect(page).toHaveURL(/\/dashboard\/presensi(?:\?.*)?$/u);
        }
        await page.evaluate(() => {
          window.dispatchEvent(new Event('grant-test-camera'));
        });
        await expect(page.locator('html')).toHaveAttribute('data-camera-released', 'true');
      });
    }

    for (const width of [390, 1440]) {
      test(`records a camera photo over local HTTP at ${width}px`, async ({
        page,
        context,
        baseURL,
      }) => {
        const addresses = Object.values(networkInterfaces()).flatMap(
          (entries) =>
            entries
              ?.filter((entry) => entry.family === 'IPv4' && !entry.internal)
              .map((entry) => entry.address) ?? [],
        );
        const address = addresses.find((value) => value.startsWith('192.168.')) ?? addresses[0];
        test.skip(address === undefined, 'Requires a local network address');
        if (address === undefined) {
          return;
        }
        const url = new URL('/dashboard/absen?role=guru', baseURL ?? 'http://localhost:3008');
        url.hostname = address;
        await context.addCookies([
          {
            httpOnly: true,
            name: 'ifter_token',
            url: url.origin,
            value: sessionToken(['guru']),
          },
        ]);
        await page.setViewportSize({ width, height: 900 });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
          if (message.type() === 'error') {
            errors.push(message.text());
          }
        });
        let requests = 0;
        await page.route(scanPath, async (route) => {
          requests += 1;
          expect(route.request().postDataJSON()).toStrictEqual({
            payload:
              width === 390
                ? 'v1.12.59849000.v1iBpkGlBnslyaQeB9LslSJJ5EG1uqdgXIDR5NHD2xs'
                : 'ifter-attendance-test-payload',
          });
          await route.fulfill({
            json: {
              data: {
                staff_id: 1,
                status: 'hadir',
                tanggal: '2026-11-19',
                tipe_sesi: 'masuk',
                waktu_scan: '2026-11-19T06:50:00+07:00',
              },
            },
          });
        });
        await page.goto(url.toString());
        expect(await page.evaluate(() => window.isSecureContext)).toBeFalsy();
        const fileChooser = page.waitForEvent('filechooser');
        await page.getByRole('button', { name: 'Aktifkan kamera' }).click();
        const chooser = await fileChooser;
        expect(await chooser.element().getAttribute('capture')).toBe('environment');
        await chooser.setFiles(
          width === 390
            ? 'tests/fixtures/attendance-qr-off-center.jpg'
            : 'tests/fixtures/attendance-qr-photo.jpg',
        );
        await expect(page.getByText('Kehadiran berhasil dicatat')).toBeVisible();
        expect(requests).toBe(1);
        await expect(page.locator('video')).toBeHidden();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBeTruthy();
        expect(errors).toStrictEqual([]);
        await page.screenshot({
          path: `test-results/absen-camera-http-${width}.png`,
          fullPage: true,
        });
        // Cancelling the native photo picker leaves the scanner ready for another attempt.
        const nextChooser = page.waitForEvent('filechooser');
        await page.getByRole('button', { name: 'Pindai QR lainnya' }).click();
        const cancelledChooser = await nextChooser;
        await cancelledChooser.setFiles([]);
        await expect(page.getByRole('button', { name: 'Aktifkan kamera' })).toBeEnabled();
        expect(requests).toBe(1);
      });
    }

    test('decodes a camera QR once and stops the preview', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      const imageUrl = `data:image/png;base64,${readFileSync(fixture).toString('base64')}`;
      await page.addInitScript((source) => {
        navigator.mediaDevices.getUserMedia = async () => {
          const image = new Image();
          image.src = source;
          await image.decode();
          const canvas = document.createElement('canvas');
          canvas.width = 480;
          canvas.height = 480;
          const drawing = canvas.getContext('2d');
          if (drawing === null) {
            throw new Error('Canvas unavailable');
          }
          drawing.fillStyle = 'white';
          drawing.fillRect(0, 0, 480, 480);
          drawing.drawImage(image, 90, 90);
          const stream = canvas.captureStream(10);
          const timer = window.setInterval(() => {
            if (stream.getVideoTracks().every((track) => track.readyState === 'ended')) {
              window.clearInterval(timer);
            } else {
              drawing.drawImage(image, 90, 90);
            }
          }, 100);
          return stream;
        };
      }, imageUrl);
      let requests = 0;
      await page.route(scanPath, async (route) => {
        requests += 1;
        await route.fulfill({
          json: {
            data: {
              staff_id: 1,
              status: 'hadir',
              tanggal: '2026-11-18',
              tipe_sesi: 'masuk',
              waktu_scan: '2026-11-18T06:50:00+07:00',
            },
          },
        });
      });
      await page.goto('/dashboard/absen?role=guru');
      await page.getByRole('button', { name: 'Aktifkan kamera' }).click();
      await expect(page.getByText('Kehadiran berhasil dicatat')).toBeVisible();
      await expect(page.getByRole('complementary').getByText('Hadir tepat waktu')).toBeVisible();
      await expect(
        page.getByRole('status').filter({ hasText: 'Hadir tepat waktu' }),
      ).toBeInViewport();
      await expect(page.getByRole('button', { name: 'Hentikan kamera' })).toHaveCount(0);
      await expect(page.locator('video')).toBeHidden();
      expect(requests).toBe(1);
      await page.screenshot({ path: 'test-results/absen-tepat-waktu-1440.png', fullPage: true });
    });

    test('shows an expired QR error without confirming attendance', async ({ page }) => {
      await page.route(scanPath, async (route) => {
        await route.fulfill({
          status: 400,
          json: { error: { code: 'expired_qr', message: 'untranslated backend message' } },
        });
      });
      await page.goto('/dashboard/absen?role=guru');
      await page.locator('#attendance-qr-image').setInputFiles(fixture);
      await expect(
        page.getByText('QR sudah berganti. Pindai kode terbaru di layar petugas.'),
      ).toBeVisible();
      await expect(page.getByText('Kehadiran berhasil dicatat')).toHaveCount(0);
      await expect(
        page.getByRole('status').filter({ hasText: /Hadir|Absensi pulang/u }),
      ).toHaveCount(0);
      await expect(page.getByText('untranslated backend message')).toHaveCount(0);
    });

    test('rejects unreadable images without posting attendance', async ({ page }) => {
      let requests = 0;
      await page.route(scanPath, async (route) => {
        requests += 1;
        await route.abort();
      });
      await page.goto('/dashboard/absen?role=guru');
      await page.locator('#attendance-qr-image').setInputFiles({
        name: 'invalid.png',
        mimeType: 'image/png',
        buffer: Buffer.from('invalid image'),
      });
      await expect(page.getByText('QR belum terbaca.', { exact: false })).toBeVisible();
      expect(requests).toBe(0);
    });
  });
});
