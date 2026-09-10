import { expect, test } from '@playwright/test';
import {
  failNextStorageComplete,
  inspectMock,
  resetMock,
} from './helpers/mock.ts';

test.describe('admin storage upload complete', () => {
  test('calls complete after PUT and reports ready only then', async ({
    page,
  }) => {
    await resetMock('ready');
    await page.goto('/storage/browse?container=docs');
    await page.getByRole('button', { name: 'Upload' }).first().click();
    await expect(
      page.getByRole('heading', { name: 'Upload Files' })
    ).toBeVisible();
    await page.locator('input[type=file]').setInputFiles({
      name: 'note.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('hello world'),
    });
    await page.getByRole('button', { name: 'Upload 1 file' }).click();
    await expect(page.getByText(/ · Ready/)).toBeVisible();
    const inspect = await inspectMock();
    expect(inspect.completedUploadIds).toHaveLength(1);
    expect(inspect.lastUploadCompleteFailed).toBe(false);
  });

  test('keeps a failed complete visible and not indexable', async ({
    page,
  }) => {
    await resetMock('ready');
    await failNextStorageComplete();
    await page.goto('/storage/browse?container=docs');
    await page.getByRole('button', { name: 'Upload' }).first().click();
    await page.locator('input[type=file]').setInputFiles({
      name: 'stuck.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('pending bytes'),
    });
    await page.getByRole('button', { name: 'Upload 1 file' }).click();
    await expect(
      page.getByText(
        'Bytes reached storage, but completion failed. The file is not ready or indexable.'
      )
    ).toBeVisible();
    await expect(page.getByText(/ · Ready/)).toHaveCount(0);
    await expect(
      page.getByText('Failed uploads are not ready or indexable.')
    ).toBeVisible();
    const inspect = await inspectMock();
    expect(inspect.completedUploadIds).toEqual([]);
    expect(inspect.lastUploadCompleteFailed).toBe(true);
  });
});
