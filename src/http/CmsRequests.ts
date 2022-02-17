import axios from 'axios';
import { Pagination, Search, Sort } from '../models/http/HttpModels';
import { CONDUIT_API } from './requestsConfig';

export const getCmsSchemasRequest = (
  params: Pagination & Search & Sort & { enabled?: boolean } & { owner?: string[] }
) => axios.get(`${CONDUIT_API}/admin/cms/schemas`, { params });

export const getCmsSchemaByIdRequest = (_id: string) =>
  axios.get(`${CONDUIT_API}/admin/cms/schemas${_id}`);

export const postCmsSchemaRequest = (data: any) =>
  axios.post(`${CONDUIT_API}/admin/cms/schemas`, { ...data });

export const patchCmsSchemaRequest = (_id: string, data: any) =>
  axios.patch(`${CONDUIT_API}/admin/cms/schemas/${_id}`, { ...data });

export const setSchemaExtension = (_id: string, data: any) =>
  axios.post(`${CONDUIT_API}/admin/cms/schemas/${_id}/extensions/`, { fields: data });

export const getSchemaOwners = () => axios.get(`${CONDUIT_API}/admin/cms/schemas/owners`);

export const deleteCmsSchemasRequest = (params: { ids: string[]; deleteData: boolean }) => {
  return axios.delete(`${CONDUIT_API}/admin/cms/schemas`, { params });
};
export const toggleSchemaByIdRequest = (_id: string) =>
  axios.post(`${CONDUIT_API}/admin/cms/schemas/${_id}/toggle`);

export const toggleMultipleSchemasRequest = (params: { ids: string[]; enabled: boolean }) =>
  axios.post(`${CONDUIT_API}/admin/cms/schemas/toggle`, { ...params });

export const getCmsDocumentsByNameRequest = (params: {
  name: string;
  skip: number;
  limit: number;
  query?: string;
}) =>
  axios.post(`${CONDUIT_API}/admin/cms/schemas/${params.name}/query`, {
    ...params,
  });

export const getCmsDocumentByIdRequest = (params: { schemaName: string; id: string }) =>
  axios.get(`${CONDUIT_API}/admin/cms/schemas/${params.schemaName}/docs/${params.id}`);
