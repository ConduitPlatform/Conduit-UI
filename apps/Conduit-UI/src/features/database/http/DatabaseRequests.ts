import { Pagination, Search, Sort } from '../../../models/http/HttpModels';
import { deleteRequest, getRequest, patchRequest, postRequest } from '../../../http/requestsConfig';

export const getSchemasRequest = (
  params: Pagination & Search & Sort & { enabled?: boolean } & { owner?: string[] }
) => getRequest(`/database/schemas`, params);

export const getSchemaByIdRequest = (_id: string | string[]) =>
  getRequest(`/database/schemas/${_id}`);

export const postSchemaRequest = (data: any) => postRequest(`/database/schemas`, { ...data });

export const patchSchemaRequest = (_id: string, data: any) =>
  patchRequest(`/database/schemas/${_id}`, { ...data });

export const postSchemaIndexRequest = (_id: string, indexes: any) =>
  postRequest(`/database/schemas/${_id}/indexes`, indexes);

export const getSchemaIndexesRequest = (_id: string) =>
  getRequest(`/database/schemas/${_id}/indexes`);

export const deleteSchemaIndexRequest = (_id: string, indexes: string[]) =>
  deleteRequest(`/database/schemas/${_id}/indexes`, { indexNames: indexes });

export const getDatabaseTypeRequest = () => getRequest(`/database/database-type`);

export const setSchemaExtension = (_id: string, data: any) =>
  postRequest(`/database/schemas/${_id}/extensions/`, { fields: data });

export const getSchemaOwners = () => getRequest(`/database/schemas/owners`);

export const deleteSchemasRequest = (params: { ids: string[]; deleteData: boolean }) => {
  return deleteRequest(`/database/schemas`, params);
};
export const toggleSchemaByIdRequest = (_id: string) =>
  postRequest(`/database/schemas/${_id}/toggle`);

export const toggleMultipleSchemasRequest = (params: { ids: string[]; enabled: boolean }) =>
  postRequest(`/database/schemas/toggle`, { ...params });

export const getSystemSchemasRequest = () => getRequest('/database/schemas/system');

export const getAccesssibleSchemaFields = (_id: string, operation: number) =>
  getRequest(`/database/schemas/${_id}/cms/operation/${operation}/details`);

export const getDocumentsByNameRequest = (params: {
  name: string;
  skip: number;
  limit: number;
  query?: string;
}) =>
  postRequest(`/database/schemas/${params.name}/query`, {
    ...params,
  });

export const getDocumentByIdRequest = (params: { schemaName: string; id: string }) =>
  getRequest(`/database/schemas/${params.schemaName}/docs/${params.id}`);
