import { expect, test } from '@playwright/test';
import { configureMock, resetMock } from './helpers/mock.ts';

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
      page.getByRole('heading', { name: 'Failed extraction jobs' })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Open Invoices' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Embeddings not ready' })
    ).toHaveCount(0);
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

  test('treats generic-only ready sources as a usable catalogue', async ({
    page,
  }) => {
    await resetMock('generic-ready');
    await page.goto('/embeddings');
    await expect(
      page.getByText(
        'Capabilities, provider, index, config, and workers are ready.'
      )
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Embeddings not ready' })
    ).toHaveCount(0);
    await expect(
      page.getByRole('heading', { name: 'Failed extraction jobs' })
    ).toHaveCount(0);
    await expect(
      page.getByText('At least one generic source is ready')
    ).toBeVisible();
    await expect(
      page
        .getByText('Schema embedding configurations')
        .locator('xpath=preceding-sibling::*[1]')
    ).toHaveText('0');
    await expect(
      page
        .getByText('Storage and external embedding sources')
        .locator('xpath=preceding-sibling::*[1]')
    ).toHaveText('2');
  });

  test('keeps pending-only generic sources from looking ready', async ({
    page,
  }) => {
    await resetMock('pending-sources');
    await page.goto('/embeddings');
    await expect(page.getByText('Matching index queryable')).toBeVisible();
    await expect(page.getByText('Waiting').first()).toBeVisible();
    await expect(
      page.getByText(
        'Capabilities, provider, index, config, and workers are ready.'
      )
    ).toHaveCount(0);
  });

  test('treats an empty catalogue as a healthy no-workload state', async ({
    page,
  }) => {
    await resetMock('blank');
    await page.goto('/embeddings');
    await expect(
      page.getByText(
        'Capabilities, provider, index, config, and workers are ready.'
      )
    ).toBeVisible();
    await expect(
      page.getByText('No configured workload').first()
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Embeddings not ready' })
    ).toHaveCount(0);
    await expect(
      page
        .getByText('Schema embedding configurations')
        .locator('xpath=preceding-sibling::*[1]')
    ).toHaveText('0');
    await expect(
      page
        .getByText('Storage and external embedding sources')
        .locator('xpath=preceding-sibling::*[1]')
    ).toHaveText('0');
  });

  test('keeps schema-only readiness when generic sources are absent', async ({
    page,
  }) => {
    await resetMock('ready');
    await configureMock({ clearSources: true, storageQueueFailed: 0 });
    await page.goto('/embeddings');
    await expect(
      page.getByText(
        'Capabilities, provider, index, config, and workers are ready.'
      )
    ).toBeVisible();
    await expect(
      page.getByText('At least one config is enabled')
    ).toBeVisible();
    await expect(
      page
        .getByText('Storage and external embedding sources')
        .locator('xpath=preceding-sibling::*[1]')
    ).toHaveText('0');
  });

  test('treats disabled and revoked sources as no configured workload', async ({
    page,
  }) => {
    await resetMock('disabled-sources');
    await page.goto('/embeddings');
    await expect(
      page.getByText('No configured workload').first()
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Embeddings not ready' })
    ).toHaveCount(0);
  });

  test('blocks failed generic sources', async ({ page }) => {
    await resetMock('failed-sources');
    await page.goto('/embeddings');
    await expect(
      page.getByText('Matching index failed', { exact: true })
    ).toBeVisible();
    await expect(page.getByText('Blocked').first()).toBeVisible();
  });

  test('still derives source-only readiness without status workload fields', async ({
    page,
  }) => {
    await resetMock('generic-ready');
    await configureMock({ omitWorkloadCounts: true });
    await page.goto('/embeddings');
    await expect(
      page.getByText('At least one generic source is ready')
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Embeddings not ready' })
    ).toHaveCount(0);
  });

  test('clears the failed-job alert after the queue recovers', async ({
    page,
  }) => {
    await resetMock('ready');
    await page.goto('/embeddings');
    await expect(
      page.getByRole('heading', { name: 'Failed extraction jobs' })
    ).toBeVisible();
    await configureMock({ storageQueueFailed: 0 });
    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Failed extraction jobs' })
    ).toHaveCount(0);
    await expect(
      page.getByText(
        'Capabilities, provider, index, config, and workers are ready.'
      )
    ).toBeVisible();
  });
});
