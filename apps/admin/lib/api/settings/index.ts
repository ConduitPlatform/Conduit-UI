'use server';
import { getApiClient } from '@/lib/api';
import { AdminSettings, CoreSettings } from '@/lib/models/Settings';

export const getCoreSettings = async () => {
  const res = await (await getApiClient()).get('/config/core');
  return res.data;
};
export const getAdminSettings = async () => {
  const res = await (await getApiClient()).get('/config/admin');
  return res.data;
};

export const patchCoreSettings = async (data: CoreSettings) => {
  await (await getApiClient()).patch('/config/core', { config: { ...data } });
};

export const patchAdminSettings = async (data: AdminSettings) => {
  await (await getApiClient()).patch(`/config/admin`, { config: { ...data } });
};

export const setTwoFA = async (enable: boolean) => {
  const res = await (
    await getApiClient()
  ).put('/toggle-twofa', { enableTwoFa: enable });
  return res.data;
};

export const verifyQrCodeRequest = async (code: string) => {
  const res = await (await getApiClient()).post('/verify-qr-code', { code });
  return res.data;
};

export const changePassword = async (
  oldPassword: string,
  newPassword: string
) => {
  const res = await (
    await getApiClient()
  ).put(`/change-password`, {
    oldPassword: oldPassword,
    newPassword: newPassword,
  });
  return res.data;
};
