'use server';
import axios from 'axios';
import { cookies } from 'next/headers';

export const axiosInstance = axios.create({
  baseURL: process.env.API_BASE_URL,
  withCredentials: true,
  timeout: 50000, // request timeout in milliseconds
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    masterkey: process.env.MASTER_KEY,
  },
});
axiosInstance.interceptors.request.use(
  config => {
    if (config.headers.Authorization) return config;
    const accessToken = cookies().get('accessToken');
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
