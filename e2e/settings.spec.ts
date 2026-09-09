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
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(
      page.getByRole('textbox', { name: 'Add allowed hosts' })
    ).toBeVisible();
    const model = page.getByLabel('Default model');
    await model.fill('text-embedding-3-large');
    await expect(page.getByLabel('API key')).toHaveValue('');
    expect(await page.content()).not.toContain(STORED_API_KEY);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(exactText(page, 'Embeddings settings saved')).toBeVisible();
    const inspect = await inspectMock();
    expect(inspect.storedApiKeyConfigured).toBe(true);
    expect(inspect.lastSettingsPatchHadApiKey).toBe(false);
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
