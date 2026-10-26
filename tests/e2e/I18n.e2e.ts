import { expect, test } from '@playwright/test';

test.describe('I18n', () => {
  test.describe('Language Switching', () => {
    test('renders the Attendly sign-in screen under English and French locales', async ({
      page,
    }) => {
      await page.goto('/sign-in');

      await expect(page.getByText('Masuk ke Attendly')).toBeVisible();

      await page.goto('/fr/sign-in');

      await expect(page.getByText('Masuk ke Attendly')).toBeVisible();
    });
  });
});
