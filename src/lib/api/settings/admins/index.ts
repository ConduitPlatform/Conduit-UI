'use server';
import { Admin } from '@/lib/models/User';
import { getApiClient } from '@/lib/api';
import { withAdminApiError } from '@/lib/logic/api-error';

export const getAdminById = async (id: string) => {
  return withAdminApiError(async () => {
    const res = await (await getApiClient()).get(`/admins/${id}`);
    return res.data;
  });
};
export const getAdmins = async (
  skip: number,
  limit: number
): Promise<{ admins: Admin[]; count: number }> => {
  return withAdminApiError(async () => {
    const res = await (
      await getApiClient()
    ).get(`/admins`, {
      params: {
        skip,
        limit,
      },
    });
    return res.data;
  });
};
export const postNewAdminUser = async (username: string, password: string) => {
  await withAdminApiError(async () => {
    await (await getApiClient()).post(`/admins`, { username, password });
  });
};

export const changeAdminsPasswordById = async (
  adminId: string,
  newPassword: string
) => {
  await withAdminApiError(async () => {
    await (
      await getApiClient()
    ).put(`/admins/${adminId}/change-password`, {
      newPassword,
    });
  });
};

export const deleteAdmin = async (id: string) => {
  await withAdminApiError(async () => {
    await (await getApiClient()).delete(`/admins/${id}`);
  });
};
