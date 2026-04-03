'use server';

import { getApiClient } from '@/lib/api';

/** Admin service proxy routes (packages/admin), not router module proxies. */
export const listAdminProxies = async () => {
  const res = await (await getApiClient()).get('/admin/proxy');
  return res.data;
};

export const getAdminProxy = async (id: string) => {
  const res = await (await getApiClient()).get(`/admin/proxy/${id}`);
  return res.data;
};

export const createAdminProxy = async (data: Record<string, unknown>) => {
  const res = await (await getApiClient()).post('/admin/proxy', data);
  return res.data;
};

export const patchAdminProxy = async (
  id: string,
  data: Record<string, unknown>
) => {
  const res = await (await getApiClient()).patch(`/admin/proxy/${id}`, data);
  return res.data;
};

export const deleteAdminProxy = async (id: string) => {
  const res = await (await getApiClient()).delete(`/admin/proxy/${id}`);
  return res.data;
};

export const getRouteMiddlewareStack = async (path: string, action: string) => {
  const res = await (
    await getApiClient()
  ).get('/route-middlewares', {
    params: { path, action },
  });
  return res.data;
};

export const patchRouteMiddlewareStack = async (
  path: string,
  action: string,
  middlewares: string[]
) => {
  const res = await (
    await getApiClient()
  ).patch('/patch-middleware', { middlewares }, { params: { path, action } });
  return res.data;
};
