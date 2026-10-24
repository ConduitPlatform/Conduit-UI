'use server';
import { getApiClient } from '@/lib/api';
import { Module } from '@/lib/models/Module';

export const getModules = async (): Promise<Module[]> => {
  const res = await (await getApiClient()).get('/config/modules', {});
  return res.data.modules;
};
