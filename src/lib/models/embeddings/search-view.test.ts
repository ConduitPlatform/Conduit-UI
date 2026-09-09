import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { VectorIndexDefinition } from './capabilities.ts';
import type { EmbeddingConfig } from './config.ts';
import type { ReadinessRow } from './readiness.ts';
import type { SemanticSearchHit } from './search.ts';
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
  searchBlockAction,
  searchHitLabel,
  uniqueSearchSchemas,
} from './search-view.ts';

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
    assert.deepEqual(parseSearchLimit('10'), { ok: true, limit: 10 });
    assert.deepEqual(parseSearchLimit('50'), { ok: true, limit: 50 });
    assert.equal(parseSearchLimit('0').ok, false);
    assert.equal(parseSearchLimit('51').ok, false);
    assert.equal(parseSearchLimit('1.5').ok, false);
    assert.equal(clampSearchLimit(99), MAX_SEARCH_LIMIT);
    assert.equal(clampSearchLimit(0), 1);
  });
});

describe('search filter', () => {
  it('accepts empty or object filters and rejects arrays', () => {
    assert.deepEqual(parseSearchFilter(''), { ok: true, filter: undefined });
    assert.deepEqual(parseSearchFilter('{"status":"published"}'), {
      ok: true,
      filter: { status: 'published' },
    });
    assert.deepEqual(parseSearchFilter('[1]'), {
      ok: false,
      error: 'Filter must be a JSON object.',
    });
    assert.equal(parseSearchFilter('{').ok, false);
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
    assert.equal(isSearchableConfig(ready, indexes.Article), true);
    assert.equal(isSearchableConfig(pending, indexes.Article), false);
    assert.equal(
      pickInitialSearchConfig({
        configs: [pending, ready, other],
        indexesBySchema: indexes,
        configId: 'other',
      })?._id,
      'other'
    );
    assert.equal(
      pickInitialSearchConfig({
        configs: [pending, ready, other],
        indexesBySchema: indexes,
        schemaName: 'Article',
      })?._id,
      'ready'
    );
    assert.deepEqual(uniqueSearchSchemas([other, ready, pending]), [
      'Article',
      'Post',
    ]);
  });
});

describe('readiness gate', () => {
  it('blocks submit until every row is ready and returns the next action', () => {
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
    assert.equal(isSearchReady(blocked), false);
    assert.equal(searchBlockAction(blocked)?.href, '/embeddings/settings');
    assert.equal(
      isSearchReady([
        row({ id: 'provider', state: 'ready' }),
        row({ id: 'index', state: 'ready' }),
      ]),
      true
    );
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
    assert.match(formatSearchScore(0.91234), /0[.,]9123/);
    assert.match(searchHitLabel(0, hit), /Result 1/);
    assert.match(searchHitLabel(0, hit), /higher is better/);
    assert.match(searchHitLabel(0, hit), /postgres/);
    assert.deepEqual(documentColumnKeys([hit]), ['_id', 'body', 'title']);
    assert.equal(isSearchViewMode('table'), true);
    assert.equal(isSearchViewMode('grid'), false);
  });
});
