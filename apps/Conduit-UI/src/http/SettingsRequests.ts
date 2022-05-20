import axios from 'axios';
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

export const putCoreSettings = () => {
  return axios.put(`${CONDUIT_API}/admin/config/core`);
};

export const refreshServiceAccount = (serviceId: string) => {
  return axios.get(`${CONDUIT_API}/admin/authentication/services/${serviceId}/token`);
};

export const postNewAdminUser = (endpointData: { username: string; password: string }) => {
  return axios.post(`${CONDUIT_API}/admin/create`, endpointData);
};
