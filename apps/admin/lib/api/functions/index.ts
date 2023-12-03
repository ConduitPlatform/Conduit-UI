'use server';
import { axiosInstance } from '@/lib/api';
import { getModules } from '@/lib/api/modules';
import { FunctionsSettings } from '@/lib/models/Functions';

export const getFunctionsSettings = async () => {
  const res = await axiosInstance.get(`/config/functions`);
  return res.data
}

export const patchFunctionsSettings = async (functionsData: Partial<FunctionsSettings>) => {
  await axiosInstance.patch(`/config/functions`, { config: { ...functionsData }, });
  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      try {
        const modules = await getModules()
        resolve(modules);
      } catch (error) {
        reject(error);
      }
    }, 3000);
  });
}
