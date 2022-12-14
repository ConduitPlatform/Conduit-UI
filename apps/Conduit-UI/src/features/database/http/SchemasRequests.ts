import { deleteRequest, postRequest, putRequest } from '../../../http/requestsConfig';

export const createSchemaDocumentRequest = (schemaName: string, documentData: any) =>
  postRequest(`/database/schemas/${schemaName}/docs`, { ...documentData });

export const deleteSchemaDocumentRequest = (schemaName: string, documentId: string) =>
  deleteRequest(`/database/schemas/${schemaName}/docs/${documentId}`);

export const editSchemaDocumentRequest = (
  schemaName: string,
  documentId: string,
  documentData: any
) =>
  putRequest(`/database/schemas/${schemaName}/docs/${documentId}`, {
    changedDocument: { ...documentData },
  });
