'use server';
import { getApiClient } from '@/lib/api';
import { afterPatchServing } from '@/lib/api/modules/afterPatchServing';
import { PatchSettingsOptions } from '@/lib/api/modules/patch-settings-options';
import {
  FunctionExecutionModel,
  FunctionModel,
  FunctionsSettings,
} from '@/lib/models/functions';

type ConfigResponse = { config: FunctionsSettings };

export const getFunctionsSettings = async () => {
  const res = await (
    await getApiClient()
  ).get<ConfigResponse>(`/config/functions`);
  return res.data;
};

export const patchFunctionsSettings = async (
  functionsData: Partial<FunctionsSettings>,
  options?: PatchSettingsOptions
) => {
  await (
    await getApiClient()
  ).patch<ConfigResponse>(`/config/functions`, {
    config: { ...functionsData },
  });
  return afterPatchServing(options);
};

export const getFunctions = async (options: {
  skip: number;
  limit: number;
  search?: string;
  sort?: string;
}): Promise<{
  functions: FunctionModel[];
  count: number;
}> => {
  const res = await (
    await getApiClient()
  ).get(`/functions`, {
    params: options,
  });
  return res.data;
};

export const getFunction = async (id: string): Promise<FunctionModel> => {
  const res = await (await getApiClient()).get(`/functions/${id}`);
  return res.data;
};

export const editFunction = async (
  id: string,
  data: Omit<FunctionModel, '_id' | 'createdAt' | 'updatedAt'>
): Promise<FunctionModel> => {
  const res = await (await getApiClient()).patch(`/functions/${id}`, data);
  return res.data;
};

export const uploadFunction = async (
  data: Omit<FunctionModel, '_id' | 'createdAt' | 'updatedAt'>
) => {
  const res = await (await getApiClient()).post(`/functions/upload`, data);
  return res.data;
};

export const deleteFunction = async (id: string) => {
  const res = await (await getApiClient()).delete(`/functions/${id}`);
  return res.data;
};

export const deleteManyFunctions = async (ids: string[]) => {
  const res = await (
    await getApiClient()
  ).delete(`/functions`, { params: { ids } });
  return res.data;
};

export const listFunctionExecutions = async (options: {
  skip?: number;
  limit?: number;
  sort?: string;
}) => {
  const res = await (
    await getApiClient()
  ).get<{
    functionsExecutions: FunctionExecutionModel[];
    count: number;
  }>(`/functions/list/executions`, {
    params: options,
  });
  return res.data;
};

export const getFunctionExecutions = async (
  functionId: string,
  options?: {
    success?: boolean;
  }
) => {
  const res = await (
    await getApiClient()
  ).get<{
    functionExecutions: FunctionExecutionModel[];
    count: number;
  }>(`/functions/executions/${functionId}`, { params: options });
  return res.data;
};
