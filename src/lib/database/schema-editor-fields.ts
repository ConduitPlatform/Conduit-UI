import { normalizeFieldDefault } from './format-display-value.ts';
import {
  isPrimitiveEnumList,
  normalizeSchemaFieldDefinition,
} from './schema-field-definition.ts';

export type SchemaEditorField = {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  unique?: boolean;
  isArray?: boolean;
  select?: boolean;
  default?: string;
  description?: string;
  relatedModel?: string;
  enumValues?: string[];
  enumValueType?: string;
  fields?: SchemaEditorField[];
};

const ENUM_STORAGE_TYPES = new Set([
  'String',
  'Number',
  'Boolean',
  'Date',
  'ObjectId',
]);

function createFieldId() {
  return Math.random().toString(36).substring(2, 9);
}

/** Storage type written next to an `enum` list. Conduit has no Enum type. */
export function enumStorageType(type: string | undefined): string {
  if (type && ENUM_STORAGE_TYPES.has(type)) return type;
  return 'String';
}

export function toEditorEnumValues(values: unknown): string[] {
  if (!isPrimitiveEnumList(values)) return [];
  return values.map(value => String(value));
}

function storedEnumValue(value: string, valueType: string): unknown {
  const trimmed = value.trim();
  if (valueType === 'Number') {
    const asNumber = Number(trimmed);
    return Number.isNaN(asNumber) ? trimmed : asNumber;
  }
  if (valueType === 'Boolean') return trimmed === 'true';
  return trimmed;
}

function coerceDefault(value: string, valueType: string): unknown {
  if (valueType === 'JSON') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  if (valueType === 'Number') {
    const asNumber = Number(value);
    return Number.isNaN(asNumber) ? value : asNumber;
  }
  if (valueType === 'Boolean') return value === 'true';
  return value;
}

function assignFieldOptions(
  fieldDef: Record<string, unknown>,
  field: SchemaEditorField,
  valueType: string
) {
  if (field.required) fieldDef.required = true;
  if (field.unique) fieldDef.unique = true;
  if (field.select !== undefined) fieldDef.select = field.select;
  if (field.default) fieldDef.default = coerceDefault(field.default, valueType);
  if (field.description) fieldDef.description = field.description;
}

/**
 * Conduit stores enums as `{ type: "String" | "Number", enum: [...] }`.
 * The editor type is Enum so those fields are not shown as plain strings.
 */
export function extractSchemaEditorFields(
  schemaFields: unknown,
  createId: () => string = createFieldId
): SchemaEditorField[] {
  if (!schemaFields || typeof schemaFields !== 'object') return [];

  return Object.entries(schemaFields).map(([name, definition]) => {
    const id = createId();
    const field = normalizeSchemaFieldDefinition(definition);
    const shared = {
      id,
      name,
      required: field.required,
      unique: field.unique,
      select: field.select,
      default: normalizeFieldDefault(field.default),
      description: field.description,
      isArray: field.isArray,
    };

    if (field.isGroup) {
      return {
        ...shared,
        type: 'Group',
        fields: extractSchemaEditorFields(field.groupFields, createId),
      };
    }

    if (field.type === 'Relation') {
      return {
        ...shared,
        type: 'Relation',
        relatedModel: field.relatedModel,
      };
    }

    if (field.type === 'Enum' || isPrimitiveEnumList(field.enumValues)) {
      return {
        ...shared,
        type: 'Enum',
        enumValues: toEditorEnumValues(field.enumValues),
        enumValueType: enumStorageType(
          field.type === 'Enum' ? 'String' : field.type
        ),
      };
    }

    return {
      ...shared,
      type: field.type,
    };
  });
}

export function schemaEditorFieldsToApi(
  fields: SchemaEditorField[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const field of fields) {
    let fieldDef: Record<string, unknown>;

    if (field.type === 'Group' && field.fields?.length) {
      fieldDef = schemaEditorFieldsToApi(field.fields);
    } else if (field.type === 'Enum') {
      const valueType = enumStorageType(field.enumValueType);
      fieldDef = {
        type: valueType,
        enum: (field.enumValues ?? []).map(value =>
          storedEnumValue(value, valueType)
        ),
      };
      assignFieldOptions(fieldDef, field, valueType);
    } else {
      fieldDef = { type: field.type };
      assignFieldOptions(fieldDef, field, field.type);
      if (field.type === 'Relation' && field.relatedModel) {
        fieldDef.model = field.relatedModel;
      }
    }

    result[field.name] = field.isArray ? [fieldDef] : fieldDef;
  }

  return result;
}
