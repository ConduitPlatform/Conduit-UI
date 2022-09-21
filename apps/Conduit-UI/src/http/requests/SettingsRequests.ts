import { Pagination } from '../../models/http/HttpModels';
import { IAdminSettings, ICoreSettings } from '../../models/settings/SettingsModels';
import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
  putRequest,
} from '../requestsConfig';

export const getAdminModulesRequest = () => {
  return getRequest(`/config/modules`);
};

export const getServiceAccounts = () => {
  return getRequest(`/authentication/services`);
};

export const deleteServiceAccounts = (_id: string) => {
  return deleteRequest(`/authentication/services/${_id}`);
};

export const createServiceAccount = (name: string) => {
  return postRequest(`/authentication/services`, { name });
};

export const getCoreSettings = () => {
  return getRequest(`/config/core`);
};

export const getAdminSettings = () => {
  return getRequest(`/config/admin`);
};

export const patchAdminSettings = (data: IAdminSettings) => {
  return patchRequest(`/config/admin`, { config: { ...data } });
};

export const patchCoreSettings = (data: ICoreSettings) => {
  return patchRequest(`/config/core`, { config: { ...data } });
};

export const refreshServiceAccount = (serviceId: string) => {
  return getRequest(`/authentication/services/${serviceId}/token`);
};

export const postNewAdminUser = (endpointData: { username: string; password: string }) => {
  return postRequest(`/admins`, endpointData);
};

export const getAdmins = (params: Pagination) => {
  return getRequest(`/admins`, params);
};

export const deleteAdmin = (id: string) => {
  return deleteRequest(`/admins/${id}`);
};

export const changePassword = (oldPassword: string, newPassword: string) => {
  return putRequest(`/change-password`, {
    oldPassword: oldPassword,
    newPassword: newPassword,
  });
};

export const changeOtherAdminsPassword = (adminId: string, newPassword: string) =>
  putRequest(`/change-password/${adminId}`, {
    newPassword,
  });

export const enableTwoFA = () => putRequest('/enable-twofa', { method: 'qrcode' });

export const disableTwoFA = () => putRequest('/disable-twofa');
