import { deleteRequest, getRequest, postRequest, putRequest } from '../requestsConfig';
import ClientPlatformEnum, { IUpdateClient } from '../../models/security/SecurityModels';
import { IRouterConfig } from '../../models/router/RouterModels';

import { Sort } from '../../models/http/HttpModels';

export const getAvailableClientsRequest = (params: Sort) => {
  return getRequest(`/router/security/client`, { params });
};

export const generateNewClientRequest = (
  platform: ClientPlatformEnum,
  domain?: string,
  notes?: string,
  alias?: string
) => {
  return postRequest(`/router/client`, { platform, domain, notes, alias });
};

export const updateSecurityClient = (_id: string, data: IUpdateClient) => {
  return putRequest(`/router/client/${_id}`, { ...data });
};

export const deleteClientRequest = (_id: string) => {
  return deleteRequest(`/router/client/${_id}`);
};

export const getRouterConfig = () => {
  return getRequest(`/config/router`);
};

export const putRouterConfig = (data: IRouterConfig) => {
  return putRequest(`/config/router`, {
    config: { ...data },
  });
};
