import { describe, expect, it } from 'vitest';
import { REDACTED_SECRET } from '@/lib/models/embeddings/secrets';
import { OPENAI_COMPATIBLE_PROVIDER } from '@/lib/models/embeddings/settings';
import { embeddingsSettingsFormSchema } from './schema';

const valid = {
  defaultProvider: OPENAI_COMPATIBLE_PROVIDER,
  endpoint: 'https://api.openai.com/v1/embeddings',
  apiKey: '',
  apiKeyConfigured: true,
  models: [{ name: 'text-embedding-3-small', dimensions: 1536 }],
  defaultModel: 'text-embedding-3-small',
  queue: {
    concurrency: 2,
    attempts: 3,
    maxBatchSize: 500,
    drainTimeoutMs: 15 * 60 * 1000,
  },
  security: {
    maxMutationEventIds: 500,
    embedTimeoutMs: 10_000,
    maxEmbedInputBytes: 32 * 1024,
    maxEmbedResponseBytes: 1024 * 1024,
  },
};

describe('embeddings settings schema', () => {
  it('accepts a redacted-configured key and unique models', () => {
    const parsed = embeddingsSettingsFormSchema.parse(valid);
    expect(parsed.models).toEqual([
      { name: 'text-embedding-3-small', dimensions: 1536 },
    ]);
    expect(parsed.apiKey).toBe('');
    expect(parsed.defaultModel).toBe('text-embedding-3-small');
  });

  it('requires a key when none is stored and requires HTTPS', () => {
    const missingKey = embeddingsSettingsFormSchema.safeParse({
      ...valid,
      apiKeyConfigured: false,
      apiKey: '',
    });
    expect(missingKey.success).toBe(false);
    const http = embeddingsSettingsFormSchema.safeParse({
      ...valid,
      endpoint: 'http://api.openai.com/v1/embeddings',
    });
    expect(http.success).toBe(false);
    const loopback = embeddingsSettingsFormSchema.safeParse({
      ...valid,
      endpoint: 'https://127.0.0.1/v1/embeddings',
    });
    expect(loopback.success).toBe(false);
  });

  it('blanks a redaction marker instead of treating it as a new key', () => {
    const parsed = embeddingsSettingsFormSchema.parse({
      ...valid,
      apiKey: REDACTED_SECRET,
      apiKeyConfigured: true,
    });
    expect(parsed.apiKey).toBe('');
  });

  it('requires unique trimmed names, positive dimensions, and a listed default', () => {
    const duplicate = embeddingsSettingsFormSchema.safeParse({
      ...valid,
      models: [
        { name: 'same', dimensions: 8 },
        { name: ' same ', dimensions: 16 },
      ],
    });
    expect(duplicate.success).toBe(false);
    const emptyCatalogue = embeddingsSettingsFormSchema.safeParse({
      ...valid,
      models: [],
    });
    expect(emptyCatalogue.success).toBe(false);
    const zeroDimensions = embeddingsSettingsFormSchema.safeParse({
      ...valid,
      models: [{ name: 'ok', dimensions: 0 }],
    });
    expect(zeroDimensions.success).toBe(false);
    const missingDefault = embeddingsSettingsFormSchema.safeParse({
      ...valid,
      defaultModel: 'not-listed',
    });
    expect(missingDefault.success).toBe(false);
    const optionalDefault = embeddingsSettingsFormSchema.parse({
      ...valid,
      defaultModel: '',
    });
    expect(optionalDefault.defaultModel).toBe('');
    const concurrency = embeddingsSettingsFormSchema.safeParse({
      ...valid,
      queue: { ...valid.queue, concurrency: 0 },
    });
    expect(concurrency.success).toBe(false);
  });
});
