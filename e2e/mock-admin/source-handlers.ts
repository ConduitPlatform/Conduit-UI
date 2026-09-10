import type { IncomingMessage, ServerResponse } from 'node:http';
import { FIXED_NOW, OPENAI_COMPATIBLE_PROVIDER } from './constants.ts';
import {
  isRecord,
  readJsonBody,
  readNumber,
  readString,
  readStringArray,
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
  const folderPrefix =
    typeof selectors?.folderPrefix === 'string' && selectors.folderPrefix.trim()
      ? selectors.folderPrefix.trim()
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
    const containers = getState().containers;
    sendJson(response, 200, {
      containers,
      containersCount: containers.length,
    });
    return true;
  }

  if (pathname === '/storage/folders' && method === 'GET') {
    const container = search.get('container') ?? undefined;
    let folders = getState().folders;
    if (container) {
      folders = folders.filter(folder => folder.container === container);
    }
    sendJson(response, 200, { folders, folderCount: folders.length });
    return true;
  }

  if (pathname === '/authentication/teams' && method === 'GET') {
    const teams = getState().teams;
    sendJson(response, 200, { teams, count: teams.length });
    return true;
  }

  if (pathname === '/embeddings/sources' && method === 'GET') {
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
      ],
    });
    return true;
  }

  const lifecycle =
    /^\/embeddings\/sources\/([^/]+)\/(status|disable|revoke|reconcile)$/.exec(
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
      source.state = 'disabled';
      source.updatedAt = FIXED_NOW;
      sendJson(response, 200, toApiSource(source));
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
      sendJson(response, 200, {
        queued: 2,
        scanned: 5,
        warnings: [],
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
