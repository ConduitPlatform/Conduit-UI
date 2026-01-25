'use server';
import { getApiClient } from '@/lib/api';
import { NotificationSettings } from '@/lib/models/Notification';
import { getModules } from '@/lib/api/modules';
import { NotificationToken } from '@/lib/models/notification/NotificationToken';
import { CommunicationsConfigResponse } from '@/lib/models/communications';
import {
  isModuleProvidedByCommunications,
  extractModuleConfigFromCommunications,
  buildCommunicationsPatchPayload,
} from '@/lib/utils/config-utils';

type ConfigResponse = { config: NotificationSettings };

export const getNotificationSettings = async (): Promise<ConfigResponse> => {
  const isCommunications =
    await isModuleProvidedByCommunications('pushNotifications');

  if (isCommunications) {
    const res = await (
      await getApiClient()
    ).get<CommunicationsConfigResponse>('/config/communications');
    const pushConfig =
      extractModuleConfigFromCommunications<NotificationSettings>(
        res.data.config,
        'pushNotifications'
      );
    return { config: pushConfig };
  }

  const res = await (
    await getApiClient()
  ).get<ConfigResponse>('/config/pushNotifications', {});
  return res.data;
};

export const patchNotificationSettings = async (
  data: Partial<NotificationSettings>
) => {
  const isCommunications =
    await isModuleProvidedByCommunications('pushNotifications');

  if (isCommunications) {
    await (
      await getApiClient()
    ).patch<CommunicationsConfigResponse>(
      '/config/communications',
      buildCommunicationsPatchPayload('pushNotifications', data)
    );
  } else {
    await (
      await getApiClient()
    ).patch<ConfigResponse>('/config/pushNotifications', {
      config: { ...data },
    });
  }

  return new Promise<Awaited<ReturnType<typeof getModules>>>(
    async (resolve, reject) => {
      setTimeout(async () => {
        try {
          const modules = await getModules();
          resolve(modules);
        } catch (error) {
          reject(error);
        }
      }, 3000);
    }
  );
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
