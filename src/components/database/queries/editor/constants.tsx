import {
  AssignmentActionEnum,
  ComparisonOperationEnum,
  LocationEnum,
  OperationsEnum,
  ValueSourceTypeEnum,
  ValueTypeEnum,
} from '@/lib/models/database/custom-endpoints';

export const operationTypes = [
  {
    value: OperationsEnum.GET,
    label: 'Find',
    description: 'Retrieve data from the database',
  },
  {
    value: OperationsEnum.POST,
    label: 'Create',
    description: 'Insert new data into the database',
  },
  {
    value: OperationsEnum.PUT,
    label: 'Update',
    description: 'Replace existing data in the database',
  },
  {
    value: OperationsEnum.PATCH,
    label: 'Patch',
    description: 'Partially update existing data',
  },
  {
    value: OperationsEnum.DELETE,
    label: 'Delete',
    description: 'Remove data from the database',
  },
] as const;

// Update the inputTypes array to remove "array" as a type
export const inputTypes = [
  { value: ValueTypeEnum.STRING, label: 'String' },
  { value: ValueTypeEnum.NUMBER, label: 'Number' },
  { value: ValueTypeEnum.BOOLEAN, label: 'Boolean' },
  { value: ValueTypeEnum.DATE, label: 'Date' },
  { value: ValueTypeEnum.OBJECT_ID, label: 'PrimaryId' },
  { value: ValueTypeEnum.JSON, label: 'Object' },
] as const;

// Update the placementTypes array
export const placementTypes = [
  {
    value: LocationEnum.URL,
    label: 'Path',
    description: 'URL path parameter (/:id)',
  },
  {
    value: LocationEnum.QUERY,
    label: 'Search',
    description: 'URL query parameter (?key=value)',
  },
  {
    value: LocationEnum.BODY,
    label: 'Body',
    description: 'Request body (JSON)',
  },
] as const;

// Comparison operations for the find part
export const comparisonOperations = [
  { value: ComparisonOperationEnum.EQUAL, label: 'Equal' },
  { value: ComparisonOperationEnum.NOT_EQUAL, label: 'Not Equal' },
  { value: ComparisonOperationEnum.GT, label: 'Greater Than' },
  { value: ComparisonOperationEnum.GTE, label: 'Greater Than or Equal' },
  { value: ComparisonOperationEnum.LT, label: 'Less Than' },
  { value: ComparisonOperationEnum.LTE, label: 'Less Than or Equal' },
  { value: ComparisonOperationEnum.IN, label: 'In' },
  { value: ComparisonOperationEnum.NIN, label: 'Not In' },

  // { value: 'search', label: 'Search' },
] as const;
// Comparison operations for the find part
export const assignmentOperations = [
  { value: AssignmentActionEnum.ASSIGN, label: 'Assign' },
  { value: AssignmentActionEnum.INC, label: 'Increment' },
  { value: AssignmentActionEnum.DEC, label: 'Decrement' },
  { value: AssignmentActionEnum.PUSH, label: 'Add to array' },
  { value: AssignmentActionEnum.PULL, label: 'Remove from array' },

  // { value: 'search', label: 'Search' },
] as const;

// Value source types
export const valueSourceTypes = [
  {
    value: ValueSourceTypeEnum.INPUT,
    label: 'Input',
    description: 'Use a request input defined above.',
  },
  {
    value: ValueSourceTypeEnum.CUSTOM,
    label: 'Custom',
    description: 'Use a literal value baked into this endpoint.',
  },
  {
    value: ValueSourceTypeEnum.CONTEXT,
    label: 'Context',
    description:
      'Use a runtime value such as user._id from the request context.',
  },
] as const;
