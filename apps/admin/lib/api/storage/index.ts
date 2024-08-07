'use server';
import { axiosInstance } from '@/lib/api';
import { StorageSettings } from '@/lib/models/Storage';
import { getModules } from '@/lib/api/modules';

type ConfigResponse = { config: StorageSettings };

export const getStorageSettings = async () => {
  const res = await axiosInstance.get<ConfigResponse>(`/config/storage`);
  return res.data;
};

export const patchStorageSettings = async (
  storageData: Partial<StorageSettings>
) => {
  await axiosInstance.patch<ConfigResponse>(`/config/storage`, {
    config: { ...storageData },
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
