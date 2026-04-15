import type { DeclaredSchema } from '@/lib/models/database';

export type CrudOperationState = {
  enabled: boolean;
  authenticated: boolean;
};

export type CrudOperationsState = {
  create: CrudOperationState;
  read: CrudOperationState;
  update: CrudOperationState;
  delete: CrudOperationState;
};

type OpKey = 'create' | 'read' | 'update' | 'delete';

/**
 * Mirrors Conduit CMS route registration: only explicit `enabled: true` turns an
 * operation on when `crudOperations` is present. When absent, uses the same
 * defaults as SchemaConverter (all on for non-imported, all off for imported).
 */
export function deriveCrudOperationsFromSchema(
  schema: DeclaredSchema
): CrudOperationsState {
  const imported = schema.modelOptions?.conduit?.imported === true;
  const fallbackEnabled = !imported;
  const crud = schema.modelOptions?.conduit?.cms?.crudOperations;

  if (crud == null) {
    const op: CrudOperationState = {
      enabled: fallbackEnabled,
      authenticated: false,
    };
    return {
      create: { ...op },
      read: { ...op },
      update: { ...op },
      delete: { ...op },
    };
  }

  const fromOp = (key: OpKey): CrudOperationState => ({
    enabled: crud[key]?.enabled === true,
    authenticated: crud[key]?.authenticated === true,
  });

  return {
    create: fromOp('create'),
    read: fromOp('read'),
    update: fromOp('update'),
    delete: fromOp('delete'),
  };
}
