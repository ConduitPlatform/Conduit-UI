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
import type { EmbeddingSource } from './source';

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
        models: ready
          ? [{ name: 'text-embedding-3-small', dimensions: 1536 }]
          : [],
        defaultModel: ready ? 'text-embedding-3-small' : '',
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

function source(
  partial: Partial<EmbeddingSource> & Pick<EmbeddingSource, '_id'>
): EmbeddingSource {
  return {
    kind: 'conduit-storage',
    state: 'ready',
    partitionSubject: 'Team:org',
    provider: 'openai-compatible',
    model: 'text-embedding-3-small',
    dimensions: 1536,
    similarity: 'cosine',
    metadataAllowlist: [],
    chunkIndexStatus: 'ready',
    ...partial,
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
  it('treats a redacted key plus endpoint as configured only with a valid model', () => {
    expect(isProviderConfigured(undefined)).toBeUndefined();
    expect(isProviderConfigured(settings(true))).toBe(true);
    expect(isProviderConfigured(settings(false))).toBe(false);
    const missingModels = settings(true);
    missingModels.providers[OPENAI_COMPATIBLE_PROVIDER] = {
      ...missingModels.providers[OPENAI_COMPATIBLE_PROVIDER],
      models: [],
    };
    expect(isProviderConfigured(missingModels)).toBe(false);
    const invalidDefault = settings(true);
    invalidDefault.providers[OPENAI_COMPATIBLE_PROVIDER] = {
      ...invalidDefault.providers[OPENAI_COMPATIBLE_PROVIDER],
      defaultModel: 'missing',
    };
    expect(isProviderConfigured(invalidDefault)).toBe(false);
    const privateHost = settings(true);
    privateHost.providers[OPENAI_COMPATIBLE_PROVIDER] = {
      ...privateHost.providers[OPENAI_COMPATIBLE_PROVIDER],
      endpoint: 'https://127.0.0.1/v1/embeddings',
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
      state: 'ready',
      detail: 'No configured workload',
    });
    expect(rows.find(row => row.id === 'config')).toMatchObject({
      state: 'ready',
      detail: 'No configured workload',
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

  it('blocks a selected config whose model is absent from the catalogue', () => {
    const legacy = config({
      _id: 'cfg_legacy',
      schemaName: 'Article',
      model: 'text-embedding-ada-002',
      enabled: true,
    });
    const rows = deriveEmbeddingsReadiness({
      settings: settings(true),
      configs: [legacy],
      indexesBySchema: { Article: [queryableIndex] },
      selectedConfigId: 'cfg_legacy',
    });
    expect(rows.find(row => row.id === 'config')).toMatchObject({
      state: 'blocked',
      detail: 'This model is not in the provider catalogue.',
      href: '/embeddings/settings',
      actionLabel: 'Open settings',
    });
  });

  it('treats ready generic sources as a queryable catalogue', () => {
    const rows = deriveEmbeddingsReadiness({
      capabilities: capabilities(),
      settings: settings(true),
      configs: [],
      sources: [
        source({ _id: 'src_a' }),
        source({ _id: 'src_b', kind: 'external' }),
      ],
      indexesBySchema: {},
      workersEnabled: true,
    });
    expect(rows.find(row => row.id === 'index')).toMatchObject({
      state: 'ready',
      detail: 'Matching index is queryable',
    });
    expect(rows.find(row => row.id === 'config')).toMatchObject({
      state: 'ready',
      detail: 'At least one generic source is ready',
    });
    expect(rows.find(row => row.id === 'workers')?.state).toBe('ready');
  });

  it('keeps mixed schema and generic catalogues ready', () => {
    const article = config({ _id: 'cfg_1', schemaName: 'Article' });
    const rows = deriveEmbeddingsReadiness({
      configs: [article],
      sources: [source({ _id: 'src_a' })],
      indexesBySchema: { Article: [queryableIndex] },
    });
    expect(rows.find(row => row.id === 'index')?.state).toBe('ready');
    expect(rows.find(row => row.id === 'config')?.state).toBe('ready');
  });

  it('does not mark pending or unknown generic indexes ready', () => {
    const pending = deriveEmbeddingsReadiness({
      configs: [],
      sources: [
        source({
          _id: 'src_pending',
          state: 'pending',
          chunkIndexStatus: 'pending',
        }),
      ],
    });
    expect(pending.find(row => row.id === 'index')).toMatchObject({
      state: 'waiting',
      detail: 'Matching index is not queryable yet',
    });
    expect(pending.find(row => row.id === 'config')?.state).toBe('waiting');

    const unknown = deriveEmbeddingsReadiness({
      configs: [],
      sources: [
        source({
          _id: 'src_unknown',
          state: 'ready',
          chunkIndexStatus: undefined,
        }),
      ],
    });
    expect(unknown.find(row => row.id === 'index')?.state).toBe('ready');
    expect(unknown.find(row => row.id === 'config')?.state).toBe('ready');
  });

  it('treats disabled or revoked-only sources as no configured workload', () => {
    const rows = deriveEmbeddingsReadiness({
      configs: [],
      sources: [
        source({ _id: 'src_off', state: 'disabled' }),
        source({ _id: 'src_rev', state: 'revoked' }),
      ],
    });
    expect(rows.find(row => row.id === 'index')).toMatchObject({
      state: 'ready',
      detail: 'No configured workload',
    });
    expect(rows.find(row => row.id === 'config')).toMatchObject({
      state: 'ready',
      detail: 'No configured workload',
    });
  });

  it('ignores generic sources when a schema config is selected', () => {
    const article = config({
      _id: 'cfg_off',
      schemaName: 'Article',
      enabled: false,
    });
    const rows = deriveEmbeddingsReadiness({
      configs: [article],
      sources: [source({ _id: 'src_ready' })],
      indexesBySchema: { Article: 'unknown' },
      selectedConfigId: 'cfg_off',
    });
    expect(rows.find(row => row.id === 'index')?.state).toBe('unknown');
    expect(rows.find(row => row.id === 'config')).toMatchObject({
      state: 'blocked',
      href: '/embeddings/configs/cfg_off',
    });
  });
});
