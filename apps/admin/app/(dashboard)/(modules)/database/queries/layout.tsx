'use client';
import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import { QueryList } from '@/components/database/queries/query-list/query-list';
import { useRouter } from 'next/navigation';
import { getCustomEndpoints, getSchemas } from '@/lib/api/database';
import { CustomEndpoint } from '@/lib/models/database/custom-endpoints';
import { DeclaredSchema } from '@/lib/models/database';
import { isEmpty } from 'lodash';

type LayoutProps = {
  children: React.ReactNode;
};

export default function QueryLayout({ children }: Readonly<LayoutProps>) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedModel, setSelectedModel] = React.useState<string | null>(null);
  const [selectedQuery, setSelectedQuery] = React.useState<string | null>(null);
  const [queries, setQueries] = React.useState<CustomEndpoint[]>([]);
  const [models, setModels] = React.useState<DeclaredSchema[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const router = useRouter();
  const { ref, inView } = useInView({
    threshold: 0,
  });

  // Mock function to fetch queries
  const fetchQueries = React.useCallback(async () => {
    setIsLoading(true);

    const { documents: newQueries } = await getCustomEndpoints({
      skip: (page - 1) * 10,
      limit: 10,
      sort: 'createdAt',
      search: isEmpty(searchTerm) ? undefined : searchTerm,
      schemaName: selectedModel ? [selectedModel] : undefined,
    });

    setQueries(prev => [...prev, ...(newQueries ?? [])]);
    setHasMore(newQueries?.length > 0);
    setIsLoading(false);
    setPage(prev => prev + 1);
  }, [page, searchTerm, selectedModel]);

  // Mock function to fetch models
  const fetchModels = React.useCallback(async () => {
    const { schemas } = await getSchemas({});
    setModels(schemas);
  }, [setModels]);

  // Initial data fetch
  React.useEffect(() => {
    fetchModels();
    fetchQueries();
  }, []);

  // Load more when scrolling to the bottom
  React.useEffect(() => {
    if (inView && hasMore && !isLoading) {
      console.log('Loading more queries...');
      fetchQueries();
    }
  }, [inView, hasMore, isLoading, fetchQueries]);

  // Reset pagination and queries when searchTerm or selectedModel changes
  React.useEffect(() => {
    console.log('Reset: Loading more queries...');
    setPage(1);
    setQueries([]);
    fetchQueries();
  }, [searchTerm, selectedModel]);

  const handleCreateQuery = () => {
    router.push(`/database/queries/new`);
    setSelectedQuery(null);
  };

  const handleSelectQuery = (id: string) => {
    router.push(`/database/queries/${id}`);
    setSelectedQuery(id);
  };

  const handleModelChange = (value: string) => {
    setSelectedModel(value === 'all' ? null : value);
  };

  return (
    <div className="h-full flex flex-col w-full overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Custom Queries</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left sidebar with query list */}
        <QueryList
          queries={queries}
          models={models}
          selectedQuery={selectedQuery}
          isLoading={isLoading}
          searchTerm={searchTerm}
          selectedModel={selectedModel}
          onSearchChange={setSearchTerm}
          onModelChange={handleModelChange}
          onQuerySelect={handleSelectQuery}
          onCreateQuery={handleCreateQuery}
          /*@ts-ignore*/
          loadMoreRef={ref}
        />

        {/* Right side - Query editor */}
        <div className="md:col-span-2 border rounded-lg shadow-sm bg-background h-full overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
