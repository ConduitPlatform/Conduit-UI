import axios from 'axios';
import { Schema } from '../models/database/CmsModels';
import { Pagination, Search, Sort } from '../models/http/HttpModels';
import { CONDUIT_API } from './requestsConfig';

export const getIntrospectionSchemas = (params: Pagination & Search & Sort) => {
  return axios.get(`${CONDUIT_API}/admin/database/introspection/schemas`, { params });
};

export const finalizeIntrospectedSchemas = (schemas: Schema[]) => {
  return axios.post(`${CONDUIT_API}/admin/database/introspection/schemas/finalize`, {
    schemas: schemas,
  });
};

export const introspectionStatus = () => {
  return axios.get(`${CONDUIT_API}/admin/database/introspection`);
};

export const introspect = () => {
  return axios.post(`${CONDUIT_API}/admin/database/introspection`);
};
