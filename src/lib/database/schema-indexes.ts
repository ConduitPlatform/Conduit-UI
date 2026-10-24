export type SchemaIndexPayload = {
  fields: string[];
  options?: Record<string, unknown>;
  types?: string[] | string;
};

function isIndexRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toIndexPayload(value: Record<string, unknown>): SchemaIndexPayload {
  return {
    ...value,
    fields: Array.isArray(value.fields)
      ? value.fields.filter(
          (field): field is string => typeof field === 'string'
        )
      : [],
    options:
      value.options &&
      typeof value.options === 'object' &&
      !Array.isArray(value.options)
        ? (value.options as Record<string, unknown>)
        : undefined,
    types:
      typeof value.types === 'string' || Array.isArray(value.types)
        ? (value.types as string[] | string)
        : undefined,
  };
}

function collectIndexRecords(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.filter(isIndexRecord);
  }

  if (
    data &&
    typeof data === 'object' &&
    Array.isArray((data as { indexes?: unknown }).indexes)
  ) {
    return (data as { indexes: unknown[] }).indexes.filter(isIndexRecord);
  }

  return [];
}

/**
 * GET /database/schemas/:id/indexes is documented as `{ indexes: [...] }`,
 * but the Database module handler returns the index array itself.
 */
export function normalizeSchemaIndexResponse(
  data: unknown
): SchemaIndexPayload[] {
  return collectIndexRecords(data).map(toIndexPayload);
}
