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
import type { User } from '@/lib/models/User';

const nav = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
  search: '',
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: nav.replace,
    refresh: nav.refresh,
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(nav.search),
  usePathname: () => '/authentication/users',
}));

const api = vi.hoisted(() => ({
  getUsers: vi.fn(),
  createUser: vi.fn(),
  setUserHomeRealm: vi.fn(),
  getUserRealms: vi.fn(),
  removeRealmGuest: vi.fn(),
  deleteUser: vi.fn(),
  deleteUserResult: vi.fn(),
  blockUnblockUser: vi.fn(),
  blockUserResult: vi.fn(),
  patchUser: vi.fn(),
  updateUser: vi.fn(),
  setUserPassword: vi.fn(),
  sendUserPasswordReset: vi.fn(),
  resetUserTwoFa: vi.fn(),
  getUserTeams: vi.fn(),
  getTeams: vi.fn(),
  addTeamMemberIds: vi.fn(),
  removeTeamMembers: vi.fn(),
  patchTeamMembersRoles: vi.fn(),
}));
vi.mock('@/lib/api/authentication', () => api);

const authz = vi.hoisted(() => ({
  getResourceDefinition: vi.fn(),
}));
vi.mock('@/lib/api/authorization', () => authz);

const toastMock = vi.hoisted(() =>
  vi.fn(() => ({ id: 't', dismiss: vi.fn(), update: vi.fn() }))
);
vi.mock('@/lib/hooks/use-toast', () => ({ toast: toastMock }));

import UsersTable from '@/components/authentication/users/users';
import { EditUserSheet } from '@/components/authentication/users/editUserSheet/editUserSheet';
import { AddUserSheet } from '@/components/authentication/users/addUserSheet/addUserSheet';
import { AlertProvider } from '@/components/providers/AlertProvider';
import { USER_ADMIN_CAPABILITIES_V1 } from '@/lib/authentication/userCapabilities';
import {
  UserActionsProvider,
  useUserActions,
} from '@/components/authentication/users/UserActionsProvider';

const slugs = new Map([
  ['t1', 'acme'],
  ['t2', 'globex'],
]);

const user = (over: Partial<User>): User =>
  ({
    _id: 'u1',
    email: 'ann@acme.test',
    active: true,
    isVerified: true,
    ...over,
  }) as User;

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

function chooseOption(trigger: HTMLElement, name: string) {
  fireEvent.keyDown(trigger, { key: 'Enter' });
  const option = screen.getByRole('option', { name });
  fireEvent.keyDown(option, { key: 'Enter' });
}

beforeEach(() => {
  polyfillSelect();
  nav.search = '';
  api.getUsers.mockResolvedValue({ users: [], count: 0 });
  api.getUserRealms.mockResolvedValue({
    ok: true,
    data: { home: null, guests: [] },
  });
  api.updateUser.mockResolvedValue({ ok: true, data: {} });
  api.deleteUserResult.mockResolvedValue({ ok: true, data: 'OK' });
  api.blockUserResult.mockResolvedValue({ ok: true, data: 'OK' });
  api.setUserPassword.mockResolvedValue({ ok: true, data: 'OK' });
  api.sendUserPasswordReset.mockResolvedValue({ ok: true, data: 'OK' });
  api.resetUserTwoFa.mockResolvedValue({ ok: true, data: 'OK' });
  api.getUserTeams.mockResolvedValue({
    ok: true,
    data: { teams: [], count: 0 },
  });
  api.getTeams.mockResolvedValue({ teams: [], count: 0 });
  api.addTeamMemberIds.mockResolvedValue({ ok: true, data: 'OK' });
  api.removeTeamMembers.mockResolvedValue({ ok: true, data: 'OK' });
  api.patchTeamMembersRoles.mockResolvedValue({ ok: true, data: 'OK' });
  authz.getResourceDefinition.mockResolvedValue({
    name: 'Team',
    relations: { member: ['User'], owner: ['User'] },
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('UsersTable', () => {
  const rows = [
    user({ _id: 'a', email: 'a@x.test', homeRealm: 't1' }),
    user({ _id: 'b', email: 'b@x.test', homeRealm: null }),
    user({ _id: 'c', email: 'c@x.test', homeRealm: 'gone' }),
  ];

  it('looks like before when realms are disabled', () => {
    render(<UsersTable data={rows} count={3} />);
    expect(
      screen.queryByRole('columnheader', { name: 'Home realm' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', { name: 'Home realm filter' })
    ).not.toBeInTheDocument();
  });

  it('shows the slug, Global, or the raw id for unknown realms', () => {
    render(
      <UsersTable data={rows} count={3} realmsEnabled realmSlugs={slugs} />
    );
    expect(
      screen.getByRole('columnheader', { name: 'Home realm' })
    ).toBeInTheDocument();
    const body = screen.getAllByRole('row');
    expect(within(body[1]!).getByText('acme')).toBeInTheDocument();
    expect(within(body[2]!).getByText('Global')).toBeInTheDocument();
    expect(within(body[3]!).getByText('gone')).toBeInTheDocument();
  });

  it('maps the filter to the homeRealm query param', () => {
    nav.search = 'search=ann&skip=10';
    render(
      <UsersTable data={rows} count={3} realmsEnabled realmSlugs={slugs} />
    );
    const filter = screen.getByRole('combobox', { name: 'Home realm filter' });
    expect(filter).toHaveTextContent('All home realms');

    chooseOption(filter, 'Global');
    let url = nav.replace.mock.calls.at(-1)?.[0] as string;
    expect(url.startsWith('/authentication/users?')).toBe(true);
    let params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('homeRealm')).toBe('global');
    expect(params.get('search')).toBe('ann');
    expect(params.has('skip')).toBe(false);

    chooseOption(
      screen.getByRole('combobox', { name: 'Home realm filter' }),
      'globex'
    );
    url = nav.replace.mock.calls.at(-1)?.[0] as string;
    params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('homeRealm')).toBe('t2');
  });

  it('reflects the query param in the filter and keeps it when searching', async () => {
    nav.search = 'homeRealm=t1';
    render(
      <UsersTable data={rows} count={3} realmsEnabled realmSlugs={slugs} />
    );
    expect(
      screen.getByRole('combobox', { name: 'Home realm filter' })
    ).toHaveTextContent('acme');
    fireEvent.change(screen.getByRole('textbox', { name: 'Search users' }), {
      target: { value: 'ann' },
    });
    await waitFor(() => expect(nav.replace).toHaveBeenCalled());
    const url = nav.replace.mock.calls.at(-1)?.[0] as string;
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('homeRealm')).toBe('t1');
    expect(params.get('search')).toBe('ann');
    expect(api.getUsers).not.toHaveBeenCalled();
  });
});

describe('AddUserSheet', () => {
  it('creates the user with the chosen home realm', async () => {
    api.createUser.mockResolvedValue({ ok: true, data: user({ _id: 'new' }) });
    render(
      <AlertProvider>
        <AddUserSheet defaultOpen realmsEnabled realmSlugs={slugs} />
      </AlertProvider>
    );
    fireEvent.change(screen.getByPlaceholderText('mail@conduit.com'), {
      target: { value: 'new@acme.test' },
    });
    fireEvent.change(screen.getByPlaceholderText('very secret'), {
      target: { value: 'secret123' },
    });
    const select = screen.getByRole('combobox');
    expect(select).toHaveTextContent('Global');
    chooseOption(select, 'acme');
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() =>
      expect(api.createUser).toHaveBeenCalledWith(
        'new@acme.test',
        'secret123',
        { homeRealm: 't1' }
      )
    );
  });

  it('creates global users without a home realm option', async () => {
    api.createUser.mockResolvedValue({ ok: true, data: user({ _id: 'new' }) });
    render(
      <AlertProvider>
        <AddUserSheet defaultOpen realmsEnabled realmSlugs={slugs} />
      </AlertProvider>
    );
    fireEvent.change(screen.getByPlaceholderText('mail@conduit.com'), {
      target: { value: 'new@acme.test' },
    });
    fireEvent.change(screen.getByPlaceholderText('very secret'), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() =>
      expect(api.createUser).toHaveBeenCalledWith(
        'new@acme.test',
        'secret123',
        undefined
      )
    );
  });

  it('shows the server message when creating the user fails', async () => {
    api.createUser.mockResolvedValue({
      ok: false,
      code: 'ALREADY_EXISTS',
      message: 'Email is taken',
    });
    const onSuccess = vi.fn();
    render(
      <AlertProvider>
        <AddUserSheet defaultOpen onSuccess={onSuccess} />
      </AlertProvider>
    );
    fireEvent.change(screen.getByPlaceholderText('mail@conduit.com'), {
      target: { value: 'new@acme.test' },
    });
    fireEvent.change(screen.getByPlaceholderText('very secret'), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Add User' })
      )
    );
    await waitFor(() => expect(api.createUser).toHaveBeenCalled());
    expect(onSuccess).not.toHaveBeenCalled();
    const failure = toastMock.mock.calls
      .map(call => JSON.stringify(call))
      .join('');
    expect(failure).toContain('Email is taken');
  });

  it('rejects a password shorter than 8 characters', async () => {
    render(
      <AlertProvider>
        <AddUserSheet defaultOpen />
      </AlertProvider>
    );
    fireEvent.change(screen.getByPlaceholderText('mail@conduit.com'), {
      target: { value: 'new@acme.test' },
    });
    fireEvent.change(screen.getByPlaceholderText('very secret'), {
      target: { value: 'secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(
      await screen.findByText(/at least 8 characters/)
    ).toBeInTheDocument();
    expect(api.createUser).not.toHaveBeenCalled();
  });

  it('has no home realm select when realms are disabled', () => {
    render(
      <AlertProvider>
        <AddUserSheet defaultOpen />
      </AlertProvider>
    );
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });
});

describe('EditUserSheet', () => {
  const renderSheet = (u: User = user({ homeRealm: null })) =>
    render(
      <AlertProvider>
        <EditUserSheet
          userId={u._id}
          user={u}
          open
          onOpenChange={vi.fn()}
          realmSlugs={slugs}
        />
      </AlertProvider>
    );

  it('lists the home realm and each linked realm from the user realms endpoint', async () => {
    api.getUserRealms.mockResolvedValue({
      ok: true,
      data: {
        home: { _id: 't1', name: 'Acme', slug: 'acme' },
        guests: [
          {
            _id: 't2',
            name: 'Globex',
            slug: 'globex',
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        ],
      },
    });
    renderSheet(user({ homeRealm: 't1' }));
    const realms = screen.getByRole('region', { name: 'Realms' });
    expect(await within(realms).findByText('acme')).toBeInTheDocument();
    expect(within(realms).getByText('globex')).toBeInTheDocument();
    expect(
      within(realms).getByRole('button', { name: 'Unlink globex' })
    ).toBeEnabled();
    expect(api.getUserRealms).toHaveBeenCalledWith('u1');
  });

  it('says so when the user is linked to no other realm', async () => {
    renderSheet(user({ homeRealm: null }));
    const realms = screen.getByRole('region', { name: 'Realms' });
    expect(
      await within(realms).findByText('Not linked to any other realm.')
    ).toBeInTheDocument();
    expect(within(realms).getByText('Global')).toBeInTheDocument();
    expect(within(realms).queryByRole('button', { name: /Unlink/ })).toBeNull();
  });

  it('shows a loading state until the realms arrive', async () => {
    let resolve: (value: unknown) => void = () => undefined;
    api.getUserRealms.mockReturnValue(
      new Promise(done => {
        resolve = done;
      })
    );
    renderSheet();
    expect(screen.getByText('Loading realms…')).toBeInTheDocument();
    resolve({ ok: true, data: { home: null, guests: [] } });
    expect(
      await screen.findByText('Not linked to any other realm.')
    ).toBeInTheDocument();
  });

  it('shows an error with a retry that reloads the realms', async () => {
    api.getUserRealms.mockResolvedValueOnce({
      ok: false,
      code: 'NOT_FOUND',
      message: 'User does not exist',
    });
    renderSheet();
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Linked realms could not be loaded.');
    fireEvent.click(within(alert).getByRole('button', { name: 'Retry' }));
    expect(
      await screen.findByText('Not linked to any other realm.')
    ).toBeInTheDocument();
    expect(api.getUserRealms).toHaveBeenCalledTimes(2);
  });

  it('keeps the home realm from the user row when the realms cannot be loaded', async () => {
    api.getUserRealms.mockResolvedValue({
      ok: false,
      code: 'INTERNAL',
      message: 'boom',
    });
    renderSheet(user({ homeRealm: 't1' }));
    const realms = screen.getByRole('region', { name: 'Realms' });
    const alert = await within(realms).findByRole('alert');
    expect(alert).toHaveTextContent('Linked realms could not be loaded.');
    expect(within(alert).getByRole('button', { name: 'Retry' })).toBeEnabled();
    // The home row comes from the user, labelled with its slug.
    expect(within(realms).getByText('Home realm')).toBeInTheDocument();
    expect(within(realms).getByText('acme')).toBeInTheDocument();
    expect(within(realms).queryByText(/Not linked/)).toBeNull();
    expect(within(realms).queryByRole('button', { name: /Unlink/ })).toBeNull();
  });

  it('never offers Unlink for a guest entry that is the home realm', async () => {
    api.getUserRealms.mockResolvedValue({
      ok: true,
      data: {
        home: { _id: 't2', name: 'Globex', slug: 'globex' },
        guests: [
          {
            _id: 't2',
            name: 'Globex',
            slug: 'globex',
            createdAt: 'now',
          },
        ],
      },
    });
    renderSheet(user({ homeRealm: 't2' }));
    const realms = screen.getByRole('region', { name: 'Realms' });
    expect(
      await within(realms).findByText('Not linked to any other realm.')
    ).toBeInTheDocument();
    expect(within(realms).queryByRole('button', { name: /Unlink/ })).toBeNull();
  });

  it('reloads the realms after a failed unlink too', async () => {
    api.getUserRealms.mockResolvedValue({
      ok: true,
      data: {
        home: null,
        guests: [
          { _id: 't2', name: 'Globex', slug: 'globex', createdAt: 'now' },
        ],
      },
    });
    api.removeRealmGuest.mockResolvedValue({
      ok: false,
      code: 'INTERNAL',
      message: 'Unlink failed',
    });
    renderSheet();
    fireEvent.click(
      await screen.findByRole('button', { name: 'Unlink globex' })
    );
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Unlink' }));
    await waitFor(() => expect(api.getUserRealms).toHaveBeenCalledTimes(2));
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Failed to unlink realm' })
    );
  });

  it('reloads the realms after a home realm move, so the new home shows', async () => {
    api.getUserRealms
      .mockResolvedValueOnce({
        ok: true,
        data: { home: null, guests: [] },
      })
      .mockResolvedValueOnce({
        ok: true,
        data: {
          home: { _id: 't1', name: 'Acme', slug: 'acme' },
          guests: [],
        },
      });
    api.setUserHomeRealm.mockResolvedValue({
      ok: true,
      data: user({ homeRealm: 't1' }),
    });
    renderSheet(user({ homeRealm: null }));
    chooseOption(screen.getByRole('combobox'), 'acme');
    fireEvent.click(screen.getByRole('button', { name: 'Move home realm' }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Move' }));

    const realms = screen.getByRole('region', { name: 'Realms' });
    expect(await within(realms).findByText('acme')).toBeInTheDocument();
    expect(api.getUserRealms).toHaveBeenCalledTimes(2);
  });

  it('unlinks only after the confirmation, then reloads the list', async () => {
    api.getUserRealms
      .mockResolvedValueOnce({
        ok: true,
        data: {
          home: null,
          guests: [
            { _id: 't2', name: 'Globex', slug: 'globex', createdAt: 'now' },
          ],
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        data: { home: null, guests: [] },
      });
    api.removeRealmGuest.mockResolvedValue({ ok: true, data: 'OK' });
    renderSheet();
    fireEvent.click(
      await screen.findByRole('button', { name: 'Unlink globex' })
    );

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent(
      'ann@acme.test will no longer be able to sign in at globex. Sessions at globex end.'
    );
    expect(api.removeRealmGuest).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Unlink' }));
    await waitFor(() =>
      expect(api.removeRealmGuest).toHaveBeenCalledWith('t2', 'u1')
    );
    expect(
      await screen.findByText('Not linked to any other realm.')
    ).toBeInTheDocument();
    expect(api.getUserRealms).toHaveBeenCalledTimes(2);
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Realm unlinked' })
    );
  });

  it('does not unlink when the confirmation is cancelled', async () => {
    api.getUserRealms.mockResolvedValue({
      ok: true,
      data: {
        home: null,
        guests: [
          { _id: 't2', name: 'Globex', slug: 'globex', createdAt: 'now' },
        ],
      },
    });
    renderSheet();
    fireEvent.click(
      await screen.findByRole('button', { name: 'Unlink globex' })
    );
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(api.removeRealmGuest).not.toHaveBeenCalled();
  });

  it('toasts the server message when the unlink fails', async () => {
    api.getUserRealms.mockResolvedValue({
      ok: true,
      data: {
        home: null,
        guests: [
          { _id: 't2', name: 'Globex', slug: 'globex', createdAt: 'now' },
        ],
      },
    });
    api.removeRealmGuest.mockResolvedValue({
      ok: false,
      code: 'HOME_USER_REMOVAL',
      message: 'Home users cannot be removed from their home realm',
    });
    renderSheet();
    fireEvent.click(
      await screen.findByRole('button', { name: 'Unlink globex' })
    );
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Unlink' }));
    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to unlink realm',
          description: 'Home users cannot be removed from their home realm',
        })
      )
    );
  });

  it('only enables the move once a different realm is chosen', () => {
    renderSheet();
    expect(
      screen.getByRole('button', { name: 'Move home realm' })
    ).toBeDisabled();
    chooseOption(screen.getByRole('combobox'), 'acme');
    expect(
      screen.getByRole('button', { name: 'Move home realm' })
    ).toBeEnabled();
  });

  it('confirms with a session revocation warning, then moves without force', async () => {
    api.setUserHomeRealm.mockResolvedValue({
      ok: true,
      data: user({ homeRealm: 't1' }),
    });
    renderSheet();
    chooseOption(screen.getByRole('combobox'), 'acme');
    fireEvent.click(screen.getByRole('button', { name: 'Move home realm' }));

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent('ann@acme.test will sign in at acme');
    expect(dialog).toHaveTextContent('Their global sessions end immediately.');
    expect(api.setUserHomeRealm).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Move' }));
    await waitFor(() =>
      expect(api.setUserHomeRealm).toHaveBeenCalledWith('u1', 't1', false)
    );
    await waitFor(() => expect(nav.refresh).toHaveBeenCalled());
  });

  it('revokes all sessions when forced', async () => {
    api.setUserHomeRealm.mockResolvedValue({
      ok: true,
      data: user({ homeRealm: null }),
    });
    renderSheet(user({ homeRealm: 't1' }));
    chooseOption(screen.getByRole('combobox'), 'Global');
    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'Also sign the user out everywhere',
      })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Move home realm' }));

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent(
      'They are kept as a guest of acme if that realm accepts global users'
    );
    expect(dialog).toHaveTextContent('All sessions are revoked.');
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Move and sign out' })
    );
    await waitFor(() =>
      expect(api.setUserHomeRealm).toHaveBeenCalledWith('u1', null, true)
    );
  });

  it('does nothing when the confirmation is cancelled', async () => {
    renderSheet();
    chooseOption(screen.getByRole('combobox'), 'acme');
    fireEvent.click(screen.getByRole('button', { name: 'Move home realm' }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(api.setUserHomeRealm).not.toHaveBeenCalled();
  });

  it('toasts when the move fails', async () => {
    api.setUserHomeRealm.mockResolvedValue({
      ok: false,
      code: 'REALM_NOT_FOUND',
      message: 'Realm not found',
    });
    renderSheet();
    chooseOption(screen.getByRole('combobox'), 'acme');
    fireEvent.click(screen.getByRole('button', { name: 'Move home realm' }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Move' }));
    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to move home realm',
          description: 'Realm not found',
        })
      )
    );
  });
});

describe('EditUserSheet loading the user', () => {
  const renderLookup = () =>
    render(
      <AlertProvider>
        <EditUserSheet
          userId="u1"
          open
          onOpenChange={vi.fn()}
          realmSlugs={slugs}
        />
      </AlertProvider>
    );

  it('keeps Move disabled with a loading state until the user is loaded', async () => {
    let resolve!: (value: { users: User[]; count: number }) => void;
    api.getUsers.mockReturnValue(
      new Promise(r => {
        resolve = r;
      })
    );
    renderLookup();
    expect(screen.getByText('Loading user…')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Move home realm' })
    ).toBeDisabled();
    expect(screen.getByRole('combobox')).toBeDisabled();

    resolve({ users: [user({ homeRealm: 't1' })], count: 1 });
    await waitFor(() =>
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    );
    expect(screen.getByRole('combobox')).toBeEnabled();
    chooseOption(screen.getByRole('combobox'), 'globex');
    expect(
      screen.getByRole('button', { name: 'Move home realm' })
    ).toBeEnabled();
  });

  it('shows an error and keeps Move disabled when the lookup fails', async () => {
    api.getUsers.mockRejectedValue(new Error('boom'));
    renderLookup();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load this user'
    );
    expect(
      screen.getByRole('button', { name: 'Move home realm' })
    ).toBeDisabled();
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('treats a user missing from the lookup as an error', async () => {
    api.getUsers.mockResolvedValue({ users: [], count: 0 });
    renderLookup();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Move home realm' })
    ).toBeDisabled();
  });

  it('keeps the verification switch off until the user is loaded', async () => {
    let resolve!: (value: { users: User[]; count: number }) => void;
    api.getUsers.mockReturnValue(
      new Promise(r => {
        resolve = r;
      })
    );
    renderLookup();
    expect(screen.getByRole('switch', { name: 'Verified' })).toBeDisabled();
    resolve({ users: [user({ isVerified: false })], count: 1 });
    await waitFor(() =>
      expect(screen.getByRole('switch', { name: 'Verified' })).toBeEnabled()
    );
    expect(screen.getByRole('switch', { name: 'Verified' })).not.toBeChecked();
  });
});

describe('verification', () => {
  const renderRow = (row: User) => {
    api.getUsers.mockResolvedValue({ users: [row], count: 1 });
    return render(
      <AlertProvider>
        <UserActionsProvider>
          <UsersTable data={[row]} count={1} />
        </UserActionsProvider>
      </AlertProvider>
    );
  };

  it('verifies from the row after confirmation and updates the action', async () => {
    api.updateUser.mockResolvedValue({ ok: true, data: {} });
    const row = user({
      isVerified: false,
      hasTwoFA: true,
      phoneNumber: '+15551212',
    });
    renderRow(row);
    fireEvent.click(
      screen.getByRole('button', { name: 'Verify ann@acme.test' })
    );
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent(
      'Are you sure you want to verify ann@acme.test?'
    );
    expect(api.updateUser).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Verify' }));
    await waitFor(() =>
      expect(api.updateUser).toHaveBeenCalledWith('u1', {
        email: 'ann@acme.test',
        isVerified: true,
        hasTwoFA: true,
        phoneNumber: '+15551212',
      })
    );
    expect(
      await screen.findByRole('button', { name: 'Unverify ann@acme.test' })
    ).toBeInTheDocument();
    expect(nav.refresh).toHaveBeenCalled();
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'User verified' })
    );
  });

  it('does not verify when the confirmation is cancelled', async () => {
    renderRow(user({ isVerified: false }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Verify ann@acme.test' })
    );
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(api.updateUser).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: 'Verify ann@acme.test' })
    ).toBeInTheDocument();
  });

  it('unverifies a verified user', async () => {
    api.updateUser.mockResolvedValue({ ok: true, data: {} });
    renderRow(user({ isVerified: true, hasTwoFA: false }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Unverify ann@acme.test' })
    );
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Unverify' }));
    await waitFor(() =>
      expect(api.updateUser).toHaveBeenCalledWith('u1', {
        email: 'ann@acme.test',
        isVerified: false,
        hasTwoFA: false,
      })
    );
    expect(
      await screen.findByRole('button', { name: 'Verify ann@acme.test' })
    ).toBeInTheDocument();
  });

  it('leaves the row unverified when the request fails', async () => {
    api.updateUser.mockRejectedValue(new Error('nope'));
    renderRow(user({ isVerified: false }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Verify ann@acme.test' })
    );
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Verify' }));
    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed',
          description: 'User could not be verified.',
        })
      )
    );
    expect(
      screen.getByRole('button', { name: 'Verify ann@acme.test' })
    ).toBeInTheDocument();
    expect(nav.refresh).not.toHaveBeenCalled();
  });

  it('toggles verification from the edit sheet', async () => {
    api.updateUser.mockResolvedValue({ ok: true, data: {} });
    render(
      <AlertProvider>
        <EditUserSheet
          userId="u1"
          user={user({ isVerified: false, hasTwoFA: false })}
          open
          onOpenChange={vi.fn()}
          realmSlugs={slugs}
        />
      </AlertProvider>
    );
    const toggle = screen.getByRole('switch', { name: 'Verified' });
    expect(toggle).not.toBeChecked();
    fireEvent.click(toggle);
    const dialog = await screen.findByRole('alertdialog');
    expect(api.updateUser).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Verify' }));
    await waitFor(() => expect(toggle).toBeChecked());
    expect(api.updateUser).toHaveBeenCalledWith('u1', {
      email: 'ann@acme.test',
      isVerified: true,
      hasTwoFA: false,
    });
    expect(nav.refresh).toHaveBeenCalled();
  });

  it('sends only isVerified to a backend that patches what it is sent', async () => {
    render(
      <AlertProvider>
        <EditUserSheet
          userId="u1"
          user={user({ isVerified: false, hasTwoFA: true })}
          open
          onOpenChange={vi.fn()}
          realmSlugs={slugs}
          capabilities={USER_ADMIN_CAPABILITIES_V1}
        />
      </AlertProvider>
    );
    fireEvent.click(screen.getByRole('switch', { name: 'Verified' }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Verify' }));
    await waitFor(() =>
      expect(api.updateUser).toHaveBeenCalledWith('u1', { isVerified: true })
    );
  });

  it('keeps the edit sheet switch unchanged when verification is cancelled', async () => {
    render(
      <AlertProvider>
        <EditUserSheet
          userId="u1"
          user={user({ isVerified: true })}
          open
          onOpenChange={vi.fn()}
          realmSlugs={slugs}
        />
      </AlertProvider>
    );
    const toggle = screen.getByRole('switch', { name: 'Verified' });
    expect(toggle).toBeChecked();
    fireEvent.click(toggle);
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(api.updateUser).not.toHaveBeenCalled();
    await waitFor(() => expect(toggle).toBeEnabled());
    expect(toggle).toBeChecked();
  });
});

describe('UserActionsProvider', () => {
  function EditTrigger() {
    const { openUserEdit } = useUserActions();
    return (
      <button type="button" onClick={() => openUserEdit('u1')}>
        edit
      </button>
    );
  }

  it('opens the Edit user sheet for the edit action when realms are disabled', async () => {
    render(
      <AlertProvider>
        <UserActionsProvider>
          <EditTrigger />
        </UserActionsProvider>
      </AlertProvider>
    );
    expect(
      screen.queryByRole('heading', { name: 'Edit user' })
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'edit' }));
    expect(
      await screen.findByRole('heading', { name: 'Edit user' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: 'Verified' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Add User' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'Realms' })
    ).not.toBeInTheDocument();
  });

  it('opens the Edit user sheet when realms are enabled', async () => {
    render(
      <AlertProvider>
        <UserActionsProvider realmsEnabled realmSlugs={slugs}>
          <EditTrigger />
        </UserActionsProvider>
      </AlertProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'edit' }));
    expect(
      await screen.findByRole('heading', { name: 'Edit user' })
    ).toBeInTheDocument();
  });
});

describe('Isolated identity mode affordances', () => {
  it('shows the isolated note above the table', () => {
    render(
      <UsersTable data={[]} count={0} realmsEnabled identityMode="isolated" />
    );
    expect(
      screen.getByText(
        'Isolated identity mode: the same email can appear once per realm'
      )
    ).toBeInTheDocument();
  });

  it('shows no isolated note in shared mode', () => {
    render(<UsersTable data={[]} count={0} realmsEnabled />);
    expect(
      screen.queryByText(/Isolated identity mode/)
    ).not.toBeInTheDocument();
  });

  it('explains the same-email rule in the add user sheet only when isolated', () => {
    const { unmount } = render(
      <AddUserSheet
        defaultOpen
        realmsEnabled
        realmSlugs={slugs}
        identityMode="isolated"
      />
    );
    expect(
      screen.getByText(
        'In isolated mode the same email can exist once per realm'
      )
    ).toBeInTheDocument();
    unmount();
    render(<AddUserSheet defaultOpen realmsEnabled realmSlugs={slugs} />);
    expect(
      screen.queryByText(/In isolated mode the same email/)
    ).not.toBeInTheDocument();
  });
});

describe('Users page realm filter note', () => {
  it('notes that the filters list only the first 100 realms', () => {
    render(
      <UsersTable
        data={[]}
        count={0}
        realmsEnabled
        realmSlugs={slugs}
        realmsTruncated
      />
    );
    expect(
      screen.getByText('Showing the first 100 realms in filters')
    ).toBeInTheDocument();
  });

  it('shows no note otherwise', () => {
    render(<UsersTable data={[]} count={0} realmsEnabled realmSlugs={slugs} />);
    expect(screen.queryByText(/Showing the first/)).not.toBeInTheDocument();
  });
});

describe('user list controls', () => {
  const registered = '2026-01-15T12:00:00.000Z';

  it('renders Status and Registered', () => {
    render(
      <UsersTable
        data={[
          user({
            active: false,
            createdAt: registered,
            updatedAt: registered,
          }),
        ]}
        count={1}
      />
    );
    expect(
      screen.getByRole('columnheader', { name: 'Status' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Registered' })
    ).toBeInTheDocument();
    expect(screen.getByText('Blocked')).toBeInTheDocument();
    expect(screen.getByTitle(registered)).toHaveTextContent(/\d/);
  });

  it('steps back to the last page when the current one was emptied', () => {
    nav.search = 'skip=20&isActive=true';
    render(<UsersTable data={[]} count={20} />);
    expect(nav.replace).toHaveBeenCalledWith(
      '/authentication/users?skip=10&isActive=true'
    );
  });

  it('stays put on an empty result that is not past the end', () => {
    nav.search = 'isActive=true';
    render(<UsersTable data={[]} count={0} />);
    expect(nav.replace).not.toHaveBeenCalled();
  });

  it('cycles the Registered header to a descending sort', () => {
    const { rerender } = render(<UsersTable data={[]} count={0} />);
    fireEvent.click(screen.getByRole('button', { name: 'Registered' }));
    let url = nav.replace.mock.calls.at(-1)?.[0] as string;
    expect(new URLSearchParams(url.split('?')[1]).get('sort')).toBe(
      'createdAt'
    );
    nav.search = 'sort=createdAt';
    rerender(<UsersTable data={[]} count={0} />);
    fireEvent.click(screen.getByRole('button', { name: 'Registered' }));
    url = nav.replace.mock.calls.at(-1)?.[0] as string;
    expect(new URLSearchParams(url.split('?')[1]).get('sort')).toBe(
      '-createdAt'
    );
  });

  it('writes status to the URL and hides Verified without that capability', () => {
    render(<UsersTable data={[]} count={0} />);
    expect(
      screen.queryByRole('combobox', { name: 'Verified' })
    ).not.toBeInTheDocument();
    chooseOption(screen.getByRole('combobox', { name: 'Status' }), 'Blocked');
    const url = nav.replace.mock.calls.at(-1)?.[0] as string;
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('isActive')).toBe('false');
    expect(params.has('isVerified')).toBe(false);
  });

  it('writes the verified filter when the backend allows it', () => {
    render(
      <UsersTable
        data={[]}
        count={0}
        capabilities={USER_ADMIN_CAPABILITIES_V1}
      />
    );
    chooseOption(
      screen.getByRole('combobox', { name: 'Verified' }),
      'Unverified'
    );
    const url = nav.replace.mock.calls.at(-1)?.[0] as string;
    expect(new URLSearchParams(url.split('?')[1]).get('isVerified')).toBe(
      'false'
    );
  });

  it('asks for the delete phrase and keeps only the failed rows selected', async () => {
    const rows = Array.from({ length: 7 }, (_, index) =>
      user({
        _id: `id-${index}`,
        email: `user${index}@x.test`,
        active: true,
      })
    );
    api.deleteUserResult.mockImplementation(async (id: string) =>
      id === 'id-0' || id === 'id-1'
        ? { ok: false, code: 'INTERNAL', message: 'no' }
        : { ok: true, data: 'OK' }
    );
    render(
      <AlertProvider>
        <UsersTable data={rows} count={7} />
      </AlertProvider>
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all users' }));
    const bulk = screen.getByRole('region', { name: 'Bulk actions' });
    fireEvent.click(within(bulk).getByRole('button', { name: 'Delete' }));
    const dialog = await screen.findByRole('alertdialog');
    const confirm = within(dialog).getByRole('button', {
      name: 'Delete 7 users',
    });
    expect(confirm).toBeDisabled();
    fireEvent.change(
      within(dialog).getByLabelText('Type delete 7 users to confirm'),
      {
        target: { value: 'delete 7 users' },
      }
    );
    expect(confirm).toBeEnabled();
    fireEvent.click(confirm);
    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '5 of 7 users deleted. 2 failed',
        })
      )
    );
    expect(
      screen.getByRole('checkbox', { name: 'Select user0@x.test' })
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: 'Select user1@x.test' })
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: 'Select user2@x.test' })
    ).not.toBeChecked();
  });

  it('skips users who are already blocked', async () => {
    const rows = [
      user({ _id: 'open', email: 'open@x.test', active: true }),
      user({ _id: 'shut', email: 'shut@x.test', active: false }),
    ];
    render(
      <AlertProvider>
        <UsersTable data={rows} count={2} />
      </AlertProvider>
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all users' }));
    const bulk = screen.getByRole('region', { name: 'Bulk actions' });
    fireEvent.click(within(bulk).getByRole('button', { name: 'Block' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent('already blocked will be skipped');
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Block 1 user' })
    );
    await waitFor(() =>
      expect(api.blockUserResult).toHaveBeenCalledWith('open', true)
    );
    expect(api.blockUserResult).toHaveBeenCalledTimes(1);
  });
});

describe('account editing', () => {
  const renderAccount = (
    row: User,
    options?: {
      capabilities?: typeof USER_ADMIN_CAPABILITIES_V1;
      teams?: boolean;
    }
  ) =>
    render(
      <AlertProvider>
        <EditUserSheet
          userId={row._id}
          user={row}
          open
          onOpenChange={vi.fn()}
          realmSlugs={slugs}
          capabilities={options?.capabilities}
          teamsEnabled={options?.teams}
        />
      </AlertProvider>
    );

  it('validates an email change and sends only authentication fields', async () => {
    const row = user({ hasTwoFA: false, phoneNumber: '+15551212' });
    (row as User & { customField: string }).customField = 'x';
    renderAccount(row);
    expect(screen.queryByDisplayValue('x')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Change' }));
    fireEvent.change(screen.getByLabelText('New email'), {
      target: { value: 'not-an-email' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save email' }));
    expect(
      await screen.findByText('Enter a valid email address')
    ).toBeInTheDocument();
    expect(api.updateUser).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('New email'), {
      target: { value: 'other@acme.test' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save email' }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Change email' })
    );
    await waitFor(() =>
      expect(api.updateUser).toHaveBeenCalledWith('u1', {
        email: 'other@acme.test',
        isVerified: true,
        hasTwoFA: false,
        phoneNumber: '+15551212',
      })
    );
  });

  it('maps a duplicate email onto the field', async () => {
    api.updateUser.mockResolvedValue({
      ok: false,
      code: 'INVALID_ARGUMENT',
      message: 'User already exists',
    });
    renderAccount(user({ hasTwoFA: false }));
    fireEvent.click(screen.getByRole('button', { name: 'Change' }));
    fireEvent.change(screen.getByLabelText('New email'), {
      target: { value: 'taken@acme.test' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save email' }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Change email' })
    );
    expect(
      await screen.findByText(
        'Another account in this scope already uses this email'
      )
    ).toBeInTheDocument();
  });

  it('rejects a phone number that is not E.164', async () => {
    renderAccount(user({ phoneNumber: '' }));
    fireEvent.change(screen.getByLabelText('Phone'), {
      target: { value: '6912345678' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(
      await screen.findByText('Use international format, e.g. +306912345678')
    ).toBeInTheDocument();
    expect(api.updateUser).not.toHaveBeenCalled();
  });

  it('disables phone removal while SMS two-factor is on', () => {
    renderAccount(
      user({
        hasTwoFA: true,
        twoFaMethod: 'sms',
        phoneNumber: '+306912345678',
      }),
      { capabilities: USER_ADMIN_CAPABILITIES_V1 }
    );
    const account = screen.getByRole('region', { name: 'Account' });
    expect(
      within(account).getByRole('button', { name: 'Remove' })
    ).toBeDisabled();
  });

  it('disables phone removal for two-factor without a stored method', () => {
    renderAccount(user({ hasTwoFA: true, phoneNumber: '+306912345678' }), {
      capabilities: USER_ADMIN_CAPABILITIES_V1,
    });
    const account = screen.getByRole('region', { name: 'Account' });
    expect(
      within(account).getByRole('button', { name: 'Remove' })
    ).toBeDisabled();
  });

  it('keeps phone removal available with authenticator two-factor', () => {
    renderAccount(
      user({
        hasTwoFA: true,
        twoFaMethod: 'authenticator',
        phoneNumber: '+306912345678',
      }),
      { capabilities: USER_ADMIN_CAPABILITIES_V1 }
    );
    const account = screen.getByRole('region', { name: 'Account' });
    expect(
      within(account).getByRole('button', { name: 'Remove' })
    ).toBeEnabled();
  });

  it('saves a phone number without resending other fields on a v1 backend', async () => {
    renderAccount(user({ hasTwoFA: true }), {
      capabilities: USER_ADMIN_CAPABILITIES_V1,
    });
    fireEvent.change(screen.getByLabelText('Phone'), {
      target: { value: '+30 691 234 5678' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(api.updateUser).toHaveBeenCalledWith('u1', {
        phoneNumber: '+306912345678',
      })
    );
  });

  it('disables the reset email for a user without an email address', () => {
    renderAccount(user({ email: '' }), {
      capabilities: USER_ADMIN_CAPABILITIES_V1,
    });
    expect(
      screen.getByRole('button', { name: 'Send reset email' })
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Set password' })).toBeEnabled();
  });

  it('hides the reset email when the backend does not list it', () => {
    renderAccount(user({}), {
      capabilities: {
        ...USER_ADMIN_CAPABILITIES_V1,
        actions: USER_ADMIN_CAPABILITIES_V1.actions.filter(
          action => action !== 'sendPasswordReset'
        ),
      },
    });
    expect(
      screen.getByRole('button', { name: 'Set password' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Send reset email' })
    ).not.toBeInTheDocument();
  });

  it('loads every page of the user teams', async () => {
    const firstPage = Array.from({ length: 50 }, (_, index) => ({
      _id: `team-${index}`,
      name: `Team ${index}`,
      roles: ['member'],
    }));
    api.getUserTeams.mockImplementation(
      async (_id: string, params?: { skip?: number }) => ({
        ok: true,
        data:
          (params?.skip ?? 0) === 0
            ? { teams: firstPage, count: 51 }
            : {
                teams: [
                  { _id: 'team-50', name: 'Last team', roles: ['owner'] },
                ],
                count: 51,
              },
      })
    );
    renderAccount(user({}), {
      capabilities: USER_ADMIN_CAPABILITIES_V1,
      teams: true,
    });
    const teams = await screen.findByRole('region', { name: 'Teams' });
    expect(await within(teams).findByText('Last team')).toBeInTheDocument();
    expect(within(teams).getByText('Team 0')).toBeInTheDocument();
    expect(api.getUserTeams).toHaveBeenCalledTimes(2);
    expect(api.getUserTeams).toHaveBeenNthCalledWith(1, 'u1', {
      skip: 0,
      limit: 50,
    });
    expect(api.getUserTeams).toHaveBeenNthCalledWith(2, 'u1', {
      skip: 50,
      limit: 50,
    });
  });

  it('shows the teams error when a later page fails', async () => {
    api.getUserTeams
      .mockResolvedValueOnce({
        ok: true,
        data: {
          teams: [{ _id: 'team-1', name: 'Acme', roles: ['member'] }],
          count: 2,
        },
      })
      .mockResolvedValueOnce({
        ok: false,
        code: 'INTERNAL',
        message: 'Teams are unavailable',
      });
    renderAccount(user({}), {
      capabilities: USER_ADMIN_CAPABILITIES_V1,
      teams: true,
    });
    const teams = await screen.findByRole('region', { name: 'Teams' });
    expect(
      await within(teams).findByText('Teams are unavailable')
    ).toBeInTheDocument();
  });

  it('disables 2FA with a patch when reset is unavailable', async () => {
    renderAccount(user({ hasTwoFA: true, twoFaMethod: 'authenticator' }));
    fireEvent.click(screen.getByRole('button', { name: 'Disable 2FA' }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Disable 2FA' })
    );
    await waitFor(() =>
      expect(api.updateUser).toHaveBeenCalledWith('u1', {
        email: 'ann@acme.test',
        hasTwoFA: false,
      })
    );
    expect(api.resetUserTwoFa).not.toHaveBeenCalled();
  });

  it('disables 2FA through the reset route when that capability exists', async () => {
    renderAccount(user({ hasTwoFA: true, twoFaMethod: 'sms' }), {
      capabilities: USER_ADMIN_CAPABILITIES_V1,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Disable 2FA' }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Disable 2FA' })
    );
    await waitFor(() => expect(api.resetUserTwoFa).toHaveBeenCalledWith('u1'));
    expect(api.updateUser).not.toHaveBeenCalled();
  });

  it('hides the password section on a legacy backend', () => {
    renderAccount(user({}));
    expect(
      screen.queryByRole('region', { name: 'Password' })
    ).not.toBeInTheDocument();
  });

  it('checks the new password before saving it', async () => {
    renderAccount(user({}), { capabilities: USER_ADMIN_CAPABILITIES_V1 });
    fireEvent.click(screen.getByRole('button', { name: 'Set password' }));
    const dialog = await screen.findByRole('dialog', { name: 'Set password' });
    fireEvent.change(within(dialog).getByLabelText('New password'), {
      target: { value: 'short' },
    });
    fireEvent.change(within(dialog).getByLabelText('Confirm password'), {
      target: { value: 'short' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Set password' })
    );
    expect(
      await within(dialog).findByText(/at least 8 characters/)
    ).toBeInTheDocument();
    expect(api.setUserPassword).not.toHaveBeenCalled();

    fireEvent.change(within(dialog).getByLabelText('New password'), {
      target: { value: 'longenough' },
    });
    fireEvent.change(within(dialog).getByLabelText('Confirm password'), {
      target: { value: 'different1' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Set password' })
    );
    expect(
      await within(dialog).findByText('Passwords do not match')
    ).toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText('Confirm password'), {
      target: { value: 'longenough' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Set password' })
    );
    await waitFor(() =>
      expect(api.setUserPassword).toHaveBeenCalledWith('u1', 'longenough', true)
    );
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Password updated' })
    );
  });

  it('lists teams, changes a role, and surfaces a home-user removal error', async () => {
    api.getUserTeams.mockResolvedValue({
      ok: true,
      data: {
        teams: [
          {
            _id: 'team-1',
            name: 'Acme',
            roles: ['member'],
            membershipType: 'home',
          },
        ],
        count: 1,
      },
    });
    api.removeTeamMembers.mockResolvedValue({
      ok: false,
      code: 'HOME_USER_REMOVAL',
      message: 'Home users cannot be removed from their home team',
    });
    renderAccount(user({}), {
      capabilities: USER_ADMIN_CAPABILITIES_V1,
      teams: true,
    });
    const teams = await screen.findByRole('region', { name: 'Teams' });
    expect(await within(teams).findByText('Acme')).toBeInTheDocument();
    expect(within(teams).getByText('Home')).toBeInTheDocument();
    chooseOption(
      within(teams).getByRole('combobox', { name: 'Role in Acme' }),
      'owner'
    );
    await waitFor(() =>
      expect(api.patchTeamMembersRoles).toHaveBeenCalledWith(
        'team-1',
        ['u1'],
        'owner'
      )
    );
    fireEvent.click(within(teams).getByRole('button', { name: 'Remove' }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Remove' }));
    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Home users cannot be removed from their home team',
        })
      )
    );
  });
});
