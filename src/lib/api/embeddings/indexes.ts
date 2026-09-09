'use server';

import { cache } from 'react';
import { getSchemas, getSchemaVectorIndexes } from '@/lib/api/database';
import { eligibleSchemaIdsByName } from '@/lib/models/embeddings/source-fields';
import { SchemaIndexLookup } from '@/lib/models/embeddings/readiness';

export const getDeclaredSchemas = cache(async () => {
  return getSchemas({ limit: 1000, enabled: true });
});

export async function resolveIndexesBySchema(
  schemaNames: Iterable<string>,
  schemas?: Array<{
    name: string;
    _id: string;
    ownerModule?: string;
    enabled?: unknown;
    modelOptions?: unknown;
  }>
): Promise<Record<string, SchemaIndexLookup>> {
  const names = [...new Set(schemaNames)].filter(name => name.length > 0);
  if (names.length === 0) return {};

  let resolved = schemas;
  if (!resolved) {
    try {
      resolved = (await getDeclaredSchemas()).schemas;
    } catch {
      return Object.fromEntries(names.map(name => [name, 'unknown']));
    }
  }

  const idByName = eligibleSchemaIdsByName(resolved);
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
