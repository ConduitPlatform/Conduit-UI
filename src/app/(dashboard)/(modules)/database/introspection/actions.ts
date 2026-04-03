'use server';

import { revalidatePath } from 'next/cache';
import { finalizePendingSchemas, runIntrospection } from '@/lib/api/database';
import type { PendingSchemas } from '@/lib/models/database';

export async function runDatabaseIntrospectionAction() {
  const message = await runIntrospection();
  revalidatePath('/database/introspection');
  return message;
}

export async function finalizeIntrospectionSchemasAction(
  schemas: PendingSchemas[]
) {
  const message = await finalizePendingSchemas(schemas);
  revalidatePath('/database/introspection');
  revalidatePath('/database/models-new');
  return message;
}
