import { describe, expect, it } from 'vitest';
import type { VectorCapabilities, VectorIndexDefinition } from './capabilities';
import type { EmbeddingConfig } from './config';
import {
  canEnableEmbeddingConfig,
  configIndexStateLabel,
  embeddingConfigEnableBlock,
  findMatchingIndex,
  resolveConfigIndexState,
  toMatchingIndexView,
  vectorIndexGeneration,
} from './index-state';

const config: EmbeddingConfig = {
  _id: 'cfg_1',
  schemaName: 'Article',
  sourceFields: ['title'],
  targetField: 'embedding',
  provider: 'openai-compatible',
  model: 'text-embedding-3-small',
  dimensions: 1536,
  similarity: 'cosine',
  enabled: false,
};

const readyCapabilities: VectorCapabilities = {
  supported: true,
  storage: true,
  indexing: true,
  search: true,
  provider: 'postgres',
};

const matchingReady: VectorIndexDefinition = {
  name: 'embedding_vector_v2',
  field: 'embedding',
  dimensions: 1536,
  similarity: 'cosine',
  method: 'hnsw',
  status: 'ready',
  queryable: true,
};

const pendingV1: VectorIndexDefinition = {
  name: 'embedding_vector_v1',
  field: 'embedding',
  dimensions: 1536,
  similarity: 'cosine',
  method: 'hnsw',
  status: 'pending',
};

describe('config index gating', () => {
  it('resolves ready, pending, failed, missing, and unknown states', () => {
    expect(resolveConfigIndexState(config, [matchingReady])).toBe('ready');
    expect(
      resolveConfigIndexState(config, [
        {
          field: 'embedding',
          dimensions: 1536,
          similarity: 'cosine',
          status: 'pending',
        },
      ])
    ).toBe('pending');
    expect(
      resolveConfigIndexState(config, [
        {
          field: 'embedding',
          dimensions: 1536,
          similarity: 'cosine',
          status: 'failed',
        },
      ])
    ).toBe('failed');
    expect(resolveConfigIndexState(config, [])).toBe('missing');
    expect(resolveConfigIndexState(config, 'unknown')).toBe('unknown');
    expect(resolveConfigIndexState(config, undefined)).toBe('unknown');
    expect(configIndexStateLabel('missing')).toBe('Missing');
    expect(toMatchingIndexView(config, [matchingReady])).toEqual({
      state: 'ready',
      name: 'embedding_vector_v2',
      field: 'embedding',
      dimensions: 1536,
      similarity: 'cosine',
      method: 'hnsw',
      generation: 2,
      queryable: true,
    });
    expect(toMatchingIndexView(config, 'unknown').state).toBe('unknown');
  });

  it('selects the highest _vN match even when a pending v1 comes first', () => {
    expect(findMatchingIndex(config, [pendingV1, matchingReady])?.name).toBe(
      'embedding_vector_v2'
    );
    expect(resolveConfigIndexState(config, [pendingV1, matchingReady])).toBe(
      'ready'
    );
    expect(resolveConfigIndexState(config, [matchingReady, pendingV1])).toBe(
      'ready'
    );
  });

  it('prefers the default field_vector name when generations tie', () => {
    const defaultName = {
      ...matchingReady,
      name: 'embedding_vector',
    };
    const alias = {
      ...matchingReady,
      name: 'embedding_custom',
    };
    expect(findMatchingIndex(config, [alias, defaultName])?.name).toBe(
      'embedding_vector'
    );
    expect(vectorIndexGeneration(undefined)).toBe(0);
    expect(vectorIndexGeneration('embedding_vector')).toBe(1);
    expect(vectorIndexGeneration('embedding_vector_v3')).toBe(3);
  });

  it('requires field, dimensions, similarity, and default hnsw method', () => {
    expect(
      findMatchingIndex(config, [{ ...matchingReady, method: 'ivfflat' }])
    ).toBeUndefined();
    expect(
      findMatchingIndex(config, [{ ...matchingReady, dimensions: 768 }])
    ).toBeUndefined();
    expect(
      findMatchingIndex(config, [{ ...matchingReady, method: undefined }])
    ).toEqual({ ...matchingReady, method: undefined });
  });

  it('enables a config only when workers, capabilities, and a queryable match are ready', () => {
    expect(
      canEnableEmbeddingConfig({
        capabilities: readyCapabilities,
        matchingIndex: matchingReady,
        workersEnabled: true,
      })
    ).toBe(true);
    expect(
      canEnableEmbeddingConfig({
        capabilities: readyCapabilities,
        matchingIndex: matchingReady,
        workersEnabled: false,
      })
    ).toBe(false);
    expect(
      embeddingConfigEnableBlock({
        capabilities: readyCapabilities,
        matchingIndex: matchingReady,
        workersEnabled: false,
      })
    ).toMatchObject({
      href: '/embeddings/settings',
      actionLabel: 'Open settings',
    });
    expect(
      canEnableEmbeddingConfig({
        capabilities: { ...readyCapabilities, search: false },
        matchingIndex: matchingReady,
        workersEnabled: true,
      })
    ).toBe(false);
    expect(
      canEnableEmbeddingConfig({
        capabilities: readyCapabilities,
        matchingIndex: {
          ...matchingReady,
          status: 'pending',
          queryable: false,
        },
        workersEnabled: true,
      })
    ).toBe(false);
    expect(
      canEnableEmbeddingConfig({
        capabilities: readyCapabilities,
        workersEnabled: true,
      })
    ).toBe(false);
  });
});
