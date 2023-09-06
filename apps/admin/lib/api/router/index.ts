'use server';
import { axiosInstance } from '@/lib/api';
import { RouterSettings } from '@/lib/models/Router';

export const getRouterSettings = async () => {
  const res = await axiosInstance.get(`/config/router`, {});
  return res.data;
}

export const patchRouterSettings = async (data: Partial<RouterSettings>) => {
  await axiosInstance.patch(`/config/router`, {config: { ...data },});
};