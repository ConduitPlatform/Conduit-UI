'use server';

import { getApiClient } from '@/lib/api';
import { afterPatchServing } from '@/lib/api/modules/afterPatchServing';
import { PatchSettingsOptions } from '@/lib/api/modules/patch-settings-options';
import {
  BackfillListQuery,
  EmbeddingConfig,
  EmbeddingConfigInput,
  EmbeddingsConfigResponse,
  EmbeddingsSettings,
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
} from '@/lib/models/embeddings';

export const getEmbeddingConfigs = async (args?: {
  schemaName?: string;
  id?: string;
}) => {
  const res = await (
    await getApiClient()
  ).get<unknown>('/embeddings/configs', { params: args });
  return unwrapEmbeddingConfigList(res.data);
};

export const getEmbeddingConfig = async (id: string) => {
  const res = await (
    await getApiClient()
  ).get<unknown>(`/embeddings/configs/${id}`);
  return unwrapEmbeddingConfig(res.data);
};

export const upsertEmbeddingConfig = async (data: EmbeddingConfigInput) => {
  const res = await (
    await getApiClient()
  ).post<unknown>('/embeddings/configs', data);
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

export const getEmbeddingsCapabilities = async (schemaName?: string) => {
  const res = await (
    await getApiClient()
  ).get<unknown>('/embeddings/capabilities', {
    params: schemaName ? { schemaName } : undefined,
  });
  return unwrapEmbeddingsCapabilities(res.data);
};

export const getEmbeddingsStatus = async (schemaName?: string) => {
  const res = await (
    await getApiClient()
  ).get<unknown>('/embeddings/status', {
    params: schemaName ? { schemaName } : undefined,
  });
  return unwrapEmbeddingsStatus(res.data);
};

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

export const getEmbeddingsSettings =
  async (): Promise<EmbeddingsConfigResponse> => {
    const res = await (await getApiClient()).get<unknown>('/config/embeddings');
    return unwrapEmbeddingsSettings(res.data);
  };

export const patchEmbeddingsSettings = async (
  data: Partial<EmbeddingsSettings>,
  options?: PatchSettingsOptions
) => {
  const config = sanitizeEmbeddingsSettingsPatch(data);
  await (await getApiClient()).patch<unknown>('/config/embeddings', { config });
  return afterPatchServing(options);
};
