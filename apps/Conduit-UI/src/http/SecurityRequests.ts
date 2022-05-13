import axios from 'axios';
import { CONDUIT_API } from './requestsConfig';
import { ISecurityConfig, IPlatformTypes } from '../models/security/SecurityModels';

export const getAvailableClientsRequest = () => {
  return axios.get(`${CONDUIT_API}/admin/security/client`);
};

export const generateNewClientRequest = (platform: IPlatformTypes, domain?: string) => {
  return axios.post(`${CONDUIT_API}/admin/security/client`, { platform, domain });
};

export const deleteClientRequest = (_id: string) => {
  return axios.delete(`${CONDUIT_API}/admin/security/client/${_id}`);
};

export const getSecurityConfig = () => {
  return axios.get(`${CONDUIT_API}/admin/config/security`);
};

export const putSecurityConfig = (data: ISecurityConfig) =>
  axios.put(`${CONDUIT_API}/admin/config/security`, {
    config: { ...data },
  });
