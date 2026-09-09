import { expect, test } from '@playwright/test';
import { resetMock } from './helpers/mock.ts';

test.describe('embedding configs', () => {
  test('creates a config and shows a pending matching index', async ({
    page,
  }) => {
    await resetMock('blank');
    await page.goto('/embeddings/configs/new');
    await expect(
      page.getByRole('heading', { name: 'New config' })
    ).toBeVisible();
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Product' }).click();
    await page.getByRole('checkbox', { name: 'title' }).click();
    await page.getByLabel('Target field').fill('embedding');
    await page.getByRole('button', { name: 'Create config' }).click();
    await expect(page).toHaveURL(/\/embeddings\/configs\/cfg_/);
    await expect(
      page.getByRole('heading', { name: 'Matching index' })
    ).toBeVisible();
    await expect(page.getByText('Pending', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Index is not queryable yet' })
    ).toBeVisible();
    await expect(
      page.getByText('Not queryable', { exact: true })
    ).toBeVisible();
  });
});
