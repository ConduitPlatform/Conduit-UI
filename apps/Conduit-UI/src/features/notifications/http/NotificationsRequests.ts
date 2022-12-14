import { getRequest, postRequest, patchRequest } from '../../../http/requestsConfig';
import { INotificationConfig, NotificationData } from '../models/NotificationModels';

export const sendNotification = (data: NotificationData) =>
  postRequest(`/pushNotifications/sendToManyDevices`, {
    ...data,
  });

export const getNotificationConfig = () => getRequest(`/config/pushNotifications`);

export const patchNotificationConfig = (data: INotificationConfig) =>
  patchRequest(`/config/pushNotifications`, {
    config: { ...data },
  });
