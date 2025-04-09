'use server';
import axios from 'axios';
import { cookies, type UnsafeUnwrappedCookies } from 'next/headers';
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
  return axiosInstance;
};
