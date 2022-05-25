import axios from 'axios';
import { Pagination, Search, Sort } from '../models/http/HttpModels';
import { CONDUIT_API } from './requestsConfig';

export const getIntrospectionSchemas = (params: Pagination & Search & Sort) => {
  return axios.get(`${CONDUIT_API}/admin/database/introspection/schemas`, { params });
};

export const createCustomEndpointsRequest = () => {
  return axios.post(`${CONDUIT_API}/admin/database/customEndpoints`);
};

export const finalizeIntrospectedSchemas = (endpointData: any) => {
  return axios.post(`${CONDUIT_API}/admin/database/introspection/schemas/finalize`, endpointData);
};
