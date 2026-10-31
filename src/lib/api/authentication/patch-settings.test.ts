import { beforeEach, describe, expect, it, vi } from 'vitest';

const client = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ getApiClient: async () => client }));

import { patchAuthenticationSettingsMerged } from '@/lib/api/authentication';
import type { AuthenticationConfig } from '@/lib/models/authentication';

beforeEach(() => {
  vi.clearAllMocks();
  client.patch.mockResolvedValue({ data: {} });
});

describe('patchAuthenticationSettingsMerged', () => {
  it('replaces issuer lists and drops undefined', async () => {
    client.get.mockResolvedValue({
      data: {
        config: {
          twoFa: {
            enabled: true,
            methods: { sms: false, authenticator: true },
            backUpCodes: { enabled: false },
            allowedIssuers: ['Old', 'Kept'],
          },
        },
      },
    });

    await patchAuthenticationSettingsMerged({
      twoFa: {
        issuer: undefined,
        allowedIssuers: ['Acme Mobile'],
      },
    } as Partial<AuthenticationConfig>);

    expect(client.patch).toHaveBeenCalledWith('/config/authentication', {
      config: {
        twoFa: {
          enabled: true,
          methods: { sms: false, authenticator: true },
          backUpCodes: { enabled: false },
          allowedIssuers: ['Acme Mobile'],
        },
      },
    });
  });
});
