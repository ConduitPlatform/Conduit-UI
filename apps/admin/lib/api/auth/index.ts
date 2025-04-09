'use server';
import { getApiClient } from '@/lib/api';
import { cookies } from 'next/headers';

export const adminLogin = async (
  username: string,
  password: string,
  environment: string
) => {
  const res = await (
    await getApiClient(environment)
  ).post('/login', { username, password });
  cookies().set({
    name: `${environment}AccessToken`,
    value: res.data.token,
    httpOnly: true,
    maxAge: 72000,
  });
  cookies().set({
    name: `activeEnv`,
    value: environment,
    httpOnly: true,
    maxAge: 72000,
  });
  return res.data;
};

export const getAdmin = async () => {
  const res = await (await getApiClient()).get('/admins/me').catch(() => {
    return null;
  });
  return res ? res.data : res;
};

export const adminLogout = async () => {
  const activeEnv = cookies().get('activeEnv')!;
  cookies().delete(`${activeEnv.value}AccessToken`);
  cookies().delete(`activeEnv`);
};
export const switchEnv = async (env: string) => {
  cookies().set({
    name: `activeEnv`,
    value: env,
    httpOnly: true,
    maxAge: 72000,
  });
};
