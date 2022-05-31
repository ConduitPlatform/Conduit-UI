import axios from 'axios';
import { CONDUIT_API } from './requestsConfig';
import { AuthUser } from '../models/authentication/AuthModels';
import { Pagination, Search } from '../models/http/HttpModels';

export const getAuthUsersDataReq = (params: Pagination & Search & { provider: string }) =>
  axios.get(`${CONDUIT_API}/admin/authentication/users`, { params });

export const createNewUsers = (values: { email: string; password: string }) =>
  axios.post(`${CONDUIT_API}/admin/authentication/users`, {
    email: values.email,
    password: values.password,
  });

export const editUser = (values: AuthUser) =>
  axios.patch(`${CONDUIT_API}/admin/authentication/users/${values._id}`, {
    ...values,
  });

export const deleteUsers = (ids: string[]) => {
  return axios.delete(`${CONDUIT_API}/admin/authentication/users`, { data: { ids } });
};

export const searchUser = (identifier: string) => {
  return axios.get(`${CONDUIT_API}/admin/authentication/users`, {
    params: {
      identifier: identifier,
    },
  });
};

export const blockUser = (id: string) => {
  return axios.post(`${CONDUIT_API}/admin/authentication/users/${id}/block`);
};

export const blockUnblockUsers = (body: { ids: string[]; block: boolean }) => {
  return axios.post(`${CONDUIT_API}/admin/authentication/users/toggle`, body);
};

export const unblockUser = (id: string) => {
  return axios.post(`${CONDUIT_API}/admin/authentication/users/${id}/unblock`);
};

export const getAdmins = () => {
  return axios.get(`${CONDUIT_API}/admin/admins`);
};

export const deleteAdmin = (id: string) => {
  return axios.delete(`${CONDUIT_API}/admin/${id}`);
};

export const changePassword = (oldPassword: string, newPassword: string) => {
  return axios.delete(`${CONDUIT_API}/admin/admin/change-password`, {
    data: { oldPassword: oldPassword, newPassword: newPassword },
  });
};

export const getAuthenticationConfig = () =>
  axios.get(`${CONDUIT_API}/admin/config/authentication`);

export const putAuthenticationConfig = (body: any) =>
  axios.put(`${CONDUIT_API}/admin/config/authentication`, { config: { ...body } });
