import { isVectorIndexQueryable } from './capabilities.ts';
import type { EmbeddingConfig } from './config.ts';
import { findMatchingIndex } from './index-state.ts';
import type {
  ReadinessRow,
  ReadinessRowId,
  SchemaIndexLookup,
} from './readiness.ts';
import type { SemanticSearchHit } from './search.ts';
import { parseOperatorFilterJson } from './backfill-view.ts';

export const DEFAULT_SEARCH_LIMIT = 10;
export const MIN_SEARCH_LIMIT = 1;
export const MAX_SEARCH_LIMIT = 50;
export const MAX_SEARCH_DOCUMENT_COLUMNS = 6;

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

export function pickInitialSearchConfig(args: {
  configs: EmbeddingConfig[];
  indexesBySchema: Record<string, SchemaIndexLookup>;
  configId?: string;
  schemaName?: string;
}): EmbeddingConfig | undefined {
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

function isLikelyVector(value: unknown): boolean {
  if (!Array.isArray(value) || value.length < 8) return false;
  return value.every(item => typeof item === 'number');
}

export function documentColumnKeys(
  hits: SemanticSearchHit[],
  maxColumns = MAX_SEARCH_DOCUMENT_COLUMNS
): string[] {
  const seen = new Set<string>();
  const keys: string[] = [];
  for (const hit of hits) {
    for (const key of Object.keys(hit.document)) {
      if (seen.has(key)) continue;
      if (isLikelyVector(hit.document[key])) continue;
      seen.add(key);
      keys.push(key);
    }
  }
  keys.sort((left, right) => {
    if (left === '_id') return -1;
    if (right === '_id') return 1;
    return left.localeCompare(right);
  });
  return keys.slice(0, maxColumns);
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
