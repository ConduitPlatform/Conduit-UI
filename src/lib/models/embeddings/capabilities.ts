import { VectorSimilarity } from '@/lib/models/embeddings/config';

export const VECTOR_INDEX_STATUSES = ['pending', 'ready', 'failed'] as const;

export type VectorIndexStatus = (typeof VECTOR_INDEX_STATUSES)[number];

export const VECTOR_INDEX_METHODS = ['hnsw', 'ivfflat', 'flat'] as const;

export type VectorIndexMethod = (typeof VECTOR_INDEX_METHODS)[number];

export const VECTOR_CAPABILITY_PROVIDERS = [
  'mongodb',
  'postgres',
  'unsupported',
] as const;

export type VectorCapabilityProvider =
  (typeof VECTOR_CAPABILITY_PROVIDERS)[number];

export type VectorIndexDefinition = {
  name?: string;
  field: string;
  dimensions: number;
  similarity: VectorSimilarity;
  method?: VectorIndexMethod;
  filterFields?: string[];
  status?: VectorIndexStatus;
  queryable?: boolean;
};

export type SchemaVectorIndexesResponse = {
  indexes: VectorIndexDefinition[];
};

export type VectorCapabilities = {
  supported: boolean;
  storage: boolean;
  indexing: boolean;
  search: boolean;
  provider: VectorCapabilityProvider;
  reason?: string;
};

export type EmbeddingsCapabilitiesResponse = {
  capabilities: VectorCapabilities;
  warnings: string[];
};

export type EmbeddingsQueueCounts = {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
};

export type EmbeddingsStatus = {
  enabled: boolean;
  ready: boolean;
  capabilities: VectorCapabilities;
  generationQueue: EmbeddingsQueueCounts;
  backfillQueue: EmbeddingsQueueCounts;
  warnings: string[];
};

export function isVectorIndexStatus(
  value: unknown
): value is VectorIndexStatus {
  return (
    typeof value === 'string' &&
    (VECTOR_INDEX_STATUSES as readonly string[]).includes(value)
  );
}

export function isVectorIndexMethod(
  value: unknown
): value is VectorIndexMethod {
  return (
    typeof value === 'string' &&
    (VECTOR_INDEX_METHODS as readonly string[]).includes(value)
  );
}

export function isVectorCapabilityProvider(
  value: unknown
): value is VectorCapabilityProvider {
  return (
    typeof value === 'string' &&
    (VECTOR_CAPABILITY_PROVIDERS as readonly string[]).includes(value)
  );
}

export const DEFAULT_VECTOR_INDEX_METHOD: VectorIndexMethod = 'hnsw';

export function isVectorIndexQueryable(index?: VectorIndexDefinition): boolean {
  if (!index) return false;
  if (index.queryable === false) return false;
  if (index.status === 'failed') return false;
  if (index.status === 'pending' && index.queryable !== true) return false;
  if (index.queryable === true) return true;
  return index.status === 'ready';
}

export function isVectorStorageSearchReady(
  capabilities: VectorCapabilities | undefined
): boolean | undefined {
  if (!capabilities) return undefined;
  return capabilities.supported && capabilities.storage && capabilities.search;
}
