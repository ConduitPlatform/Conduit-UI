import { deleteRequest, getRequest, postRequest, putRequest } from '../requestsConfig';
import { IChatConfig } from '../../models/chat/ChatModels';

export const getChatConfig = () => getRequest(`/admin/config/chat`);

export const putChatConfig = (params: IChatConfig) =>
  putRequest(`/admin/config/chat`, {
    config: { ...params },
  });

export const createChatRoom = (params: { name: string; participants: string[] }) =>
  postRequest(`/admin/chat/room`, {
    ...params,
  });

export const getChatRooms = (params: { skip: number; limit: number; search?: string }) =>
  getRequest(`/admin/chat/rooms`, {
    params: {
      populate: 'participants',
      ...params,
    },
  });

export const getChatMessages = (params: {
  skip: number;
  limit: number;
  senderId?: string;
  roomId?: string;
}) =>
  getRequest(`/admin/chat/messages`, {
    params: {
      populate: 'senderUser',
      ...params,
    },
  });

export const deleteChatRooms = (params: { ids: string[] }) =>
  deleteRequest(`/admin/chat/rooms`, { params: { ...params.ids } });

export const deleteChatMessages = (params: { ids: string[] }) =>
  deleteRequest(`/admin/chat/messages`, { params: { ...params.ids } });
