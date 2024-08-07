'use server';
import { Admin } from '@/lib/models/User';
import { axiosInstance } from '@/lib/api';

export const getAdminById = async (id: string) => {
  const res = await axiosInstance.get(`/admins/${id}`);
  return res.data;
};
export const getAdmins = async (
  skip: number,
  limit: number
): Promise<{ admins: Admin[]; count: number }> => {
  const res = await axiosInstance.get(`/admins`, {
    params: {
      skip,
      limit,
    },
  });
  return res.data;
};
export const postNewAdminUser = async (username: string, password: string) => {
  await axiosInstance.post(`/admins`, { username, password });
};

export const changeAdminsPasswordById = async (
  adminId: string,
  newPassword: string
) => {
  await axiosInstance.put(`/admins/${adminId}/change-password`, {
    newPassword,
  });
};

export const deleteAdmin = async (id: string) => {
  await axiosInstance.delete(`/admins/${id}`);
};
