import { Pagination, Search } from '../../models/http/HttpModels';
import { deleteRequest, getRequest, patchRequest, postRequest } from '../requestsConfig';

export const getCustomEndpointsRequest = (
  params: Pagination & Search & { schemaName?: string[] } & { operation?: number }
) => {
  return getRequest(`/database/customEndpoints`, params);
};
export const editCustomEndpointsRequest = (_id: string, endpointData: any) => {
  return patchRequest(`/database/customEndpoints/${_id}`, endpointData);
};
export const deleteCustomEndpointsRequest = (_id: string) => {
  return deleteRequest(`/database/customEndpoints/${_id}`);
};
export const createCustomEndpointsRequest = (endpointData: any) => {
  return postRequest(`/database/customEndpoints`, endpointData);
};

export const getSchemasWithEndpoints = () => {
  return getRequest(`/database/customEndpoints/schemas`);
};
