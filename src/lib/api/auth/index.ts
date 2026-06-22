'use server';
import { getApiClient } from '@/lib/api';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const adminLogin = async (
  username: string,
  password: string,
  environment: string
): Promise<boolean> => {
  const res = await (
    await getApiClient(environment)
  ).post('/login', { username, password });
  const token = res.data.token;
  const decodedToken = jwt.decode(token) as { twoFaRequired?: boolean };
  const twoFaRequired = decodedToken?.twoFaRequired || false;

  (await cookies()).set({
    name: `${environment}AccessToken`,
    value: res.data.token,
    httpOnly: true,
    maxAge: 72000,
  });
  (await cookies()).set({
    name: `activeEnv`,
    value: environment,
    httpOnly: true,
    maxAge: 72000,
  });
  return twoFaRequired;
};

export const loginSecondFactor = async (code: string, environment: string) => {
  const res = await (
    await getApiClient(environment)
  ).post('/verify-twofa', { code });

  (await cookies()).set({
    name: `${environment}AccessToken`,
    value: res.data.result,
    httpOnly: true,
    maxAge: 72000,
  });
  return 'OK';
};

export const getAdmin = async () => {
  const res = await (await getApiClient()).get('/admins/me').catch(() => {
    return null;
  });
  return res ? res.data : res;
};

export const adminLogout = async () => {
  const activeEnv = (await cookies()).get('activeEnv')!;
  (await cookies()).delete(`${activeEnv.value}AccessToken`);
  (await cookies()).delete(`activeEnv`);
};
export const switchEnv = async (env: string) => {
  (await cookies()).set({
    name: `activeEnv`,
    value: env,
    httpOnly: true,
    maxAge: 72000,
  });
};
