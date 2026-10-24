import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppSidebar } from './appSidebar';
import { navList } from './navList.config';

const pathname = vi.hoisted(() => ({ current: '/' }));
const isMobile = vi.hoisted(() => ({ current: false }));

vi.mock('next/navigation', () => ({
  usePathname: () => pathname.current,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('@/lib/hooks/use-mobile', () => ({
  useIsMobile: () => isMobile.current,
}));

vi.mock('@/contexts/ModuleAvailabilityContext', () => ({
  useModuleAvailability: () => ({
    modules: [],
    isLoading: false,
    isModuleAvailable: () => true,
    isModuleServing: () => true,
    getModuleHealth: () => undefined,
  }),
}));

vi.mock('./navUser', () => ({
  NavUser: () => <div data-testid="nav-user" />,
}));

afterEach(() => {
  cleanup();
  pathname.current = '/';
  isMobile.current = false;
});

describe('navList secondary tools', () => {
  it('keeps Logs Viewer in the command palette secondary list above Settings', () => {
    expect(navList.navSecondary.map(item => item.url)).toEqual([
      '/logs-viewer',
      '/settings/general',
    ]);
  });
});

describe('AppSidebar', () => {
  it('renders Logs Viewer in the rail immediately above Settings', () => {
    render(<AppSidebar />);

    const logsLink = document.querySelector('a[href="/logs-viewer"]');
    const settingsLink = document.querySelector('a[href="/settings/general"]');

    expect(logsLink).toBeInTheDocument();
    expect(settingsLink).toBeInTheDocument();
    expect(logsLink).toHaveAttribute('data-active', 'false');

    const footerLinks = Array.from(
      document.querySelectorAll(
        'nav a[href="/logs-viewer"], nav a[href="/settings/general"]'
      )
    );
    expect(footerLinks.map(link => link.getAttribute('href'))).toEqual([
      '/logs-viewer',
      '/settings/general',
    ]);
  });

  it('marks Logs Viewer active on /logs-viewer', () => {
    pathname.current = '/logs-viewer';
    render(<AppSidebar />);

    expect(document.querySelector('a[href="/logs-viewer"]')).toHaveAttribute(
      'data-active',
      'true'
    );
  });

  it('shows a tooltip for Logs Viewer', async () => {
    render(<AppSidebar />);

    const logsLink = document.querySelector('a[href="/logs-viewer"]');
    expect(logsLink).toBeTruthy();
    fireEvent.pointerMove(logsLink!);
    fireEvent.pointerEnter(logsLink!);
    fireEvent.focus(logsLink!);

    expect(
      await screen.findByRole('tooltip', { name: 'Logs Viewer' })
    ).toBeInTheDocument();
  });

  it('opens the mobile sheet with Logs Viewer on Ctrl+B', async () => {
    isMobile.current = true;
    render(<AppSidebar />);

    expect(document.querySelector('a[href="/logs-viewer"]')).toBeNull();

    fireEvent.keyDown(window, { key: 'b', ctrlKey: true });

    await waitFor(() => {
      expect(
        document.querySelector('a[href="/logs-viewer"]')
      ).toBeInTheDocument();
    });
  });
});
