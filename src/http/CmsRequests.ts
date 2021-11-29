import axios from 'axios';
import { CONDUIT_API } from './requestsConfig';

export const getCmsSchemasRequest = (skip: number, limit: number) =>
  axios.get(`${CONDUIT_API}/admin/cms/schemas`, { params: { skip, limit } });

export const getCmsSchemaByIdRequest = (_id: string) =>
  axios.get(`${CONDUIT_API}/admin/cms/schemas${_id}`);

export const postCmsSchemaRequest = (data: any) =>
  axios.post(`${CONDUIT_API}/admin/cms/schemas`, { ...data });

export const putCmsSchemaRequest = (_id: string, data: any) =>
  axios.put(`${CONDUIT_API}/admin/cms/schemas/${_id}`, { ...data });

export const deleteCmsSchemaRequest = (_id: string) =>
  axios.delete(`${CONDUIT_API}/admin/cms/schemas/${_id}`);

export const toggleSchemaByIdRequest = (_id: string) =>
  axios.put(`${CONDUIT_API}/admin/cms/schemas/toggle/${_id}`);

export const getCmsDocumentsByNameRequest = (params: {
  name: string;
  skip: number;
  limit: number;
  search?: string;
}) => axios.get(`${CONDUIT_API}/admin/cms/content/${params.name}`, { params: params });

export const getCmsDocumentByIdRequest = (params: { schemaName: string; id: string }) =>
  axios.get(`${CONDUIT_API}/admin/cms/content/${params.schemaName}/${params.id}`);

export const schemasFromOtherModules = () => {
  return axios.get(`${CONDUIT_API}/admin/cms/schemasFromOtherModules`);
};
