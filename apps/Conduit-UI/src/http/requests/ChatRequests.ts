import { deleteRequest, getRequest, postRequest, putRequest } from '../requestsConfig';
import { IChatConfig } from '../../models/chat/ChatModels';

export const getChatConfig = () => getRequest(`/config/chat`);

export const putChatConfig = (params: IChatConfig) =>
  putRequest(`/config/chat`, {
    config: { ...params },
  });

export const createChatRoom = (params: { name: string; participants: string[] }) =>
  postRequest(`/chat/room`, {
    ...params,
  });

export const getChatRooms = (params: { skip: number; limit: number; search?: string }) =>
  getRequest(`/chat/rooms`, {
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
  getRequest(`/chat/messages`, {
    params: {
      populate: 'senderUser',
      ...params,
    },
  });

export const deleteChatRooms = (params: { ids: string[] }) =>
  deleteRequest(`/chat/rooms`, { params: { ...params.ids } });

export const deleteChatMessages = (params: { ids: string[] }) =>
  deleteRequest(`/chat/messages`, { params: { ...params.ids } });
