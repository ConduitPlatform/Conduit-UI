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
  ACME_TEAM_ID,
  DOCS_CONTAINER_ID,
  DOCS_CONTAINER_NAME,
  INVOICES_FOLDER_NAME,
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
  READY_EXTERNAL_SOURCE_ID,
  READY_INDEX_NAME,
  READY_STORAGE_SOURCE_ID,
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
  MockContainer,
  MockEmbeddingConfig,
  MockEmbeddingSource,
  MockEmbeddingsSettings,
  MockFolder,
  MockModule,
  MockQueueCounts,
  MockScenario,
  MockSchema,
  MockSourceCounts,
  MockTeam,
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

function declaredSchemas(): MockSchema[] {
  return [
    namedSchema({
      id: PRODUCT_SCHEMA_ID,
      name: PRODUCT_SCHEMA_NAME,
      ownerModule: 'database',
      collectionName: 'products',
      fields: {
        title: { type: 'String' },
        description: { type: 'String' },
      },
    }),
    namedSchema({
      id: ARCHIVED_SCHEMA_ID,
      name: ARCHIVED_SCHEMA_NAME,
      ownerModule: 'database',
      collectionName: 'archived_products',
      enabled: false,
    }),
    namedSchema({
      id: CMS_ONLY_SCHEMA_ID,
      name: CMS_ONLY_SCHEMA_NAME,
      ownerModule: 'database',
      collectionName: 'cms_only',
      extendable: false,
    }),
    namedSchema({
      id: COLLISION_SCHEMA_ID,
      name: COLLISION_SCHEMA_NAME,
      ownerModule: 'database',
      collectionName: 'notes',
      fields: {
        title: { type: 'String' },
        embedding: { type: 'String' },
      },
    }),
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
    { moduleName: 'storage', url: '0.0.0.0:5513', serving: true },
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

function emptySourceCounts(): MockSourceCounts {
  return {
    pendingCount: 0,
    queuedCount: 0,
    extractingCount: 0,
    indexedCount: 0,
    skippedCount: 0,
    failedCount: 0,
    staleCount: 0,
    deletedCount: 0,
  };
}

function defaultTeams(): MockTeam[] {
  return [
    {
      _id: ACME_TEAM_ID,
      name: 'Acme',
      parentTeam: '',
      isDefault: true,
      createdAt: FIXED_NOW,
      updatedAt: FIXED_NOW,
    },
  ];
}

function defaultContainers(): MockContainer[] {
  return [
    {
      _id: DOCS_CONTAINER_ID,
      name: DOCS_CONTAINER_NAME,
      isPublic: false,
      createdAt: FIXED_NOW,
      updatedAt: FIXED_NOW,
    },
  ];
}

function defaultFolders(): MockFolder[] {
  return [
    {
      _id: 'fld_invoices',
      name: INVOICES_FOLDER_NAME,
      container: DOCS_CONTAINER_NAME,
      isPublic: false,
      url: '',
      createdAt: FIXED_NOW,
      updatedAt: FIXED_NOW,
    },
  ];
}

function readySources(): MockEmbeddingSource[] {
  return [
    {
      _id: READY_STORAGE_SOURCE_ID,
      label: 'Invoices',
      kind: 'conduit-storage',
      state: 'ready',
      partitionSubject: `Team:${ACME_TEAM_ID}`,
      provider: OPENAI_COMPATIBLE_PROVIDER,
      model: PROVIDER_MODEL,
      dimensions: PROVIDER_DIMENSIONS,
      similarity: 'cosine',
      selectors: {
        container: DOCS_CONTAINER_NAME,
        folderPrefix: INVOICES_FOLDER_NAME,
        mimeTypes: ['application/pdf'],
      },
      metadataAllowlist: ['tag'],
      chunkIndexStatus: 'ready',
      createdAt: FIXED_NOW,
      updatedAt: FIXED_NOW,
      counts: {
        ...emptySourceCounts(),
        queuedCount: 2,
        extractingCount: 1,
        indexedCount: 4,
        failedCount: 1,
      },
      extractionQueue: {
        waiting: 1,
        active: 0,
        completed: 3,
        failed: 2,
        delayed: 1,
        paused: 0,
      },
    },
    {
      _id: READY_EXTERNAL_SOURCE_ID,
      label: 'Knowledge base',
      kind: 'external',
      state: 'ready',
      partitionSubject: `Team:${ACME_TEAM_ID}`,
      provider: OPENAI_COMPATIBLE_PROVIDER,
      model: PROVIDER_MODEL,
      dimensions: PROVIDER_DIMENSIONS,
      similarity: 'cosine',
      metadataAllowlist: ['tag'],
      chunkIndexStatus: 'ready',
      createdAt: FIXED_NOW,
      updatedAt: FIXED_NOW,
      counts: {
        ...emptySourceCounts(),
        indexedCount: 3,
      },
    },
  ];
}

function catalogFields(sources: MockEmbeddingSource[] = []) {
  return {
    sources,
    teams: defaultTeams(),
    containers: defaultContainers(),
    folders: defaultFolders(),
    files: [],
    sourceSeq: sources.length,
    fileSeq: 0,
    failNextComplete: false,
    completedUploadIds: [],
    lastUploadCompleteFailed: false,
    failNextSourcesList: false,
    sourceWarnings: [],
  };
}

export function seedExtraContainers(count: number): void {
  const state = getState();
  for (let index = 0; index < count; index += 1) {
    const name =
      index === count - 1
        ? 'archive-late'
        : `bin-${String(index + 1).padStart(3, '0')}`;
    if (state.containers.some(container => container.name === name)) continue;
    state.containers.push({
      _id: `ctr_${name}`,
      name,
      isPublic: false,
      createdAt: FIXED_NOW,
      updatedAt: FIXED_NOW,
    });
  }
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
    ...catalogFields(readySources()),
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
        ...catalogFields(),
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
        ...catalogFields(),
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
        ...catalogFields(),
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

export function emptySourceDocumentCounts(): MockSourceCounts {
  return emptySourceCounts();
}

export function toApiSource(source: MockEmbeddingSource) {
  return {
    id: source._id,
    ...(source.label ? { label: source.label } : {}),
    kind: source.kind,
    state: source.state,
    partitionSubject: source.partitionSubject,
    provider: source.provider,
    model: source.model,
    dimensions: source.dimensions,
    similarity: source.similarity,
    ...(source.selectors
      ? { selectors: JSON.stringify(source.selectors) }
      : {}),
    metadataAllowlist: [...source.metadataAllowlist],
    ...(source.chunkIndexStatus
      ? { chunkIndexStatus: source.chunkIndexStatus }
      : {}),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}
