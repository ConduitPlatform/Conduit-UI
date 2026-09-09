import {
  ARCHIVED_SCHEMA_ID,
  ARCHIVED_SCHEMA_NAME,
  E2E_ENV_NAME,
  FIXED_NOW,
  OPENAI_COMPATIBLE_PROVIDER,
  PENDING_INDEX_NAME,
  PRODUCT_SCHEMA_ID,
  PRODUCT_SCHEMA_NAME,
  PROVIDER_ENDPOINT,
  PROVIDER_MODEL,
  READY_CONFIG_ID,
  READY_INDEX_NAME,
  STORED_API_KEY,
} from './constants.ts';
import type {
  MockAdminState,
  MockBackfillRun,
  MockCapabilities,
  MockEmbeddingConfig,
  MockEmbeddingsSettings,
  MockModule,
  MockQueueCounts,
  MockScenario,
  MockSchema,
} from './types.ts';

function emptyQueue(): MockQueueCounts {
  return {
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    delayed: 0,
    paused: 0,
  };
}

function schemaModelOptions(enabled: boolean): Record<string, unknown> {
  return { conduit: { cms: { enabled } } };
}

function productSchema(): MockSchema {
  const fields = {
    title: { type: 'String' },
    description: { type: 'String' },
  };
  return {
    _id: PRODUCT_SCHEMA_ID,
    name: PRODUCT_SCHEMA_NAME,
    parentSchema: null,
    fields,
    compiledFields: fields,
    extensions: [],
    modelOptions: schemaModelOptions(true),
    ownerModule: 'database',
    collectionName: 'products',
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW,
  };
}

function archivedSchema(): MockSchema {
  const fields = {
    title: { type: 'String' },
  };
  return {
    _id: ARCHIVED_SCHEMA_ID,
    name: ARCHIVED_SCHEMA_NAME,
    parentSchema: null,
    fields,
    compiledFields: fields,
    extensions: [],
    modelOptions: schemaModelOptions(false),
    ownerModule: 'database',
    collectionName: 'archived_products',
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW,
  };
}

function coreModules(
  includeEmbeddings: boolean,
  serving: boolean
): MockModule[] {
  const modules: MockModule[] = [
    { moduleName: 'database', url: '0.0.0.0:5510', serving: true },
    { moduleName: 'router', url: '0.0.0.0:5511', serving: true },
  ];
  if (includeEmbeddings) {
    modules.push({
      moduleName: 'embeddings',
      url: '0.0.0.0:5512',
      serving,
    });
  }
  return modules;
}

function defaultSettings(args: {
  enabled: boolean;
  apiKey: string;
}): MockEmbeddingsSettings {
  return {
    enabled: args.enabled,
    defaultProvider: OPENAI_COMPATIBLE_PROVIDER,
    providers: {
      [OPENAI_COMPATIBLE_PROVIDER]: {
        endpoint: PROVIDER_ENDPOINT,
        apiKey: args.apiKey,
        model: PROVIDER_MODEL,
        allowedHosts: ['api.openai.com'],
      },
    },
    queue: {
      concurrency: 2,
      attempts: 3,
      maxBatchSize: 500,
      drainTimeoutMs: 15 * 60 * 1000,
    },
    security: {
      requireGrpcKey: false,
      sourceFieldAllowlist: [],
      maxMutationEventIds: 500,
      embedTimeoutMs: 10_000,
      maxEmbedInputBytes: 32 * 1024,
      maxEmbedResponseBytes: 1024 * 1024,
    },
  };
}

function mongodbCapabilities(): MockCapabilities {
  return {
    supported: true,
    storage: true,
    indexing: true,
    search: true,
    provider: 'mongodb',
  };
}

function unsupportedCapabilities(): MockCapabilities {
  return {
    supported: false,
    storage: false,
    indexing: false,
    search: false,
    provider: 'unsupported',
    reason: 'This database does not support vector storage and search',
  };
}

function readyConfig(): MockEmbeddingConfig {
  return {
    _id: READY_CONFIG_ID,
    schemaName: PRODUCT_SCHEMA_NAME,
    sourceFields: ['title'],
    targetField: 'embedding',
    provider: OPENAI_COMPATIBLE_PROVIDER,
    model: PROVIDER_MODEL,
    dimensions: 1536,
    similarity: 'cosine',
    enabled: true,
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW,
  };
}

export function emptyQueueCounts(): MockQueueCounts {
  return emptyQueue();
}

function readyIndexes() {
  return [
    {
      name: PENDING_INDEX_NAME,
      field: 'embedding',
      dimensions: 1536,
      similarity: 'cosine' as const,
      method: 'hnsw' as const,
      status: 'pending' as const,
      queryable: false,
    },
    {
      name: READY_INDEX_NAME,
      field: 'embedding',
      dimensions: 1536,
      similarity: 'cosine' as const,
      method: 'hnsw' as const,
      status: 'ready' as const,
      queryable: true,
    },
  ];
}

function readyState(enabled: boolean): MockAdminState {
  return {
    scenario: enabled ? 'ready' : 'workers-off',
    modules: coreModules(true, true),
    settings: defaultSettings({ enabled, apiKey: STORED_API_KEY }),
    capabilities: mongodbCapabilities(),
    schemas: [productSchema(), archivedSchema()],
    configs: [readyConfig()],
    indexesBySchemaId: {
      [PRODUCT_SCHEMA_ID]: readyIndexes(),
    },
    backfills: [],
    tokens: new Set(),
    lastSettingsPatchHadApiKey: false,
    configSeq: 1,
    backfillSeq: 0,
  };
}

export function createState(scenario: MockScenario = 'ready'): MockAdminState {
  switch (scenario) {
    case 'ready':
      return readyState(true);
    case 'workers-off':
      return readyState(false);
    case 'gated':
      return {
        scenario,
        modules: coreModules(true, true),
        settings: defaultSettings({ enabled: false, apiKey: '' }),
        capabilities: unsupportedCapabilities(),
        schemas: [productSchema(), archivedSchema()],
        configs: [],
        indexesBySchemaId: { [PRODUCT_SCHEMA_ID]: [] },
        backfills: [],
        tokens: new Set(),
        lastSettingsPatchHadApiKey: false,
        configSeq: 0,
        backfillSeq: 0,
      };
    case 'blank':
      return {
        scenario,
        modules: coreModules(true, true),
        settings: defaultSettings({ enabled: true, apiKey: STORED_API_KEY }),
        capabilities: mongodbCapabilities(),
        schemas: [productSchema(), archivedSchema()],
        configs: [],
        indexesBySchemaId: { [PRODUCT_SCHEMA_ID]: [] },
        backfills: [],
        tokens: new Set(),
        lastSettingsPatchHadApiKey: false,
        configSeq: 0,
        backfillSeq: 0,
      };
    case 'no-embeddings':
      return {
        scenario,
        modules: coreModules(false, false),
        settings: defaultSettings({ enabled: false, apiKey: '' }),
        capabilities: unsupportedCapabilities(),
        schemas: [productSchema(), archivedSchema()],
        configs: [],
        indexesBySchemaId: { [PRODUCT_SCHEMA_ID]: [] },
        backfills: [],
        tokens: new Set(),
        lastSettingsPatchHadApiKey: false,
        configSeq: 0,
        backfillSeq: 0,
      };
    default: {
      const exhaustive: never = scenario;
      return exhaustive;
    }
  }
}

let state: MockAdminState = createState('ready');
const issuedTokens = new Set<string>();

export function getState(): MockAdminState {
  return state;
}

export function registerIssuedToken(token: string): void {
  issuedTokens.add(token);
  state.tokens.add(token);
}

export function revokeActiveTokens(): void {
  state.tokens.clear();
}

export function resetState(scenario: MockScenario = 'ready'): MockAdminState {
  state = createState(scenario);
  state.tokens = new Set(issuedTokens);
  return state;
}

export function replaceState(next: MockAdminState): void {
  state = next;
}

export function envDisplayName(): string {
  return E2E_ENV_NAME;
}

export function cloneRun(run: MockBackfillRun): MockBackfillRun {
  return {
    ...run,
    filter: run.filter ? { ...run.filter } : undefined,
  };
}

export function toApiConfig(config: MockEmbeddingConfig) {
  return {
    id: config._id,
    schemaName: config.schemaName,
    sourceFields: config.sourceFields,
    targetField: config.targetField,
    provider: config.provider,
    model: config.model,
    dimensions: config.dimensions,
    similarity: config.similarity,
    enabled: config.enabled,
    createdAt: config.createdAt,
    updatedAt: config.updatedAt,
  };
}

export function toApiRun(run: MockBackfillRun) {
  return {
    id: run._id,
    schemaName: run.schemaName,
    configId: run.configId,
    state: run.state,
    cursor: run.cursor,
    batchSize: run.batchSize,
    onlyMissing: run.onlyMissing,
    filter: run.filter ? JSON.stringify(run.filter) : undefined,
    scannedCount: run.scannedCount,
    queuedCount: run.queuedCount,
    processedCount: run.processedCount,
    failedCount: run.failedCount,
    startedAt: run.startedAt,
    finishedAt: run.finishedAt,
    error: run.error,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
  };
}
