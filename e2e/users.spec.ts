import { expect, test } from '@playwright/test';
import {
  clearRecordedRequests,
  inspectAuth,
  recordedRequests,
  resetMock,
} from './helpers/mock.ts';
import { USER_ALICE_ID } from './mock-admin/constants.ts';

test.describe('user verification', () => {
  test('unverifies and verifies a user from the row', async ({ page }) => {
    await resetMock('realms-disabled');
    await page.goto('/authentication/users');
    const alice = page.getByRole('row').filter({ hasText: 'alice@acme.test' });
    await expect(
      alice.getByRole('button', { name: 'Unverify alice@acme.test' })
    ).toBeVisible();

    await clearRecordedRequests();
    await alice
      .getByRole('button', { name: 'Unverify alice@acme.test' })
      .click();
    const unverify = page.getByRole('alertdialog');
    await expect(unverify).toContainText('alice@acme.test');
    await unverify.getByRole('button', { name: 'Unverify' }).click();
    await expect(
      page.getByText('User unverified', { exact: true })
    ).toBeVisible();
    await expect(
      alice.getByRole('button', { name: 'Verify alice@acme.test' })
    ).toBeVisible();

    const unverified = await recordedRequests({
      method: 'PATCH',
      path: `/authentication/users/${USER_ALICE_ID}`,
    });
    expect(unverified.at(-1)?.body).toMatchObject({
      email: 'alice@acme.test',
      isVerified: false,
      hasTwoFA: false,
    });

    await alice.getByRole('button', { name: 'Verify alice@acme.test' }).click();
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Verify' })
      .click();
    await expect(
      page.getByText('User verified', { exact: true })
    ).toBeVisible();
    await expect(
      alice.getByRole('button', { name: 'Unverify alice@acme.test' })
    ).toBeVisible();

    const auth = await inspectAuth<{
      users: Array<{ _id: string; isVerified: boolean }>;
    }>();
    expect(
      auth.users.find(user => user._id === USER_ALICE_ID)?.isVerified
    ).toBe(true);
  });

  test('toggles verification from the edit sheet', async ({ page }) => {
    await resetMock('realms');
    await page.goto('/authentication/users');
    const alice = page.getByRole('row').filter({ hasText: 'alice@acme.test' });
    await alice.getByTitle('edit').click();

    const sheet = page.getByRole('dialog');
    const toggle = sheet.getByRole('switch', { name: 'Verified' });
    await expect(toggle).toBeChecked();
    await clearRecordedRequests();
    await toggle.click();
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Unverify' })
      .click();
    await expect(
      page.getByText('User unverified', { exact: true })
    ).toBeVisible();
    await expect(toggle).not.toBeChecked();

    const patches = await recordedRequests({
      method: 'PATCH',
      path: `/authentication/users/${USER_ALICE_ID}`,
    });
    expect(patches.at(-1)?.body).toMatchObject({
      email: 'alice@acme.test',
      isVerified: false,
    });
  });
});
