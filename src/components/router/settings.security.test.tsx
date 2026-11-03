import '@testing-library/jest-dom/vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RouterSettings } from '@/lib/models/Router';
import { REDACTED_CONFIG_VALUE } from '@/lib/models/Router';

const api = vi.hoisted(() => ({
  patchRouterSettings: vi.fn(),
}));
vi.mock('@/lib/api/router', () => api);

const toastMock = vi.hoisted(() =>
  vi.fn(() => ({ id: 't', dismiss: vi.fn(), update: vi.fn() }))
);
vi.mock('@/lib/hooks/use-toast', () => ({
  toast: toastMock,
  useToast: () => ({ toast: toastMock }),
}));

import { Settings } from '@/components/router/settings';

function routerSettings(
  security: Partial<RouterSettings['security']> = {}
): RouterSettings {
  return {
    hostUrl: 'https://api.example.com',
    captcha: { enabled: false, provider: 'recaptcha', secretKey: '' },
    cors: {
      enabled: false,
      origin: '',
      methods: '',
      allowedHeaders: '',
      exposedHeaders: '',
      credentials: false,
      maxAge: 0,
    },
    transports: { rest: true, graphql: true, sockets: true },
    rateLimit: { maxRequests: 50, resetInterval: 1 },
    security: {
      clientValidation: true,
      clientSecretEncryptionKey: REDACTED_CONFIG_VALUE,
      clientSignaturePathPrefix: '',
      ...security,
    },
  };
}

describe('router security settings', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );
    api.patchRouterSettings.mockResolvedValue(undefined);
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

  it('shows the validation copy and does not send a redacted key', async () => {
    render(<Settings data={routerSettings()} />);

    expect(
      screen.getByText(/Non-web clients must sign each request/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/existing non-web clients must be recreated/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Client secret encryption key/i)).toHaveValue(
      REDACTED_CONFIG_VALUE
    );

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByLabelText(/Signature path prefix/i), {
      target: { value: '/api' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(api.patchRouterSettings).toHaveBeenCalledTimes(1);
    });
    const body = api.patchRouterSettings.mock.calls[0][0];
    expect(body.security).toEqual({
      clientValidation: true,
      clientSignaturePathPrefix: '/api',
    });
    expect(body.security).not.toHaveProperty('clientSecretEncryptionKey');
    expect(JSON.stringify(body)).not.toContain(REDACTED_CONFIG_VALUE);
  });

  it('omits an empty encryption key from the submitted config', async () => {
    render(
      <Settings
        data={routerSettings({
          clientSecretEncryptionKey: REDACTED_CONFIG_VALUE,
          clientSignaturePathPrefix: '/api',
        })}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByLabelText(/Client secret encryption key/i), {
      target: { value: '' },
    });
    expect(screen.getByLabelText(/Client secret encryption key/i)).toHaveValue(
      ''
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(api.patchRouterSettings).toHaveBeenCalledTimes(1);
    });
    const body = api.patchRouterSettings.mock.calls[0][0];
    expect(body.security).toEqual({
      clientValidation: true,
      clientSignaturePathPrefix: '/api',
    });
    expect(body.security).not.toHaveProperty('clientSecretEncryptionKey');
    expect(JSON.stringify(body)).not.toContain('clientSecretEncryptionKey');
    expect(JSON.stringify(body)).not.toContain(REDACTED_CONFIG_VALUE);
  });

  it('sends a generated 32-byte key and then shows the redacted marker', async () => {
    render(
      <Settings
        data={routerSettings({
          clientSecretEncryptionKey: '',
          clientSignaturePathPrefix: '/api',
        })}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));
    const key = (
      screen.getByLabelText(/Client secret encryption key/i) as HTMLInputElement
    ).value;
    expect(key).toHaveLength(44);
    expect(key.endsWith('=')).toBe(true);
    expect(Buffer.from(key, 'base64')).toHaveLength(32);

    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(key);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => {
      expect(api.patchRouterSettings).toHaveBeenCalledTimes(1);
    });
    expect(
      api.patchRouterSettings.mock.calls[0][0].security
        .clientSecretEncryptionKey
    ).toBe(key);
    await waitFor(() => {
      expect(
        screen.getByLabelText(/Client secret encryption key/i)
      ).toHaveValue(REDACTED_CONFIG_VALUE);
    });
  });
});
