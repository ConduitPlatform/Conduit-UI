import { expect, test } from '@playwright/test';
import { openEmbeddingsNav, switchToDarkTheme } from './helpers/ui.ts';
import { resetMock } from './helpers/mock.ts';

test.describe('viewport and theme smoke', () => {
  test('renders embeddings in light and dark', async ({ page }, testInfo) => {
    await resetMock('ready');
    await page.goto('/embeddings');
    await expect(
      page.getByRole('heading', { name: 'Readiness' })
    ).toBeVisible();
    const light = await page.screenshot({ fullPage: false });
    await testInfo.attach('overview-light', {
      body: light,
      contentType: 'image/png',
    });

    await switchToDarkTheme(page);
    await expect(page.locator('html')).toHaveClass(/dark/);
    const dark = await page.screenshot({ fullPage: false });
    await testInfo.attach('overview-dark', {
      body: dark,
      contentType: 'image/png',
    });
  });

  test('keeps embeddings reachable on a narrow viewport', async ({ page }) => {
    await resetMock('ready');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/embeddings');
    await expect(
      page.getByRole('heading', { name: 'Readiness' })
    ).toBeVisible();
    await page.keyboard.press('ControlOrMeta+b');
    await openEmbeddingsNav(page);
  });

  test('keeps configs readable on a narrow viewport', async ({ page }) => {
    await resetMock('ready');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/embeddings/configs');
    await expect(page.getByRole('heading', { name: 'Configs' })).toBeVisible();
    await expect(
      page
        .getByRole('definition')
        .filter({ hasText: 'openai-compatible/text-embedding-3-small' })
        .first()
    ).toBeVisible();
    await expect(
      page.getByRole('term').filter({ hasText: 'Index' }).first()
    ).toBeVisible();
  });
});
