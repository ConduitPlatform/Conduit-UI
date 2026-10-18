import { expect, test, type Page } from '@playwright/test';
import {
  clearRecordedRequests,
  inspectAuth,
  recordedRequests,
  resetMock,
} from './helpers/mock.ts';
import { REALM_ACME_ID } from './mock-admin/constants.ts';

type SettingsSnapshot = {
  realmSettings: Array<{
    team: string;
    strategies: { oauth: Record<string, Record<string, unknown>> };
    oauthSecrets: Record<string, Record<string, string>>;
  }>;
};

const REALM_PATH = `/authentication/teams/${REALM_ACME_ID}/realm`;

async function openIdentity(page: Page) {
  await resetMock('realms');
  await page.goto(`/authentication/teams/${REALM_ACME_ID}?mode=realm`);
  await expect(page.getByText('Social providers')).toBeVisible();
}

async function openCredentials(page: Page, provider: string) {
  await page.getByRole('button', { name: `${provider} credentials` }).click();
}

async function acmeSettings() {
  const auth = await inspectAuth<SettingsSnapshot>();
  const settings = auth.realmSettings.find(item => item.team === REALM_ACME_ID);
  if (!settings) throw new Error('acme settings missing');
  return settings;
}

async function realmPatches() {
  return recordedRequests({ method: 'PATCH', path: REALM_PATH });
}

test.describe('realm OAuth credentials', () => {
  test('inherit to own sends the typed id and secret, never a has* flag', async ({
    page,
  }) => {
    await openIdentity(page);
    await openCredentials(page, 'google');
    await expect(
      page.getByText('This realm uses the global google configuration.')
    ).toBeVisible();
    await page
      .getByRole('radiogroup', { name: 'google credentials source' })
      .getByLabel('Own credentials')
      .check();
    await page.locator('#realm-oauth-google-clientId').fill('acme-google-id');
    await page
      .locator('#realm-oauth-google-clientSecret')
      .fill('acme-google-secret');

    await clearRecordedRequests();
    await page
      .getByRole('button', { name: 'Save changes', disabled: false })
      .click();
    await expect(
      page.getByText('Realm identity saved', { exact: true })
    ).toBeVisible();

    const patches = await realmPatches();
    expect(patches).toHaveLength(1);
    const body = patches[0].body as {
      strategies: { oauth: Record<string, Record<string, unknown>> };
    };
    expect(body.strategies.oauth.google).toMatchObject({
      clientId: 'acme-google-id',
      clientSecret: 'acme-google-secret',
    });
    expect(JSON.stringify(body)).not.toMatch(/has(ClientSecret|PrivateKey)/);

    // The secret is stored but only its presence is read back.
    const stored = await acmeSettings();
    expect(stored.oauthSecrets.google).toEqual({
      clientSecret: 'acme-google-secret',
    });
    expect(stored.strategies.oauth.google).toMatchObject({
      clientId: 'acme-google-id',
    });
    await expect(page.getByText('set', { exact: true }).first()).toBeVisible();
    expect(await page.content()).not.toContain('acme-google-secret');
  });

  test('own to inherit clears every credential field', async ({ page }) => {
    await openIdentity(page);
    await openCredentials(page, 'github');
    await expect(page.locator('#realm-oauth-github-clientId')).toHaveValue(
      'acme-github-client'
    );
    await page
      .getByRole('radiogroup', { name: 'github credentials source' })
      .getByLabel('Inherit global')
      .check();

    await clearRecordedRequests();
    await page
      .getByRole('button', { name: 'Save changes', disabled: false })
      .click();
    await expect(
      page.getByText('Realm identity saved', { exact: true })
    ).toBeVisible();

    // The row had no accountLinking override, so that key is not part of the body.
    expect((await realmPatches()).map(request => request.body)).toEqual([
      {
        strategies: {
          oauth: {
            github: {
              clientId: null,
              clientSecret: null,
              redirect_uri: null,
              privateKey: null,
              teamId: null,
              keyId: null,
            },
          },
        },
      },
    ]);
    const stored = await acmeSettings();
    expect(stored.oauthSecrets.github).toBeUndefined();
    expect(stored.strategies.oauth.github).toEqual({ enabled: true });
  });

  test('emptying the Apple team and key IDs falls back to the global key', async ({
    page,
  }) => {
    await openIdentity(page);
    await openCredentials(page, 'apple');
    await expect(page.locator('#realm-oauth-apple-teamId')).toHaveValue(
      'ACMETEAM01'
    );
    await page.locator('#realm-oauth-apple-teamId').fill('');
    await page.locator('#realm-oauth-apple-keyId').fill('');

    await clearRecordedRequests();
    await page
      .getByRole('button', { name: 'Save changes', disabled: false })
      .click();
    await expect(
      page.getByText('Realm identity saved', { exact: true })
    ).toBeVisible();

    expect((await realmPatches()).map(request => request.body)).toEqual([
      {
        strategies: {
          oauth: { apple: { teamId: null, keyId: null, privateKey: null } },
        },
      },
    ]);
    const stored = await acmeSettings();
    expect(stored.oauthSecrets.apple).toEqual({
      clientSecret: 'apple-secret-acme',
    });
    expect(stored.strategies.oauth.apple).toEqual({
      enabled: true,
      clientId: 'com.acme.signin',
    });
  });

  test('clearing only the Apple team ID is blocked before any request', async ({
    page,
  }) => {
    await openIdentity(page);
    await openCredentials(page, 'apple');
    await page.locator('#realm-oauth-apple-teamId').fill('');

    await clearRecordedRequests();
    await page
      .getByRole('button', { name: 'Save changes', disabled: false })
      .click();
    await expect(
      page
        .getByText(/Provide the team ID, key ID and private key together/)
        .first()
    ).toBeVisible();
    expect(await realmPatches()).toHaveLength(0);
  });
});
