import { describe, expect, it } from 'vitest';
import { OPENAI_COMPATIBLE_PROVIDER } from './settings';
import {
  isBlockedProviderHost,
  isValidHost,
  normalizeHosts,
  parseHttpsEndpoint,
  SETTINGS_LIMITS,
  toSettingsFormValues,
  toSettingsPatch,
} from './settings-form';

const settings = {
  enabled: false,
  defaultProvider: OPENAI_COMPATIBLE_PROVIDER,
  providers: {
    [OPENAI_COMPATIBLE_PROVIDER]: {
      endpoint: 'https://api.openai.com/v1/embeddings',
      apiKeyConfigured: true,
      model: 'text-embedding-3-small',
      allowedHosts: ['API.OpenAI.com', ' api.openai.com ', ''],
    },
  },
  queue: {
    concurrency: 2,
    attempts: 3,
    maxBatchSize: 500,
    drainTimeoutMs: 15 * 60 * 1000,
  },
  security: {
    requireGrpcKey: false,
    sourceFieldAllowlist: [' Title ', 'bodyText'],
    maxMutationEventIds: 500,
    embedTimeoutMs: 10_000,
    maxEmbedInputBytes: 32 * 1024,
    maxEmbedResponseBytes: 1024 * 1024,
  },
};

describe('embeddings settings form mapping', () => {
  it('accepts HTTPS endpoints without credentials and rejects others', () => {
    expect(
      parseHttpsEndpoint('https://api.openai.com/v1/embeddings')?.hostname
    ).toBe('api.openai.com');
    expect(
      parseHttpsEndpoint('http://api.openai.com/v1/embeddings')
    ).toBeUndefined();
    expect(
      parseHttpsEndpoint('https://user:pass@api.openai.com/v1/embeddings')
    ).toBeUndefined();
    expect(parseHttpsEndpoint('not a url')).toBeUndefined();
    expect(
      parseHttpsEndpoint('https://127.0.0.1/v1/embeddings')
    ).toBeUndefined();
    expect(
      parseHttpsEndpoint('https://169.254.169.254/latest/meta-data')
    ).toBeUndefined();
  });

  it('rejects private, loopback, and metadata hosts', () => {
    expect(isBlockedProviderHost('localhost')).toBe(true);
    expect(isBlockedProviderHost('127.0.0.1')).toBe(true);
    expect(isBlockedProviderHost('10.0.0.4')).toBe(true);
    expect(isBlockedProviderHost('192.168.1.8')).toBe(true);
    expect(isBlockedProviderHost('169.254.169.254')).toBe(true);
    expect(isBlockedProviderHost('metadata.google.internal')).toBe(true);
    expect(isValidHost('localhost')).toBe(false);
    expect(isValidHost('api.openai.com')).toBe(true);
  });

  it('normalizes hosts and rejects empty or path-like values', () => {
    expect(
      normalizeHosts([
        'API.OpenAI.com.',
        ' api.openai.com ',
        '',
        'api.openai.com',
      ])
    ).toEqual(['api.openai.com']);
    expect(isValidHost('api.openai.com')).toBe(true);
    expect(isValidHost('https://api.openai.com')).toBe(false);
    expect(isValidHost('api.openai.com/v1')).toBe(false);
    expect(isValidHost('')).toBe(false);
  });

  it('blanks a redacted key in form values and omits it from PATCH', () => {
    const values = toSettingsFormValues(settings);
    expect(values.apiKey).toBe('');
    expect(values.apiKeyConfigured).toBe(true);
    expect(values.allowedHosts).toEqual(['api.openai.com']);
    expect(values.security.sourceFieldAllowlist).toEqual(['Title', 'bodyText']);

    const patch = toSettingsPatch(values, settings, true);
    expect(patch.enabled).toBe(true);
    const provider = patch.providers?.[OPENAI_COMPATIBLE_PROVIDER];
    expect(provider && 'apiKey' in provider).toBe(false);
    expect(provider?.endpoint).toBe('https://api.openai.com/v1/embeddings');
  });

  it('submits a replacement key and keeps numeric bounds defined', () => {
    const values = toSettingsFormValues(settings);
    values.apiKey = 'sk-replacement';
    const provider = toSettingsPatch(values, settings, false).providers?.[
      OPENAI_COMPATIBLE_PROVIDER
    ];
    expect(provider?.apiKey).toBe('sk-replacement');
    expect(SETTINGS_LIMITS.concurrency.min).toBe(1);
    expect(
      SETTINGS_LIMITS.maxEmbedResponseBytes.max >
        SETTINGS_LIMITS.maxEmbedResponseBytes.min
    ).toBe(true);
  });
});
