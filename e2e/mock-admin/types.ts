export const MOCK_SCENARIOS = [
  'ready',
  'workers-off',
  'gated',
  'blank',
  'no-embeddings',
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

export type MockAdminState = {
  scenario: MockScenario;
  modules: MockModule[];
  settings: MockEmbeddingsSettings;
  capabilities: MockCapabilities;
  schemas: MockSchema[];
  configs: MockEmbeddingConfig[];
  indexesBySchemaId: Record<string, MockVectorIndex[]>;
  backfills: MockBackfillRun[];
  tokens: Set<string>;
  lastSettingsPatchHadApiKey: boolean;
  configSeq: number;
  backfillSeq: number;
};
