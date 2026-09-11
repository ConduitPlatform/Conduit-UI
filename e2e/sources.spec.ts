import { expect, test } from '@playwright/test';
import { configureMock, resetMock } from './helpers/mock.ts';

const STORAGE_AUTHORIZATION_WARNING =
  'Storage authorization is not configured.';

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
    await expect(
      page.getByRole('option', { name: 'All folders' })
    ).toBeVisible();
    await page.getByRole('option', { name: 'invoices/' }).click();
    await page.getByRole('checkbox', { name: /Plain text/ }).click();
    await page.getByRole('button', { name: 'Extraction limits' }).click();
    await expect(page.getByText(/at most 8 MiB per file/)).toBeVisible();
    await page.getByRole('button', { name: /Create source/ }).click();
    await expect(page).toHaveURL(/\/embeddings\/sources\/src_/);
    await expect(
      page.getByRole('heading', { name: 'Contracts' })
    ).toBeVisible();
    await expect(page.getByText('Pending · not searchable')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Disable' })).toHaveCount(0);
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
    await expect(page.getByText(/currently failed/)).toBeVisible();
    await expect(page.getByText(/Failed documents stay listed/)).toBeVisible();
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
    const toast = page.getByRole('region', { name: 'Notifications (F8)' });
    await expect(toast.getByText('Reconcile queued')).toBeVisible();
    await expect(toast.getByText(/Recovered 2 failed jobs/)).toBeVisible();

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

    await page.getByRole('button', { name: 'Enable' }).click();
    await expect(
      page.getByRole('heading', { name: 'Enable this source?' })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Enable source' }).click();
    await expect(
      page
        .getByRole('region', { name: 'Notifications (F8)' })
        .getByText('Source enabled')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Purge' }).click();
    await page.getByRole('button', { name: 'Purge source' }).click();
    await expect(page).toHaveURL(/\/embeddings\/configs/);
    await expect(page.getByRole('link', { name: 'Invoices' })).toHaveCount(0);
  });

  test('clears stale failed extraction jobs after reconcile', async ({
    page,
  }) => {
    await resetMock('ready');
    await page.goto('/embeddings');
    await expect(
      page.getByRole('heading', { name: 'Failed extraction jobs' })
    ).toBeVisible();
    await page.goto('/embeddings/sources/src_storage');
    await expect(page.getByText(/currently failed/)).toBeVisible();
    await page.getByRole('button', { name: 'Reconcile' }).click();
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Reconcile' })
      .click();
    await expect(
      page
        .getByRole('region', { name: 'Notifications (F8)' })
        .getByText(/Recovered 2 failed jobs/)
    ).toBeVisible();
    await expect(page.getByText(/currently failed/)).toHaveCount(0);
    await expect(page.getByText(/Failed documents stay listed/)).toBeVisible();
    await page.goto('/embeddings');
    await expect(
      page.getByRole('heading', { name: 'Failed extraction jobs' })
    ).toHaveCount(0);
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

  test('selects a container beyond the first hundred', async ({ page }) => {
    await resetMock('blank');
    await configureMock({ seedContainers: 104 });
    await page.goto('/embeddings/sources/new?kind=conduit-storage');
    await page.getByLabel('Label').fill('Late archive');
    await page.getByRole('combobox', { name: 'Access scope' }).click();
    await page.getByRole('option', { name: 'Acme' }).click();
    await page.getByRole('combobox', { name: 'Container' }).click();
    await expect(page.getByText(/Search to find others/)).toHaveCount(0);
    await page.getByPlaceholder('Search containers').fill('archive-late');
    await page.getByRole('option', { name: 'archive-late' }).click();
    await page.getByRole('button', { name: /Create source/ }).click();
    await expect(page).toHaveURL(/\/embeddings\/sources\/src_/);
    await expect(
      page.getByRole('heading', { name: 'Late archive' })
    ).toBeVisible();
  });

  test('does not claim enable success when the source stays pending', async ({
    page,
  }) => {
    await resetMock('ready');
    await page.goto('/embeddings/sources/src_storage');
    await page.getByRole('button', { name: 'Disable' }).click();
    await page.getByRole('button', { name: 'Disable source' }).click();
    await expect(
      page
        .getByRole('region', { name: 'Notifications (F8)' })
        .getByText('Source disabled')
    ).toBeVisible();
    await configureMock({
      nextEnable: {
        state: 'pending',
        chunkIndexStatus: 'pending',
        warnings: [STORAGE_AUTHORIZATION_WARNING],
      },
    });
    await page.getByRole('button', { name: 'Enable' }).click();
    await page.getByRole('button', { name: 'Enable source' }).click();
    const toast = page.getByRole('region', { name: 'Notifications (F8)' });
    await expect(
      toast.getByText('Enable finished with warnings')
    ).toBeVisible();
    await expect(toast.getByText(STORAGE_AUTHORIZATION_WARNING)).toBeVisible();
    await expect(toast.getByText('Source enabled')).toHaveCount(0);
    await expect(page.getByText('Pending · not searchable')).toBeVisible();
  });

  test('surfaces a Storage authorization create error as-is', async ({
    page,
  }) => {
    await resetMock('blank');
    await configureMock({
      failNextSourceCreate: STORAGE_AUTHORIZATION_WARNING,
    });
    await page.goto('/embeddings/sources/new?kind=conduit-storage');
    await page.getByLabel('Label').fill('Blocked docs');
    await page.getByRole('combobox', { name: 'Access scope' }).click();
    await page.getByRole('option', { name: 'Acme' }).click();
    await page.getByRole('combobox', { name: 'Container' }).click();
    await page.getByRole('option', { name: 'docs' }).click();
    await page.getByRole('button', { name: /Create source/ }).click();
    await expect(
      page
        .getByRole('region', { name: 'Notifications (F8)' })
        .getByText(STORAGE_AUTHORIZATION_WARNING)
    ).toBeVisible();
    await expect(page).toHaveURL(/\/embeddings\/sources\/new/);
  });

  test('shows a Storage authorization warning without claiming selector tenancy', async ({
    page,
  }) => {
    await resetMock('blank');
    await configureMock({
      sourceWarnings: [STORAGE_AUTHORIZATION_WARNING],
    });
    await page.goto('/embeddings/sources/new?kind=conduit-storage');
    await expect(page.getByText(/do not provide tenancy/)).toBeVisible();
    await expect(
      page.getByText(/This is a storage filter, not tenancy/)
    ).toBeVisible();
    await page.getByLabel('Label').fill('Authz docs');
    await page.getByRole('combobox', { name: 'Access scope' }).click();
    await page.getByRole('option', { name: 'Acme' }).click();
    await page.getByRole('combobox', { name: 'Container' }).click();
    await page.getByRole('option', { name: 'docs' }).click();
    await page.getByRole('button', { name: /Create source/ }).click();
    await expect(
      page
        .getByRole('region', { name: 'Notifications (F8)' })
        .getByText(STORAGE_AUTHORIZATION_WARNING)
    ).toBeVisible();
    await expect(page).toHaveURL(/\/embeddings\/sources\/src_/);
    await expect(page.getByText('Warnings')).toBeVisible();
    await expect(
      page.getByText(/Embedding source .* is pending/).filter({
        hasText: STORAGE_AUTHORIZATION_WARNING,
      })
    ).toBeVisible();
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
