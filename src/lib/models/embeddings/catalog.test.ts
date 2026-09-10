import { describe, expect, it } from 'vitest';
import {
  catalogRowIndex,
  catalogRowProfile,
  catalogRowStatus,
  catalogRowTarget,
  catalogRowTypeLabel,
  schemaCatalogRow,
  sourceCatalogRow,
} from './catalog';
import type { EmbeddingConfigListRow } from './index-state';
import type { EmbeddingSource } from './source';

const schemaRow: EmbeddingConfigListRow = {
  config: {
    _id: 'cfg_1',
    schemaName: 'Product',
    sourceFields: ['title'],
    targetField: 'embedding',
    provider: 'openai-compatible',
    model: 'text-embedding-3-small',
    dimensions: 1536,
    similarity: 'cosine',
    enabled: true,
  },
  indexState: 'ready',
  modelBlocked: false,
};

const storage: EmbeddingSource = {
  _id: 'src_storage',
  label: 'Invoices',
  kind: 'conduit-storage',
  state: 'ready',
  partitionSubject: 'Team:acme',
  provider: 'openai-compatible',
  model: 'text-embedding-3-small',
  dimensions: 1536,
  similarity: 'cosine',
  selectors: { container: 'docs', folderPrefix: 'invoices' },
  metadataAllowlist: ['tag'],
  chunkIndexStatus: 'ready',
};

describe('embedding catalog rows', () => {
  it('keeps schema and generic sources on separate row shapes', () => {
    const schema = schemaCatalogRow(schemaRow);
    const source = sourceCatalogRow(storage);
    expect(catalogRowTypeLabel(schema)).toBe('Database schema');
    expect(catalogRowTypeLabel(source)).toBe('Conduit Storage');
    expect(catalogRowStatus(schema)).toBe('Enabled');
    expect(catalogRowStatus(source)).toBe('Ready');
    expect(catalogRowIndex(schema)).toBe('ready');
    expect(catalogRowIndex(source)).toBe('ready');
    expect(catalogRowTarget(schema)).toBe('embedding');
    expect(catalogRowTarget(source)).toBe('docs / invoices/');
    expect(catalogRowProfile(source)).toBe(
      'openai-compatible/text-embedding-3-small'
    );
    expect(schema.href).toBe('/embeddings/configs/cfg_1');
    expect(source.href).toBe('/embeddings/sources/src_storage');
  });
});
