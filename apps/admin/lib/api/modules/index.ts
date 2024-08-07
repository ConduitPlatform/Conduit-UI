'use server';
import { axiosInstance } from '@/lib/api';
import { Module } from '@/lib/models/Module';

export const getModules = async (): Promise<Module[]> => {
  const res = await axiosInstance.get('/config/modules', {});
  return res.data.modules;
};
