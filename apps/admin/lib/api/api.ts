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
    const { response } = error;
    if (response?.data?.message) {
      console.error('error: ', response.status, response.data.message);
    } else {
      console.error('error: ', error.response.status, error.request.path);
    }
    return Promise.reject(error);
  }
);
