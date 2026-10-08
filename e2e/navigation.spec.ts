import { expect, test } from '@playwright/test';
import { expectNoEmbeddingsNav, openEmbeddingsNav } from './helpers/ui.ts';
import { resetMock } from './helpers/mock.ts';

test.describe('embeddings navigation', () => {
  test('shows Embeddings in the sidebar when the module is registered', async ({
    page,
  }) => {
    await resetMock('ready');
    await page.goto('/');
    await openEmbeddingsNav(page);
    await page.locator('a[href="/embeddings"]').first().click();
    await expect(page).toHaveURL(/\/embeddings$/);
    await expect(
      page.getByRole('heading', { name: 'Readiness' })
    ).toBeVisible();
  });

  test('hides Embeddings when the module is absent', async ({ page }) => {
    await resetMock('no-embeddings');
    await page.goto('/');
    await expectNoEmbeddingsNav(page);
    await page.goto('/embeddings');
    await expect(
      page.getByRole('heading', { name: 'Embeddings Module Not Deployed' })
    ).toBeVisible();
  });
});
