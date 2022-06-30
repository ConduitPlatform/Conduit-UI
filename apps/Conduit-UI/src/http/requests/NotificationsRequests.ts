import { getRequest, postRequest, putRequest } from '../requestsConfig';
import {
  INotificationConfig,
  NotificationData,
} from '../../models/notifications/NotificationModels';

export const sendNotification = (data: NotificationData) =>
  postRequest(`/admin/pushNotifications/sendToManyDevices`, {
    ...data,
  });

export const getNotificationConfig = () => getRequest(`/admin/config/pushNotifications`);

export const putNotificationConfig = (data: INotificationConfig) =>
  putRequest(`/admin/config/pushNotifications`, {
    config: { ...data },
  });
