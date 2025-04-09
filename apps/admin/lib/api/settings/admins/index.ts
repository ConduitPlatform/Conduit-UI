'use server';
import { Admin } from '@/lib/models/User';
import { getApiClient } from '@/lib/api';

export const getAdminById = async (id: string) => {
  const res = await (await getApiClient()).get(`/admins/${id}`);
  return res.data;
};
export const getAdmins = async (
  skip: number,
  limit: number
): Promise<{ admins: Admin[]; count: number }> => {
  const res = await (
    await getApiClient()
  ).get(`/admins`, {
    params: {
      skip,
      limit,
    },
  });
  return res.data;
};
export const postNewAdminUser = async (username: string, password: string) => {
  await (await getApiClient()).post(`/admins`, { username, password });
};

export const changeAdminsPasswordById = async (
  adminId: string,
  newPassword: string
) => {
  await (
    await getApiClient()
  ).put(`/admins/${adminId}/change-password`, {
    newPassword,
  });
};

export const deleteAdmin = async (id: string) => {
  await (await getApiClient()).delete(`/admins/${id}`);
};
