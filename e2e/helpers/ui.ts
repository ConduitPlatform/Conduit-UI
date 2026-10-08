import { expect, type Page } from '@playwright/test';
import { E2E_PASSWORD, E2E_USERNAME } from '../mock-admin/constants.ts';

export async function loginThroughUi(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByPlaceholder('username').fill(E2E_USERNAME);
  await page.getByPlaceholder('******').fill(E2E_PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(url => !url.pathname.startsWith('/login'));
}

export async function openEmbeddingsNav(page: Page): Promise<void> {
  const link = page.locator('a[href="/embeddings"]').first();
  await expect(link).toBeVisible();
}

export async function expectNoEmbeddingsNav(page: Page): Promise<void> {
  await expect(page.locator('a[href="/embeddings"]')).toHaveCount(0);
}

export function exactText(page: Page, text: string) {
  return page.getByText(text, { exact: true });
}

export async function dismissDevOverlay(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.querySelectorAll('nextjs-portal').forEach(node => node.remove());
  });
}

export async function switchToDarkTheme(page: Page): Promise<void> {
  await dismissDevOverlay(page);
  const viewport = page.viewportSize();
  if (viewport && viewport.width < 768) {
    await page.keyboard.press('ControlOrMeta+b');
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'a', exact: true })
      .click();
  } else {
    await page.getByRole('button', { name: 'a', exact: true }).click({
      force: true,
    });
  }
  await page.getByText('Theme', { exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Dark' }).click();
}
