import { deleteRequest, getRequest, postRequest, putRequest } from '../requestsConfig';
import ClientPlatformEnum, {
  ISecurityConfig,
  IUpdateClient,
} from '../../models/security/SecurityModels';
import { Sort } from '../../models/http/HttpModels';

export const getAvailableClientsRequest = (params: Sort) => {
  return getRequest(`/admin/security/client`, { params });
};

export const generateNewClientRequest = (
  platform: ClientPlatformEnum,
  domain?: string,
  notes?: string,
  alias?: string
) => {
  return postRequest(`/admin/security/client`, { platform, domain, notes, alias });
};

export const updateSecurityClient = (_id: string, data: IUpdateClient) => {
  return putRequest(`/admin/security/client/${_id}`, { ...data });
};

export const deleteClientRequest = (_id: string) => {
  return deleteRequest(`/admin/security/client/${_id}`);
};

export const getSecurityConfig = () => {
  return getRequest(`/admin/config/security`);
};

export const putSecurityConfig = (data: ISecurityConfig) =>
  putRequest(`/admin/config/security`, {
    config: { ...data },
  });
