import axios from 'axios';
import { Pagination, Search, Sort } from '../models/http/HttpModels';
import { CONDUIT_API } from './requestsConfig';

export const getSchemasRequest = (
  params: Pagination & Search & Sort & { enabled?: boolean } & { owner?: string[] }
) => axios.get(`${CONDUIT_API}/admin/database/schemas`, { params });

export const getSchemaByIdRequest = (_id: string | string[]) =>
  axios.get(`${CONDUIT_API}/admin/database/schemas/${_id}`);

export const postSchemaRequest = (data: any) =>
  axios.post(`${CONDUIT_API}/admin/database/schemas`, { ...data });

export const patchSchemaRequest = (_id: string, data: any) =>
  axios.patch(`${CONDUIT_API}/admin/database/schemas/${_id}`, { ...data });

export const setSchemaExtension = (_id: string, data: any) =>
  axios.post(`${CONDUIT_API}/admin/database/schemas/${_id}/extensions/`, { fields: data });

export const getSchemaOwners = () => axios.get(`${CONDUIT_API}/admin/database/schemas/owners`);

export const deleteSchemasRequest = (params: { ids: string[]; deleteData: boolean }) => {
  return axios.delete(`${CONDUIT_API}/admin/database/schemas`, { params });
};
export const toggleSchemaByIdRequest = (_id: string) =>
  axios.post(`${CONDUIT_API}/admin/database/schemas/${_id}/toggle`);

export const toggleMultipleSchemasRequest = (params: { ids: string[]; enabled: boolean }) =>
  axios.post(`${CONDUIT_API}/admin/database/schemas/toggle`, { ...params });

export const getDocumentsByNameRequest = (params: {
  name: string;
  skip: number;
  limit: number;
  query?: string;
}) =>
  axios.post(`${CONDUIT_API}/admin/database/schemas/${params.name}/query`, {
    ...params,
  });

export const getDocumentByIdRequest = (params: { schemaName: string; id: string }) =>
  axios.get(`${CONDUIT_API}/admin/database/schemas/${params.schemaName}/docs/${params.id}`);
