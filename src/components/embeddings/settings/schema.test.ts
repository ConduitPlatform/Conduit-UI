import { describe, expect, it } from 'vitest';
import { REDACTED_SECRET } from '@/lib/models/embeddings/secrets';
import { OPENAI_COMPATIBLE_PROVIDER } from '@/lib/models/embeddings/settings';
import { embeddingsSettingsFormSchema } from './schema';

const valid = {
  defaultProvider: OPENAI_COMPATIBLE_PROVIDER,
  endpoint: 'https://api.openai.com/v1/embeddings',
  apiKey: '',
  apiKeyConfigured: true,
  model: 'text-embedding-3-small',
  allowedHosts: ['api.openai.com', ' API.OpenAI.com '],
  queue: {
    concurrency: 2,
    attempts: 3,
    maxBatchSize: 500,
    drainTimeoutMs: 15 * 60 * 1000,
  },
  security: {
    requireGrpcKey: false,
    sourceFieldAllowlist: ['title'],
    maxMutationEventIds: 500,
    embedTimeoutMs: 10_000,
    maxEmbedInputBytes: 32 * 1024,
    maxEmbedResponseBytes: 1024 * 1024,
  },
};

describe('embeddings settings schema', () => {
  it('accepts a redacted-configured key and normalizes hosts', () => {
    const parsed = embeddingsSettingsFormSchema.parse(valid);
    expect(parsed.allowedHosts).toEqual(['api.openai.com']);
    expect(parsed.apiKey).toBe('');
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
  });

  it('blanks a redaction marker instead of treating it as a new key', () => {
    const parsed = embeddingsSettingsFormSchema.parse({
      ...valid,
      apiKey: REDACTED_SECRET,
      apiKeyConfigured: true,
    });
    expect(parsed.apiKey).toBe('');
  });

  it('requires the endpoint host and rejects out-of-range numbers', () => {
    const missingHost = embeddingsSettingsFormSchema.safeParse({
      ...valid,
      allowedHosts: ['example.com'],
    });
    expect(missingHost.success).toBe(false);
    const concurrency = embeddingsSettingsFormSchema.safeParse({
      ...valid,
      queue: { ...valid.queue, concurrency: 0 },
    });
    expect(concurrency.success).toBe(false);
  });
});
