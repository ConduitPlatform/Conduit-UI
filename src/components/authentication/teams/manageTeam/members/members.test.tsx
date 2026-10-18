import '@testing-library/jest-dom/vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import type * as React from 'react';
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
  getTeamMembers: vi.fn(),
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
import { AlertProvider } from '@/components/providers/AlertProvider';
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
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.releasePointerCapture = () => undefined;
  Element.prototype.scrollIntoView = () => undefined;
  authz.getResourceDefinition.mockResolvedValue({
    relations: { member: ['User'], admin: ['User'] },
  });
  api.getTeamMembers.mockResolvedValue({ members: [], count: 0 });
});

function chooseOption(trigger: HTMLElement, name: string) {
  fireEvent.keyDown(trigger, { key: 'Enter' });
  const option = screen.getByRole('option', { name });
  fireEvent.keyDown(option, { key: 'Enter' });
}

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

  const onChanged = vi.fn();
  const renderTable = (opts: { inRealm?: boolean; isRealmTeam?: boolean }) =>
    render(
      <AlertProvider>
        <DataTable
          columns={getTeamMemberColumns({
            teamId: 't1',
            onChanged: onChanged,
            ...opts,
          })}
          data={members}
        />
      </AlertProvider>
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
    const removeButtons = screen.getAllByRole('button', {
      name: 'Remove from team',
    });
    expect(removeButtons[0]).toBeDisabled();
    expect(removeButtons[1]).toBeEnabled();
    expect(removeButtons[2]).toBeEnabled();

    fireEvent.focus(removeButtons[0]!.parentElement!);
    const tooltips = await screen.findAllByText(HOME_USER_REMOVAL_TOOLTIP);
    expect(tooltips.length).toBeGreaterThan(0);
  });

  it('allows removing home users from a sub-team of the realm', () => {
    renderTable({ inRealm: true, isRealmTeam: false });
    for (const button of screen.getAllByRole('button', {
      name: 'Remove from team',
    })) {
      expect(button).toBeEnabled();
    }
  });

  it('has no title attribute on the blocked remove button', () => {
    renderTable({ inRealm: true, isRealmTeam: true });
    const [blocked] = screen.getAllByRole('button', {
      name: 'Remove from team',
    });
    expect(blocked).not.toHaveAttribute('title');
  });

  it('confirms removal through the alert dialog, not window.confirm', async () => {
    const confirm = vi.spyOn(window, 'confirm');
    api.removeTeamMembers.mockResolvedValueOnce({ ok: true, data: 'done' });
    renderTable({ inRealm: true, isRealmTeam: true });
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Remove from team' })[1]!
    );
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent('Remove guest@other.test from this team?');
    expect(api.removeTeamMembers).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Remove' }));
    await waitFor(() =>
      expect(api.removeTeamMembers).toHaveBeenCalledWith('t1', ['g1'])
    );
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(toastMock).toHaveBeenCalledWith({ title: 'Member removed' });
    expect(confirm).not.toHaveBeenCalled();
  });

  it('does not remove when the dialog is cancelled', async () => {
    renderTable({ inRealm: true, isRealmTeam: true });
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Remove from team' })[1]!
    );
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(api.removeTeamMembers).not.toHaveBeenCalled();
  });

  it('toasts the server message when removal is refused', async () => {
    api.removeTeamMembers.mockResolvedValueOnce({
      ok: false,
      code: 'HOME_USER_REMOVAL',
      message: 'Home users cannot be removed',
    });
    renderTable({ inRealm: true, isRealmTeam: true });
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Remove from team' })[1]!
    );
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Remove' }));
    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to remove member',
          description: 'Home users cannot be removed',
          variant: 'destructive',
        })
      )
    );
    expect(onChanged).not.toHaveBeenCalled();
  });
});

describe('AddMemberSheet', () => {
  const HEX = (c: string) => c.repeat(24);
  const open = { allowed: true, allowedHomeRealms: [] as string[] };

  const users = [
    user({ _id: 'global', email: 'global@test.dev', homeRealm: null }),
    user({
      _id: 'elsewhere',
      email: 'elsewhere@test.dev',
      homeRealm: 'realm-2',
    }),
  ];

  type SheetProps = Partial<React.ComponentProps<typeof AddMemberSheet>>;
  const sheet = (props: SheetProps = {}) => (
    <AlertProvider>
      <AddMemberSheet
        teamId="realm-1"
        open
        onOpenChange={vi.fn()}
        onAdded={vi.fn()}
        {...props}
      />
    </AlertProvider>
  );
  const renderSheet = (props: SheetProps = {}) => render(sheet(props));

  beforeEach(() => {
    api.getUsers.mockResolvedValue({ users, count: users.length });
    api.addTeamMembers.mockResolvedValue({ ok: true, data: 'added' });
    api.patchTeamMembersRoles.mockResolvedValue({ ok: true, data: 'ok' });
  });

  it('only offers global users when guests are not allowed', async () => {
    renderSheet({
      realmTeamId: 'realm-1',
      guestPolicy: { allowed: false, allowedHomeRealms: [] },
    });
    expect(
      screen.getByRole('heading', { name: 'Add members' })
    ).toBeInTheDocument();
    expect(await screen.findByRole('note')).toHaveTextContent(
      'does not accept guests'
    );
    const global = await screen.findByLabelText(/global@test\.dev/);
    const elsewhere = await screen.findByLabelText(/elsewhere@test\.dev/);
    expect(global).toBeEnabled();
    expect(elsewhere).toBeDisabled();
    expect(screen.getByText('Guests are not allowed')).toBeInTheDocument();
  });

  it('hints guest-classified candidates when guests are allowed', async () => {
    renderSheet({ realmTeamId: 'realm-1', guestPolicy: open });
    const elsewhere = await screen.findByLabelText(/elsewhere@test\.dev/);
    expect(screen.getAllByText('Will join as guest')).toHaveLength(1);
    expect(elsewhere).toBeEnabled();
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it('filters guests by allowedHomeRealms but always offers global users', async () => {
    api.getUsers.mockResolvedValue({
      users: [
        ...users,
        user({
          _id: 'trusted',
          email: 'trusted@test.dev',
          homeRealm: 'realm-3',
        }),
      ],
      count: 3,
    });
    renderSheet({
      realmTeamId: 'realm-1',
      guestPolicy: { allowed: true, allowedHomeRealms: ['realm-3'] },
    });
    expect(await screen.findByLabelText(/global@test\.dev/)).toBeEnabled();
    expect(await screen.findByLabelText(/trusted@test\.dev/)).toBeEnabled();
    expect(await screen.findByLabelText(/elsewhere@test\.dev/)).toBeDisabled();
    expect(
      screen.getByText('Home realm is not trusted by this realm')
    ).toBeInTheDocument();
  });

  it('disables users that are already members', async () => {
    renderSheet({ existingMemberIds: ['global'] });
    expect(await screen.findByLabelText(/global@test\.dev/)).toBeDisabled();
    expect(screen.getByText('Already a member')).toBeInTheDocument();
  });

  it('searches users after the debounce', async () => {
    renderSheet({ realmTeamId: 'realm-1', guestPolicy: open });
    await screen.findByLabelText(/global@test\.dev/);
    fireEvent.change(screen.getByLabelText('Search users'), {
      target: { value: 'ann' },
    });
    await waitFor(() =>
      expect(api.getUsers).toHaveBeenLastCalledWith(0, 20, { search: 'ann' })
    );
  });

  it('keeps selections across searches', async () => {
    renderSheet();
    fireEvent.click(await screen.findByLabelText(/global@test\.dev/));
    expect(
      screen.getByRole('button', { name: 'Add 1 member' })
    ).toBeInTheDocument();

    api.getUsers.mockResolvedValue({
      users: [user({ _id: 'ann', email: 'ann@test.dev' })],
      count: 1,
    });
    fireEvent.change(screen.getByLabelText('Search users'), {
      target: { value: 'ann' },
    });
    fireEvent.click(await screen.findByLabelText(/ann@test\.dev/));
    expect(
      screen.getByRole('button', { name: 'Add 2 members' })
    ).toBeInTheDocument();

    api.getUsers.mockResolvedValue({ users, count: users.length });
    fireEvent.change(screen.getByLabelText('Search users'), {
      target: { value: '' },
    });
    expect(await screen.findByLabelText(/global@test\.dev/)).toBeChecked();
  });

  it('resets selection and search when the sheet closes', async () => {
    const { rerender } = renderSheet();
    fireEvent.click(await screen.findByLabelText(/global@test\.dev/));
    fireEvent.change(screen.getByLabelText('Search users'), {
      target: { value: 'gl' },
    });
    rerender(sheet({ open: false }));
    rerender(sheet({ open: true }));
    expect(screen.getByLabelText('Search users')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Add members' })).toBeDisabled();
  });

  it('adds through addTeamMembers on a realm team, guests included', async () => {
    const onAdded = vi.fn();
    const onOpenChange = vi.fn();
    renderSheet({
      realmTeamId: 'realm-1',
      guestPolicy: open,
      onAdded,
      onOpenChange,
    });
    fireEvent.click(await screen.findByLabelText(/elsewhere@test\.dev/));
    fireEvent.click(screen.getByRole('button', { name: 'Add 1 member' }));
    await waitFor(() =>
      expect(api.addTeamMembers).toHaveBeenCalledWith('realm-1', [users[1]])
    );
    expect(api.patchTeamMembersRoles).not.toHaveBeenCalled();
    await waitFor(() => expect(onAdded).toHaveBeenCalled());
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(toastMock).toHaveBeenCalledWith({ title: 'Member added' });
  });

  it('adds to a sub-team of a realm with the realm hints', async () => {
    renderSheet({
      teamId: 'sub-1',
      realmTeamId: 'realm-1',
      guestPolicy: { allowed: false, allowedHomeRealms: [] },
    });
    const elsewhere = await screen.findByLabelText(/elsewhere@test\.dev/);
    expect(elsewhere).toBeDisabled();
    fireEvent.click(await screen.findByLabelText(/global@test\.dev/));
    fireEvent.click(screen.getByRole('button', { name: 'Add 1 member' }));
    // The global user becomes a home user of the realm: confirmed first.
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Add members' })
    );
    await waitFor(() =>
      expect(api.addTeamMembers).toHaveBeenCalledWith('sub-1', [users[0]])
    );
  });

  describe('global users becoming home users', () => {
    const homeText =
      '1 user becomes a home user of acme. Their global sessions end and they can only sign in at this realm.';

    it('badges global users on a realm team, not guests or other plain teams', async () => {
      renderSheet({ realmTeamId: 'realm-1', guestPolicy: open });
      await screen.findByLabelText(/global@test\.dev/);
      expect(screen.getAllByText('Becomes home user')).toHaveLength(1);
      expect(screen.getAllByText('Will join as guest')).toHaveLength(1);
    });

    it('shows no badge outside a realm', async () => {
      renderSheet();
      await screen.findByLabelText(/global@test\.dev/);
      expect(screen.queryByText('Becomes home user')).not.toBeInTheDocument();
    });

    it('confirms before adding global users, naming the realm', async () => {
      renderSheet({
        realmTeamId: 'realm-1',
        realmSlug: 'acme',
        guestPolicy: open,
      });
      fireEvent.click(await screen.findByLabelText(/global@test\.dev/));
      fireEvent.click(screen.getByRole('button', { name: 'Add 1 member' }));
      const dialog = await screen.findByRole('alertdialog');
      expect(dialog).toHaveTextContent(homeText);
      expect(api.addTeamMembers).not.toHaveBeenCalled();
      fireEvent.click(
        within(dialog).getByRole('button', { name: 'Add members' })
      );
      await waitFor(() =>
        expect(api.addTeamMembers).toHaveBeenCalledWith('realm-1', [users[0]])
      );
    });

    it('sends nothing when the confirmation is cancelled', async () => {
      renderSheet({
        realmTeamId: 'realm-1',
        realmSlug: 'acme',
        guestPolicy: open,
      });
      fireEvent.click(await screen.findByLabelText(/global@test\.dev/));
      fireEvent.click(screen.getByRole('button', { name: 'Add 1 member' }));
      const dialog = await screen.findByRole('alertdialog');
      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      expect(api.addTeamMembers).not.toHaveBeenCalled();
      expect(api.getTeamMembers).not.toHaveBeenCalled();
    });

    it('does not ask when only guests are selected', async () => {
      renderSheet({
        realmTeamId: 'realm-1',
        realmSlug: 'acme',
        guestPolicy: open,
      });
      fireEvent.click(await screen.findByLabelText(/elsewhere@test\.dev/));
      fireEvent.click(screen.getByRole('button', { name: 'Add 1 member' }));
      await waitFor(() => expect(api.addTeamMembers).toHaveBeenCalled());
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('does not ask on a team outside a realm', async () => {
      renderSheet();
      fireEvent.click(await screen.findByLabelText(/global@test\.dev/));
      fireEvent.click(screen.getByRole('button', { name: 'Add 1 member' }));
      await waitFor(() => expect(api.addTeamMembers).toHaveBeenCalled());
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('counts only the home-classified users in a mixed selection', async () => {
      renderSheet({
        realmTeamId: 'realm-1',
        realmSlug: 'acme',
        guestPolicy: open,
      });
      fireEvent.click(await screen.findByLabelText(/global@test\.dev/));
      fireEvent.click(await screen.findByLabelText(/elsewhere@test\.dev/));
      fireEvent.click(screen.getByRole('button', { name: 'Add 2 members' }));
      expect(await screen.findByRole('alertdialog')).toHaveTextContent(
        homeText
      );
    });
  });

  it('shows the server message when adding is refused', async () => {
    api.addTeamMembers.mockResolvedValue({
      ok: false,
      code: 'GUESTS_NOT_ALLOWED',
      message: 'Guests are not allowed',
    });
    const onAdded = vi.fn();
    renderSheet({ realmTeamId: 'realm-1', guestPolicy: open, onAdded });
    fireEvent.click(await screen.findByLabelText(/elsewhere@test\.dev/));
    fireEvent.click(screen.getByRole('button', { name: 'Add 1 member' }));
    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to add members',
          description: 'Guests are not allowed',
        })
      )
    );
    expect(onAdded).not.toHaveBeenCalled();
    expect(api.patchTeamMembersRoles).not.toHaveBeenCalled();
  });

  it('drops candidates that stopped being eligible before submitting', async () => {
    const { rerender } = renderSheet({
      realmTeamId: 'realm-1',
      guestPolicy: open,
    });
    fireEvent.click(await screen.findByLabelText(/elsewhere@test\.dev/));
    rerender(
      sheet({
        realmTeamId: 'realm-1',
        guestPolicy: { allowed: false, allowedHomeRealms: [] },
      })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Add 1 member' }));
    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Nobody to add' })
      )
    );
    expect(api.addTeamMembers).not.toHaveBeenCalled();
  });

  it('skips the role patch for the default role', async () => {
    renderSheet();
    fireEvent.click(await screen.findByLabelText(/global@test\.dev/));
    fireEvent.click(screen.getByRole('button', { name: 'Add 1 member' }));
    await waitFor(() => expect(api.addTeamMembers).toHaveBeenCalledTimes(1));
    expect(api.addTeamMembers).toHaveBeenCalledWith('realm-1', [users[0]]);
    expect(api.patchTeamMembersRoles).not.toHaveBeenCalled();
  });

  describe('non-default role', () => {
    const fresh = user({ _id: HEX('a'), email: 'fresh@test.dev' });
    const onPage2 = user({ _id: HEX('b'), email: 'onpage2@test.dev' });
    const odd = user({ _id: 'legacy-id', email: 'legacy@test.dev' });

    beforeEach(() => {
      api.getUsers.mockResolvedValue({
        users: [fresh, onPage2, odd],
        count: 3,
      });
      api.getTeamMembers.mockImplementation(
        async (
          _team: string,
          _skip: number,
          _limit: number,
          p: { search: string }
        ) =>
          p.search === onPage2._id
            ? { members: [{ _id: onPage2._id }], count: 1 }
            : { members: [], count: 0 }
      );
    });

    it('patches the role only for users confirmed as newly added', async () => {
      renderSheet({ teamId: 't1' });
      fireEvent.click(await screen.findByLabelText(/fresh@test\.dev/));
      fireEvent.click(screen.getByLabelText(/onpage2@test\.dev/));
      fireEvent.click(screen.getByLabelText(/legacy@test\.dev/));
      await waitFor(() =>
        expect(screen.getByRole('combobox')).toHaveTextContent('member')
      );
      chooseOption(screen.getByRole('combobox'), 'admin');
      fireEvent.click(screen.getByRole('button', { name: 'Add 3 members' }));

      await waitFor(() => expect(api.addTeamMembers).toHaveBeenCalled());
      // the member from another page is neither re-added nor re-roled
      expect(api.addTeamMembers).toHaveBeenCalledWith('t1', [fresh, odd]);
      expect(api.getTeamMembers).toHaveBeenCalledWith('t1', 0, 1, {
        search: onPage2._id,
      });
      await waitFor(() =>
        expect(api.patchTeamMembersRoles).toHaveBeenCalledWith(
          't1',
          [fresh._id],
          'admin'
        )
      );
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Role not changed for 2 existing members',
        })
      );
      // only the users actually added are counted
      expect(toastMock).toHaveBeenCalledWith({ title: '2 members added' });
    });

    it('never patches ids it cannot verify as new', async () => {
      renderSheet({ teamId: 't1' });
      fireEvent.click(await screen.findByLabelText(/legacy@test\.dev/));
      await waitFor(() =>
        expect(screen.getByRole('combobox')).toHaveTextContent('member')
      );
      chooseOption(screen.getByRole('combobox'), 'admin');
      fireEvent.click(screen.getByRole('button', { name: 'Add 1 member' }));
      await waitFor(() => expect(api.addTeamMembers).toHaveBeenCalled());
      expect(api.patchTeamMembersRoles).not.toHaveBeenCalled();
    });

    it('treats a failed lookup as unverified', async () => {
      api.getTeamMembers.mockRejectedValue(new Error('boom'));
      renderSheet({ teamId: 't1' });
      fireEvent.click(await screen.findByLabelText(/fresh@test\.dev/));
      await waitFor(() =>
        expect(screen.getByRole('combobox')).toHaveTextContent('member')
      );
      chooseOption(screen.getByRole('combobox'), 'admin');
      fireEvent.click(screen.getByRole('button', { name: 'Add 1 member' }));
      await waitFor(() => expect(api.addTeamMembers).toHaveBeenCalled());
      expect(api.patchTeamMembersRoles).not.toHaveBeenCalled();
    });

    it('does not add anybody who turns out to be a member already', async () => {
      renderSheet({ teamId: 't1' });
      fireEvent.click(await screen.findByLabelText(/onpage2@test\.dev/));
      fireEvent.click(screen.getByRole('button', { name: 'Add 1 member' }));
      await waitFor(() =>
        expect(toastMock).toHaveBeenCalledWith({
          title: 'Everybody selected is a member already',
        })
      );
      expect(api.addTeamMembers).not.toHaveBeenCalled();
    });
  });

  describe('when member is not an allowed role', () => {
    beforeEach(() => {
      authz.getResourceDefinition.mockResolvedValue({
        relations: { admin: ['User'], editor: ['User'] },
      });
    });

    it('requires an explicit role choice', async () => {
      renderSheet({ teamId: 't1' });
      fireEvent.click(await screen.findByLabelText(/global@test\.dev/));
      const submit = screen.getByRole('button', { name: 'Add 1 member' });
      await waitFor(() =>
        expect(
          screen.getByText('Choose a role for the new members.')
        ).toBeInTheDocument()
      );
      expect(submit).toBeDisabled();
      expect(screen.getByRole('combobox')).toHaveTextContent('Select a role');

      chooseOption(screen.getByRole('combobox'), 'editor');
      expect(submit).toBeEnabled();
    });
  });
});
