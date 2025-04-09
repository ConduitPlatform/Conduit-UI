import * as React from 'react';
import { createCustomEndpoint, getCustomEndpoints } from '@/lib/api/database';
import { CustomEndpoint } from '@/lib/models/database/custom-endpoints';
import { QueryEditor } from '@/components/database/queries/editor/query-editor';

export default async function CustomQueries(
  props: Readonly<{ params: Promise<{ id: string }> }>
) {
  const params = await props.params;
  let initialData: Partial<CustomEndpoint> = {};
  const { id } = params;
  if (id !== 'new') {
    // replace with singular endpoint fetch
    const { customEndpoints } = await getCustomEndpoints({
      skip: 0,
      limit: 1000,
    });
    initialData = customEndpoints.find(q => q._id === id)!;
  } else {
    initialData = {
      name: 'My new Query',
      operation: 0,
    };
  }

  const handleSaveQuery = async (data: Partial<CustomEndpoint>) => {
    'use server';
    try {
      await createCustomEndpoint(data);
    } catch (e: unknown) {
      console.error(e);
      throw new Error(
        (e as Error).message ??
          'Failed to create custom endpoint, check the logs'
      );
    }
  };

  return (
    <div className="p-6">
      {/* Here we would normally load the selected query and pass it to the editor */}
      <QueryEditor initialData={initialData} onSave={handleSaveQuery} />
    </div>
  );
}
