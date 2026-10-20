import { expect, test } from '@playwright/test';
import {
  clearRecordedRequests,
  inspectAuth,
  recordedRequests,
  resetMock,
} from './helpers/mock.ts';
import { REALM_ACME_ID, USER_CAROL_ID } from './mock-admin/constants.ts';

/** Isolated scenario: one email (sam@shared.test) is held once in acme and once in strict. */
const REFUSAL =
  '1 identifier(s) are held by more than one account; identity mode cannot return to shared';

type AuthSnapshot = {
  identityMode: string;
  realmSettings: Array<{
    team: string;
    linking: { inbound: boolean; outbound: boolean };
    policies: { guests: { directSignIn: boolean } };
  }>;
  memberships: Array<{ user: string; realm: string; type: string }>;
};

function bodyOf(
  requests: Awaited<ReturnType<typeof recordedRequests>>
): unknown[] {
  return requests.map(request => request.body);
}

test.describe('isolated identity mode', () => {
  test('shows the identity mode and the refusal when reverting to shared', async ({
    page,
  }) => {
    await resetMock('realms-isolated');
    await page.goto('/authentication/settings');
    await page.getByText('Teams settings').click();

    const mode = page.getByRole('combobox', { name: 'Identity mode' });
    await expect(mode).toContainText(
      'Isolated: each realm has its own accounts'
    );
    await expect(
      page.getByText(/The same email or phone can exist once per realm/)
    ).toBeVisible();

    await page.getByRole('button', { name: 'Edit' }).click();
    await mode.click();
    await page
      .getByRole('option', {
        name: 'Shared: one account per person across realms',
      })
      .click();
    await clearRecordedRequests();
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(
      page.getByText('Failed to save authentication settings', { exact: true })
    ).toBeVisible();
    await expect(page.getByText(REFUSAL, { exact: true })).toBeVisible();

    const patches = await recordedRequests({
      method: 'PATCH',
      path: '/config/authentication',
    });
    expect(patches).toHaveLength(1);
    expect(
      (
        patches[0].body as {
          config: { teams: { realms: { identityMode: string } } };
        }
      ).config.teams.realms.identityMode
    ).toBe('shared');
    expect((await inspectAuth<AuthSnapshot>()).identityMode).toBe('isolated');
  });

  test('saves the linking switches and direct sign-in in the same PATCH as the policies', async ({
    page,
  }) => {
    await resetMock('realms-isolated');
    await page.goto(`/authentication/teams/${REALM_ACME_ID}?mode=realm`);
    await expect(page.locator('code', { hasText: 'acme' })).toBeVisible();

    const policies = page.locator('form').filter({
      has: page.getByRole('switch', { name: 'Require 2FA' }),
    });
    const save = policies.getByRole('button', { name: 'Save changes' });
    await policies
      .getByRole('switch', {
        name: 'Accept connected accounts from other realms',
      })
      .click();
    await policies
      .getByRole('switch', {
        name: "Let this realm's accounts connect to other realms",
      })
      .click();
    await policies
      .getByRole('switch', {
        name: 'Connected accounts can sign in here directly',
      })
      .click();
    await expect(save).toBeEnabled();

    await clearRecordedRequests();
    await save.click();
    await expect(
      page.getByText('Realm policies saved', { exact: true })
    ).toBeVisible();

    const patches = await recordedRequests({
      method: 'PATCH',
      path: `/authentication/teams/${REALM_ACME_ID}/realm`,
    });
    expect(bodyOf(patches)).toEqual([
      {
        policies: {
          requireTwoFa: false,
          requireVerifiedEmail: false,
          allowedClientIds: [],
          guests: {
            allowed: true,
            allowedHomeRealms: [],
            directSignIn: false,
          },
        },
        linking: { inbound: true, outbound: false },
      },
    ]);

    const acme = (await inspectAuth<AuthSnapshot>()).realmSettings.find(
      item => item.team === REALM_ACME_ID
    );
    expect(acme?.linking).toEqual({ inbound: true, outbound: false });
    expect(acme?.policies.guests.directSignIn).toBe(false);
  });

  test('unlinks a guest realm from the edit user sheet after confirming', async ({
    page,
  }) => {
    await resetMock('realms-isolated');
    await page.goto('/authentication/users');
    const carol = page
      .getByRole('row')
      .filter({ hasText: 'carol@strict.test' });
    await carol.getByTitle('edit').click();

    const realms = page
      .getByRole('dialog')
      .getByRole('region', { name: 'Realms' });
    await expect(realms.getByText('acme', { exact: true })).toBeVisible();
    await realms.getByRole('button', { name: 'Unlink acme' }).click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toContainText(
      'carol@strict.test will no longer be able to sign in at acme. Sessions at acme end.'
    );
    await clearRecordedRequests();
    await dialog.getByRole('button', { name: 'Unlink', exact: true }).click();

    await expect(
      page.getByText('Realm unlinked', { exact: true })
    ).toBeVisible();
    await expect(
      realms.getByText('Not linked to any other realm.')
    ).toBeVisible();
    const deletes = await recordedRequests({
      method: 'DELETE',
      path: `/authentication/realms/${REALM_ACME_ID}/guests/${USER_CAROL_ID}`,
    });
    expect(deletes).toHaveLength(1);
    const auth = await inspectAuth<AuthSnapshot>();
    expect(
      auth.memberships.some(
        item => item.user === USER_CAROL_ID && item.realm === REALM_ACME_ID
      )
    ).toBe(false);
  });

  test('shows the same email once per realm, with each home realm slug', async ({
    page,
  }) => {
    await resetMock('realms-isolated');
    await page.goto('/authentication/users');
    await expect(
      page.getByText(
        'Isolated identity mode: the same email can appear once per realm'
      )
    ).toBeVisible();

    const rows = page.getByRole('row').filter({ hasText: 'sam@shared.test' });
    await expect(rows).toHaveCount(2);
    await expect(rows.filter({ hasText: 'acme' })).toHaveCount(1);
    await expect(rows.filter({ hasText: 'strict' })).toHaveCount(1);
  });

  test('labels the same email in the members picker with each home realm', async ({
    page,
  }) => {
    await resetMock('realms-isolated');
    await page.goto(`/authentication/teams/${REALM_ACME_ID}`);
    await expect(page.getByText('alice@acme.test')).toBeVisible();
    await page.getByRole('button', { name: 'Add Member' }).click();

    const rows = page
      .getByRole('dialog')
      .getByRole('listitem')
      .filter({ hasText: 'sam@shared.test' });
    await expect(rows).toHaveCount(2);
    // The acme account is already a member; the strict account joins acme as a guest.
    await expect(
      rows.filter({ hasText: 'acme' }).filter({ hasText: 'Already a member' })
    ).toHaveCount(1);
    await expect(
      rows
        .filter({ hasText: 'strict' })
        .filter({ hasText: 'Will join as guest' })
    ).toHaveCount(1);
  });
});
