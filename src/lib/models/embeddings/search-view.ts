import { isVectorIndexQueryable } from './capabilities.ts';
import {
  toEmbeddingConfigOption,
  type EmbeddingConfig,
  type EmbeddingConfigOption,
} from './config.ts';
import { findMatchingIndex } from './index-state.ts';
import {
  deriveEmbeddingsReadiness,
  type EmbeddingsReadinessInput,
  type ReadinessRow,
  type ReadinessRowId,
  type SchemaIndexLookup,
} from './readiness.ts';
import { parseOperatorFilterJson } from './operator-filter.ts';
import type { SemanticSearchHit } from './search.ts';
import { isSensitiveFieldName } from './source-fields.ts';
import {
  GENERIC_SEARCH_SAFE_FIELDS,
  isSourceSearchable,
  sourceDisplayName,
  type EmbeddingSource,
} from './source.ts';

export const DEFAULT_SEARCH_LIMIT = 10;
export const MIN_SEARCH_LIMIT = 1;
export const MAX_SEARCH_LIMIT = 50;
export const MAX_SEARCH_DOCUMENT_COLUMNS = 6;
export const MAX_SEARCH_DOCUMENT_DEPTH = 4;
export const MAX_SEARCH_DOCUMENT_KEYS = 32;
export const MAX_SEARCH_DOCUMENT_STRING = 2048;
export const MAX_SEARCH_DOCUMENT_ARRAY = 32;

export const SEARCH_VIEW_MODES = ['table', 'json'] as const;

export type SearchViewMode = (typeof SEARCH_VIEW_MODES)[number];

export type SearchLimitParseResult =
  | { ok: true; limit: number }
  | { ok: false; error: string };

export function isSearchViewMode(value: string): value is SearchViewMode {
  return SEARCH_VIEW_MODES.some(mode => mode === value);
}

export const SEARCH_GATE_ROW_IDS: readonly ReadinessRowId[] = [
  'capabilities',
  'provider',
  'index',
  'config',
];

export function isSearchReady(rows: ReadinessRow[]): boolean {
  if (rows.length === 0) return false;
  return SEARCH_GATE_ROW_IDS.every(
    id => rows.find(row => row.id === id)?.state === 'ready'
  );
}

export function searchBlockAction(
  rows: ReadinessRow[]
): ReadinessRow | undefined {
  if (isSearchReady(rows)) return undefined;
  return rows.find(
    row =>
      SEARCH_GATE_ROW_IDS.some(id => id === row.id) &&
      row.state !== 'ready' &&
      row.href
  );
}

export function isSearchableConfig(
  config: EmbeddingConfig,
  lookup: SchemaIndexLookup | undefined
): boolean {
  if (!config.enabled) return false;
  if (lookup == null || lookup === 'unknown') return false;
  const match = findMatchingIndex(config, lookup);
  return Boolean(match && isVectorIndexQueryable(match));
}

export function uniqueSearchSchemas(configs: EmbeddingConfig[]): string[] {
  const names = new Set<string>();
  for (const config of configs) names.add(config.schemaName);
  return [...names].sort((left, right) => left.localeCompare(right));
}

export function pickInitialSearchConfig<T extends EmbeddingConfig>(args: {
  configs: T[];
  indexesBySchema: Record<string, SchemaIndexLookup>;
  configId?: string;
  schemaName?: string;
}): T | undefined {
  const { configs, indexesBySchema, configId, schemaName } = args;
  if (configs.length === 0) return undefined;
  const byId = configId
    ? configs.find(config => config._id === configId)
    : undefined;
  if (byId) return byId;
  const scoped = schemaName
    ? configs.filter(config => config.schemaName === schemaName)
    : configs;
  const pool = scoped.length > 0 ? scoped : configs;
  return (
    pool.find(config =>
      isSearchableConfig(config, indexesBySchema[config.schemaName])
    ) ?? pool[0]
  );
}

export type SearchTarget =
  | {
      type: 'schema';
      id: string;
      configId: string;
      schemaName: string;
      label: string;
    }
  | {
      type: 'source';
      id: string;
      sourceId: string;
      kind: EmbeddingSource['kind'];
      label: string;
      ready: boolean;
    };

export type SearchPageModel = {
  configs: EmbeddingConfigOption[];
  schemas: string[];
  sources: EmbeddingSource[];
  targets: SearchTarget[];
  initialTargetId: string;
  initialConfigId: string;
  initialSchema: string;
  fallbackRows: ReadinessRow[];
  readinessByConfigId: Record<string, ReadinessRow[]>;
};

export function toSchemaSearchTarget(config: EmbeddingConfig): SearchTarget {
  return {
    type: 'schema',
    id: `schema:${config._id}`,
    configId: config._id,
    schemaName: config.schemaName,
    label: `${config.schemaName} · ${config.targetField}`,
  };
}

export function toSourceSearchTarget(source: EmbeddingSource): SearchTarget {
  return {
    type: 'source',
    id: `source:${source._id}`,
    sourceId: source._id,
    kind: source.kind,
    label: `${sourceDisplayName(source)} · ${source.kind === 'conduit-storage' ? 'Storage' : 'External'}`,
    ready: isSourceSearchable(source),
  };
}

export function buildSearchTargets(args: {
  configs: EmbeddingConfig[];
  sources?: EmbeddingSource[];
}): SearchTarget[] {
  return [
    ...args.configs.map(toSchemaSearchTarget),
    ...(args.sources ?? []).map(toSourceSearchTarget),
  ];
}

export function pickInitialSearchTarget(args: {
  targets: SearchTarget[];
  targetId?: string;
  configId?: string;
  sourceId?: string;
  schemaName?: string;
}): SearchTarget | undefined {
  const { targets, targetId, configId, sourceId, schemaName } = args;
  if (targets.length === 0) return undefined;
  if (targetId) {
    const matched = targets.find(target => target.id === targetId);
    if (matched) return matched;
  }
  if (sourceId) {
    const matched = targets.find(
      target => target.type === 'source' && target.sourceId === sourceId
    );
    if (matched) return matched;
  }
  if (configId) {
    const matched = targets.find(
      target => target.type === 'schema' && target.configId === configId
    );
    if (matched) return matched;
  }
  if (schemaName) {
    const matched = targets.find(
      target => target.type === 'schema' && target.schemaName === schemaName
    );
    if (matched) return matched;
  }
  return (
    targets.find(target => target.type === 'schema') ??
    targets.find(target => target.type === 'source' && target.ready) ??
    targets[0]
  );
}

export function buildSearchPageModel(args: {
  configs: EmbeddingConfig[];
  indexesBySchema: Record<string, SchemaIndexLookup>;
  sources?: EmbeddingSource[];
  capabilities?: EmbeddingsReadinessInput['capabilities'];
  capabilitiesError?: string;
  settings?: EmbeddingsReadinessInput['settings'];
  settingsError?: string;
  workersEnabled?: boolean;
  configId?: string;
  schemaName?: string;
  sourceId?: string;
  targetId?: string;
}): SearchPageModel {
  const initial = pickInitialSearchConfig({
    configs: args.configs,
    indexesBySchema: args.indexesBySchema,
    configId: args.configId,
    schemaName: args.schemaName,
  });
  const shared = {
    capabilities: args.capabilities,
    capabilitiesError: args.capabilitiesError,
    settings: args.settings,
    settingsError: args.settingsError,
    configs: args.configs,
    indexesBySchema: args.indexesBySchema,
    workersEnabled: args.workersEnabled,
  };
  const readinessByConfigId: Record<string, ReadinessRow[]> = {};
  for (const config of args.configs) {
    readinessByConfigId[config._id] = deriveEmbeddingsReadiness({
      ...shared,
      selectedConfigId: config._id,
    });
  }
  const targets = buildSearchTargets({
    configs: args.configs,
    sources: args.sources,
  });
  const initialTarget = pickInitialSearchTarget({
    targets,
    targetId: args.targetId,
    configId: args.configId ?? initial?._id,
    sourceId: args.sourceId,
    schemaName: args.schemaName ?? initial?.schemaName,
  });
  return {
    configs: args.configs.map(toEmbeddingConfigOption),
    schemas: uniqueSearchSchemas(args.configs),
    sources: args.sources ?? [],
    targets,
    initialTargetId: initialTarget?.id ?? '',
    initialConfigId:
      initialTarget?.type === 'schema'
        ? initialTarget.configId
        : (initial?._id ?? ''),
    initialSchema:
      initialTarget?.type === 'schema'
        ? initialTarget.schemaName
        : (initial?.schemaName ?? args.schemaName ?? ''),
    fallbackRows: deriveEmbeddingsReadiness(shared),
    readinessByConfigId,
  };
}

export function searchHitKey(hit: SemanticSearchHit, index: number): string {
  const chunkKey = hit.document.chunkKey;
  const documentId = hit.document.documentId ?? hit.document._id;
  if (typeof chunkKey === 'string' && chunkKey.length > 0) {
    return typeof documentId === 'string' && documentId.length > 0
      ? `${documentId}:${chunkKey}`
      : chunkKey;
  }
  if (typeof documentId === 'string' && documentId.length > 0) {
    return documentId;
  }
  if (typeof documentId === 'number' && Number.isFinite(documentId)) {
    return String(documentId);
  }
  return `hit-${index}-${hit.score}`;
}

export function parseSearchLimit(raw: string): SearchLimitParseResult {
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || !Number.isFinite(parsed)) {
    return {
      ok: false,
      error: `Results must be an integer from ${MIN_SEARCH_LIMIT} to ${MAX_SEARCH_LIMIT}.`,
    };
  }
  if (parsed < MIN_SEARCH_LIMIT || parsed > MAX_SEARCH_LIMIT) {
    return {
      ok: false,
      error: `Results must be between ${MIN_SEARCH_LIMIT} and ${MAX_SEARCH_LIMIT}.`,
    };
  }
  return { ok: true, limit: parsed };
}

export function clampSearchLimit(value: number): number {
  return Math.min(MAX_SEARCH_LIMIT, Math.max(MIN_SEARCH_LIMIT, value));
}

export function parseSearchFilter(raw: string) {
  return parseOperatorFilterJson(raw);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isLikelyVector(value: unknown): boolean {
  if (!Array.isArray(value) || value.length < 8) return false;
  return value.every(item => typeof item === 'number');
}

function isSecretLikeKey(key: string): boolean {
  if (key === '__proto__' || key === 'prototype' || key === 'constructor') {
    return true;
  }
  return isSensitiveFieldName(key);
}

function capString(value: string): string {
  if (value.length <= MAX_SEARCH_DOCUMENT_STRING) return value;
  return value.slice(0, MAX_SEARCH_DOCUMENT_STRING);
}

export function sanitizeSearchValue(value: unknown, depth = 1): unknown {
  if (depth > MAX_SEARCH_DOCUMENT_DEPTH) return undefined;
  if (value == null) return value;
  if (typeof value === 'string') return capString(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (isLikelyVector(value)) return undefined;
  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_SEARCH_DOCUMENT_ARRAY)
      .map(item => sanitizeSearchValue(item, depth + 1))
      .filter(item => item !== undefined);
  }
  if (!isRecord(value)) return undefined;
  const sanitized: Record<string, unknown> = {};
  let count = 0;
  for (const [key, nested] of Object.entries(value)) {
    if (count >= MAX_SEARCH_DOCUMENT_KEYS) break;
    if (isSecretLikeKey(key)) continue;
    const next = sanitizeSearchValue(nested, depth + 1);
    if (next === undefined && nested !== undefined && nested !== null) {
      continue;
    }
    sanitized[key] = next;
    count += 1;
  }
  return sanitized;
}

export function sanitizeSearchDocument(
  document: Record<string, unknown>,
  sourceFields?: readonly string[]
): Record<string, unknown> {
  const sanitized = sanitizeSearchValue(document);
  if (!isRecord(sanitized)) return {};
  if (!sourceFields || sourceFields.length === 0) return sanitized;
  const picked: Record<string, unknown> = {};
  if ('_id' in sanitized) picked._id = sanitized._id;
  for (const field of sourceFields) {
    if (field === '_id') continue;
    if (field in sanitized) picked[field] = sanitized[field];
  }
  return picked;
}

export function isGenericSearchDocument(
  document: Record<string, unknown>
): boolean {
  return (
    typeof document.sourceId === 'string' &&
    (typeof document.chunkKey === 'string' ||
      typeof document.documentId === 'string')
  );
}

export function sanitizeGenericSearchDocument(
  document: Record<string, unknown>
): Record<string, unknown> {
  const sanitized = sanitizeSearchValue(document);
  if (!isRecord(sanitized)) return {};
  const picked: Record<string, unknown> = {};
  for (const field of GENERIC_SEARCH_SAFE_FIELDS) {
    if (field in sanitized) picked[field] = sanitized[field];
  }
  if (isRecord(picked.metadata)) {
    const metadata: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(picked.metadata)) {
      if (isSecretLikeKey(key)) continue;
      metadata[key] = value;
    }
    if (Object.keys(metadata).length > 0) picked.metadata = metadata;
    else delete picked.metadata;
  }
  return picked;
}

export function sanitizeSearchHits(
  hits: SemanticSearchHit[],
  sourceFields?: readonly string[]
): SemanticSearchHit[] {
  return hits.map(hit => ({
    ...hit,
    document: isGenericSearchDocument(hit.document)
      ? sanitizeGenericSearchDocument(hit.document)
      : sanitizeSearchDocument(hit.document, sourceFields),
  }));
}

export function documentColumnKeys(
  hits: SemanticSearchHit[],
  maxColumns = MAX_SEARCH_DOCUMENT_COLUMNS,
  sourceFields?: readonly string[]
): string[] {
  const generic = hits.some(hit => isGenericSearchDocument(hit.document));
  const preferred = generic
    ? [...GENERIC_SEARCH_SAFE_FIELDS]
    : ['_id', ...(sourceFields ?? [])];
  const seen = new Set<string>();
  const keys: string[] = [];
  const add = (key: string) => {
    if (seen.has(key) || keys.length >= maxColumns) return;
    if (isSecretLikeKey(key)) return;
    if (hits.some(hit => isLikelyVector(hit.document[key]))) return;
    seen.add(key);
    keys.push(key);
  };
  for (const key of preferred) {
    if (hits.some(hit => key in hit.document)) add(key);
  }
  if (!generic) {
    for (const hit of hits) {
      for (const key of Object.keys(hit.document)) {
        add(key);
      }
    }
  }
  return keys;
}

export function formatSearchScore(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}

export function searchHitLabel(index: number, hit: SemanticSearchHit): string {
  const score = formatSearchScore(hit.score);
  const provider = hit.provider ? `, provider ${hit.provider}` : '';
  const distance =
    hit.distance == null ? '' : `, distance ${formatSearchScore(hit.distance)}`;
  return `Result ${index + 1}. Score ${score}, higher is better${provider}${distance}`;
}
