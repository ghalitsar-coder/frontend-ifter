import { expect, takeSnapshot, test } from '@chromatic-com/playwright';

test.describe('Visual testing', () => {
  test.describe('Static pages', () => {
    test('should take screenshot of the homepage', async ({ page }, testInfo) => {
      await page.goto('/');

      await expect(page.getByRole('heading', { level: 1 })).toContainText('Presensi Siswa');

      await takeSnapshot(page, testInfo);
    });

    test('should take screenshot of the French homepage', async ({ page }, testInfo) => {
      await page.goto('/fr');

      await expect(page.getByRole('heading', { level: 1 })).toContainText('Presensi Siswa');

      await takeSnapshot(page, testInfo);
    });
  });
});
