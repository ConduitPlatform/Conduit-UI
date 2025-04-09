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

export const getPlacementIcon = (location: LocationEnum) => {
  switch (location) {
    case LocationEnum.URL:
      return <Route className="h-4 w-4" />;
    case LocationEnum.QUERY:
      return <Search className="h-4 w-4" />;
    case LocationEnum.BODY:
      return <FileJson className="h-4 w-4" />;
    default:
      return <Search className="h-4 w-4" />;
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
    default:
      return 'Search';
  }
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
