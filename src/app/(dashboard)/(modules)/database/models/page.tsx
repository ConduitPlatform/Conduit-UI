import { getSchema, getSchemaDocs } from '@/lib/api/database';

import ModelDataTable from '@/components/database/tables';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { ModelEditor } from '@/components/database/modelEditor/model-editor';
import * as React from 'react';
import ModuleResourcePage from '@/components/authorization/resources/moduleResourcePage';
import { getResourceDefinition } from '@/lib/api/authorization';
import { ResourceDefinition } from '@/lib/models/authorization';

type DatabaseModelsProps = {
  searchParams: Promise<{
    search?: string;
    model?: string;
    modelId?: string;
    pageIndex?: string;
    limit?: string;
  }>;
};

export const dynamic = 'force-dynamic';

export default async function DatabaseModels(
  props: Readonly<DatabaseModelsProps>
) {
  const searchParams = await props.searchParams;
  if (!searchParams?.model || !searchParams?.modelId) {
    return <></>;
  }

  const docs = await getSchemaDocs(
    searchParams?.model,
    searchParams?.search
      ? { query: JSON.parse(searchParams.search) }
      : undefined,
    {
      skip: searchParams?.pageIndex
        ? Number(searchParams.pageIndex) * Number(searchParams?.limit ?? 20)
        : 0,
      limit: Number(searchParams?.limit ?? 20),
    }
  );

  const schema = await getSchema(searchParams.modelId);
  const resource: ResourceDefinition[] = [];
  if (schema.modelOptions?.conduit?.authorization?.enabled) {
    const schemaAuthzDefinition = await getResourceDefinition(schema.name);
    resource.push(schemaAuthzDefinition!);
  }
  return (
    <Tabs defaultValue="data" className="h-full">
      <div className={'flex flex-row gap-x-2'}>
        <TabsList className="flex flex-row w-fit ml-3">
          <TabsTrigger value="data">Data</TabsTrigger>
          {schema.modelOptions?.conduit?.authorization?.enabled && (
            <TabsTrigger value="policies">Policies</TabsTrigger>
          )}
        </TabsList>
        <ModelEditor schema={schema}>
          <Button variant={'outline'} className={'gap-x-2'}>
            {' '}
            <Pencil className={'w-4 h-4'} /> Edit Model
          </Button>
        </ModelEditor>
      </div>
      <TabsContent value="data" className="h-full overflow-auto">
        <ModelDataTable documents={docs} schema={schema} />
      </TabsContent>
      {schema.modelOptions?.conduit?.authorization?.enabled && (
        <TabsContent value="policies" className="h-full overflow-auto">
          <ModuleResourcePage resources={resource} />
        </TabsContent>
      )}
    </Tabs>
  );
}
