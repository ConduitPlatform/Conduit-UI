import { normalizeSchemaFieldDefinition } from '@/lib/database/schema-field-definition';

/** Sentinel for searching every supported field. Not written to the URL. */
export const ALL_DOCUMENT_FIELDS = '__all__';

const SEARCH_TERM_MAX_LENGTH = 200;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const OBJECT_ID_PATTERN = /^[0-9a-f]{24}$/i;

export type SearchableFieldKind = 'text' | 'number' | 'boolean' | 'id';

export type SearchableField = {
  path: string;
  kind: SearchableFieldKind;
};

export type DocumentSearchSchema = {
  fields?: unknown;
  compiledFields?: unknown;
  extensions?: { fields?: unknown }[] | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function kindForType(type: string): SearchableFieldKind | null {
  if (type === 'String') return 'text';
  if (type === 'ObjectId') return 'id';
  if (type === 'Number') return 'number';
  if (type === 'Boolean') return 'boolean';
  return null;
}

function isExactId(term: string): boolean {
  return UUID_PATTERN.test(term) || OBJECT_ID_PATTERN.test(term);
}

function collectSearchableFields(
  fields: Record<string, unknown>,
  prefix: string,
  into: SearchableField[]
) {
  for (const [name, definition] of Object.entries(fields)) {
    if (!name || name.startsWith('$')) continue;
    const path = prefix ? `${prefix}.${name}` : name;
    const normalized = normalizeSchemaFieldDefinition(definition);
    if (normalized.isGroup && normalized.groupFields) {
      collectSearchableFields(normalized.groupFields, path, into);
      continue;
    }
    if (normalized.isArray || normalized.type === 'Relation') continue;
    const kind = kindForType(normalized.type);
    if (!kind) continue;
    into.push({ path, kind });
  }
}

function fieldMap(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

/**
 * Fields the data tab can query across the whole collection.
 * Text uses contains. Numbers and booleans match when the term parses.
 * Ids match exactly: SQL stores `_id` as uuid, so a contains query errors.
 * Arrays, relations, dates, and JSON are omitted for the same reason.
 */
export function listSearchableFields(
  schema: DocumentSearchSchema
): SearchableField[] {
  const compiled = fieldMap(schema.compiledFields);
  const own = fieldMap(schema.fields);
  const root =
    compiled && Object.keys(compiled).length > 0 ? compiled : (own ?? {});
  const collected: SearchableField[] = [];
  collectSearchableFields(root, '', collected);

  for (const extension of schema.extensions ?? []) {
    const extensionFields = fieldMap(extension?.fields);
    if (extensionFields) {
      collectSearchableFields(extensionFields, '', collected);
    }
  }

  const byPath = new Map<string, SearchableField>();
  for (const field of collected) {
    if (!byPath.has(field.path)) byPath.set(field.path, field);
  }
  if (!byPath.has('_id')) {
    byPath.set('_id', { path: '_id', kind: 'id' });
  }

  const ordered = Array.from(byPath.values());
  const id = ordered.find(field => field.path === '_id');
  return id ? [id, ...ordered.filter(field => field.path !== '_id')] : ordered;
}

function containsClause(path: string, term: string): Record<string, unknown> {
  // $ilike is contains on every Conduit adapter: Postgres ILIKE, SQLite LIKE,
  // and a case-insensitive regex after the Mongo parser escapes the term.
  return { [path]: { $ilike: `%${term}%` } };
}

function matchNothingQuery(): Record<string, unknown> {
  return {
    $and: [{ _id: { $exists: true } }, { _id: { $exists: false } }],
  };
}

function clauseForField(
  field: SearchableField,
  term: string
): Record<string, unknown> | null {
  switch (field.kind) {
    case 'text':
      return containsClause(field.path, term);
    case 'number': {
      if (!/^-?\d+(\.\d+)?$/.test(term)) return null;
      return { [field.path]: Number(term) };
    }
    case 'boolean': {
      const normalized = term.toLowerCase();
      if (normalized === 'true') return { [field.path]: true };
      if (normalized === 'false') return { [field.path]: false };
      return null;
    }
    case 'id':
      return isExactId(term) ? { [field.path]: term } : null;
    default: {
      const _exhaustive: never = field.kind;
      return _exhaustive;
    }
  }
}

export function buildFieldSearchQuery(
  term: string | undefined,
  field: string | undefined,
  fields: SearchableField[]
): Record<string, unknown> | undefined {
  const trimmed = term?.trim().slice(0, SEARCH_TERM_MAX_LENGTH) ?? '';
  if (!trimmed) return undefined;

  const selected =
    field &&
    field !== ALL_DOCUMENT_FIELDS &&
    fields.find(candidate => candidate.path === field);

  if (selected) {
    return clauseForField(selected, trimmed) ?? matchNothingQuery();
  }

  const clauses = fields.flatMap(candidate => {
    const clause = clauseForField(candidate, trimmed);
    return clause ? [clause] : [];
  });

  if (clauses.length === 0) return matchNothingQuery();
  if (clauses.length === 1) return clauses[0];
  return { $or: clauses };
}

export function buildDocumentListQuery(args: {
  filter?: unknown;
  term?: string;
  field?: string;
  schema: DocumentSearchSchema;
}): Record<string, unknown> | unknown {
  const searchQuery = buildFieldSearchQuery(
    args.term,
    args.field,
    listSearchableFields(args.schema)
  );
  const filter = args.filter;
  const emptyFilter =
    filter == null || (isRecord(filter) && Object.keys(filter).length === 0);

  if (!searchQuery) {
    if (emptyFilter) return {};
    return filter;
  }
  if (emptyFilter) return searchQuery;
  if (isRecord(filter)) return { $and: [filter, searchQuery] };
  return searchQuery;
}
