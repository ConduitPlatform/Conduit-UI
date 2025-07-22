'use server';
import { getApiClient } from '@/lib/api';
import { RouterSettings } from '@/lib/models/Router';
import { getModules } from '@/lib/api/modules';

type ConfigResponse = { config: RouterSettings };

export const getRouterSettings = async () => {
  const res = await (
    await getApiClient()
  ).get<ConfigResponse>(`/config/router`, {});
  return res.data;
};

export const patchRouterSettings = async (data: Partial<RouterSettings>) => {
  await (
    await getApiClient()
  ).patch<ConfigResponse>(`/config/router`, {
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

export const getMiddlewares = async () => {
  const res = await (await getApiClient()).get<string[]>(`/router/middlewares`);
  return res.data;
};

export const getRoutes = async () => {
  const res = await (await getApiClient()).get(`/router/routes`);
  return res.data;
};

export const getSecurityClients = async () => {
  const res = await (await getApiClient()).get(`/router/security/client`);
  return res.data;
};

export const createSecurityClient = async (data: {
  platform: string;
  domain?: string;
  alias?: string;
  notes?: string;
}) => {
  const res = await (
    await getApiClient()
  ).post(`/router/security/client`, data);
  return res.data;
};

export const updateSecurityClient = async (
  id: string,
  data: {
    platform?: string;
    domain?: string;
    alias?: string;
    notes?: string;
  }
) => {
  const res = await (
    await getApiClient()
  ).put(`/router/security/client/${id}`, data);
  return res.data;
};

export const deleteSecurityClient = async (id: string) => {
  await (await getApiClient()).delete(`/router/security/client/${id}`);
};
