'use server';
import { axiosInstance } from '@/lib/api';
import { getModules } from '@/lib/api/modules';
import { AuthorizationSettings } from '@/lib/models/Authorization';

type ConfigResponse = { config: AuthorizationSettings };

export const getAuthorizationSettings = async () => {
  const res = await axiosInstance.get<ConfigResponse>(`/config/authorization`);
  return res.data;
};

export const patchAuthorizationSettings = async (
  authorizationData: Partial<AuthorizationSettings>
) => {
  await axiosInstance.patch<ConfigResponse>(`/config/authorization`, {
    config: { ...authorizationData },
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
