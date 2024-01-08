'use server';
import { axiosInstance } from '@/lib/api';
import { getModules } from '@/lib/api/modules';
import { SmsSettings } from '@/lib/models/Sms';

type ConfigResponse = { config: SmsSettings };

export const getSmsSettings = async () => {
  const res = await axiosInstance.get<ConfigResponse>(`/config/sms`);
  return res.data;
};

export const patchSmsSettings = async (smsData: Partial<SmsSettings>) => {
  await axiosInstance.patch<ConfigResponse>(`/config/sms`, { config: { ...smsData } });
  return new Promise<Awaited<ReturnType<typeof getModules>>>(async (resolve, reject) => {
    setTimeout(async () => {
      try {
        const modules = await getModules();
        resolve(modules);
      } catch (error) {
        reject(error);
      }
    }, 3000);
  });
};
