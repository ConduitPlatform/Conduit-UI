import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { StrategyInterface } from '@/components/authentication/strategies/interface/Strategy.interface';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
vi.mock('@/lib/hooks/use-toast', () => ({ toast: vi.fn() }));
vi.mock('@/lib/api/authentication', () => ({
  patchAuthenticationSettingsMerged: vi.fn(),
}));

import { StrategyList } from '@/components/authentication/strategies/StrategyList';

const strategy = (key: string, name: string): StrategyInterface =>
  ({
    key,
    name,
    description: `${name} sign-in`,
    supports: { login: true, register: true },
  }) as StrategyInterface;

const strategies = [strategy('gitlab', 'Gitlab'), strategy('slack', 'Slack')];

const openDialog = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Add Strategy' }));

afterEach(cleanup);

describe('StrategyList realm footnote', () => {
  it('shows how many realms enable a strategy that is not enabled globally', () => {
    render(
      <StrategyList
        strategies={strategies}
        realmCounts={{ gitlab: 3, slack: 1 }}
      />
    );
    openDialog();
    expect(screen.getByText('Enabled by 3 realms')).toBeVisible();
    expect(screen.getByText('Enabled by 1 realm')).toBeVisible();
  });

  it('shows nothing for strategies no realm enables, or without counts', () => {
    const { rerender } = render(
      <StrategyList strategies={strategies} realmCounts={{ gitlab: 2 }} />
    );
    openDialog();
    expect(screen.getByText('Enabled by 2 realms')).toBeVisible();
    expect(screen.getAllByText(/Enabled by/)).toHaveLength(1);

    rerender(<StrategyList strategies={strategies} />);
    expect(screen.queryByText(/Enabled by/)).toBeNull();
  });

  it('shows a lower bound when the realms were capped', () => {
    render(
      <StrategyList
        strategies={strategies}
        realmCounts={{ gitlab: 100 }}
        realmCountsCapped
      />
    );
    openDialog();
    expect(screen.getByText('Enabled by 100+ realms')).toBeVisible();
  });
});
