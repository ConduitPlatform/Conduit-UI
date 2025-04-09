'use server';
import axios from 'axios';
import { cookies } from 'next/headers';
import { getEnv } from '@/lib/logic/EnvManager';

export const getLokiClient = async (env?: string) => {
  const envCookie = (await cookies()).get('activeEnv');
  const envDetails = await getEnv(env ?? envCookie?.value ?? 'Local');

  const lokiInstance = axios.create({
    baseURL: envDetails.lokiUrl,
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
        // Server responded with a status code outside the range of 2xx
        console.error({
          message: error.message,
          status: error.response.status,
          statusText: error.response.statusText,
          url: error.config.url,
          method: error.config.method,
          data: error.response.data,
          headers: error.response.headers,
        });
      } else if (error.request) {
        // Request was made but no response was received
        console.error({
          message: error.message,
          url: error.config.url,
          method: error.config.method,
          request: error.request,
        });
      } else {
        // Something happened in setting up the request
        console.error({
          message: error.message,
          config: error.config,
        });
      }
      return Promise.reject(error);
    }
  );

  return lokiInstance;
};
