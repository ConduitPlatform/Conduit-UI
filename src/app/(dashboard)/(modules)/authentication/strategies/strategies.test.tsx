import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  getAuthenticationSettings: vi.fn(),
  getRealms: vi.fn(),
}));
vi.mock('@/lib/api/authentication', () => api);
vi.mock('@/components/authentication/strategies/StrategySettings', () => ({
  StrategySettings: () => null,
}));
vi.mock('@/components/authentication/strategies/StrategyList', () => ({
  StrategyList: () => null,
}));

import Strategies from '@/app/(dashboard)/(modules)/authentication/strategies/page';

const config = (realmsEnabled: boolean) => ({
  config: {
    local: { enabled: true },
    google: { enabled: true },
    github: { enabled: true },
    teams: { enabled: true, realms: { enabled: realmsEnabled } },
  },
});

const realmWith = (oauth: Record<string, { enabled: boolean }>) => ({
  settings: {
    strategies: {
      local: { enabled: true },
      username: { enabled: false },
      magicLink: { enabled: false },
      phone: { enabled: false },
      metamask: { enabled: false },
      biometric: { enabled: false },
      oauth,
    },
  },
});

const card = (name: string) =>
  screen
    .getByText(name, { selector: 'p' })
    .closest('.col-span-2') as HTMLElement;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('Strategies page realm footnote', () => {
  it('shows how many realms also enable a strategy', async () => {
    api.getAuthenticationSettings.mockResolvedValue(config(true));
    api.getRealms.mockResolvedValue({
      realms: [
        realmWith({ google: { enabled: true } }),
        realmWith({ google: { enabled: true }, github: { enabled: true } }),
      ],
      count: 2,
    });
    render(await Strategies());
    expect(api.getRealms).toHaveBeenCalledWith(0, 100);
    expect(
      within(card('Google')).getByText('Also enabled by 2 realms')
    ).toBeVisible();
    expect(
      within(card('Github')).getByText('Also enabled by 1 realm')
    ).toBeVisible();
    expect(
      within(card('Local')).getByText('Also enabled by 2 realms')
    ).toBeVisible();
  });

  it('shows no footnote for a strategy no realm enables', async () => {
    api.getAuthenticationSettings.mockResolvedValue(config(true));
    api.getRealms.mockResolvedValue({
      realms: [realmWith({ google: { enabled: true } })],
      count: 1,
    });
    render(await Strategies());
    expect(within(card('Github')).queryByText(/Also enabled/)).toBeNull();
  });

  it('makes no extra request and shows no footnote with the flag off', async () => {
    api.getAuthenticationSettings.mockResolvedValue(config(false));
    render(await Strategies());
    expect(api.getRealms).not.toHaveBeenCalled();
    expect(screen.queryByText(/Also enabled/)).toBeNull();
  });

  it('still renders when the realms request fails', async () => {
    api.getAuthenticationSettings.mockResolvedValue(config(true));
    api.getRealms.mockRejectedValue(new Error('boom'));
    render(await Strategies());
    expect(screen.getByText('Google', { selector: 'p' })).toBeInTheDocument();
    expect(screen.queryByText(/Also enabled/)).toBeNull();
  });
});
