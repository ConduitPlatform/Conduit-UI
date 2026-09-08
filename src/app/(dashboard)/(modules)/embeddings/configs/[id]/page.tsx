import { notFound } from 'next/navigation';
import { ConfigDetail } from '@/components/embeddings/configs/config-detail';
import { getSchemas } from '@/lib/api/database';
import {
  getEmbeddingConfig,
  getEmbeddingsCapabilities,
  getEmbeddingsSettings,
  getEmbeddingsStatus,
} from '@/lib/api/embeddings';
import { resolveIndexesBySchema } from '@/lib/api/embeddings/indexes';
import {
  deriveEmbeddingsReadiness,
  EmbeddingConfig,
  formatEmbeddingsApiError,
  isEmbeddingsNotFound,
  listEligibleSchemas,
  toEmbeddingSchemaChoice,
} from '@/lib/models/embeddings';

function settledValue<T>(result: PromiseSettledResult<T>): T | undefined {
  return result.status === 'fulfilled' ? result.value : undefined;
}

function settledError(
  result: PromiseSettledResult<unknown>
): string | undefined {
  if (result.status !== 'rejected') return undefined;
  return formatEmbeddingsApiError(result.reason);
}

export default async function EmbeddingConfigDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  let config: EmbeddingConfig;
  try {
    config = await getEmbeddingConfig(id);
  } catch (error) {
    if (isEmbeddingsNotFound(error)) notFound();
    throw error;
  }

  const [capabilitiesResult, settingsResult, statusResult, schemasResult] =
    await Promise.allSettled([
      getEmbeddingsCapabilities(config.schemaName),
      getEmbeddingsSettings(),
      getEmbeddingsStatus(config.schemaName),
      getSchemas({ limit: 1000, enabled: true }),
    ]);

  const indexesBySchema = await resolveIndexesBySchema([config.schemaName]);
  const lookup = indexesBySchema[config.schemaName];
  const status = settledValue(statusResult);
  const capabilities =
    settledValue(capabilitiesResult)?.capabilities ?? status?.capabilities;
  const settings = settledValue(settingsResult)?.config;
  const rawSchemas = settledValue(schemasResult)?.schemas ?? [];
  const eligibleSchemas = listEligibleSchemas(rawSchemas);
  const currentSchema = rawSchemas.find(
    schema => schema.name === config.schemaName
  );
  const schemaChoices = currentSchema
    ? [
        toEmbeddingSchemaChoice(currentSchema),
        ...eligibleSchemas.filter(schema => schema.name !== currentSchema.name),
      ]
    : [
        toEmbeddingSchemaChoice({
          name: config.schemaName,
          ownerModule: 'database',
          fields: Object.fromEntries(
            config.sourceFields.map(name => [name, { type: 'String' }])
          ),
        }),
        ...eligibleSchemas,
      ];

  const rows = deriveEmbeddingsReadiness({
    capabilities,
    capabilitiesError: settledError(capabilitiesResult),
    settings,
    settingsError: settledError(settingsResult),
    configs: [config],
    indexesBySchema,
    selectedConfigId: config._id,
    workersEnabled: status?.enabled ?? settings?.enabled,
  });

  return (
    <ConfigDetail
      config={config}
      schemas={schemaChoices}
      lookup={lookup}
      capabilities={capabilities}
      readinessRows={rows}
    />
  );
}
