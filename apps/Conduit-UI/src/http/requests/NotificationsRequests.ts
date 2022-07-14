import { getRequest, postRequest, patchRequest } from '../requestsConfig';
import {
  INotificationConfig,
  NotificationData,
} from '../../models/notifications/NotificationModels';

export const sendNotification = (data: NotificationData) =>
  postRequest(`/pushNotifications/sendToManyDevices`, {
    ...data,
  });

export const getNotificationConfig = () => getRequest(`/config/pushNotifications`);

export const patchNotificationConfig = (data: INotificationConfig) =>
  patchRequest(`/config/pushNotifications`, {
    config: { ...data },
  });
