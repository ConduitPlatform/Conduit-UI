export const DEFAULT_MONGO_SCHEMA_FIELDS = [
  '_id',
  'createdAt',
  'updatedAt',
  '__v',
] as const;

export type DefaultMongoSchemaField =
  (typeof DEFAULT_MONGO_SCHEMA_FIELDS)[number];

const DEFAULT_MONGO_SCHEMA_FIELD_SET = new Set<string>(
  DEFAULT_MONGO_SCHEMA_FIELDS
);

/** True when `name` is a MongoDB default document field. */
export function isDefaultMongoSchemaField(name: string): boolean {
  return DEFAULT_MONGO_SCHEMA_FIELD_SET.has(name);
}

/** Top-level Mongo defaults are locked; nested Group fields with the same name are not. */
export function isLockedMongoSchemaField(name: string, depth = 0): boolean {
  return depth === 0 && isDefaultMongoSchemaField(name);
}

/**
 * Custom top-level fields cannot be renamed onto a Mongo default name.
 * Existing system rows keep their names; nested groups may reuse them.
 */
export function canAssignSchemaFieldName(
  currentName: string,
  nextName: string,
  depth = 0
): boolean {
  if (depth !== 0) return true;
  if (!isDefaultMongoSchemaField(nextName)) return true;
  return isDefaultMongoSchemaField(currentName);
}
