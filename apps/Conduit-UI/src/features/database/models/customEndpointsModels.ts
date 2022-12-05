import { EndpointInputs } from './CmsModels';

export interface Assignment {
  schemaField: string;
  action: number;
  assignmentField: {
    type: 'Input' | 'Custom' | 'Context' | '';
    value: string;
  };
}

export interface Input {
  location: number;
  name: string;
  type: string;
  optional?: boolean;
  array?: boolean;
}

export interface Endpoint {
  _id: string;
  name: string;
  operation: any;
  selectedSchema: string;
  authentication: boolean;
  paginated?: boolean;
  sorted?: boolean;
  inputs: EndpointInputs[];
  queries: [];
  assignments: Assignment[];
  enabled?: boolean;
  selectedSchemaName?: string;
  returns?: string;
  createdAt?: string;
  updatedAt?: string;
}
