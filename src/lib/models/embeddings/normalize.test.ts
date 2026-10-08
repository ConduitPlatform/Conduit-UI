import { describe, expect, it } from 'vitest';
import {
  parseBackfillFilter,
  serializeBackfillFilter,
  unwrapBackfillRun,
  unwrapDatabaseVectorCapabilities,
  unwrapEmbeddingConfig,
  unwrapEmbeddingConfigList,
  unwrapEmbeddingsCapabilities,
  unwrapEmbeddingsSettings,
  unwrapSemanticSearch,
  unwrapUpsertEmbeddingConfig,
} from './normalize';
import { OPENAI_COMPATIBLE_PROVIDER } from './settings';

const configDoc = {
  _id: 'cfg_1',
  schemaName: 'Article',
  sourceFields: ['title'],
  targetField: 'embedding',
  modelName: 'text-embedding-3-small',
  dimensions: '1536',
};

describe('embedding config unwrapping', () => {
  it('maps modelName to model and accepts wrapped or bare payloads', () => {
    const bare = unwrapEmbeddingConfig(configDoc);
    expect(bare.model).toBe('text-embedding-3-small');
    expect(bare.dimensions).toBe(1536);
    expect(bare.enabled).toBe(true);
    expect(bare.similarity).toBe('cosine');

    const wrapped = unwrapEmbeddingConfig({ config: configDoc });
    expect(wrapped._id).toBe('cfg_1');
    expect(unwrapEmbeddingConfigList({ configs: [configDoc] })).toHaveLength(1);
    expect(unwrapEmbeddingConfigList([configDoc])[0]?.schemaName).toBe(
      'Article'
    );
    const live = unwrapEmbeddingConfig({
      id: 'cfg_live',
      schemaName: 'Article',
      sourceFields: ['title'],
      targetField: 'embedding',
      model: 'text-embedding-3-small',
      dimensions: 1536,
    });
    expect(live._id).toBe('cfg_live');
    expect(live.model).toBe('text-embedding-3-small');
    expect(
      unwrapUpsertEmbeddingConfig({
        config: configDoc,
        warnings: ['index pending'],
      }).warnings
    ).toEqual(['index pending']);
  });

  it('keeps a bare config that also contains a nested config key', () => {
    const parsed = unwrapEmbeddingConfig({
      ...configDoc,
      config: { ignored: true },
    });
    expect(parsed._id).toBe('cfg_1');
  });
});

describe('backfill filter parsing', () => {
  it('parses object or JSON filters and rejects arrays', () => {
    expect(parseBackfillFilter('{"status":"draft"}')).toEqual({
      status: 'draft',
    });
    expect(parseBackfillFilter({ status: 'draft' })).toEqual({
      status: 'draft',
    });
    expect(parseBackfillFilter('')).toBeUndefined();
    expect(parseBackfillFilter('[1]')).toBeUndefined();
    expect(parseBackfillFilter('{')).toBeUndefined();
    expect(serializeBackfillFilter('{"ok":true}')).toEqual({ ok: true });
    expect(() => serializeBackfillFilter('[1]')).toThrow(
      'Filter must be a JSON object.'
    );
    expect(() => serializeBackfillFilter('{"$where":"1==1"}')).toThrow(
      'Filter allows equality, comparisons, bounded $in/$nin, and $and only.'
    );
  });

  it('unwraps a run and parses a stringified filter', () => {
    const run = unwrapBackfillRun({
      run: {
        id: 'run_1',
        schemaName: 'Article',
        state: 'queued',
        filter: '{"published":true}',
        onlyMissing: true,
      },
    });
    expect(run._id).toBe('run_1');
    expect(run.filter).toEqual({ published: true });
    expect(run.onlyMissing).toBe(true);
    const stringFilter = unwrapBackfillRun({
      id: 'run_2',
      schemaName: 'Article',
      state: 'queued',
      filter: '{"published":true}',
    });
    expect(stringFilter._id).toBe('run_2');
    expect(stringFilter.filter).toEqual({ published: true });
  });
});

describe('capability and search unwrapping', () => {
  it('keeps embeddings capabilities wrapped and database capabilities bare', () => {
    const db = unwrapDatabaseVectorCapabilities({
      supported: true,
      storage: true,
      indexing: 1,
      search: true,
      provider: 'postgres',
    });
    expect(db).toEqual({
      supported: true,
      storage: true,
      indexing: false,
      search: true,
      provider: 'postgres',
      reason: undefined,
    });
    expect(() => unwrapEmbeddingsCapabilities(db)).toThrow(
      'Invalid embeddings capabilities response'
    );
    expect(
      unwrapEmbeddingsCapabilities({
        capabilities: db,
        warnings: ['slow'],
      }).warnings
    ).toEqual(['slow']);
  });

  it('accepts hit arrays or wrapped hits and parses document JSON', () => {
    const hit = {
      score: 0.8,
      document: '{"title":"One"}',
      provider: 'postgres',
    };
    expect(unwrapSemanticSearch([hit]).hits[0]?.document).toEqual({
      title: 'One',
    });
    expect(unwrapSemanticSearch({ hits: [hit] }).hits).toHaveLength(1);
    expect(unwrapSemanticSearch({ hits: [hit] }).hits[0]?.document).toEqual({
      title: 'One',
    });
    const secretHit = {
      score: 0.1,
      document: {
        _id: 'doc_1',
        title: 'Visible',
        password: 'nope',
        embedding: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      },
    };
    expect(
      unwrapSemanticSearch({ hits: [secretHit] }).hits[0]?.document
    ).toEqual({
      _id: 'doc_1',
      title: 'Visible',
    });
    expect(() => unwrapSemanticSearch({ results: [] })).toThrow(
      'Invalid semantic search response'
    );
  });
});

describe('settings unwrapping', () => {
  it('fills the openai-compatible provider when missing', () => {
    const parsed = unwrapEmbeddingsSettings({
      config: { enabled: true, providers: {} },
    });
    expect(parsed.config.enabled).toBe(true);
    expect(parsed.config.providers[OPENAI_COMPATIBLE_PROVIDER]).toEqual({
      endpoint: '',
      apiKeyConfigured: false,
      models: [],
      defaultModel: '',
    });
  });

  it('strips plaintext provider apiKey and derives apiKeyConfigured', () => {
    const parsed = unwrapEmbeddingsSettings({
      config: {
        enabled: true,
        providers: {
          [OPENAI_COMPATIBLE_PROVIDER]: {
            endpoint: 'https://api.openai.com/v1/embeddings',
            apiKey: 'sk-live-plaintext',
            models: [{ name: 'text-embedding-3-small', dimensions: 1536 }],
            defaultModel: 'text-embedding-3-small',
          },
        },
      },
    });
    const provider = parsed.config.providers[OPENAI_COMPATIBLE_PROVIDER];
    expect(provider?.apiKeyConfigured).toBe(true);
    expect(provider && 'apiKey' in provider).toBe(false);
    expect(provider?.models).toEqual([
      { name: 'text-embedding-3-small', dimensions: 1536 },
    ]);
  });

  it('migrates a legacy singular model into the catalogue', () => {
    const parsed = unwrapEmbeddingsSettings({
      config: {
        enabled: true,
        providers: {
          [OPENAI_COMPATIBLE_PROVIDER]: {
            endpoint: 'https://api.openai.com/v1/embeddings',
            apiKey: '[REDACTED]',
            model: 'text-embedding-3-small',
            dimensions: '1536',
            allowedHosts: ['api.openai.com'],
          },
        },
        security: { requireGrpcKey: true },
      },
    });
    const provider = parsed.config.providers[OPENAI_COMPATIBLE_PROVIDER];
    expect(provider).toEqual({
      endpoint: 'https://api.openai.com/v1/embeddings',
      apiKeyConfigured: true,
      models: [{ name: 'text-embedding-3-small', dimensions: 1536 }],
      defaultModel: 'text-embedding-3-small',
    });
    expect(parsed.config.security).not.toHaveProperty('requireGrpcKey');
  });

  it('returns a catalogue GET payload without plaintext keys or legacy fields', () => {
    const parsed = unwrapEmbeddingsSettings({
      config: {
        enabled: true,
        providers: {
          [OPENAI_COMPATIBLE_PROVIDER]: {
            endpoint: 'https://api.openai.com/v1/embeddings',
            apiKey: '',
            models: [{ name: 'text-embedding-3-small', dimensions: 1536 }],
            defaultModel: 'text-embedding-3-small',
          },
        },
      },
    });
    const provider = parsed.config.providers[OPENAI_COMPATIBLE_PROVIDER];
    expect(provider && 'apiKey' in provider).toBe(false);
    expect(provider && 'model' in provider).toBe(false);
    expect(provider && 'allowedHosts' in provider).toBe(false);
    expect(provider?.models).toEqual([
      { name: 'text-embedding-3-small', dimensions: 1536 },
    ]);
    expect(provider?.defaultModel).toBe('text-embedding-3-small');
  });
});
