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

export const listRouterProxyRoutes = async (params?: {
  skip?: number;
  limit?: number;
  sort?: string;
}) => {
  const res = await (await getApiClient()).get('/router/proxy', { params });
  return res.data;
};

export const getRouterProxyRoute = async (id: string) => {
  const res = await (await getApiClient()).get(`/router/proxy/${id}`);
  return res.data;
};

export const createRouterProxyRoute = async (data: {
  path: string;
  target: string;
  action: string;
  routeDescription?: string;
  middlewares?: string[];
  proxyMiddlewareOptions?: Record<string, unknown>;
}) => {
  const res = await (await getApiClient()).post('/router/proxy', data);
  return res.data;
};

export const updateRouterProxyRoute = async (
  id: string,
  data: Partial<{
    path: string;
    target: string;
    action: string;
    routeDescription: string;
    middlewares: string[];
    proxyMiddlewareOptions: Record<string, unknown>;
  }>
) => {
  const res = await (await getApiClient()).put(`/router/proxy/${id}`, data);
  return res.data;
};

export const deleteRouterProxyRoute = async (id: string) => {
  const res = await (await getApiClient()).delete(`/router/proxy/${id}`);
  return res.data;
};
