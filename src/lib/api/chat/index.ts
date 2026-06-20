'use server';
import { getApiClient } from '@/lib/api';
import { afterPatchServing } from '@/lib/api/modules/afterPatchServing';
import { PatchSettingsOptions } from '@/lib/api/modules/patch-settings-options';
import {
  ChatConfigResponse,
  ChatMessage,
  ChatRoom,
  ChatSettings,
  InvitationToken,
} from '@/lib/models/chat';

export const getChatSettings = async () => {
  const res = await (
    await getApiClient()
  ).get<ChatConfigResponse>(`/config/chat`);
  return res.data;
};

export const patchChatSettings = async (
  chatData: Partial<ChatSettings>,
  options?: PatchSettingsOptions
) => {
  await (
    await getApiClient()
  ).patch<ChatConfigResponse>('/config/chat', {
    config: { ...chatData },
  });
  return afterPatchServing(options);
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
  return await (await getApiClient())
    .get<Response>('/chat/messages', { params: args })
    .then(res => res.data);
};

export const deleteMessages = async (ids: string[]) => {
  return await (await getApiClient())
    .delete<string>('/chat/messages', { params: { ids } })
    .then(res => res.data);
};

export const getRooms = async (args: {
  skip?: number;
  limit?: number;
  sort?: string[];
  search?: string;
  users?: string[];
  deleted?: boolean;
  populate?: string[];
}) => {
  type Response = {
    chatRoomDocuments: ChatRoom[];
    count: number;
  };
  return await (await getApiClient())
    .get<Response>('/chat/rooms', { params: args })
    .then(res => res.data);
};

export const getRoomById = async (
  roomId: string,
  args: {
    populate?: string[];
  }
) => {
  return await (await getApiClient())
    .get<ChatRoom>(`/chat/rooms/${roomId}`, { params: args })
    .then(res => res.data);
};

export const createRoom = async (data: {
  name: string;
  participants: string[];
  creator: string;
}) => {
  return await (await getApiClient())
    .post<ChatRoom>('/chat/rooms', data)
    .then(res => res.data);
};

export const deleteRooms = async (ids: string[]) => {
  return await (await getApiClient())
    .delete<string>('/chat/rooms', { params: { ids } })
    .then(res => res.data);
};

export const removeUsersFromRoom = async (
  roomId: string,
  args: {
    users: string[];
  }
) => {
  return await (
    await getApiClient()
  )
    .put<string>(`/chat/room/${roomId}/remove`, {
      users: args.users,
    })
    .then(res => res.data);
};

export const addUsersToRoom = async (
  roomId: string,
  args: {
    users: string[];
  }
) => {
  return await (await getApiClient())
    .put<string>(`/chat/rooms/${roomId}/add`, { users: args.users })
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
  return await (await getApiClient())
    .get<Response>(`/chat/invitations/${roomId}`, { params: args })
    .then(res => res.data);
};

export const deleteRoomInvitations = async (
  roomId: string,
  args: {
    invitations: string[];
  }
) => {
  return await (await getApiClient())
    .delete(`/chat/invitations/${roomId}`, { params: args })
    .then(res => res.data);
};
