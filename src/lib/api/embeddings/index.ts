'use server';

import { cache } from 'react';
import { getDeclaredSchemas } from '@/lib/api/embeddings/indexes';
import { getApiClient } from '@/lib/api';
import {
  BackfillListQuery,
  EmbeddingConfig,
  EmbeddingConfigInput,
  EmbeddingSource,
  EmbeddingSourceCreateInput,
  EmbeddingSourceUpdateInput,
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
  unwrapEmbeddingSource,
  unwrapEmbeddingSourceList,
  unwrapEmbeddingSourceStatus,
  unwrapEmbeddingsCapabilities,
  unwrapEmbeddingsSettings,
  unwrapEmbeddingsStatus,
  unwrapPurgeSource,
  unwrapReconcileSource,
  unwrapSemanticSearch,
  unwrapStartBackfill,
  unwrapUpsertEmbeddingConfig,
  unwrapUpsertEmbeddingSource,
  formatEmbeddingsApiError,
  SCHEMA_ELIGIBILITY_UNAVAILABLE_MESSAGE,
  requireEligibleDeclaredSchema,
  validateEmbeddingConfigInput,
  validateEmbeddingSourceInput,
  validateEmbeddingSourceUpdate,
  listConfiguredProviders,
  CATALOGUE_UNAVAILABLE_MESSAGE,
  assertSemanticSearchInput,
} from '@/lib/models/embeddings';
import { collectPagedItems } from '@/lib/models/embeddings/selector-pages';

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
  const target = assertSemanticSearchInput(data);
  if (target.schemaName) {
    const declared = await loadDeclaredSchemasOrThrow();
    requireEligibleDeclaredSchema(
      target.schemaName,
      declared.schemas,
      declared.systemSchemaNames
    );
  }
  const filter = serializeBackfillFilter(data.filter);
  const scope = data.scope?.trim();
  const res = await (
    await getApiClient()
  ).post<unknown>('/embeddings/search', {
    text: target.text,
    limit: data.limit,
    ...(target.schemaName
      ? {
          schemaName: target.schemaName,
          targetField: data.targetField,
        }
      : { sourceId: target.sourceId }),
    ...(filter ? { filter } : {}),
    ...(scope ? { scope } : {}),
  });
  return unwrapSemanticSearch(res.data);
};

export const getEmbeddingSources = cache(
  async (args?: {
    kind?: string;
    state?: string;
    skip?: number;
    limit?: number;
  }) => {
    const res = await (
      await getApiClient()
    ).get<unknown>('/embeddings/sources', { params: args });
    return unwrapEmbeddingSourceList(res.data);
  }
);

export const getEmbeddingSource = cache(async (id: string) => {
  const res = await (
    await getApiClient()
  ).get<unknown>(`/embeddings/sources/${id}`);
  return unwrapEmbeddingSource(res.data);
});

function throwFormattedEmbeddingsError(error: unknown): never {
  throw new Error(formatEmbeddingsApiError(error));
}

export const createEmbeddingSource = async (
  data: EmbeddingSourceCreateInput
) => {
  let settings;
  try {
    settings = await getEmbeddingsSettings();
  } catch {
    throw new Error(CATALOGUE_UNAVAILABLE_MESSAGE);
  }
  const body = validateEmbeddingSourceInput(data, settings.config);
  try {
    const res = await (
      await getApiClient()
    ).post<unknown>('/embeddings/sources', body);
    return unwrapUpsertEmbeddingSource(res.data);
  } catch (error) {
    throwFormattedEmbeddingsError(error);
  }
};

export const updateEmbeddingSource = async (
  id: string,
  data: EmbeddingSourceUpdateInput
) => {
  const existing = await getEmbeddingSource(id);
  const body = validateEmbeddingSourceUpdate(data, existing.kind);
  const res = await (
    await getApiClient()
  ).patch<unknown>(`/embeddings/sources/${id}`, body);
  return unwrapUpsertEmbeddingSource(res.data);
};

export const getEmbeddingSourceStatus = cache(async (id: string) => {
  const res = await (
    await getApiClient()
  ).get<unknown>(`/embeddings/sources/${id}/status`);
  return unwrapEmbeddingSourceStatus(res.data);
});

export const reconcileEmbeddingSource = async (id: string) => {
  const res = await (
    await getApiClient()
  ).post<unknown>(`/embeddings/sources/${id}/reconcile`);
  return unwrapReconcileSource(res.data);
};

export const disableEmbeddingSource = async (id: string) => {
  const res = await (
    await getApiClient()
  ).post<unknown>(`/embeddings/sources/${id}/disable`);
  return unwrapEmbeddingSource(res.data);
};

export const enableEmbeddingSource = async (id: string) => {
  try {
    const res = await (
      await getApiClient()
    ).post<unknown>(`/embeddings/sources/${id}/enable`);
    return unwrapUpsertEmbeddingSource(res.data);
  } catch (error) {
    throwFormattedEmbeddingsError(error);
  }
};

export async function listEmbeddingSources(args?: {
  kind?: string;
  state?: string;
}): Promise<{
  sources: EmbeddingSource[];
  count: number;
  truncated: boolean;
}> {
  const collected = await collectPagedItems({
    fetchPage: async (skip, limit) => {
      const page = await getEmbeddingSources({
        ...args,
        skip,
        limit,
      });
      return { items: page.sources, total: page.count };
    },
  });
  return {
    sources: collected.items,
    count: collected.total,
    truncated: collected.truncated,
  };
}

export const revokeEmbeddingSource = async (id: string) => {
  const res = await (
    await getApiClient()
  ).post<unknown>(`/embeddings/sources/${id}/revoke`);
  return unwrapEmbeddingSource(res.data);
};

export const purgeEmbeddingSource = async (id: string) => {
  const res = await (
    await getApiClient()
  ).delete<unknown>(`/embeddings/sources/${id}`);
  return unwrapPurgeSource(res.data);
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
