import axios from 'axios';
import { CONDUIT_API } from './requestsConfig';
import ClientPlatformEnum, {
  ISecurityConfig,
  IUpdateClient,
} from '../models/security/SecurityModels';
import { Sort } from '../models/http/HttpModels';

export const getAvailableClientsRequest = (params: Sort) => {
  return axios.get(`${CONDUIT_API}/admin/security/client`, { params });
};

export const generateNewClientRequest = (
  platform: ClientPlatformEnum,
  domain?: string,
  notes?: string,
  alias?: string
) => {
  return axios.post(`${CONDUIT_API}/admin/security/client`, { platform, domain, notes, alias });
};

export const updateSecurityClient = (_id: string, data: IUpdateClient) => {
  return axios.put(`${CONDUIT_API}/admin/security/client/${_id}`, { ...data });
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
