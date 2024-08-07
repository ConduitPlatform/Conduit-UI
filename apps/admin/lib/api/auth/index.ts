'use server';
import { axiosInstance } from '@/lib/api';
import { cookies } from 'next/headers';

export const adminLogin = async (username: string, password: string) => {
  const res = await axiosInstance.post('/login', { username, password });
  cookies().set({
    name: 'accessToken',
    value: res.data.token,
    httpOnly: true,
    maxAge: 72000,
  });
  return res.data;
};

export const getAdmin = async () => {
  const res = await axiosInstance.get('/admins/me').catch(() => {
    return null;
  });
  return res ? res.data : res;
};
