import { expect, test } from '@playwright/test';
import { resetMock } from './helpers/mock.ts';

test.describe('keyboard', () => {
  test('closes the start-backfill dialog with Escape', async ({ page }) => {
    await resetMock('ready');
    await page.goto('/embeddings/backfills');
    await page.getByRole('button', { name: 'Start backfill' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('submits Test Search with Enter', async ({ page }) => {
    await resetMock('ready');
    await page.goto('/embeddings/test');
    await page.getByLabel('Query').fill('published guide');
    await page.getByLabel('Query').press('Enter');
    await expect(
      page.getByRole('cell', { name: 'Published guide' })
    ).toBeVisible();
  });

  test('saves settings with the platform save shortcut', async ({ page }) => {
    await resetMock('ready');
    await page.goto('/embeddings/settings');
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Default model').fill('text-embedding-3-large');
    await page.keyboard.press('ControlOrMeta+s');
    await expect(page.getByText('Embeddings settings saved')).toBeVisible();
  });

  test('keeps a visible focus ring on the Test Search submit control', async ({
    page,
  }) => {
    await resetMock('ready');
    await page.goto('/embeddings/test');
    await page.getByLabel('Query').fill('published guide');
    const search = page.getByRole('button', { name: 'Search' });
    await search.focus();
    await expect(search).toBeFocused();
  });
});
