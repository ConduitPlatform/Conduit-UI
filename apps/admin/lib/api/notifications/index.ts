'use server';
import { axiosInstance } from '@/lib/api';
import { NotificationSettings } from '@/lib/models/Notification';
import { getModules } from '@/lib/api/modules';

type ConfigResponse = { config: NotificationSettings };

export const getNotificationSettings = async () => {
  const res = await axiosInstance.get<ConfigResponse>(`/config/pushNotifications`, {});
  return res.data;
};

export const patchNotificationSettings = async (data: Partial<NotificationSettings>)  => {
  await axiosInstance.patch<ConfigResponse>(`/config/pushNotifications`, {config: { ...data }});
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
