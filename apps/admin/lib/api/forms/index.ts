'use server';
import { axiosInstance } from '@/lib/api';
import { FormSettings } from '@/lib/models/Form';
import { getModules } from "@/lib/api/modules";

type ConfigResponse = { config: FormSettings };

export const getFormsSettings= async () => {
  const res = await axiosInstance.get<ConfigResponse>('/config/forms')
  return res.data;
};

export const patchFormsSettings = async (body: Partial<FormSettings>) => {
  await axiosInstance.patch<ConfigResponse>(`/config/forms`, { config: { ...body } });
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
