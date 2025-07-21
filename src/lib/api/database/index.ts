'use server';

import { getApiClient } from '@/lib/api';
import {
  DeclaredSchema,
  PendingSchemas,
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

export const createSchema = async (schema: Partial<DeclaredSchema>) => {
  return await (await getApiClient())
    .post<DeclaredSchema>('/database/schemas', schema)
    .then(res => res.data);
};
export const patchSchema = async (
  id: string,
  schema: Partial<DeclaredSchema>
) => {
  return await (await getApiClient())
    .patch<DeclaredSchema>(`/database/schemas/${id}`, schema)
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

export const updateSchemaDocument = async (
  schemaName: string,
  id: string,
  data: any
) => {
  return await (await getApiClient())
    .put(`database/schemas/${schemaName}/docs/${id}`, { changedDocument: data })
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
    .patch(`database/schemas/${id}`, data)
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
