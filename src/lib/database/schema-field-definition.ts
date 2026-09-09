export type NormalizedSchemaFieldDefinition = {
  isArray: boolean;
  isGroup: boolean;
  type: string;
  relatedModel?: string;
  required?: boolean;
  unique?: boolean;
  select?: boolean;
  default?: unknown;
  description?: string;
  enumValues?: unknown;
  groupFields?: Record<string, unknown>;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function relatedModelFrom(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function coerceFieldType(type: unknown, relatedModel?: string): string {
  if (relatedModel) {
    return 'Relation';
  }
  return typeof type === 'string' && type.length > 0 ? type : 'String';
}

function unwrapDefinition(definition: unknown): {
  isArray: boolean;
  fieldDef: unknown;
} {
  let isArray = false;
  let fieldDef: unknown = definition;

  if (Array.isArray(definition)) {
    isArray = true;
    fieldDef = definition[0];
    if (typeof fieldDef === 'string') {
      fieldDef = { type: fieldDef };
    }
  }

  if (isPlainObject(fieldDef) && Array.isArray(fieldDef.type)) {
    isArray = true;
    const inner = fieldDef.type[0];
    if (typeof inner === 'string') {
      fieldDef = { ...fieldDef, type: inner };
    } else if (isPlainObject(inner)) {
      const { type: _ignored, ...parentRest } = fieldDef;
      fieldDef = { ...parentRest, ...inner };
    } else {
      fieldDef = { ...fieldDef, type: 'String' };
    }
  }

  return { isArray, fieldDef };
}

/** Normalize a Conduit schema field definition into a UI-friendly shape. */
export function normalizeSchemaFieldDefinition(
  definition: unknown
): NormalizedSchemaFieldDefinition {
  const { isArray, fieldDef } = unwrapDefinition(definition);

  if (typeof fieldDef === 'string') {
    return {
      isArray,
      isGroup: false,
      type: coerceFieldType(fieldDef),
    };
  }

  if (!isPlainObject(fieldDef)) {
    return {
      isArray,
      isGroup: false,
      type: 'String',
    };
  }

  const relatedModel = relatedModelFrom(fieldDef.model);

  if (!fieldDef.type && !relatedModel) {
    return {
      isArray,
      isGroup: true,
      type: 'Group',
      groupFields: fieldDef,
    };
  }

  const type = coerceFieldType(fieldDef.type, relatedModel);

  return {
    isArray,
    isGroup: false,
    type,
    ...(relatedModel ? { relatedModel } : {}),
    required: fieldDef.required as boolean | undefined,
    unique: fieldDef.unique as boolean | undefined,
    select: fieldDef.select as boolean | undefined,
    default: fieldDef.default,
    description: fieldDef.description as string | undefined,
    enumValues: fieldDef.enumValues ?? fieldDef.enum,
  };
}
