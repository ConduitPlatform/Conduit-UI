import { Pagination, Search, Sort } from '../../models/http/HttpModels';
import { getRequest, postRequest } from '../requestsConfig';

export const getIntrospectionSchemas = (params: Pagination & Search & Sort) => {
  return getRequest(`/admin/database/introspection/schemas`, { params });
};

export const getIntrospectionSchemaById = (id: string | string[]) => {
  return getRequest(`/admin/database/introspection/schemas/${id}`);
};

export const finalizeIntrospectedSchemas = (schemas: any[]) => {
  return postRequest(`/admin/database/introspection/schemas/finalize`, {
    schemas: schemas,
  });
};

export const introspectionStatus = () => {
  return getRequest(`/admin/database/introspection`);
};

export const introspect = () => {
  return postRequest(`/admin/database/introspection`);
};
