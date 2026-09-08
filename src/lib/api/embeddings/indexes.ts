'use server';

import { getSchemas, getSchemaVectorIndexes } from '@/lib/api/database';
import { SchemaIndexLookup } from '@/lib/models/embeddings';

export async function resolveIndexesBySchema(
  schemaNames: Iterable<string>
): Promise<Record<string, SchemaIndexLookup>> {
  const names = [...new Set(schemaNames)].filter(name => name.length > 0);
  if (names.length === 0) return {};

  let schemas: { name: string; _id: string }[] | undefined;
  try {
    const response = await getSchemas({ limit: 1000 });
    schemas = response.schemas;
  } catch {
    return Object.fromEntries(names.map(name => [name, 'unknown']));
  }

  const idByName = new Map(schemas.map(schema => [schema.name, schema._id]));
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
