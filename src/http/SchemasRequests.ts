import axios from 'axios';
import { CONDUIT_API } from './requestsConfig';

export const createSchemaDocumentRequest = (schemaName: string, documentData: any) =>
  axios.post(`${CONDUIT_API}/admin/cms/schemas/${schemaName}/docs`, { ...documentData });

export const deleteSchemaDocumentRequest = (schemaName: string, documentId: string) =>
  axios.delete(`${CONDUIT_API}/admin/cms/schemas/${schemaName}/docs/${documentId}`);

export const editSchemaDocumentRequest = (
  schemaName: string,
  documentId: string,
  documentData: any
) =>
  axios.put(`${CONDUIT_API}/admin/cms/schemas/${schemaName}/docs/${documentId}`, {
    changedDocument: { ...documentData },
  });
