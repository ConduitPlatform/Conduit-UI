'use server';
import { axiosInstance } from '@/lib/api';
import { User } from '@/lib/models/User';
import { getModules } from '@/lib/api/modules';
import { AuthenticationConfig, AuthenticationConfigResponse } from '@/lib/models/authentication';

export const getUsers = async (skip: number, limit: number, params?: {
  sort?: string,
  search?: string,
  isActive?: boolean,
  provider?: string
}): Promise<{ users: User[], count: number }> => {
  const res = await axiosInstance.get(`/authentication/users`, {
    params: {
      skip,
      limit,
      ...params,
    },
  });
  return res.data;
};

export const createUser = async (email: string, password: string): Promise<User> => {
  const res = await axiosInstance.post(`/authentication/users`, {
    email,
    password,
  });
  return res.data;
};

export const getAuthenticationSettings = async (): Promise<AuthenticationConfigResponse> => {
  const res = await axiosInstance.get<AuthenticationConfigResponse>('config/authentication');
  return res.data;
};

export const patchAuthenticationSettings = async (data: Partial<AuthenticationConfig>) => {
  await axiosInstance.patch<AuthenticationConfigResponse>(`/config/authentication`, { config: { ...data } });
  return new Promise<Awaited<ReturnType<typeof getModules>>>(async (resolve, reject) => {
    setTimeout(async () => {
      try {
        const modules = await getModules();
        resolve(modules);
      } catch (error) {
        reject(error);
      }
    }, 3000);
  });
};
