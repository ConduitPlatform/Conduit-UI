import {
  isVectorIndexQueryable,
  isVectorStorageSearchReady,
  VectorCapabilities,
  VectorIndexDefinition,
} from '@/lib/models/embeddings/capabilities';
import { EmbeddingConfig } from '@/lib/models/embeddings/config';
import { findMatchingIndex } from '@/lib/models/embeddings/index-state';
import {
  EmbeddingsSettings,
  OPENAI_COMPATIBLE_PROVIDER,
} from '@/lib/models/embeddings/settings';
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

function evaluateIndexRow(
  configs: EmbeddingConfig[] | undefined,
  configsError: string | undefined,
  indexesBySchema: Record<string, SchemaIndexLookup> | undefined,
  selectedConfig?: EmbeddingConfig
): Pick<ReadinessRow, 'state' | 'detail' | 'href' | 'actionLabel'> {
  if (configsError) {
    return { state: 'unknown', detail: 'Config list unavailable' };
  }
  if (!configs) {
    return { state: 'unknown', detail: 'Index status unavailable' };
  }

  const scoped = selectedConfig ? [selectedConfig] : configs;
  if (scoped.length === 0) {
    return {
      state: 'blocked',
      detail: 'Create a config before an index can match',
      href: '/embeddings/configs/new',
      actionLabel: 'New config',
    };
  }

  let sawUnknown = false;
  let pending: EmbeddingConfig | undefined;
  let failed: EmbeddingConfig | undefined;
  let missing: EmbeddingConfig | undefined;
  let readyConfig: EmbeddingConfig | undefined;

  for (const config of scoped) {
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
    actionLabel: selectedConfig ? 'Open config' : 'Open configs',
  };
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
    input.indexesBySchema,
    selectedConfig
  );
  const indexRow: ReadinessRow = {
    id: 'index',
    label: 'Matching index queryable',
    ...indexEval,
  };

  const configRow: ReadinessRow = {
    id: 'config',
    label: 'Config enabled',
    state: 'unknown',
    detail: 'Config list unavailable',
  };
  if (input.configsError) {
    configRow.detail = input.configsError;
  } else if (input.configs) {
    const scoped = selectedConfig ? [selectedConfig] : input.configs;
    if (scoped.length === 0) {
      configRow.state = 'blocked';
      configRow.detail = 'Create a config to start embedding';
      configRow.href = '/embeddings/configs/new';
      configRow.actionLabel = 'New config';
    } else if (scoped.some(config => config.enabled)) {
      configRow.state = 'ready';
      configRow.detail = selectedConfig
        ? 'This config is enabled'
        : 'At least one config is enabled';
    } else {
      configRow.state = 'blocked';
      configRow.detail = selectedConfig
        ? 'Enable this config after the index is ready'
        : 'Enable a config after the index is ready';
      configRow.href = configHref(selectedConfig ?? scoped[0]);
      configRow.actionLabel = selectedConfig ? 'Open config' : 'Open configs';
    }
  }

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
