import axios from 'axios';
import { Pagination } from '../models/http/HttpModels';
import { IAdminSettings, ICoreSettings } from '../models/settings/SettingsModels';
import { CONDUIT_API } from './requestsConfig';

export const getAdminModulesRequest = () => {
  return axios.get(`${CONDUIT_API}/admin/config/modules`);
};

export const getServiceAccounts = () => {
  return axios.get(`${CONDUIT_API}/admin/authentication/services`);
};

export const deleteServiceAccounts = (_id: string) => {
  return axios.delete(`${CONDUIT_API}/admin/authentication/services/${_id}`);
};

export const createServiceAccount = (name: string) => {
  return axios.post(`${CONDUIT_API}/admin/authentication/services`, { name });
};

export const getCoreSettings = () => {
  return axios.get(`${CONDUIT_API}/admin/config/core`);
};

export const getAdminSettings = () => {
  return axios.get(`${CONDUIT_API}/admin/config/admin`);
};

export const putAdminSettings = (data: IAdminSettings) => {
  return axios.put(`${CONDUIT_API}/admin/config/admin`, { config: { ...data } });
};

export const putCoreSettings = (data: ICoreSettings) => {
  return axios.put(`${CONDUIT_API}/admin/config/core`, { config: { ...data } });
};

export const refreshServiceAccount = (serviceId: string) => {
  return axios.get(`${CONDUIT_API}/admin/authentication/services/${serviceId}/token`);
};

export const postNewAdminUser = (endpointData: { username: string; password: string }) => {
  return axios.post(`${CONDUIT_API}/admin/admins`, endpointData);
};

export const getAdmins = (params: Pagination) => {
  return axios.get(`${CONDUIT_API}/admin/admins`, { params });
};

export const deleteAdmin = (id: string) => {
  return axios.delete(`${CONDUIT_API}/admin/admins/${id}`);
};

export const changePassword = (oldPassword: string, newPassword: string) => {
  return axios.put(`${CONDUIT_API}/admin/admin/change-password`, {
    data: { oldPassword: oldPassword, newPassword: newPassword },
  });
};
