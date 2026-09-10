import { describe, expect, it } from 'vitest';
import { AUTOMATIC_STORAGE_MIME_TYPES } from '@/lib/models/embeddings/source';
import {
  defaultSourceFormValues,
  embeddingSourceFormSchema,
  parseMetadataAllowlistInput,
  sourceFormToInput,
  toSourceFormValues,
} from './schema';
import type { EmbeddingSource } from '@/lib/models/embeddings/source';

const storageSource: EmbeddingSource = {
  _id: 'src_storage',
  label: 'Invoices',
  kind: 'conduit-storage',
  state: 'ready',
  partitionSubject: 'Team:acme',
  provider: 'openai-compatible',
  model: 'text-embedding-3-small',
  dimensions: 1536,
  similarity: 'cosine',
  selectors: {
    container: 'docs',
    folderPrefix: 'invoices/',
    mimeTypes: ['application/pdf'],
  },
  metadataAllowlist: ['tag'],
  chunkIndexStatus: 'ready',
};

describe('source form mapping', () => {
  it('maps a storage source and omits full MIME allowlist on create', () => {
    const values = toSourceFormValues(storageSource);
    expect(values.container).toBe('docs');
    expect(values.folderPrefix).toBe('invoices/');
    expect(values.mimeTypes).toEqual(['application/pdf']);
    expect(values.metadataAllowlist).toBe('tag');
    expect(sourceFormToInput(values)).toMatchObject({
      kind: 'conduit-storage',
      selectors: {
        container: 'docs',
        folderPrefix: 'invoices/',
        mimeTypes: ['application/pdf'],
      },
    });
    const allMimes = defaultSourceFormValues({
      kind: 'conduit-storage',
      provider: 'openai-compatible',
      model: 'text-embedding-3-small',
      dimensions: 1536,
    });
    allMimes.partitionSubject = 'Team:acme';
    allMimes.container = 'docs';
    expect(sourceFormToInput(allMimes).selectors).toEqual({
      container: 'docs',
    });
    expect(
      sourceFormToInput({
        ...values,
        folderPrefix: 'invoices',
      }).selectors
    ).toMatchObject({ folderPrefix: 'invoices/' });
    expect(AUTOMATIC_STORAGE_MIME_TYPES).toHaveLength(5);
  });

  it('rejects storage create without a container and unknown MIME types', () => {
    const parsed = embeddingSourceFormSchema.safeParse({
      ...defaultSourceFormValues({
        kind: 'conduit-storage',
        provider: 'openai-compatible',
        model: 'text-embedding-3-small',
        dimensions: 1536,
      }),
      partitionSubject: 'Team:acme',
      container: '',
    });
    expect(parsed.success).toBe(false);
    expect(parseMetadataAllowlistInput('tag\nauthor, tag')).toEqual([
      'tag',
      'author',
    ]);
  });

  it('keeps external sources free of storage selectors', () => {
    const values = toSourceFormValues({
      ...storageSource,
      _id: 'src_ext',
      kind: 'external',
      selectors: undefined,
    });
    expect(sourceFormToInput(values).selectors).toBeUndefined();
  });
});
