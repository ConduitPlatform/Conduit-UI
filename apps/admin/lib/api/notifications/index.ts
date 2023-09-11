'use server';
import { axiosInstance } from '@/lib/api';
import { NotificationSettings } from '@/lib/models/Notification';
import { getModules } from '@/lib/api/modules';

export const getNotificationSettings = async () => {
  const res = await axiosInstance.get(`/config/pushNotifications`, {
  });
  return res.data;
}

export const patchNotificationSettings = async (data: Partial<NotificationSettings>) => {
  await axiosInstance.patch(`/config/pushNotifications`, {config: { ...data }});
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