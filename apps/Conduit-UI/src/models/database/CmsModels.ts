//TODO schemas, schemaDocuments, customEndpoints, config, schemaFields, queries
//We need further testing
import { Assignment } from '../customEndpoints/customEndpointsModels';
import { OperationsEnum } from '../OperationsEnum';

export interface Schema {
  _id: string;
  modelOptions: {
    conduit: {
      cms: {
        enabled: boolean;
        crudOperations: ICrudOperations;
      };
      permissions: Permissions;
    };
  };
  name: string;
  ownerModule: string;
  extensions: any[];
  fields: any;
  createdAt: string;
  updatedAt: string;
}

export interface ICrudOperations {
  create: { enabled: boolean; authenticated: boolean };
  read: { enabled: boolean; authenticated: boolean };
  update: { enabled: boolean; authenticated: boolean };
  delete: { enabled: boolean; authenticated: boolean };
}

export interface SchemaUI {
  createdAt: string;
  name: string;
  updatedAt: string;
  _id: string;
  modelOptions: {
    conduit: {
      cms: {
        authentication: boolean;
        crudOperations: boolean;
      };
    };
  };
}

export interface EditableSchemaFields {
  name: string;
  authentication: boolean;
  crudOperations: boolean;
  fields: SchemaFields[];
}

export interface Permissions {
  extendable: boolean;
  canCreate: boolean;
  canModify: ModifyOptions;
  canDelete: boolean;
}

export enum ModifyOptions {
  Everything = 'Everything',
  Nothing = 'Nothing',
  ExtensionOnly = 'ExtensionOnly',
}

export interface ToggleSchma {
  enabled: boolean;
  name: string;
}

export interface EndpointTypes {
  _id: string;
  enabled: boolean;
  name: string;
  operation: OperationsEnum;
  selectedSchema: string;
  selectedSchemaName: string;
  returns: 'string';
  authentication: boolean;
  paginated: boolean;
  sorted: boolean;
  inputs: EndpointInputs[];
  queries: [];
  assignments: [];
  createdAt: 'string';
  updatedAt: 'string';
}

export interface EndpointInputs {
  name: string;
  type: string;
  location: number;
  array?: boolean;
  optional?: boolean;
}

export interface CMSData {
  schemas: Schema[];
  documents: {
    documents: CMSDocuments[];
    documentsCount: number;
  };
  customEndpoints: EndpointTypes[];
  count: number;
  config: any;
  selectedSchema: any;
}

export interface SchemaFields {
  type: string;
  unique: boolean;
  select: boolean;
  required: boolean;
  default?: string;
}

export interface CMSDocuments {
  _id: string;
  name: string;
}

export interface IntrospectionStatus {
  foreignSchemas: string[];
  foreignSchemaCount: number;
  importedSchemas: string[];
  importedSchemaCount: number;
}
