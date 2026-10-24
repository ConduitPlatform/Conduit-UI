export type ResourceDefinition = {
  _id: string;
  name: string;
  relations?: {
    [key: string]: string[];
  };
  permissions?: {
    [key: string]: string[];
  };
  version: number;
};

export type CreateResourceDefinition = Omit<
  ResourceDefinition,
  '_id' | 'createdAt' | 'updatedAt'
> & {
  version?: number;
};

export type Relation = {
  _id: string;
  resource: string;
  resourceId: string;
  resourceType: string;
  subject: string;
  subjectId: string;
  subjectType: string;
  relation: string;
  computedTuple: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateRelationDefinition = Omit<
  Relation,
  | '_id'
  | 'createdAt'
  | 'updatedAt'
  | 'subjectId'
  | 'subjectType'
  | 'resourceType'
  | 'resourceId'
  | 'computedTuple'
>;
export type ObjectIndex = {
  _id: string;
  subject: string;
  subjectId: string;
  subjectType: string;
  subjectPermission: string;
  entity: string;
  entityId: string;
  entityType: string;
  entityPermission: string;
  relation: string;
  inheritanceTree: string[];
  createdAt: Date;
  updatedAt: Date;
};
export type CheckPermission = {
  subject: string;
  permission: string;
  resource: string;
  scope?: string;
};

export type CheckPermissionResponse = {
  allowed: boolean;
  assigned?: boolean;
  paths?: string[];
  subjectIndex?: ObjectIndex;
  objectIndex?: ObjectIndex;
};
