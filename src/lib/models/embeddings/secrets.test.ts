import { describe, expect, it } from 'vitest';
import {
  formApiKeyValue,
  isRedactedSecret,
  isSecretConfigured,
  omitRedactedApiKey,
  REDACTED_SECRET,
  sanitizeEmbeddingsSettingsPatch,
  shouldSubmitApiKey,
  toClientSafeProvider,
} from './secrets';

const models = [{ name: 'text-embedding-3-small', dimensions: 1536 }];

describe('embeddings secret handling', () => {
  it('treats a redacted marker as configured without submitting it', () => {
    expect(isSecretConfigured(REDACTED_SECRET)).toBe(true);
    expect(isRedactedSecret(REDACTED_SECRET)).toBe(true);
    expect(shouldSubmitApiKey(REDACTED_SECRET)).toBe(false);
    expect(formApiKeyValue(REDACTED_SECRET)).toBe('');
  });

  it('omits empty and redacted keys from provider patches', () => {
    expect(
      omitRedactedApiKey({
        endpoint: 'https://api.openai.com/v1/embeddings',
        apiKey: REDACTED_SECRET,
        models,
        defaultModel: 'text-embedding-3-small',
      })
    ).toEqual({
      endpoint: 'https://api.openai.com/v1/embeddings',
      models,
      defaultModel: 'text-embedding-3-small',
    });
    expect(
      'apiKey' in
        omitRedactedApiKey({
          endpoint: 'https://api.openai.com/v1/embeddings',
          apiKey: 'sk-live',
          models,
        })
    ).toBe(true);
  });

  it('strips redacted keys from a settings patch', () => {
    const patched = sanitizeEmbeddingsSettingsPatch({
      providers: {
        'openai-compatible': {
          endpoint: 'https://api.openai.com/v1/embeddings',
          apiKey: REDACTED_SECRET,
          models,
        },
      },
    });
    expect(
      patched.providers?.['openai-compatible'] &&
        'apiKey' in patched.providers['openai-compatible']
    ).toBe(false);
  });

  it('derives apiKeyConfigured and never copies the secret value', () => {
    const provider = toClientSafeProvider({
      endpoint: 'https://api.openai.com/v1/embeddings',
      apiKey: 'sk-live-plaintext',
      models,
      defaultModel: 'text-embedding-3-small',
    });
    expect(provider.apiKeyConfigured).toBe(true);
    expect(provider).toEqual({
      endpoint: 'https://api.openai.com/v1/embeddings',
      apiKeyConfigured: true,
      models,
      defaultModel: 'text-embedding-3-small',
    });
  });
});
