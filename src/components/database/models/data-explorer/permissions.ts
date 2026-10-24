import type { DeclaredSchema } from '@/lib/models/database';

export type ModelModifyPermission = 'Everything' | 'Nothing' | 'ExtensionOnly';

export interface ModelDataPermissions {
  canCreate: boolean;
  canDelete: boolean;
  canEdit: boolean;
  canModifyField: (fieldName: string) => boolean;
  extensionFields: string[];
  permissionLevel: ModelModifyPermission;
}

export function getExtensionFieldNames(schema: DeclaredSchema): string[] {
  return (
    schema.extensions?.flatMap(extension =>
      Object.keys(extension.fields ?? {})
    ) ?? []
  );
}

export function analyzeModelDataPermissions(
  schema: DeclaredSchema
): ModelDataPermissions {
  const extensionFields = getExtensionFieldNames(schema);

  if (schema.ownerModule === 'database') {
    return {
      canCreate: true,
      canDelete: true,
      canEdit: true,
      canModifyField: () => true,
      extensionFields,
      permissionLevel: 'Everything',
    };
  }

  const permissions = schema.modelOptions?.conduit?.permissions;
  const permissionLevel = permissions?.canModify ?? 'Nothing';

  return {
    canCreate: permissions?.canCreate === true,
    canDelete: permissions?.canDelete === true,
    canEdit: permissionLevel !== 'Nothing',
    canModifyField: fieldName => {
      if (permissionLevel === 'Everything') return true;
      if (permissionLevel === 'ExtensionOnly') {
        return extensionFields.includes(fieldName);
      }
      return false;
    },
    extensionFields,
    permissionLevel,
  };
}
