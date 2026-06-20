'use server';
import { getApiClient } from '@/lib/api';
import { afterPatchServing } from '@/lib/api/modules/afterPatchServing';
import { PatchSettingsOptions } from '@/lib/api/modules/patch-settings-options';
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

export const patchSmsSettings = async (
  smsData: Partial<SmsSettings>,
  options?: PatchSettingsOptions
) => {
  await (
    await getApiClient()
  ).patch<CommunicationsConfigResponse>(
    '/config/communications',
    buildCommunicationsPatchPayload('sms', smsData)
  );

  return afterPatchServing(options);
};

export const testSendSMS = async (smsData: { to: string; message: string }) => {
  const res = await (await getApiClient()).post(`/sms/send`, { ...smsData });
  return res.data;
};
