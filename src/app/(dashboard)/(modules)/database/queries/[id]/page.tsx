import { notFound, redirect } from 'next/navigation';
import {
  createCustomEndpoint,
  deleteCustomEndpoint,
  getCustomEndpoint,
  patchCustomEndpoint,
} from '@/lib/api/database';
import { CustomEndpoint } from '@/lib/models/database/custom-endpoints';
import { QueryEditor } from '@/components/database/queries/editor/query-editor';

type SavePayload = Record<string, unknown>;

function stripFormOnlyFields(data: SavePayload) {
  const { inputsJson, queryJson, ...rest } = data;
  return rest;
}

async function saveCustomQuery(
  endpointId: string | undefined,
  data: SavePayload
) {
  'use server';
  const payload = stripFormOnlyFields(data);
  try {
    if (endpointId) {
      const { name: _name, operation: _operation, ...patchPayload } = payload;
      await patchCustomEndpoint(
        endpointId,
        patchPayload as Partial<CustomEndpoint>
      );
    } else {
      await createCustomEndpoint(payload as Partial<CustomEndpoint>);
    }
  } catch (e: unknown) {
    console.error(e);
    throw new Error(
      (e as Error).message ?? 'Failed to save custom endpoint, check the logs'
    );
  }
}

async function deleteCustomQuery(id: string) {
  'use server';
  try {
    await deleteCustomEndpoint(id);
  } catch (e: unknown) {
    console.error(e);
    throw new Error(
      (e as Error).message ?? 'Failed to delete custom endpoint, check the logs'
    );
  }
  redirect('/database/queries/new');
}

export default async function CustomQueries(
  props: Readonly<{ params: Promise<{ id: string }> }>
) {
  const params = await props.params;
  let initialData: Partial<CustomEndpoint> = {};
  const { id } = params;
  if (id !== 'new') {
    try {
      initialData = await getCustomEndpoint(id);
    } catch {
      notFound();
    }
  } else {
    initialData = {
      name: 'My new Query',
      operation: 0,
    };
  }

  const handleSaveQuery = saveCustomQuery.bind(null, initialData._id);
  const handleDeleteQuery = initialData._id
    ? deleteCustomQuery.bind(null, initialData._id)
    : undefined;

  return (
    <div className="p-6">
      <QueryEditor
        initialData={initialData}
        onSave={handleSaveQuery}
        onDelete={handleDeleteQuery}
      />
    </div>
  );
}
