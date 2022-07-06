import { deleteRequest, getRequest, postRequest, putRequest } from '../requestsConfig';
import ClientPlatformEnum, {
  ISecurityConfig,
  IUpdateClient,
} from '../../models/security/SecurityModels';
import { Sort } from '../../models/http/HttpModels';

export const getAvailableClientsRequest = (params: Sort) => {
  return getRequest(`/admin/router/security/client`, { params });
};

export const generateNewClientRequest = (
  platform: ClientPlatformEnum,
  domain?: string,
  notes?: string,
  alias?: string
) => {
  return postRequest(`/admin/router/client`, { platform, domain, notes, alias });
};

export const updateSecurityClient = (_id: string, data: IUpdateClient) => {
  return putRequest(`/admin/router/client/${_id}`, { ...data });
};

export const deleteClientRequest = (_id: string) => {
  return deleteRequest(`/admin/router/client/${_id}`);
};

export const getSecurityConfig = () => {
  return getRequest(`/admin/config/router`);
};

export const putSecurityConfig = (data: ISecurityConfig) => {
  return putRequest(`/admin/config/router`, {
    config: { ...data },
  });
};
