import { Pagination, Search, Sort } from '../../models/http/HttpModels';
import { getRequest, postRequest } from '../requestsConfig';

export const getIntrospectionSchemas = (params: Pagination & Search & Sort) => {
  return getRequest(`/database/introspection/schemas`, { params });
};

export const getIntrospectionSchemaById = (id: string | string[]) => {
  return getRequest(`/database/introspection/schemas/${id}`);
};

export const finalizeIntrospectedSchemas = (schemas: any[]) => {
  return postRequest(`/database/introspection/schemas/finalize`, {
    schemas: schemas,
  });
};

export const introspectionStatus = () => {
  return getRequest(`/database/introspection`);
};

export const introspect = () => {
  return postRequest(`/database/introspection`);
};
