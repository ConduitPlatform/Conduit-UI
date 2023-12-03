'use server';
import { axiosInstance } from '@/lib/api';
import { getModules } from '@/lib/api/modules';
import { SmsSettings } from '@/lib/models/Sms';

export const getSmsSettings = async () => {
  const res = await axiosInstance.get(`/config/sms`);
  return res.data
}

export const patchSmsSettings = async (smsData: Partial<SmsSettings>) => {
  await axiosInstance.patch(`/config/sms`, { config: { ...smsData }, });
  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      try {
        const modules = await getModules()
        resolve(modules);
      } catch (error) {
        reject(error);
      }
    }, 3000);
  });
}
