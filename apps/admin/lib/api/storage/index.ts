'use server';
import { axiosInstance } from '@/lib/api';
import { StorageSettings } from '@/lib/models/Storage';
import { getModules } from '@/lib/api/modules';

export const getStorageSettings = async () => {
  const res = await axiosInstance.get(`/config/storage`);
  return res.data
}

export const patchStorageSettings = async (storageData: Partial<StorageSettings>) => {
  await axiosInstance.patch(`/config/storage`, { config: { ...storageData }, });
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