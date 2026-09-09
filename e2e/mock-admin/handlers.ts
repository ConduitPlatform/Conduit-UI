import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  E2E_MASTER_KEY,
  E2E_PASSWORD,
  E2E_USERNAME,
  FIXED_NOW,
  OPENAI_COMPATIBLE_PROVIDER,
  PRODUCT_SCHEMA_ID,
  REDACTED_SECRET,
} from './constants.ts';
import { signAdminToken } from './jwt.ts';
import {
  bearerToken,
  isRecord,
  masterKey,
  readBoolean,
  readJsonBody,
  readNumber,
  readString,
  readStringArray,
  requestPath,
  sendEmpty,
  sendJson,
} from './http.ts';
import {
  cloneRun,
  emptyQueueCounts,
  getState,
  registerIssuedToken,
  resetState,
  revokeActiveTokens,
  toApiRun,
} from './state.ts';
import { isMockScenario } from './types.ts';
import type {
  MockBackfillRun,
  MockEmbeddingConfig,
  MockEmbeddingsSettings,
  MockProviderSettings,
} from './types.ts';

function unauthorized(response: ServerResponse): void {
  sendJson(response, 401, { status: 401, message: 'Unauthorized' });
}

function notFound(response: ServerResponse, message = 'Not found'): void {
  sendJson(response, 404, { status: 404, message });
}

function badRequest(response: ServerResponse, message: string): void {
  sendJson(response, 400, { status: 400, message });
}

function isPublicPath(pathname: string, method: string): boolean {
  if (pathname === '/ready' || pathname.startsWith('/__test__/')) return true;
  return method === 'POST' && pathname === '/login';
}

function requireAuth(
  request: IncomingMessage,
  response: ServerResponse,
  pathname: string,
  method: string
): boolean {
  if (masterKey(request) !== E2E_MASTER_KEY) {
    unauthorized(response);
    return false;
  }
  if (isPublicPath(pathname, method)) return true;
  const token = bearerToken(request);
  if (!token || !getState().tokens.has(token)) {
    unauthorized(response);
    return false;
  }
  return true;
}

function redactSettings(
  settings: MockEmbeddingsSettings
): MockEmbeddingsSettings {
  const providers: Record<string, MockProviderSettings> = {};
  for (const [name, provider] of Object.entries(settings.providers)) {
    providers[name] = {
      ...provider,
      apiKey: provider.apiKey.length > 0 ? REDACTED_SECRET : '',
    };
  }
  return { ...settings, providers };
}

function isRecordOfProviders(value: unknown): value is Record<string, unknown> {
  return isRecord(value);
}

function mergeProvider(
  current: MockProviderSettings,
  patch: unknown
): MockProviderSettings {
  if (!isRecord(patch)) return current;
  const next: MockProviderSettings = { ...current };
  if (typeof patch.endpoint === 'string') next.endpoint = patch.endpoint;
  if (typeof patch.model === 'string') next.model = patch.model;
  if (Array.isArray(patch.allowedHosts)) {
    next.allowedHosts = readStringArray(patch.allowedHosts);
  }
  const apiKey = patch.apiKey;
  if (
    typeof apiKey === 'string' &&
    apiKey.length > 0 &&
    apiKey !== REDACTED_SECRET
  ) {
    next.apiKey = apiKey;
  }
  return next;
}

function applySettingsPatch(
  current: MockEmbeddingsSettings,
  patch: unknown
): { settings: MockEmbeddingsSettings; hadApiKey: boolean } {
  if (!isRecord(patch)) return { settings: current, hadApiKey: false };
  const next: MockEmbeddingsSettings = {
    ...current,
    queue: { ...current.queue },
    security: {
      ...current.security,
      sourceFieldAllowlist: [...current.security.sourceFieldAllowlist],
    },
    providers: { ...current.providers },
  };
  let hadApiKey = false;
  if (typeof patch.enabled === 'boolean') next.enabled = patch.enabled;
  if (typeof patch.defaultProvider === 'string') {
    next.defaultProvider = patch.defaultProvider;
  }
  if (isRecord(patch.queue)) {
    next.queue = {
      concurrency:
        readNumber(patch.queue.concurrency, next.queue.concurrency) ??
        next.queue.concurrency,
      attempts:
        readNumber(patch.queue.attempts, next.queue.attempts) ??
        next.queue.attempts,
      maxBatchSize:
        readNumber(patch.queue.maxBatchSize, next.queue.maxBatchSize) ??
        next.queue.maxBatchSize,
      drainTimeoutMs:
        readNumber(patch.queue.drainTimeoutMs, next.queue.drainTimeoutMs) ??
        next.queue.drainTimeoutMs,
    };
  }
  if (isRecord(patch.security)) {
    next.security = {
      requireGrpcKey: readBoolean(
        patch.security.requireGrpcKey,
        next.security.requireGrpcKey
      ),
      sourceFieldAllowlist: Array.isArray(patch.security.sourceFieldAllowlist)
        ? readStringArray(patch.security.sourceFieldAllowlist)
        : next.security.sourceFieldAllowlist,
      maxMutationEventIds:
        readNumber(
          patch.security.maxMutationEventIds,
          next.security.maxMutationEventIds
        ) ?? next.security.maxMutationEventIds,
      embedTimeoutMs:
        readNumber(
          patch.security.embedTimeoutMs,
          next.security.embedTimeoutMs
        ) ?? next.security.embedTimeoutMs,
      maxEmbedInputBytes:
        readNumber(
          patch.security.maxEmbedInputBytes,
          next.security.maxEmbedInputBytes
        ) ?? next.security.maxEmbedInputBytes,
      maxEmbedResponseBytes:
        readNumber(
          patch.security.maxEmbedResponseBytes,
          next.security.maxEmbedResponseBytes
        ) ?? next.security.maxEmbedResponseBytes,
    };
  }
  if (isRecordOfProviders(patch.providers)) {
    for (const [name, providerPatch] of Object.entries(patch.providers)) {
      if (isRecord(providerPatch) && typeof providerPatch.apiKey === 'string') {
        const key = providerPatch.apiKey;
        if (key.length > 0 && key !== REDACTED_SECRET) hadApiKey = true;
      }
      const existing = next.providers[name] ?? {
        endpoint: '',
        apiKey: '',
        model: '',
        allowedHosts: [],
      };
      next.providers[name] = mergeProvider(existing, providerPatch);
    }
  }
  return { settings: next, hadApiKey };
}

function matchingIndex(
  config: MockEmbeddingConfig,
  schemaId: string | undefined
) {
  const state = getState();
  if (!schemaId) return undefined;
  return (state.indexesBySchemaId[schemaId] ?? []).find(
    index =>
      index.field === config.targetField &&
      index.dimensions === config.dimensions &&
      index.similarity === config.similarity
  );
}

function schemaIdForName(name: string): string | undefined {
  return getState().schemas.find(schema => schema.name === name)?._id;
}

function provisionPendingIndex(config: MockEmbeddingConfig): void {
  const state = getState();
  const schemaId = schemaIdForName(config.schemaName) ?? PRODUCT_SCHEMA_ID;
  const indexes = state.indexesBySchemaId[schemaId] ?? [];
  const existing = matchingIndex(config, schemaId);
  if (existing) return;
  indexes.push({
    name: `${config.schemaName}_${config.targetField}_v1`,
    field: config.targetField,
    dimensions: config.dimensions,
    similarity: config.similarity,
    method: 'hnsw',
    status: 'pending',
    queryable: false,
  });
  state.indexesBySchemaId[schemaId] = indexes;
}

function isIndexQueryable(config: MockEmbeddingConfig): boolean {
  const index = matchingIndex(config, schemaIdForName(config.schemaName));
  if (!index) return false;
  if (index.queryable === false) return false;
  if (index.status === 'failed') return false;
  if (index.status === 'pending' && index.queryable !== true) return false;
  return index.queryable === true || index.status === 'ready';
}

function advanceBackfill(run: MockBackfillRun): MockBackfillRun {
  if (!run.autoAdvance) return cloneRun(run);
  const snapshot = cloneRun(run);
  const elapsed = Date.now() - run.createdMs;
  if (run.state === 'queued' && elapsed < 2_000) return snapshot;
  if (run.state === 'running' && elapsed < 5_000) return snapshot;
  run.pollCount += 1;
  if (run.state === 'queued') {
    run.state = 'running';
    run.startedAt = FIXED_NOW;
    run.scannedCount = 40;
    run.queuedCount = 40;
    run.processedCount = 10;
    run.updatedAt = FIXED_NOW;
    run.cursor = 'cursor-running';
  } else if (run.state === 'running') {
    run.state = 'completed';
    run.processedCount = run.queuedCount;
    run.finishedAt = FIXED_NOW;
    run.updatedAt = FIXED_NOW;
    run.cursor = 'cursor-done';
    run.autoAdvance = false;
  }
  return snapshot;
}

function adminRouterConfig() {
  return {
    hostUrl: 'http://127.0.0.1:3000',
    transports: { rest: true, graphql: false, sockets: false },
    captcha: { enabled: false, provider: 'recaptcha', secretKey: '' },
    cors: {
      enabled: false,
      origin: '*',
      methods: 'GET,POST,PUT,DELETE,PATCH',
      allowedHeaders: '',
      exposedHeaders: '',
      credentials: true,
      maxAge: 86400,
    },
    rateLimit: { maxRequests: 100, resetInterval: 1 },
    security: { clientValidation: false },
  };
}

function adminModuleConfig() {
  return {
    hostUrl: 'http://127.0.0.1:3030',
    transports: { rest: true, graphql: false, sockets: false, mcp: false },
    auth: {
      tokenSecret: REDACTED_SECRET,
      hashRounds: 11,
      tokenExpirationTime: 72000,
    },
    cors: {
      enabled: false,
      origin: '*',
      methods: 'GET,POST,PUT,DELETE,PATCH',
      allowedHeaders: '',
      exposedHeaders: '',
      credentials: true,
      maxAge: 86400,
    },
    mcp: { pingInterval: 30000, sessionTimeout: 300000 },
  };
}

async function handleLogin(
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  const body = await readJsonBody(request);
  if (!isRecord(body)) {
    badRequest(response, 'Invalid login payload');
    return;
  }
  if (body.username !== E2E_USERNAME || body.password !== E2E_PASSWORD) {
    unauthorized(response);
    return;
  }
  const token = signAdminToken(E2E_USERNAME);
  registerIssuedToken(token);
  sendJson(response, 200, { token });
}

function handleTestControl(
  method: string,
  pathname: string,
  request: IncomingMessage,
  response: ServerResponse
): Promise<boolean> | boolean {
  if (pathname === '/__test__/health' && method === 'GET') {
    sendJson(response, 200, { ok: true });
    return true;
  }
  if (pathname === '/__test__/reset' && method === 'POST') {
    return readJsonBody(request).then(body => {
      const scenario =
        isRecord(body) && isMockScenario(body.scenario)
          ? body.scenario
          : 'ready';
      resetState(scenario);
      sendJson(response, 200, { ok: true, scenario });
      return true;
    });
  }
  if (pathname === '/__test__/revoke' && method === 'POST') {
    revokeActiveTokens();
    sendJson(response, 200, { ok: true });
    return true;
  }
  if (pathname === '/__test__/state' && method === 'GET') {
    const state = getState();
    const provider =
      state.settings.providers[state.settings.defaultProvider] ??
      state.settings.providers[OPENAI_COMPATIBLE_PROVIDER];
    sendJson(response, 200, {
      scenario: state.scenario,
      configCount: state.configs.length,
      backfillCount: state.backfills.length,
      storedApiKeyConfigured: Boolean(provider?.apiKey),
      lastSettingsPatchHadApiKey: state.lastSettingsPatchHadApiKey,
      modules: state.modules.map(module => module.moduleName),
    });
    return true;
  }
  return false;
}

export async function handleMockRequest(
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  const method = (request.method ?? 'GET').toUpperCase();
  const { pathname, search } = requestPath(request);

  if (pathname === '/ready' && method === 'GET') {
    sendJson(response, 200, { ready: true });
    return;
  }

  const testHandled = await handleTestControl(
    method,
    pathname,
    request,
    response
  );
  if (testHandled) return;

  if (!requireAuth(request, response, pathname, method)) return;

  if (pathname === '/login' && method === 'POST') {
    await handleLogin(request, response);
    return;
  }

  if (pathname === '/admins/me' && method === 'GET') {
    sendJson(response, 200, {
      _id: 'admin_1',
      username: E2E_USERNAME,
      email: 'admin@example.com',
      isSuperAdmin: true,
      hasTwoFA: false,
      createdAt: FIXED_NOW,
      updatedAt: FIXED_NOW,
    });
    return;
  }

  if (pathname === '/config/modules' && method === 'GET') {
    sendJson(response, 200, { modules: getState().modules });
    return;
  }

  if (pathname === '/config/router' && method === 'GET') {
    sendJson(response, 200, { config: adminRouterConfig() });
    return;
  }

  if (pathname === '/config/admin' && method === 'GET') {
    sendJson(response, 200, { config: adminModuleConfig() });
    return;
  }

  if (pathname === '/config/embeddings' && method === 'GET') {
    sendJson(response, 200, { config: redactSettings(getState().settings) });
    return;
  }

  if (pathname === '/config/embeddings' && method === 'PATCH') {
    const body = await readJsonBody(request);
    const patch = isRecord(body) ? body.config : undefined;
    const applied = applySettingsPatch(getState().settings, patch);
    getState().settings = applied.settings;
    getState().lastSettingsPatchHadApiKey = applied.hadApiKey;
    sendJson(response, 200, { config: redactSettings(applied.settings) });
    return;
  }

  if (pathname === '/embeddings/capabilities' && method === 'GET') {
    sendJson(response, 200, {
      capabilities: getState().capabilities,
      warnings: [],
    });
    return;
  }

  if (pathname === '/embeddings/status' && method === 'GET') {
    const state = getState();
    const provider =
      state.settings.providers[state.settings.defaultProvider] ??
      state.settings.providers[OPENAI_COMPATIBLE_PROVIDER];
    const ready =
      state.settings.enabled &&
      state.capabilities.supported &&
      state.capabilities.storage &&
      state.capabilities.search &&
      Boolean(provider?.endpoint) &&
      Boolean(provider?.apiKey);
    sendJson(response, 200, {
      enabled: state.settings.enabled,
      ready,
      capabilities: state.capabilities,
      generationQueue: emptyQueueCounts(),
      backfillQueue: emptyQueueCounts(),
      warnings: [],
    });
    return;
  }

  if (pathname === '/embeddings/configs' && method === 'GET') {
    const schemaName = search.get('schemaName') ?? undefined;
    const id = search.get('id') ?? undefined;
    let configs = getState().configs;
    if (schemaName) {
      configs = configs.filter(config => config.schemaName === schemaName);
    }
    if (id) configs = configs.filter(config => config._id === id);
    sendJson(response, 200, { configs });
    return;
  }

  if (pathname === '/embeddings/configs' && method === 'POST') {
    const body = await readJsonBody(request);
    if (!isRecord(body)) {
      badRequest(response, 'Invalid config payload');
      return;
    }
    const schemaName = readString(body.schemaName);
    const targetField = readString(body.targetField);
    const sourceFields = readStringArray(body.sourceFields);
    const dimensions = readNumber(body.dimensions);
    if (
      !schemaName ||
      !targetField ||
      !dimensions ||
      sourceFields.length === 0
    ) {
      badRequest(response, 'Invalid config payload');
      return;
    }
    const state = getState();
    const similarity =
      body.similarity === 'euclidean' || body.similarity === 'dotProduct'
        ? body.similarity
        : 'cosine';
    const existing = state.configs.find(
      config =>
        config.schemaName === schemaName && config.targetField === targetField
    );
    const next: MockEmbeddingConfig = {
      _id: existing?._id ?? `cfg_${++state.configSeq}`,
      schemaName,
      sourceFields,
      targetField,
      provider: readString(body.provider) ?? OPENAI_COMPATIBLE_PROVIDER,
      model: readString(body.model) ?? '',
      dimensions,
      similarity,
      enabled: false,
      createdAt: existing?.createdAt ?? FIXED_NOW,
      updatedAt: FIXED_NOW,
    };
    provisionPendingIndex(next);
    const warnings: string[] = [];
    const requestedEnabled = body.enabled === true;
    if (requestedEnabled && !isIndexQueryable(next)) {
      warnings.push(
        'Config stayed disabled until the matching index is queryable.'
      );
    } else if (!isIndexQueryable(next)) {
      warnings.push(
        'Matching index is pending. Keep this config disabled until it is queryable.'
      );
    } else {
      next.enabled = requestedEnabled;
    }
    if (existing) {
      state.configs = state.configs.map(config =>
        config._id === existing._id ? next : config
      );
    } else {
      state.configs.push(next);
    }
    sendJson(response, 200, { config: next, warnings });
    return;
  }

  const configMatch = /^\/embeddings\/configs\/([^/]+)$/.exec(pathname);
  if (configMatch && method === 'GET') {
    const config = getState().configs.find(item => item._id === configMatch[1]);
    if (!config) {
      notFound(response, 'Embedding config not found');
      return;
    }
    sendJson(response, 200, config);
    return;
  }
  if (configMatch && method === 'DELETE') {
    const state = getState();
    const config = state.configs.find(item => item._id === configMatch[1]);
    if (!config) {
      notFound(response, 'Embedding config not found');
      return;
    }
    state.configs = state.configs.filter(item => item._id !== config._id);
    sendJson(response, 200, { config });
    return;
  }

  if (pathname === '/embeddings/backfills' && method === 'GET') {
    const schemaName = search.get('schemaName') ?? undefined;
    const configId = search.get('configId') ?? undefined;
    const runState = search.get('state') ?? undefined;
    const skip = Number(search.get('skip') ?? '0') || 0;
    const limit = Number(search.get('limit') ?? '10') || 10;
    let runs = getState().backfills.map(toApiRun);
    if (schemaName) runs = runs.filter(run => run.schemaName === schemaName);
    if (configId) runs = runs.filter(run => run.configId === configId);
    if (runState) runs = runs.filter(run => run.state === runState);
    const count = runs.length;
    sendJson(response, 200, { runs: runs.slice(skip, skip + limit), count });
    return;
  }

  if (pathname === '/embeddings/backfills' && method === 'POST') {
    const body = await readJsonBody(request);
    if (!isRecord(body)) {
      badRequest(response, 'Invalid backfill payload');
      return;
    }
    const schemaName = readString(body.schemaName);
    if (!schemaName) {
      badRequest(response, 'schemaName is required');
      return;
    }
    const state = getState();
    const run: MockBackfillRun = {
      _id: `bf_${++state.backfillSeq}`,
      schemaName,
      configId: readString(body.configId),
      state: 'queued',
      batchSize: readNumber(body.batchSize, 100) ?? 100,
      onlyMissing: readBoolean(body.onlyMissing, true),
      filter: isRecord(body.filter) ? { ...body.filter } : undefined,
      scannedCount: 0,
      queuedCount: 0,
      processedCount: 0,
      failedCount: 0,
      createdAt: FIXED_NOW,
      updatedAt: FIXED_NOW,
      autoAdvance: true,
      pollCount: 0,
      createdMs: Date.now(),
    };
    state.backfills.unshift(run);
    sendJson(response, 200, {
      queued: 1,
      runs: [toApiRun(run)],
      warnings: [],
    });
    return;
  }

  const backfillCancel = /^\/embeddings\/backfills\/([^/]+)\/cancel$/.exec(
    pathname
  );
  if (backfillCancel && method === 'POST') {
    const run = getState().backfills.find(
      item => item._id === backfillCancel[1]
    );
    if (!run) {
      notFound(response, 'Backfill run not found');
      return;
    }
    if (run.state !== 'queued' && run.state !== 'running') {
      badRequest(response, 'Backfill cannot be canceled');
      return;
    }
    run.state = 'canceled';
    run.autoAdvance = false;
    run.finishedAt = FIXED_NOW;
    run.updatedAt = FIXED_NOW;
    sendJson(response, 200, { run: toApiRun(run) });
    return;
  }

  const backfillResume = /^\/embeddings\/backfills\/([^/]+)\/resume$/.exec(
    pathname
  );
  if (backfillResume && method === 'POST') {
    const run = getState().backfills.find(
      item => item._id === backfillResume[1]
    );
    if (!run) {
      notFound(response, 'Backfill run not found');
      return;
    }
    if (run.state !== 'failed' && run.state !== 'canceled') {
      badRequest(response, 'Backfill cannot be resumed');
      return;
    }
    run.state = 'queued';
    run.autoAdvance = true;
    run.pollCount = 0;
    run.createdMs = Date.now();
    run.finishedAt = undefined;
    run.error = undefined;
    run.updatedAt = FIXED_NOW;
    sendJson(response, 200, { run: toApiRun(run) });
    return;
  }

  const backfillGet = /^\/embeddings\/backfills\/([^/]+)$/.exec(pathname);
  if (backfillGet && method === 'GET') {
    const run = getState().backfills.find(item => item._id === backfillGet[1]);
    if (!run) {
      notFound(response, 'Backfill run not found');
      return;
    }
    sendJson(response, 200, toApiRun(advanceBackfill(run)));
    return;
  }

  if (pathname === '/embeddings/search' && method === 'POST') {
    const body = await readJsonBody(request);
    if (!isRecord(body)) {
      badRequest(response, 'Invalid search payload');
      return;
    }
    const text = readString(body.text);
    const schemaName = readString(body.schemaName);
    if (!text || !schemaName) {
      badRequest(response, 'schemaName and text are required');
      return;
    }
    if (text === 'fail') {
      sendJson(response, 503, {
        status: 503,
        message: 'Provider request failed',
      });
      return;
    }
    if (text === 'nomatch') {
      sendJson(response, 200, { hits: [] });
      return;
    }
    sendJson(response, 200, {
      hits: [
        {
          document: { _id: 'doc_1', title: 'Published guide', schemaName },
          score: 0.91,
          distance: 0.09,
          metric: 'cosine',
          provider: 'mongodb',
        },
        {
          document: { _id: 'doc_2', title: 'Operator notes', schemaName },
          score: 0.74,
          distance: 0.26,
          metric: 'cosine',
          provider: 'mongodb',
        },
      ],
    });
    return;
  }

  if (pathname === '/database/schemas' && method === 'GET') {
    sendJson(response, 200, {
      schemas: getState().schemas,
      count: getState().schemas.length,
    });
    return;
  }

  const vectorIndexes = /^\/database\/schemas\/([^/]+)\/vector-indexes$/.exec(
    pathname
  );
  if (vectorIndexes && method === 'GET') {
    sendJson(response, 200, {
      indexes: getState().indexesBySchemaId[vectorIndexes[1]] ?? [],
    });
    return;
  }

  if (pathname === '/database/database-type' && method === 'GET') {
    sendJson(response, 200, { result: 'MongoDB' });
    return;
  }

  sendEmpty(response, 404);
}
