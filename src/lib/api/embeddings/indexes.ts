'use server';

import { cache } from 'react';
import {
  getDatabaseSystemSchemas,
  getSchemas,
  getSchemaVectorIndexes,
} from '@/lib/api/database';
import {
  eligibleSchemaIdsByName,
  parseDatabaseSystemSchemaNames,
} from '@/lib/models/embeddings/source-fields';
import { SchemaIndexLookup } from '@/lib/models/embeddings/readiness';

export const getDeclaredSchemas = cache(async () => {
  const [listed, systemPayload] = await Promise.all([
    getSchemas({ limit: 1000, enabled: true }),
    getDatabaseSystemSchemas(),
  ]);
  return {
    schemas: listed.schemas,
    count: listed.count,
    systemSchemaNames: parseDatabaseSystemSchemaNames(systemPayload),
  };
});

export async function resolveIndexesBySchema(
  schemaNames: Iterable<string>,
  declared?: {
    schemas?: Array<{
      name: string;
      _id: string;
      ownerModule?: string;
      enabled?: unknown;
      modelOptions?: unknown;
    }>;
    systemSchemaNames?: Iterable<string> | null;
  }
): Promise<Record<string, SchemaIndexLookup>> {
  const names = [...new Set(schemaNames)].filter(name => name.length > 0);
  if (names.length === 0) return {};

  let resolved = declared;
  if (!resolved) {
    try {
      resolved = await getDeclaredSchemas();
    } catch {
      return Object.fromEntries(names.map(name => [name, 'unknown']));
    }
  }

  const idByName = eligibleSchemaIdsByName(
    resolved.schemas ?? [],
    resolved.systemSchemaNames
  );
  const lookups = await Promise.allSettled(
    names.map(async (name): Promise<[string, SchemaIndexLookup]> => {
      const schemaId = idByName.get(name);
      if (!schemaId) return [name, []];
      const { indexes } = await getSchemaVectorIndexes(schemaId);
      return [name, indexes];
    })
  );

  const map: Record<string, SchemaIndexLookup> = {};
  for (const [index, name] of names.entries()) {
    const result = lookups[index];
    map[name] = result.status === 'fulfilled' ? result.value[1] : 'unknown';
  }
  return map;
}
