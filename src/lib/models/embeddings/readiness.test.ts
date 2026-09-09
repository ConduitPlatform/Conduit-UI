import { describe, expect, it } from 'vitest';
import type { VectorCapabilities, VectorIndexDefinition } from './capabilities';
import type { EmbeddingConfig } from './config';
import {
  deriveEmbeddingsReadiness,
  findMatchingIndex,
  getNextReadinessAction,
  isProviderConfigured,
  isVectorStorageSearchReady,
} from './readiness';
import { EmbeddingsSettings, OPENAI_COMPATIBLE_PROVIDER } from './settings';

function config(
  partial: Partial<EmbeddingConfig> & { _id: string; schemaName: string }
): EmbeddingConfig {
  return {
    sourceFields: ['title'],
    targetField: 'embedding',
    provider: 'openai-compatible',
    model: 'text-embedding-3-small',
    dimensions: 1536,
    similarity: 'cosine',
    enabled: true,
    ...partial,
  };
}

function capabilities(
  partial: Partial<VectorCapabilities> = {}
): VectorCapabilities {
  return {
    supported: true,
    storage: true,
    indexing: true,
    search: true,
    provider: 'postgres',
    ...partial,
  };
}

function settings(ready: boolean): EmbeddingsSettings {
  return {
    enabled: true,
    defaultProvider: OPENAI_COMPATIBLE_PROVIDER,
    providers: {
      [OPENAI_COMPATIBLE_PROVIDER]: {
        endpoint: ready ? 'https://api.openai.com/v1/embeddings' : '',
        apiKeyConfigured: ready,
        model: 'text-embedding-3-small',
        allowedHosts: ['api.openai.com'],
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
      sourceFieldAllowlist: [],
      maxMutationEventIds: 500,
      embedTimeoutMs: 10_000,
      maxEmbedInputBytes: 32 * 1024,
      maxEmbedResponseBytes: 1024 * 1024,
    },
  };
}

const queryableIndex: VectorIndexDefinition = {
  field: 'embedding',
  dimensions: 1536,
  similarity: 'cosine',
  status: 'ready',
  queryable: true,
};

describe('provider and capability readiness', () => {
  it('treats a redacted key plus endpoint as configured only with matching hosts', () => {
    expect(isProviderConfigured(undefined)).toBeUndefined();
    expect(isProviderConfigured(settings(true))).toBe(true);
    expect(isProviderConfigured(settings(false))).toBe(false);
    const missingHosts = settings(true);
    missingHosts.providers[OPENAI_COMPATIBLE_PROVIDER] = {
      ...missingHosts.providers[OPENAI_COMPATIBLE_PROVIDER],
      allowedHosts: [],
    };
    expect(isProviderConfigured(missingHosts)).toBe(false);
    const wrongHost = settings(true);
    wrongHost.providers[OPENAI_COMPATIBLE_PROVIDER] = {
      ...wrongHost.providers[OPENAI_COMPATIBLE_PROVIDER],
      allowedHosts: ['example.com'],
    };
    expect(isProviderConfigured(wrongHost)).toBe(false);
    const privateHost = settings(true);
    privateHost.providers[OPENAI_COMPATIBLE_PROVIDER] = {
      ...privateHost.providers[OPENAI_COMPATIBLE_PROVIDER],
      endpoint: 'https://127.0.0.1/v1/embeddings',
      allowedHosts: ['127.0.0.1'],
    };
    expect(isProviderConfigured(privateHost)).toBe(false);
  });

  it('requires storage and search together', () => {
    expect(isVectorStorageSearchReady(undefined)).toBeUndefined();
    expect(isVectorStorageSearchReady(capabilities())).toBe(true);
    expect(isVectorStorageSearchReady(capabilities({ search: false }))).toBe(
      false
    );
    expect(
      isVectorStorageSearchReady(
        capabilities({ supported: false, storage: false, search: false })
      )
    ).toBe(false);
  });
});

describe('matching index lookup', () => {
  it('matches field, dimensions, similarity, and default method together', () => {
    const article = config({ _id: 'cfg_1', schemaName: 'Article' });
    expect(
      findMatchingIndex(article, [
        { field: 'other', dimensions: 1536, similarity: 'cosine' },
        queryableIndex,
      ])
    ).toEqual(queryableIndex);
    expect(
      findMatchingIndex(article, [
        { field: 'embedding', dimensions: 768, similarity: 'cosine' },
      ])
    ).toBeUndefined();
  });

  it('selects ready v2 over pending v1', () => {
    const article = config({ _id: 'cfg_1', schemaName: 'Article' });
    const pendingV1 = {
      name: 'embedding_vector_v1',
      field: 'embedding',
      dimensions: 1536,
      similarity: 'cosine' as const,
      method: 'hnsw' as const,
      status: 'pending' as const,
    };
    const readyV2 = {
      name: 'embedding_vector_v2',
      field: 'embedding',
      dimensions: 1536,
      similarity: 'cosine' as const,
      method: 'hnsw' as const,
      status: 'ready' as const,
      queryable: true,
    };
    expect(findMatchingIndex(article, [pendingV1, readyV2])?.name).toBe(
      'embedding_vector_v2'
    );
    const rows = deriveEmbeddingsReadiness({
      configs: [article],
      indexesBySchema: { Article: [pendingV1, readyV2] },
    });
    expect(rows.find(row => row.id === 'index')?.state).toBe('ready');
  });
});

describe('deriveEmbeddingsReadiness', () => {
  it('marks every row ready and has no next action', () => {
    const article = config({ _id: 'cfg_1', schemaName: 'Article' });
    const rows = deriveEmbeddingsReadiness({
      capabilities: capabilities(),
      settings: settings(true),
      configs: [article],
      indexesBySchema: { Article: [queryableIndex] },
      workersEnabled: true,
    });
    expect(rows.map(row => [row.id, row.state])).toEqual([
      ['capabilities', 'ready'],
      ['provider', 'ready'],
      ['index', 'ready'],
      ['config', 'ready'],
      ['workers', 'ready'],
    ]);
    expect(getNextReadinessAction(rows)).toBeUndefined();
  });

  it('keeps fetch failures unknown and points blocked rows at a fix', () => {
    const rows = deriveEmbeddingsReadiness({
      capabilitiesError: 'Capabilities unavailable',
      settingsError: 'Settings unavailable',
      configsError: 'Config list unavailable',
    });
    expect(rows.map(row => row.state)).toEqual([
      'unknown',
      'unknown',
      'unknown',
      'unknown',
      'unknown',
    ]);
    expect(getNextReadinessAction(rows)).toBeUndefined();
  });

  it('blocks unsupported databases and missing provider setup', () => {
    const rows = deriveEmbeddingsReadiness({
      capabilities: capabilities({
        supported: false,
        storage: false,
        search: false,
        reason: 'Postgres is required',
      }),
      settings: settings(false),
      configs: [],
      indexesBySchema: {},
      workersEnabled: false,
    });
    expect(rows.find(row => row.id === 'capabilities')).toMatchObject({
      state: 'blocked',
      href: '/database',
      detail: 'Postgres is required',
    });
    expect(rows.find(row => row.id === 'provider')).toMatchObject({
      state: 'blocked',
      href: '/embeddings/settings',
    });
    expect(rows.find(row => row.id === 'index')).toMatchObject({
      state: 'blocked',
      href: '/embeddings/configs/new',
    });
    expect(rows.find(row => row.id === 'config')).toMatchObject({
      state: 'blocked',
      href: '/embeddings/configs/new',
    });
    expect(rows.find(row => row.id === 'workers')).toMatchObject({
      state: 'blocked',
      href: '/embeddings/settings',
    });
    expect(getNextReadinessAction(rows)?.id).toBe('capabilities');
  });

  it('waits on a pending index and blocks a failed or missing match', () => {
    const article = config({
      _id: 'cfg_1',
      schemaName: 'Article',
      enabled: false,
    });
    const pending = deriveEmbeddingsReadiness({
      configs: [article],
      indexesBySchema: {
        Article: [
          {
            field: 'embedding',
            dimensions: 1536,
            similarity: 'cosine',
            status: 'pending',
          },
        ],
      },
    });
    expect(pending.find(row => row.id === 'index')).toMatchObject({
      state: 'waiting',
      href: '/embeddings/configs/cfg_1',
    });

    const failed = deriveEmbeddingsReadiness({
      configs: [article],
      indexesBySchema: {
        Article: [
          {
            field: 'embedding',
            dimensions: 1536,
            similarity: 'cosine',
            status: 'failed',
          },
        ],
      },
    });
    expect(failed.find(row => row.id === 'index')).toMatchObject({
      state: 'blocked',
      detail: 'Matching index failed',
    });

    const missing = deriveEmbeddingsReadiness({
      configs: [article],
      indexesBySchema: { Article: [] },
    });
    expect(missing.find(row => row.id === 'index')).toMatchObject({
      state: 'blocked',
      detail: 'No index matches field, dimensions, similarity, and method',
    });
  });

  it('scopes index and config rows to the selected config', () => {
    const disabled = config({
      _id: 'cfg_off',
      schemaName: 'Article',
      enabled: false,
    });
    const enabled = config({ _id: 'cfg_on', schemaName: 'Post' });
    const rows = deriveEmbeddingsReadiness({
      configs: [disabled, enabled],
      indexesBySchema: {
        Article: 'unknown',
        Post: [queryableIndex],
      },
      selectedConfigId: 'cfg_off',
    });
    expect(rows.find(row => row.id === 'index')?.state).toBe('unknown');
    expect(rows.find(row => row.id === 'config')).toMatchObject({
      state: 'blocked',
      href: '/embeddings/configs/cfg_off',
      detail: 'Enable this config after the index is ready',
    });
  });
});
