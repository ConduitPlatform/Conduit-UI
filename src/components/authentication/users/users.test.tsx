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
  blockUnblockUser: vi.fn(),
}));
vi.mock('@/lib/api/authentication', () => api);

const toastMock = vi.hoisted(() =>
  vi.fn(() => ({ id: 't', dismiss: vi.fn(), update: vi.fn() }))
);
vi.mock('@/lib/hooks/use-toast', () => ({ toast: toastMock }));

import UsersTable from '@/components/authentication/users/users';
import { EditUserSheet } from '@/components/authentication/users/editUserSheet/editUserSheet';
import { AddUserSheet } from '@/components/authentication/users/addUserSheet/addUserSheet';
import { AlertProvider } from '@/components/providers/AlertProvider';
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
    await waitFor(() =>
      expect(api.getUsers).toHaveBeenCalledWith(0, 10, { homeRealm: 't1' })
    );
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
    expect(alert).toHaveTextContent("Could not load this user's realms.");
    fireEvent.click(within(alert).getByRole('button', { name: 'Retry' }));
    expect(
      await screen.findByText('Not linked to any other realm.')
    ).toBeInTheDocument();
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
});

describe('UserActionsProvider', () => {
  function EditTrigger() {
    const { openUserEdit } = useUserActions();
    return (
      <button type="button" onClick={() => openUserEdit('u1', user({}))}>
        edit
      </button>
    );
  }

  it('opens the Add User sheet for the edit action when realms are disabled', async () => {
    render(
      <AlertProvider>
        <UserActionsProvider>
          <EditTrigger />
        </UserActionsProvider>
      </AlertProvider>
    );
    expect(screen.queryByText('Add User')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'edit' }));
    expect(
      await screen.findByRole('heading', { name: 'Add User' })
    ).toBeInTheDocument();
    expect(screen.queryByText('Edit user')).not.toBeInTheDocument();
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
