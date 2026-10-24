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

type PushSendParams = {
  userId: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  platform?: string;
  doNotStore?: boolean;
  isSilent?: boolean;
};

const postPushSend = async (params: PushSendParams) => {
  const client = await getApiClient();
  const res = await client.post('/push/send', params);
  return res.data;
};

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
  ).get(`/push/tokens`, {
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
  ).get<{ tokenDocuments: NotificationToken }>(`/push/tokens/${id}`, {
    params: {
      populate,
    },
  });
  return res.data.tokenDocuments;
};

export const sendNotifications = async (params: {
  userIds: string[];
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  isSilent?: boolean;
  platform?: string;
  doNotStore?: boolean;
}): Promise<void> => {
  const { userIds, title, body, data, isSilent, platform, doNotStore } = params;
  const results = await Promise.allSettled(
    userIds.map(userId =>
      postPushSend({
        userId,
        title,
        body,
        data,
        isSilent,
        platform,
        doNotStore,
      })
    )
  );
  const failures = results.filter(r => r.status === 'rejected');
  if (failures.length > 0) {
    throw new Error(
      `Failed to send to ${failures.length} of ${userIds.length} recipient(s)`
    );
  }
};

export const sendPushNotification = async (data: Record<string, unknown>) => {
  return postPushSend(data as PushSendParams);
};

export const sendManyPushNotifications = async (
  notifications: PushSendParams[]
) => {
  const results = await Promise.allSettled(
    notifications.map(notification => postPushSend(notification))
  );
  const failures = results.filter(r => r.status === 'rejected');
  if (failures.length > 0) {
    throw new Error(
      `Failed to send ${failures.length} of ${notifications.length} notification(s)`
    );
  }
};

export const getPushTokensForUser = async (userId: string) => {
  const res = await (
    await getApiClient()
  ).get<{ tokens: NotificationToken[]; count: number }>(`/push/tokens`, {
    params: { search: userId },
  });
  return { tokens: res.data.tokens };
};
