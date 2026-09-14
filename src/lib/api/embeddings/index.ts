'use server';

import { cache } from 'react';
import { getDeclaredSchemas } from '@/lib/api/embeddings/indexes';
import { getApiClient } from '@/lib/api';
import {
  BackfillListQuery,
  EmbeddingConfig,
  EmbeddingConfigInput,
  EmbeddingsConfigResponse,
  EmbeddingsSettingsPatch,
  sanitizeEmbeddingsSettingsPatch,
  SemanticSearchInput,
  serializeBackfillFilter,
  StartBackfillInput,
  unwrapBackfillList,
  unwrapBackfillRun,
  unwrapDeletedEmbeddingConfig,
  unwrapEmbeddingConfig,
  unwrapEmbeddingConfigList,
  unwrapEmbeddingsCapabilities,
  unwrapEmbeddingsSettings,
  unwrapEmbeddingsStatus,
  unwrapSemanticSearch,
  unwrapStartBackfill,
  unwrapUpsertEmbeddingConfig,
  SCHEMA_ELIGIBILITY_UNAVAILABLE_MESSAGE,
  requireEligibleDeclaredSchema,
  validateEmbeddingConfigInput,
  listConfiguredProviders,
  CATALOGUE_UNAVAILABLE_MESSAGE,
} from '@/lib/models/embeddings';

export const getEmbeddingConfigs = cache(
  async (args?: { schemaName?: string; id?: string }) => {
    const res = await (
      await getApiClient()
    ).get<unknown>('/embeddings/configs', { params: args });
    return unwrapEmbeddingConfigList(res.data);
  }
);

export const getEmbeddingConfig = cache(async (id: string) => {
  const res = await (
    await getApiClient()
  ).get<unknown>(`/embeddings/configs/${id}`);
  return unwrapEmbeddingConfig(res.data);
});

async function loadDeclaredSchemasOrThrow() {
  try {
    return await getDeclaredSchemas();
  } catch {
    throw new Error(SCHEMA_ELIGIBILITY_UNAVAILABLE_MESSAGE);
  }
}

async function loadProviderCatalogueOrThrow() {
  try {
    const settings = await getEmbeddingsSettings();
    return listConfiguredProviders(settings.config);
  } catch {
    throw new Error(CATALOGUE_UNAVAILABLE_MESSAGE);
  }
}

export const upsertEmbeddingConfig = async (data: EmbeddingConfigInput) => {
  const [declared, settings] = await Promise.all([
    loadDeclaredSchemasOrThrow(),
    loadProviderCatalogueOrThrow(),
  ]);
  const body = validateEmbeddingConfigInput(
    data,
    declared.schemas,
    settings,
    declared.systemSchemaNames
  );
  const res = await (
    await getApiClient()
  ).post<unknown>('/embeddings/configs', body);
  return unwrapUpsertEmbeddingConfig(res.data);
};

export const deleteEmbeddingConfig = async (
  id: string
): Promise<EmbeddingConfig> => {
  const res = await (
    await getApiClient()
  ).delete<unknown>(`/embeddings/configs/${id}`);
  return unwrapDeletedEmbeddingConfig(res.data);
};

export const getEmbeddingsCapabilities = cache(async (schemaName?: string) => {
  const res = await (
    await getApiClient()
  ).get<unknown>('/embeddings/capabilities', {
    params: schemaName ? { schemaName } : undefined,
  });
  return unwrapEmbeddingsCapabilities(res.data);
});

export const getEmbeddingsStatus = cache(async (schemaName?: string) => {
  const res = await (
    await getApiClient()
  ).get<unknown>('/embeddings/status', {
    params: schemaName ? { schemaName } : undefined,
  });
  return unwrapEmbeddingsStatus(res.data);
});

export const getBackfills = async (args?: BackfillListQuery) => {
  const res = await (
    await getApiClient()
  ).get<unknown>('/embeddings/backfills', { params: args });
  return unwrapBackfillList(res.data);
};

export const getBackfill = async (id: string) => {
  const res = await (
    await getApiClient()
  ).get<unknown>(`/embeddings/backfills/${id}`);
  return unwrapBackfillRun(res.data);
};

export const startBackfill = async (data: StartBackfillInput) => {
  const declared = await loadDeclaredSchemasOrThrow();
  requireEligibleDeclaredSchema(
    data.schemaName,
    declared.schemas,
    declared.systemSchemaNames
  );
  const filter = serializeBackfillFilter(data.filter);
  const res = await (
    await getApiClient()
  ).post<unknown>('/embeddings/backfills', {
    schemaName: data.schemaName,
    batchSize: data.batchSize,
    configId: data.configId,
    onlyMissing: data.onlyMissing,
    ...(filter ? { filter } : {}),
  });
  return unwrapStartBackfill(res.data);
};

export const cancelBackfill = async (id: string) => {
  const res = await (
    await getApiClient()
  ).post<unknown>(`/embeddings/backfills/${id}/cancel`);
  return unwrapBackfillRun(res.data);
};

export const resumeBackfill = async (id: string) => {
  const res = await (
    await getApiClient()
  ).post<unknown>(`/embeddings/backfills/${id}/resume`);
  return unwrapBackfillRun(res.data);
};

export const searchEmbeddings = async (data: SemanticSearchInput) => {
  const declared = await loadDeclaredSchemasOrThrow();
  requireEligibleDeclaredSchema(
    data.schemaName,
    declared.schemas,
    declared.systemSchemaNames
  );
  const filter = serializeBackfillFilter(data.filter);
  const res = await (
    await getApiClient()
  ).post<unknown>('/embeddings/search', {
    schemaName: data.schemaName,
    text: data.text,
    targetField: data.targetField,
    limit: data.limit,
    ...(filter ? { filter } : {}),
  });
  return unwrapSemanticSearch(res.data);
};

export const getEmbeddingsSettings = cache(
  async (): Promise<EmbeddingsConfigResponse> => {
    const res = await (await getApiClient()).get<unknown>('/config/embeddings');
    return unwrapEmbeddingsSettings(res.data);
  }
);

export const patchEmbeddingsSettings = async (
  data: EmbeddingsSettingsPatch
) => {
  const config = sanitizeEmbeddingsSettingsPatch(data);
  const res = await (
    await getApiClient()
  ).patch<unknown>('/config/embeddings', { config });
  return unwrapEmbeddingsSettings(res.data);
};
