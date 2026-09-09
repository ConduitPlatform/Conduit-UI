import {
  ADMIN_MIDDLEWARE_SCHEMA_ID,
  ADMIN_MIDDLEWARE_SCHEMA_NAME,
  ADMIN_SCHEMA_ID,
  ADMIN_SCHEMA_NAME,
  APP_MIDDLEWARE_SCHEMA_ID,
  APP_MIDDLEWARE_SCHEMA_NAME,
  ARCHIVED_SCHEMA_ID,
  ARCHIVED_SCHEMA_NAME,
  CLIENT_SCHEMA_ID,
  CLIENT_SCHEMA_NAME,
  CMS_ONLY_SCHEMA_ID,
  CMS_ONLY_SCHEMA_NAME,
  COLLISION_SCHEMA_ID,
  COLLISION_SCHEMA_NAME,
  CONFIG_SCHEMA_ID,
  CONFIG_SCHEMA_NAME,
  E2E_ENV_NAME,
  FIXED_NOW,
  LEGACY_CONFIG_ID,
  LEGACY_MODEL,
  OPENAI_COMPATIBLE_PROVIDER,
  PENDING_INDEX_NAME,
  PRODUCT_SCHEMA_ID,
  PRODUCT_SCHEMA_NAME,
  PROVIDER_ENDPOINT,
  PROVIDER_MODEL,
  PROVIDER_DIMENSIONS,
  READY_CONFIG_ID,
  READY_INDEX_NAME,
  SECOND_PROVIDER,
  SECOND_PROVIDER_DIMENSIONS,
  SECOND_PROVIDER_MODEL,
  STORED_API_KEY,
  TEAM_SCHEMA_ID,
  TEAM_SCHEMA_NAME,
  USER_SCHEMA_ID,
  USER_SCHEMA_NAME,
  VIEWS_SCHEMA_ID,
  VIEWS_SCHEMA_NAME,
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

function schemaModelOptions(args: {
  enabled: boolean;
  extendable: boolean;
}): Record<string, unknown> {
  return {
    conduit: {
      cms: { enabled: args.enabled },
      permissions: { extendable: args.extendable },
    },
  };
}

function namedSchema(args: {
  id: string;
  name: string;
  ownerModule: string;
  collectionName: string;
  enabled?: boolean;
  extendable?: boolean;
  fields?: Record<string, unknown>;
}): MockSchema {
  const fields = args.fields ?? {
    title: { type: 'String' },
  };
  return {
    _id: args.id,
    name: args.name,
    parentSchema: null,
    fields,
    compiledFields: fields,
    extensions: [],
    modelOptions: schemaModelOptions({
      enabled: args.enabled ?? true,
      extendable: args.extendable ?? true,
    }),
    ownerModule: args.ownerModule,
    collectionName: args.collectionName,
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW,
  };
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
    modelOptions: schemaModelOptions({ enabled: true, extendable: true }),
    ownerModule: 'database',
    collectionName: 'products',
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW,
  };
}

function cmsOnlySchema(): MockSchema {
  const fields = {
    title: { type: 'String' },
  };
  return {
    _id: CMS_ONLY_SCHEMA_ID,
    name: CMS_ONLY_SCHEMA_NAME,
    parentSchema: null,
    fields,
    compiledFields: fields,
    extensions: [],
    modelOptions: schemaModelOptions({ enabled: true, extendable: false }),
    ownerModule: 'database',
    collectionName: 'cms_only',
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
    modelOptions: schemaModelOptions({ enabled: false, extendable: true }),
    ownerModule: 'database',
    collectionName: 'archived_products',
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW,
  };
}

function collisionSchema(): MockSchema {
  const fields = {
    title: { type: 'String' },
    embedding: { type: 'String' },
  };
  return {
    _id: COLLISION_SCHEMA_ID,
    name: COLLISION_SCHEMA_NAME,
    parentSchema: null,
    fields,
    compiledFields: fields,
    extensions: [],
    modelOptions: schemaModelOptions({ enabled: true, extendable: true }),
    ownerModule: 'database',
    collectionName: 'notes',
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW,
  };
}

function declaredSchemas(): MockSchema[] {
  return [
    productSchema(),
    archivedSchema(),
    cmsOnlySchema(),
    collisionSchema(),
    namedSchema({
      id: USER_SCHEMA_ID,
      name: USER_SCHEMA_NAME,
      ownerModule: 'authentication',
      collectionName: 'users',
      fields: { email: { type: 'String' } },
    }),
    namedSchema({
      id: TEAM_SCHEMA_ID,
      name: TEAM_SCHEMA_NAME,
      ownerModule: 'authentication',
      collectionName: 'teams',
      fields: { name: { type: 'String' } },
    }),
    namedSchema({
      id: ADMIN_SCHEMA_ID,
      name: ADMIN_SCHEMA_NAME,
      ownerModule: 'core',
      collectionName: 'admins',
      fields: { username: { type: 'String' } },
    }),
    namedSchema({
      id: ADMIN_MIDDLEWARE_SCHEMA_ID,
      name: ADMIN_MIDDLEWARE_SCHEMA_NAME,
      ownerModule: 'core',
      collectionName: 'admin_middleware',
      fields: { path: { type: 'String' } },
    }),
    namedSchema({
      id: APP_MIDDLEWARE_SCHEMA_ID,
      name: APP_MIDDLEWARE_SCHEMA_NAME,
      ownerModule: 'router',
      collectionName: 'app_middleware',
      fields: { path: { type: 'String' } },
    }),
    namedSchema({
      id: CLIENT_SCHEMA_ID,
      name: CLIENT_SCHEMA_NAME,
      ownerModule: 'router',
      collectionName: 'clients',
      fields: { alias: { type: 'String' } },
    }),
    namedSchema({
      id: CONFIG_SCHEMA_ID,
      name: CONFIG_SCHEMA_NAME,
      ownerModule: 'core',
      collectionName: 'config',
      fields: { name: { type: 'String' } },
    }),
    namedSchema({
      id: VIEWS_SCHEMA_ID,
      name: VIEWS_SCHEMA_NAME,
      ownerModule: 'database',
      collectionName: 'views',
      fields: { name: { type: 'String' } },
    }),
  ];
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
        models: [{ name: PROVIDER_MODEL, dimensions: PROVIDER_DIMENSIONS }],
        defaultModel: PROVIDER_MODEL,
      },
    },
    queue: {
      concurrency: 2,
      attempts: 3,
      maxBatchSize: 500,
      drainTimeoutMs: 15 * 60 * 1000,
    },
    security: {
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

function legacyConfig(): MockEmbeddingConfig {
  return {
    _id: LEGACY_CONFIG_ID,
    schemaName: PRODUCT_SCHEMA_NAME,
    sourceFields: ['title'],
    targetField: 'legacyEmbedding',
    provider: OPENAI_COMPATIBLE_PROVIDER,
    model: LEGACY_MODEL,
    dimensions: 1536,
    similarity: 'cosine',
    enabled: false,
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW,
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
    schemas: declaredSchemas(),
    configs: [readyConfig(), legacyConfig()],
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
        schemas: declaredSchemas(),
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
        settings: (() => {
          const settings = defaultSettings({
            enabled: true,
            apiKey: STORED_API_KEY,
          });
          settings.providers[OPENAI_COMPATIBLE_PROVIDER] = {
            ...settings.providers[OPENAI_COMPATIBLE_PROVIDER],
            models: [
              {
                name: PROVIDER_MODEL,
                dimensions: PROVIDER_DIMENSIONS,
              },
              {
                name: 'text-embedding-3-large',
                dimensions: 3072,
              },
            ],
            defaultModel: PROVIDER_MODEL,
          };
          settings.providers[SECOND_PROVIDER] = {
            endpoint: PROVIDER_ENDPOINT,
            apiKey: STORED_API_KEY,
            models: [
              {
                name: SECOND_PROVIDER_MODEL,
                dimensions: SECOND_PROVIDER_DIMENSIONS,
              },
            ],
            defaultModel: SECOND_PROVIDER_MODEL,
          };
          return settings;
        })(),
        capabilities: mongodbCapabilities(),
        schemas: declaredSchemas(),
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
        schemas: declaredSchemas(),
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
