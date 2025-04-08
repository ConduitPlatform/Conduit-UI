export enum OperationsEnum {
  GET = 0,
  POST = 1,
  PUT = 2,
  DELETE = 3,
  PATCH = 4,
}

export enum LocationEnum {
  BODY = 0,
  QUERY = 1,
  URL = 2,
}

export enum ComparisonOperationEnum {
  EQUAL = 0,
  NOT_EQUAL = 1,
  GT = 2,
  GTE = 3,
  LT = 4,
  LTE = 5,
  IN = 6,
  NIN = 7,
}

export enum ValueSourceTypeEnum {
  INPUT = 'Input',
  CONTEXT = 'Context',
  CUSTOM = 'Custom',
}

export enum ValueTypeEnum {
  STRING = 'String',
  NUMBER = 'Number',
  BOOLEAN = 'Boolean',
  DATE = 'Date',
  OBJECT_ID = 'ObjectId',
  JSON = 'JSON',
}

export type Comparison = {
  schemaField: string;
  operation: ComparisonOperationEnum;
  comparisonField: {
    type: ValueSourceTypeEnum;
    value: string;
    like?: boolean;
    caseSensitiveLike?: boolean;
  };
};
export type Query =
  | { AND: Comparison[] | Query[] }
  | { OR: Comparison[] | Query[] };

export enum AssignmentActionEnum {
  ASSIGN = 0,
  INC = 1,
  DEC = 2,
  PUSH = 3,
  PULL = 4,
}

export type Assignment = {
  schemaField: string;
  action: AssignmentActionEnum;
  assignmentField: {
    type: ValueSourceTypeEnum;
    value: string;
  };
};
export type CustomEndpoint = {
  _id: string;
  name: string;
  operation: OperationsEnum;
  endpointDescription?: string;
  selectedSchema: string;
  selectedSchemaName: string;
  inputs: {
    name: string;
    type: ValueTypeEnum;
    optional: boolean;
    array: boolean;
    location: LocationEnum;
  }[];
  returns: string;
  enabled: boolean;
  authentication?: boolean;
  query: Query;
  assignments: Assignment[];
  createdAt: string;
  updatedAt: string;
};
