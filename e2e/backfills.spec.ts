import { expect, test } from '@playwright/test';
import { resetMock } from './helpers/mock.ts';
import { exactText } from './helpers/ui.ts';

test.describe('embedding backfills', () => {
  test('starts a run and advances queued to running to completed', async ({
    page,
  }) => {
    await resetMock('ready');
    await page.goto('/embeddings/backfills');
    await page.getByRole('button', { name: 'Start backfill' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.locator('#start-schema').click();
    await page.getByRole('option', { name: 'Product' }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Start backfill' })
      .click();
    await expect(exactText(page, 'Backfill queued')).toBeVisible();
    await expect(page.getByRole('dialog')).toBeHidden();
    await page.getByRole('link', { name: 'Product' }).first().click();
    await expect(exactText(page, 'Queued')).toBeVisible();
    await expect(exactText(page, 'Running')).toBeVisible({ timeout: 15_000 });
    await expect(exactText(page, 'Completed')).toBeVisible({
      timeout: 15_000,
    });
  });

  test('cancels a run and resumes it', async ({ page }) => {
    await resetMock('ready');
    await page.goto('/embeddings/backfills');
    await page.getByRole('button', { name: 'Start backfill' }).click();
    await page.locator('#start-schema').click();
    await page.getByRole('option', { name: 'Product' }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Start backfill' })
      .click();
    await expect(exactText(page, 'Backfill queued')).toBeVisible();
    await expect(page.getByRole('dialog')).toBeHidden();
    await page.getByRole('link', { name: 'Product' }).first().click();
    await page.getByRole('button', { name: 'Cancel run' }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Cancel run' })
      .click();
    await expect(exactText(page, 'Backfill canceled')).toBeVisible();
    await expect(exactText(page, 'Canceled').first()).toBeVisible();
    await page.getByRole('button', { name: 'Resume run' }).click();
    await expect(exactText(page, 'Backfill resumed')).toBeVisible();
    await expect(exactText(page, 'Queued')).toBeVisible();
  });
});
