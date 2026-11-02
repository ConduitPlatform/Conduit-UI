import '@testing-library/jest-dom/vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SecurityClient } from '@/lib/models/Router';

const api = vi.hoisted(() => ({
  getSecurityClients: vi.fn(),
  createSecurityClient: vi.fn(),
  updateSecurityClient: vi.fn(),
  deleteSecurityClient: vi.fn(),
}));
vi.mock('@/lib/api/router', () => api);

const toastMock = vi.hoisted(() =>
  vi.fn(() => ({ id: 't', dismiss: vi.fn(), update: vi.fn() }))
);
vi.mock('@/lib/hooks/use-toast', () => ({
  toast: toastMock,
  useToast: () => ({ toast: toastMock }),
}));

import { SecurityClients } from '@/components/router/security';

const createdSecret = 'plaintext-secret-once';

function client(overrides: Partial<SecurityClient> = {}): SecurityClient {
  return {
    _id: 'id-1',
    clientId: 'client-id-1',
    alias: 'CLI app',
    platform: 'CLI',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function polyfillSelect() {
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.releasePointerCapture = () => undefined;
  Element.prototype.scrollIntoView = () => undefined;
}

function chooseOption(trigger: HTMLElement, name: string) {
  fireEvent.keyDown(trigger, { key: 'Enter' });
  fireEvent.keyDown(screen.getByRole('option', { name }), { key: 'Enter' });
}

describe('SecurityClients secret dialog', () => {
  beforeEach(() => {
    polyfillSelect();
    api.getSecurityClients.mockResolvedValue({ clients: [] });
    api.createSecurityClient.mockResolvedValue({
      clientId: 'client-id-1',
      clientSecret: createdSecret,
      platform: 'CLI',
    });
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  async function createClient(platformLabel: string) {
    fireEvent.click(screen.getAllByRole('button', { name: /Add Client/ })[0]);
    expect(
      screen.getByText(
        '*.example.com does not cover example.com. localhost and IP addresses are allowed, including a port and [::1].'
      )
    ).toBeInTheDocument();
    chooseOption(screen.getByRole('combobox'), platformLabel);
    fireEvent.click(screen.getByRole('button', { name: 'Create Client' }));
    await screen.findByText(/you won't see this again/i);
  }

  it('shows a non-web secret once, then drops it when the dialog closes', async () => {
    api.getSecurityClients.mockResolvedValue({
      clients: [{ ...client(), clientSecret: 'stored-secret-must-not-render' }],
    });
    render(<SecurityClients data={{ clients: [] }} />);

    await createClient('Other (CLI)');

    expect(screen.getByText(createdSecret)).toBeInTheDocument();
    expect(
      screen.getByText('This is the HMAC key and it cannot be recovered.')
    ).toBeInTheDocument();
    expect(api.createSecurityClient).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Copy client secret' }));
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(createdSecret);
    });

    fireEvent.click(screen.getByRole('button', { name: "I've copied it" }));

    await waitFor(() => {
      expect(screen.queryByText(createdSecret)).not.toBeInTheDocument();
    });
    expect(
      screen.queryByText('stored-secret-must-not-render')
    ).not.toBeInTheDocument();
    expect(screen.getByText('client-id-1')).toBeInTheDocument();
  });

  it('shows a web secret without calling it an HMAC key', async () => {
    api.createSecurityClient.mockResolvedValue({
      clientId: 'web-1',
      clientSecret: createdSecret,
      platform: 'WEB',
    });
    api.getSecurityClients.mockResolvedValue({
      clients: [client({ platform: 'WEB', clientId: 'web-1', alias: 'Web' })],
    });
    render(<SecurityClients data={{ clients: [] }} />);

    await createClient('Web');

    expect(screen.getByText(createdSecret)).toBeInTheDocument();
    expect(
      screen.queryByText('This is the HMAC key and it cannot be recovered.')
    ).not.toBeInTheDocument();
  });
});
