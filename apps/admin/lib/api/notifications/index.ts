'use server';
import { axiosInstance } from '@/lib/api';
import { NotificationSettings } from '@/lib/models/Notification';

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
        const res = await axiosInstance.get('/config/modules', {});
        resolve(res.data.modules);
      } catch (error) {
        reject(error);
      }
    }, 3000);
  });
}