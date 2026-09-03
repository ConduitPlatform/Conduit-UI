import {
  ComparisonOperationEnum,
  LocationEnum,
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
export const getTypeIcon = (type: ValueTypeEnum) => {
  switch (type) {
    case ValueTypeEnum.STRING:
      return <FormInput className="h-4 w-4" />;
    case ValueTypeEnum.NUMBER:
      return <Hash className="h-4 w-4" />;
    case ValueTypeEnum.BOOLEAN:
      return <ToggleLeft className="h-4 w-4" />;
    case ValueTypeEnum.DATE:
      return <Calendar className="h-4 w-4" />;
    case ValueTypeEnum.JSON:
      return <Braces className="h-4 w-4" />;
    case ValueTypeEnum.OBJECT_ID:
      return <Key className="h-4 w-4" />;
    default:
      return <FormInput className="h-4 w-4" />;
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
