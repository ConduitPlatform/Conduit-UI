import {
  BackfillListResponse,
  BackfillRun,
  BackfillRunState,
  isBackfillRunState,
  StartBackfillResult,
} from '@/lib/models/embeddings/backfill';
import {
  EmbeddingsCapabilitiesResponse,
  EmbeddingsQueueCounts,
  EmbeddingsStatus,
  isVectorCapabilityProvider,
  isVectorIndexMethod,
  isVectorIndexStatus,
  SchemaVectorIndexesResponse,
  VectorCapabilities,
  VectorIndexDefinition,
} from '@/lib/models/embeddings/capabilities';
import {
  EmbeddingConfig,
  isVectorSimilarity,
  UpsertEmbeddingConfigResult,
} from '@/lib/models/embeddings/config';
import {
  SemanticSearchHit,
  SemanticSearchResponse,
} from '@/lib/models/embeddings/search';
import {
  EmbeddingsConfigResponse,
  EmbeddingsProviderSettings,
  EmbeddingsQueueSettings,
  EmbeddingsSecuritySettings,
  EmbeddingsSettings,
  OPENAI_COMPATIBLE_PROVIDER,
} from '@/lib/models/embeddings/settings';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readId(value: Record<string, unknown>): string | undefined {
  return readString(value._id) ?? readString(value.id);
}

function readNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function readBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

export function parseBackfillFilter(
  value: unknown
): Record<string, unknown> | undefined {
  if (value == null || value === '') return undefined;
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value);
      return isRecord(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }
  if (isRecord(value)) return { ...value };
  return undefined;
}

export function serializeBackfillFilter(
  filter: Record<string, unknown> | string | undefined
): Record<string, unknown> | undefined {
  if (filter == null || filter === '') return undefined;
  const parsed = parseBackfillFilter(filter);
  if (!parsed) {
    throw new Error('filter must be a JSON object');
  }
  return parsed;
}

function unwrapNamedRecord(
  payload: unknown,
  key: 'config' | 'run'
): Record<string, unknown> {
  if (!isRecord(payload)) {
    throw new Error('Invalid embeddings response');
  }
  const nested = payload[key];
  if (isRecord(nested) && (readId(nested) || readString(nested.schemaName))) {
    if (
      readString(payload.schemaName) &&
      (Array.isArray(payload.sourceFields) || typeof payload.state === 'string')
    ) {
      return payload;
    }
    return nested;
  }
  return payload;
}

export function unwrapEmbeddingConfig(payload: unknown): EmbeddingConfig {
  const raw = unwrapNamedRecord(payload, 'config');
  const _id = readId(raw);
  const schemaName = readString(raw.schemaName);
  const targetField = readString(raw.targetField);
  if (!_id || !schemaName || !targetField) {
    throw new Error('Invalid embedding config response');
  }
  return {
    _id,
    schemaName,
    sourceFields: readStringArray(raw.sourceFields),
    targetField,
    provider: readString(raw.provider) ?? '',
    model: readString(raw.model) ?? readString(raw.modelName) ?? '',
    dimensions: readNumber(raw.dimensions),
    similarity: isVectorSimilarity(raw.similarity) ? raw.similarity : 'cosine',
    enabled: raw.enabled !== false,
    createdAt: readString(raw.createdAt),
    updatedAt: readString(raw.updatedAt),
  };
}

export function unwrapEmbeddingConfigList(payload: unknown): EmbeddingConfig[] {
  if (Array.isArray(payload)) {
    return payload.map(unwrapEmbeddingConfig);
  }
  if (isRecord(payload) && Array.isArray(payload.configs)) {
    return payload.configs.map(unwrapEmbeddingConfig);
  }
  if (isRecord(payload) && isRecord(payload.config)) {
    return [unwrapEmbeddingConfig(payload.config)];
  }
  return [];
}

export function unwrapUpsertEmbeddingConfig(
  payload: unknown
): UpsertEmbeddingConfigResult {
  if (!isRecord(payload)) {
    throw new Error('Invalid embedding config response');
  }
  return {
    config: unwrapEmbeddingConfig(
      isRecord(payload.config) ? payload.config : payload
    ),
    warnings: readStringArray(payload.warnings),
  };
}

export function unwrapDeletedEmbeddingConfig(
  payload: unknown
): EmbeddingConfig {
  return unwrapEmbeddingConfig(payload);
}

export function unwrapBackfillRun(payload: unknown): BackfillRun {
  const raw = unwrapNamedRecord(payload, 'run');
  const _id = readId(raw);
  const schemaName = readString(raw.schemaName);
  const state: BackfillRunState | undefined = isBackfillRunState(raw.state)
    ? raw.state
    : undefined;
  if (!_id || !schemaName || !state) {
    throw new Error('Invalid backfill response');
  }
  return {
    _id,
    schemaName,
    configId: readString(raw.configId),
    state,
    cursor: readString(raw.cursor),
    batchSize: readNumber(raw.batchSize, 100),
    onlyMissing: readBoolean(raw.onlyMissing),
    filter: parseBackfillFilter(raw.filter),
    scannedCount: readNumber(raw.scannedCount),
    queuedCount: readNumber(raw.queuedCount),
    processedCount: readNumber(raw.processedCount),
    failedCount: readNumber(raw.failedCount),
    startedAt: readString(raw.startedAt),
    finishedAt: readString(raw.finishedAt),
    drainStartedAt: readString(raw.drainStartedAt),
    error: readString(raw.error),
    createdAt: readString(raw.createdAt),
    updatedAt: readString(raw.updatedAt),
  };
}

export function unwrapBackfillList(payload: unknown): BackfillListResponse {
  if (!isRecord(payload) || !Array.isArray(payload.runs)) {
    throw new Error('Invalid backfill list response');
  }
  return {
    runs: payload.runs.map(unwrapBackfillRun),
    count: readNumber(payload.count, payload.runs.length),
  };
}

export function unwrapStartBackfill(payload: unknown): StartBackfillResult {
  if (!isRecord(payload)) {
    throw new Error('Invalid backfill start response');
  }
  const runs = Array.isArray(payload.runs)
    ? payload.runs.map(unwrapBackfillRun)
    : [];
  return {
    queued: readNumber(payload.queued, runs.length),
    runs,
    warnings: readStringArray(payload.warnings),
  };
}

export function unwrapEmbeddingsCapabilities(
  payload: unknown
): EmbeddingsCapabilitiesResponse {
  if (!isRecord(payload) || !isRecord(payload.capabilities)) {
    throw new Error('Invalid embeddings capabilities response');
  }
  return {
    capabilities: unwrapDatabaseVectorCapabilities(payload.capabilities),
    warnings: readStringArray(payload.warnings),
  };
}

export function unwrapDatabaseVectorCapabilities(
  payload: unknown
): VectorCapabilities {
  if (!isRecord(payload) || typeof payload.supported !== 'boolean') {
    throw new Error('Invalid database vector capabilities response');
  }
  return {
    supported: payload.supported,
    storage: readBoolean(payload.storage),
    indexing: readBoolean(payload.indexing),
    search: readBoolean(payload.search),
    provider: isVectorCapabilityProvider(payload.provider)
      ? payload.provider
      : 'unsupported',
    reason: readString(payload.reason),
  };
}

function unwrapQueueCounts(value: unknown): EmbeddingsQueueCounts {
  const raw = isRecord(value) ? value : {};
  return {
    waiting: readNumber(raw.waiting),
    active: readNumber(raw.active),
    completed: readNumber(raw.completed),
    failed: readNumber(raw.failed),
    delayed: readNumber(raw.delayed),
    paused: readNumber(raw.paused),
  };
}

export function unwrapEmbeddingsStatus(payload: unknown): EmbeddingsStatus {
  if (!isRecord(payload) || !isRecord(payload.capabilities)) {
    throw new Error('Invalid embeddings status response');
  }
  return {
    enabled: readBoolean(payload.enabled),
    ready: readBoolean(payload.ready),
    capabilities: unwrapDatabaseVectorCapabilities(payload.capabilities),
    generationQueue: unwrapQueueCounts(payload.generationQueue),
    backfillQueue: unwrapQueueCounts(payload.backfillQueue),
    warnings: readStringArray(payload.warnings),
  };
}

export function unwrapVectorIndexes(
  payload: unknown
): SchemaVectorIndexesResponse {
  const indexes = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.indexes)
      ? payload.indexes
      : [];
  return { indexes: indexes.map(unwrapVectorIndex) };
}

function unwrapVectorIndex(value: unknown): VectorIndexDefinition {
  if (!isRecord(value) || typeof value.field !== 'string') {
    throw new Error('Invalid vector index response');
  }
  return {
    name: readString(value.name),
    field: value.field,
    dimensions: readNumber(value.dimensions),
    similarity: isVectorSimilarity(value.similarity)
      ? value.similarity
      : 'cosine',
    method: isVectorIndexMethod(value.method) ? value.method : undefined,
    filterFields: Array.isArray(value.filterFields)
      ? readStringArray(value.filterFields)
      : undefined,
    status: isVectorIndexStatus(value.status) ? value.status : undefined,
    queryable:
      typeof value.queryable === 'boolean' ? value.queryable : undefined,
  };
}

function unwrapSearchDocument(value: unknown): Record<string, unknown> {
  if (isRecord(value)) return value;
  if (typeof value !== 'string' || value.length === 0) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function unwrapSemanticSearch(payload: unknown): SemanticSearchResponse {
  const hits = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.hits)
      ? payload.hits
      : undefined;
  if (!hits) {
    throw new Error('Invalid semantic search response');
  }
  return { hits: hits.map(unwrapSearchHit) };
}

function unwrapSearchHit(value: unknown): SemanticSearchHit {
  if (!isRecord(value) || typeof value.score !== 'number') {
    throw new Error('Invalid semantic search hit');
  }
  return {
    document: unwrapSearchDocument(value.document),
    score: value.score,
    distance: typeof value.distance === 'number' ? value.distance : undefined,
    metric: readString(value.metric),
    provider: readString(value.provider),
  };
}

function unwrapProviderSettings(value: unknown): EmbeddingsProviderSettings {
  const raw = isRecord(value) ? value : {};
  return {
    endpoint: typeof raw.endpoint === 'string' ? raw.endpoint : '',
    apiKey: typeof raw.apiKey === 'string' ? raw.apiKey : undefined,
    model: typeof raw.model === 'string' ? raw.model : '',
    allowedHosts: readStringArray(raw.allowedHosts),
  };
}

function unwrapQueueSettings(value: unknown): EmbeddingsQueueSettings {
  const raw = isRecord(value) ? value : {};
  return {
    concurrency: readNumber(raw.concurrency, 2),
    attempts: readNumber(raw.attempts, 3),
    maxBatchSize: readNumber(raw.maxBatchSize, 500),
    drainTimeoutMs: readNumber(raw.drainTimeoutMs, 15 * 60 * 1000),
  };
}

function unwrapSecuritySettings(value: unknown): EmbeddingsSecuritySettings {
  const raw = isRecord(value) ? value : {};
  return {
    requireGrpcKey: readBoolean(raw.requireGrpcKey),
    sourceFieldAllowlist: readStringArray(raw.sourceFieldAllowlist),
    maxMutationEventIds: readNumber(raw.maxMutationEventIds, 500),
    embedTimeoutMs: readNumber(raw.embedTimeoutMs, 10_000),
    maxEmbedInputBytes: readNumber(raw.maxEmbedInputBytes, 32 * 1024),
    maxEmbedResponseBytes: readNumber(raw.maxEmbedResponseBytes, 1024 * 1024),
  };
}

export function unwrapEmbeddingsSettings(
  payload: unknown
): EmbeddingsConfigResponse {
  if (!isRecord(payload)) {
    throw new Error('Invalid embeddings settings response');
  }
  const raw = isRecord(payload.config) ? payload.config : payload;
  const providersRaw = isRecord(raw.providers) ? raw.providers : {};
  const providers: Record<string, EmbeddingsProviderSettings> = {};
  for (const [name, provider] of Object.entries(providersRaw)) {
    providers[name] = unwrapProviderSettings(provider);
  }
  if (!providers[OPENAI_COMPATIBLE_PROVIDER]) {
    providers[OPENAI_COMPATIBLE_PROVIDER] = unwrapProviderSettings(undefined);
  }
  return {
    config: {
      enabled: readBoolean(raw.enabled),
      defaultProvider:
        readString(raw.defaultProvider) ?? OPENAI_COMPATIBLE_PROVIDER,
      providers,
      queue: unwrapQueueSettings(raw.queue),
      security: unwrapSecuritySettings(raw.security),
    },
  };
}
