import { User } from '@/lib/models/User';
import { PlatformTypesEnum } from '@/lib/models/notification/PlatformTypesEnum';

export type NotificationToken = {
  _id: string;
  userId: string | User;
  token: string;
  platform: string | PlatformTypesEnum;
  createdAt: string;
  updatedAt: string;
};
