'use server';
import { getApiClient } from '@/lib/api';
import { getModules } from '@/lib/api/modules';
import {
  CheckPermission,
  CheckPermissionResponse,
  CreateRelationDefinition,
  CreateResourceDefinition,
  Relation,
  ResourceDefinition,
} from '@/lib/models/authorization';
import { AuthorizationSettings } from '@/lib/models/authorization/settings';

type ConfigResponse = { config: AuthorizationSettings };

export const createResourceDefinition = async (
  definition: CreateResourceDefinition
) => {
  const res = await (
    await getApiClient()
  ).post<{ status: string; resourceDefinition: ResourceDefinition }>(
    `/authorization/resources`,
    {
      name: definition.name,
      relations: definition.relations,
      permissions: definition.permissions,
      version: definition.version,
    }
  );
  return res.data;
};

export const patchResourceDefinition = async (
  definition: ResourceDefinition
) => {
  const res = await (
    await getApiClient()
  ).patch<{ status: string; resourceDefinition: ResourceDefinition }>(
    `/authorization/resources/${definition._id}`,
    {
      relations: definition.relations,
      permissions: definition.permissions,
      version: definition.version,
    }
  );
  return res.data;
};

export const deleteResourceDefinition = async (resourceId: string) => {
  const res = await (
    await getApiClient()
  ).delete<void>(`/authorization/resources/${resourceId}`);
  return res.data;
};

export const getResourceDefinition = async (nameOrId: string) => {
  const res = await (await getApiClient())
    .get<ResourceDefinition | undefined>(`/authorization/resources/${nameOrId}`)
    .catch(() => {
      return { data: undefined };
    });
  return res.data;
};

export const getResourceDefinitions = async (params: {
  search?: string;
  skip?: number;
  limit?: number;
  sort?: string;
}) => {
  const res = await (
    await getApiClient()
  ).get<{ resources: ResourceDefinition[]; count: number }>(
    `/authorization/resources`,
    {
      params,
    }
  );
  return res.data;
};

export const getRelations = async (params?: {
  search?: string;
  subjectType?: string;
  resourceType?: string;
  skip?: number;
  limit?: number;
  sort?: string;
}) => {
  const res = await (
    await getApiClient()
  ).get<{ relations: Relation[]; count: number }>(`/authorization/relations`, {
    params,
  });
  return res.data;
};

export const getRelation = async (id: string) => {
  const res = await (await getApiClient())
    .get<Relation | undefined>(`/authorization/relations/${id}`)
    .catch(() => ({
      data: undefined,
    }));
  return res.data;
};
export const deleteRelation = async (id: string) => {
  const res = await (
    await getApiClient()
  ).delete(`/authorization/relations/${id}`);
  return res.data;
};

export const createRelation = async (relation: CreateRelationDefinition) => {
  const res = await (
    await getApiClient()
  ).post<Relation>(`/authorization/relations`, relation);
  return res.data;
};

export const checkPermission = async (permission: CheckPermission) => {
  const res = await (
    await getApiClient()
  ).get<CheckPermissionResponse>(`/authorization/permissions/evaluate`, {
    params: {
      ...permission,
    },
  });
  return res.data;
};

export const checkPermissionCan = async (permission: CheckPermission) => {
  const res = await (
    await getApiClient()
  ).get<CheckPermissionResponse>(`/authorization/permissions/can`, {
    params: {
      ...permission,
    },
  });
  return res.data;
};

export const reconstructRelationIndexes = async (soft?: boolean) => {
  const res = await (
    await getApiClient()
  ).post<string>(
    '/authorization/indexer/reconstruct',
    soft === undefined ? {} : { soft }
  );
  return res.data;
};

export const createManyRelations = async (data: {
  subject: string;
  relation: string;
  resources: string[];
}) => {
  const res = await (
    await getApiClient()
  ).post<unknown>('/authorization/relations/many', data);
  return res.data;
};

export const getAuthorizationSettings = async () => {
  const res = await (
    await getApiClient()
  ).get<ConfigResponse>(`/config/authorization`);
  return res.data;
};

export const patchAuthorizationSettings = async (
  authorizationData: Partial<AuthorizationSettings>
) => {
  await (
    await getApiClient()
  ).patch<ConfigResponse>(`/config/authorization`, {
    config: { ...authorizationData },
  });
  return new Promise<Awaited<ReturnType<typeof getModules>>>(
    async (resolve, reject) => {
      setTimeout(async () => {
        try {
          const modules = await getModules();
          resolve(modules);
        } catch (error) {
          reject(error);
        }
      }, 3000);
    }
  );
};
