import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LogsDrawer } from './LogsDrawer';

vi.mock('next/navigation', () => ({
  usePathname: () => '/settings/general',
}));

vi.mock('@/lib/observability/lokiAvailability.actions', () => ({
  getLokiAvailability: vi.fn(async () => ({ state: 'unreachable' })),
}));

vi.mock('@/lib/loki/requests', () => ({
  getLogsLevels: vi.fn(async () => []),
  getLogsQueryRange: vi.fn(async () => []),
  getModules: vi.fn(async () => []),
}));

afterEach(() => {
  cleanup();
});

describe('LogsDrawer', () => {
  it('keeps the closed-tab trigger below overlay z-index', async () => {
    render(
      <main className="relative isolate">
        <LogsDrawer />
      </main>
    );

    const trigger = await waitFor(() =>
      screen.getByRole('button', { name: /logs/i })
    );
    expect(trigger.className).toMatch(/\bz-20\b/);
    expect(trigger.className).not.toMatch(/\bz-40\b/);
  });
});
