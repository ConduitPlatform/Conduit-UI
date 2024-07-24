'use server';
import { axiosInstance } from '@/lib/api';
import { NotificationSettings } from '@/lib/models/Notification';
import { getModules } from '@/lib/api/modules';
import { NotificationToken } from '@/lib/models/notification/NotificationToken';

type ConfigResponse = { config: NotificationSettings };

export const getNotificationSettings = async () => {
  const res = await axiosInstance.get<ConfigResponse>(`/config/pushNotifications`, {});
  return res.data;
};

export const patchNotificationSettings = async (data: Partial<NotificationSettings>) => {
  await axiosInstance.patch<ConfigResponse>(`/config/pushNotifications`, { config: { ...data } });
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
export const getTokens = async (skip: number, limit: number, params?: {
  sort?: string,
  search?: string,
  platform?: string
}): Promise<{ tokens: NotificationToken[], count: number }> => {
  const res = await axiosInstance.get(`/pushNotifications/token`, {
    params: {
      skip,
      limit,
      ...params,
    },
  });
  return res.data;
};

export const getTokenById = async (id: string, populate?: string): Promise<NotificationToken> => {
  const res = await axiosInstance.get(`/pushNotifications/token/${id}`, {
    params: {
      populate,
    },
  });
  return res.data;
};

