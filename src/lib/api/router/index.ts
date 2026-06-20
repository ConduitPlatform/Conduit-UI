'use server';
import { getApiClient } from '@/lib/api';
import { RouterSettings } from '@/lib/models/Router';
import { afterPatchServing } from '@/lib/api/modules/afterPatchServing';
import { PatchSettingsOptions } from '@/lib/api/modules/patch-settings-options';

type ConfigResponse = { config: RouterSettings };

export const getRouterSettings = async () => {
  const res = await (
    await getApiClient()
  ).get<ConfigResponse>(`/config/router`, {});
  return res.data;
};

export const patchRouterSettings = async (
  data: Partial<RouterSettings>,
  options?: PatchSettingsOptions
) => {
  await (
    await getApiClient()
  ).patch<ConfigResponse>(`/config/router`, {
    config: { ...data },
  });
  return afterPatchServing(options);
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

export const getAppRouteMiddlewares = async (path: string, action: string) => {
  const res = await (
    await getApiClient()
  ).get<{ middlewares: string[] }>('/router/route-middlewares', {
    params: { path, action },
  });
  return res.data;
};

export const patchAppRouteMiddlewares = async (
  path: string,
  action: string,
  middlewares: string[]
) => {
  const res = await (
    await getApiClient()
  ).patch<string>(
    '/router/patch-middleware',
    { middlewares },
    { params: { path, action } }
  );
  return res.data;
};
