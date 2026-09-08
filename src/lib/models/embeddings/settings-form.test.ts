import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { REDACTED_SECRET } from './secrets.ts';
import { OPENAI_COMPATIBLE_PROVIDER } from './settings.ts';
import {
  isValidHost,
  normalizeHosts,
  parseHttpsEndpoint,
  SETTINGS_LIMITS,
  toSettingsFormValues,
  toSettingsPatch,
} from './settings-form.ts';

const settings = {
  enabled: false,
  defaultProvider: OPENAI_COMPATIBLE_PROVIDER,
  providers: {
    [OPENAI_COMPATIBLE_PROVIDER]: {
      endpoint: 'https://api.openai.com/v1/embeddings',
      apiKey: REDACTED_SECRET,
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
    sourceFieldAllowlist: [' title ', ''],
    maxMutationEventIds: 500,
    embedTimeoutMs: 10_000,
    maxEmbedInputBytes: 32 * 1024,
    maxEmbedResponseBytes: 1024 * 1024,
  },
};

describe('embeddings settings form mapping', () => {
  it('accepts HTTPS endpoints without credentials and rejects others', () => {
    assert.equal(
      parseHttpsEndpoint('https://api.openai.com/v1/embeddings')?.hostname,
      'api.openai.com'
    );
    assert.equal(
      parseHttpsEndpoint('http://api.openai.com/v1/embeddings'),
      undefined
    );
    assert.equal(
      parseHttpsEndpoint('https://user:pass@api.openai.com/v1/embeddings'),
      undefined
    );
    assert.equal(parseHttpsEndpoint('not a url'), undefined);
  });

  it('normalizes hosts and rejects empty or path-like values', () => {
    assert.deepEqual(
      normalizeHosts([
        'API.OpenAI.com.',
        ' api.openai.com ',
        '',
        'api.openai.com',
      ]),
      ['api.openai.com']
    );
    assert.equal(isValidHost('api.openai.com'), true);
    assert.equal(isValidHost('https://api.openai.com'), false);
    assert.equal(isValidHost('api.openai.com/v1'), false);
    assert.equal(isValidHost(''), false);
  });

  it('blanks a redacted key in form values and omits it from PATCH', () => {
    const values = toSettingsFormValues(settings);
    assert.equal(values.apiKey, '');
    assert.equal(values.apiKeyConfigured, true);
    assert.deepEqual(values.allowedHosts, ['api.openai.com']);
    assert.deepEqual(values.security.sourceFieldAllowlist, ['title']);

    const patch = toSettingsPatch(values, settings, true);
    assert.equal(patch.enabled, true);
    const provider = patch.providers?.[OPENAI_COMPATIBLE_PROVIDER];
    assert.equal(provider && 'apiKey' in provider, false);
    assert.equal(provider?.endpoint, 'https://api.openai.com/v1/embeddings');
  });

  it('submits a replacement key and keeps numeric bounds defined', () => {
    const values = toSettingsFormValues(settings);
    values.apiKey = 'sk-replacement';
    const provider = toSettingsPatch(values, settings, false).providers?.[
      OPENAI_COMPATIBLE_PROVIDER
    ];
    assert.equal(provider?.apiKey, 'sk-replacement');
    assert.equal(SETTINGS_LIMITS.concurrency.min, 1);
    assert.ok(
      SETTINGS_LIMITS.maxEmbedResponseBytes.max >
        SETTINGS_LIMITS.maxEmbedResponseBytes.min
    );
  });
});
