'use server';

import { getApiClient } from '@/lib/api';
import {
  ApiToken,
  CreateTokenRequest,
  CreateTokenResponse,
  ListTokensResponse,
} from '@/lib/models/api-tokens';

export const getApiTokens = async () => {
  return await (await getApiClient())
    .get<ListTokensResponse>('/api-tokens')
    .then(res => res.data);
};

export const createApiToken = async (data: CreateTokenRequest) => {
  return await (await getApiClient())
    .post<CreateTokenResponse>('/api-tokens', data)
    .then(res => res.data);
};

export const revokeApiToken = async (id: string) => {
  return await (await getApiClient())
    .delete<{ message: string }>(`/api-tokens/${id}`)
    .then(res => res.data);
};
