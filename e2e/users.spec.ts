import { expect, test } from '@playwright/test';
import {
  clearRecordedRequests,
  failUserOperation,
  inspectAuth,
  recordedRequests,
  resetMock,
  setLegacyUserAdmin,
} from './helpers/mock.ts';
import {
  USER_ALICE_ID,
  USER_BOB_ID,
  USER_ERIN_ID,
} from './mock-admin/constants.ts';

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
    expect(unverified.at(-1)?.body).toEqual({ isVerified: false });

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
    expect(patches.at(-1)?.body).toEqual({ isVerified: false });
  });
});

test.describe('user management', () => {
  test('filters by blocked, unverified, and provider', async ({ page }) => {
    await resetMock('realms-disabled');
    await page.goto('/authentication/users');
    await clearRecordedRequests();

    await page.getByRole('combobox', { name: 'Status' }).click();
    await page.getByRole('option', { name: 'Blocked' }).click();
    await expect(page).toHaveURL(/isActive=false/);
    await expect(
      page.getByRole('row').filter({ hasText: 'bob@acme.test' })
    ).toBeVisible();
    await expect(
      page.getByRole('row').filter({ hasText: 'alice@acme.test' })
    ).toHaveCount(0);
    const blocked = await recordedRequests({
      method: 'GET',
      path: '/authentication/users',
    });
    expect(blocked.some(request => request.query.isActive === 'false')).toBe(
      true
    );

    await page.getByRole('combobox', { name: 'Status' }).click();
    await page.getByRole('option', { name: 'All statuses' }).click();
    await page.getByRole('combobox', { name: 'Verified' }).click();
    await page.getByRole('option', { name: 'Unverified' }).click();
    await expect(page).toHaveURL(/isVerified=false/);
    await expect(
      page.getByRole('row').filter({ hasText: 'erin@global.test' })
    ).toBeVisible();
    await expect(
      page.getByRole('row').filter({ hasText: 'alice@acme.test' })
    ).toHaveCount(0);
    const unverified = await recordedRequests({
      method: 'GET',
      path: '/authentication/users',
    });
    expect(
      unverified.some(request => request.query.isVerified === 'false')
    ).toBe(true);

    await page.getByRole('combobox', { name: 'Verified' }).click();
    await page.getByRole('option', { name: 'All verification' }).click();
    await page.getByRole('combobox', { name: 'Provider' }).click();
    await page.getByRole('option', { name: 'Google' }).click();
    await expect(page).toHaveURL(/provider=google/);
    await expect(
      page.getByRole('row').filter({ hasText: 'carol@strict.test' })
    ).toBeVisible();
    await expect(
      page.getByRole('row').filter({ hasText: 'alice@acme.test' })
    ).toHaveCount(0);
    const providers = await recordedRequests({
      method: 'GET',
      path: '/authentication/users',
    });
    expect(providers.some(request => request.query.provider === 'google')).toBe(
      true
    );
  });

  test('sorts by registered date', async ({ page }) => {
    await resetMock('realms-disabled');
    await page.goto('/authentication/users');
    const header = page.getByRole('columnheader', { name: 'Registered' });
    await header.getByRole('button', { name: 'Registered' }).click();
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await header.getByRole('button', { name: 'Registered' }).click();
    await expect(header).toHaveAttribute('aria-sort', 'descending');
    await expect(page).toHaveURL(/sort=-createdAt/);
    await expect(page.getByRole('row').nth(1)).toContainText('bob@acme.test');
    const listed = await recordedRequests({
      method: 'GET',
      path: '/authentication/users',
    });
    expect(listed.some(request => request.query.sort === '-createdAt')).toBe(
      true
    );
  });

  test('blocks the selected users one request each', async ({ page }) => {
    await resetMock('realms-disabled');
    await page.goto('/authentication/users');
    await clearRecordedRequests();
    await page
      .getByRole('checkbox', { name: 'Select alice@acme.test' })
      .click();
    await page
      .getByRole('checkbox', { name: 'Select erin@global.test' })
      .click();
    const bulk = page.getByRole('region', { name: 'Bulk actions' });
    await bulk.getByRole('button', { name: 'Block', exact: true }).click();
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Block 2 users' })
      .click();
    const alice = page.getByRole('row').filter({ hasText: 'alice@acme.test' });
    const erin = page.getByRole('row').filter({ hasText: 'erin@global.test' });
    await expect(alice.getByText('Blocked')).toBeVisible();
    await expect(erin.getByText('Blocked')).toBeVisible();
    const blocks = await recordedRequests({ method: 'POST', path: /\/block$/ });
    expect(blocks).toHaveLength(2);
    expect(blocks.map(request => request.path).sort()).toEqual(
      [
        `/authentication/users/${USER_ALICE_ID}/block`,
        `/authentication/users/${USER_ERIN_ID}/block`,
      ].sort()
    );
  });

  test('deletes in bulk and keeps the failed row selected', async ({
    page,
  }) => {
    await resetMock('realms-disabled');
    await failUserOperation('delete', USER_ALICE_ID);
    await page.goto('/authentication/users');
    await page
      .getByRole('checkbox', { name: 'Select alice@acme.test' })
      .click();
    await page.getByRole('checkbox', { name: 'Select bob@acme.test' }).click();
    await page
      .getByRole('region', { name: 'Bulk actions' })
      .getByRole('button', { name: 'Delete' })
      .click();
    const dialog = page.getByRole('alertdialog');
    await dialog
      .getByLabel('Type delete 2 users to confirm')
      .fill('delete 2 users');
    await dialog.getByRole('button', { name: 'Delete 2 users' }).click();
    await expect(
      page.getByText('1 of 2 users deleted. 1 failed', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('row').filter({ hasText: 'bob@acme.test' })
    ).toHaveCount(0);
    await expect(
      page.getByRole('checkbox', { name: 'Select alice@acme.test' })
    ).toBeChecked();
    const deleted = await recordedRequests({
      method: 'DELETE',
      path: `/authentication/users/${USER_BOB_ID}`,
    });
    expect(deleted).toHaveLength(1);
  });

  test('changes email and phone with an allow-listed patch', async ({
    page,
  }) => {
    await resetMock('realms-disabled');
    await page.goto('/authentication/users');
    await page
      .getByRole('row')
      .filter({ hasText: 'alice@acme.test' })
      .getByTitle('edit')
      .click();
    const sheet = page.getByRole('dialog', { name: 'Edit user' });
    await sheet.getByRole('button', { name: 'Change' }).click();
    await sheet.getByLabel('New email').fill('new-alice@acme.test');
    await clearRecordedRequests();
    await sheet.getByRole('button', { name: 'Save email' }).click();
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Change email' })
      .click();
    await expect(
      page.getByText('Email updated', { exact: true })
    ).toBeVisible();

    await sheet.getByLabel('Phone').fill('+30 691-234-5678');
    await sheet.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(sheet.getByLabel('Phone')).toHaveValue('+306912345678');

    const patches = await recordedRequests({
      method: 'PATCH',
      path: `/authentication/users/${USER_ALICE_ID}`,
    });
    expect(patches[0]?.body).toEqual({
      email: 'new-alice@acme.test',
      isVerified: true,
    });
    expect(patches.at(-1)?.body).toEqual({
      phoneNumber: '+306912345678',
    });
  });

  test('sets a password and records only that body', async ({ page }) => {
    await resetMock('realms-disabled');
    await page.goto('/authentication/users');
    await page
      .getByRole('row')
      .filter({ hasText: 'alice@acme.test' })
      .getByTitle('edit')
      .click();
    await page
      .getByRole('dialog', { name: 'Edit user' })
      .getByRole('button', { name: 'Set password' })
      .click();
    const dialog = page.getByRole('dialog', { name: 'Set password' });
    await dialog.getByLabel('New password').fill('longenough');
    await dialog.getByLabel('Confirm password').fill('longenough');
    await clearRecordedRequests();
    await dialog.getByRole('button', { name: 'Set password' }).click();
    await expect(
      page.getByText('Password updated', { exact: true })
    ).toBeVisible();
    const posted = await recordedRequests({
      method: 'POST',
      path: `/authentication/users/${USER_ALICE_ID}/password`,
    });
    expect(posted).toHaveLength(1);
    expect(posted[0]?.body).toEqual({
      password: 'longenough',
      revokeSessions: true,
    });
  });

  test('hides gated controls when capabilities are missing', async ({
    page,
  }) => {
    await resetMock('realms-disabled');
    await setLegacyUserAdmin(true);
    await page.goto('/authentication/users');
    await expect(page.getByRole('combobox', { name: 'Verified' })).toHaveCount(
      0
    );
    await expect(page.getByRole('combobox', { name: 'Status' })).toBeVisible();
    await page
      .getByRole('row')
      .filter({ hasText: 'alice@acme.test' })
      .getByTitle('edit')
      .click();
    const sheet = page.getByRole('dialog', { name: 'Edit user' });
    await expect(sheet.getByRole('switch', { name: 'Verified' })).toBeVisible();
    await expect(sheet.getByRole('region', { name: 'Password' })).toHaveCount(
      0
    );
    await expect(sheet.getByRole('region', { name: 'Teams' })).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await page.getByRole('combobox', { name: 'Status' }).click();
    await page.getByRole('option', { name: 'Blocked' }).click();
    await expect(
      page.getByRole('row').filter({ hasText: 'bob@acme.test' })
    ).toBeVisible();
    const listed = await recordedRequests({
      method: 'GET',
      path: '/authentication/users',
    });
    expect(listed.some(request => 'isVerified' in request.query)).toBe(false);
  });
});
