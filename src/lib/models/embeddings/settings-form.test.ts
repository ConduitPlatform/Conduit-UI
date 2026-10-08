import { describe, expect, it } from 'vitest';
import { OPENAI_COMPATIBLE_PROVIDER } from './settings';
import {
  isBlockedProviderHost,
  isCatalogueModelValid,
  normalizeProviderCatalogue,
  parseHttpsEndpoint,
  resolveProviderDefaultModel,
  SETTINGS_LIMITS,
  toSettingsFormValues,
  toSettingsPatch,
} from './settings-form';
import type { EmbeddingsSettings } from './settings';

const settings: EmbeddingsSettings = {
  enabled: false,
  defaultProvider: OPENAI_COMPATIBLE_PROVIDER,
  providers: {
    [OPENAI_COMPATIBLE_PROVIDER]: {
      endpoint: 'https://api.openai.com/v1/embeddings',
      apiKeyConfigured: true,
      models: [{ name: 'text-embedding-3-small', dimensions: 1536 }],
      defaultModel: 'text-embedding-3-small',
    },
  },
  queue: {
    concurrency: 2,
    attempts: 3,
    maxBatchSize: 500,
    drainTimeoutMs: 15 * 60 * 1000,
  },
  security: {
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
    expect(isBlockedProviderHost('api.openai.com')).toBe(false);
  });

  it('normalizes a legacy singular model into a one-item catalogue', () => {
    expect(
      normalizeProviderCatalogue({
        model: ' text-embedding-3-small ',
        dimensions: 1536,
      })
    ).toEqual({
      models: [{ name: 'text-embedding-3-small', dimensions: 1536 }],
      defaultModel: 'text-embedding-3-small',
    });
    expect(
      normalizeProviderCatalogue({
        models: [{ name: 'text-embedding-3-large', dimensions: 3072 }],
        model: 'text-embedding-3-small',
        dimensions: 1536,
        defaultModel: 'text-embedding-3-large',
      })
    ).toEqual({
      models: [{ name: 'text-embedding-3-large', dimensions: 3072 }],
      defaultModel: 'text-embedding-3-large',
    });
    expect(
      normalizeProviderCatalogue({
        models: [{ name: 'kept', dimensions: 8 }],
        defaultModel: 'missing',
      })
    ).toEqual({
      models: [{ name: 'kept', dimensions: 8 }],
      defaultModel: '',
    });
  });

  it('blanks a redacted key in form values and omits it from PATCH', () => {
    const values = toSettingsFormValues(settings);
    expect(values.apiKey).toBe('');
    expect(values.apiKeyConfigured).toBe(true);
    expect(values.models).toEqual([
      { name: 'text-embedding-3-small', dimensions: 1536 },
    ]);
    expect(values.defaultModel).toBe('text-embedding-3-small');
    expect('allowedHosts' in values).toBe(false);
    expect('requireGrpcKey' in values.security).toBe(false);

    const patch = toSettingsPatch(values, settings, true);
    expect(patch.enabled).toBe(true);
    const provider = patch.providers?.[OPENAI_COMPATIBLE_PROVIDER];
    expect(provider && 'apiKey' in provider).toBe(false);
    expect(provider?.endpoint).toBe('https://api.openai.com/v1/embeddings');
    expect(provider?.models).toEqual([
      { name: 'text-embedding-3-small', dimensions: 1536 },
    ]);
    expect(patch.security?.sourceFieldAllowlist).toEqual(['Title', 'bodyText']);
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

  it('omits an empty default model and resolves catalogue defaults', () => {
    const values = toSettingsFormValues(settings);
    values.defaultModel = ' ';
    const provider = toSettingsPatch(values, settings, false).providers?.[
      OPENAI_COMPATIBLE_PROVIDER
    ];
    expect(provider && 'defaultModel' in provider).toBe(true);
    expect(provider?.defaultModel).toBe('');
    expect(isCatalogueModelValid({ name: 'ok', dimensions: 8 })).toBe(true);
    expect(isCatalogueModelValid({ name: ' ', dimensions: 8 })).toBe(false);
    expect(
      resolveProviderDefaultModel({
        endpoint: '',
        apiKeyConfigured: true,
        models: [{ name: 'first', dimensions: 8 }],
        defaultModel: '',
      })
    ).toBe('first');
  });
});
