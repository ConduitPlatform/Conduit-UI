'use server';
import { getApiClient } from '@/lib/api';
import { getModules } from '@/lib/api/modules';
import { SmsSettings } from '@/lib/models/Sms';
import { CommunicationsConfigResponse } from '@/lib/models/communications';
import {
  extractModuleConfigFromCommunications,
  buildCommunicationsPatchPayload,
} from '@/lib/utils/config-utils';

type ConfigResponse = { config: SmsSettings };

export const getSmsSettings = async (): Promise<ConfigResponse> => {
  const res = await (
    await getApiClient()
  ).get<CommunicationsConfigResponse>('/config/communications');
  const smsConfig = extractModuleConfigFromCommunications<SmsSettings>(
    res.data.config,
    'sms'
  );
  return { config: smsConfig };
};

export const patchSmsSettings = async (smsData: Partial<SmsSettings>) => {
  await (
    await getApiClient()
  ).patch<CommunicationsConfigResponse>(
    '/config/communications',
    buildCommunicationsPatchPayload('sms', smsData)
  );

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

export const testSendSMS = async (smsData: { to: string; message: string }) => {
  const res = await (await getApiClient()).post(`/sms/send`, { ...smsData });
  return res.data;
};
