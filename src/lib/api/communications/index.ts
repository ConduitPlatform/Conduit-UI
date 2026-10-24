'use server';

import { getApiClient } from '@/lib/api';
import {
  CommunicationsConfig,
  CommunicationsConfigResponse,
} from '@/lib/models/communications';

export const getCommunicationsConfig = async () => {
  const res = await (
    await getApiClient()
  ).get<CommunicationsConfigResponse>('/config/communications');
  return res.data;
};

export const patchCommunicationsConfig = async (
  data: Partial<CommunicationsConfig>
) => {
  const res = await (
    await getApiClient()
  ).patch<CommunicationsConfigResponse>('/config/communications', {
    config: data,
  });
  return res.data;
};
