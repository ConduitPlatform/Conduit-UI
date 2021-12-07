import axios from 'axios';
import { Pagination, Search } from '../models/http/HttpModels';
import { CONDUIT_API } from './requestsConfig';

export const getCustomEndpointsRequest = (params: Pagination & Search & { operation?: number }) => {
  return axios.get(`${CONDUIT_API}/admin/cms/customEndpoints`, { params });
};
export const editCustomEndpointsRequest = (_id: string, endpointData: any) => {
  return axios.put(`${CONDUIT_API}/admin/cms/customEndpoints/${_id}`, endpointData);
};
export const deleteCustomEndpointsRequest = (_id: string) => {
  return axios.delete(`${CONDUIT_API}/admin/cms/customEndpoints/${_id}`);
};
export const createCustomEndpointsRequest = (endpointData: any) => {
  return axios.post(`${CONDUIT_API}/admin/cms/customEndpoints`, endpointData);
};
