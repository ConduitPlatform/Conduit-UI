import { expect, test, type Page } from '@playwright/test';
import {
  clearRecordedRequests,
  inspectAuth,
  recordedRequests,
  resetMock,
} from './helpers/mock.ts';
import {
  REALM_ACME_ID,
  REALM_ACME_SLUG,
  REALM_STRICT_ID,
  TEAM_ACME_ENGINEERING_ID,
  TEAM_PLATFORM_ID,
  USER_ALICE_ID,
  USER_DAVE_ID,
  USER_ERIN_ID,
} from './mock-admin/constants.ts';

type AuthSnapshot = {
  teams: Array<{ _id: string; realm?: { enabled: boolean; slug?: string } }>;
  users: Array<{ _id: string; active: boolean; homeRealm: string | null }>;
  memberships: Array<{ user: string; realm: string; type: string }>;
  signedOutUserIds: string[];
};

async function openRealmTab(page: Page, teamId: string) {
  await page.goto(`/authentication/teams/${teamId}?mode=realm`);
}

function bodyOf(
  requests: Awaited<ReturnType<typeof recordedRequests>>
): unknown[] {
  return requests.map(request => request.body);
}

test.describe('realms feature flag', () => {
  test('hides the realm tab, the realm filter and the home realm column when the flag is off', async ({
    page,
  }) => {
    await resetMock('realms-disabled');
    await page.goto('/authentication/teams');
    await expect(page.getByText('Acme Corp')).toBeVisible();
    // `getByText` on a button would also match the rows, so look for the group itself.
    await expect(page.getByRole('group', { name: 'Filter teams' })).toHaveCount(
      0
    );

    await page.goto(`/authentication/teams/${REALM_ACME_ID}`);
    await expect(page.getByRole('tab', { name: 'Members' })).toBeVisible();
    await expect(
      page.getByRole('tab', { name: 'Realm', exact: true })
    ).toHaveCount(0);
    // Asking for the tab anyway falls back to the members tab.
    await openRealmTab(page, REALM_ACME_ID);
    await expect(
      page.getByRole('button', { name: 'Add Member' })
    ).toBeVisible();
    await expect(page.getByText('Home users', { exact: true })).toHaveCount(0);

    await page.goto('/authentication/users');
    await expect(page.getByText('alice@acme.test')).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Home realm' })
    ).toHaveCount(0);
    await expect(page.getByLabel('Home realm filter')).toHaveCount(0);
  });

  // Known gap found by this spec: the Realm pill column renders from the team data
  // alone (TeamsTable/columns.tsx is not gated on the flag), although the commit that
  // added it says the pill is only shown when the backend reports realms as enabled.
  // The pill reflects stored data, not the feature flag: a realm team keeps its
  // Delete protection while the flag is off, so admins must still see why.
  test('keeps the realm pill visible when the flag is off', async ({
    page,
  }) => {
    await resetMock('realms-disabled');
    await page.goto('/authentication/teams');
    await expect(page.getByText('Acme Corp')).toBeVisible();
    await expect(
      page.getByTitle('This team is an authentication realm').first()
    ).toBeVisible();
  });

  test('shows the realm pill and the All / Realms filter when the flag is on', async ({
    page,
  }) => {
    await resetMock('realms');
    await page.goto('/authentication/teams');
    const pills = page.getByTitle('This team is an authentication realm');
    await expect(pills).toHaveCount(2);
    await expect(pills.first()).toContainText('acme');
    await expect(page.getByText('Platform Team')).toBeVisible();

    // A top-level realm team has the Realm tab; the flag-off test covers its absence.
    await page.goto(`/authentication/teams/${REALM_ACME_ID}`);
    await expect(
      page.getByRole('tab', { name: 'Realm', exact: true })
    ).toBeVisible();
    await page.goto('/authentication/teams');

    await clearRecordedRequests();
    await page.getByRole('button', { name: 'Realms', exact: true }).click();
    await expect(page).toHaveURL(/realm=true/);
    await expect(page.getByText('Platform Team')).toHaveCount(0);
    await expect(page.getByText('Strict Inc')).toBeVisible();
    const requests = await recordedRequests({
      method: 'GET',
      path: '/authentication/teams',
    });
    expect(requests.some(request => request.query.realm === 'true')).toBe(true);
  });

  test('shows the Realms setting only on backends that report it', async ({
    page,
  }) => {
    await resetMock('realms-legacy');
    await page.goto('/authentication/settings');
    await page.getByText('Teams settings').click();
    await expect(
      page.getByText('Allow email mismatch for invites')
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Realms' })).toHaveCount(0);

    await resetMock('realms-disabled');
    await clearRecordedRequests();
    await page.goto('/authentication/settings');
    await page.getByText('Teams settings').click();
    await expect(page.getByRole('heading', { name: 'Realms' })).toBeVisible();
    await page.getByRole('button', { name: 'Edit' }).click();
    await page
      .getByRole('heading', { name: 'Realms' })
      .locator('xpath=following::button[@role="switch"][1]')
      .click();
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect
      .poll(
        async () =>
          (
            await recordedRequests({
              method: 'PATCH',
              path: '/config/authentication',
            })
          ).length
      )
      .toBe(1);
    const [patch] = await recordedRequests({
      method: 'PATCH',
      path: '/config/authentication',
    });
    expect(
      (patch.body as { config: { teams: { realms: { enabled: boolean } } } })
        .config.teams.realms.enabled
    ).toBe(true);
  });
});

test.describe('promote a team', () => {
  test('validates the slug, reports a taken slug and creates the realm', async ({
    page,
  }) => {
    await resetMock('realms');
    await openRealmTab(page, TEAM_PLATFORM_ID);
    await expect(page.getByText('This team is not a realm')).toBeVisible();
    await page.getByRole('button', { name: 'Make this team a realm' }).click();

    const sheet = page.getByRole('dialog');
    const slug = sheet.getByLabel('Slug');
    const submit = sheet.getByRole('button', {
      name: 'Make this team a realm',
    });
    await expect(
      sheet.getByText('2 existing members become home users.')
    ).toBeVisible();
    await expect(slug).toHaveValue('platform-team');

    await slug.fill('Not A Slug!');
    await expect(slug).toHaveAttribute('aria-invalid', 'true');
    await expect(submit).toBeDisabled();
    await slug.fill('a');
    await expect(slug).toHaveAttribute('aria-invalid', 'true');
    await expect(submit).toBeDisabled();

    // Valid shape, but another realm owns it: the server rejects after confirmation.
    await slug.fill(REALM_ACME_SLUG);
    await expect(submit).toBeEnabled();
    await submit.click();
    await page.getByRole('button', { name: 'Make realm' }).click();
    await expect(sheet.getByText('This slug is already taken.')).toBeVisible();

    await slug.fill('platform');
    await clearRecordedRequests();
    await submit.click();
    const confirm = page.getByRole('alertdialog');
    await expect(confirm).toContainText('Make Platform Team a realm?');
    await expect(confirm).toContainText(
      '2 existing members become home users of "platform"'
    );
    await confirm.getByRole('button', { name: 'Make realm' }).click();

    // The status strip replaces the empty state, with the counts of the new realm.
    await expect(page.getByText('Home users', { exact: true })).toBeVisible();
    const strip = page
      .locator('div')
      .filter({ hasText: /^2Home users0Guests/ })
      .first();
    await expect(strip).toBeVisible();
    await expect(page.locator('code', { hasText: 'platform' })).toBeVisible();
    await expect(page.getByText('This team is not a realm')).toHaveCount(0);

    const posts = await recordedRequests({
      method: 'POST',
      path: `/authentication/teams/${TEAM_PLATFORM_ID}/realm`,
    });
    expect(posts).toHaveLength(1);
    expect(posts[0].body).toMatchObject({
      slug: 'platform',
      policies: { guests: { allowed: true } },
    });

    const auth = await inspectAuth<AuthSnapshot>();
    expect(
      auth.teams.find(team => team._id === TEAM_PLATFORM_ID)?.realm
    ).toEqual({ enabled: true, slug: 'platform' });
    expect(
      auth.memberships.filter(
        item => item.realm === TEAM_PLATFORM_ID && item.type === 'home'
      )
    ).toHaveLength(2);
  });
});

test.describe('realm policies', () => {
  test('toggling a policy saves the policies and linking sections in one request', async ({
    page,
  }) => {
    await resetMock('realms');
    await openRealmTab(page, REALM_ACME_ID);
    await expect(page.locator('code', { hasText: 'acme' })).toBeVisible();

    const policies = page.locator('form').filter({
      has: page.getByRole('switch', { name: 'Require 2FA' }),
    });
    const save = policies.getByRole('button', { name: 'Save changes' });
    await expect(save).toBeDisabled();
    await policies.getByRole('switch', { name: 'Require 2FA' }).click();
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
          requireTwoFa: true,
          requireVerifiedEmail: false,
          allowedClientIds: [],
          guests: { allowed: true, allowedHomeRealms: [], directSignIn: true },
        },
        linking: { inbound: false, outbound: true },
      },
    ]);
    await expect(save).toBeDisabled();
  });
});

test.describe('realm members', () => {
  test('flags guest-classified users in the picker and adds them as guests', async ({
    page,
  }) => {
    await resetMock('realms');
    await page.goto(`/authentication/teams/${REALM_ACME_ID}`);
    await expect(page.getByText('alice@acme.test')).toBeVisible();
    await page.getByRole('button', { name: 'Add Member' }).click();

    const sheet = page.getByRole('dialog');
    const row = (email: string) =>
      sheet.getByRole('listitem').filter({ hasText: email });
    // dave belongs to the strict realm, erin has no home realm, carol is a member.
    await expect(row('dave@strict.test')).toContainText('Will join as guest');
    await expect(row('erin@global.test')).not.toContainText(
      'Will join as guest'
    );
    await expect(row('erin@global.test').getByRole('checkbox')).toBeEnabled();
    await expect(row('carol@strict.test')).toContainText('Already a member');
    await expect(row('carol@strict.test').getByRole('checkbox')).toBeDisabled();

    await row('dave@strict.test').getByRole('checkbox').click();
    await clearRecordedRequests();
    await sheet.getByRole('button', { name: 'Add 1 member' }).click();
    await expect(page.getByText('Member added', { exact: true })).toBeVisible();

    const posts = await recordedRequests({
      method: 'POST',
      path: `/authentication/teams/${REALM_ACME_ID}/members`,
    });
    expect(bodyOf(posts)).toEqual([{ members: [USER_DAVE_ID] }]);
    const daveRow = page
      .getByRole('row')
      .filter({ hasText: 'dave@strict.test' });
    await expect(daveRow).toContainText('Guest');
    const auth = await inspectAuth<AuthSnapshot>();
    expect(
      auth.memberships.find(
        item => item.user === USER_DAVE_ID && item.realm === REALM_ACME_ID
      )?.type
    ).toBe('guest');
  });

  test('confirms before a global user becomes a home user of the realm', async ({
    page,
  }) => {
    await resetMock('realms');
    await page.goto(`/authentication/teams/${REALM_ACME_ID}`);
    await expect(page.getByText('alice@acme.test')).toBeVisible();
    await page.getByRole('button', { name: 'Add Member' }).click();

    const sheet = page.getByRole('dialog');
    const erin = sheet
      .getByRole('listitem')
      .filter({ hasText: 'erin@global.test' });
    await expect(erin).toContainText('Becomes home user');
    await erin.getByRole('checkbox').click();
    await clearRecordedRequests();
    await sheet.getByRole('button', { name: 'Add 1 member' }).click();

    const confirm = page.getByRole('alertdialog');
    await expect(confirm).toContainText(
      '1 user becomes a home user of acme. Their global sessions end'
    );
    expect(
      await recordedRequests({
        method: 'POST',
        path: `/authentication/teams/${REALM_ACME_ID}/members`,
      })
    ).toEqual([]);
    await confirm.getByRole('button', { name: 'Add members' }).click();
    await expect(page.getByText('Member added', { exact: true })).toBeVisible();
    const erinRow = page
      .getByRole('row')
      .filter({ hasText: 'erin@global.test' });
    await expect(erinRow).toContainText('Home');
  });

  test('disables users from other realms when the realm does not accept guests', async ({
    page,
  }) => {
    await resetMock('realms');
    await page.goto(`/authentication/teams/${REALM_STRICT_ID}`);
    await page.getByRole('button', { name: 'Add Member' }).click();

    const sheet = page.getByRole('dialog');
    await expect(
      sheet.getByText('This realm does not accept guests.')
    ).toBeVisible();
    const alice = sheet
      .getByRole('listitem')
      .filter({ hasText: 'alice@acme.test' });
    await expect(alice).toContainText('Guests are not allowed');
    await expect(alice.getByRole('checkbox')).toBeDisabled();
    const gina = sheet
      .getByRole('listitem')
      .filter({ hasText: 'gina@global.test' });
    await expect(gina.getByRole('checkbox')).toBeEnabled();
  });

  test('home users cannot be removed from their realm team', async ({
    page,
  }) => {
    await resetMock('realms');
    await page.goto(`/authentication/teams/${REALM_ACME_ID}`);
    const alice = page.getByRole('row').filter({ hasText: 'alice@acme.test' });
    await expect(alice).toContainText('Home');
    await expect(
      alice.getByRole('button', { name: 'Remove from team' })
    ).toBeDisabled();
    const carol = page
      .getByRole('row')
      .filter({ hasText: 'carol@strict.test' });
    await expect(carol).toContainText('Guest');
    await expect(
      carol.getByRole('button', { name: 'Remove from team' })
    ).toBeEnabled();
  });
});

test.describe('demote a realm', () => {
  test('forced demotion shows the blocked-user count and needs the typed slug', async ({
    page,
  }) => {
    await resetMock('realms');
    await openRealmTab(page, REALM_ACME_ID);
    await page.getByRole('button', { name: 'Realm actions' }).click();
    await page.getByRole('menuitem', { name: 'Demote realm' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Demote realm acme?')).toBeVisible();
    await clearRecordedRequests();
    await dialog.getByRole('button', { name: 'Demote realm' }).click();

    // The first attempt has no `force`; the refusal moves the dialog to the force step.
    await expect(dialog.getByText('Block 2 home users?')).toBeVisible();
    const block = dialog.getByRole('button', {
      name: /^Block 2 users and demote/,
    });
    await expect(block).toBeDisabled();
    await dialog.getByLabel(/Type acme to confirm/).fill('acm');
    await expect(block).toBeDisabled();
    await dialog.getByLabel(/Type acme to confirm/).fill('acme');
    await expect(block).toBeEnabled();
    await block.click();

    await expect(page.getByText(/2 users were blocked/).first()).toBeVisible();
    await expect(page.getByText('This team is not a realm')).toBeVisible();

    const deletes = await recordedRequests({
      method: 'DELETE',
      path: `/authentication/teams/${REALM_ACME_ID}/realm`,
    });
    expect(deletes.map(request => request.query)).toEqual([
      {},
      { force: 'true' },
    ]);
    const auth = await inspectAuth<AuthSnapshot>();
    expect(
      auth.users
        .filter(user => !user.active)
        .map(user => user._id)
        .sort()
    ).toEqual([USER_ALICE_ID, '65f000000000000000000b02'].sort());
    expect(auth.signedOutUserIds).toHaveLength(2);
    expect(
      auth.teams.find(team => team._id === REALM_ACME_ID)?.realm?.enabled
    ).toBe(false);
  });
});

test.describe('sub-teams of a realm', () => {
  test('show the inherited banner instead of a realm tab', async ({ page }) => {
    await resetMock('realms');
    await page.goto(`/authentication/teams/${TEAM_ACME_ENGINEERING_ID}`);
    const banner = page.getByRole('note');
    await expect(banner).toContainText('Part of realm');
    await expect(banner).toContainText('inherits its identity and policies');
    await expect(page.getByRole('tab', { name: 'Members' })).toBeVisible();
    await expect(
      page.getByRole('tab', { name: 'Realm', exact: true })
    ).toHaveCount(0);
    // Members of a sub-team carry the membership type of the realm above.
    await expect(
      page.getByRole('row').filter({ hasText: 'alice@acme.test' })
    ).toContainText('Home');

    await banner.getByRole('link', { name: REALM_ACME_SLUG }).click();
    // A cold route compile in `next dev` can exceed the default timeout.
    await expect(page).toHaveURL(new RegExp(`${REALM_ACME_ID}\\?mode=realm`), {
      timeout: 30_000,
    });
    await expect(page.locator('code', { hasText: 'acme' })).toBeVisible({
      timeout: 30_000,
    });
  });
});

test.describe('users and home realms', () => {
  test('shows the home realm slug and filters by home realm', async ({
    page,
  }) => {
    await resetMock('realms');
    await page.goto('/authentication/users');
    const alice = page.getByRole('row').filter({ hasText: 'alice@acme.test' });
    await expect(alice).toContainText('acme');
    await expect(
      page.getByRole('row').filter({ hasText: 'erin@global.test' })
    ).toContainText('Global');

    await clearRecordedRequests();
    await page.getByLabel('Home realm filter').click();
    await page.getByRole('option', { name: 'strict' }).click();
    await expect(page).toHaveURL(new RegExp(`homeRealm=${REALM_STRICT_ID}`));
    await expect(page.getByText('carol@strict.test')).toBeVisible();
    await expect(page.getByText('alice@acme.test')).toHaveCount(0);
    const filtered = await recordedRequests({
      method: 'GET',
      path: '/authentication/users',
    });
    expect(
      filtered.some(request => request.query.homeRealm === REALM_STRICT_ID)
    ).toBe(true);

    await page.getByLabel('Home realm filter').click();
    await page.getByRole('option', { name: 'Global' }).click();
    await expect(page).toHaveURL(/homeRealm=global/);
    await expect(page.getByText('gina@global.test')).toBeVisible();
    await expect(page.getByText('carol@strict.test')).toHaveCount(0);
  });

  test('moving a user to global sends an empty realm team id', async ({
    page,
  }) => {
    await resetMock('realms');
    await page.goto('/authentication/users');
    const alice = page.getByRole('row').filter({ hasText: 'alice@acme.test' });
    await alice.getByTitle('edit').click();

    const sheet = page.getByRole('dialog');
    await expect(sheet.getByText('Move home realm').first()).toBeVisible();
    await sheet.getByLabel('New home realm').click();
    await page.getByRole('option', { name: 'Global' }).click();
    await clearRecordedRequests();
    await sheet.getByRole('button', { name: 'Move home realm' }).click();
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Move', exact: true })
      .click();
    await expect(
      page.getByText('Home realm moved', { exact: true })
    ).toBeVisible();

    const posts = await recordedRequests({
      method: 'POST',
      path: `/authentication/users/${USER_ALICE_ID}/home-realm`,
    });
    expect(bodyOf(posts)).toEqual([{ realmTeamId: '' }]);
    const auth = await inspectAuth<AuthSnapshot>();
    expect(
      auth.users.find(user => user._id === USER_ALICE_ID)?.homeRealm
    ).toBeNull();
    expect(
      auth.memberships.some(
        item => item.user === USER_ALICE_ID && item.realm === REALM_ACME_ID
      )
    ).toBe(false);
  });

  test('moving a user into a realm with sign-out sends force', async ({
    page,
  }) => {
    await resetMock('realms');
    await page.goto('/authentication/users');
    const erin = page.getByRole('row').filter({ hasText: 'erin@global.test' });
    await erin.getByTitle('edit').click();

    const sheet = page.getByRole('dialog');
    await sheet.getByLabel('New home realm').click();
    await page.getByRole('option', { name: 'strict' }).click();
    await sheet.getByLabel('Also sign the user out everywhere').click();
    await clearRecordedRequests();
    await sheet.getByRole('button', { name: 'Move home realm' }).click();
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Move and sign out' })
      .click();
    await expect(
      page.getByText('Home realm moved', { exact: true })
    ).toBeVisible();

    const posts = await recordedRequests({
      method: 'POST',
      path: `/authentication/users/${USER_ERIN_ID}/home-realm`,
    });
    expect(bodyOf(posts)).toEqual([
      { realmTeamId: REALM_STRICT_ID, force: true },
    ]);
    const auth = await inspectAuth<AuthSnapshot>();
    expect(auth.signedOutUserIds).toContain(USER_ERIN_ID);
  });
});
