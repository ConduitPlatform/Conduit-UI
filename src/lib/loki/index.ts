'use server';
import axios from 'axios';
import { cookies } from 'next/headers';
import { _getEnv } from '@/lib/logic/EnvManager';

export const getLokiClient = async (env?: string) => {
  const envCookie = (await cookies()).get('activeEnv');
  const envDetails = await _getEnv(env ?? envCookie?.value ?? 'Local');

  const lokiUrl = envDetails.lokiUrl?.trim();
  if (!lokiUrl) {
    throw new Error(
      'LOKI_URL is not configured for this environment. Set it to enable log viewing.'
    );
  }

  const lokiInstance = axios.create({
    baseURL: lokiUrl.replace(/\/$/, ''),
    timeout: 50000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  lokiInstance.interceptors.response.use(
    response => {
      return response;
    },
    async error => {
      if (error.response) {
        console.error(
          `[Loki Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} -> ${error.response.status}`,
          error.response.data
        );
      } else if (error.request) {
        console.error(
          `[Loki Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} -> No response`,
          error.message
        );
      } else {
        console.error('[Loki Error] Request setup failed:', error.message);
      }
      return Promise.reject(error);
    }
  );

  return lokiInstance;
};
