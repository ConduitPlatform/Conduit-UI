const DATABASE_CHANGE_EVENT_VERSION = 1;

const DATABASE_CHANGE_OPERATIONS = [
  'insert',
  'update',
  'replace',
  'delete',
] as const;

export type DatabaseChangeOperation =
  (typeof DATABASE_CHANGE_OPERATIONS)[number];

export type DatabaseChangeEvent = {
  version: number;
  operation: DatabaseChangeOperation;
  schema: string;
  documentId: string;
  occurredAt: string;
  resumeToken: string;
};

export function parseDatabaseChangeEvent(
  data: unknown
): DatabaseChangeEvent | null {
  const raw = typeof data === 'string' ? safeParseJson(data) : data;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const event = raw as Record<string, unknown>;
  if (event.version !== DATABASE_CHANGE_EVENT_VERSION) return null;
  if (
    typeof event.operation !== 'string' ||
    !DATABASE_CHANGE_OPERATIONS.includes(
      event.operation as DatabaseChangeOperation
    )
  ) {
    return null;
  }
  if (typeof event.schema !== 'string' || event.schema.trim() === '') {
    return null;
  }
  if (typeof event.documentId !== 'string' || event.documentId.trim() === '') {
    return null;
  }
  if (typeof event.occurredAt !== 'string') return null;
  if (typeof event.resumeToken !== 'string') return null;

  return {
    version: DATABASE_CHANGE_EVENT_VERSION,
    operation: event.operation as DatabaseChangeOperation,
    schema: event.schema,
    documentId: event.documentId,
    occurredAt: event.occurredAt,
    resumeToken: event.resumeToken,
  };
}

export function shouldCountChange(
  event: DatabaseChangeEvent,
  schemaName: string
): boolean {
  return event.schema === schemaName;
}

const DEFAULT_SEEN_TOKEN_LIMIT = 500;

/** Returns true the first time `token` is seen. Oldest entries are dropped past `limit`. */
export function rememberResumeToken(
  seen: Set<string>,
  token: string,
  limit: number = DEFAULT_SEEN_TOKEN_LIMIT
): boolean {
  if (seen.has(token)) return false;
  seen.add(token);
  if (seen.size > limit) {
    const oldest = seen.values().next().value;
    if (oldest !== undefined) seen.delete(oldest);
  }
  return true;
}

function safeParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
