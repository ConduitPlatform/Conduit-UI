import { getSchemaDocs } from '@/lib/api/database';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import ModelDataTable from '@/components/database/tables';

type DatabaseModelsProps = {
  searchParams?: {
    search?: string;
    model?: string;
    pageIndex?: number;
    limit?: number;
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
        ? searchParams.pageIndex * (searchParams?.limit ?? 20)
        : 0,
      limit: searchParams?.limit ?? 20,
    }
  );

  if (!searchParams?.model) {
    return <></>;
  }

  if (!docs.count) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center space-y-4">
        <Button>
          <PlusIcon className="w-4 h-4" />
          <span>New document</span>
        </Button>
        <span className="text-gray-400 text-sm w-72">
          No documents were found. Create your first document for model{' '}
          {searchParams?.model}.
        </span>
      </div>
    );
  }

  return <ModelDataTable documents={docs} model={searchParams.model} />;
}
