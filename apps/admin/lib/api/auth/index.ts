'use server';
import { axiosInstance } from '@/lib/api';
import { cookies } from 'next/headers';

export const loginAction = async (username: string, password: string) => {
  const res = await axiosInstance.post('/login', { username, password });
  cookies().set({ name: 'accessToken', value: res.data.token, httpOnly: true, maxAge: 72000 });
  return res.data;
};

export const getUser = async () => {
  return await getUserRequest().catch(() => {
    return null;
  });
};

export const getUserRequest = async () => {
  const res = await axiosInstance.get('/admins/me');
  return res.data;
};
