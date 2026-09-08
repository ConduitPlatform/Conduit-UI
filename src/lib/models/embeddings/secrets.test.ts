import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  formApiKeyValue,
  isRedactedSecret,
  isSecretConfigured,
  omitRedactedApiKey,
  REDACTED_SECRET,
  sanitizeEmbeddingsSettingsPatch,
  shouldSubmitApiKey,
} from './secrets.ts';

describe('embeddings secret handling', () => {
  it('treats a redacted marker as configured without submitting it', () => {
    assert.equal(isSecretConfigured(REDACTED_SECRET), true);
    assert.equal(isRedactedSecret(REDACTED_SECRET), true);
    assert.equal(shouldSubmitApiKey(REDACTED_SECRET), false);
    assert.equal(formApiKeyValue(REDACTED_SECRET), '');
  });

  it('omits empty and redacted keys from provider patches', () => {
    assert.deepEqual(
      omitRedactedApiKey({
        endpoint: 'https://api.openai.com/v1/embeddings',
        apiKey: REDACTED_SECRET,
        model: 'text-embedding-3-small',
        allowedHosts: ['api.openai.com'],
      }),
      {
        endpoint: 'https://api.openai.com/v1/embeddings',
        model: 'text-embedding-3-small',
        allowedHosts: ['api.openai.com'],
      }
    );
    assert.equal(
      'apiKey' in
        omitRedactedApiKey({
          endpoint: 'https://api.openai.com/v1/embeddings',
          apiKey: 'sk-live',
          model: 'text-embedding-3-small',
          allowedHosts: ['api.openai.com'],
        }),
      true
    );
  });

  it('strips redacted keys from a settings patch', () => {
    const patched = sanitizeEmbeddingsSettingsPatch({
      providers: {
        'openai-compatible': {
          endpoint: 'https://api.openai.com/v1/embeddings',
          apiKey: REDACTED_SECRET,
          model: 'text-embedding-3-small',
          allowedHosts: ['api.openai.com'],
        },
      },
    });
    assert.equal(
      patched.providers?.['openai-compatible'] &&
        'apiKey' in patched.providers['openai-compatible'],
      false
    );
  });
});
