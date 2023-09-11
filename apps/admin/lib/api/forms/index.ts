'use server';
import { axiosInstance } from '@/lib/api';
import { FormSettings } from '@/lib/models/Form';
import { Module } from '@/lib/models/Module';

export const getFormsSettings= async ():Promise<{config: FormSettings}> => {
  const res = await axiosInstance.get('/config/forms')
  return res.data
}

export const patchFormsSettings = async (body: Partial<FormSettings>):Promise<Module[]> => {
  await axiosInstance.patch(`/config/forms`, {
    config: { ...body },
  });
  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      try {
        const res = await axiosInstance.get('/config/modules', {});
        resolve(res.data.modules);
      } catch (error) {
        reject(error);
      }
    }, 3000);
  });
}