import { deleteRequest, getRequest, patchRequest, postRequest } from '../requestsConfig';
import { IChatConfig } from '../../models/chat/ChatModels';

export const getChatConfig = () => getRequest(`/config/chat`);

export const patchChatConfig = (params: IChatConfig) =>
  patchRequest(`/config/chat`, {
    config: { ...params },
  });

export const createChatRoom = (params: { name: string; participants: string[] }) =>
  postRequest(`/chat/rooms`, {
    ...params,
  });

export const getChatRooms = (params: { skip: number; limit: number; search?: string }) =>
  getRequest(`/chat/rooms`, {
    populate: 'participants',
    skip: params.skip,
    limit: params.limit,
    search: params.search,
  });

export const getChatMessages = (params: {
  skip: number;
  limit: number;
  senderId?: string;
  roomId?: string;
  sort?: string;
}) =>
  getRequest(`/chat/messages`, {
    populate: 'senderUser',
    skip: params.skip,
    limit: params.limit,
    roomId: params.roomId,
    senderId: params.senderId,
    sort: params.sort,
  });

export const deleteChatRooms = (params: { ids: string[] }) =>
  deleteRequest(`/chat/rooms`, { params: { ...params.ids } });

export const deleteChatMessages = (params: { ids: string[] }) =>
  deleteRequest(`/chat/messages`, { params: { ...params.ids } });
