import {
  AssignmentActionEnum,
  ComparisonOperationEnum,
  LocationEnum,
  ValueSourceTypeEnum,
  ValueTypeEnum,
} from '@/lib/models/database/custom-endpoints';
import {
  Braces,
  Calendar,
  FileJson,
  FormInput,
  Hash,
  Key,
  Route,
  Search,
  ToggleLeft,
} from 'lucide-react';

export const getPlacementIcon = (
  location: LocationEnum,
  className = 'size-4'
) => {
  switch (location) {
    case LocationEnum.URL:
      return <Route className={className} />;
    case LocationEnum.QUERY:
      return <Search className={className} />;
    case LocationEnum.BODY:
      return <FileJson className={className} />;
    default: {
      const _exhaustive: never = location;
      return _exhaustive;
    }
  }
};

export const getPlacementName = (location: LocationEnum) => {
  switch (location) {
    case LocationEnum.URL:
      return 'Path';
    case LocationEnum.QUERY:
      return 'Search';
    case LocationEnum.BODY:
      return 'Body';
    default: {
      const _exhaustive: never = location;
      return _exhaustive;
    }
  }
};

export const getPlacementExample = (location: LocationEnum, name: string) => {
  const key = name.trim() || 'key';
  switch (location) {
    case LocationEnum.URL:
      return `Path segment /:${key}`;
    case LocationEnum.QUERY:
      return `URL query ?${key}=value`;
    case LocationEnum.BODY:
      return `JSON body { "${key}": … }`;
    default: {
      const _exhaustive: never = location;
      return _exhaustive;
    }
  }
};

export const toLocation = (value: unknown): LocationEnum => {
  if (value === '' || value === undefined || value === null) {
    return LocationEnum.QUERY;
  }
  const location = Number(value);
  if (
    location === LocationEnum.URL ||
    location === LocationEnum.QUERY ||
    location === LocationEnum.BODY
  ) {
    return location;
  }
  return LocationEnum.QUERY;
};
// Add icons for input types and placements
export const getTypeIcon = (
  type: ValueTypeEnum,
  className = 'size-3.5 shrink-0'
) => {
  switch (type) {
    case ValueTypeEnum.STRING:
      return <FormInput className={className} />;
    case ValueTypeEnum.NUMBER:
      return <Hash className={className} />;
    case ValueTypeEnum.BOOLEAN:
      return <ToggleLeft className={className} />;
    case ValueTypeEnum.DATE:
      return <Calendar className={className} />;
    case ValueTypeEnum.JSON:
      return <Braces className={className} />;
    case ValueTypeEnum.OBJECT_ID:
      return <Key className={className} />;
    default:
      return <FormInput className={className} />;
  }
};

// Helper function to convert operation codes to readable text
export const getReadableOperation = (op: ComparisonOperationEnum): string => {
  const operationMap: Record<ComparisonOperationEnum, string> = {
    [ComparisonOperationEnum.EQUAL]: 'equals',
    [ComparisonOperationEnum.NOT_EQUAL]: 'does not equal',
    [ComparisonOperationEnum.GT]: 'is greater than',
    [ComparisonOperationEnum.GTE]: 'is greater than or equal to',
    [ComparisonOperationEnum.LT]: 'is less than',
    [ComparisonOperationEnum.LTE]: 'is less than or equal to',
    [ComparisonOperationEnum.IN]: 'is in',
    [ComparisonOperationEnum.NIN]: 'is not in',
    // /search: 'matches search',
  };
  return operationMap[op];
};

export function formatValueSource(
  type: ValueSourceTypeEnum | undefined,
  value: string | undefined
): string {
  const display = value?.trim();
  switch (type) {
    case ValueSourceTypeEnum.INPUT:
      return display ? `input:${display}` : 'input:not selected';
    case ValueSourceTypeEnum.CONTEXT:
      return display ? `context:${display}` : 'context:not specified';
    case ValueSourceTypeEnum.CUSTOM:
      return display || 'empty';
    default:
      return display || '';
  }
}

export function getConditionSummary({
  schemaField,
  operation,
  sourceType,
  value,
  like,
  caseSensitiveLike,
  index,
}: {
  schemaField?: string;
  operation: ComparisonOperationEnum;
  sourceType?: ValueSourceTypeEnum;
  value?: string;
  like?: boolean;
  caseSensitiveLike?: boolean;
  index: number;
}): string {
  if (!schemaField) return `Condition #${index + 1}`;

  let opPhrase = getReadableOperation(operation) || 'equals';
  if (like && operation === ComparisonOperationEnum.EQUAL) {
    opPhrase = caseSensitiveLike
      ? 'matches (case-sensitive LIKE)'
      : 'matches (LIKE)';
  }

  return `${schemaField} ${opPhrase} ${formatValueSource(sourceType, value)}`;
}

export function getAssignmentSummary({
  schemaField,
  action,
  sourceType,
  value,
  index,
}: {
  schemaField?: string;
  action: AssignmentActionEnum;
  sourceType?: ValueSourceTypeEnum;
  value?: string;
  index: number;
}): string {
  if (!schemaField) return `Set #${index + 1}`;
  const valueDisplay = formatValueSource(sourceType, value);

  switch (action) {
    case AssignmentActionEnum.ASSIGN:
      return `${schemaField} = ${valueDisplay}`;
    case AssignmentActionEnum.INC:
      return `${schemaField} += ${valueDisplay}`;
    case AssignmentActionEnum.DEC:
      return `${schemaField} -= ${valueDisplay}`;
    case AssignmentActionEnum.PUSH:
      return `${schemaField} = ${schemaField}.concat(${valueDisplay})`;
    case AssignmentActionEnum.PULL:
      return `${schemaField} = ${schemaField}.remove(${valueDisplay})`;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
