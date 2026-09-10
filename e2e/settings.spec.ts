import { expect, test } from '@playwright/test';
import { inspectMock, resetMock } from './helpers/mock.ts';
import { exactText } from './helpers/ui.ts';
import { MOCK_ADMIN_ORIGIN, STORED_API_KEY } from './mock-admin/constants.ts';

test.describe('embeddings settings', () => {
  test('keeps the stored API key when a redacted update omits it', async ({
    page,
  }) => {
    await resetMock('ready');
    await page.goto('/embeddings/settings');
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('switch', { name: 'Workers' })).toBeVisible();
    await expect(
      page.getByText('Workload is serving. Workers can run when enabled.')
    ).toBeVisible();
    await expect(
      page.getByText(
        'A key is already stored. Leave blank to keep it, or enter a replacement.'
      )
    ).toBeVisible();
    await expect(page.getByLabel('Provider')).toHaveValue('openai-compatible');
    await expect(page.getByText('Allowed hosts')).toHaveCount(0);
    await expect(page.getByText('Require gRPC key')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Models' })).toBeVisible();
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByLabel('Model name')).toBeVisible();
    await page.getByLabel('Dimensions').fill('3072');
    await expect(page.getByLabel('API key')).toHaveValue('');
    expect(await page.content()).not.toContain(STORED_API_KEY);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(exactText(page, 'Embeddings settings saved')).toBeVisible();
    const inspect = await inspectMock();
    expect(inspect.storedApiKeyConfigured).toBe(true);
    expect(inspect.lastSettingsPatchHadApiKey).toBe(false);
  });

  test('adds a model and keeps the selected default until it is cleared', async ({
    page,
  }) => {
    await resetMock('ready');
    await page.goto('/embeddings/settings');
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(
      page.getByRole('button', {
        name: 'Clear or change the default model before removing this row',
      })
    ).toBeDisabled();
    await page.getByRole('button', { name: 'Add model' }).click();
    const names = page.getByLabel('Model name');
    const dimensions = page.getByLabel('Dimensions');
    await expect(names).toHaveCount(2);
    await names.nth(1).fill('text-embedding-3-large');
    await dimensions.nth(1).fill('3072');
    await expect(
      page.getByRole('button', { name: 'Remove text-embedding-3-large' })
    ).toBeEnabled();
    await page.getByRole('button', { name: 'Advanced limits' }).click();
    await expect(page.getByText(/Deployment-managed/)).toBeVisible();
    await expect(
      page.getByText(
        'Production gRPC access uses the deployment GRPC_KEY. It is not configured here.'
      )
    ).toBeVisible();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(exactText(page, 'Embeddings settings saved')).toBeVisible();
  });

  test('toggles workers from module config without waiting for serving', async ({
    page,
  }) => {
    await resetMock('workers-off');
    await page.goto('/embeddings/settings');
    const workers = page.getByRole('switch', { name: 'Workers' });
    await expect(workers).not.toBeChecked();
    await expect(
      page.getByText('Workload is serving. Workers can run when enabled.')
    ).toBeVisible();
    await workers.click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await page.getByRole('button', { name: 'Proceed' }).click();
    await expect(exactText(page, 'Embeddings settings saved')).toBeVisible();
    await expect(workers).toBeChecked();
    const inspect = await inspectMock();
    expect(inspect.workersEnabled).toBe(true);
  });

  test('rejects mock test-control routes without the control header', async () => {
    const response = await fetch(`${MOCK_ADMIN_ORIGIN}/__test__/state`);
    expect(response.status).toBe(403);
  });
});
