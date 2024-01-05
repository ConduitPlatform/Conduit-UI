'use server';
import { axiosInstance } from '@/lib/api';
import { getModules } from '@/lib/api/modules';
import { ChatSettings } from '@/lib/models/Chat';

type ConfigResponse = { config: ChatSettings };

export const getChatSettings = async () => {
  const res = await axiosInstance.get<ConfigResponse>(`/config/chat`);
  return res.data;
};

export const patchChatSettings = async (chatData: Partial<ChatSettings>) => {
  await axiosInstance.patch<ConfigResponse>('/config/chat', { config: { ...chatData } });
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
