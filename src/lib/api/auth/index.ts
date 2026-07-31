'use server';
import { getApiClient } from '@/lib/api';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { buildSessionCookieOptions } from '@/lib/api/auth/cookie-options';
import { getEnvironment } from '@/lib/logic/EnvManager';

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

  const envDetails = await getEnvironment(environment);
  const cookieStore = await cookies();
  cookieStore.set({
    name: `${envDetails.name}AccessToken`,
    ...buildSessionCookieOptions(token, token),
  });
  cookieStore.set({
    name: `activeEnv`,
    ...buildSessionCookieOptions(envDetails.name, token),
  });
  return twoFaRequired;
};

export const loginSecondFactor = async (code: string, environment: string) => {
  const res = await (
    await getApiClient(environment)
  ).post('/verify-twofa', { code });

  const token = res.data.result;
  const envDetails = await getEnvironment(environment);
  const cookieStore = await cookies();
  cookieStore.set({
    name: `${envDetails.name}AccessToken`,
    ...buildSessionCookieOptions(token, token),
  });
  cookieStore.set({
    name: `activeEnv`,
    ...buildSessionCookieOptions(envDetails.name, token),
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
  const cookieStore = await cookies();
  const activeEnv = cookieStore.get('activeEnv');
  if (!activeEnv?.value) return;
  const envDetails = await getEnvironment(activeEnv.value);
  cookieStore.delete(`${envDetails.name}AccessToken`);
  cookieStore.delete(`activeEnv`);
};

export const switchEnv = async (env: string) => {
  const envDetails = await getEnvironment(env);
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(`${envDetails.name}AccessToken`)?.value;
  cookieStore.set({
    name: `activeEnv`,
    ...buildSessionCookieOptions(envDetails.name, accessToken),
  });
};
