import { deleteRequest, postRequest, putRequest } from '../requestsConfig';

export const createSchemaDocumentRequest = (schemaName: string, documentData: any) =>
  postRequest(`/admin/database/schemas/${schemaName}/docs`, { ...documentData });

export const deleteSchemaDocumentRequest = (schemaName: string, documentId: string) =>
  deleteRequest(`/admin/database/schemas/${schemaName}/docs/${documentId}`);

export const editSchemaDocumentRequest = (
  schemaName: string,
  documentId: string,
  documentData: any
) =>
  putRequest(`/admin/database/schemas/${schemaName}/docs/${documentId}`, {
    changedDocument: { ...documentData },
  });
