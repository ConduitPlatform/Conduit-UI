export type SchemaOptions = {
  _id?: boolean;
  timestamps?: boolean;
  conduit?: {
    cms?: {
      enabled: boolean;
      crudOperations: {
        create?: {
          enabled: boolean;
          authenticated: boolean;
        };
        read?: {
          enabled: boolean;
          authenticated: boolean;
        };
        update?: {
          enabled: boolean;
          authenticated: boolean;
        };
        delete?: {
          enabled: boolean;
          authenticated: boolean;
        };
      };
    };
    permissions?: {
      extendable: boolean;
      canCreate: boolean;
      canModify: 'Everything' | 'Nothing' | 'ExtensionOnly';
      canDelete: boolean;
    };
    authorization?: {
      enabled: boolean;
    };
  };
  indexes?: any[];
};

export type DeclaredSchemas = {
  _id: string;
  name: string;
  parentSchema: string | null;
  fields: any;
  extensions: {
    fields: any;
    ownerModule: string;
    createdAt: string;
    updatedAt: string;
  }[];
  compiledFields: any;
  modelOptions: any;
  ownerModule: string;
  collectionName: string;
  createdAt: string;
  updatedAt: string;
};

export type Views = {
  _id: string;
  name: string;
  originalSchema: string;
  joinedSchemas: string[];
  query: any;
};

export type MigratedSchemas = {
  _id: string;
  name: string;
  ownerModule: string;
  version: number;
  schema: any;
};

export type PendingSchemas = {
  _id: string;
  name: string;
  fields: any;
  modelOptions: any;
  createdAt: string;
  updatedAt: string;
};
