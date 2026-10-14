export type ValidatableSchemaField = {
  name: string;
  type: string;
  required?: boolean;
  unique?: boolean;
  relatedModel?: string;
  fields?: ValidatableSchemaField[];
  enumValues?: string[];
  enumValueType?: string;
  default?: string;
};

function enumFieldError(
  field: ValidatableSchemaField,
  fieldPath: string
): string | null {
  if (field.type !== 'Enum') return null;

  const values = field.enumValues ?? [];
  if (values.length === 0) {
    return `${fieldPath} is an enum and needs at least one value.`;
  }

  const valueType = field.enumValueType || 'String';
  const trimmed = values.map(value => value.trim());

  if (valueType === 'Number') {
    if (
      trimmed.some(value => value === '' || !Number.isFinite(Number(value)))
    ) {
      return `${fieldPath} has an enum value that is not a number.`;
    }
    const numeric = trimmed.map(value => Number(value));
    if (new Set(numeric).size !== numeric.length) {
      return `${fieldPath} has duplicate enum values.`;
    }
  } else if (valueType === 'Boolean') {
    if (trimmed.some(value => value !== 'true' && value !== 'false')) {
      return `${fieldPath} has an enum value that is not true or false.`;
    }
    if (new Set(trimmed).size !== trimmed.length) {
      return `${fieldPath} has duplicate enum values.`;
    }
  } else if (trimmed.some(value => value.length === 0)) {
    return `${fieldPath} has an empty enum value.`;
  } else if (new Set(trimmed).size !== trimmed.length) {
    return `${fieldPath} has duplicate enum values.`;
  }

  if (field.default === undefined || field.default === '') return null;

  const candidate =
    valueType === 'Number'
      ? String(Number(field.default.trim()))
      : field.default.trim();
  const allowed = new Set(
    valueType === 'Number'
      ? trimmed.map(value => String(Number(value)))
      : trimmed
  );
  if (!allowed.has(candidate)) {
    return `${fieldPath} default must be one of the enum values.`;
  }

  return null;
}

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

    const enumError = enumFieldError(field, fieldPath);
    if (enumError) return enumError;

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
