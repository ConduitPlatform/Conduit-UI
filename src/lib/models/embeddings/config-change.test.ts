import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  diffMaterialEmbeddingConfig,
  isInPlaceDimensionChange,
  requiresIndexRecreation,
} from './config-change.ts';

const base = {
  provider: 'openai-compatible',
  model: 'text-embedding-3-small',
  dimensions: 1536,
  sourceFields: ['title', 'body'],
  targetField: 'embedding',
  similarity: 'cosine',
};

describe('material embedding config changes', () => {
  it('treats source field order as equivalent', () => {
    assert.deepEqual(
      diffMaterialEmbeddingConfig(base, {
        ...base,
        sourceFields: ['body', 'title'],
      }),
      []
    );
  });

  it('detects provider, model, source, target, similarity, and dimension edits', () => {
    assert.deepEqual(
      diffMaterialEmbeddingConfig(base, {
        provider: 'other',
        model: 'text-embedding-3-large',
        dimensions: 768,
        sourceFields: ['title'],
        targetField: 'vector',
        similarity: 'euclidean',
      }),
      [
        'provider',
        'model',
        'dimensions',
        'sourceFields',
        'targetField',
        'similarity',
      ]
    );
  });

  it('requires index recreation only for dimensions, target, and similarity', () => {
    assert.equal(requiresIndexRecreation(['sourceFields', 'provider']), false);
    assert.equal(requiresIndexRecreation(['dimensions']), true);
    assert.equal(requiresIndexRecreation(['targetField']), true);
    assert.equal(requiresIndexRecreation(['similarity']), true);
  });

  it('flags in-place dimension changes on the same target field', () => {
    assert.equal(
      isInPlaceDimensionChange(base, { ...base, dimensions: 768 }),
      true
    );
    assert.equal(
      isInPlaceDimensionChange(base, {
        ...base,
        dimensions: 768,
        targetField: 'vector',
      }),
      false
    );
  });
});
