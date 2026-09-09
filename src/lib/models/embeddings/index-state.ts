import { BackfillRun } from './backfill';
import {
  DEFAULT_VECTOR_INDEX_METHOD,
  isVectorIndexQueryable,
  isVectorStorageSearchReady,
  VectorCapabilities,
  VectorIndexDefinition,
  VectorIndexMethod,
} from './capabilities';
import { EmbeddingConfig, VectorSimilarity } from './config';
import type { SchemaIndexLookup } from './readiness';

export const CONFIG_INDEX_STATES = [
  'ready',
  'pending',
  'failed',
  'missing',
  'unknown',
] as const;

export type ConfigIndexState = (typeof CONFIG_INDEX_STATES)[number];

export type EmbeddingConfigListRow = {
  config: EmbeddingConfig;
  indexState: ConfigIndexState;
  latestBackfill?: BackfillRun;
};

export function resolveConfigIndexState(
  config: EmbeddingConfig,
  lookup: SchemaIndexLookup | undefined
): ConfigIndexState {
  if (lookup == null || lookup === 'unknown') return 'unknown';
  const match = findMatchingIndex(config, lookup);
  if (!match) return 'missing';
  if (match.status === 'failed') return 'failed';
  if (isVectorIndexQueryable(match)) return 'ready';
  return 'pending';
}

export type MatchingIndexView = {
  state: ConfigIndexState;
  name?: string;
  field: string;
  dimensions: number;
  similarity: VectorSimilarity;
  method: VectorIndexMethod;
  generation: number;
  queryable: boolean;
};

export function toMatchingIndexView(
  config: EmbeddingConfig,
  lookup?: SchemaIndexLookup
): MatchingIndexView {
  const match =
    lookup && lookup !== 'unknown'
      ? findMatchingIndex(config, lookup)
      : undefined;
  const parsed = parseIndexGeneration(match?.name);
  return {
    state: resolveConfigIndexState(config, lookup),
    name: match?.name,
    field: match?.field ?? config.targetField,
    dimensions: match?.dimensions ?? config.dimensions,
    similarity: match?.similarity ?? config.similarity,
    method: match?.method ?? DEFAULT_VECTOR_INDEX_METHOD,
    generation: parsed.generation,
    queryable: match ? isVectorIndexQueryable(match) : false,
  };
}

export function configIndexStateLabel(state: ConfigIndexState): string {
  switch (state) {
    case 'ready':
      return 'Ready';
    case 'pending':
      return 'Pending';
    case 'failed':
      return 'Failed';
    case 'missing':
      return 'Missing';
    case 'unknown':
      return 'Unknown';
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}

export function similarityLabel(value: VectorSimilarity): string {
  switch (value) {
    case 'cosine':
      return 'Cosine';
    case 'euclidean':
      return 'Euclidean';
    case 'dotProduct':
      return 'Dot product';
    default: {
      const exhaustive: never = value;
      return exhaustive;
    }
  }
}

export function parseIndexGeneration(name?: string): {
  base: string;
  generation: number;
} {
  if (!name) return { base: '', generation: 0 };
  const match = /^(.*)_v(\d+)$/.exec(name);
  if (match) {
    return { base: match[1], generation: Number(match[2]) };
  }
  return { base: name, generation: 1 };
}

export function vectorIndexGeneration(name?: string): number {
  if (typeof name !== 'string' || name.length === 0) return 0;
  return parseIndexGeneration(name).generation;
}

export function defaultVectorIndexName(field: string): string {
  return `${field}_vector`;
}

export function vectorIndexMatchesConfig(
  index: VectorIndexDefinition,
  config: Pick<EmbeddingConfig, 'targetField' | 'dimensions' | 'similarity'>
): boolean {
  if (index.field !== config.targetField) return false;
  if (index.dimensions !== config.dimensions) return false;
  if (index.similarity !== config.similarity) return false;
  return (
    (index.method ?? DEFAULT_VECTOR_INDEX_METHOD) ===
    DEFAULT_VECTOR_INDEX_METHOD
  );
}

export function findMatchingIndex(
  config: Pick<EmbeddingConfig, 'targetField' | 'dimensions' | 'similarity'>,
  indexes: readonly VectorIndexDefinition[]
): VectorIndexDefinition | undefined {
  const matches = indexes.filter(index =>
    vectorIndexMatchesConfig(index, config)
  );
  if (matches.length === 0) return undefined;
  const defaultName = defaultVectorIndexName(config.targetField);
  return matches.reduce((best, current) => {
    const bestGeneration = vectorIndexGeneration(best.name);
    const currentGeneration = vectorIndexGeneration(current.name);
    if (currentGeneration !== bestGeneration) {
      return currentGeneration > bestGeneration ? current : best;
    }
    if (current.name === defaultName) return current;
    if (best.name === defaultName) return best;
    return best;
  });
}

export type EmbeddingConfigEnableBlock = {
  reason: string;
  href?: string;
  actionLabel?: string;
};

export function canEnableEmbeddingConfig(args: {
  capabilities?: VectorCapabilities;
  matchingIndex?: VectorIndexDefinition;
  workersEnabled?: boolean;
}): boolean {
  return (
    args.workersEnabled === true &&
    isVectorStorageSearchReady(args.capabilities) === true &&
    isVectorIndexQueryable(args.matchingIndex)
  );
}

export function embeddingConfigEnableBlock(args: {
  capabilities?: VectorCapabilities;
  matchingIndex?: VectorIndexDefinition;
  workersEnabled?: boolean;
}): EmbeddingConfigEnableBlock | undefined {
  if (canEnableEmbeddingConfig(args)) return undefined;
  if (args.workersEnabled !== true) {
    return {
      reason: 'Enable workers before turning this config on.',
      href: '/embeddings/settings',
      actionLabel: 'Open settings',
    };
  }
  if (isVectorStorageSearchReady(args.capabilities) !== true) {
    return {
      reason:
        'Enablement stays off until vector storage and search are available.',
    };
  }
  return {
    reason: 'Enablement stays off until a matching index is queryable.',
  };
}

function backfillTimestamp(run: BackfillRun): number {
  const raw = run.updatedAt ?? run.startedAt ?? run.createdAt;
  if (!raw) return 0;
  const time = Date.parse(raw);
  return Number.isFinite(time) ? time : 0;
}

export function pickLatestBackfill(
  runs: BackfillRun[],
  config: EmbeddingConfig
): BackfillRun | undefined {
  const matched = runs.filter(
    run =>
      run.configId === config._id ||
      (!run.configId && run.schemaName === config.schemaName)
  );
  if (matched.length === 0) return undefined;
  return matched.reduce((latest, run) =>
    backfillTimestamp(run) >= backfillTimestamp(latest) ? run : latest
  );
}

export function buildConfigListRows(
  configs: EmbeddingConfig[],
  indexesBySchema: Record<string, SchemaIndexLookup>,
  runs: BackfillRun[]
): EmbeddingConfigListRow[] {
  return configs.map(config => ({
    config,
    indexState: resolveConfigIndexState(
      config,
      indexesBySchema[config.schemaName]
    ),
    latestBackfill: pickLatestBackfill(runs, config),
  }));
}
