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

export const getMessages = (args: {
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
  return axiosInstance
    .get<Response>('/chat/messages', { params: args })
    .then(res => res.data);
};

export const deleteMessages = (ids: string[]) => {
  return axiosInstance
    .delete<string>('/chat/messages', { params: ids })
    .then(res => res.data);
};

export const getRooms = (args: {
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
  return axiosInstance
    .get<Response>('/chat/rooms', { params: args })
    .then(res => res.data);
};

export const getRoomById = (
  roomId: string,
  args: {
    populate?: string[];
  }
) => {
  return axiosInstance
    .get<ChatRoom>(`/chat/rooms/${roomId}`, { params: args })
    .then(res => res.data);
};

export const createRoom = (data: { name: string; participants: string[] }) => {
  return axiosInstance
    .post<ChatRoom>('/chat/rooms', data)
    .then(res => res.data);
};

export const deleteRooms = (ids: string[]) => {
  return axiosInstance
    .delete<string>('/chat/rooms', { params: ids })
    .then(res => res.data);
};

// TODO: pending admin implementation
export const removeUsersFromRoom = (args: {
  roomId: string;
  users: string[];
}) => {
  return axiosInstance
    .put<string>(`/chat/leave/${args.roomId}`, args.users)
    .then(res => res.data);
};

export const addUsersToRoom = (args: { roomId: string; users: string[] }) => {
  return axiosInstance
    .put<string>(`/chat/rooms/${args.roomId}`, args.users)
    .then(res => res.data);
};

export const getRoomInvitations = (
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
  return axiosInstance
    .get<Response>(`/chat/invitations/${roomId}`, { params: args })
    .then(res => res.data);
};

export const deleteRoomInvitations = (roomId: string, users: string[]) => {
  return axiosInstance
    .delete(`/chat/invitations/${roomId}`, { params: users })
    .then(res => res.data);
};
