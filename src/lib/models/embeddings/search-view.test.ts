import { describe, expect, it } from 'vitest';
import type { VectorIndexDefinition } from './capabilities';
import type { EmbeddingConfig } from './config';
import type { ReadinessRow } from './readiness';
import type { SemanticSearchHit } from './search';
import {
  clampSearchLimit,
  documentColumnKeys,
  formatSearchScore,
  isSearchableConfig,
  isSearchReady,
  isSearchViewMode,
  MAX_SEARCH_LIMIT,
  parseSearchFilter,
  parseSearchLimit,
  pickInitialSearchConfig,
  sanitizeSearchDocument,
  sanitizeSearchHits,
  searchBlockAction,
  searchHitKey,
  searchHitLabel,
  uniqueSearchSchemas,
  buildSearchPageModel,
} from './search-view';

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

function row(
  partial: Partial<ReadinessRow> & {
    id: ReadinessRow['id'];
    state: ReadinessRow['state'];
  }
): ReadinessRow {
  return {
    label: partial.id,
    detail: partial.detail ?? partial.state,
    ...partial,
  };
}

describe('search limit', () => {
  it('accepts integers up to 50 and rejects out of range', () => {
    expect(parseSearchLimit('10')).toEqual({ ok: true, limit: 10 });
    expect(parseSearchLimit('50')).toEqual({ ok: true, limit: 50 });
    expect(parseSearchLimit('0').ok).toBe(false);
    expect(parseSearchLimit('51').ok).toBe(false);
    expect(parseSearchLimit('1.5').ok).toBe(false);
    expect(clampSearchLimit(99)).toBe(MAX_SEARCH_LIMIT);
    expect(clampSearchLimit(0)).toBe(1);
  });
});

describe('search filter', () => {
  it('accepts empty or object filters and rejects arrays', () => {
    expect(parseSearchFilter('')).toEqual({ ok: true, filter: undefined });
    expect(parseSearchFilter('{"status":"published"}')).toEqual({
      ok: true,
      filter: { status: 'published' },
    });
    expect(parseSearchFilter('[1]')).toEqual({
      ok: false,
      error: 'Filter must be a JSON object.',
    });
    expect(parseSearchFilter('{').ok).toBe(false);
    expect(parseSearchFilter('{"$where":"1==1"}').ok).toBe(false);
  });
});

describe('searchable configs', () => {
  it('prefers a requested id, then a ready config in the schema', () => {
    const ready = config({ _id: 'ready', schemaName: 'Article' });
    const pending = config({
      _id: 'pending',
      schemaName: 'Article',
      enabled: false,
    });
    const other = config({ _id: 'other', schemaName: 'Post' });
    const articleIndexes: VectorIndexDefinition[] = [
      {
        field: 'embedding',
        dimensions: 1536,
        similarity: 'cosine',
        status: 'ready',
        queryable: true,
      },
    ];
    const postIndexes: VectorIndexDefinition[] = [
      {
        field: 'embedding',
        dimensions: 1536,
        similarity: 'cosine',
        status: 'ready',
        queryable: true,
      },
    ];
    const indexes = {
      Article: articleIndexes,
      Post: postIndexes,
    };
    expect(isSearchableConfig(ready, indexes.Article)).toBe(true);
    expect(isSearchableConfig(pending, indexes.Article)).toBe(false);
    expect(
      pickInitialSearchConfig({
        configs: [pending, ready, other],
        indexesBySchema: indexes,
        configId: 'other',
      })?._id
    ).toBe('other');
    expect(
      pickInitialSearchConfig({
        configs: [pending, ready, other],
        indexesBySchema: indexes,
        schemaName: 'Article',
      })?._id
    ).toBe('ready');
    expect(uniqueSearchSchemas([other, ready, pending])).toEqual([
      'Article',
      'Post',
    ]);
  });
});

describe('readiness gate', () => {
  it('allows search when workers are off and the other gates are ready', () => {
    const blocked = [
      row({
        id: 'provider',
        state: 'blocked',
        href: '/embeddings/settings',
        actionLabel: 'Configure provider',
        detail: 'Set an endpoint and API key',
      }),
      row({ id: 'index', state: 'ready' }),
    ];
    expect(isSearchReady(blocked)).toBe(false);
    expect(searchBlockAction(blocked)?.href).toBe('/embeddings/settings');
    expect(
      isSearchReady([
        row({ id: 'capabilities', state: 'ready' }),
        row({ id: 'provider', state: 'ready' }),
        row({ id: 'index', state: 'ready' }),
        row({ id: 'config', state: 'ready' }),
        row({
          id: 'workers',
          state: 'blocked',
          href: '/embeddings/settings',
          actionLabel: 'Open settings',
        }),
      ])
    ).toBe(true);
  });
});

describe('hit rendering helpers', () => {
  it('formats scores, labels hits, and skips vector columns', () => {
    const hit: SemanticSearchHit = {
      document: {
        body: 'hello',
        embedding: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        _id: 'doc_1',
        title: 'One',
      },
      score: 0.91234,
      distance: 0.1,
      provider: 'postgres',
    };
    expect(formatSearchScore(0.91234)).toMatch(/0[.,]9123/);
    expect(searchHitLabel(0, hit)).toMatch(/Result 1/);
    expect(searchHitLabel(0, hit)).toMatch(/higher is better/);
    expect(searchHitLabel(0, hit)).toMatch(/postgres/);
    expect(documentColumnKeys([hit])).toEqual(['_id', 'body', 'title']);
    expect(isSearchViewMode('table')).toBe(true);
    expect(isSearchViewMode('grid')).toBe(false);
    expect(searchHitKey(hit, 0)).toBe('doc_1');
    expect(searchHitKey({ document: { title: 'No id' }, score: 0.4 }, 3)).toBe(
      'hit-3-0.4'
    );
  });

  it('builds search page summaries without full config payloads', () => {
    const ready = config({ _id: 'ready', schemaName: 'Article' });
    const pending = config({
      _id: 'pending',
      schemaName: 'Article',
      enabled: false,
    });
    const indexes = {
      Article: [
        {
          field: 'embedding',
          dimensions: 1536,
          similarity: 'cosine' as const,
          status: 'ready' as const,
          queryable: true,
        },
      ],
    };
    const model = buildSearchPageModel({
      configs: [pending, ready],
      indexesBySchema: indexes,
      workersEnabled: true,
      schemaName: 'Article',
    });
    expect(model.initialConfigId).toBe('ready');
    expect(model.schemas).toEqual(['Article']);
    expect(model.configs).toEqual([
      {
        _id: 'pending',
        schemaName: 'Article',
        targetField: 'embedding',
        sourceFields: ['title'],
        enabled: false,
      },
      {
        _id: 'ready',
        schemaName: 'Article',
        targetField: 'embedding',
        sourceFields: ['title'],
        enabled: true,
      },
    ]);
    expect(
      model.readinessByConfigId.ready?.some(row => row.id === 'index')
    ).toBe(true);
  });

  it('removes secret-like keys and prefers configured source fields', () => {
    const document = {
      _id: 'doc_1',
      title: 'One',
      password: 'secret',
      apiKey: 'sk-live',
      embedding: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      extra: 'noise',
    };
    expect(sanitizeSearchDocument(document)).toEqual({
      _id: 'doc_1',
      title: 'One',
      extra: 'noise',
    });
    expect(sanitizeSearchDocument(document, ['title'])).toEqual({
      _id: 'doc_1',
      title: 'One',
    });
    const hits = sanitizeSearchHits([{ document, score: 1 }], ['title']);
    expect(documentColumnKeys(hits, 6, ['title'])).toEqual(['_id', 'title']);
    expect(hits[0]?.document).not.toHaveProperty('password');
    expect(hits[0]?.document).not.toHaveProperty('embedding');
  });
});
