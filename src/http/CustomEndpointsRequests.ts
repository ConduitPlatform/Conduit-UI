import axios from 'axios';
import { CONDUIT_API } from './requestsConfig';

export const getCustomEndpointsRequest = () => {
  return axios.get(`${CONDUIT_API}/admin/cms/customEndpoints`);
};
export const editCustomEndpointsRequest = (_id: string, endpointData: any) => {
  return axios.patch(`${CONDUIT_API}/admin/cms/customEndpoints/${_id}`, endpointData);
};
export const deleteCustomEndpointsRequest = (_id: string) => {
  return axios.delete(`${CONDUIT_API}/admin/cms/customEndpoints/${_id}`);
};
export const createCustomEndpointsRequest = (endpointData: any) => {
  return axios.post(`${CONDUIT_API}/admin/cms/customEndpoints`, endpointData);
};
