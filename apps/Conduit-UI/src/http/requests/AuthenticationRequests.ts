import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
  putRequest,
} from '../requestsConfig';
import { AuthUser } from '../../models/authentication/AuthModels';
import { Pagination, Search, Sort } from '../../models/http/HttpModels';

export const getAuthUsersDataReq = (params: Pagination & Search & { provider: string } & Sort) =>
  getRequest(`/admin/authentication/users`, { params });

export const createNewUsers = (values: { email: string; password: string }) =>
  postRequest(`/admin/authentication/users`, {
    email: values.email,
    password: values.password,
  });

export const editUser = (values: AuthUser) =>
  patchRequest(`/admin/authentication/users/${values._id}`, {
    ...values,
  });

export const deleteUsers = (ids: string[]) => {
  return deleteRequest(`/admin/authentication/users`, { data: { ids } });
};

export const searchUser = (identifier: string) => {
  return getRequest(`/admin/authentication/users`, {
    params: {
      identifier: identifier,
    },
  });
};

export const blockUser = (id: string) => {
  return postRequest(`/admin/authentication/users/${id}/block`);
};

export const blockUnblockUsers = (body: { ids: string[]; block: boolean }) => {
  return postRequest(`/admin/authentication/users/toggle`, body);
};

export const unblockUser = (id: string) => {
  return postRequest(`/admin/authentication/users/${id}/unblock`);
};

export const getAuthenticationConfig = () => getRequest(`/admin/config/authentication`);

export const putAuthenticationConfig = (body: any) =>
  putRequest(`/admin/config/authentication`, { config: { ...body } });
