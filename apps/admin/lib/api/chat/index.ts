'use server';
import { axiosInstance } from '@/lib/api';
import { getModules } from '@/lib/api/modules';
import {
  ChatConfigResponse,
  ChatMessage,
  ChatRoom,
  ChatSettings,
  InvitationToken,
} from '@/lib/models/chat';

export const getChatSettings = async () => {
  const res = await axiosInstance.get<ChatConfigResponse>(`/config/chat`);
  return res.data;
};

export const patchChatSettings = async (chatData: Partial<ChatSettings>) => {
  await axiosInstance.patch<ChatConfigResponse>('/config/chat', {
    config: { ...chatData },
  });
  return new Promise<Awaited<ReturnType<typeof getModules>>>(
    async (resolve, reject) => {
      setTimeout(async () => {
        try {
          const modules = await getModules();
          resolve(modules);
        } catch (error) {
          reject(error);
        }
      }, 3000);
    }
  );
};

export const getMessages = async (args: {
  skip?: number;
  limit?: number;
  sort?: string;
  senderUser?: string;
  roomId?: string;
  search?: string;
  populate?: string[];
}) => {
  type Response = {
    messages: ChatMessage[];
    count: number;
  };
  return await axiosInstance
    .get<Response>('/chat/messages', { params: args })
    .then(res => res.data);
};

export const deleteMessages = async (ids: string[]) => {
  return await axiosInstance
    .delete<string>('/chat/messages', { params: ids })
    .then(res => res.data);
};

export const getRooms = async (args: {
  skip?: number;
  limit?: number;
  sort?: string;
  search?: string;
  populate?: string[];
}) => {
  type Response = {
    chatRoomDocuments: ChatRoom[];
    count: number;
  };
  return await axiosInstance
    .get<Response>('/chat/rooms', { params: args })
    .then(res => res.data);
};

export const getRoomById = async (
  roomId: string,
  args: {
    populate?: string[];
  }
) => {
  return await axiosInstance
    .get<ChatRoom>(`/chat/rooms/${roomId}`, { params: args })
    .then(res => res.data);
};

export const createRoom = async (data: {
  name: string;
  participants: string[];
}) => {
  return await axiosInstance
    .post<ChatRoom>('/chat/rooms', data)
    .then(res => res.data);
};

export const deleteRooms = async (ids: string[]) => {
  return await axiosInstance
    .delete<string>('/chat/rooms', { params: ids })
    .then(res => res.data);
};

export const removeUsersFromRoom = async (
  roomId: string,
  args: {
    users: string[];
  }
) => {
  const res = await axiosInstance.put<string>(
    `/chat/leave/${roomId}`,
    args.users
  );
  return res.data;
};

export const addUsersToRoom = async (args: {
  roomId: string;
  users: string[];
}) => {
  return await axiosInstance
    .put<string>(`/chat/rooms/${args.roomId}`, args.users)
    .then(res => res.data);
};

export const getRoomInvitations = async (
  roomId: string,
  args: {
    skip?: number;
    limit?: number;
    sort?: string;
    populate?: string[];
  }
) => {
  type Response = {
    invitations: InvitationToken[];
    count: number;
  };
  return await axiosInstance
    .get<Response>(`/chat/invitations/${roomId}`, { params: args })
    .then(res => res.data);
};

export const deleteRoomInvitations = async (
  roomId: string,
  users: string[]
) => {
  return await axiosInstance
    .delete(`/chat/invitations/${roomId}`, { params: users })
    .then(res => res.data);
};
