'use server';
import { getApiClient } from '@/lib/api';
import { NotificationSettings } from '@/lib/models/Notification';
import { afterPatchServing } from '@/lib/api/modules/afterPatchServing';
import { PatchSettingsOptions } from '@/lib/api/modules/patch-settings-options';
import { NotificationToken } from '@/lib/models/notification/NotificationToken';
import { CommunicationsConfigResponse } from '@/lib/models/communications';
import {
  extractModuleConfigFromCommunications,
  buildCommunicationsPatchPayload,
} from '@/lib/utils/config-utils';

type ConfigResponse = { config: NotificationSettings };

export const getNotificationSettings = async (): Promise<ConfigResponse> => {
  const res = await (
    await getApiClient()
  ).get<CommunicationsConfigResponse>('/config/communications');
  const pushConfig =
    extractModuleConfigFromCommunications<NotificationSettings>(
      res.data.config,
      'pushNotifications'
    );
  return { config: pushConfig };
};

export const patchNotificationSettings = async (
  data: Partial<NotificationSettings>,
  options?: PatchSettingsOptions
) => {
  await (
    await getApiClient()
  ).patch<CommunicationsConfigResponse>(
    '/config/communications',
    buildCommunicationsPatchPayload('pushNotifications', data)
  );

  return afterPatchServing(options);
};
export const getTokens = async (
  skip: number,
  limit: number,
  params?: {
    sort?: string;
    search?: string;
    platform?: string;
  }
): Promise<{ tokens: NotificationToken[]; count: number }> => {
  const res = await (
    await getApiClient()
  ).get(`/pushNotifications/token`, {
    params: {
      skip,
      limit,
      ...params,
    },
  });
  return res.data;
};

export const getTokenById = async (
  id: string,
  populate?: string
): Promise<NotificationToken> => {
  const res = await (
    await getApiClient()
  ).get(`/pushNotifications/token/${id}`, {
    params: {
      populate,
    },
  });
  return res.data;
};

export const sendNotifications = async (params: {
  userIds: string[];
  title: string;
  body?: string;
  data?: Record<string, any>;
  isSilent?: boolean;
  platform?: string;
  doNotStore?: boolean;
}): Promise<NotificationToken> => {
  const res = await (
    await getApiClient()
  ).post(`/pushNotifications/sendToManyDevices`, {
    ...params,
  });
  return res.data;
};

export const sendPushNotification = async (data: Record<string, unknown>) => {
  const res = await (
    await getApiClient()
  ).post('/pushNotifications/send', data);
  return res.data;
};

export const sendManyPushNotifications = async (
  data: Record<string, unknown>
) => {
  const res = await (
    await getApiClient()
  ).post('/pushNotifications/sendMany', data);
  return res.data;
};

export const getPushTokensForUser = async (userId: string) => {
  const res = await (
    await getApiClient()
  ).get(`/pushNotifications/token/user/${userId}`);
  return res.data;
};
