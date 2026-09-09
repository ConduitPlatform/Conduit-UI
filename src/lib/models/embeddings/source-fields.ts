import type { EmbeddingConfigInput, EmbeddingConfigRequest } from './config.ts';
import {
  catalogueDimensionsForInput,
  type ConfigProviderChoice,
} from './config-catalogue.ts';

export const AUTH_SECRET_SCHEMA_NAMES = new Set([
  'AccessToken',
  'RefreshToken',
  'Token',
  'TwoFactorSecret',
  'TwoFactorBackUpCodes',
  'BiometricToken',
  'AdminTwoFactorSecret',
  'AdminApiToken',
]);

export const SYSTEM_SCHEMA_NAMES = new Set([
  'Views',
  'Config',
  'MigratedSchemas',
  'PendingSchemas',
  'CustomEndpoints',
]);

export const EMBEDDINGS_OWNER_MODULE = 'embeddings';

export const EMBEDDING_OWNED_SCHEMA_NAMES = new Set([
  'EmbeddingConfig',
  'BackfillRun',
]);

const SENSITIVE_FIELD_NAME =
  /(password|secret|token|credential|apikey|api_key|private[_-]?key|authorization|refresh[_-]?token|access[_-]?token)/i;

const SOURCE_FIELD_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;
const SCHEMA_OR_TARGET_NAME = /^[A-Za-z_][A-Za-z0-9_]{0,127}$/;

export type EmbeddingSchemaChoice = {
  name: string;
  ownerModule: string;
  fields: Record<string, unknown>;
};

export type SourceFieldChoice = {
  name: string;
  eligible: boolean;
};

export type EmbeddingSchemaFormChoice = {
  name: string;
  fields: SourceFieldChoice[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isSensitiveFieldName(field: string): boolean {
  return SENSITIVE_FIELD_NAME.test(field);
}

export function isStringLikeField(field: unknown): boolean {
  if (field === 'String') return true;
  if (Array.isArray(field) && field.length === 1) {
    return isStringLikeField(field[0]);
  }
  if (!isRecord(field)) return false;
  if (field.type === 'String') return true;
  return Array.isArray(field.type) && isStringLikeField(field.type);
}

export function isHiddenField(field: unknown): boolean {
  return isRecord(field) && field.select === false;
}

export function isValidSourceFieldName(field: string): boolean {
  return SOURCE_FIELD_NAME.test(field);
}

export function isValidSchemaOrTargetName(value: string): boolean {
  return SCHEMA_OR_TARGET_NAME.test(value);
}

export type EmbeddingSchemaEligibilityInput = {
  name: string;
  ownerModule?: string;
  enabled?: unknown;
  modelOptions?: unknown;
  fields?: unknown;
  compiledFields?: unknown;
};

export function isDeniedEmbeddingSchema(schema: {
  name: string;
  ownerModule?: string;
}): boolean {
  if (!schema.name) return true;
  if (schema.ownerModule === EMBEDDINGS_OWNER_MODULE) return true;
  if (EMBEDDING_OWNED_SCHEMA_NAMES.has(schema.name)) return true;
  if (schema.name.startsWith('_')) return true;
  if (SYSTEM_SCHEMA_NAMES.has(schema.name)) return true;
  return AUTH_SECRET_SCHEMA_NAMES.has(schema.name);
}

export function isSchemaExtendable(modelOptions?: unknown): boolean {
  if (!isRecord(modelOptions)) return false;
  const conduit = modelOptions.conduit;
  if (!isRecord(conduit)) return false;
  const permissions = conduit.permissions;
  return isRecord(permissions) && permissions.extendable === true;
}

export function isDeclaredSchemaEnabled(schema: {
  enabled?: unknown;
  modelOptions?: unknown;
}): boolean {
  if (schema.enabled === false) return false;
  if (schema.enabled === true) return true;
  if (!isRecord(schema.modelOptions)) return false;
  const conduit = schema.modelOptions.conduit;
  if (!isRecord(conduit)) return false;
  const cms = conduit.cms;
  if (cms == null) return true;
  return isRecord(cms) && cms.enabled === true;
}

export function isEligibleEmbeddingSchema(
  schema: EmbeddingSchemaEligibilityInput
): boolean {
  return (
    !isDeniedEmbeddingSchema(schema) &&
    isDeclaredSchemaEnabled(schema) &&
    isSchemaExtendable(schema.modelOptions)
  );
}

export function toSchemaFieldMap(schema: {
  fields?: unknown;
  compiledFields?: unknown;
}): Record<string, unknown> {
  if (
    isRecord(schema.compiledFields) &&
    Object.keys(schema.compiledFields).length > 0
  ) {
    return schema.compiledFields;
  }
  if (isRecord(schema.fields)) return schema.fields;
  return {};
}

export function isEligibleSourceField(
  name: string,
  definition: unknown
): boolean {
  if (!isValidSourceFieldName(name)) return false;
  if (!isStringLikeField(definition)) return false;
  if (isHiddenField(definition)) return false;
  return !isSensitiveFieldName(name);
}

export function listEligibleSourceFields(
  fields: Record<string, unknown>
): string[] {
  return Object.keys(fields)
    .filter(name => isEligibleSourceField(name, fields[name]))
    .sort();
}

export function listSourceFieldChoices(
  fields: Record<string, unknown>,
  current: readonly string[]
): SourceFieldChoice[] {
  const names = new Set([
    ...listEligibleSourceFields(fields),
    ...current.filter(name => name.length > 0),
  ]);
  return [...names].sort().map(name => ({
    name,
    eligible: isEligibleSourceField(name, fields[name]),
  }));
}

export function toEmbeddingSchemaChoice(schema: {
  name: string;
  ownerModule: string;
  fields?: unknown;
  compiledFields?: unknown;
}): EmbeddingSchemaChoice {
  return {
    name: schema.name,
    ownerModule: schema.ownerModule,
    fields: toSchemaFieldMap(schema),
  };
}

export function listEligibleSchemas(
  schemas: EmbeddingSchemaEligibilityInput[]
): EmbeddingSchemaChoice[] {
  return schemas
    .filter(isEligibleEmbeddingSchema)
    .map(schema =>
      toEmbeddingSchemaChoice({
        ...schema,
        ownerModule: schema.ownerModule ?? 'database',
      })
    )
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function eligibleSchemaNames(
  schemas: EmbeddingSchemaEligibilityInput[] | null | undefined
): Set<string> {
  if (schemas == null) return new Set();
  return new Set(listEligibleSchemas(schemas).map(schema => schema.name));
}

export function filterByEligibleSchemas<T extends { schemaName: string }>(
  items: T[],
  schemas: EmbeddingSchemaEligibilityInput[] | null | undefined
): T[] {
  const names = eligibleSchemaNames(schemas);
  return items.filter(item => names.has(item.schemaName));
}

export function eligibleSchemaIdsByName(
  schemas: Array<
    EmbeddingSchemaEligibilityInput & {
      _id: string;
    }
  >
): Map<string, string> {
  return new Map(
    schemas
      .filter(isEligibleEmbeddingSchema)
      .map(schema => [schema.name, schema._id])
  );
}

export function normalizeSourceFieldAllowlist(values: string[]): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const value of values) {
    const name = value.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    names.push(name);
  }
  return names;
}

export const INELIGIBLE_SOURCE_FIELDS_MESSAGE =
  'One or more source fields are not eligible.';

export const UNAVAILABLE_EMBEDDING_SCHEMA_MESSAGE =
  'This schema cannot be used for embeddings.';

export const SCHEMA_ELIGIBILITY_UNAVAILABLE_MESSAGE =
  'Schema eligibility could not be verified. Retry.';

export function toEmbeddingSchemaFormChoice(
  schema: EmbeddingSchemaChoice,
  current: readonly string[] = []
): EmbeddingSchemaFormChoice {
  return {
    name: schema.name,
    fields: listSourceFieldChoices(schema.fields, current),
  };
}

export function toEmbeddingSchemaFormChoices(
  schemas: EmbeddingSchemaChoice[],
  currentBySchema: Readonly<Record<string, readonly string[]>> = {}
): EmbeddingSchemaFormChoice[] {
  return schemas.map(schema =>
    toEmbeddingSchemaFormChoice(schema, currentBySchema[schema.name] ?? [])
  );
}

export function toEmbeddingConfigRequest(
  data: EmbeddingConfigInput
): EmbeddingConfigRequest {
  return {
    schemaName: data.schemaName,
    sourceFields: [...data.sourceFields],
    targetField: data.targetField,
    ...(data.provider ? { provider: data.provider } : {}),
    ...(data.model ? { model: data.model } : {}),
    dimensions: data.dimensions,
    ...(data.similarity ? { similarity: data.similarity } : {}),
    ...(typeof data.enabled === 'boolean' ? { enabled: data.enabled } : {}),
  };
}

export function requireEligibleDeclaredSchema(
  schemaName: string,
  schemas?: EmbeddingSchemaEligibilityInput[] | null
): EmbeddingSchemaEligibilityInput {
  if (schemas == null) {
    throw new Error(SCHEMA_ELIGIBILITY_UNAVAILABLE_MESSAGE);
  }
  const schema = schemas.find(item => item.name === schemaName);
  if (!schema || !isEligibleEmbeddingSchema(schema)) {
    throw new Error(UNAVAILABLE_EMBEDDING_SCHEMA_MESSAGE);
  }
  return schema;
}

export function validateEmbeddingConfigInput(
  data: EmbeddingConfigInput,
  schemas?: EmbeddingSchemaEligibilityInput[] | null,
  providers?: readonly ConfigProviderChoice[] | null
): EmbeddingConfigRequest {
  if (!isValidSchemaOrTargetName(data.schemaName)) {
    throw new Error('Schema name is not valid.');
  }
  if (!isValidSchemaOrTargetName(data.targetField)) {
    throw new Error('Target field is not valid.');
  }
  if (data.sourceFields.length === 0) {
    throw new Error('Select at least one source field.');
  }
  for (const field of data.sourceFields) {
    if (!isValidSourceFieldName(field)) {
      throw new Error(INELIGIBLE_SOURCE_FIELDS_MESSAGE);
    }
  }
  const schema = requireEligibleDeclaredSchema(data.schemaName, schemas);
  const fields = toSchemaFieldMap(schema);
  const ineligible = data.sourceFields.some(
    name => !isEligibleSourceField(name, fields[name])
  );
  if (ineligible) {
    throw new Error(INELIGIBLE_SOURCE_FIELDS_MESSAGE);
  }
  const catalogue = catalogueDimensionsForInput(data, providers);
  const provider = data.provider?.trim() ?? '';
  return {
    ...toEmbeddingConfigRequest(data),
    provider,
    model: catalogue.name,
    dimensions: catalogue.dimensions,
  };
}
