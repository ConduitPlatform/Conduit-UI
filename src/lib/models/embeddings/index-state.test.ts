import { describe, expect, it } from 'vitest';
import type { VectorCapabilities, VectorIndexDefinition } from './capabilities';
import type { EmbeddingConfig } from './config';
import {
  canEnableEmbeddingConfig,
  configIndexStateLabel,
  resolveConfigIndexState,
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
  field: 'embedding',
  dimensions: 1536,
  similarity: 'cosine',
  status: 'ready',
  queryable: true,
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
  });

  it('enables a config only when capabilities and a queryable match are ready', () => {
    expect(
      canEnableEmbeddingConfig({
        capabilities: readyCapabilities,
        matchingIndex: matchingReady,
      })
    ).toBe(true);
    expect(
      canEnableEmbeddingConfig({
        capabilities: { ...readyCapabilities, search: false },
        matchingIndex: matchingReady,
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
      })
    ).toBe(false);
    expect(
      canEnableEmbeddingConfig({
        capabilities: readyCapabilities,
      })
    ).toBe(false);
  });
});
