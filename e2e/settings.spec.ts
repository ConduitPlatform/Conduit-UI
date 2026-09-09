import { expect, test } from '@playwright/test';
import { inspectMock, resetMock } from './helpers/mock.ts';

test.describe('embeddings settings', () => {
  test('keeps the stored API key when a redacted update omits it', async ({
    page,
  }) => {
    await resetMock('ready');
    await page.goto('/embeddings/settings');
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await expect(
      page.getByText(
        'A key is already stored. Leave blank to keep it, or enter a replacement.'
      )
    ).toBeVisible();
    await page.getByRole('button', { name: 'Edit' }).click();
    const model = page.getByLabel('Default model');
    await model.fill('text-embedding-3-large');
    await expect(page.getByLabel('API key')).toHaveValue('');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Embeddings settings saved')).toBeVisible();
    const inspect = await inspectMock();
    expect(inspect.storedApiKeyConfigured).toBe(true);
    expect(inspect.lastSettingsPatchHadApiKey).toBe(false);
  });
});
