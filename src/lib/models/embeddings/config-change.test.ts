import { describe, expect, it } from 'vitest';
import {
  diffMaterialEmbeddingConfig,
  isInPlaceDimensionChange,
  requiresIndexRecreation,
} from './config-change';

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
    expect(
      diffMaterialEmbeddingConfig(base, {
        ...base,
        sourceFields: ['body', 'title'],
      })
    ).toEqual([]);
  });

  it('detects provider, model, source, target, similarity, and dimension edits', () => {
    expect(
      diffMaterialEmbeddingConfig(base, {
        provider: 'other',
        model: 'text-embedding-3-large',
        dimensions: 768,
        sourceFields: ['title'],
        targetField: 'vector',
        similarity: 'euclidean',
      })
    ).toEqual([
      'provider',
      'model',
      'dimensions',
      'sourceFields',
      'targetField',
      'similarity',
    ]);
  });

  it('requires index recreation only for dimensions, target, and similarity', () => {
    expect(requiresIndexRecreation(['sourceFields', 'provider'])).toBe(false);
    expect(requiresIndexRecreation(['dimensions'])).toBe(true);
    expect(requiresIndexRecreation(['targetField'])).toBe(true);
    expect(requiresIndexRecreation(['similarity'])).toBe(true);
  });

  it('flags in-place dimension changes on the same target field', () => {
    expect(isInPlaceDimensionChange(base, { ...base, dimensions: 768 })).toBe(
      true
    );
    expect(
      isInPlaceDimensionChange(base, {
        ...base,
        dimensions: 768,
        targetField: 'vector',
      })
    ).toBe(false);
  });
});
