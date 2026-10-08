import { expect, test } from '@playwright/test';
import { resetMock, revokeMockTokens } from './helpers/mock.ts';

test.describe('session handling', () => {
  test('redirects unauthenticated visits to login', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    await page.goto('/embeddings');
    await expect(page).toHaveURL(/\/login/);
    await context.close();
  });

  test('redirects to login when the Admin API returns 401', async ({
    page,
  }) => {
    await resetMock('ready');
    await page.goto('/embeddings/configs/cfg_product');
    await expect(
      page.getByRole('heading', { name: 'Matching index' })
    ).toBeVisible();
    await revokeMockTokens();
    const timeoutUrls: string[] = [];
    page.on('request', request => {
      if (request.url().includes('session-timeout=true')) {
        timeoutUrls.push(request.url());
      }
    });
    await page.goto('/embeddings/configs/cfg_product');
    await expect(page).toHaveURL(/\/login/);
    expect(timeoutUrls.length).toBeGreaterThan(0);
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    const cookies = await page.context().cookies();
    expect(cookies.some(cookie => cookie.name.endsWith('AccessToken'))).toBe(
      false
    );
  });
});
