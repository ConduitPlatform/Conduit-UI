import { describe, expect, it } from 'vitest';
import {
  catalogueDimensionsForInput,
  findCatalogueModel,
  isConfigModelInCatalogue,
  listConfiguredProviders,
  resolveCreateDefaults,
  similarityHelp,
} from './config-catalogue';
import {
  OPENAI_COMPATIBLE_PROVIDER,
  type EmbeddingsSettings,
} from './settings';

function settings(): EmbeddingsSettings {
  return {
    enabled: true,
    defaultProvider: OPENAI_COMPATIBLE_PROVIDER,
    providers: {
      [OPENAI_COMPATIBLE_PROVIDER]: {
        endpoint: 'https://api.openai.com/v1/embeddings',
        apiKeyConfigured: true,
        models: [
          { name: 'text-embedding-3-small', dimensions: 1536 },
          { name: 'text-embedding-3-large', dimensions: 3072 },
        ],
        defaultModel: 'text-embedding-3-small',
      },
      voyage: {
        endpoint: 'https://api.voyageai.com/v1/embeddings',
        apiKeyConfigured: true,
        models: [{ name: 'voyage-3', dimensions: 1024 }],
        defaultModel: 'voyage-3',
      },
    },
    queue: {
      concurrency: 2,
      attempts: 3,
      maxBatchSize: 500,
      drainTimeoutMs: 15 * 60 * 1000,
    },
    security: {
      sourceFieldAllowlist: [],
      maxMutationEventIds: 500,
      embedTimeoutMs: 10_000,
      maxEmbedInputBytes: 32 * 1024,
      maxEmbedResponseBytes: 1024 * 1024,
    },
  };
}

describe('config catalogue', () => {
  it('lists configured provider keys and resolves catalogue membership', () => {
    const providers = listConfiguredProviders(settings());
    expect(providers.map(provider => provider.key)).toEqual([
      OPENAI_COMPATIBLE_PROVIDER,
      'voyage',
    ]);
    expect(
      findCatalogueModel(providers, 'voyage', 'voyage-3')?.dimensions
    ).toBe(1024);
    expect(
      isConfigModelInCatalogue(
        { provider: OPENAI_COMPATIBLE_PROVIDER, model: 'missing' },
        providers
      )
    ).toBe(false);
    expect(() =>
      catalogueDimensionsForInput(
        { provider: OPENAI_COMPATIBLE_PROVIDER, model: 'missing' },
        providers
      )
    ).toThrow('This model is not in the selected provider catalogue.');
    expect(
      catalogueDimensionsForInput(
        {
          provider: OPENAI_COMPATIBLE_PROVIDER,
          model: 'text-embedding-3-large',
        },
        providers
      ).dimensions
    ).toBe(3072);
  });

  it('does not invent a model when the configured default is absent', () => {
    const providers = listConfiguredProviders(settings());
    expect(
      resolveCreateDefaults({
        providers,
        defaultProvider: OPENAI_COMPATIBLE_PROVIDER,
        defaultModel: 'missing',
      })
    ).toEqual({
      provider: OPENAI_COMPATIBLE_PROVIDER,
      model: '',
      dimensions: 0,
    });
    expect(
      resolveCreateDefaults({
        providers: providers.filter(provider => provider.key === 'voyage'),
        defaultProvider: 'missing',
        defaultModel: '',
      })
    ).toEqual({
      provider: 'voyage',
      model: 'voyage-3',
      dimensions: 1024,
    });
  });

  it('describes similarity options', () => {
    expect(similarityHelp('cosine')).toContain('Recommended for text');
    expect(similarityHelp('euclidean')).toContain('Direct distance');
    expect(similarityHelp('dotProduct')).toContain('direction and magnitude');
  });
});
