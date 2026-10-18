import '@testing-library/jest-dom/vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Realm } from '@/lib/models/Realm';
import type { Team } from '@/lib/models/Team';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh, push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/authentication/teams/t1',
}));

const api = vi.hoisted(() => ({
  updateRealm: vi.fn(),
  getRealms: vi.fn(),
  demoteRealm: vi.fn(),
  promoteTeamToRealm: vi.fn(),
}));
vi.mock('@/lib/api/authentication', () => api);

import RealmTab from '@/components/authentication/teams/manageTeam/realm/RealmTab';
import { DemoteRealmDialog } from '@/components/authentication/teams/manageTeam/realm/DemoteRealmDialog';

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
  api.updateRealm.mockImplementation(async () => realm);
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

  it('saves policies independently with a partial body', async () => {
    render(<RealmTab team={realmTeam} realm={realm} memberCount={12} />);
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
    });
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

    api.demoteRealm.mockResolvedValueOnce({
      ok: true,
      message: 'OK',
      blockedUsers: 12,
    });
    fireEvent.click(forceButton);
    await waitFor(() =>
      expect(api.demoteRealm).toHaveBeenCalledWith('t1', true)
    );
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it('demotes directly when nothing blocks it', async () => {
    api.demoteRealm.mockResolvedValueOnce({
      ok: true,
      message: 'OK',
      blockedUsers: 0,
    });
    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Demote realm' }));
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(api.demoteRealm).toHaveBeenCalledTimes(1);
  });
});
