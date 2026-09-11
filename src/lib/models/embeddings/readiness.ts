import {
  isVectorIndexQueryable,
  isVectorStorageSearchReady,
  VectorCapabilities,
  VectorIndexDefinition,
} from '@/lib/models/embeddings/capabilities';
import { EmbeddingConfig } from '@/lib/models/embeddings/config';
import {
  isConfigModelInCatalogue,
  listConfiguredProviders,
  MODEL_ABSENT_DETAIL,
  SETTINGS_CTA_LABEL,
  SETTINGS_HREF,
} from '@/lib/models/embeddings/config-catalogue';
import { findMatchingIndex } from '@/lib/models/embeddings/index-state';
import {
  EmbeddingsSettings,
  OPENAI_COMPATIBLE_PROVIDER,
} from '@/lib/models/embeddings/settings';
import {
  isSourceOperationallyQueryable,
  sourceIndexState,
  type EmbeddingSource,
} from '@/lib/models/embeddings/source';
import {
  isCatalogueModelValid,
  parseHttpsEndpoint,
} from '@/lib/models/embeddings/settings-form';

export const READINESS_STATES = [
  'ready',
  'waiting',
  'blocked',
  'unknown',
] as const;

export type ReadinessState = (typeof READINESS_STATES)[number];

export const READINESS_ROW_IDS = [
  'capabilities',
  'provider',
  'index',
  'config',
  'workers',
] as const;

export type ReadinessRowId = (typeof READINESS_ROW_IDS)[number];

export type ReadinessRow = {
  id: ReadinessRowId;
  label: string;
  state: ReadinessState;
  detail: string;
  href?: string;
  actionLabel?: string;
};

export type SchemaIndexLookup = VectorIndexDefinition[] | 'unknown';

export { findMatchingIndex } from '@/lib/models/embeddings/index-state';
export { isVectorStorageSearchReady } from '@/lib/models/embeddings/capabilities';

export type EmbeddingsReadinessInput = {
  capabilities?: VectorCapabilities;
  capabilitiesError?: string;
  settings?: EmbeddingsSettings;
  settingsError?: string;
  configs?: EmbeddingConfig[];
  configsError?: string;
  sources?: EmbeddingSource[];
  sourcesError?: string;
  indexesBySchema?: Record<string, SchemaIndexLookup>;
  selectedConfigId?: string;
  workersEnabled?: boolean;
};

export function isProviderConfigured(
  settings: EmbeddingsSettings | undefined
): boolean | undefined {
  if (!settings) return undefined;
  const name = settings.defaultProvider || OPENAI_COMPATIBLE_PROVIDER;
  const provider =
    settings.providers[name] ?? settings.providers[OPENAI_COMPATIBLE_PROVIDER];
  if (!provider) return false;
  if (!provider.apiKeyConfigured) return false;
  if (!parseHttpsEndpoint(provider.endpoint)) return false;
  const validModels = provider.models.filter(isCatalogueModelValid);
  if (validModels.length === 0) return false;
  const selected = provider.defaultModel.trim();
  if (selected && !validModels.some(model => model.name === selected)) {
    return false;
  }
  return true;
}

function configHref(config?: EmbeddingConfig): string {
  return config ? `/embeddings/configs/${config._id}` : '/embeddings/configs';
}

function idleCatalogueIndex(): Pick<
  ReadinessRow,
  'state' | 'detail' | 'href' | 'actionLabel'
> {
  return {
    state: 'ready',
    detail: 'No configured workload',
  };
}

function evaluateSchemaIndexRow(
  configs: EmbeddingConfig[],
  indexesBySchema: Record<string, SchemaIndexLookup> | undefined,
  selectedConfig?: EmbeddingConfig
): Pick<ReadinessRow, 'state' | 'detail' | 'href' | 'actionLabel'> {
  let sawUnknown = false;
  let pending: EmbeddingConfig | undefined;
  let failed: EmbeddingConfig | undefined;
  let missing: EmbeddingConfig | undefined;
  let readyConfig: EmbeddingConfig | undefined;

  for (const config of configs) {
    const lookup = indexesBySchema?.[config.schemaName];
    if (lookup == null || lookup === 'unknown') {
      sawUnknown = true;
      continue;
    }
    const match = findMatchingIndex(config, lookup);
    if (!match) {
      missing ??= config;
      continue;
    }
    if (isVectorIndexQueryable(match)) {
      readyConfig = config;
      break;
    }
    if (match.status === 'failed') {
      failed ??= config;
      continue;
    }
    pending ??= config;
  }

  if (readyConfig) {
    return { state: 'ready', detail: 'Matching index is queryable' };
  }
  if (failed) {
    return {
      state: 'blocked',
      detail: 'Matching index failed',
      href: configHref(selectedConfig ?? failed),
      actionLabel: 'Open config',
    };
  }
  if (pending) {
    return {
      state: 'waiting',
      detail: 'Matching index is not queryable yet',
      href: configHref(selectedConfig ?? pending),
      actionLabel: 'Open config',
    };
  }
  if (missing) {
    return {
      state: 'blocked',
      detail: 'No index matches field, dimensions, similarity, and method',
      href: configHref(selectedConfig ?? missing),
      actionLabel: 'Open config',
    };
  }
  if (sawUnknown) {
    return { state: 'unknown', detail: 'Index status unavailable' };
  }
  return {
    state: 'blocked',
    detail: 'No index matches field, dimensions, similarity, and method',
    href: configHref(selectedConfig),
    actionLabel: selectedConfig ? 'Open config' : 'Open Configs',
  };
}

function evaluateSourceIndexRow(
  sources: EmbeddingSource[]
): Pick<ReadinessRow, 'state' | 'detail' | 'href' | 'actionLabel'> {
  if (sources.some(isSourceOperationallyQueryable)) {
    return { state: 'ready', detail: 'Matching index is queryable' };
  }
  const active = sources.filter(
    source =>
      source.state === 'ready' ||
      source.state === 'pending' ||
      source.state === 'failed'
  );
  if (active.length === 0) {
    return idleCatalogueIndex();
  }
  if (sources.some(source => sourceIndexState(source) === 'failed')) {
    return {
      state: 'blocked',
      detail: 'Matching index failed',
      href: '/embeddings/configs',
      actionLabel: 'Open Configs',
    };
  }
  if (sources.some(source => sourceIndexState(source) === 'pending')) {
    return {
      state: 'waiting',
      detail: 'Matching index is not queryable yet',
      href: '/embeddings/configs',
      actionLabel: 'Open Configs',
    };
  }
  return {
    state: 'blocked',
    detail: 'Chunk index status is unknown',
    href: '/embeddings/configs',
    actionLabel: 'Open Configs',
  };
}

function preferIndexEval(
  left?: Pick<ReadinessRow, 'state' | 'detail' | 'href' | 'actionLabel'>,
  right?: Pick<ReadinessRow, 'state' | 'detail' | 'href' | 'actionLabel'>
): Pick<ReadinessRow, 'state' | 'detail' | 'href' | 'actionLabel'> | undefined {
  if (left?.state === 'ready') return left;
  if (right?.state === 'ready') return right;
  if (left?.state === 'waiting') return left;
  if (right?.state === 'waiting') return right;
  if (left?.state === 'blocked') return left;
  if (right?.state === 'blocked') return right;
  return left ?? right;
}

function evaluateIndexRow(
  configs: EmbeddingConfig[] | undefined,
  configsError: string | undefined,
  sources: EmbeddingSource[] | undefined,
  sourcesError: string | undefined,
  indexesBySchema: Record<string, SchemaIndexLookup> | undefined,
  selectedConfig?: EmbeddingConfig
): Pick<ReadinessRow, 'state' | 'detail' | 'href' | 'actionLabel'> {
  if (selectedConfig) {
    if (configsError) {
      return { state: 'unknown', detail: 'Config list unavailable' };
    }
    if (!configs) {
      return { state: 'unknown', detail: 'Index status unavailable' };
    }
    return evaluateSchemaIndexRow(
      [selectedConfig],
      indexesBySchema,
      selectedConfig
    );
  }

  if (configsError && sourcesError) {
    return { state: 'unknown', detail: 'Config list unavailable' };
  }

  const schemaEval =
    !configsError && configs && configs.length > 0
      ? evaluateSchemaIndexRow(configs, indexesBySchema)
      : undefined;
  const sourceEval =
    !sourcesError && sources && sources.length > 0
      ? evaluateSourceIndexRow(sources)
      : undefined;
  const merged = preferIndexEval(schemaEval, sourceEval);
  if (merged) return merged;

  if (configsError) {
    return { state: 'unknown', detail: 'Config list unavailable' };
  }
  if (sourcesError && (!configs || configs.length === 0)) {
    return { state: 'unknown', detail: 'Generic sources could not be loaded' };
  }
  if (configs && sources) {
    return idleCatalogueIndex();
  }
  if (!configs && !sources) {
    return { state: 'unknown', detail: 'Index status unavailable' };
  }
  return idleCatalogueIndex();
}

function evaluateConfigRow(
  input: EmbeddingsReadinessInput,
  selectedConfig?: EmbeddingConfig
): ReadinessRow {
  const configRow: ReadinessRow = {
    id: 'config',
    label: 'Config enabled',
    state: 'unknown',
    detail: 'Config list unavailable',
  };

  if (selectedConfig) {
    if (input.configsError) {
      configRow.detail = input.configsError;
      return configRow;
    }
    if (!input.configs) return configRow;
    const providers = listConfiguredProviders(input.settings);
    const missingModel =
      input.settings != null &&
      !isConfigModelInCatalogue(selectedConfig, providers);
    if (missingModel) {
      configRow.state = 'blocked';
      configRow.detail = MODEL_ABSENT_DETAIL;
      configRow.href = SETTINGS_HREF;
      configRow.actionLabel = SETTINGS_CTA_LABEL;
      return configRow;
    }
    if (selectedConfig.enabled) {
      configRow.state = 'ready';
      configRow.detail = 'This config is enabled';
      return configRow;
    }
    configRow.state = 'blocked';
    configRow.detail = 'Enable this config after the index is ready';
    configRow.href = configHref(selectedConfig);
    configRow.actionLabel = 'Open config';
    return configRow;
  }

  if (input.configsError && input.sourcesError) {
    configRow.detail = input.configsError;
    return configRow;
  }

  const hasEnabledSchema =
    !input.configsError &&
    (input.configs?.some(config => config.enabled) ?? false);
  const hasReadySource =
    !input.sourcesError &&
    (input.sources?.some(source => source.state === 'ready') ?? false);

  if (hasEnabledSchema || hasReadySource) {
    configRow.state = 'ready';
    configRow.detail = hasEnabledSchema
      ? hasReadySource
        ? 'At least one schema config or generic source is enabled'
        : 'At least one config is enabled'
      : 'At least one generic source is ready';
    return configRow;
  }

  const configsKnown = !input.configsError && input.configs != null;
  const sourcesKnown = !input.sourcesError && input.sources != null;
  const activeSources = (input.sources ?? []).filter(
    source =>
      source.state === 'ready' ||
      source.state === 'pending' ||
      source.state === 'failed'
  );
  if (
    configsKnown &&
    input.configs?.length === 0 &&
    (!sourcesKnown || activeSources.length === 0)
  ) {
    configRow.state = 'ready';
    configRow.detail = 'No configured workload';
    return configRow;
  }
  if (
    !input.sourcesError &&
    (input.sources?.some(source => source.state === 'pending') ?? false)
  ) {
    configRow.state = 'waiting';
    configRow.detail = 'Generic sources are pending';
    configRow.href = '/embeddings/configs';
    configRow.actionLabel = 'Open Configs';
    return configRow;
  }
  if (input.configsError && !sourcesKnown) {
    configRow.detail = input.configsError;
    return configRow;
  }
  if (input.sourcesError && !configsKnown) {
    configRow.detail = 'Generic sources could not be loaded';
    return configRow;
  }
  if (!configsKnown && !sourcesKnown) {
    return configRow;
  }

  configRow.state = 'blocked';
  configRow.detail =
    'Enable a schema config or generic source after the index is ready';
  configRow.href = configHref(input.configs?.[0]);
  configRow.actionLabel = 'Open Configs';
  return configRow;
}

export function isCatalogueSearchReady(rows: ReadinessRow[]): boolean {
  return (
    rows.find(row => row.id === 'index')?.state === 'ready' &&
    rows.find(row => row.id === 'config')?.state === 'ready'
  );
}

export function deriveEmbeddingsReadiness(
  input: EmbeddingsReadinessInput
): ReadinessRow[] {
  const selectedConfig = input.selectedConfigId
    ? input.configs?.find(config => config._id === input.selectedConfigId)
    : undefined;

  const capabilitiesReady = isVectorStorageSearchReady(input.capabilities);
  const capabilitiesRow: ReadinessRow = {
    id: 'capabilities',
    label: 'Vector storage and search',
    state: 'unknown',
    detail: 'Capabilities unavailable',
  };
  if (input.capabilitiesError) {
    capabilitiesRow.detail = input.capabilitiesError;
  } else if (capabilitiesReady === true) {
    capabilitiesRow.state = 'ready';
    capabilitiesRow.detail = 'Storage and search are available';
  } else if (capabilitiesReady === false) {
    capabilitiesRow.state = 'blocked';
    capabilitiesRow.detail =
      input.capabilities?.reason ??
      'This database does not support vector storage and search';
    capabilitiesRow.href = '/database';
    capabilitiesRow.actionLabel = 'Open Database';
  }

  const providerReady = isProviderConfigured(input.settings);
  const providerRow: ReadinessRow = {
    id: 'provider',
    label: 'Provider configured',
    state: 'unknown',
    detail: 'Provider settings unavailable',
  };
  if (input.settingsError) {
    providerRow.detail = input.settingsError;
  } else if (providerReady === true) {
    providerRow.state = 'ready';
    providerRow.detail = 'Endpoint, API key, and at least one model are set';
  } else if (providerReady === false) {
    providerRow.state = 'blocked';
    providerRow.detail =
      'Set an HTTPS endpoint, API key, and at least one model';
    providerRow.href = '/embeddings/settings';
    providerRow.actionLabel = 'Configure provider';
  }

  const indexEval = evaluateIndexRow(
    input.configs,
    input.configsError,
    input.sources,
    input.sourcesError,
    input.indexesBySchema,
    selectedConfig
  );
  const indexRow: ReadinessRow = {
    id: 'index',
    label: 'Matching index queryable',
    ...indexEval,
  };

  const configRow = evaluateConfigRow(input, selectedConfig);

  const workersRow: ReadinessRow = {
    id: 'workers',
    label: 'Workers enabled',
    state: 'unknown',
    detail: 'Worker status unavailable',
  };
  if (input.workersEnabled === true) {
    workersRow.state = 'ready';
    workersRow.detail = 'Module workers are running';
  } else if (input.workersEnabled === false) {
    workersRow.state = 'blocked';
    workersRow.detail = 'Enable workers to process embeddings';
    workersRow.href = '/embeddings/settings';
    workersRow.actionLabel = 'Open settings';
  }

  return [capabilitiesRow, providerRow, indexRow, configRow, workersRow];
}

export function getNextReadinessAction(
  rows: ReadinessRow[]
): ReadinessRow | undefined {
  return rows.find(row => row.state !== 'ready' && row.href);
}
