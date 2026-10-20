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

const api = vi.hoisted(() => ({ updateAuthenticationSettings: vi.fn() }));
vi.mock('@/lib/api/authentication', () => api);

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
