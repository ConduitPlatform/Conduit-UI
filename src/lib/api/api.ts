'use server';
import axios from 'axios';
import { cookies } from 'next/headers';
import { _getEnv } from '@/lib/logic/EnvManager';
import { redirect, RedirectType } from 'next/navigation';

export const getApiClient = async (env?: string) => {
  const envCookie = (await cookies()).get('activeEnv');
  const envDetails = await _getEnv(env ?? envCookie?.value ?? 'Local');

  const axiosInstance = axios.create({
    baseURL: envDetails.baseUrl,
    withCredentials: true,
    timeout: 50000, // request timeout in milliseconds
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      masterkey: envDetails.masterKey,
    },
  });
  axiosInstance.interceptors.request.use(
    async config => {
      if (config.headers.Authorization) return config;
      const accessToken = (await cookies()).get(
        `${envDetails.name}AccessToken`
      );
      if (!accessToken) return config;
      config.headers.Authorization = `Bearer ${accessToken.value}`;
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );
  axiosInstance.interceptors.response.use(
    response => {
      return response;
    },
    async error => {
      const { response } = error;
      if (response?.status === 401 && error.request.path !== '/admin/login') {
        redirect('/login?session-timeout=true', RedirectType.replace);
      }
      if (error.response) {
        console.error(
          `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} -> ${error.response.status}`,
          error.response.data
        );
      } else if (error.request) {
        console.error(
          `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} -> No response`,
          error.message
        );
      } else {
        console.error('[API Error] Request setup failed:', error.message);
      }
      return Promise.reject(error);
    }
  );
  return axiosInstance;
};
