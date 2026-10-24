import '@testing-library/jest-dom/vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Team } from '@/lib/models/Team';

const toastMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/hooks/use-toast', () => ({
  toast: (...args: unknown[]) => {
    toastMock(...args);
    return { id: 't', dismiss: vi.fn() };
  },
}));

const api = vi.hoisted(() => ({ updateTeam: vi.fn() }));
vi.mock('@/lib/api/authentication', () => api);

import { AlertProvider } from '@/components/providers/AlertProvider';
import {
  EditTeamSheet,
  REALM_DEFAULT_TEAM_TOOLTIP,
} from '@/components/authentication/teams/manageTeam/EditTeamSheet/EditTeamSheet';

const team: Team = {
  _id: 't1',
  name: 'Acme',
  parentTeam: '',
  isDefault: false,
  createdAt: '',
  updatedAt: '',
};
const realmTeam: Team = { ...team, realm: { enabled: true, slug: 'acme' } };

const renderSheet = (t: Team, onSuccess = vi.fn()) =>
  render(
    <AlertProvider>
      <EditTeamSheet team={t} defaultOpen onSuccess={onSuccess}>
        <button>Edit</button>
      </EditTeamSheet>
    </AlertProvider>
  );

/** Renders the description of the latest toast that has one. */
const renderLastToast = () => {
  const call = toastMock.mock.calls.at(-1)?.[0] as
    | { description: ReactNode }
    | undefined;
  render(<>{call?.description}</>);
};

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('EditTeamSheet Default switch', () => {
  it('lets a regular team toggle Default', () => {
    renderSheet(team);
    expect(screen.getByLabelText('Default Team')).toBeEnabled();
  });

  it('disables Default on a realm team and explains why', async () => {
    renderSheet(realmTeam);
    expect(screen.getByLabelText('Default Team')).toBeDisabled();
    fireEvent.focus(screen.getByLabelText('Default Team').parentElement!);
    const tips = await screen.findAllByText(REALM_DEFAULT_TEAM_TOOLTIP);
    expect(tips.length).toBeGreaterThan(0);
  });

  it('does not send isDefault for a realm team', async () => {
    api.updateTeam.mockResolvedValue({ ok: true, data: realmTeam });
    renderSheet(realmTeam);
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(api.updateTeam).toHaveBeenCalledTimes(1));
    expect(api.updateTeam).toHaveBeenCalledWith({ _id: 't1', name: 'Acme' });
  });
});

describe('EditTeamSheet saving', () => {
  it('passes the updated team on success', async () => {
    const updated = { ...team, name: 'Acme 2' };
    api.updateTeam.mockResolvedValue({ ok: true, data: updated });
    const onSuccess = vi.fn();
    renderSheet(team, onSuccess);
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(updated));
    expect(api.updateTeam).toHaveBeenCalledWith({
      _id: 't1',
      name: 'Acme',
      isDefault: false,
    });
  });

  it('shows the backend message when the update is refused', async () => {
    api.updateTeam.mockResolvedValue({
      ok: false,
      code: 'INVALID_ARGUMENT',
      message: 'A realm cannot be the default team',
    });
    const onSuccess = vi.fn();
    renderSheet(team, onSuccess);
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(api.updateTeam).toHaveBeenCalled());
    await waitFor(() => {
      const last = toastMock.mock.calls.at(-1)?.[0] as
        | { description: ReactNode }
        | undefined;
      expect(last?.description).toBeTruthy();
    });
    renderLastToast();
    expect(
      await screen.findByText('A realm cannot be the default team')
    ).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
