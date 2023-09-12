'use server';
import { axiosInstance } from '@/lib/api';
import { EmailSettings } from '@/lib/models/Email';
import { Module } from '@/lib/models/Module';
import { getModules } from '@/lib/api/modules';

export const getEmailSettings = async():Promise<{config: EmailSettings}> => {
  const res = await axiosInstance.get('config/email');
  return res.data
}

export const patchEmailSettings = async (data: Partial<EmailSettings>):Promise<Module[]> => {
  await axiosInstance.patch(`/config/email`, { config: { ...data } })
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