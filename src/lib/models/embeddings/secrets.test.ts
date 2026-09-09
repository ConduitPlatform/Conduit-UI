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
        model: 'text-embedding-3-small',
        allowedHosts: ['api.openai.com'],
      })
    ).toEqual({
      endpoint: 'https://api.openai.com/v1/embeddings',
      model: 'text-embedding-3-small',
      allowedHosts: ['api.openai.com'],
    });
    expect(
      'apiKey' in
        omitRedactedApiKey({
          endpoint: 'https://api.openai.com/v1/embeddings',
          apiKey: 'sk-live',
          model: 'text-embedding-3-small',
          allowedHosts: ['api.openai.com'],
        })
    ).toBe(true);
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
    expect(
      patched.providers?.['openai-compatible'] &&
        'apiKey' in patched.providers['openai-compatible']
    ).toBe(false);
  });

  it('derives apiKeyConfigured and never copies the secret value', () => {
    const provider = toClientSafeProvider({
      endpoint: 'https://api.openai.com/v1/embeddings',
      apiKey: 'sk-live-plaintext',
      model: 'text-embedding-3-small',
      allowedHosts: ['api.openai.com'],
    });
    expect(provider.apiKeyConfigured).toBe(true);
    expect(provider).toEqual({
      endpoint: 'https://api.openai.com/v1/embeddings',
      apiKeyConfigured: true,
      model: 'text-embedding-3-small',
      allowedHosts: ['api.openai.com'],
    });
  });
});
