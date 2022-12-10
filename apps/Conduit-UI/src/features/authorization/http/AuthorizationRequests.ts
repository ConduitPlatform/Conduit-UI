import { getRequest, patchRequest } from '../../../http/requestsConfig';
import { IAuthorizationConfig } from '../models/AuthorizationModels';
import { Pagination, Search, Sort } from '../../../models/http/HttpModels';

export const getRelations = (params: Pagination & Search & Sort) =>
  getRequest(`/authorization/relations`, params);

export const getResources = (params: Pagination & Search & Sort) =>
  getRequest(`/authorization/resources`, params);
export const getAuthzSettings = () => getRequest(`/config/authorization`);

export const patchAuthzSettings = (data: IAuthorizationConfig) =>
  patchRequest(`/config/authorization`, { config: { ...data } });
