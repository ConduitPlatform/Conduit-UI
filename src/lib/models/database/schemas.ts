export type SchemaOptions = {
  _id?: boolean;
  timestamps?: boolean;
  conduit?: {
    imported?: boolean;
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
    /** MongoDB only: overrides module default read preference for this schema's reads */
    readPreference?: string;
  };
  indexes?: any[];
};

export type DeclaredSchema = {
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
  modelOptions: SchemaOptions;
  ownerModule: string;
  collectionName: string;
  createdAt: string;
  updatedAt: string;
};

/** PATCH /database/schemas/:id — matches Database admin route bodyParams */
export type PatchSchemaRequest = Partial<Pick<DeclaredSchema, 'fields'>> & {
  /** Nested shapes are permissive — callers build objects from forms */
  conduitOptions?: {
    cms?: Record<string, unknown>;
    authorization?: Record<string, unknown>;
    permissions?: Record<string, unknown>;
    /** MongoDB only; empty string clears schema-level override */
    readPreference?: string;
  };
};
export type CreateSchemaRequest = {
  name: string;
  fields: any;
  conduitOptions?: PatchSchemaRequest['conduitOptions'];
  timestamps?: boolean;
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
