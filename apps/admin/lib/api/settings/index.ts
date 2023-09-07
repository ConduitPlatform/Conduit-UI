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

export const getAdminById = async (id: string) => {
  const res =  await axiosInstance.get(`/admins/${id}`)
  return res.data
}

export const setTwoFA = async (enable:boolean) => {
  const res = await axiosInstance.put('/toggle-twofa', { enableTwoFa: enable })
  return res.data
}

export const verifyQrCodeRequest = async (code: string) => {
  const res = await axiosInstance.post('/verify-qr-code', { code });
  return res.data
}

export const changePassword = async (oldPassword: string, newPassword: string) => {
  const res = await axiosInstance.put(`/change-password`, {
    oldPassword: oldPassword,
    newPassword: newPassword,
  });
  return res.data
};