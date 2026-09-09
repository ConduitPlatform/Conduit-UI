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
    await page.getByLabel('Dimensions').fill('3072');
    await page.keyboard.press('ControlOrMeta+s');
    await expect(page.getByText('Embeddings settings saved')).toBeVisible();
  });

  test('searches schemas and models with arrows and enter', async ({
    page,
  }) => {
    await resetMock('blank');
    await page.goto('/embeddings/configs/new');
    const schema = page.getByRole('combobox', { name: 'Schema' });
    await schema.click();
    await page.getByPlaceholder('Search schemas').fill('pro');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(schema).toContainText('Product');

    const model = page.getByRole('combobox', { name: 'Model' });
    await model.click();
    await page.getByPlaceholder('Search models').fill('large');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(model).toContainText('text-embedding-3-large');
    await expect(page.getByLabel('Dimensions')).toHaveValue('3072');
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
