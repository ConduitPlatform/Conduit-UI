import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Team } from '@/lib/models/Team';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('@/lib/api/authentication', () => ({
  deleteTeam: vi.fn(),
  updateTeam: vi.fn(),
}));

import { AlertProvider } from '@/components/providers/AlertProvider';
import TeamProfile from '@/components/authentication/teams/manageTeam/teamProfile';

const team: Team = {
  _id: 't1',
  name: 'Acme',
  parentTeam: '',
  isDefault: false,
  createdAt: '',
  updatedAt: '',
};
const realmTeam: Team = { ...team, realm: { enabled: true, slug: 'acme' } };

const renderProfile = (t: Team, realmsEnabled?: boolean) =>
  render(
    <AlertProvider>
      <TeamProfile
        team={t}
        memberCount={3}
        subTeamCount={0}
        realmsEnabled={realmsEnabled}
      />
    </AlertProvider>
  );

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
});

describe('TeamProfile delete protection', () => {
  it.each([
    ['the realms flag is on', true],
    ['the realms flag is off', false],
    ['the flag is unknown', undefined],
  ])('disables Delete on a realm team when %s', (_label, flag) => {
    renderProfile(realmTeam, flag);
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  it('leaves Delete enabled for a regular team', () => {
    renderProfile(team, true);
    expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled();
  });
});
