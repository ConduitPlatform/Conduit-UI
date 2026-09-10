import { expect, test } from '@playwright/test';
import { resetMock } from './helpers/mock.ts';

test.describe('generic embedding sources', () => {
  test('creates a storage source with selectors and MIME controls', async ({
    page,
  }) => {
    await resetMock('blank');
    await page.goto('/embeddings/configs');
    await expect(page.getByRole('heading', { name: 'Configs' })).toBeVisible();
    await page.getByRole('button', { name: 'New' }).click();
    await page.getByRole('menuitem', { name: 'Conduit Storage' }).click();
    await expect(
      page.getByRole('heading', { name: 'New Conduit Storage source' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Create source/ })
    ).toBeDisabled();
    await page.getByLabel('Label').fill('Contracts');
    await page.getByRole('combobox', { name: 'Access scope' }).click();
    await page.getByRole('option', { name: 'Acme' }).click();
    await page.getByRole('combobox', { name: 'Container' }).click();
    await page.getByPlaceholder('Search containers').fill('do');
    await page.getByRole('option', { name: 'docs' }).click();
    await page.getByRole('combobox', { name: 'Folder prefix' }).click();
    await page.getByRole('option', { name: 'invoices' }).click();
    await page.getByRole('checkbox', { name: /Plain text/ }).click();
    await page.getByRole('button', { name: 'Extraction limits' }).click();
    await expect(page.getByText(/at most 8 MiB per file/)).toBeVisible();
    await page.getByRole('button', { name: /Create source/ }).click();
    await expect(page).toHaveURL(/\/embeddings\/sources\/src_/);
    await expect(
      page.getByRole('heading', { name: 'Contracts' })
    ).toBeVisible();
    await expect(page.getByText(/Pending/)).toBeVisible();
    const crumbs = page.getByRole('navigation', { name: 'breadcrumb' });
    await expect(crumbs.getByText('Source', { exact: true })).toBeVisible();
  });

  test('edits mutable storage fields and keeps the profile locked', async ({
    page,
  }) => {
    await resetMock('ready');
    await page.goto('/embeddings/sources/src_storage');
    await expect(page.getByRole('heading', { name: 'Invoices' })).toBeVisible();
    await expect(page.getByText('Queued')).toBeVisible();
    await expect(page.getByText(/failed or retrying/)).toBeVisible();
    await expect(
      page.getByRole('combobox', { name: 'Provider' })
    ).toBeDisabled();
    await expect(page.getByRole('combobox', { name: 'Model' })).toBeDisabled();
    await expect(
      page.getByRole('combobox', { name: 'Access scope' })
    ).toBeDisabled();
    await page.getByLabel('Label').fill('Invoice files');
    await page.getByRole('button', { name: /Save source/ }).click();
    await expect(
      page
        .getByRole('region', { name: 'Notifications (F8)' })
        .getByText('Source updated')
    ).toBeVisible();
  });

  test('confirms reconcile, disable, and purge', async ({ page }) => {
    await resetMock('ready');
    await page.goto('/embeddings/sources/src_storage');
    await page.getByRole('button', { name: 'Reconcile' }).click();
    const dialog = page.getByRole('alertdialog');
    await expect(
      dialog.getByRole('heading', { name: 'Reconcile storage files?' })
    ).toBeVisible();
    await expect(dialog.getByText(/also covers backfill/)).toBeVisible();
    await dialog.getByRole('button', { name: 'Reconcile' }).click();
    await expect(
      page
        .getByRole('region', { name: 'Notifications (F8)' })
        .getByText('Reconcile queued')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Disable' }).click();
    await expect(
      page.getByRole('heading', { name: 'Disable this source?' })
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(
      page.getByRole('heading', { name: 'Disable this source?' })
    ).toHaveCount(0);
    await page.getByRole('button', { name: 'Disable' }).click();
    await page.getByRole('button', { name: 'Disable source' }).click();
    await expect(
      page
        .getByRole('region', { name: 'Notifications (F8)' })
        .getByText('Source disabled')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Purge' }).click();
    await page.getByRole('button', { name: 'Purge source' }).click();
    await expect(page).toHaveURL(/\/embeddings\/configs/);
    await expect(page.getByRole('link', { name: 'Invoices' })).toHaveCount(0);
  });

  test('shows trusted ingest instructions for external sources', async ({
    page,
  }) => {
    await resetMock('ready');
    await page.goto('/embeddings/configs');
    await page.getByRole('button', { name: 'New' }).click();
    await page.getByRole('menuitem', { name: 'External / custom' }).click();
    await expect(
      page.getByRole('heading', { name: 'New External / custom source' })
    ).toBeVisible();
    await expect(page.getByText(/no browser upload/i)).toBeVisible();
    await expect(page.getByText(/OneDrive/i)).toHaveCount(0);
    await page.goto('/embeddings/sources/src_external');
    await expect(
      page.getByRole('heading', { name: 'Knowledge base' })
    ).toBeVisible();
    await expect(page.getByText('Trusted ingest')).toBeVisible();
    await expect(
      page.getByText('POST /embeddings/sources/src_external/documents')
    ).toBeVisible();
    await expect(page.getByText(/syncDocument/)).toBeVisible();
    await expect(page.getByRole('button', { name: /upload/i })).toHaveCount(0);
    await expect(page.getByText(/BM25|hybrid/i)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Reconcile' })).toHaveCount(
      0
    );
  });

  test('keeps database schema create on the existing config route', async ({
    page,
  }) => {
    await resetMock('blank');
    await page.goto('/embeddings/configs');
    await page.getByRole('button', { name: 'New' }).click();
    await page.getByRole('menuitem', { name: 'Database schema' }).click();
    await expect(page).toHaveURL(/\/embeddings\/configs\/new$/);
    await expect(
      page.getByRole('heading', { name: 'New config' })
    ).toBeVisible();
  });
});
