import { expect, test } from '@playwright/test';
import { resetMock } from './helpers/mock.ts';

test.describe('embeddings overview', () => {
  test('shows a ready operator path', async ({ page }) => {
    await resetMock('ready');
    await page.goto('/embeddings');
    await expect(
      page.getByRole('heading', { name: 'Readiness' })
    ).toBeVisible();
    await expect(
      page.getByText(
        'Capabilities, provider, index, config, and workers are ready.'
      )
    ).toBeVisible();
    await expect(page.getByText('Vector storage and search')).toBeVisible();
    await expect(page.getByText('Provider configured')).toBeVisible();
    await expect(page.getByText('Matching index queryable')).toBeVisible();
    await expect(page.getByText('Config enabled')).toBeVisible();
    await expect(page.getByText('Workers enabled')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Storage extraction queue' })
    ).toBeVisible();
    await expect(page.getByText('Ready').first()).toBeVisible();
    await expect(page.getByText('Module Information')).toHaveCount(0);
    const readiness = page.getByRole('heading', { name: 'Readiness' });
    const metrics = page.getByRole('heading', { name: 'Key Metrics' });
    await expect(readiness).toBeVisible();
    const readinessBox = await readiness.boundingBox();
    const metricsBox = await metrics.boundingBox();
    expect(readinessBox && metricsBox && readinessBox.y < metricsBox.y).toBe(
      true
    );
  });

  test('shows a gated overview when capabilities and workers are blocked', async ({
    page,
  }) => {
    await resetMock('gated');
    await page.goto('/embeddings');
    await expect(
      page.getByRole('heading', { name: 'Readiness' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Vector capabilities unavailable' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Workers disabled' })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Open Database' })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Configure provider' }).first()
    ).toBeVisible();
    await expect(page.getByText('Module Information')).toHaveCount(0);
  });
});
