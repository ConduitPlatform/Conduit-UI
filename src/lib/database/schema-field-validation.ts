export type ValidatableSchemaField = {
  name: string;
  type: string;
  required?: boolean;
  unique?: boolean;
  relatedModel?: string;
  fields?: ValidatableSchemaField[];
};

/**
 * Validate schema editor fields. Groups may contain other groups at any depth,
 * matching Conduit schema storage.
 */
export function validateSchemaFields(
  fieldsToValidate: ValidatableSchemaField[],
  parentPath = ''
): string | null {
  if (parentPath && fieldsToValidate.length === 0) {
    return `${parentPath} is a nested group and needs at least one nested field.`;
  }

  const names = new Set<string>();

  for (const field of fieldsToValidate) {
    const fieldPath = parentPath ? `${parentPath}.${field.name}` : field.name;

    if (!field.name.trim()) {
      return parentPath
        ? `Every nested field in ${parentPath} needs a name.`
        : 'Every field needs a name.';
    }

    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(field.name.trim())) {
      return `${fieldPath} must start with a letter or underscore and only use letters, numbers, or underscores.`;
    }

    if (names.has(field.name)) {
      return `${fieldPath} is duplicated. Field names must be unique at each level.`;
    }
    names.add(field.name);

    if (field.unique && !field.required) {
      return `${fieldPath} is unique, so it must also be required.`;
    }

    if (field.type === 'Relation' && !field.relatedModel) {
      return `${fieldPath} is a relation and needs a related model.`;
    }

    if (field.type === 'Group') {
      if (!field.fields?.length) {
        return `${fieldPath} is a nested group and needs at least one nested field.`;
      }
      const nestedError = validateSchemaFields(field.fields, fieldPath);
      if (nestedError) return nestedError;
    }
  }

  return null;
}
