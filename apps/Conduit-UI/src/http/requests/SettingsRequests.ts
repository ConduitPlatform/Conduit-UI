import { Pagination } from '../../models/http/HttpModels';
import { ICoreSettings } from '../../models/settings/SettingsModels';
import { deleteRequest, getRequest, postRequest, putRequest } from '../requestsConfig';

export const getAdminModulesRequest = () => {
  return getRequest(`/admin/config/modules`);
};

export const getServiceAccounts = () => {
  return getRequest(`/admin/authentication/services`);
};

export const deleteServiceAccounts = (_id: string) => {
  return deleteRequest(`/admin/authentication/services/${_id}`);
};

export const createServiceAccount = (name: string) => {
  return postRequest(`/admin/authentication/services`, { name });
};

export const getCoreSettings = () => {
  return getRequest(`/admin/config/core`);
};

export const putCoreSettings = (data: ICoreSettings) => {
  return putRequest(`/admin/config/core`, { config: { ...data } });
};

export const refreshServiceAccount = (serviceId: string) => {
  return getRequest(`/admin/authentication/services/${serviceId}/token`);
};

export const postNewAdminUser = (endpointData: { username: string; password: string }) => {
  return postRequest(`/admin/admins`, endpointData);
};

export const getAdmins = (params: Pagination) => {
  return getRequest(`/admin/admins`, { params });
};

export const deleteAdmin = (id: string) => {
  return deleteRequest(`/admin/admins/${id}`);
};

export const changePassword = (oldPassword: string, newPassword: string) => {
  return putRequest(`/admin/admin/change-password`, {
    data: { oldPassword: oldPassword, newPassword: newPassword },
  });
};
