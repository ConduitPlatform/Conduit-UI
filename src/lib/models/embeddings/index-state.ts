import { BackfillRun } from './backfill';
import {
  isVectorIndexQueryable,
  VectorCapabilities,
  VectorIndexDefinition,
} from './capabilities';
import { EmbeddingConfig, VectorSimilarity } from './config';
import {
  findMatchingIndex,
  isVectorStorageSearchReady,
  SchemaIndexLookup,
} from './readiness';

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

export function canEnableEmbeddingConfig(args: {
  capabilities?: VectorCapabilities;
  matchingIndex?: VectorIndexDefinition;
}): boolean {
  return (
    isVectorStorageSearchReady(args.capabilities) === true &&
    isVectorIndexQueryable(args.matchingIndex)
  );
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
