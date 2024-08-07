'use server';
import { axiosInstance } from '@/lib/api';
import { RouterSettings } from '@/lib/models/Router';
import { getModules } from '@/lib/api/modules';

type ConfigResponse = { config: RouterSettings };

export const getRouterSettings = async () => {
  const res = await axiosInstance.get<ConfigResponse>(`/config/router`, {});
  return res.data;
};

export const patchRouterSettings = async (data: Partial<RouterSettings>) => {
  await axiosInstance.patch<ConfigResponse>(`/config/router`, {
    config: { ...data },
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
