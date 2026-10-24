import '@testing-library/jest-dom/vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OAuthProviderKey, Realm } from '@/lib/models/Realm';
import type { Team } from '@/lib/models/Team';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh, push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/authentication/teams/t1',
}));

// There is no <Toaster/> in these tests: capture toasts instead.
vi.mock('@/lib/hooks/use-toast', () => ({ toast: vi.fn() }));

const api = vi.hoisted(() => ({
  updateRealm: vi.fn(),
  getRealms: vi.fn(),
  demoteRealm: vi.fn(),
  promoteTeamToRealm: vi.fn(),
}));
vi.mock('@/lib/api/authentication', () => api);

import { AlertProvider } from '@/components/providers/AlertProvider';
import RealmTab from '@/components/authentication/teams/manageTeam/realm/RealmTab';

const ok = <T,>(data: T) => ({ ok: true as const, data });

const realmTeam: Team = {
  _id: 't1',
  name: 'Acme',
  parentTeam: '',
  isDefault: false,
  createdAt: '',
  updatedAt: '',
  realm: { enabled: true, slug: 'acme' },
};

const CLEARED = {
  clientId: null,
  clientSecret: null,
  redirect_uri: null,
  privateKey: null,
  teamId: null,
  keyId: null,
};

const makeRealm = (oauth: Realm['settings']['strategies']['oauth']): Realm => ({
  team: realmTeam,
  counts: { home: 12, guest: 3 },
  settings: {
    _id: 's1',
    team: 't1',
    active: true,
    registration: { allowWithoutInvite: false },
    strategies: {
      local: { enabled: true },
      username: { enabled: false },
      magicLink: { enabled: false },
      phone: { enabled: false },
      metamask: { enabled: false },
      biometric: { enabled: false },
      oauth,
    },
    policies: {
      requireTwoFa: false,
      requireVerifiedEmail: false,
      allowedClientIds: [],
      guests: { allowed: true, allowedHomeRealms: [] },
    },
    createdAt: '',
    updatedAt: '',
  },
});

// google: own credentials (masked read); github: enabled, inherits; apple: own with a key.
const realm = makeRealm({
  google: {
    enabled: true,
    clientId: 'google-client',
    hasClientSecret: true,
    redirect_uri: 'https://acme.test/cb',
  },
  github: { enabled: true },
  apple: {
    enabled: true,
    clientId: 'apple-app',
    teamId: 'TEAM123',
    keyId: 'KEY123',
    hasPrivateKey: true,
  },
});

const renderTab = (
  value: Realm = realm,
  globalAccountLinking?: Partial<Record<OAuthProviderKey, boolean>>
) =>
  render(
    <AlertProvider>
      <RealmTab
        team={realmTeam}
        realm={value}
        memberCount={12}
        globalAccountLinking={globalAccountLinking}
      />
    </AlertProvider>
  );

const openCredentials = (provider: string) =>
  fireEvent.click(
    screen.getByRole('button', { name: `${provider} credentials` })
  );

const typeInto = (label: string | RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

const saveIdentity = async () => {
  const [save] = screen.getAllByRole('button', { name: 'Save changes' });
  await waitFor(() => expect(save).toBeEnabled());
  fireEvent.click(save);
};

const sentPatch = () =>
  (api.updateRealm.mock.calls.at(-1) as [string, unknown])[1];

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  api.getRealms.mockResolvedValue({ realms: [realm], count: 1 });
  api.updateRealm.mockImplementation(async () => ok(realm));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('OAuth credentials: mode derivation', () => {
  it('derives the mode and badge from the masked read', () => {
    renderTab();
    const badgeOf = (provider: string) =>
      screen.getByRole('button', { name: `${provider} credentials` })
        .parentElement!.textContent;
    expect(badgeOf('google')).toContain('Own credentials');
    expect(badgeOf('github')).toContain('Inherits global');
    expect(badgeOf('apple')).toContain('Own credentials');
  });

  it('treats a lone client secret or redirect URI as own credentials', () => {
    renderTab(
      makeRealm({
        google: { enabled: true, hasClientSecret: true },
        github: { enabled: true, redirect_uri: 'https://acme.test/cb' },
      })
    );
    openCredentials('google');
    expect(
      screen.getByRole('radio', { name: 'Own credentials' })
    ).toBeChecked();
  });

  it('shows a row with only an account linking override as own credentials', () => {
    renderTab(makeRealm({ google: { enabled: true, accountLinking: false } }));
    openCredentials('google');
    expect(
      screen.getByRole('radio', { name: 'Own credentials' })
    ).toBeChecked();
  });

  it('selects Inherit global for a row without credentials', () => {
    renderTab();
    openCredentials('github');
    expect(screen.getByRole('radio', { name: 'Inherit global' })).toBeChecked();
    expect(screen.queryByLabelText('Client ID')).not.toBeInTheDocument();
  });

  it('flags own mode without a client ID as incomplete', () => {
    renderTab();
    openCredentials('github');
    fireEvent.click(screen.getByRole('radio', { name: 'Own credentials' }));
    expect(
      screen.getByRole('button', { name: 'github credentials' }).parentElement
    ).toHaveTextContent('Incomplete');
  });

  it('only offers credentials for enabled providers', () => {
    renderTab();
    expect(
      screen.queryByRole('button', { name: 'gitlab credentials' })
    ).not.toBeInTheDocument();
  });
});

describe('OAuth credentials: secrets', () => {
  it('shows a "set" placeholder and never renders a secret value', () => {
    // A misbehaving backend that leaks a secret must still not reach the DOM.
    const leaky = makeRealm({
      google: {
        enabled: true,
        clientId: 'google-client',
        hasClientSecret: true,
        clientSecret: 'LEAKED-SECRET',
      },
    });
    renderTab(leaky);
    openCredentials('google');
    const secret = screen.getByLabelText('Client secret');
    expect(secret).toHaveAttribute('type', 'password');
    expect(secret).toHaveAttribute('placeholder', '•••••• (set)');
    expect(secret).toHaveValue('');
    expect(document.body.innerHTML).not.toContain('LEAKED-SECRET');
  });

  it('shows a "set" badge for a stored Apple private key without its value', () => {
    renderTab();
    openCredentials('apple');
    const key = screen.getByLabelText('Private key');
    expect(key).toHaveValue('');
    expect(key.getAttribute('placeholder')).toContain('(set)');
    expect(screen.getByLabelText('Team ID')).toHaveValue('TEAM123');
  });

  it('has no placeholder when no secret is stored', () => {
    renderTab(
      makeRealm({ google: { enabled: true, clientId: 'google-client' } })
    );
    openCredentials('google');
    expect(screen.getByLabelText('Client secret')).toHaveAttribute(
      'placeholder',
      ''
    );
  });
});

describe('OAuth credentials: saving', () => {
  it('sends only typed fields for an own-credentials edit, never has* flags', async () => {
    renderTab();
    openCredentials('google');
    typeInto('Client ID', '  new-client  ');
    typeInto('Client secret', 's3cr3t');
    await saveIdentity();
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
    expect(sentPatch()).toEqual({
      strategies: {
        oauth: { google: { clientId: 'new-client', clientSecret: 's3cr3t' } },
      },
    });
    expect(JSON.stringify(sentPatch())).not.toMatch(
      /has(ClientSecret|PrivateKey)/
    );
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it('leaves the secret out when its field is empty (keep)', async () => {
    renderTab();
    openCredentials('google');
    typeInto('Redirect URI', 'https://acme.test/new');
    await saveIdentity();
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
    expect(sentPatch()).toEqual({
      strategies: {
        oauth: { google: { redirect_uri: 'https://acme.test/new' } },
      },
    });
  });

  it('sends the six nulls when switching own to inherit', async () => {
    renderTab();
    openCredentials('google');
    fireEvent.click(screen.getByRole('radio', { name: 'Inherit global' }));
    await saveIdentity();
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
    expect(sentPatch()).toEqual({
      strategies: { oauth: { google: CLEARED } },
    });
  });

  it('also resets the account linking override when switching own to inherit', async () => {
    renderTab(
      makeRealm({
        google: {
          enabled: true,
          clientId: 'google-client',
          hasClientSecret: true,
          accountLinking: false,
        },
      })
    );
    openCredentials('google');
    fireEvent.click(screen.getByRole('radio', { name: 'Inherit global' }));
    await saveIdentity();
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
    expect(sentPatch()).toEqual({
      strategies: { oauth: { google: { ...CLEARED, accountLinking: null } } },
    });
  });

  it('sends the typed credentials when switching inherit to own', async () => {
    renderTab();
    openCredentials('github');
    fireEvent.click(screen.getByRole('radio', { name: 'Own credentials' }));
    typeInto('Client ID', 'gh-client');
    typeInto('Client secret', 'gh-secret');
    await saveIdentity();
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
    expect(sentPatch()).toEqual({
      strategies: {
        oauth: { github: { clientId: 'gh-client', clientSecret: 'gh-secret' } },
      },
    });
  });

  it('re-derives the mode from the fresh masked read and drops typed secrets', async () => {
    api.updateRealm.mockImplementation(async () =>
      ok(
        makeRealm({
          ...realm.settings.strategies.oauth,
          github: {
            enabled: true,
            clientId: 'gh-client',
            hasClientSecret: true,
          },
        })
      )
    );
    renderTab();
    openCredentials('github');
    fireEvent.click(screen.getByRole('radio', { name: 'Own credentials' }));
    typeInto('Client ID', 'gh-client');
    typeInto('Client secret', 'gh-secret');
    await saveIdentity();
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'github credentials' }).parentElement
      ).toHaveTextContent('Own credentials')
    );
    const secret = screen.getByLabelText('Client secret');
    expect(secret).toHaveValue('');
    expect(secret).toHaveAttribute('placeholder', '•••••• (set)');
  });

  it('drops a typed secret when switching to inherit and back', () => {
    renderTab();
    openCredentials('google');
    typeInto('Client secret', 'typed-secret');
    fireEvent.click(screen.getByRole('radio', { name: 'Inherit global' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Own credentials' }));
    expect(screen.getByLabelText('Client secret')).toHaveValue('');
    const [save] = screen.getAllByRole('button', { name: 'Save changes' });
    expect(save).toBeDisabled();
    expect(api.updateRealm).not.toHaveBeenCalled();
  });

  it('drops a typed secret when the provider is disabled and enabled again', () => {
    renderTab();
    openCredentials('google');
    typeInto('Client secret', 'typed-secret');
    fireEvent.click(screen.getByLabelText('Google'));
    fireEvent.click(screen.getByLabelText('Google'));
    openCredentials('google');
    expect(screen.getByLabelText('Client secret')).toHaveValue('');
    const [save] = screen.getAllByRole('button', { name: 'Save changes' });
    expect(save).toBeDisabled();
  });

  it('disabling a provider leaves its credentials alone, even after choosing inherit', async () => {
    // Credentials of a provider that is switched off are never touched: inherit + disable
    // in one save only disables, and the own credentials stay stored for later.
    renderTab();
    openCredentials('google');
    fireEvent.click(screen.getByRole('radio', { name: 'Inherit global' }));
    fireEvent.click(screen.getByLabelText('Google'));
    await saveIdentity();
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
    expect(sentPatch()).toEqual({
      strategies: { oauth: { google: { enabled: false } } },
    });
  });

  it('sends nothing for an inherit row that was already inheriting', async () => {
    renderTab();
    fireEvent.click(screen.getByLabelText('Magic Link'));
    await saveIdentity();
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
    expect(sentPatch()).toEqual({
      strategies: { magicLink: { enabled: true } },
    });
  });

  it('is not dirty after toggling to own and back to inherit', () => {
    renderTab();
    openCredentials('github');
    fireEvent.click(screen.getByRole('radio', { name: 'Own credentials' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Inherit global' }));
    const [save] = screen.getAllByRole('button', { name: 'Save changes' });
    expect(save).toBeDisabled();
  });

  it('blocks the save and explains when own mode has no client ID', async () => {
    renderTab();
    openCredentials('github');
    fireEvent.click(screen.getByRole('radio', { name: 'Own credentials' }));
    typeInto('Redirect URI', 'https://acme.test/cb');
    await saveIdentity();
    expect(
      await screen.findByText('Client ID is required')
    ).toBeInTheDocument();
    expect(api.updateRealm).not.toHaveBeenCalled();
  });

  it('requires a client secret in own mode unless one is stored', async () => {
    renderTab();
    openCredentials('github');
    fireEvent.click(screen.getByRole('radio', { name: 'Own credentials' }));
    typeInto('Client ID', 'gh-client');
    await saveIdentity();
    expect(
      await screen.findByText('Client secret is required')
    ).toBeInTheDocument();
    expect(api.updateRealm).not.toHaveBeenCalled();
    typeInto('Client secret', 'gh-secret');
    await saveIdentity();
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
  });

  it('links each error message to its input with aria-describedby', async () => {
    renderTab();
    openCredentials('github');
    fireEvent.click(screen.getByRole('radio', { name: 'Own credentials' }));
    typeInto('Redirect URI', 'https://acme.test/cb');
    await saveIdentity();
    const input = await screen.findByLabelText('Client ID');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toHaveTextContent(
      'Client ID is required'
    );
    const secret = screen.getByLabelText('Client secret');
    expect(
      document.getElementById(secret.getAttribute('aria-describedby')!)
    ).toHaveTextContent('Client secret is required');
  });

  it('rejects a redirect URI that is not a URL', async () => {
    renderTab();
    openCredentials('google');
    typeInto('Redirect URI', 'not a url');
    await saveIdentity();
    expect(await screen.findByText('Must be a valid URL')).toBeInTheDocument();
    expect(api.updateRealm).not.toHaveBeenCalled();
  });

  it('does not let an untouched incomplete row block another save', async () => {
    renderTab(
      makeRealm({
        google: { enabled: true, hasClientSecret: true },
      })
    );
    fireEvent.click(screen.getByLabelText('Magic Link'));
    await saveIdentity();
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
    expect(sentPatch()).toEqual({
      strategies: { magicLink: { enabled: true } },
    });
  });
});

describe('OAuth credentials: account linking', () => {
  const linkingRealm = (accountLinking?: boolean) =>
    makeRealm({
      google: {
        enabled: true,
        clientId: 'google-client',
        hasClientSecret: true,
        ...(accountLinking === undefined ? {} : { accountLinking }),
      },
    });

  it('shows the global value as the baseline while the realm does not override', () => {
    renderTab(linkingRealm(), { google: false });
    openCredentials('google');
    expect(screen.getByLabelText('Account linking')).not.toBeChecked();
    expect(
      screen.getByText(/Following the global setting \(off\)/)
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Use global' })
    ).not.toBeInTheDocument();
  });

  it('defaults the baseline to on without a global value', () => {
    renderTab(linkingRealm());
    openCredentials('google');
    expect(screen.getByLabelText('Account linking')).toBeChecked();
  });

  it('shows the stored override instead of the global value', () => {
    renderTab(linkingRealm(true), { google: false });
    openCredentials('google');
    expect(screen.getByLabelText('Account linking')).toBeChecked();
    expect(screen.getByText(/The global setting is off/)).toBeVisible();
  });

  it('sends a boolean when the toggle is switched', async () => {
    renderTab(linkingRealm(), { google: false });
    openCredentials('google');
    fireEvent.click(screen.getByLabelText('Account linking'));
    await saveIdentity();
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
    expect(sentPatch()).toEqual({
      strategies: { oauth: { google: { accountLinking: true } } },
    });
  });

  it('sends null for "Use global" and nothing when it is undone', async () => {
    renderTab(linkingRealm(false), { google: true });
    openCredentials('google');
    fireEvent.click(screen.getByRole('button', { name: 'Use global' }));
    expect(screen.getByLabelText('Account linking')).toBeChecked();
    await saveIdentity();
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
    expect(sentPatch()).toEqual({
      strategies: { oauth: { google: { accountLinking: null } } },
    });
  });
});

describe('OAuth credentials: Apple key fields are all or nothing', () => {
  it('does not offer a client secret for Apple', () => {
    renderTab();
    openCredentials('apple');
    expect(screen.queryByLabelText('Client secret')).not.toBeInTheDocument();
  });

  it('drops back to the global Apple key when all three are cleared', async () => {
    renderTab();
    openCredentials('apple');
    typeInto('Team ID', '');
    typeInto('Private key ID', '');
    await saveIdentity();
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
    expect(sentPatch()).toEqual({
      strategies: {
        oauth: { apple: { teamId: null, keyId: null, privateKey: null } },
      },
    });
  });

  it('blocks clearing only the team ID while a key is stored', async () => {
    renderTab();
    openCredentials('apple');
    typeInto('Team ID', '');
    await saveIdentity();
    expect(
      (
        await screen.findAllByText(
          /Provide the team ID, key ID and private key/
        )
      ).length
    ).toBeGreaterThan(0);
    expect(api.updateRealm).not.toHaveBeenCalled();
  });

  it('blocks a partially filled Apple key set', async () => {
    renderTab(makeRealm({ apple: { enabled: true, clientId: 'apple-app' } }));
    openCredentials('apple');
    typeInto('Team ID', 'TEAM123');
    await saveIdentity();
    expect(
      (
        await screen.findAllByText(
          /Provide the team ID, key ID and private key/
        )
      ).length
    ).toBeGreaterThan(0);
    expect(api.updateRealm).not.toHaveBeenCalled();
  });

  it('counts a stored private key as set', async () => {
    renderTab();
    openCredentials('apple');
    typeInto('Private key ID', 'KEY999');
    await saveIdentity();
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
    expect(sentPatch()).toEqual({
      strategies: { oauth: { apple: { keyId: 'KEY999' } } },
    });
  });

  it('accepts all three set together and sends them', async () => {
    renderTab(makeRealm({ apple: { enabled: true, clientId: 'apple-app' } }));
    openCredentials('apple');
    typeInto('Team ID', 'TEAM123');
    typeInto('Private key ID', 'KEY123');
    typeInto('Private key', '-----BEGIN PRIVATE KEY-----');
    await saveIdentity();
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
    expect(sentPatch()).toEqual({
      strategies: {
        oauth: {
          apple: {
            teamId: 'TEAM123',
            keyId: 'KEY123',
            privateKey: '-----BEGIN PRIVATE KEY-----',
          },
        },
      },
    });
  });

  it('accepts all three empty (global Apple key)', async () => {
    renderTab(makeRealm({ apple: { enabled: true, clientId: 'apple-app' } }));
    openCredentials('apple');
    typeInto('Redirect URI', 'https://acme.test/cb');
    await saveIdentity();
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
    expect(sentPatch()).toEqual({
      strategies: {
        oauth: { apple: { redirect_uri: 'https://acme.test/cb' } },
      },
    });
  });
});
