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

  test('asks for a schema before listing source fields', async ({ page }) => {
    await resetMock('blank');
    await page.goto('/embeddings/configs/new');
    await expect(
      page.getByText('Select a schema to see eligible fields.')
    ).toBeVisible();
  });

  test('uses route labels instead of raw config ids in breadcrumbs', async ({
    page,
  }) => {
    await resetMock('ready');
    await page.goto('/embeddings/configs/cfg_product');
    const crumbs = page.getByRole('navigation', { name: 'breadcrumb' });
    await expect(crumbs.getByText('Configs', { exact: true })).toBeVisible();
    await expect(crumbs.getByText('Config', { exact: true })).toBeVisible();
    await expect(crumbs.getByText('Cfg_product')).toHaveCount(0);
  });

  test('shows stacked config cards on a narrow viewport', async ({ page }) => {
    await resetMock('ready');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/embeddings/configs');
    await expect(page.getByRole('heading', { name: 'Configs' })).toBeVisible();
    await expect(
      page.getByRole('term').filter({ hasText: 'Index' })
    ).toBeVisible();
    await expect(
      page
        .getByRole('definition')
        .filter({ hasText: 'openai-compatible/text-embedding-3-small' })
    ).toBeVisible();
    await expect(
      page.getByRole('definition').filter({ hasText: 'Ready' })
    ).toBeVisible();
  });

  test('selects the highest ready generation over a pending v1', async ({
    page,
  }) => {
    await resetMock('ready');
    await page.goto('/embeddings/configs/cfg_product');
    await expect(page.getByText('Product_embedding_v2')).toBeVisible();
    await expect(page.getByText('Product_embedding_v1')).toHaveCount(0);
    const generation = page.getByRole('term').filter({ hasText: 'Generation' });
    await expect(generation).toBeVisible();
    await expect(
      generation.locator('xpath=following-sibling::dd[1]')
    ).toHaveText('2');
  });
});
