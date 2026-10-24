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

export type SearchPageModel = {
  configs: EmbeddingConfigOption[];
  schemas: string[];
  initialConfigId: string;
  initialSchema: string;
  fallbackRows: ReadinessRow[];
  readinessByConfigId: Record<string, ReadinessRow[]>;
};

export function buildSearchPageModel(args: {
  configs: EmbeddingConfig[];
  indexesBySchema: Record<string, SchemaIndexLookup>;
  capabilities?: EmbeddingsReadinessInput['capabilities'];
  capabilitiesError?: string;
  settings?: EmbeddingsReadinessInput['settings'];
  settingsError?: string;
  workersEnabled?: boolean;
  configId?: string;
  schemaName?: string;
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
  return {
    configs: args.configs.map(toEmbeddingConfigOption),
    schemas: uniqueSearchSchemas(args.configs),
    initialConfigId: initial?._id ?? '',
    initialSchema: initial?.schemaName ?? args.schemaName ?? '',
    fallbackRows: deriveEmbeddingsReadiness(shared),
    readinessByConfigId,
  };
}

export function searchHitKey(hit: SemanticSearchHit, index: number): string {
  const documentId = hit.document._id;
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

export function sanitizeSearchHits(
  hits: SemanticSearchHit[],
  sourceFields?: readonly string[]
): SemanticSearchHit[] {
  return hits.map(hit => ({
    ...hit,
    document: sanitizeSearchDocument(hit.document, sourceFields),
  }));
}

export function documentColumnKeys(
  hits: SemanticSearchHit[],
  maxColumns = MAX_SEARCH_DOCUMENT_COLUMNS,
  sourceFields?: readonly string[]
): string[] {
  const preferred = ['_id', ...(sourceFields ?? [])];
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
  for (const hit of hits) {
    for (const key of Object.keys(hit.document)) {
      add(key);
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
