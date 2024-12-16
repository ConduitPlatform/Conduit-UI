'use server';
import { axiosInstance } from '@/lib/api';
import { getModules } from '@/lib/api/modules';
import { FunctionModel, FunctionsSettings } from '@/lib/models/functions';

type ConfigResponse = { config: FunctionsSettings };

export const getFunctionsSettings = async () => {
  const res = await axiosInstance.get<ConfigResponse>(`/config/functions`);
  return res.data;
};

export const patchFunctionsSettings = async (
  functionsData: Partial<FunctionsSettings>
) => {
  await axiosInstance.patch<ConfigResponse>(`/config/functions`, {
    config: { ...functionsData },
  });
  return new Promise<Awaited<ReturnType<typeof getModules>>>(
    async (resolve, reject) => {
      setTimeout(async () => {
        try {
          const modules = await getModules();
          resolve(modules);
        } catch (error) {
          reject(error);
        }
      }, 3000);
    }
  );
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
  const res = await axiosInstance.get(`/functions`, {
    params: options,
  });
  return res.data;
};

export const getFunction = async (id: string): Promise<FunctionModel> => {
  const res = await axiosInstance.get(`/functions/${id}`);
  return res.data;
};

export const addFunction = async (
  data: Omit<FunctionModel, '_id' | 'createdAt' | 'updatedAt'>
): Promise<FunctionModel> => {
  const res = await axiosInstance.post(`/functions`, data);
  return res.data;
};

export const editFunction = async (
  id: string,
  data: Omit<FunctionModel, '_id' | 'createdAt' | 'updatedAt'>
): Promise<FunctionModel> => {
  const res = await axiosInstance.patch(`/functions/${id}`, data);
  return res.data;
};
