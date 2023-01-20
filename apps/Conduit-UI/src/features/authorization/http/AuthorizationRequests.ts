import { deleteRequest, getRequest, patchRequest, postRequest } from '../../../http/requestsConfig';
import {
  IAuthorizationConfig,
  AuthzRelationType,
  AuthzResourceType,
} from '../models/AuthorizationModels';
import { Pagination, Search, Sort } from '../../../models/http/HttpModels';

export const getResources = (params: Pagination & Search & Sort) =>
  getRequest(`/authorization/resources`, params);

export const getResourcesById = (id: string) => getRequest(`/authorization/resources/${id}`);

export const postResources = (data: AuthzResourceType) =>
  postRequest('/authorization/resources', { ...data });

export const patchResources = (id: string, data: AuthzResourceType) =>
  patchRequest(`/config/authorization/${id}`, { config: { ...data } });

export const deleteResources = (id: string) => deleteRequest(`/authorization/resources/${id}`);

export const getRelations = (params: Pagination & Search & Sort) =>
  getRequest(`/authorization/relations`, params);

export const getRelationsById = (id: string) => getRequest(`/authorization/relations/${id}`);

export const postRelations = (data: AuthzRelationType) =>
  postRequest('/authorization/relations', { ...data });

export const deleteRelation = (id: string) => deleteRequest(`/authorization/relations/${id}`);

export const getAuthzSettings = () => getRequest(`/config/authorization`);

export const patchAuthzSettings = (data: IAuthorizationConfig) =>
  patchRequest(`/config/authorization`, { config: { ...data } });
