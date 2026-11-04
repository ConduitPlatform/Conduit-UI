import '@testing-library/jest-dom/vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticationConfig } from '@/lib/models/authentication';

const api = vi.hoisted(() => ({
  updateAuthenticationSettings: vi.fn(),
  rotateSigningKey: vi.fn(),
}));
vi.mock('@/lib/api/authentication', () => api);

const routerRefresh = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: routerRefresh,
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

const toastMock = vi.hoisted(() =>
  vi.fn(
    (_args: { title?: string; variant?: string; description?: unknown }) => ({
      id: 't',
      dismiss: vi.fn(),
      update: vi.fn(),
    })
  )
);
vi.mock('@/lib/hooks/use-toast', () => ({ toast: toastMock }));

import { AuthenticationSettings } from '@/components/authentication/strategies/settings';

// The backend refusal: a gRPC status prefix, and no conduitCode (the status is 500).
const REFUSAL =
  '9 FAILED_PRECONDITION: 2 identifier(s) are held by more than one account; identity mode cannot return to shared';

/** A complete authentication config with the realms block set as the test needs. */
function configWith(realms: Record<string, unknown> | undefined) {
  const cookieOptions = {
    httpOnly: true,
    secure: false,
    signed: false,
    domain: '',
    path: '',
    sameSite: 'Lax',
  };
  return {
    captcha: {
      enabled: false,
      routes: { login: false, register: false, oAuth2: false },
      acceptablePlatform: { android: false, web: true },
    },
    redirectUris: { allowAny: true, whitelistedUris: [] },
    anonymousUsers: { enabled: false },
    clients: { multipleUserSessions: false, multipleClientLogins: true },
    accessTokens: {
      jwtSecret: '[REDACTED]',
      expiryPeriod: 3600000,
      setCookie: false,
      cookieOptions,
    },
    refreshTokens: {
      enabled: true,
      expiryPeriod: 604800000,
      setCookie: false,
      cookieOptions,
    },
    teams: {
      enabled: true,
      enableDefaultTeam: false,
      allowAddWithoutInvite: false,
      allowRegistrationWithoutInvite: true,
      allowEmailMismatchForInvites: false,
      invites: {
        enabled: false,
        sendEmail: false,
        inviteUrl: 'https://x.test',
      },
      ...(realms === undefined ? {} : { realms }),
    },
  } as unknown as AuthenticationConfig;
}

const isolatedRealms = {
  enabled: true,
  allowEmailDiscovery: false,
  cacheTtlMs: 5000,
  identityMode: 'isolated',
  discoveryLogin: false,
};

/** Radix Select needs a few DOM APIs jsdom does not implement. */
function polyfillSelect() {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.releasePointerCapture = () => undefined;
  Element.prototype.scrollIntoView = () => undefined;
}

beforeEach(() => {
  polyfillSelect();
  api.updateAuthenticationSettings.mockResolvedValue({
    ok: true,
    data: undefined,
  });
  api.rotateSigningKey.mockResolvedValue({
    ok: true,
    data: { kid: 'kid-2', previousKid: 'kid-1' },
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function openTeamsAndEdit() {
  fireEvent.click(screen.getByRole('button', { name: /Teams settings/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
}

describe('Realms block in the authentication settings', () => {
  it('renders identity mode and discovery login when the realms block exists', () => {
    render(<AuthenticationSettings data={configWith(isolatedRealms)} />);
    openTeamsAndEdit();
    expect(
      screen.getByRole('combobox', { name: 'Identity mode' })
    ).toHaveTextContent('Isolated: each realm has its own accounts');
    expect(
      screen.getByRole('switch', { name: 'Discovery login' })
    ).not.toBeChecked();
    expect(
      screen.getByText(/The same email or phone can exist once per realm/)
    ).toBeInTheDocument();
  });

  it('renders nothing realm-specific for a backend without teams.realms', () => {
    render(<AuthenticationSettings data={configWith(undefined)} />);
    openTeamsAndEdit();
    expect(
      screen.queryByRole('combobox', { name: 'Identity mode' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('switch', { name: 'Discovery login' })
    ).not.toBeInTheDocument();
  });

  it('shows the server refusal message in the toast when isolated cannot go back to shared', async () => {
    api.updateAuthenticationSettings.mockResolvedValue({
      ok: false,
      code: 'INTERNAL',
      message: REFUSAL,
      status: 500,
    });
    render(<AuthenticationSettings data={configWith(isolatedRealms)} />);
    openTeamsAndEdit();

    const trigger = screen.getByRole('combobox', { name: 'Identity mode' });
    fireEvent.keyDown(trigger, { key: 'Enter' });
    fireEvent.keyDown(
      screen.getByRole('option', {
        name: 'Shared: one account per person across realms',
      }),
      { key: 'Enter' }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to save authentication settings',
        })
      )
    );
    const failure = toastMock.mock.calls
      .map(([args]) => args)
      .find(args => args.title === 'Failed to save authentication settings');
    expect(failure?.variant).toBe('destructive');
    const { container } = render(<>{failure?.description as ReactNode}</>);
    expect(within(container).getByText(REFUSAL)).toBeInTheDocument();

    expect(api.updateAuthenticationSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        teams: expect.objectContaining({
          realms: expect.objectContaining({ identityMode: 'shared' }),
        }),
      })
    );
  });

  it('hides identity mode and discovery login for a realms block that lacks them', async () => {
    const legacy = {
      enabled: true,
      allowEmailDiscovery: false,
      cacheTtlMs: 5000,
    };
    render(<AuthenticationSettings data={configWith(legacy)} />);
    openTeamsAndEdit();
    // The rest of the realms block still renders.
    expect(
      screen.getByRole('switch', { name: 'Allow email discovery' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', { name: 'Identity mode' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/The same email or phone can exist/)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('switch', { name: 'Discovery login' })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(api.updateAuthenticationSettings).toHaveBeenCalledTimes(1)
    );
    const [body] = api.updateAuthenticationSettings.mock.calls[0] as [
      { teams: { realms: Record<string, unknown> } },
    ];
    expect(body.teams.realms).toMatchObject(legacy);
    expect(body.teams.realms).not.toHaveProperty('identityMode');
    expect(body.teams.realms).not.toHaveProperty('discoveryLogin');
  });

  it('saves through the action result, reports success and leaves edit mode', async () => {
    render(<AuthenticationSettings data={configWith(isolatedRealms)} />);
    openTeamsAndEdit();
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Authentication settings saved' })
      )
    );
    const success = toastMock.mock.calls
      .map(([args]) => args)
      .find(args => args.title === 'Authentication settings saved');
    expect(success?.variant).toBeUndefined();
    expect(api.updateAuthenticationSettings).toHaveBeenCalledTimes(1);
    expect(api.updateAuthenticationSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        teams: expect.objectContaining({
          realms: expect.objectContaining({
            identityMode: 'isolated',
            discoveryLogin: false,
          }),
        }),
      })
    );
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Submit' })
      ).not.toBeInTheDocument()
    );
  });
});

const signing = {
  kid: 'kid-1',
  publicKey: 'pub',
  privateKey: '[REDACTED]',
  previousKid: '',
  previousPublicKey: '',
  previousRetiredAt: 0,
};

/** A config in the given token mode; jwt mode carries the new refresh and signing keys. */
function tokenConfig(mode: 'session' | 'jwt', expiryPeriod?: number) {
  const base = configWith(undefined) as unknown as {
    accessTokens: Record<string, unknown>;
    refreshTokens: Record<string, unknown>;
  };
  return {
    ...base,
    accessTokens: {
      ...base.accessTokens,
      mode,
      strictRevocation: false,
      tokenVersion: 4,
      signing,
      ...(expiryPeriod === undefined ? {} : { expiryPeriod }),
    },
    refreshTokens: {
      ...base.refreshTokens,
      extendable: true,
      maxLifetime: 2592000000,
    },
  } as unknown as AuthenticationConfig;
}

const open = (name: RegExp) =>
  fireEvent.click(screen.getByRole('button', { name }));

const expiryCombobox = () =>
  screen.getByRole('combobox', { name: 'Expiry Period' });

const kid = () => screen.getByRole('textbox', { name: 'Signing key id' });

/** Opens a Radix select and picks an option by its visible name. */
const pick = (trigger: HTMLElement, option: string) => {
  fireEvent.keyDown(trigger, { key: 'Enter' });
  fireEvent.keyDown(screen.getByRole('option', { name: option }), {
    key: 'Enter',
  });
};

describe('Session mode', () => {
  it('renders the access token page as before in session mode', () => {
    render(<AuthenticationSettings data={tokenConfig('session')} />);
    open(/Session mode/);
    open(/Access Token settings/);
    open(/Refresh Token settings/);
    expect(screen.getByLabelText('JWT Secret')).toBeInTheDocument();
    // Access and refresh token expiry inputs.
    expect(screen.getAllByLabelText('Expiry Period (ms)')).toHaveLength(2);
    expect(
      screen.queryByRole('switch', { name: 'Strict revocation' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Rotate signing key' })
    ).not.toBeInTheDocument();
    // Refresh extension settings are mode-independent.
    expect(
      screen.getByRole('switch', { name: 'Allow extension' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Max lifetime (ms)')).toBeInTheDocument();
    expect(screen.getByText('= 30 days')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('switching to jwt shows the jwt controls, hides the secret and warns', () => {
    render(<AuthenticationSettings data={tokenConfig('session')} />);
    open(/Session mode/);
    open(/Access Token settings/);
    open(/Refresh Token settings/);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    pick(screen.getByRole('combobox', { name: 'Mode' }), 'Stateless JWT');

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Saving will log every user out'
    );
    expect(
      screen.getByRole('switch', { name: 'Strict revocation' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Check the session registry on every request/)
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('JWT Secret')).not.toBeInTheDocument();
    // Only the refresh token expiry input is left.
    expect(screen.getAllByLabelText('Expiry Period (ms)')).toHaveLength(1);
    // An out-of-range session expiry is moved to the longest accepted one.
    expect(expiryCombobox()).toHaveTextContent('5 minutes');
    expect(
      screen.getByRole('switch', { name: 'Allow extension' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Max lifetime (ms)')).toHaveValue(2592000000);

    // Back to the saved mode: the warning goes and the session controls return.
    pick(screen.getByRole('combobox', { name: 'Mode' }), 'Stateful sessions');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('JWT Secret')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Expiry Period (ms)')[0]).toHaveValue(
      3600000
    );
  });

  it('maps the expiry select to milliseconds on save', async () => {
    render(<AuthenticationSettings data={tokenConfig('jwt', 180000)} />);
    open(/Access Token settings/);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(expiryCombobox()).toHaveTextContent('3 minutes');

    pick(expiryCombobox(), '2 minutes');
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(api.updateAuthenticationSettings).toHaveBeenCalledTimes(1)
    );
    const [body] = api.updateAuthenticationSettings.mock.calls[0] as [
      { accessTokens: Record<string, unknown> },
    ];
    expect(body.accessTokens).toMatchObject({
      mode: 'jwt',
      expiryPeriod: 120000,
      strictRevocation: false,
    });
    // Backend-managed keys are never sent back.
    expect(body.accessTokens).not.toHaveProperty('signing');
    expect(body.accessTokens).not.toHaveProperty('tokenVersion');
  });

  it('sends the refresh extension settings in jwt mode', async () => {
    render(<AuthenticationSettings data={tokenConfig('jwt', 300000)} />);
    open(/Refresh Token settings/);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Allow extension' }));
    fireEvent.change(screen.getByLabelText('Max lifetime (ms)'), {
      target: { value: '3600000' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(api.updateAuthenticationSettings).toHaveBeenCalledTimes(1)
    );
    expect(api.updateAuthenticationSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        refreshTokens: expect.objectContaining({
          extendable: false,
          maxLifetime: 3600000,
        }),
      })
    );
  });

  it('rotates the signing key after confirmation and shows the new key id', async () => {
    render(<AuthenticationSettings data={tokenConfig('jwt', 300000)} />);
    open(/Access Token settings/);
    expect(kid()).toHaveTextContent('kid-1');
    expect(screen.queryByLabelText('JWT Secret')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Rotate signing key' }));
    expect(api.rotateSigningKey).not.toHaveBeenCalled();
    fireEvent.click(await screen.findByRole('button', { name: 'Rotate' }));

    await waitFor(() => expect(api.rotateSigningKey).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(kid()).toHaveTextContent('kid-2'));
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Signing key rotated' })
    );
  });

  it('reports a failed rotation without changing the key id', async () => {
    api.rotateSigningKey.mockResolvedValue({
      ok: false,
      code: 'INTERNAL',
      message: 'boom',
    });
    render(<AuthenticationSettings data={tokenConfig('jwt', 300000)} />);
    open(/Access Token settings/);
    fireEvent.click(screen.getByRole('button', { name: 'Rotate signing key' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Rotate' }));
    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to rotate signing key',
          variant: 'destructive',
        })
      )
    );
    expect(kid()).toHaveTextContent('kid-1');
  });

  it('after a save the mode warning clears, Rotate enables and Cancel keeps the saved mode', async () => {
    render(<AuthenticationSettings data={tokenConfig('session')} />);
    open(/Session mode/);
    open(/Access Token settings/);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    pick(screen.getByRole('combobox', { name: 'Mode' }), 'Stateless JWT');
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Rotate signing key' })
    ).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(routerRefresh).toHaveBeenCalledTimes(1));
    // The save carries the new mode and the expiry picked for it.
    expect(api.updateAuthenticationSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        accessTokens: expect.objectContaining({
          mode: 'jwt',
          expiryPeriod: 300000,
        }),
      })
    );

    await waitFor(() =>
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    );
    expect(
      screen.getByRole('button', { name: 'Rotate signing key' })
    ).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('combobox', { name: 'Mode' })).toHaveTextContent(
      'Stateless JWT'
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps Rotate disabled while the saved mode is session', () => {
    render(<AuthenticationSettings data={tokenConfig('session')} />);
    open(/Session mode/);
    open(/Access Token settings/);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    pick(screen.getByRole('combobox', { name: 'Mode' }), 'Stateless JWT');
    expect(
      screen.getByRole('button', { name: 'Rotate signing key' })
    ).toBeDisabled();
    expect(
      screen.getByText(/generated when you save JWT mode/)
    ).toBeInTheDocument();
  });

  it('restores the saved jwt expiry when switching jwt, session, jwt', () => {
    render(<AuthenticationSettings data={tokenConfig('jwt', 120000)} />);
    open(/Session mode/);
    open(/Access Token settings/);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    pick(screen.getByRole('combobox', { name: 'Mode' }), 'Stateful sessions');
    pick(screen.getByRole('combobox', { name: 'Mode' }), 'Stateless JWT');
    expect(expiryCombobox()).toHaveTextContent('2 minutes');
  });

  it('offers a custom option for a non-minute expiry and blocks saving an out-of-range one', async () => {
    render(<AuthenticationSettings data={tokenConfig('jwt', 30000)} />);
    open(/Access Token settings/);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(expiryCombobox()).toHaveTextContent('Custom (30 s)');
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(
      await screen.findByText(/between 1 and 5 minutes/)
    ).toBeInTheDocument();
    expect(api.updateAuthenticationSettings).not.toHaveBeenCalled();
  });

  it('shows a failure toast when the rotate call itself rejects', async () => {
    api.rotateSigningKey.mockRejectedValue(new Error('network down'));
    render(<AuthenticationSettings data={tokenConfig('jwt', 300000)} />);
    open(/Access Token settings/);
    fireEvent.click(screen.getByRole('button', { name: 'Rotate signing key' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Rotate' }));
    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to rotate signing key',
          variant: 'destructive',
        })
      )
    );
  });

  it('shows no mode controls and sends no new keys to a backend that predates them', async () => {
    render(<AuthenticationSettings data={configWith(undefined)} />);
    expect(
      screen.queryByRole('button', { name: /Session mode/ })
    ).not.toBeInTheDocument();
    open(/Refresh Token settings/);
    expect(
      screen.queryByRole('switch', { name: 'Allow extension' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Max lifetime (ms)')
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(api.updateAuthenticationSettings).toHaveBeenCalledTimes(1)
    );
    const [body] = api.updateAuthenticationSettings.mock.calls[0] as [
      {
        accessTokens: Record<string, unknown>;
        refreshTokens: Record<string, unknown>;
      },
    ];
    for (const key of ['mode', 'strictRevocation', 'signing', 'tokenVersion']) {
      expect(body.accessTokens).not.toHaveProperty(key);
    }
    for (const key of ['extendable', 'maxLifetime']) {
      expect(body.refreshTokens).not.toHaveProperty(key);
    }
  });
});
