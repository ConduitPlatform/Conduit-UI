'use server';
import { getApiClient } from '@/lib/api';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

type AdminJwtPayload = {
  sudo?: boolean;
  twoFaRequired?: boolean;
};

const getActiveEnvironment = async () => {
  const envCookie = (await cookies()).get('activeEnv');
  return envCookie?.value ?? 'Local';
};

const getAccessToken = async () => {
  const environment = await getActiveEnvironment();
  return (await cookies()).get(`${environment}AccessToken`);
};

export const hasSudoAccess = async (): Promise<boolean> => {
  const accessToken = await getAccessToken();
  if (!accessToken) return false;
  const decoded = jwt.decode(accessToken.value) as AdminJwtPayload | null;
  if (!decoded || decoded.twoFaRequired) return false;
  return Boolean(decoded.sudo);
};

export type SudoReauthResult =
  | { status: 'success' }
  | { status: 'twoFaRequired' };

export const sudoReauthenticate = async (
  password: string
): Promise<SudoReauthResult> => {
  const admin = await getAdmin();
  if (!admin?.username) {
    throw new Error('Not authenticated');
  }
  const environment = await getActiveEnvironment();
  const twoFaRequired = await adminLogin(admin.username, password, environment);
  if (twoFaRequired) {
    return { status: 'twoFaRequired' };
  }
  return { status: 'success' };
};

export const completeSudoTwoFactor = async (code: string): Promise<void> => {
  const environment = await getActiveEnvironment();
  await loginSecondFactor(code, environment);
};

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

  const token = res.data.token ?? res.data.result;
  (await cookies()).set({
    name: `${environment}AccessToken`,
    value: token,
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
