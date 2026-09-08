import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { REDACTED_SECRET } from '../../../lib/models/embeddings/secrets.ts';
import { OPENAI_COMPATIBLE_PROVIDER } from '../../../lib/models/embeddings/settings.ts';
import { embeddingsSettingsFormSchema } from './schema.ts';

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
    assert.deepEqual(parsed.allowedHosts, ['api.openai.com']);
    assert.equal(parsed.apiKey, '');
  });

  it('requires a key when none is stored and requires HTTPS', () => {
    const missingKey = embeddingsSettingsFormSchema.safeParse({
      ...valid,
      apiKeyConfigured: false,
      apiKey: '',
    });
    assert.equal(missingKey.success, false);
    const http = embeddingsSettingsFormSchema.safeParse({
      ...valid,
      endpoint: 'http://api.openai.com/v1/embeddings',
    });
    assert.equal(http.success, false);
  });

  it('blanks a redaction marker instead of treating it as a new key', () => {
    const parsed = embeddingsSettingsFormSchema.parse({
      ...valid,
      apiKey: REDACTED_SECRET,
      apiKeyConfigured: true,
    });
    assert.equal(parsed.apiKey, '');
  });

  it('requires the endpoint host and rejects out-of-range numbers', () => {
    const missingHost = embeddingsSettingsFormSchema.safeParse({
      ...valid,
      allowedHosts: ['example.com'],
    });
    assert.equal(missingHost.success, false);
    const concurrency = embeddingsSettingsFormSchema.safeParse({
      ...valid,
      queue: { ...valid.queue, concurrency: 0 },
    });
    assert.equal(concurrency.success, false);
  });
});
