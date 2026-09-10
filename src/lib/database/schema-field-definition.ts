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

const FIELD_OPTION_KEYS = new Set([
  'required',
  'unique',
  'select',
  'default',
  'description',
  'enum',
  'enumValues',
]);

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

function looksLikeFieldDefinition(value: unknown): boolean {
  if (typeof value === 'string' && value.length > 0) return true;
  if (Array.isArray(value)) return true;
  return isPlainObject(value);
}

function extractFieldOptions(fieldDef: Record<string, unknown>) {
  return {
    required: fieldDef.required as boolean | undefined,
    unique: fieldDef.unique as boolean | undefined,
    select: fieldDef.select as boolean | undefined,
    default: fieldDef.default,
    description: fieldDef.description as string | undefined,
    enumValues: fieldDef.enumValues ?? fieldDef.enum,
  };
}

function partitionGroupFields(fieldDef: Record<string, unknown>): {
  groupFields: Record<string, unknown>;
  options: ReturnType<typeof extractFieldOptions>;
} {
  const groupFields: Record<string, unknown> = {};
  const optionSource: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(fieldDef)) {
    if (key === 'type') continue;
    const isOptionKey = FIELD_OPTION_KEYS.has(key);
    if (isOptionKey && !looksLikeFieldDefinition(value)) {
      optionSource[key] = value;
      continue;
    }
    if (looksLikeFieldDefinition(value)) {
      groupFields[key] = value;
    }
  }

  return {
    groupFields,
    options: extractFieldOptions(optionSource),
  };
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
  } else if (isPlainObject(fieldDef) && isPlainObject(fieldDef.type)) {
    const { type: nested, ...parentRest } = fieldDef;
    fieldDef = { ...parentRest, ...nested };
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
    const { groupFields, options } = partitionGroupFields(fieldDef);
    return {
      isArray,
      isGroup: true,
      type: 'Group',
      groupFields,
      ...options,
    };
  }

  const type = coerceFieldType(fieldDef.type, relatedModel);

  return {
    isArray,
    isGroup: false,
    type,
    ...(relatedModel ? { relatedModel } : {}),
    ...extractFieldOptions(fieldDef),
  };
}
