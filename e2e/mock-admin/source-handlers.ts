import type { IncomingMessage, ServerResponse } from 'node:http';
import { FIXED_NOW, OPENAI_COMPATIBLE_PROVIDER } from './constants.ts';
import {
  isRecord,
  readJsonBody,
  readNumber,
  readString,
  readStringArray,
  sendEmpty,
  sendJson,
} from './http.ts';
import {
  emptyQueueCounts,
  emptySourceDocumentCounts,
  getState,
  toApiSource,
} from './state.ts';
import type { MockEmbeddingSource, MockSourceKind } from './types.ts';

const AUTOMATIC_MIME_TYPES = [
  'text/plain',
  'text/markdown',
  'application/json',
  'text/csv',
  'application/pdf',
] as const;

const PARTITION_PATTERN = /^[A-Za-z][A-Za-z0-9_]*:[A-Za-z0-9._:-]{1,128}$/;

function badRequest(response: ServerResponse, message: string): void {
  sendJson(response, 400, { status: 400, message });
}

function notFound(response: ServerResponse, message: string): void {
  sendJson(response, 404, { status: 404, message });
}

function isSourceKind(value: unknown): value is MockSourceKind {
  return value === 'conduit-storage' || value === 'external';
}

function parseSelectors(value: unknown): Record<string, unknown> | undefined {
  if (value == null || value === '') return undefined;
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value);
      return isRecord(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }
  return isRecord(value) ? { ...value } : undefined;
}

function validateMimeTypes(value: unknown): string[] | { error: string } {
  if (value == null) return [];
  if (!Array.isArray(value)) {
    return { error: 'MIME types must be a list.' };
  }
  const mimeTypes = [
    ...new Set(
      value
        .filter((item): item is string => typeof item === 'string')
        .map(item => item.trim().toLowerCase())
    ),
  ];
  if (
    mimeTypes.some(
      item => !(AUTOMATIC_MIME_TYPES as readonly string[]).includes(item)
    )
  ) {
    return {
      error: `MIME types must be a subset of ${AUTOMATIC_MIME_TYPES.join(', ')}.`,
    };
  }
  return mimeTypes;
}

function validateStorageSelectors(
  raw: unknown
):
  | { ok: true; selectors: Record<string, unknown> }
  | { ok: false; error: string } {
  const selectors = parseSelectors(raw);
  const container =
    typeof selectors?.container === 'string' ? selectors.container.trim() : '';
  if (!container) {
    return { ok: false, error: 'Storage sources require a container.' };
  }
  const mimeTypes = validateMimeTypes(selectors?.mimeTypes);
  if (!Array.isArray(mimeTypes)) return { ok: false, error: mimeTypes.error };
  const rawPrefix =
    typeof selectors?.folderPrefix === 'string'
      ? selectors.folderPrefix.trim().replace(/^\/+/, '')
      : '';
  const folderPrefix = rawPrefix
    ? rawPrefix.endsWith('/')
      ? rawPrefix
      : `${rawPrefix}/`
    : undefined;
  return {
    ok: true,
    selectors: {
      container,
      ...(folderPrefix ? { folderPrefix } : {}),
      ...(mimeTypes.length > 0 ? { mimeTypes } : {}),
    },
  };
}

function sourceStatusPayload(source: MockEmbeddingSource) {
  const warnings: string[] = [];
  if (source.state !== 'ready') {
    warnings.push(`Embedding source '${source._id}' is ${source.state}`);
  }
  if (source.chunkIndexStatus && source.chunkIndexStatus !== 'ready') {
    warnings.push(`Chunk index status is ${source.chunkIndexStatus}`);
  }
  warnings.push(...getState().sourceWarnings);
  return {
    source: toApiSource(source),
    ready: source.state === 'ready',
    ...source.counts,
    extractionQueue: source.extractionQueue ?? emptyQueueCounts(),
    warnings,
  };
}

export async function handleSourceCatalogRoutes(
  request: IncomingMessage,
  response: ServerResponse,
  method: string,
  pathname: string,
  search: URLSearchParams
): Promise<boolean> {
  if (pathname === '/storage/containers' && method === 'GET') {
    const skip = Number(search.get('skip') ?? '0') || 0;
    const limit = Number(search.get('limit') ?? '100') || 100;
    const containers = getState().containers;
    sendJson(response, 200, {
      containers: containers.slice(skip, skip + limit),
      containersCount: containers.length,
    });
    return true;
  }

  if (pathname === '/storage/folders' && method === 'GET') {
    const container = search.get('container') ?? undefined;
    const query = (search.get('search') ?? '').trim().toLowerCase();
    const skip = Number(search.get('skip') ?? '0') || 0;
    const limit = Number(search.get('limit') ?? '100') || 100;
    let folders = getState().folders;
    if (container) {
      folders = folders.filter(folder => folder.container === container);
    }
    if (query) {
      folders = folders.filter(folder =>
        folder.name.toLowerCase().includes(query)
      );
    }
    sendJson(response, 200, {
      folders: folders.slice(skip, skip + limit),
      folderCount: folders.length,
    });
    return true;
  }

  if (pathname === '/storage/files' && method === 'GET') {
    const container = search.get('container') ?? undefined;
    const skip = Number(search.get('skip') ?? '0') || 0;
    const limit = Number(search.get('limit') ?? '25') || 25;
    let files = getState().files;
    if (container) {
      files = files.filter(file => file.container === container);
    }
    sendJson(response, 200, {
      files: files.slice(skip, skip + limit),
      filesCount: files.length,
    });
    return true;
  }

  if (pathname === '/storage/files/upload' && method === 'POST') {
    const body = await readJsonBody(request);
    if (!isRecord(body)) {
      badRequest(response, 'Invalid upload payload');
      return true;
    }
    const state = getState();
    const file = {
      _id: `file_${++state.fileSeq}`,
      name: readString(body.name) ?? readString(body.alias) ?? 'upload.bin',
      alias: readString(body.alias) ?? readString(body.name) ?? 'upload.bin',
      folder: readString(body.folder) ?? '',
      container: readString(body.container) ?? '',
      size: readNumber(body.size, 0) ?? 0,
      isPublic: false,
      url: '',
      mimeType: readString(body.mimeType) ?? 'application/octet-stream',
      uploadStatus: 'pending' as const,
      bytesUploaded: false,
      createdAt: FIXED_NOW,
      updatedAt: FIXED_NOW,
    };
    state.files.push(file);
    sendJson(response, 200, {
      file,
      url: `http://127.0.0.1:4010/storage/upload-target/${file._id}`,
    });
    return true;
  }

  const uploadTarget = /^\/storage\/upload-target\/([^/]+)$/.exec(pathname);
  if (uploadTarget && method === 'PUT') {
    for await (const _chunk of request) {
      void _chunk;
    }
    const file = getState().files.find(item => item._id === uploadTarget[1]);
    if (!file) {
      notFound(response, 'Upload target not found');
      return true;
    }
    file.bytesUploaded = true;
    sendEmpty(response, 200);
    return true;
  }

  const complete = /^\/storage\/files\/([^/]+)\/complete$/.exec(pathname);
  if (complete && method === 'POST') {
    const state = getState();
    const file = state.files.find(item => item._id === complete[1]);
    if (!file) {
      notFound(response, 'File not found');
      return true;
    }
    if (state.failNextComplete) {
      state.failNextComplete = false;
      state.lastUploadCompleteFailed = true;
      sendJson(response, 400, {
        status: 400,
        message: 'File bytes are not ready',
      });
      return true;
    }
    if (!file.bytesUploaded) {
      sendJson(response, 400, {
        status: 400,
        message: 'File bytes are not ready',
      });
      return true;
    }
    file.uploadStatus = 'ready';
    file.updatedAt = FIXED_NOW;
    state.completedUploadIds.push(file._id);
    state.lastUploadCompleteFailed = false;
    sendJson(response, 200, file);
    return true;
  }

  if (pathname === '/authentication/teams' && method === 'GET') {
    const query = (search.get('search') ?? '').trim().toLowerCase();
    const skip = Number(search.get('skip') ?? '0') || 0;
    const limit = Number(search.get('limit') ?? '100') || 100;
    let teams = getState().teams;
    if (query) {
      teams = teams.filter(team => team.name.toLowerCase().includes(query));
    }
    sendJson(response, 200, {
      teams: teams.slice(skip, skip + limit),
      count: teams.length,
    });
    return true;
  }

  const teamOne = /^\/authentication\/teams\/([^/]+)$/.exec(pathname);
  if (teamOne && method === 'GET') {
    const team = getState().teams.find(item => item._id === teamOne[1]);
    if (!team) {
      notFound(response, 'Team not found');
      return true;
    }
    sendJson(response, 200, team);
    return true;
  }

  if (pathname === '/embeddings/sources' && method === 'GET') {
    if (getState().failNextSourcesList) {
      getState().failNextSourcesList = false;
      sendJson(response, 500, { status: 500, message: 'Sources unavailable' });
      return true;
    }
    const kind = search.get('kind') ?? undefined;
    const stateFilter = search.get('state') ?? undefined;
    const skip = Number(search.get('skip') ?? '0') || 0;
    const limit = Number(search.get('limit') ?? '100') || 100;
    let sources = getState().sources;
    if (kind) sources = sources.filter(source => source.kind === kind);
    if (stateFilter) {
      sources = sources.filter(source => source.state === stateFilter);
    }
    const page = sources.slice(skip, skip + limit);
    sendJson(response, 200, {
      sources: page.map(toApiSource),
      count: sources.length,
    });
    return true;
  }

  if (pathname === '/embeddings/sources' && method === 'POST') {
    const body = await readJsonBody(request);
    if (!isRecord(body) || !isSourceKind(body.kind)) {
      badRequest(response, 'Source type is required.');
      return true;
    }
    const partitionSubject = readString(body.partitionSubject)?.trim();
    if (!partitionSubject || !PARTITION_PATTERN.test(partitionSubject)) {
      badRequest(response, 'Access scope must be a resource such as Team:id.');
      return true;
    }
    const state = getState();
    if (state.failNextSourceCreate) {
      const message = state.failNextSourceCreate;
      state.failNextSourceCreate = undefined;
      badRequest(response, message);
      return true;
    }
    const resolved = resolveProfile(
      readString(body.provider),
      readString(body.model),
      readNumber(body.dimensions)
    );
    if ('error' in resolved) {
      badRequest(response, resolved.error);
      return true;
    }
    let selectors: Record<string, unknown> | undefined;
    if (body.kind === 'conduit-storage') {
      const parsed = validateStorageSelectors(body.selectors);
      if (!parsed.ok) {
        badRequest(response, parsed.error);
        return true;
      }
      selectors = parsed.selectors;
    } else if (
      body.selectors &&
      Object.keys(parseSelectors(body.selectors) ?? {}).length
    ) {
      badRequest(response, 'External sources do not use storage selectors.');
      return true;
    }
    const next: MockEmbeddingSource = {
      _id: `src_${++state.sourceSeq}`,
      label: readString(body.label)?.trim() || undefined,
      kind: body.kind,
      state: 'pending',
      partitionSubject,
      provider: resolved.provider,
      model: resolved.model,
      dimensions: resolved.dimensions,
      similarity:
        body.similarity === 'euclidean' || body.similarity === 'dotProduct'
          ? body.similarity
          : 'cosine',
      selectors,
      metadataAllowlist: readStringArray(body.metadataAllowlist),
      chunkIndexStatus: 'pending',
      createdAt: FIXED_NOW,
      updatedAt: FIXED_NOW,
      counts: emptySourceDocumentCounts(),
    };
    state.sources.push(next);
    sendJson(response, 200, {
      source: toApiSource(next),
      warnings: [
        'The source stays pending until its chunk index is queryable.',
        ...state.sourceWarnings,
      ],
    });
    return true;
  }

  const lifecycle =
    /^\/embeddings\/sources\/([^/]+)\/(status|disable|enable|revoke|reconcile)$/.exec(
      pathname
    );
  if (lifecycle) {
    const source = getState().sources.find(item => item._id === lifecycle[1]);
    if (!source) {
      notFound(response, 'Embedding source not found');
      return true;
    }
    const action = lifecycle[2];
    if (action === 'status' && method === 'GET') {
      sendJson(response, 200, sourceStatusPayload(source));
      return true;
    }
    if (action === 'disable' && method === 'POST') {
      if (source.state === 'pending') {
        badRequest(response, 'Pending sources cannot be disabled.');
        return true;
      }
      source.state = 'disabled';
      source.updatedAt = FIXED_NOW;
      sendJson(response, 200, toApiSource(source));
      return true;
    }
    if (action === 'enable' && method === 'POST') {
      if (source.state !== 'disabled') {
        badRequest(
          response,
          `Embedding source '${source._id}' cannot be enabled`
        );
        return true;
      }
      const override = getState().nextEnable;
      getState().nextEnable = undefined;
      source.state = override?.state ?? 'ready';
      if (override?.chunkIndexStatus) {
        source.chunkIndexStatus = override.chunkIndexStatus;
      }
      source.updatedAt = FIXED_NOW;
      sendJson(response, 200, {
        source: toApiSource(source),
        warnings: override?.warnings ?? [],
      });
      return true;
    }
    if (action === 'revoke' && method === 'POST') {
      source.state = 'revoked';
      source.updatedAt = FIXED_NOW;
      sendJson(response, 200, toApiSource(source));
      return true;
    }
    if (action === 'reconcile' && method === 'POST') {
      if (source.kind !== 'conduit-storage' || source.state !== 'ready') {
        badRequest(
          response,
          `Embedding source '${source._id}' is not ready for reconcile`
        );
        return true;
      }
      source.counts.queuedCount += 2;
      const failed = source.extractionQueue?.failed ?? 0;
      const recovered = failed;
      const discarded = 0;
      if (source.extractionQueue && failed > 0) {
        source.extractionQueue = {
          ...source.extractionQueue,
          waiting: source.extractionQueue.waiting + failed,
          failed: 0,
        };
      }
      const state = getState();
      if (failed > 0 && state.storageQueue.failed > 0) {
        const remediated = Math.min(failed, state.storageQueue.failed);
        state.storageQueue = {
          ...state.storageQueue,
          waiting: state.storageQueue.waiting + remediated,
          failed: state.storageQueue.failed - remediated,
        };
      }
      sendJson(response, 200, {
        queued: 2,
        scanned: 5,
        warnings: [],
        ...(recovered > 0 ? { recovered } : {}),
        ...(discarded > 0 ? { discarded } : {}),
      });
      return true;
    }
    return false;
  }

  const sourceOne = /^\/embeddings\/sources\/([^/]+)$/.exec(pathname);
  if (!sourceOne) return false;
  const state = getState();
  const source = state.sources.find(item => item._id === sourceOne[1]);
  if (!source) {
    notFound(response, 'Embedding source not found');
    return true;
  }
  if (method === 'GET') {
    sendJson(response, 200, { source: toApiSource(source) });
    return true;
  }
  if (method === 'DELETE') {
    state.sources = state.sources.filter(item => item._id !== source._id);
    sendJson(response, 200, {
      source: toApiSource({ ...source, state: 'revoked' }),
      deletedDocuments: source.counts.indexedCount,
      deletedChunks: source.counts.indexedCount,
    });
    return true;
  }
  if (method !== 'PATCH') return false;
  const body = await readJsonBody(request);
  if (!isRecord(body)) {
    badRequest(response, 'Invalid source payload');
    return true;
  }
  if (
    (body.kind != null && body.kind !== source.kind) ||
    (typeof body.partitionSubject === 'string' &&
      body.partitionSubject.trim() !== source.partitionSubject) ||
    (typeof body.provider === 'string' &&
      body.provider.trim() !== source.provider) ||
    (typeof body.model === 'string' && body.model.trim() !== source.model) ||
    (typeof body.dimensions === 'number' &&
      body.dimensions !== source.dimensions) ||
    (typeof body.similarity === 'string' &&
      body.similarity !== source.similarity)
  ) {
    badRequest(
      response,
      'Kind, partitionSubject, and vector profile cannot change after create.'
    );
    return true;
  }
  if (body.label !== undefined) {
    source.label = readString(body.label)?.trim() || undefined;
  }
  if (body.selectors !== undefined) {
    if (source.kind !== 'conduit-storage') {
      badRequest(response, 'External sources do not use storage selectors.');
      return true;
    }
    const parsed = validateStorageSelectors(body.selectors);
    if (!parsed.ok) {
      badRequest(response, parsed.error);
      return true;
    }
    source.selectors = parsed.selectors;
  }
  if (body.metadataAllowlist !== undefined) {
    source.metadataAllowlist = readStringArray(body.metadataAllowlist);
  }
  source.updatedAt = FIXED_NOW;
  sendJson(response, 200, { source: toApiSource(source), warnings: [] });
  return true;
}

function resolveProfile(
  requestedProvider?: string,
  requestedModel?: string,
  requestedDimensions?: number
): { provider: string; model: string; dimensions: number } | { error: string } {
  const settings = getState().settings;
  const providerName =
    requestedProvider || settings.defaultProvider || OPENAI_COMPATIBLE_PROVIDER;
  const provider = settings.providers[providerName];
  if (!provider) {
    return {
      error: `Embedding provider '${providerName}' is not a configured provider`,
    };
  }
  const selected =
    requestedModel ||
    provider.defaultModel.trim() ||
    provider.models[0]?.name ||
    '';
  const model = provider.models.find(item => item.name === selected);
  if (!model) {
    return {
      error: selected
        ? `Model '${selected}' is not in the catalogue for this provider`
        : 'Provider model catalogue has no selectable model',
    };
  }
  if (requestedDimensions != null && requestedDimensions !== model.dimensions) {
    return {
      error: `Requested dimensions ${requestedDimensions} do not match catalogue model ${model.dimensions}`,
    };
  }
  return {
    provider: providerName,
    model: model.name,
    dimensions: model.dimensions,
  };
}
