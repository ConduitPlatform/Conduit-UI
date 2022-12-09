import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
  putRequest,
} from '../../http/requestsConfig';
import ClientPlatformEnum, { IUpdateClient } from './SecurityModels';
import { IRouterConfig } from '../router/RouterModels';

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
  return postRequest(`/router/security/client`, { platform, domain, notes, alias });
};

export const updateSecurityClient = (_id: string, data: IUpdateClient) => {
  return putRequest(`/router/security/client/${_id}`, { ...data });
};

export const deleteClientRequest = (_id: string) => {
  return deleteRequest(`/router/security/client/${_id}`);
};

export const getRouterConfig = () => {
  return getRequest(`/config/router`);
};

export const patchRouterConfig = (data: IRouterConfig) => {
  return patchRequest(`/config/router`, {
    config: { ...data },
  });
};
