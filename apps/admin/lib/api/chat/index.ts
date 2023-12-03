'use server';
import { axiosInstance } from '@/lib/api';
import { getModules } from '@/lib/api/modules';
import { ChatSettings } from '@/lib/models/Chat';

export const getChatSettings = async () => {
  const res = await axiosInstance.get(`/config/chat`);
  return res.data
}

export const patchChatSettings = async (chatData: Partial<ChatSettings>) => {
  await axiosInstance.patch(`/config/chat`, { config: { ...chatData }, });
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
