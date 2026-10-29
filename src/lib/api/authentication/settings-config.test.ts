import { AxiosError, type AxiosResponse } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const client = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ getApiClient: async () => client }));

import {
  getAuthenticationSettings,
  updateAuthenticationSettings,
} from '@/lib/api/authentication';
import { MISSING_AUTHENTICATION_CONFIG_ROUTE } from '@/lib/api/authentication/module-config';

const authentication = {
  accessTokens: { expiryPeriod: 3600000, setCookie: false },
  teams: { enabled: true },
};

const notFound = () =>
  new AxiosError(
    'Request failed with status code 404',
    'ERR_BAD_REQUEST',
    undefined,
    undefined,
    {
      status: 404,
      data: '<pre>Cannot GET /config/authentication</pre>',
    } as AxiosResponse
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getAuthenticationSettings', () => {
  it('uses GET /config/authentication when that route is registered', async () => {
    client.get.mockResolvedValueOnce({ data: { config: authentication } });

    await expect(getAuthenticationSettings()).resolves.toEqual({
      config: authentication,
    });
    expect(client.get).toHaveBeenCalledTimes(1);
    expect(client.get).toHaveBeenCalledWith('/config/authentication');
  });

  it('falls back to GET /config when the per-module route is missing', async () => {
    client.get.mockRejectedValueOnce(notFound());
    client.get.mockResolvedValueOnce({
      data: {
        config: {
          modules: {
            authentication,
          },
        },
      },
    });

    await expect(getAuthenticationSettings()).resolves.toEqual({
      config: authentication,
    });
    expect(client.get).toHaveBeenNthCalledWith(1, '/config/authentication');
    expect(client.get).toHaveBeenNthCalledWith(2, '/config');
  });

  it('does not hide failures other than a missing config route', async () => {
    const failure = new AxiosError('Request failed with status code 500');
    client.get.mockRejectedValueOnce(failure);

    await expect(getAuthenticationSettings()).rejects.toBe(failure);
    expect(client.get).toHaveBeenCalledTimes(1);
  });

  it('rethrows the 404 when monolithic config has no authentication module', async () => {
    const missing = notFound();
    client.get.mockRejectedValueOnce(missing);
    client.get.mockResolvedValueOnce({
      data: { config: { modules: { database: {} } } },
    });

    await expect(getAuthenticationSettings()).rejects.toBe(missing);
  });
});

describe('updateAuthenticationSettings', () => {
  it('explains a missing PATCH /config/authentication route', async () => {
    client.patch.mockRejectedValueOnce(
      new AxiosError(
        'Request failed with status code 404',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        {
          status: 404,
          data: '<pre>Cannot PATCH /config/authentication</pre>',
        } as AxiosResponse
      )
    );

    const result = await updateAuthenticationSettings({
      teams: { enabled: true },
    } as never);

    expect(result).toEqual({
      ok: false,
      code: 'UNKNOWN',
      message: MISSING_AUTHENTICATION_CONFIG_ROUTE,
    });
  });
});
