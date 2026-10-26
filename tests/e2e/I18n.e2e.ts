import { expect, test } from '@playwright/test';

test.describe('I18n', () => {
  test.describe('Language Switching', () => {
    test('should switch language from English to French using URL and verify text on the sign-in page', async ({
      page,
    }) => {
      await page.goto('/sign-in');

      await expect(page.getByText('Email address')).toBeVisible();

      await page.goto('/fr/sign-in');

      await expect(page.getByText('Adresse e-mail')).toBeVisible();
    });
  });
});
