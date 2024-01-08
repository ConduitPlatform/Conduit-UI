'use server';
import { axiosInstance } from '@/lib/api';
import { EmailSettings } from '@/lib/models/Email';
import { getModules } from '@/lib/api/modules';

type ConfigResponse = { config: EmailSettings };

export const getEmailSettings = async() => {
  const res = await axiosInstance.get<ConfigResponse>('config/email');
  return res.data;
}

export const patchEmailSettings = async (data: Partial<EmailSettings>) => {
  await axiosInstance.patch<ConfigResponse>(`/config/email`, { config: { ...data } })
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
}