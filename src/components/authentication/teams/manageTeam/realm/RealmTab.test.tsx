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
import type { Realm } from '@/lib/models/Realm';
import type { Team } from '@/lib/models/Team';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh, push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/authentication/teams/t1',
}));

// There is no <Toaster/> in these tests: capture toasts instead.
const toastMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/hooks/use-toast', () => ({ toast: toastMock }));

const api = vi.hoisted(() => ({
  updateRealm: vi.fn(),
  getRealm: vi.fn(),
  getRealms: vi.fn(),
  demoteRealm: vi.fn(),
  promoteTeamToRealm: vi.fn(),
}));
vi.mock('@/lib/api/authentication', () => api);

import { AlertProvider } from '@/components/providers/AlertProvider';
import RealmTab from '@/components/authentication/teams/manageTeam/realm/RealmTab';
import { DemoteRealmDialog } from '@/components/authentication/teams/manageTeam/realm/DemoteRealmDialog';
import { PromoteRealmSheet } from '@/components/authentication/teams/manageTeam/realm/PromoteRealmSheet';

/** Renders the description of the latest destructive toast and returns its title. */
const showLastErrorToast = () => {
  const call = toastMock.mock.calls.at(-1)?.[0] as
    | { title: string; description: ReactNode; variant?: string }
    | undefined;
  expect(call?.variant).toBe('destructive');
  render(<>{call?.description}</>);
  return call?.title;
};

const ok = <T,>(data: T) => ({ ok: true as const, data });

const withAlerts = (ui: ReactNode) => <AlertProvider>{ui}</AlertProvider>;

const team: Team = {
  _id: 't1',
  name: 'Acme',
  parentTeam: '',
  isDefault: false,
  createdAt: '',
  updatedAt: '',
};

const realmTeam: Team = { ...team, realm: { enabled: true, slug: 'acme' } };

const realm: Realm = {
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
      oauth: { google: { enabled: true, hasClientSecret: true } },
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
};

/** The same realm read by a backend that reports account linking. */
const reportingRealm: Realm = {
  ...realm,
  settings: {
    ...realm.settings,
    policies: {
      ...realm.settings.policies,
      guests: { ...realm.settings.policies.guests, directSignIn: true },
    },
    linking: { inbound: false, outbound: true },
  },
};

beforeEach(() => {
  // Radix switches measure themselves; jsdom has no ResizeObserver.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  api.getRealms.mockResolvedValue({ realms: [realm], count: 1 });
  api.getRealm.mockResolvedValue(realm);
  api.updateRealm.mockImplementation(async () => ok(realm));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('RealmTab', () => {
  it('offers promotion for a team that is not a realm', () => {
    render(<RealmTab team={team} realm={null} memberCount={4} />);
    expect(
      screen.getByRole('button', { name: 'Make this team a realm' })
    ).toBeInTheDocument();
    expect(screen.queryByText('Identity')).not.toBeInTheDocument();
  });

  it('leads with the effect on users for a realm', () => {
    render(<RealmTab team={realmTeam} realm={realm} memberCount={12} />);
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Home users')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('acme')).toBeInTheDocument();
    expect(screen.getByText('Identity')).toBeInTheDocument();
    expect(screen.getByText('Policies')).toBeInTheDocument();
  });

  it('saves policies and linking in one request when the realm reports them', async () => {
    render(
      <RealmTab team={realmTeam} realm={reportingRealm} memberCount={12} />
    );
    fireEvent.click(screen.getByLabelText('Require 2FA'));
    const [, save] = screen.getAllByRole('button', { name: 'Save changes' });
    await waitFor(() => expect(save).toBeEnabled());
    fireEvent.click(save);
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
    expect(api.updateRealm).toHaveBeenCalledWith('t1', {
      policies: {
        requireTwoFa: true,
        requireVerifiedEmail: false,
        allowedClientIds: [],
        guests: { allowed: true, allowedHomeRealms: [], directSignIn: true },
      },
      registration: { allowWithoutInvite: false },
      linking: { inbound: false, outbound: true },
    });
  });

  it('reflects a read that allows sign-up without an invite', () => {
    render(
      <RealmTab
        team={realmTeam}
        realm={{
          ...realm,
          settings: {
            ...realm.settings,
            registration: { allowWithoutInvite: true },
          },
        }}
        memberCount={12}
      />
    );
    expect(
      screen.getByLabelText('Allow sign-up without an invite')
    ).toBeChecked();
  });

  it('saves the sign-up switch in the same PATCH as the policies', async () => {
    render(<RealmTab team={realmTeam} realm={realm} memberCount={12} />);
    expect(
      screen.getByLabelText('Allow sign-up without an invite')
    ).not.toBeChecked();
    fireEvent.click(screen.getByLabelText('Allow sign-up without an invite'));
    const [, save] = screen.getAllByRole('button', { name: 'Save changes' });
    await waitFor(() => expect(save).toBeEnabled());
    fireEvent.click(save);
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
    expect(api.updateRealm).toHaveBeenCalledWith('t1', {
      policies: {
        requireTwoFa: false,
        requireVerifiedEmail: false,
        allowedClientIds: [],
        guests: { allowed: true, allowedHomeRealms: [] },
      },
      registration: { allowWithoutInvite: true },
    });
  });

  it('discards an unsaved sign-up switch on Reset without sending a PATCH', async () => {
    render(<RealmTab team={realmTeam} realm={realm} memberCount={12} />);
    const signUp = screen.getByLabelText('Allow sign-up without an invite');
    fireEvent.click(signUp);
    expect(signUp).toBeChecked();

    const policiesCard = signUp.closest('form') as HTMLElement;
    const reset = within(policiesCard).getByRole('button', { name: 'Reset' });
    const save = within(policiesCard).getByRole('button', {
      name: 'Save changes',
    });
    await waitFor(() => expect(reset).toBeEnabled());
    fireEvent.click(reset);

    expect(
      screen.getByLabelText('Allow sign-up without an invite')
    ).not.toBeChecked();
    expect(save).toBeDisabled();
    expect(api.updateRealm).not.toHaveBeenCalled();
  });

  it('sends no linking or direct sign-in keys for a realm that predates them', async () => {
    render(<RealmTab team={realmTeam} realm={realm} memberCount={12} />);
    expect(screen.queryByText('Linking')).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Accept connected accounts from other realms')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Connected accounts can sign in here directly')
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Require 2FA'));
    const [, save] = screen.getAllByRole('button', { name: 'Save changes' });
    await waitFor(() => expect(save).toBeEnabled());
    fireEvent.click(save);
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
    expect(api.updateRealm).toHaveBeenCalledWith('t1', {
      policies: {
        requireTwoFa: true,
        requireVerifiedEmail: false,
        allowedClientIds: [],
        guests: { allowed: true, allowedHomeRealms: [] },
      },
      registration: { allowWithoutInvite: false },
    });
  });

  it('shows the Linking switches only for a realm that reports them', () => {
    render(
      <RealmTab team={realmTeam} realm={reportingRealm} memberCount={12} />
    );
    expect(screen.getByText('Linking')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Accept connected accounts from other realms')
    ).not.toBeChecked();
    expect(
      screen.getByLabelText('Connected accounts can sign in here directly')
    ).toBeChecked();
  });

  it('saves identity as a patch of the changed switches only', async () => {
    render(<RealmTab team={realmTeam} realm={realm} memberCount={12} />);
    const [save] = screen.getAllByRole('button', { name: 'Save changes' });
    expect(save).toBeDisabled();
    fireEvent.click(screen.getByLabelText('Magic Link'));
    await waitFor(() => expect(save).toBeEnabled());
    fireEvent.click(save);
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
    expect(api.updateRealm).toHaveBeenCalledWith('t1', {
      strategies: { magicLink: { enabled: true } },
    });
  });
});

describe('RealmTab verification (inherit, override, use global)', () => {
  const withLocal = (verificationRequired?: boolean): Realm => ({
    ...realm,
    settings: {
      ...realm.settings,
      strategies: {
        ...realm.settings.strategies,
        local: { enabled: true, verificationRequired },
      },
    },
  });
  const renderTab = (r: Realm, globalOn: boolean) =>
    render(
      <RealmTab
        team={realmTeam}
        realm={r}
        memberCount={12}
        globalVerificationRequired={globalOn}
      />
    );
  const toggle = () => screen.getByLabelText('Require verification');
  const source = () => screen.getByTestId('realm-verification-source');

  it('shows the effective global value while inheriting', () => {
    renderTab(withLocal(undefined), true);
    expect(toggle()).toBeChecked();
    expect(source()).toHaveTextContent('Inherits the global setting (on).');
    expect(
      screen.queryByRole('button', { name: 'Use global' })
    ).not.toBeInTheDocument();
  });

  it('sends a boolean when toggled and shows it as an override', async () => {
    renderTab(withLocal(undefined), true);
    fireEvent.click(toggle());
    expect(toggle()).not.toBeChecked();
    expect(source()).toHaveTextContent('Overrides the global setting (on).');
    const [save] = screen.getAllByRole('button', { name: 'Save changes' });
    await waitFor(() => expect(save).toBeEnabled());
    fireEvent.click(save);
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
    expect(api.updateRealm).toHaveBeenCalledWith('t1', {
      strategies: { local: { verificationRequired: false } },
    });
  });

  it('"Use global" sends null and falls back to the global value', async () => {
    renderTab(withLocal(false), true);
    expect(toggle()).not.toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Use global' }));
    expect(toggle()).toBeChecked();
    expect(source()).toHaveTextContent('Inherits the global setting (on).');
    const [save] = screen.getAllByRole('button', { name: 'Save changes' });
    await waitFor(() => expect(save).toBeEnabled());
    fireEvent.click(save);
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
    expect(api.updateRealm).toHaveBeenCalledWith('t1', {
      strategies: { local: { verificationRequired: null } },
    });
  });

  it('does not mark the card dirty while merely inheriting', () => {
    renderTab(withLocal(undefined), false);
    expect(toggle()).not.toBeChecked();
    const [save] = screen.getAllByRole('button', { name: 'Save changes' });
    expect(save).toBeDisabled();
  });
});

describe('RealmEmptyState and the default team', () => {
  it('disables promotion of the default team and says why', () => {
    render(
      <RealmTab
        team={{ ...team, isDefault: true }}
        realm={null}
        memberCount={4}
      />
    );
    expect(
      screen.getByRole('button', { name: 'Make this team a realm' })
    ).toBeDisabled();
    expect(screen.getByRole('note')).toHaveTextContent(
      'The default team cannot be a realm'
    );
  });
});

describe('RealmTab unsaved state and the Active kill-switch', () => {
  const renderTab = () =>
    render(
      withAlerts(<RealmTab team={realmTeam} realm={realm} memberCount={12} />)
    );

  it('keeps unsaved Identity switches when Policies are saved', async () => {
    api.updateRealm.mockImplementationOnce(async () =>
      ok({
        ...realm,
        settings: {
          ...realm.settings,
          policies: { ...realm.settings.policies, requireTwoFa: true },
        },
      })
    );
    renderTab();
    fireEvent.click(screen.getByLabelText('Magic Link'));
    expect(screen.getByLabelText('Magic Link')).toBeChecked();

    fireEvent.click(screen.getByLabelText('Require 2FA'));
    const [, savePolicies] = screen.getAllByRole('button', {
      name: 'Save changes',
    });
    await waitFor(() => expect(savePolicies).toBeEnabled());
    fireEvent.click(savePolicies);
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.getByLabelText('Require 2FA')).toBeChecked()
    );

    // The identity slice was not part of that save and is still pending.
    expect(screen.getByLabelText('Magic Link')).toBeChecked();
    const [saveIdentity] = screen.getAllByRole('button', {
      name: 'Save changes',
    });
    expect(saveIdentity).toBeEnabled();
  });

  it('keeps unsaved Identity switches across an Active toggle', async () => {
    api.updateRealm.mockImplementationOnce(async () =>
      ok({ ...realm, settings: { ...realm.settings, active: false } })
    );
    renderTab();
    fireEvent.click(screen.getByLabelText('Magic Link'));

    fireEvent.click(screen.getByLabelText('Active'));
    fireEvent.click(await screen.findByRole('button', { name: 'Deactivate' }));
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.getByText(/This realm is inactive/)).toBeInTheDocument()
    );

    expect(screen.getByLabelText('Magic Link')).toBeChecked();
    const [saveIdentity] = screen.getAllByRole('button', {
      name: 'Save changes',
    });
    expect(saveIdentity).toBeEnabled();
  });

  it('sends exactly { active: false } after confirming', async () => {
    renderTab();
    fireEvent.click(screen.getByLabelText('Active'));
    expect(api.updateRealm).not.toHaveBeenCalled();
    expect(
      await screen.findByText(/Nobody can sign in to or enter this realm/)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Deactivate' }));
    await waitFor(() => expect(api.updateRealm).toHaveBeenCalledTimes(1));
    expect(api.updateRealm).toHaveBeenCalledWith('t1', { active: false });
  });

  it('sends nothing when the deactivation is cancelled', async () => {
    renderTab();
    fireEvent.click(screen.getByLabelText('Active'));
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Deactivate' })
      ).not.toBeInTheDocument()
    );
    expect(api.updateRealm).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Active')).toBeChecked();
  });
});

describe('PromoteRealmSheet', () => {
  const openSheet = async (supportsLinking = true) => {
    render(
      withAlerts(
        <PromoteRealmSheet
          team={team}
          memberCount={4}
          supportsLinking={supportsLinking}
        >
          <button type="button">Open promote</button>
        </PromoteRealmSheet>
      )
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open promote' }));
    const submit = await screen.findByRole('button', {
      name: 'Make this team a realm',
    });
    await waitFor(() => expect(submit).toBeEnabled());
    return submit;
  };

  it('submits through the confirmation with the built body', async () => {
    api.promoteTeamToRealm.mockResolvedValueOnce(ok(realm));
    const submit = await openSheet();
    fireEvent.click(screen.getByLabelText('Magic Link'));
    fireEvent.click(submit);
    fireEvent.click(await screen.findByRole('button', { name: 'Make realm' }));
    await waitFor(() =>
      expect(api.promoteTeamToRealm).toHaveBeenCalledTimes(1)
    );
    expect(api.promoteTeamToRealm).toHaveBeenCalledWith('t1', {
      slug: 'acme',
      active: true,
      strategies: {
        local: { enabled: true },
        username: { enabled: false },
        magicLink: { enabled: true },
        phone: { enabled: false },
        metamask: { enabled: false },
        biometric: { enabled: false },
        oauth: {},
      },
      registration: { allowWithoutInvite: false },
      policies: {
        requireTwoFa: false,
        requireVerifiedEmail: false,
        allowedClientIds: [],
        guests: { allowed: true, allowedHomeRealms: [], directSignIn: true },
      },
      linking: { inbound: false, outbound: true },
    });
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it('sends the sign-up switch as set, and off by default', async () => {
    api.promoteTeamToRealm.mockResolvedValueOnce(ok(realm));
    const submit = await openSheet();
    expect(
      screen.getByLabelText('Allow sign-up without an invite')
    ).not.toBeChecked();
    fireEvent.click(screen.getByLabelText('Allow sign-up without an invite'));
    fireEvent.click(submit);
    fireEvent.click(await screen.findByRole('button', { name: 'Make realm' }));
    await waitFor(() =>
      expect(api.promoteTeamToRealm).toHaveBeenCalledTimes(1)
    );
    const [, body] = api.promoteTeamToRealm.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];
    expect(body.registration).toEqual({ allowWithoutInvite: true });
  });

  it('leaves the linking keys out when the backend does not report identity mode', async () => {
    api.promoteTeamToRealm.mockResolvedValueOnce(ok(realm));
    const submit = await openSheet(false);
    fireEvent.click(submit);
    fireEvent.click(await screen.findByRole('button', { name: 'Make realm' }));
    await waitFor(() =>
      expect(api.promoteTeamToRealm).toHaveBeenCalledTimes(1)
    );
    const [, body] = api.promoteTeamToRealm.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];
    expect(body).not.toHaveProperty('linking');
    expect(body.policies).toEqual({
      requireTwoFa: false,
      requireVerifiedEmail: false,
      allowedClientIds: [],
      guests: { allowed: true, allowedHomeRealms: [] },
    });
  });

  it('shows REALM_SLUG_TAKEN on the slug field', async () => {
    api.promoteTeamToRealm.mockResolvedValueOnce({
      ok: false,
      code: 'REALM_SLUG_TAKEN',
      message: 'slug taken',
      status: 409,
    });
    const submit = await openSheet();
    fireEvent.click(submit);
    fireEvent.click(await screen.findByRole('button', { name: 'Make realm' }));
    expect(
      await screen.findByText('This slug is already taken.')
    ).toBeInTheDocument();
    expect(refresh).not.toHaveBeenCalled();
  });

  it('shows other server errors with the server message', async () => {
    api.promoteTeamToRealm.mockResolvedValueOnce({
      ok: false,
      code: 'GUESTS_NOT_ALLOWED',
      message: 'Guests not allowed for: a@b.c, d@e.f',
      status: 403,
    });
    const submit = await openSheet();
    fireEvent.click(submit);
    fireEvent.click(await screen.findByRole('button', { name: 'Make realm' }));
    await waitFor(() => expect(toastMock).toHaveBeenCalled());
    expect(showLastErrorToast()).toBe('Guests are not allowed');
    expect(
      screen.getByText('Guests not allowed for: a@b.c, d@e.f')
    ).toBeInTheDocument();
    expect(refresh).not.toHaveBeenCalled();
  });
});

describe('DemoteRealmDialog', () => {
  const renderDialog = () =>
    render(
      <DemoteRealmDialog
        open
        onOpenChange={vi.fn()}
        teamId="t1"
        slug="acme"
        counts={{ home: 12, guest: 3 }}
      />
    );

  it('tries without force first, then requires the slug to force', async () => {
    api.demoteRealm.mockResolvedValueOnce({
      ok: false,
      code: 'REALM_HAS_HOME_USERS',
      message: 'home users exist',
    });
    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Demote realm' }));
    await waitFor(() =>
      expect(api.demoteRealm).toHaveBeenCalledWith('t1', false)
    );

    const forceButton = await screen.findByRole('button', {
      name: /Block 12 users and demote/,
    });
    expect(screen.getByText(/Block 12 home users\?/)).toBeInTheDocument();
    expect(forceButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/to confirm/), {
      target: { value: 'acme' },
    });
    expect(forceButton).toBeEnabled();

    api.demoteRealm.mockResolvedValueOnce(
      ok({ message: 'OK', blockedUsers: 12 })
    );
    fireEvent.click(forceButton);
    await waitFor(() =>
      expect(api.demoteRealm).toHaveBeenCalledWith('t1', true)
    );
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it('re-reads the realm so the force step shows current counts', async () => {
    api.getRealm.mockResolvedValueOnce({
      ...realm,
      counts: { home: 15, guest: 3 },
    });
    api.demoteRealm.mockResolvedValueOnce({
      ok: false,
      code: 'REALM_HAS_HOME_USERS',
      message: 'home users exist',
    });
    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Demote realm' }));
    expect(
      await screen.findByRole('button', { name: /Block 15 users and demote/ })
    ).toBeInTheDocument();
    expect(api.getRealm).toHaveBeenCalledWith('t1');
    expect(screen.getByText(/Block 15 home users\?/)).toBeInTheDocument();
  });

  it('falls back to the known counts when the re-read fails', async () => {
    api.getRealm.mockRejectedValueOnce(new Error('boom'));
    api.demoteRealm.mockResolvedValueOnce({
      ok: false,
      code: 'REALM_HAS_HOME_USERS',
      message: 'home users exist',
    });
    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Demote realm' }));
    expect(
      await screen.findByRole('button', { name: /Block 12 users and demote/ })
    ).toBeInTheDocument();
  });

  it('demotes directly when nothing blocks it', async () => {
    api.demoteRealm.mockResolvedValueOnce(
      ok({ message: 'OK', blockedUsers: 0 })
    );
    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Demote realm' }));
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(api.demoteRealm).toHaveBeenCalledTimes(1);
  });
  it('does not offer the force path for other refusals (e.g. REALMS_DISABLED)', async () => {
    api.demoteRealm.mockResolvedValueOnce({
      ok: false,
      code: 'REALMS_DISABLED',
      message: 'Realms are disabled',
      status: 412,
    });
    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Demote realm' }));
    await waitFor(() => expect(toastMock).toHaveBeenCalled());
    expect(showLastErrorToast()).toBe('Failed to demote realm');
    expect(screen.getByText('Realms are disabled')).toBeInTheDocument();
    expect(screen.queryByLabelText(/to confirm/)).not.toBeInTheDocument();
    expect(refresh).not.toHaveBeenCalled();
  });

  it('keeps the force button disabled while the slug is empty', async () => {
    api.getRealm.mockRejectedValueOnce(new Error('no re-read here'));
    api.demoteRealm.mockResolvedValueOnce({
      ok: false,
      code: 'REALM_HAS_HOME_USERS',
      message: 'home users exist',
    });
    render(
      <DemoteRealmDialog
        open
        onOpenChange={vi.fn()}
        teamId="t1"
        slug=""
        counts={{ home: 2, guest: 0 }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Demote realm' }));
    const forceButton = await screen.findByRole('button', {
      name: /Block 2 users and demote/,
    });
    // typed === slug === '' must not unlock the destructive action.
    expect(forceButton).toBeDisabled();
  });
});
