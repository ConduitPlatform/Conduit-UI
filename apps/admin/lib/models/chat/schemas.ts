import { User } from '@/lib/models/User';

export type ChatRoom = {
  _id: string;
  name: string;
  creator?: string | User;
  participants: string[] | User[];
  participantsLog: (string | ParticipantsLogs)[];
  deleted: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type ParticipantsLogs = {
  _id: string;
  action: 'add' | 'remove' | 'create' | 'join' | 'leave';
  user: string | User;
  chatRoom: string | ChatRoom;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type InvitationToken = {
  _id: string;
  sender: string | User;
  receiver: string | User;
  token: string;
  room: string | ChatRoom;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type ChatMessage = {
  _id: string;
  message: string;
  senderUser: string | User;
  room: string | ChatRoom;
  readBy: string[] | User[];
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};
