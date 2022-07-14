import { getRequest, postRequest, putRequest } from '../requestsConfig';
import {
  INotificationConfig,
  NotificationData,
} from '../../models/notifications/NotificationModels';

export const sendNotification = (data: NotificationData) =>
  postRequest(`/pushNotifications/sendToManyDevices`, {
    ...data,
  });

export const getNotificationConfig = () => getRequest(`/config/pushNotifications`);

export const putNotificationConfig = (data: INotificationConfig) =>
  putRequest(`/config/pushNotifications`, {
    config: { ...data },
  });
