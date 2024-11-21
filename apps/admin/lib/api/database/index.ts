'use server';

import { axiosInstance } from '@/lib/api';
import { DeclaredSchemas, PendingSchemas } from '@/lib/models/database';

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
  return await axiosInstance
    .get<Response>('/database/introspection/schemas', { params: args })
    .then(res => res.data);
};

export const getPendingSchema = async (id: string) => {
  return await axiosInstance
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
    schemas: DeclaredSchemas[];
    count: number;
  };
  return await axiosInstance
    .get<Response>('/database/schemas', { params: args })
    .then(res => res.data);
};

export const getSchemaOwnerModules = async (args: { sort?: string }) => {
  return await axiosInstance
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
  return await axiosInstance
    .get<Response>('/database/schemas/extensions', { params: args })
    .then(res => res.data);
};

export const getSchema = async (id: string) => {
  return await axiosInstance
    .get<DeclaredSchemas>(`/database/schemas/${id}`)
    .then(res => res.data);
};

// tODO
export const createSchema = async (schema: DeclaredSchemas) => {
  return await axiosInstance
    .post<DeclaredSchemas>('/database/schemas', schema)
    .then(res => res.data);
};

export const getDatabaseType = async () => {
  return await axiosInstance
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
  return await axiosInstance
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
