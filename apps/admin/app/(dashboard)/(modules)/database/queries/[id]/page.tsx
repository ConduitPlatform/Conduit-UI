import * as React from 'react';
import { getCustomEndpoints } from '@/lib/api/database';
import { CustomEndpoint } from '@/lib/models/database/custom-endpoints';
import { QueryEditor } from '@/components/database/queries/editor/query-editor';

export default async function CustomQueries({
  params,
}: Readonly<{ params: { id: string } }>) {
  let initialData: Partial<CustomEndpoint> = {};
  const { id } = params;
  if (id !== 'new') {
    // replace with singular endpoint fetch
    const { documents: customEndpoints } = await getCustomEndpoints({
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

  const handleSaveQuery = async (data: any) => {
    'use server';
    console.log('Saving query:', data);
    // In a real app, you would save the query to your backend
    // For now, we'll just add it to our local state
    // const newQuery: CustomQuery = {
    //   id: `query-new-${queries.length}`,
    //   name: data.name,
    //   modelId: data.modelId,
    //   modelName: data.modelName,
    //   description: data.description || `A ${data.operation} query for ${data.modelName}`,
    //   createdAt: new Date().toISOString(),
    //   updatedAt: new Date().toISOString(),
    //   type: ['find'].includes(data.operation) ? 'read' : 'mutation',
    // };
  };

  return (
    <div className="p-6">
      {/* Here we would normally load the selected query and pass it to the editor */}
      <QueryEditor initialData={initialData} onSave={handleSaveQuery} />
    </div>
  );
}
