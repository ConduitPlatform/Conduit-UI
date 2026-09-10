import { expect, test } from '@playwright/test';
import { resetMock } from './helpers/mock.ts';

test.describe('test search', () => {
  test('returns hits, an empty result, and a provider error', async ({
    page,
  }) => {
    await resetMock('ready');
    await page.goto('/embeddings/test');
    await expect(
      page.getByRole('heading', { name: 'Test Search' })
    ).toBeVisible();
    const query = page.getByLabel('Query');
    await query.fill('published guide');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(
      page.getByRole('cell', { name: 'Published guide' })
    ).toBeVisible();
    await expect(
      page.getByText('2 results. Higher score is better.')
    ).toBeVisible();
    await expect(page.getByText('super-secret')).toHaveCount(0);
    await expect(page.getByText('sk-live-secret')).toHaveCount(0);
    await expect(page.getByText('tok-secret')).toHaveCount(0);
    await expect(
      page.getByRole('columnheader', { name: 'password' })
    ).toHaveCount(0);
    await expect(
      page.getByRole('columnheader', { name: 'embedding' })
    ).toHaveCount(0);
    await page.getByRole('tab', { name: 'JSON' }).click();
    await expect(page.getByRole('tree', { name: 'JSON view' })).toBeVisible();
    await expect(page.getByText('super-secret')).toHaveCount(0);
    await expect(page.getByText('sk-live-secret')).toHaveCount(0);
    await expect(page.getByText('tok-secret')).toHaveCount(0);

    await query.fill('nomatch');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByText('No matches')).toBeVisible();

    await query.fill('fail');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByText('Search failed')).toBeVisible();
    await expect(
      page.getByText(
        'The embeddings service is temporarily unavailable. Check that workers are enabled and the provider is reachable, then retry.'
      )
    ).toBeVisible();
    await expect(page.getByText('No matches')).toHaveCount(0);
    await expect(
      page.getByRole('cell', { name: 'Published guide' })
    ).toHaveCount(0);
  });

  test('searches a generic source without leaking text, hashes, or links', async ({
    page,
  }) => {
    await resetMock('ready');
    await page.goto('/embeddings/test?sourceId=src_storage');
    await expect(
      page.getByRole('combobox', { name: 'Search source' })
    ).toContainText('Invoices');
    await expect(
      page.getByText(
        'Operator-wide Admin search. It does not exercise Client ReBAC.'
      )
    ).toBeVisible();
    await expect(page.getByLabel('Scope')).toHaveCount(0);
    await page.getByLabel('Query').fill('invoice');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByText('src_storage')).toBeVisible();
    await expect(page.getByText('doc_9')).toBeVisible();
    await expect(page.getByText('{"tag":"invoice"}')).toBeVisible();
    await expect(page.getByText('https://files.example/item')).toBeVisible();
    await expect(
      page.getByRole('link', { name: /files\.example/ })
    ).toHaveCount(0);
    await expect(page.getByText('secret excerpt')).toHaveCount(0);
    await expect(page.getByText('super-secret')).toHaveCount(0);
    await expect(page.getByText('abc')).toHaveCount(0);
    await expect(
      page.getByRole('columnheader', { name: 'embedding' })
    ).toHaveCount(0);
    await expect(page.getByRole('columnheader', { name: 'text' })).toHaveCount(
      0
    );
  });

  test('searches when workers are off', async ({ page }) => {
    await resetMock('workers-off');
    await page.goto('/embeddings/test');
    await expect(
      page.getByRole('heading', { name: 'Workers disabled' })
    ).toBeVisible();
    await page.getByLabel('Query').fill('published guide');
    await expect(page.getByRole('button', { name: 'Search' })).toBeEnabled();
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(
      page.getByRole('cell', { name: 'Published guide' })
    ).toBeVisible();
  });
});
