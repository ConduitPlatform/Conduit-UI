import { OperationsEnum } from '@/lib/models/database/custom-endpoints';

export const OPERATION_META: Record<
  OperationsEnum,
  { label: string; method: string; description: string }
> = {
  [OperationsEnum.GET]: {
    label: 'Find',
    method: 'GET',
    description: 'Retrieve documents that match the find conditions.',
  },
  [OperationsEnum.POST]: {
    label: 'Create',
    method: 'POST',
    description: 'Insert a new document using the set values.',
  },
  [OperationsEnum.PUT]: {
    label: 'Update',
    method: 'PUT',
    description: 'Replace matching documents with the set values.',
  },
  [OperationsEnum.PATCH]: {
    label: 'Patch',
    method: 'PATCH',
    description: 'Partially update matching documents with the set values.',
  },
  [OperationsEnum.DELETE]: {
    label: 'Delete',
    method: 'DELETE',
    description: 'Remove documents that match the find conditions.',
  },
};

export function getOperationMeta(operation: number) {
  return (
    OPERATION_META[operation as OperationsEnum] ?? {
      label: 'Unknown',
      method: 'GET',
      description: '',
    }
  );
}

export function getEndpointPath(name?: string) {
  const slug = name?.trim() || '{name}';
  return `/database/function/${slug}`;
}
