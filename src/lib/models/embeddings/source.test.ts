import { describe, expect, it } from 'vitest';
import {
  AUTOMATIC_STORAGE_MIME_TYPES,
  DEFAULT_STORAGE_EXTRACTION_LIMITS,
  externalIngestGuidance,
  formatByteLimit,
  isEmbeddingSourceKind,
  isPartitionSubject,
  mimeAllowlistErrorMessage,
  normalizeFolderPrefix,
  normalizeMimeAllowlist,
  parseMimeTypesForDisplay,
  parseStorageSelectors,
  canDisableEmbeddingSource,
  canEnableEmbeddingSource,
  canReconcileEmbeddingSource,
  canRevokeEmbeddingSource,
  enableSourceFeedback,
  isSourceSearchable,
  validateEmbeddingSourceUpdate,
  parseTeamPartitionSubject,
  sourceDisplayName,
  sourceIndexState,
  sourceKindLabel,
  storageExtractionLimitsFromSettings,
  storageLimitExplanations,
  storageSelectorSummary,
  teamPartitionSubject,
  validateMetadataAllowlist,
  validatePartitionSubject,
  validateStorageSelectors,
  type EmbeddingSource,
} from './source';
import { OPENAI_COMPATIBLE_PROVIDER } from './settings';

function source(
  partial: Partial<EmbeddingSource> & Pick<EmbeddingSource, '_id' | 'kind'>
): EmbeddingSource {
  return {
    state: 'ready',
    partitionSubject: 'Team:org',
    provider: OPENAI_COMPATIBLE_PROVIDER,
    model: 'text-embedding-3-small',
    dimensions: 1536,
    similarity: 'cosine',
    metadataAllowlist: [],
    ...partial,
  };
}

describe('source kinds and labels', () => {
  it('labels user-facing source types without hybrid language', () => {
    expect(isEmbeddingSourceKind('conduit-storage')).toBe(true);
    expect(isEmbeddingSourceKind('database')).toBe(false);
    expect(sourceKindLabel('conduit-storage')).toBe('Conduit Storage');
    expect(sourceKindLabel('external')).toBe('External / custom');
  });

  it('prefers a label and falls back to id', () => {
    expect(sourceDisplayName(source({ _id: 'src_1', kind: 'external' }))).toBe(
      'src_1'
    );
    expect(
      sourceDisplayName(
        source({ _id: 'src_1', kind: 'external', label: ' Invoices ' })
      )
    ).toBe('Invoices');
  });
});

describe('partition subjects', () => {
  it('accepts Team resource references', () => {
    expect(isPartitionSubject('Team:org')).toBe(true);
    expect(teamPartitionSubject('acme')).toBe('Team:acme');
    expect(parseTeamPartitionSubject('Team:acme')).toBe('acme');
    expect(validatePartitionSubject(' Team:org ')).toBe('Team:org');
    expect(() => validatePartitionSubject('org')).toThrow(
      'Access scope must be a resource such as Team:id.'
    );
  });
});

describe('storage selectors and MIME allowlist', () => {
  it('requires a container and accepts optional folder prefix', () => {
    expect(
      parseStorageSelectors({
        container: ' docs ',
        folderPrefix: ' invoices/ ',
      })
    ).toEqual({ container: 'docs', folderPrefix: 'invoices/' });
    expect(() => validateStorageSelectors({})).toThrow(
      'Storage sources require a container.'
    );
  });

  it('parses JSON selectors and rejects unknown MIME types', () => {
    expect(
      parseStorageSelectors(
        JSON.stringify({
          container: 'docs',
          mimeTypes: ['text/plain', 'application/pdf'],
        })
      )
    ).toEqual({
      container: 'docs',
      mimeTypes: ['text/plain', 'application/pdf'],
    });
    expect(() => normalizeMimeAllowlist(['application/zip'])).toThrow(
      mimeAllowlistErrorMessage()
    );
    expect(
      parseStorageSelectors({
        container: 'docs',
        mimeTypes: ['application/zip', 'text/plain'],
      })
    ).toEqual({ container: 'docs', mimeTypes: ['text/plain'] });
    expect(parseMimeTypesForDisplay(['application/zip'])).toBeUndefined();
    expect(normalizeFolderPrefix('invoices')).toBe('invoices/');
    expect(normalizeFolderPrefix('/invoices/2024')).toBe('invoices/2024/');
    expect(normalizeMimeAllowlist([...AUTOMATIC_STORAGE_MIME_TYPES])).toEqual([
      ...AUTOMATIC_STORAGE_MIME_TYPES,
    ]);
    expect(storageSelectorSummary({ container: 'docs' })).toBe('docs');
  });

  it('rejects selectors on external updates and keeps storage updates strict', () => {
    expect(() =>
      validateEmbeddingSourceUpdate(
        { selectors: { container: 'docs' } },
        'external'
      )
    ).toThrow('External sources do not use storage selectors.');
    expect(
      validateEmbeddingSourceUpdate(
        { selectors: { container: 'docs', folderPrefix: 'invoices' } },
        'conduit-storage'
      ).selectors
    ).toEqual({ container: 'docs', folderPrefix: 'invoices/' });
  });
});

describe('metadata allowlist and index state', () => {
  it('dedupes allowlisted fields', () => {
    expect(validateMetadataAllowlist([' tag ', 'tag', 'author', ''])).toEqual([
      'tag',
      'author',
    ]);
  });

  it('maps source lifecycle to index state', () => {
    expect(
      sourceIndexState(source({ _id: 's', kind: 'external', state: 'ready' }))
    ).toBe('unknown');
    expect(
      sourceIndexState(
        source({
          _id: 's',
          kind: 'external',
          state: 'ready',
          chunkIndexStatus: 'ready',
        })
      )
    ).toBe('ready');
    expect(
      sourceIndexState(source({ _id: 's', kind: 'external', state: 'failed' }))
    ).toBe('failed');
    expect(
      isSourceSearchable(
        source({
          _id: 's',
          kind: 'external',
          state: 'ready',
          chunkIndexStatus: 'ready',
        })
      )
    ).toBe(true);
    expect(
      isSourceSearchable(
        source({
          _id: 's',
          kind: 'external',
          state: 'ready',
          chunkIndexStatus: 'pending',
        })
      )
    ).toBe(false);
    expect(
      isSourceSearchable(
        source({ _id: 's', kind: 'external', state: 'disabled' })
      )
    ).toBe(false);
    expect(
      isSourceSearchable(source({ _id: 's', kind: 'external', state: 'ready' }))
    ).toBe(false);
    expect(canDisableEmbeddingSource('ready')).toBe(true);
    expect(canDisableEmbeddingSource('pending')).toBe(false);
    expect(canEnableEmbeddingSource('disabled')).toBe(true);
    expect(canEnableEmbeddingSource('revoked')).toBe(false);
    expect(canEnableEmbeddingSource('failed')).toBe(false);
    expect(canRevokeEmbeddingSource('ready')).toBe(true);
    expect(canRevokeEmbeddingSource('revoked')).toBe(false);
    expect(
      canReconcileEmbeddingSource(
        source({ _id: 's', kind: 'conduit-storage', state: 'ready' })
      )
    ).toBe(true);
    expect(
      canReconcileEmbeddingSource(
        source({ _id: 's', kind: 'external', state: 'ready' })
      )
    ).toBe(false);
  });

  it('does not toast enable success when the source stays pending or failed', () => {
    expect(
      enableSourceFeedback({
        source: { state: 'ready' },
        warnings: [],
      })
    ).toEqual({ title: 'Source enabled' });
    expect(
      enableSourceFeedback({
        source: { state: 'pending' },
        warnings: ['Storage authorization is not configured.'],
      })
    ).toEqual({
      title: 'Enable finished with warnings',
      description:
        'Storage authorization is not configured. Source is pending.',
    });
    expect(
      enableSourceFeedback({
        source: { state: 'failed' },
        warnings: ['Chunk vector index is not queryable yet'],
      }).title
    ).toBe('Source not ready');
  });
});

describe('extraction limits and ingest guidance', () => {
  it('uses backend-exposed limits when present', () => {
    const limits = storageExtractionLimitsFromSettings({
      enabled: true,
      defaultProvider: OPENAI_COMPATIBLE_PROVIDER,
      providers: {},
      queue: {
        concurrency: 2,
        attempts: 3,
        maxBatchSize: 500,
        drainTimeoutMs: 1,
      },
      security: {
        sourceFieldAllowlist: [],
        maxMutationEventIds: 1,
        embedTimeoutMs: 1,
        maxEmbedInputBytes: 4096,
        maxEmbedResponseBytes: 1,
        maxChunkTextBytes: 2048,
        maxChunksPerDocument: 12,
      },
      storageExtraction: {
        maxFileBytes: 1024,
        maxPdfPages: 3,
        queueAttempts: 2,
      },
    });
    expect(limits.maxFileBytes).toBe(1024);
    expect(limits.maxPdfPages).toBe(3);
    expect(limits.maxChunkBytes).toBe(2048);
    expect(limits.maxChunksPerFile).toBe(12);
    expect(limits.queueAttempts).toBe(2);
    expect(
      formatByteLimit(DEFAULT_STORAGE_EXTRACTION_LIMITS.maxFileBytes)
    ).toBe('8 MiB');
    expect(storageLimitExplanations(limits)[0]?.label).toBe('File size');
  });

  it('describes trusted API and gRPC ingest without browser upload', () => {
    const guidance = externalIngestGuidance('src_ext');
    expect(guidance.restCreatePath).toBe(
      'POST /embeddings/sources/src_ext/documents'
    );
    expect(guidance.grpcSync).toBe('syncDocument');
    expect(guidance.notes.join(' ')).toMatch(/not both/i);
    expect(guidance.notes.join(' ')).not.toMatch(/OneDrive|BM25|hybrid/i);
    expect(
      guidance.notes.some(note => /Do not ingest from the browser/.test(note))
    ).toBe(true);
  });
});
