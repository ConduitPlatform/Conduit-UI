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
    await page.getByRole('combobox', { name: 'Schema' }).click();
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

  test('omits disabled, non-extendable, and internal schemas from create choices', async ({
    page,
  }) => {
    await resetMock('blank');
    await page.goto('/embeddings/configs/new');
    await page.getByRole('combobox', { name: 'Schema' }).click();
    await expect(page.getByRole('option', { name: 'Product' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'User' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Team' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Note' })).toBeVisible();
    await expect(
      page.getByRole('option', { name: 'ArchivedProduct' })
    ).toHaveCount(0);
    await expect(page.getByRole('option', { name: 'CmsOnly' })).toHaveCount(0);
    await expect(
      page.getByRole('option', { name: 'Admin', exact: true })
    ).toHaveCount(0);
    await expect(
      page.getByRole('option', { name: 'AdminMiddleware' })
    ).toHaveCount(0);
    await expect(
      page.getByRole('option', { name: 'AppMiddleware' })
    ).toHaveCount(0);
    await expect(page.getByRole('option', { name: 'Client' })).toHaveCount(0);
    await expect(page.getByRole('option', { name: 'Config' })).toHaveCount(0);
    await expect(page.getByRole('option', { name: 'Views' })).toHaveCount(0);
    await page.getByPlaceholder('Search schemas').fill('cms');
    await expect(page.getByText('No matching schemas')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByPlaceholder('Search schemas')).toHaveCount(0);
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
      page.getByRole('term').filter({ hasText: 'Index' }).first()
    ).toBeVisible();
    await expect(
      page
        .getByRole('definition')
        .filter({ hasText: 'openai-compatible/text-embedding-3-small' })
        .first()
    ).toBeVisible();
    await expect(
      page.getByRole('definition').filter({ hasText: 'Ready' }).first()
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

  test('searches schemas with arrows and enter', async ({ page }) => {
    await resetMock('blank');
    await page.goto('/embeddings/configs/new');
    const schema = page.getByRole('combobox', { name: 'Schema' });
    await schema.click();
    await page.getByPlaceholder('Search schemas').fill('pro');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(schema).toContainText('Product');
  });

  test('derives dimensions from the selected model and clears on provider change', async ({
    page,
  }) => {
    await resetMock('blank');
    await page.goto('/embeddings/configs/new');
    await expect(page.getByLabel('Dimensions')).toHaveValue('1536');
    await expect(page.getByLabel('Dimensions')).toHaveAttribute('readonly', '');
    await expect(page.getByText(/Recommended for text/)).toBeVisible();
    await page.getByRole('combobox', { name: 'Provider' }).click();
    await page.getByRole('option', { name: 'voyage' }).click();
    await expect(page.getByRole('combobox', { name: 'Model' })).toContainText(
      'Select a model'
    );
    await page.getByRole('combobox', { name: 'Model' }).click();
    await page.getByRole('option', { name: 'voyage-3' }).click();
    await expect(page.getByLabel('Dimensions')).toHaveValue('1024');
  });

  test('keeps the only provider visible and disabled on an existing config', async ({
    page,
  }) => {
    await resetMock('ready');
    await page.goto('/embeddings/configs/cfg_product');
    const provider = page.getByRole('combobox', { name: 'Provider' });
    await expect(provider).toBeVisible();
    await expect(provider).toBeDisabled();
    await expect(provider).toContainText('openai-compatible');
  });

  test('rejects an incompatible target field collision', async ({ page }) => {
    await resetMock('blank');
    await page.goto('/embeddings/configs/new');
    await page.getByRole('combobox', { name: 'Schema' }).click();
    await page.getByRole('option', { name: 'Note' }).click();
    await page.getByRole('checkbox', { name: 'title' }).click();
    await page.getByLabel('Target field').fill('embedding');
    await page.getByRole('button', { name: 'Create config' }).click();
    await expect(
      page
        .getByRole('region', { name: 'Notifications (F8)' })
        .getByText(
          "Field 'embedding' already exists on schema 'Note' and is not a compatible embeddings extension"
        )
    ).toBeVisible();
  });

  test('resets enabled after a material edit that stays pending', async ({
    page,
  }) => {
    await resetMock('ready');
    await page.goto('/embeddings/configs/cfg_product');
    const enabled = page.getByRole('switch', { name: 'Enabled' });
    await expect(enabled).toBeChecked();
    await page.getByRole('combobox', { name: 'Similarity' }).click();
    await page.getByRole('option', { name: 'Euclidean' }).click();
    await page.getByRole('button', { name: /Save changes/ }).click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole('heading', { name: 'Save material changes?' })
    ).toBeVisible();
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(
      page
        .getByRole('region', { name: 'Notifications (F8)' })
        .getByText(
          'Config stayed disabled until the matching index is queryable.'
        )
    ).toBeVisible();
    await expect(enabled).not.toBeChecked();
    await expect(
      page.getByRole('button', { name: 'Save changes', exact: true })
    ).toBeDisabled();
    await expect(page.getByText('Pending', { exact: true })).toBeVisible();
  });

  test('blocks a config whose model is absent from the catalogue', async ({
    page,
  }) => {
    await resetMock('ready');
    await page.goto('/embeddings/configs/cfg_legacy');
    await expect(
      page.getByText(
        'This model is not in the provider catalogue. Add it in Settings before changing this config.'
      )
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Open settings' }).first()
    ).toHaveAttribute('href', '/embeddings/settings');
    await expect(page.getByRole('combobox', { name: 'Model' })).toContainText(
      'text-embedding-ada-002'
    );
    await expect(page.getByRole('combobox', { name: 'Model' })).toBeDisabled();
  });
});
