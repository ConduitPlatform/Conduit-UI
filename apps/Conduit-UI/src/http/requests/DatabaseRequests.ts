import { Pagination, Search, Sort } from '../../models/http/HttpModels';
import { deleteRequest, getRequest, patchRequest, postRequest } from '../requestsConfig';

export const getSchemasRequest = (
  params: Pagination & Search & Sort & { enabled?: boolean } & { owner?: string[] }
) => getRequest(`/admin/database/schemas`, { params });

export const getSchemaByIdRequest = (_id: string | string[]) =>
  getRequest(`/admin/database/schemas/${_id}`);

export const postSchemaRequest = (data: any) => postRequest(`/admin/database/schemas`, { ...data });

export const patchSchemaRequest = (_id: string, data: any) =>
  patchRequest(`/admin/database/schemas/${_id}`, { ...data });

export const setSchemaExtension = (_id: string, data: any) =>
  postRequest(`/admin/database/schemas/${_id}/extensions/`, { fields: data });

export const getSchemaOwners = () => getRequest(`/admin/database/schemas/owners`);

export const deleteSchemasRequest = (params: { ids: string[]; deleteData: boolean }) => {
  return deleteRequest(`/admin/database/schemas`, { params });
};
export const toggleSchemaByIdRequest = (_id: string) =>
  postRequest(`/admin/database/schemas/${_id}/toggle`);

export const toggleMultipleSchemasRequest = (params: { ids: string[]; enabled: boolean }) =>
  postRequest(`/admin/database/schemas/toggle`, { ...params });

export const getDocumentsByNameRequest = (params: {
  name: string;
  skip: number;
  limit: number;
  query?: string;
}) =>
  postRequest(`/admin/database/schemas/${params.name}/query`, {
    ...params,
  });

export const getDocumentByIdRequest = (params: { schemaName: string; id: string }) =>
  getRequest(`/admin/database/schemas/${params.schemaName}/docs/${params.id}`);
