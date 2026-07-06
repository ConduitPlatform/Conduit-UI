'use server';

import { getApiClient } from '@/lib/api';
import {
  CreateSchemaRequest,
  DatabaseConfig,
  DeclaredSchema,
  PatchSchemaRequest,
  PendingSchemas,
  PutSchemaRequest,
  SchemaOptions,
} from '@/lib/models/database';
import { CustomEndpoint } from '@/lib/models/database/custom-endpoints';

export const getPendingSchemas = async (args: {
  skip?: number;
  limit?: number;
  sort?: string;
  search?: string[];
}) => {
  type Response = {
    schemas: PendingSchemas[];
    count: number;
  };
  return await (await getApiClient())
    .get<Response>('/database/introspection/schemas', { params: args })
    .then(res => res.data);
};

export const getPendingSchema = async (id: string) => {
  return await (await getApiClient())
    .get<PendingSchemas>(`/database/introspection/schemas/${id}`)
    .then(res => res.data);
};

export const getSchemas = async (args: {
  skip?: number;
  limit?: number;
  sort?: string;
  search?: string;
  enabled?: boolean;
  owner?: string[];
}) => {
  type Response = {
    schemas: DeclaredSchema[];
    count: number;
  };
  return await (await getApiClient())
    .get<Response>('/database/schemas', { params: args })
    .then(res => res.data);
};

export const getSchemaOwnerModules = async (args: { sort?: string }) => {
  return await (await getApiClient())
    .get<{ modules: string[] }>('/database/schemas/owners', { params: args })
    .then(res => res.data);
};

export const getSchemaExtensions = async (args: {
  skip?: number;
  limit?: number;
  sort?: string;
}) => {
  type Response = {
    schemasExtensions: any[];
    count: number;
  };
  return await (await getApiClient())
    .get<Response>('/database/schemas/extensions', { params: args })
    .then(res => res.data);
};

export const getSchema = async (id: string) => {
  return await (await getApiClient())
    .get<DeclaredSchema>(`/database/schemas/${id}`)
    .then(res => res.data);
};

export const createSchema = async (schema: CreateSchemaRequest) => {
  return await (await getApiClient())
    .post<DeclaredSchema>('/database/schemas', schema)
    .then(res => res.data);
};
export const patchSchema = async (id: string, schema: PatchSchemaRequest) => {
  return await (await getApiClient())
    .patch<DeclaredSchema>(`/database/schemas/${id}`, schema)
    .then(res => res.data);
};

export const putSchema = async (id: string, schema: PutSchemaRequest) => {
  return await (await getApiClient())
    .put<DeclaredSchema>(`/database/schemas/${id}`, schema)
    .then(res => res.data);
};

export const updateExtensions = async (
  id: string,
  fields: DeclaredSchema['fields']
) => {
  return await (await getApiClient())
    .post<DeclaredSchema>(`/database/schemas/${id}/extensions`, { fields })
    .then(res => res.data);
};

export const getDatabaseType = async () => {
  return await (await getApiClient())
    .get<{ result: string }>('/database/database-type')
    .then(res => res.data);
};

export const getSchemaDocs = async (
  schemaName?: string,
  data?: {
    query: any;
  },
  args?: {
    skip?: number;
    limit?: number;
    sort?: string;
  }
) => {
  if (!schemaName) return { documents: [], count: 0 };
  return await (
    await getApiClient()
  )
    .post<{
      documents: any[];
      count: number;
    }>(
      `/database/schemas/${schemaName}/query`,
      { query: data?.query ?? {} },
      {
        params: args,
      }
    )
    .then(res => res.data);
};
export const getCustomEndpoints = async (args?: {
  skip?: number;
  limit?: number;
  sort?: string;
  search?: string;
  operation?: number;
  schemaName?: string[];
}) => {
  return await (
    await getApiClient()
  )
    .get<{
      customEndpoints: CustomEndpoint[];
      count: number;
    }>(`/database/customEndpoints`, {
      params: args,
    })
    .then(res => res.data);
};

export const getCustomEndpoint = async (id: string) => {
  return await (await getApiClient())
    .get<CustomEndpoint>(`/database/customEndpoints/${id}`)
    .then(res => res.data);
};

export const createCustomEndpoint = async (
  endpoint: Partial<CustomEndpoint>
) => {
  return await (
    await getApiClient()
  )
    .post(`/database/customEndpoints`, {
      ...endpoint,
    })
    .then(res => res.data);
};

export const getSchemaDocument = async (schemaName: string, id: string) => {
  return await (
    await getApiClient()
  )
    .get(`/database/schemas/${schemaName}/docs/${id}`)
    .then(res => res.data)
    .catch(err => {
      if (err.response.status === 404) throw new Error('not_found');
    });
};

export const createSchemaDocument = async (schemaName: string, data: any) => {
  return await (
    await getApiClient()
  )
    .post(`/database/schemas/${schemaName}/docs`, {
      inputDocument: data,
    })
    .then(res => res.data);
};

export const updateSchemaDocument = async (
  schemaName: string,
  id: string,
  data: any
) => {
  return await (
    await getApiClient()
  )
    .put(`/database/schemas/${schemaName}/docs/${id}`, {
      changedDocument: data,
    })
    .then(res => res.data);
};

export const updateSchema = async (
  id: string,
  data: {
    fields?: { [key: string]: any };
    conduitOptions?: SchemaOptions['conduit'];
  }
) => {
  return await (await getApiClient())
    .patch(`/database/schemas/${id}`, data)
    .then(res => res.data);
};

export const exportSchemas = async () => {
  return await (await getApiClient())
    .get('/database/schemas/export')
    .then(res => res.data);
};

export const importSchemas = async (data: any) => {
  return await (await getApiClient())
    .post('/database/schemas/import', data)
    .then(res => res.data);
};

export const exportCustomEndpoints = async () => {
  return await (await getApiClient())
    .get('/database/customEndpoints/export')
    .then(res => res.data);
};

export const importCustomEndpoints = async (data: any) => {
  return await (await getApiClient())
    .post('/database/customEndpoints/import', data)
    .then(res => res.data);
};

export const deleteSchema = async (id: string, deleteData: boolean) => {
  return await (
    await getApiClient()
  )
    .delete<string>(`/database/schemas/${id}`, {
      params: { deleteData },
    })
    .then(res => res.data);
};

export const deleteSchemas = async (ids: string[], deleteData: boolean) => {
  return await (
    await getApiClient()
  )
    .delete<string>('/database/schemas', {
      params: { ids, deleteData },
    })
    .then(res => res.data);
};

export const toggleSchema = async (id: string) => {
  return await (
    await getApiClient()
  )
    .post<{
      name: string;
      enabled: boolean;
    }>(`/database/schemas/${id}/toggle`)
    .then(res => res.data);
};

export const toggleSchemas = async (ids: string[], enabled: boolean) => {
  return await (
    await getApiClient()
  )
    .post<{
      updatedSchemas: DeclaredSchema[];
      enabled: boolean;
    }>('/database/schemas/toggle', { ids, enabled })
    .then(res => res.data);
};

export const deleteSchemaDocument = async (
  schemaName: string,
  documentId: string
) => {
  return await (await getApiClient())
    .delete(`/database/schemas/${schemaName}/docs/${documentId}`)
    .then(res => res.data);
};

export const getIntrospectionStatus = async () => {
  return await (
    await getApiClient()
  )
    .get<{
      foreignSchemas: string[];
      foreignSchemaCount: number;
      pendingSchemas: string[];
      pendingSchemasCount: number;
      importedSchemas: string[];
      importedSchemaCount: number;
    }>('/database/introspection')
    .then(res => res.data);
};

export const runIntrospection = async () => {
  return await (await getApiClient())
    .post<string>('/database/introspection')
    .then(res => res.data);
};

export const finalizePendingSchemas = async (schemas: PendingSchemas[]) => {
  return await (await getApiClient())
    .post<string>('/database/introspection/schemas/finalize', { schemas })
    .then(res => res.data);
};

export const patchCustomEndpoint = async (
  id: string,
  data: Partial<CustomEndpoint>
) => {
  return await (await getApiClient())
    .patch(`/database/customEndpoints/${id}`, data)
    .then(res => res.data);
};

export const deleteCustomEndpoint = async (id: string) => {
  return await (await getApiClient())
    .delete(`/database/customEndpoints/${id}`)
    .then(res => res.data);
};

export const createSchemaIndexes = async (
  schemaId: string,
  indexes: unknown[]
) => {
  return await (await getApiClient())
    .post(`/database/schemas/${schemaId}/indexes`, { indexes })
    .then(res => res.data);
};

export const getSchemaIndexes = async (schemaId: string) => {
  return await (await getApiClient())
    .get<{ indexes: unknown[] }>(`/database/schemas/${schemaId}/indexes`)
    .then(res => res.data);
};

export const deleteSchemaIndexes = async (
  schemaId: string,
  indexNames: string[]
) => {
  return await (
    await getApiClient()
  )
    .delete(`/database/schemas/${schemaId}/indexes`, {
      params: { indexNames },
    })
    .then(res => res.data);
};

export const getDatabaseSettings = async () => {
  const res = await (
    await getApiClient()
  ).get<{ config: DatabaseConfig }>('/config/database');
  return res.data;
};

export const patchDatabaseSettings = async (data: Partial<DatabaseConfig>) => {
  await (
    await getApiClient()
  ).patch('/config/database', {
    config: { ...data },
  });
};
