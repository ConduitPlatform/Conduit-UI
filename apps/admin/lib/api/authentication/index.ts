'use server';
import { axiosInstance } from '@/lib/api';
import { User } from '@/lib/models/User';

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
