import { getSchemaDocs } from '@/lib/api/database';

import ModelDataTable from '@/components/database/tables';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type DatabaseModelsProps = {
  searchParams?: {
    search?: string;
    model?: string;
    pageIndex?: string;
    limit?: string;
  };
};

export const dynamic = 'force-dynamic';

export default async function DatabaseModels({
  searchParams,
}: DatabaseModelsProps) {
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

  if (!searchParams?.model) {
    return <></>;
  }

  return (
    <Tabs defaultValue="data" className="h-full">
      <TabsList className="grid grid-cols-3 w-[400px] ml-3">
        <TabsTrigger value="data">Data</TabsTrigger>
        <TabsTrigger value="api">API</TabsTrigger>
        <TabsTrigger value="policies">Policies</TabsTrigger>
      </TabsList>
      <TabsContent value="data" className="h-full overflow-auto">
        <ModelDataTable documents={docs} model={searchParams.model} />
      </TabsContent>
      <TabsContent value="api">Manage API</TabsContent>
      <TabsContent value="policies">Policies</TabsContent>
    </Tabs>
  );
}
