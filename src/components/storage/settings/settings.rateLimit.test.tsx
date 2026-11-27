import '@testing-library/jest-dom/vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { StorageSettings } from '@/lib/models/storage';

const api = vi.hoisted(() => ({
  patchStorageSettings: vi.fn(),
}));
vi.mock('@/lib/api/storage', () => api);

const toastMock = vi.hoisted(() =>
  vi.fn(() => ({ id: 't', dismiss: vi.fn(), update: vi.fn() }))
);
vi.mock('@/lib/hooks/use-toast', () => ({
  toast: toastMock,
  useToast: () => ({ toast: toastMock }),
}));

import { Settings } from '@/components/storage/settings/settings';

function storageSettings(
  overrides: Partial<StorageSettings> = {}
): StorageSettings {
  return {
    active: true,
    provider: 'local',
    authorization: { enabled: false },
    defaultContainer: 'conduit',
    allowContainerCreation: true,
    google: { serviceAccountKeyPath: '', serviceAccountKeyJson: '' },
    azure: { connectionString: '' },
    aws: { accessKeyId: '', secretAccessKey: '' },
    aliyun: { region: '', accessKeyId: '', accessKeySecret: '' },
    local: { storagePath: '/var/tmp' },
    rateLimits: { write: { maxRequests: 60, resetInterval: 3600 } },
    ...overrides,
  };
}

describe('storage write rate limit settings', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );
    api.patchStorageSettings.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('shows the current limit and submits a changed value', async () => {
    render(<Settings data={storageSettings()} authzAvailable={false} />);

    expect(screen.getByLabelText('Max Requests')).toHaveValue(60);
    expect(screen.getByLabelText('Interval')).toHaveValue(3600);

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByLabelText('Max Requests'), {
      target: { value: '200' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(api.patchStorageSettings).toHaveBeenCalledTimes(1);
    });
    expect(api.patchStorageSettings.mock.calls[0][0].rateLimits).toEqual({
      write: { maxRequests: 200, resetInterval: 3600 },
    });
  });

  it('rejects a value that is not a positive whole number', async () => {
    render(<Settings data={storageSettings()} authzAvailable={false} />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByLabelText('Interval'), {
      target: { value: '0' },
    });
    fireEvent.change(screen.getByLabelText('Max Requests'), {
      target: { value: '1.5' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(
      await screen.findByText('Must be greater than 0')
    ).toBeInTheDocument();
    expect(screen.getByText('Must be a whole number')).toBeInTheDocument();
    expect(api.patchStorageSettings).not.toHaveBeenCalled();
  });

  it('hides the section and sends no rateLimits for older servers', async () => {
    render(
      <Settings
        data={storageSettings({ rateLimits: undefined })}
        authzAvailable={false}
      />
    );

    expect(screen.queryByLabelText('Max Requests')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(api.patchStorageSettings).toHaveBeenCalledTimes(1);
    });
    expect(
      api.patchStorageSettings.mock.calls[0][0].rateLimits
    ).toBeUndefined();
  });
});
