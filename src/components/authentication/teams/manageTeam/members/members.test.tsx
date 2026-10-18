import '@testing-library/jest-dom/vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TeamUser, User } from '@/lib/models/User';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/authentication/teams/t1',
}));

const api = vi.hoisted(() => ({
  removeTeamMembers: vi.fn(),
  patchTeamMembersRoles: vi.fn(),
  addTeamMembers: vi.fn(),
  addRealmGuests: vi.fn(),
  getRealm: vi.fn(),
  getUsers: vi.fn(),
}));
vi.mock('@/lib/api/authentication', () => api);

const authz = vi.hoisted(() => ({ getResourceDefinition: vi.fn() }));
vi.mock('@/lib/api/authorization', () => authz);

const toastMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/hooks/use-toast', () => ({ toast: toastMock }));

import { getTeamMemberColumns } from '@/components/authentication/teams/manageTeam/members/columns';
import { AddMemberSheet } from '@/components/authentication/teams/manageTeam/members/addMemberSheet/addMemberSheet';
import { DataTable } from '@/components/ui/data-table';
import { HOME_USER_REMOVAL_TOOLTIP } from '@/lib/authentication/realmMembers';

const member = (over: Partial<TeamUser>): TeamUser =>
  ({
    _id: 'u1',
    email: 'home@acme.test',
    role: 'member',
    active: true,
    ...over,
  }) as TeamUser;

const user = (over: Partial<User>): User =>
  ({
    _id: 'u',
    email: 'u@test.dev',
    active: true,
    isVerified: true,
    ...over,
  }) as User;

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  authz.getResourceDefinition.mockResolvedValue({
    relations: { member: ['User'], admin: ['User'] },
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('Members table', () => {
  const members = [
    member({ _id: 'h1', email: 'home@acme.test', membershipType: 'home' }),
    member({ _id: 'g1', email: 'guest@other.test', membershipType: 'guest' }),
    member({ _id: 'n1', email: 'plain@acme.test', membershipType: undefined }),
  ];

  const renderTable = (opts: { inRealm?: boolean; isRealmTeam?: boolean }) =>
    render(
      <DataTable
        columns={getTeamMemberColumns({
          teamId: 't1',
          onChanged: vi.fn(),
          ...opts,
        })}
        data={members}
      />
    );

  it('hides the Type column outside realms', () => {
    renderTable({});
    expect(
      screen.queryByRole('columnheader', { name: 'Type' })
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
  });

  it('renders Home, Guest and a dash in the Type column', () => {
    renderTable({ inRealm: true, isRealmTeam: true });
    expect(
      screen.getByRole('columnheader', { name: 'Type' })
    ).toBeInTheDocument();
    const rows = screen.getAllByRole('row');
    expect(within(rows[1]!).getByText('Home')).toBeInTheDocument();
    expect(within(rows[2]!).getByText('Guest')).toBeInTheDocument();
    expect(within(rows[3]!).getByText('—')).toBeInTheDocument();
  });

  it('disables removing home users from the realm team and explains why', async () => {
    renderTable({ inRealm: true, isRealmTeam: true });
    const removeButtons = screen.getAllByTitle('Remove from team');
    expect(removeButtons[0]).toBeDisabled();
    expect(removeButtons[1]).toBeEnabled();
    expect(removeButtons[2]).toBeEnabled();

    fireEvent.focus(removeButtons[0]!.parentElement!);
    const tooltips = await screen.findAllByText(HOME_USER_REMOVAL_TOOLTIP);
    expect(tooltips.length).toBeGreaterThan(0);
  });

  it('allows removing home users from a sub-team of the realm', () => {
    renderTable({ inRealm: true, isRealmTeam: false });
    for (const button of screen.getAllByTitle('Remove from team')) {
      expect(button).toBeEnabled();
    }
  });

  it('toasts the server message when removal is refused', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    api.removeTeamMembers.mockRejectedValueOnce(
      new Error('Home users cannot be removed')
    );
    renderTable({ inRealm: true, isRealmTeam: true });
    fireEvent.click(screen.getAllByTitle('Remove from team')[1]!);
    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to remove member',
          description: 'Home users cannot be removed',
        })
      )
    );
  });
});

describe('AddMemberSheet', () => {
  const realmWithGuests = (
    allowed: boolean,
    allowedHomeRealms: string[] = []
  ) => ({
    team: { _id: 'realm-1' },
    settings: { policies: { guests: { allowed, allowedHomeRealms } } },
    counts: { home: 1, guest: 0 },
  });

  const users = [
    user({ _id: 'global', email: 'global@test.dev', homeRealm: null }),
    user({
      _id: 'elsewhere',
      email: 'elsewhere@test.dev',
      homeRealm: 'realm-2',
    }),
  ];

  const renderSheet = (props: { isRealmTeam: boolean }) =>
    render(
      <AddMemberSheet
        teamId="realm-1"
        open
        onOpenChange={vi.fn()}
        onAdded={vi.fn()}
        {...props}
      />
    );

  beforeEach(() => {
    api.getUsers.mockResolvedValue({ users, count: users.length });
  });

  it('only offers users without a home realm when guests are not allowed', async () => {
    api.getRealm.mockResolvedValue(realmWithGuests(false));
    renderSheet({ isRealmTeam: true });

    expect(
      screen.getByRole('heading', { name: 'Add guest' })
    ).toBeInTheDocument();
    expect(await screen.findByRole('note')).toHaveTextContent(
      'does not accept guests'
    );
    const global = await screen.findByLabelText(/global@test\.dev/);
    const elsewhere = await screen.findByLabelText(/elsewhere@test\.dev/);
    expect(global).toBeEnabled();
    await waitFor(() => expect(elsewhere).toBeDisabled());
  });

  it('offers everybody and hints guests when guests are allowed', async () => {
    api.getRealm.mockResolvedValue(realmWithGuests(true));
    renderSheet({ isRealmTeam: true });

    const elsewhere = await screen.findByLabelText(/elsewhere@test\.dev/);
    await waitFor(() => expect(screen.getByText('Guest')).toBeInTheDocument());
    expect(elsewhere).toBeEnabled();
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it('searches users after the debounce', async () => {
    api.getRealm.mockResolvedValue(realmWithGuests(true));
    renderSheet({ isRealmTeam: true });
    await screen.findByLabelText(/global@test\.dev/);
    fireEvent.change(screen.getByLabelText('Search users'), {
      target: { value: 'ann' },
    });
    await waitFor(() =>
      expect(api.getUsers).toHaveBeenLastCalledWith(0, 20, { search: 'ann' })
    );
  });

  it('adds guests through the realm API', async () => {
    api.getRealm.mockResolvedValue(realmWithGuests(true));
    api.addRealmGuests.mockResolvedValue({ ok: true, data: { added: 1 } });
    const onAdded = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <AddMemberSheet
        teamId="realm-1"
        isRealmTeam
        open
        onOpenChange={onOpenChange}
        onAdded={onAdded}
      />
    );
    fireEvent.click(await screen.findByLabelText(/elsewhere@test\.dev/));
    fireEvent.click(screen.getByRole('button', { name: 'Add 1 guest' }));
    await waitFor(() =>
      expect(api.addRealmGuests).toHaveBeenCalledWith('realm-1', ['elsewhere'])
    );
    expect(api.addTeamMembers).not.toHaveBeenCalled();
    expect(api.patchTeamMembersRoles).not.toHaveBeenCalled();
    await waitFor(() => expect(onAdded).toHaveBeenCalled());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows the server message when adding guests fails', async () => {
    api.getRealm.mockResolvedValue(realmWithGuests(true));
    api.addRealmGuests.mockResolvedValue({
      ok: false,
      code: 'GUESTS_NOT_ALLOWED',
      message: 'Guests are not allowed',
    });
    const onAdded = vi.fn();
    render(
      <AddMemberSheet
        teamId="realm-1"
        isRealmTeam
        open
        onOpenChange={vi.fn()}
        onAdded={onAdded}
      />
    );
    fireEvent.click(await screen.findByLabelText(/elsewhere@test\.dev/));
    fireEvent.click(screen.getByRole('button', { name: 'Add 1 guest' }));
    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to add guests',
          description: 'Guests are not allowed',
        })
      )
    );
    expect(onAdded).not.toHaveBeenCalled();
  });

  it('adds members to a plain team and skips the role patch for the default role', async () => {
    api.addTeamMembers.mockResolvedValue({ members: [], count: 0 });
    renderSheet({ isRealmTeam: false });
    expect(
      screen.getByRole('heading', { name: 'Add members' })
    ).toBeInTheDocument();
    fireEvent.click(await screen.findByLabelText(/global@test\.dev/));
    fireEvent.click(screen.getByRole('button', { name: 'Add 1 member' }));
    await waitFor(() => expect(api.addTeamMembers).toHaveBeenCalledTimes(1));
    expect(api.addTeamMembers).toHaveBeenCalledWith('realm-1', [users[0]]);
    expect(api.getRealm).not.toHaveBeenCalled();
    expect(api.patchTeamMembersRoles).not.toHaveBeenCalled();
  });
});
