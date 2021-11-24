import axios from 'axios';
import { Pagination, Search, Sort } from '../models/http/HttpModels';
import { CONDUIT_API } from './requestsConfig';

export const getCmsSchemasRequest = (params: Pagination & Search & Sort & { enabled?: boolean }) =>
  axios.get(`${CONDUIT_API}/admin/cms/schemas`, { params });

export const getCmsSchemaByIdRequest = (_id: string) =>
  axios.get(`${CONDUIT_API}/admin/cms/schemas${_id}`);

export const postCmsSchemaRequest = (data: any) =>
  axios.post(`${CONDUIT_API}/admin/cms/schemas`, { ...data });

export const putCmsSchemaRequest = (_id: string, data: any) =>
  axios.put(`${CONDUIT_API}/admin/cms/schemas/${_id}`, { ...data });

export const deleteCmsSchemasRequest = (params: { ids: string[]; deleteData: boolean }) => {
  return axios.delete(`${CONDUIT_API}/admin/cms/schemas`, { params });
};

export const toggleSchemaByIdRequest = (_id: string) =>
  axios.put(`${CONDUIT_API}/admin/cms/schemas/toggle/${_id}`);

export const getCmsDocumentsByNameRequest = (name: string, skip = 0, limit = 10) =>
  axios.get(`${CONDUIT_API}/admin/cms/content/${name}`, { params: { skip, limit } });

export const schemasFromOtherModules = () => {
  return axios.get(`${CONDUIT_API}/admin/cms/schemasFromOtherModules`);
};
