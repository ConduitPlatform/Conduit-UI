import { notFound } from 'next/navigation';
import {
  createCustomEndpoint,
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
): Promise<{ id: string }> {
  'use server';
  const payload = stripFormOnlyFields(data);
  try {
    if (endpointId) {
      const { name: _name, operation: _operation, ...patchPayload } = payload;
      await patchCustomEndpoint(
        endpointId,
        patchPayload as Partial<CustomEndpoint>
      );
      return { id: endpointId };
    }
    const created = await createCustomEndpoint(
      payload as Partial<CustomEndpoint>
    );
    if (!created?._id) {
      throw new Error('Query was created but the server did not return an id.');
    }
    return { id: created._id };
  } catch (e: unknown) {
    console.error(e);
    throw new Error(
      (e as Error).message ?? 'Failed to save custom endpoint, check the logs'
    );
  }
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
      name: 'MyNewQuery',
      operation: 0,
    };
  }

  const handleSaveQuery = saveCustomQuery.bind(null, initialData._id);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <QueryEditor initialData={initialData} onSave={handleSaveQuery} />
    </div>
  );
}
