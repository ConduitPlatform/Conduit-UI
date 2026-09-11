export const MOCK_SCENARIOS = [
  'ready',
  'workers-off',
  'gated',
  'blank',
  'no-embeddings',
  'generic-ready',
  'pending-sources',
  'failed-sources',
  'disabled-sources',
] as const;

export type MockScenario = (typeof MOCK_SCENARIOS)[number];

export function isMockScenario(value: unknown): value is MockScenario {
  return (
    typeof value === 'string' &&
    (MOCK_SCENARIOS as readonly string[]).includes(value)
  );
}

export type MockModule = {
  moduleName: string;
  url: string;
  serving: boolean;
};

export type MockProviderModel = {
  name: string;
  dimensions: number;
};

export type MockProviderSettings = {
  endpoint: string;
  apiKey: string;
  models: MockProviderModel[];
  defaultModel: string;
};

export type MockEmbeddingsSettings = {
  enabled: boolean;
  defaultProvider: string;
  providers: Record<string, MockProviderSettings>;
  queue: {
    concurrency: number;
    attempts: number;
    maxBatchSize: number;
    drainTimeoutMs: number;
  };
  security: {
    sourceFieldAllowlist: string[];
    maxMutationEventIds: number;
    embedTimeoutMs: number;
    maxEmbedInputBytes: number;
    maxEmbedResponseBytes: number;
  };
};

export type MockCapabilities = {
  supported: boolean;
  storage: boolean;
  indexing: boolean;
  search: boolean;
  provider: 'mongodb' | 'postgres' | 'unsupported';
  reason?: string;
};

export type MockQueueCounts = {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
};

export type MockEmbeddingConfig = {
  _id: string;
  schemaName: string;
  sourceFields: string[];
  targetField: string;
  provider: string;
  model: string;
  dimensions: number;
  similarity: 'cosine' | 'euclidean' | 'dotProduct';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MockVectorIndex = {
  name: string;
  field: string;
  dimensions: number;
  similarity: 'cosine' | 'euclidean' | 'dotProduct';
  method: 'hnsw' | 'ivfflat' | 'flat';
  status: 'pending' | 'ready' | 'failed';
  queryable: boolean;
};

export type MockSchema = {
  _id: string;
  name: string;
  parentSchema: string | null;
  fields: Record<string, unknown>;
  compiledFields: Record<string, unknown>;
  extensions: unknown[];
  modelOptions: Record<string, unknown>;
  ownerModule: string;
  collectionName: string;
  createdAt: string;
  updatedAt: string;
};

export type MockBackfillRun = {
  _id: string;
  schemaName: string;
  configId?: string;
  state: 'queued' | 'running' | 'completed' | 'failed' | 'canceled';
  cursor?: string;
  batchSize: number;
  onlyMissing: boolean;
  filter?: Record<string, unknown>;
  scannedCount: number;
  queuedCount: number;
  processedCount: number;
  failedCount: number;
  startedAt?: string;
  finishedAt?: string;
  drainStartedAt?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
  autoAdvance: boolean;
  pollCount: number;
  createdMs: number;
};

export type MockSourceKind = 'conduit-storage' | 'external';
export type MockSourceState =
  | 'pending'
  | 'ready'
  | 'disabled'
  | 'revoked'
  | 'failed';

export type MockSourceCounts = {
  pendingCount: number;
  queuedCount: number;
  extractingCount: number;
  indexedCount: number;
  skippedCount: number;
  failedCount: number;
  staleCount: number;
  deletedCount: number;
};

export type MockEmbeddingSource = {
  _id: string;
  label?: string;
  kind: MockSourceKind;
  state: MockSourceState;
  partitionSubject: string;
  provider: string;
  model: string;
  dimensions: number;
  similarity: 'cosine' | 'euclidean' | 'dotProduct';
  selectors?: Record<string, unknown>;
  metadataAllowlist: string[];
  chunkIndexStatus?: 'pending' | 'ready' | 'failed';
  createdAt: string;
  updatedAt: string;
  counts: MockSourceCounts;
  extractionQueue?: MockQueueCounts;
};

export type MockTeam = {
  _id: string;
  name: string;
  parentTeam: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MockContainer = {
  _id: string;
  name: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MockFolder = {
  _id: string;
  name: string;
  container: string;
  isPublic: boolean;
  url: string;
  createdAt: string;
  updatedAt: string;
};

export type MockStorageFile = {
  _id: string;
  name: string;
  alias: string;
  folder: string;
  container: string;
  size: number;
  isPublic: boolean;
  url: string;
  mimeType: string;
  uploadStatus: 'pending' | 'ready';
  bytesUploaded: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MockAdminState = {
  scenario: MockScenario;
  modules: MockModule[];
  settings: MockEmbeddingsSettings;
  capabilities: MockCapabilities;
  schemas: MockSchema[];
  configs: MockEmbeddingConfig[];
  indexesBySchemaId: Record<string, MockVectorIndex[]>;
  backfills: MockBackfillRun[];
  sources: MockEmbeddingSource[];
  teams: MockTeam[];
  containers: MockContainer[];
  folders: MockFolder[];
  files: MockStorageFile[];
  tokens: Set<string>;
  lastSettingsPatchHadApiKey: boolean;
  configSeq: number;
  backfillSeq: number;
  sourceSeq: number;
  fileSeq: number;
  failNextComplete: boolean;
  completedUploadIds: string[];
  lastUploadCompleteFailed: boolean;
  storageQueue: MockQueueCounts;
  failNextSourcesList: boolean;
  sourceWarnings: string[];
  failNextSourceCreate?: string;
  omitWorkloadCounts?: boolean;
  nextEnable?: {
    state: MockSourceState;
    warnings: string[];
    chunkIndexStatus?: 'pending' | 'ready' | 'failed';
  };
};
