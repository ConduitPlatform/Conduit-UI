'use server';
import { axiosInstance } from '@/lib/api';
import { AdminSettings, CoreSettings } from '@/lib/models/Settings';

export const getCoreSettings = async () => {
  const res = await axiosInstance.get('/config/core');
  return res.data
}
export const getAdminSettings = async () => {
  const res = await axiosInstance.get('/config/admin');
  return res.data
}

export const patchCoreSettings = async (data: CoreSettings) => {
  await axiosInstance.patch('/config/core',{config:{...data}})
}

export const patchAdminSettings = async (data: AdminSettings) => {
  await axiosInstance.patch(`/config/admin`, { config: { ...data } });
};