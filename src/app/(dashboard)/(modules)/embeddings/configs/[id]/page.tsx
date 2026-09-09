import { notFound } from 'next/navigation';
import { ConfigDetail } from '@/components/embeddings/configs/config-detail';
import {
  getEmbeddingConfig,
  getEmbeddingsCapabilities,
  getEmbeddingsSettings,
  getEmbeddingsStatus,
} from '@/lib/api/embeddings';
import {
  getDeclaredSchemas,
  resolveIndexesBySchema,
} from '@/lib/api/embeddings/indexes';
import { EmbeddingConfig } from '@/lib/models/embeddings/config';
import {
  isEmbeddingsNotFound,
  settledError,
  settledValue,
} from '@/lib/models/embeddings/errors';
import {
  canEnableEmbeddingConfig,
  embeddingConfigEnableBlock,
  findMatchingIndex,
  toMatchingIndexView,
} from '@/lib/models/embeddings/index-state';
import {
  listEligibleSchemas,
  toEmbeddingSchemaFormChoices,
} from '@/lib/models/embeddings/source-fields';
import { workersEnabledFromStatus } from '@/lib/models/embeddings/overview-view';
import { deriveEmbeddingsReadiness } from '@/lib/models/embeddings/readiness';
import {
  isConfigModelInCatalogue,
  listConfiguredProviders,
  MODEL_ABSENT_DETAIL,
  SETTINGS_CTA_LABEL,
  SETTINGS_HREF,
} from '@/lib/models/embeddings/config-catalogue';

export default async function EmbeddingConfigDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const [configResult, schemasResult, settingsResult] =
    await Promise.allSettled([
      getEmbeddingConfig(id),
      getDeclaredSchemas(),
      getEmbeddingsSettings(),
    ]);

  if (configResult.status === 'rejected') {
    if (isEmbeddingsNotFound(configResult.reason)) notFound();
    throw configResult.reason;
  }

  const config: EmbeddingConfig = configResult.value;
  const declared = settledValue(schemasResult);
  const schemas = declared?.schemas;
  const settings = settledValue(settingsResult)?.config;

  const [capabilitiesResult, statusResult, indexesResult] =
    await Promise.allSettled([
      getEmbeddingsCapabilities(config.schemaName),
      getEmbeddingsStatus(config.schemaName),
      resolveIndexesBySchema([config.schemaName], declared),
    ]);
  const indexesBySchema = settledValue(indexesResult) ?? {
    [config.schemaName]: 'unknown' as const,
  };

  const lookup = indexesBySchema[config.schemaName];
  const status = settledValue(statusResult);
  const capabilities =
    settledValue(capabilitiesResult)?.capabilities ?? status?.capabilities;
  const formSchemas = toEmbeddingSchemaFormChoices(
    listEligibleSchemas(schemas, declared?.systemSchemaNames),
    { [config.schemaName]: config.sourceFields }
  );

  const workersEnabled = workersEnabledFromStatus({
    status,
    settingsEnabled: settings?.enabled,
  });
  const matchingIndex =
    lookup && lookup !== 'unknown'
      ? findMatchingIndex(config, lookup)
      : undefined;
  const enableAllowed = canEnableEmbeddingConfig({
    capabilities,
    matchingIndex,
    workersEnabled,
  });
  const providers = listConfiguredProviders(settings);
  const modelBlocked =
    settings != null && !isConfigModelInCatalogue(config, providers);
  const enableBlock = modelBlocked
    ? {
        reason: MODEL_ABSENT_DETAIL,
        href: SETTINGS_HREF,
        actionLabel: SETTINGS_CTA_LABEL,
      }
    : embeddingConfigEnableBlock({
        capabilities,
        matchingIndex,
        workersEnabled,
      });
  const rows = deriveEmbeddingsReadiness({
    capabilities,
    capabilitiesError: settledError(capabilitiesResult),
    settings,
    settingsError: settledError(settingsResult),
    configs: [config],
    indexesBySchema,
    selectedConfigId: config._id,
    workersEnabled,
  });

  return (
    <ConfigDetail
      config={config}
      schemas={formSchemas}
      providers={providers}
      modelBlocked={modelBlocked}
      index={toMatchingIndexView(config, lookup)}
      enableAllowed={enableAllowed && !modelBlocked}
      enableBlock={enableBlock}
      readinessRows={rows}
    />
  );
}
