import { Pagination, Search } from '../../models/http/HttpModels';
import { deleteRequest, getRequest, patchRequest, postRequest } from '../requestsConfig';

export const getCustomEndpointsRequest = (
  params: Pagination & Search & { schemaName?: string[] } & { operation?: number }
) => {
  return getRequest(`/admin/database/customEndpoints`, { params });
};
export const editCustomEndpointsRequest = (_id: string, endpointData: any) => {
  return patchRequest(`/admin/database/customEndpoints/${_id}`, endpointData);
};
export const deleteCustomEndpointsRequest = (_id: string) => {
  return deleteRequest(`/admin/database/customEndpoints/${_id}`);
};
export const createCustomEndpointsRequest = (endpointData: any) => {
  return postRequest(`/admin/database/customEndpoints`, endpointData);
};

export const getSchemasWithEndpoints = () => {
  return getRequest(`/admin/database/customEndpoints/schemas`);
};
