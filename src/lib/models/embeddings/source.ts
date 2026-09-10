import type { VectorSimilarity } from './config';
import type { VectorIndexStatus } from './capabilities';
import type { EmbeddingsQueueCounts } from './capabilities';
import type { EmbeddingsSettings } from './settings';
import {
  catalogueDimensionsForInput,
  listConfiguredProviders,
  resolveRequestedCatalogueDimensions,
} from './config-catalogue';

export const EMBEDDING_SOURCE_KINDS = ['conduit-storage', 'external'] as const;
export type EmbeddingSourceKind = (typeof EMBEDDING_SOURCE_KINDS)[number];

export const EMBEDDING_SOURCE_STATES = [
  'pending',
  'ready',
  'disabled',
  'revoked',
  'failed',
] as const;
export type EmbeddingSourceState = (typeof EMBEDDING_SOURCE_STATES)[number];

export const AUTOMATIC_STORAGE_MIME_TYPES = [
  'text/plain',
  'text/markdown',
  'application/json',
  'text/csv',
  'application/pdf',
] as const;
export type AutomaticStorageMimeType =
  (typeof AUTOMATIC_STORAGE_MIME_TYPES)[number];

export const PARTITION_SUBJECT_PATTERN =
  /^[A-Za-z][A-Za-z0-9_]*:[A-Za-z0-9._:-]{1,128}$/;

export const GENERIC_SEARCH_SAFE_FIELDS = [
  'sourceId',
  'documentId',
  'externalDocumentId',
  'chunkKey',
  'ordinal',
  'mimeType',
  'storageFileId',
  'connectorReference',
  'metadata',
] as const;

export type StorageSourceSelectors = {
  container: string;
  folderPrefix?: string;
  mimeTypes?: AutomaticStorageMimeType[];
};

export type EmbeddingSource = {
  _id: string;
  label?: string;
  kind: EmbeddingSourceKind;
  state: EmbeddingSourceState;
  partitionSubject: string;
  provider: string;
  model: string;
  dimensions: number;
  similarity: VectorSimilarity;
  selectors?: Record<string, unknown>;
  metadataAllowlist: string[];
  syncCheckpoint?: Record<string, unknown>;
  chunkSchemaName?: string;
  chunkIndexName?: string;
  chunkIndexStatus?: VectorIndexStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type EmbeddingSourceCreateInput = {
  label?: string;
  kind: EmbeddingSourceKind;
  partitionSubject: string;
  provider?: string;
  model?: string;
  dimensions?: number;
  similarity?: VectorSimilarity;
  selectors?: Record<string, unknown>;
  metadataAllowlist?: string[];
};

export type EmbeddingSourceUpdateInput = {
  label?: string;
  selectors?: Record<string, unknown>;
  metadataAllowlist?: string[];
};

export type UpsertEmbeddingSourceResult = {
  source: EmbeddingSource;
  warnings: string[];
};

export type EmbeddingSourceListResponse = {
  sources: EmbeddingSource[];
  count: number;
};

export type EmbeddingSourceDocumentCounts = {
  pendingCount: number;
  queuedCount: number;
  extractingCount: number;
  indexedCount: number;
  skippedCount: number;
  failedCount: number;
  staleCount: number;
  deletedCount: number;
};

export type EmbeddingSourceStatus = EmbeddingSourceDocumentCounts & {
  source: EmbeddingSource;
  ready: boolean;
  extractionQueue?: EmbeddingsQueueCounts;
  warnings: string[];
};

export type ReconcileSourceResult = {
  queued: number;
  scanned: number;
  warnings: string[];
};

export type PurgeSourceResult = {
  source: EmbeddingSource;
  deletedDocuments: number;
  deletedChunks: number;
};

export type StorageExtractionLimits = {
  maxFileBytes: number;
  maxExtractedBytes: number;
  maxPdfPages: number;
  extractTimeoutMs: number;
  maxChunksPerFile: number;
  chunkOverlapBytes: number;
  maxChunkBytes: number;
  queueConcurrency: number;
  queueAttempts: number;
};

export const DEFAULT_STORAGE_EXTRACTION_LIMITS: StorageExtractionLimits = {
  maxFileBytes: 8 * 1024 * 1024,
  maxExtractedBytes: 2 * 1024 * 1024,
  maxPdfPages: 50,
  extractTimeoutMs: 15_000,
  maxChunksPerFile: 256,
  chunkOverlapBytes: 256,
  maxChunkBytes: 32 * 1024,
  queueConcurrency: 1,
  queueAttempts: 5,
};

export function isEmbeddingSourceKind(
  value: unknown
): value is EmbeddingSourceKind {
  return (
    typeof value === 'string' &&
    (EMBEDDING_SOURCE_KINDS as readonly string[]).includes(value)
  );
}

export function isEmbeddingSourceState(
  value: unknown
): value is EmbeddingSourceState {
  return (
    typeof value === 'string' &&
    (EMBEDDING_SOURCE_STATES as readonly string[]).includes(value)
  );
}

export function isAutomaticStorageMimeType(
  value: unknown
): value is AutomaticStorageMimeType {
  return (
    typeof value === 'string' &&
    (AUTOMATIC_STORAGE_MIME_TYPES as readonly string[]).includes(value)
  );
}

export function sourceKindLabel(kind: EmbeddingSourceKind): string {
  switch (kind) {
    case 'conduit-storage':
      return 'Conduit Storage';
    case 'external':
      return 'External / custom';
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

export function sourceStateLabel(state: EmbeddingSourceState): string {
  switch (state) {
    case 'pending':
      return 'Pending';
    case 'ready':
      return 'Ready';
    case 'disabled':
      return 'Disabled';
    case 'revoked':
      return 'Revoked';
    case 'failed':
      return 'Failed';
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}

export function sourceDisplayName(source: EmbeddingSource): string {
  const label = source.label?.trim();
  if (label) return label;
  return source._id;
}

export function isPartitionSubject(value: string): boolean {
  return PARTITION_SUBJECT_PATTERN.test(value.trim());
}

export function teamPartitionSubject(teamId: string): string {
  return `Team:${teamId}`;
}

export function parseTeamPartitionSubject(value: string): string | undefined {
  const match = /^Team:(.+)$/.exec(value.trim());
  return match?.[1];
}

export function parseStorageSelectors(
  raw: unknown
): StorageSourceSelectors | undefined {
  const record =
    typeof raw === 'string'
      ? parseJsonRecord(raw)
      : isRecord(raw)
        ? raw
        : undefined;
  if (!record) return undefined;
  const container =
    typeof record.container === 'string' ? record.container.trim() : '';
  if (!container) return undefined;
  const folderPrefix = normalizeFolderPrefix(
    typeof record.folderPrefix === 'string' ? record.folderPrefix : undefined
  );
  const mimeTypes = parseMimeTypesForDisplay(record.mimeTypes);
  return {
    container,
    ...(folderPrefix ? { folderPrefix } : {}),
    ...(mimeTypes ? { mimeTypes } : {}),
  };
}

export function normalizeFolderPrefix(
  value: string | undefined
): string | undefined {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return undefined;
  const withoutLeading = trimmed.replace(/^\/+/, '');
  if (!withoutLeading) return undefined;
  return withoutLeading.endsWith('/') ? withoutLeading : `${withoutLeading}/`;
}

function uniqueLowercaseStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value
        .filter((item): item is string => typeof item === 'string')
        .map(item => item.trim().toLowerCase())
    ),
  ];
}

export function parseMimeTypesForDisplay(
  value: unknown
): AutomaticStorageMimeType[] | undefined {
  const mimeTypes = uniqueLowercaseStrings(value).filter(
    isAutomaticStorageMimeType
  );
  return mimeTypes.length > 0 ? mimeTypes : undefined;
}

export function normalizeMimeAllowlist(
  value: unknown
): AutomaticStorageMimeType[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const mimeTypes = uniqueLowercaseStrings(value);
  if (!mimeTypes.every(isAutomaticStorageMimeType)) {
    throw new Error(mimeAllowlistErrorMessage());
  }
  return mimeTypes;
}

export function mimeAllowlistErrorMessage(): string {
  return `MIME types must be a subset of ${AUTOMATIC_STORAGE_MIME_TYPES.join(', ')}.`;
}

export function validateStorageSelectors(
  selectors: Record<string, unknown> | undefined
): StorageSourceSelectors {
  const record = isRecord(selectors) ? selectors : undefined;
  const container =
    typeof record?.container === 'string' ? record.container.trim() : '';
  if (!container) {
    throw new Error('Storage sources require a container.');
  }
  const folderPrefix = normalizeFolderPrefix(
    typeof record?.folderPrefix === 'string' ? record.folderPrefix : undefined
  );
  const mimeTypes = normalizeMimeAllowlist(record?.mimeTypes);
  return {
    container,
    ...(folderPrefix ? { folderPrefix } : {}),
    ...(mimeTypes ? { mimeTypes } : {}),
  };
}

export function validatePartitionSubject(value: string): string {
  const partition = value.trim();
  if (!isPartitionSubject(partition)) {
    throw new Error('Access scope must be a resource such as Team:id.');
  }
  return partition;
}

export function validateMetadataAllowlist(value: unknown): string[] {
  if (value == null) return [];
  if (!Array.isArray(value)) {
    throw new Error('Metadata allowlist must be a list of field names.');
  }
  return [
    ...new Set(
      value
        .filter((item): item is string => typeof item === 'string')
        .map(item => item.trim())
        .filter(Boolean)
    ),
  ];
}

export function isSourceSearchable(source: EmbeddingSource): boolean {
  return source.state === 'ready' && source.chunkIndexStatus === 'ready';
}

export function enableSourceFeedback(result: {
  source: Pick<EmbeddingSource, 'state'>;
  warnings: string[];
}): { title: string; description?: string; variant?: 'destructive' } {
  const warnings = result.warnings
    .map(warning => warning.trim())
    .filter(Boolean);
  const { state } = result.source;
  if (state === 'ready' && warnings.length === 0) {
    return { title: 'Source enabled' };
  }
  const description = [
    ...warnings,
    state === 'ready' ? undefined : `Source is ${state}.`,
  ]
    .filter((part): part is string => Boolean(part))
    .join(' ');
  if (state === 'failed') {
    return {
      title: 'Source not ready',
      ...(description ? { description } : {}),
      variant: 'destructive',
    };
  }
  return {
    title:
      warnings.length > 0
        ? 'Enable finished with warnings'
        : 'Source not ready',
    ...(description ? { description } : {}),
  };
}

export function canDisableEmbeddingSource(
  state: EmbeddingSourceState
): boolean {
  return state === 'ready';
}

export function canEnableEmbeddingSource(state: EmbeddingSourceState): boolean {
  return state === 'disabled';
}

export function canRevokeEmbeddingSource(state: EmbeddingSourceState): boolean {
  return state !== 'revoked';
}

export function canReconcileEmbeddingSource(source: EmbeddingSource): boolean {
  return source.kind === 'conduit-storage' && source.state === 'ready';
}

export function sourceIndexStateLabel(
  state: ReturnType<typeof sourceIndexState>
): string {
  switch (state) {
    case 'ready':
      return 'Ready';
    case 'pending':
      return 'Pending';
    case 'failed':
      return 'Failed';
    case 'unknown':
      return 'Unknown';
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}

export function sourceIndexState(
  source: EmbeddingSource
): 'ready' | 'pending' | 'failed' | 'unknown' {
  if (source.state === 'failed' || source.chunkIndexStatus === 'failed') {
    return 'failed';
  }
  if (source.chunkIndexStatus === 'ready' && source.state === 'ready') {
    return 'ready';
  }
  if (source.state === 'pending' || source.chunkIndexStatus === 'pending') {
    return 'pending';
  }
  return 'unknown';
}

export function storageExtractionLimitsFromSettings(
  settings?: EmbeddingsSettings | null
): StorageExtractionLimits {
  const extraction = settings?.storageExtraction;
  const security = settings?.security;
  return {
    maxFileBytes:
      extraction?.maxFileBytes ??
      DEFAULT_STORAGE_EXTRACTION_LIMITS.maxFileBytes,
    maxExtractedBytes:
      extraction?.maxExtractedBytes ??
      DEFAULT_STORAGE_EXTRACTION_LIMITS.maxExtractedBytes,
    maxPdfPages:
      extraction?.maxPdfPages ?? DEFAULT_STORAGE_EXTRACTION_LIMITS.maxPdfPages,
    extractTimeoutMs:
      extraction?.extractTimeoutMs ??
      DEFAULT_STORAGE_EXTRACTION_LIMITS.extractTimeoutMs,
    maxChunksPerFile:
      extraction?.maxChunksPerFile ??
      security?.maxChunksPerDocument ??
      DEFAULT_STORAGE_EXTRACTION_LIMITS.maxChunksPerFile,
    chunkOverlapBytes:
      extraction?.chunkOverlapBytes ??
      DEFAULT_STORAGE_EXTRACTION_LIMITS.chunkOverlapBytes,
    maxChunkBytes:
      security?.maxChunkTextBytes ??
      security?.maxEmbedInputBytes ??
      DEFAULT_STORAGE_EXTRACTION_LIMITS.maxChunkBytes,
    queueConcurrency:
      extraction?.queueConcurrency ??
      DEFAULT_STORAGE_EXTRACTION_LIMITS.queueConcurrency,
    queueAttempts:
      extraction?.queueAttempts ??
      DEFAULT_STORAGE_EXTRACTION_LIMITS.queueAttempts,
  };
}

export function formatByteLimit(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    const mib = bytes / (1024 * 1024);
    return Number.isInteger(mib) ? `${mib} MiB` : `${mib.toFixed(1)} MiB`;
  }
  if (bytes >= 1024) {
    const kib = bytes / 1024;
    return Number.isInteger(kib) ? `${kib} KiB` : `${kib.toFixed(1)} KiB`;
  }
  return `${bytes} B`;
}

export function storageLimitExplanations(
  limits: StorageExtractionLimits
): { label: string; detail: string }[] {
  return [
    {
      label: 'File size',
      detail: `Automatic extraction reads at most ${formatByteLimit(limits.maxFileBytes)} per file.`,
    },
    {
      label: 'Extracted text',
      detail: `Extracted UTF-8 is capped at ${formatByteLimit(limits.maxExtractedBytes)}.`,
    },
    {
      label: 'PDF pages',
      detail: `PDFs are parsed up to ${limits.maxPdfPages} pages.`,
    },
    {
      label: 'Chunks',
      detail: `Each file yields at most ${limits.maxChunksPerFile} chunks of ${formatByteLimit(limits.maxChunkBytes)}, with ${formatByteLimit(limits.chunkOverlapBytes)} overlap.`,
    },
    {
      label: 'Retries',
      detail: `Extraction jobs retry up to ${limits.queueAttempts} times.`,
    },
  ];
}

export type ExternalIngestGuidance = {
  restCreatePath: string;
  restDeletePath: string;
  grpcSync: string;
  grpcDelete: string;
  notes: string[];
};

export function externalIngestGuidance(
  sourceId: string
): ExternalIngestGuidance {
  return {
    restCreatePath: `POST /embeddings/sources/${sourceId}/documents`,
    restDeletePath: `DELETE /embeddings/sources/${sourceId}/documents/{externalDocumentId}`,
    grpcSync: 'syncDocument',
    grpcDelete: 'deleteDocument',
    notes: [
      'Trusted Admin API or gRPC only. Do not ingest from the browser.',
      'Each chunk accepts either text or a finite vector matching this source’s dimensions, not both.',
      'Text is embedded then discarded. Vectors, hashes, and source text are never returned from search.',
      'Idempotency is source + externalDocumentId + content version + chunk key.',
    ],
  };
}

export function storageSelectorSummary(
  selectors?: Record<string, unknown>
): string {
  const parsed = parseStorageSelectors(selectors);
  if (!parsed) return '—';
  const folder = parsed.folderPrefix ? ` / ${parsed.folderPrefix}` : '';
  const mime =
    parsed.mimeTypes && parsed.mimeTypes.length > 0
      ? ` · ${parsed.mimeTypes.length} MIME`
      : '';
  return `${parsed.container}${folder}${mime}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJsonRecord(value: string): Record<string, unknown> | undefined {
  try {
    const parsed: unknown = JSON.parse(value);
    return isRecord(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function validateEmbeddingSourceInput(
  data: EmbeddingSourceCreateInput,
  settings: EmbeddingsSettings
): EmbeddingSourceCreateInput {
  const kind = data.kind;
  if (!isEmbeddingSourceKind(kind)) {
    throw new Error('Source type is required.');
  }
  const partitionSubject = validatePartitionSubject(data.partitionSubject);
  const providers = listConfiguredProviders(settings);
  const model = catalogueDimensionsForInput(
    { provider: data.provider, model: data.model },
    providers
  );
  const dimensions = resolveRequestedCatalogueDimensions(
    model,
    data.dimensions
  );
  const selectors =
    kind === 'conduit-storage'
      ? validateStorageSelectors(data.selectors)
      : undefined;
  if (
    kind === 'external' &&
    data.selectors &&
    Object.keys(data.selectors).length
  ) {
    throw new Error('External sources do not use storage selectors.');
  }
  return {
    label: data.label?.trim() || undefined,
    kind,
    partitionSubject,
    provider: data.provider?.trim(),
    model: data.model?.trim(),
    dimensions,
    similarity: data.similarity,
    ...(selectors ? { selectors } : {}),
    metadataAllowlist: validateMetadataAllowlist(data.metadataAllowlist),
  };
}

export function validateEmbeddingSourceUpdate(
  data: EmbeddingSourceUpdateInput,
  kind: EmbeddingSourceKind
): EmbeddingSourceUpdateInput {
  const patch: EmbeddingSourceUpdateInput = {};
  if (data.label !== undefined) patch.label = data.label.trim();
  if (data.selectors !== undefined) {
    if (kind !== 'conduit-storage') {
      throw new Error('External sources do not use storage selectors.');
    }
    patch.selectors = validateStorageSelectors(data.selectors);
  }
  if (data.metadataAllowlist !== undefined) {
    patch.metadataAllowlist = validateMetadataAllowlist(data.metadataAllowlist);
  }
  return patch;
}
